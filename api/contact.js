'use strict';

const MAX_BODY_BYTES = 8 * 1024;
const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 3000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const recentSubmissions = new Map();

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
  });
}

function respond(res, statusCode, payload, extraHeaders) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (extraHeaders) {
    Object.keys(extraHeaders).forEach(function (name) {
      res.setHeader(name, extraHeaders[name]);
    });
  }
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  let body = req.body;
  const contentType = String(req.headers['content-type'] || '').toLowerCase();

  if (Buffer.isBuffer(body)) body = body.toString('utf8');
  if (typeof body === 'string') {
    if (contentType.includes('application/x-www-form-urlencoded')) {
      body = Object.fromEntries(new URLSearchParams(body));
    } else {
      try {
        body = JSON.parse(body);
      } catch (error) {
        return null;
      }
    }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  return body;
}

function validEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL_PATTERN.test(value);
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;

  const forwardedHost = req.headers['x-forwarded-host'];
  const requestHost = String(forwardedHost || req.headers.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (!requestHost) return false;

  try {
    const originUrl = new URL(origin);
    return (originUrl.protocol === 'https:' || originUrl.protocol === 'http:') &&
      originUrl.host.toLowerCase() === requestHost;
  } catch (error) {
    return false;
  }
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim().slice(0, 64);
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function rateLimitExceeded(ip, now) {
  let entry = recentSubmissions.get(ip);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
  }
  if (entry.count >= RATE_LIMIT) {
    recentSubmissions.set(ip, entry);
    return Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  }

  entry.count += 1;
  recentSubmissions.set(ip, entry);
  if (recentSubmissions.size > 1024) {
    recentSubmissions.forEach(function (candidate, key) {
      if (now >= candidate.resetAt) recentSubmissions.delete(key);
    });
    while (recentSubmissions.size > 1024) {
      const oldestIp = recentSubmissions.keys().next().value;
      if (oldestIp === undefined) break;
      recentSubmissions.delete(oldestIp);
    }
  }
  return 0;
}

function configuredSender(value) {
  if (typeof value !== 'string' || /[\r\n]/.test(value)) return false;
  const trimmed = value.trim();
  const bracketed = trimmed.match(/<([^<>]+)>/);
  const address = bracketed ? bracketed[1].trim() : trimmed;
  return validEmail(address);
}

module.exports = async function contactHandler(req, res) {
  if (req.method !== 'POST') {
    return respond(res, 405, { ok: false, message: 'This inquiry endpoint only accepts POST.' }, { Allow: 'POST' });
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return respond(res, 413, { ok: false, message: 'The message is larger than the limit.' });
  }

  if (!sameOrigin(req)) {
    return respond(res, 403, { ok: false, message: 'The request origin could not be verified.' });
  }

  const body = parseBody(req);
  if (!body) {
    return respond(res, 400, { ok: false, message: 'The form could not be read.' });
  }

  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) {
    return respond(res, 413, { ok: false, message: 'The message is larger than the limit.' });
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return respond(res, 200, { ok: true, message: 'Your inquiry was received. Thank you.' });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > MAX_NAME_LENGTH) {
    return respond(res, 400, { ok: false, message: 'Enter a name of 80 characters or fewer.' });
  }
  if (!validEmail(email)) {
    return respond(res, 400, { ok: false, message: 'Enter a valid email address.' });
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return respond(res, 400, { ok: false, message: 'Enter a message of 3000 characters or fewer.' });
  }

  const retryAfter = rateLimitExceeded(clientIp(req), Date.now());
  if (retryAfter) {
    return respond(res, 429, { ok: false, message: 'Too many inquiries just now. Wait a few minutes and try again.' }, {
      'Retry-After': String(retryAfter)
    });
  }

  const apiKey = String(process.env.RESEND_API_KEY || process.env.Resend_key || '').trim();
  const to = String(process.env.CONTACT_TO_EMAIL || '').trim();
  const from = String(process.env.CONTACT_FROM_EMAIL || '').trim();
  if (!apiKey || !validEmail(to) || !configuredSender(from)) {
    return respond(res, 503, {
      ok: false,
      code: 'EMAIL_NOT_CONFIGURED',
      message: 'The inquiry mail service is not configured on this project yet.'
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(function () { controller.abort(); }, 10000);
  if (typeof timeout.unref === 'function') timeout.unref();

  try {
    const providerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        reply_to: email,
        subject: 'LIPOVERSE inquiry from ' + name,
        text: 'Name: ' + name + '\nEmail: ' + email + '\n\nInquiry:\n' + message
      }),
      signal: controller.signal
    });

    if (!providerResponse.ok) {
      return respond(res, 502, {
        ok: false,
        message: 'The inquiry could not be sent right now. Try again later.'
      });
    }

    return respond(res, 200, { ok: true, message: 'Your inquiry was sent. Thank you.' });
  } catch (error) {
    return respond(res, 502, { ok: false, message: 'The mail service could not be reached. Try again later.' });
  } finally {
    clearTimeout(timeout);
  }
};
