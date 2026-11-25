/* UI clicks, vesicle motion, and muffled in-body sounds for the delivery sim. */
(function () {
  const KEY = 'lipoverse-sound';
  let muted = localStorage.getItem(KEY) === 'off';
  let ctx = null;
  let master = null;
  let bodyBus = null;
  let vesicleBus = null;
  let noise = null;
  let flow = null;
  let bodyOn = false;
  let bodyStage = -1;
  let beatTimer = 0;
  let lastWhoosh = 0;
  let lastRelease = 0;
  let lastTick = 0;
  let lastTouch = 0;
  const cueFlags = {};
  const boundOrbits = new WeakSet();

  function context() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) {
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = 0.4;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function ready() {
    return !muted && context();
  }

  function noiseBuffer() {
    if (noise) return noise;
    const len = ctx.sampleRate * 2;
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return noise;
  }

  function envTo(dest, duration, peak) {
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    gain.connect(dest);
    return gain;
  }

  function uiOut() { return master; }

  function vesicleOut() {
    if (!vesicleBus) {
      vesicleBus = ctx.createBiquadFilter();
      vesicleBus.type = 'lowpass';
      vesicleBus.frequency.value = 680;
      vesicleBus.Q.value = 0.5;
      vesicleBus.connect(master);
    }
    return vesicleBus;
  }

  function bodyOut() {
    if (!bodyBus) {
      bodyBus = ctx.createBiquadFilter();
      bodyBus.type = 'lowpass';
      bodyBus.frequency.value = 380;
      bodyBus.Q.value = 0.65;
      bodyBus.connect(master);
    }
    return bodyBus;
  }

  function tone(dest, from, to, duration, peak, type) {
    if (!ready()) return;
    const osc = ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(Math.max(40, from), ctx.currentTime);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(36, to), ctx.currentTime + duration);
    osc.connect(envTo(dest, duration, peak));
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.03);
  }

  function noiseBurst(dest, duration, peak, freq, type) {
    if (!ready()) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    const filter = ctx.createBiquadFilter();
    filter.type = type || 'lowpass';
    filter.frequency.value = freq;
    src.connect(filter);
    filter.connect(envTo(dest, duration, peak));
    src.start();
    src.stop(ctx.currentTime + duration + 0.02);
  }

  function sweep(from, to, duration, peak) {
    tone(uiOut(), from, to, duration, peak, 'sine');
  }

  function paintToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', muted ? 'false' : 'true');
    btn.textContent = muted ? 'Muted' : 'Sound';
  }

  function thump(strong) {
    tone(bodyOut(), strong ? 70 : 48, 34, strong ? 0.16 : 0.1, strong ? 0.2 : 0.1, 'sine');
    noiseBurst(bodyOut(), 0.05, strong ? 0.06 : 0.03, 120, 'lowpass');
  }

  function clearBeat() {
    clearTimeout(beatTimer);
    beatTimer = 0;
  }

  function scheduleBeat() {
    clearBeat();
    if (!bodyOn) return;
    thump(true);
    setTimeout(() => { if (bodyOn) thump(false); }, 170);
    const gap = bodyStage >= 3 ? 680 : bodyStage === 2 ? 760 : 880;
    beatTimer = setTimeout(scheduleBeat, gap);
  }

  function startFlow() {
    if (!ready() || flow) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 240;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.45);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bodyOut());
    src.start();
    flow = { src, gain, filter };
  }

  function setFlow(stage) {
    if (!flow) return;
    const freq = stage >= 3 ? 160 : stage === 1 ? 320 : 230;
    const level = stage === 1 ? 0.07 : stage === 4 ? 0.03 : 0.048;
    flow.filter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.15);
    flow.gain.gain.setTargetAtTime(level, ctx.currentTime, 0.15);
  }

  function stopFlow() {
    if (!flow) return;
    const node = flow;
    flow = null;
    try {
      node.gain.gain.cancelScheduledValues(ctx.currentTime);
      node.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
    } catch (error) { /* context may be closed */ }
    setTimeout(() => { try { node.src.stop(); } catch (error) { /* already stopped */ } }, 420);
  }

  function injection() {
    noiseBurst(bodyOut(), 0.32, 0.08, 700, 'bandpass');
    tone(bodyOut(), 180, 70, 0.28, 0.08, 'sine');
  }

  function leak() {
    noiseBurst(bodyOut(), 0.18, 0.05, 260, 'lowpass');
    tone(bodyOut(), 220, 90, 0.2, 0.05, 'sine');
  }

  function uptake() {
    tone(bodyOut(), 260, 58, 0.38, 0.09, 'sine');
    noiseBurst(bodyOut(), 0.22, 0.05, 180, 'lowpass');
  }

  function releaseBurst() {
    [0, 90, 170, 260].forEach((delay, i) => {
      setTimeout(() => {
        if (!bodyOn && delay) return;
        tone(bodyOut(), 520 - i * 40, 180, 0.12, 0.045, 'triangle');
      }, delay);
    });
  }

  function stageCue(stage) {
    if (!ready()) return;
    Object.keys(cueFlags).forEach(key => { delete cueFlags[key]; });
    if (stage === 0) injection();
    else if (stage === 1) noiseBurst(bodyOut(), 0.24, 0.05, 280, 'lowpass');
    else if (stage === 2) noiseBurst(bodyOut(), 0.16, 0.04, 200, 'lowpass');
    else if (stage === 3) {
      noiseBurst(bodyOut(), 0.1, 0.06, 200, 'lowpass');
      tone(bodyOut(), 140, 80, 0.16, 0.07, 'sine');
    } else if (stage === 4) tone(bodyOut(), 90, 50, 0.2, 0.05, 'sine');
    setFlow(stage);
  }

  function progressCue(stage, t) {
    if (stage === 2 && t > 0.42 && !cueFlags.leak) { cueFlags.leak = true; leak(); }
    if (stage === 3 && t > 0.48 && !cueFlags.uptake) { cueFlags.uptake = true; uptake(); }
    if (stage === 4 && t > 0.2 && !cueFlags.release) { cueFlags.release = true; releaseBurst(); }
  }

  function stopBody() {
    bodyOn = false;
    bodyStage = -1;
    clearBeat();
    stopFlow();
  }

  function startBody(stage) {
    if (!ready()) return;
    const next = Number.isFinite(stage) ? stage : 0;
    if (!bodyOn) {
      bodyOn = true;
      startFlow();
      scheduleBeat();
    }
    if (next !== bodyStage) {
      bodyStage = next;
      stageCue(next);
      clearBeat();
      scheduleBeat();
    }
    setFlow(next);
  }

  function result(pct) {
    if (pct >= 80) {
      tone(uiOut(), 523, 659, 0.1, 0.05, 'sine');
      setTimeout(() => tone(uiOut(), 784, 988, 0.14, 0.05, 'sine'), 110);
    } else if (pct >= 50) sweep(440, 660, 0.12, 0.045);
    else sweep(240, 140, 0.16, 0.05);
  }

  function playNamed(name) {
    if (name === 'ok') {
      tone(uiOut(), 523, 784, 0.1, 0.05, 'sine');
      return;
    }
    if (name === 'bad' || name === 'deny') return sweep(210, 96, 0.14, 0.05);
    if (name === 'flip') return sweep(640, 210, 0.11, 0.04);
    if (name === 'nav') return sweep(300, 540, 0.1, 0.04);
    if (name === 'chime') {
      tone(uiOut(), 520, 340, 0.08, 0.045, 'sine');
      setTimeout(() => tone(uiOut(), 780, 460, 0.1, 0.04, 'sine'), 70);
      return;
    }
    if (name === 'slice') return noiseBurst(uiOut(), 0.08, 0.04, 1400, 'highpass');
    if (name === 'bubble') return sweep(640 + Math.random() * 120, 230, 0.07, 0.045);
    if (name === 'whoosh') return noiseBurst(uiOut(), 0.1, 0.04, 900, 'bandpass');
    if (name === 'release') return sweep(280, 110, 0.1, 0.04);
    if (name === 'pop') return sweep(760, 260, 0.08, 0.07);
    if (name === 'drop') return sweep(480, 180, 0.08, 0.04);
    if (name === 'tick') return tone(uiOut(), 980, 760, 0.03, 0.02, 'triangle');
    if (name === 'send') return sweep(420, 860, 0.12, 0.045);
    if (name === 'click') return tone(uiOut(), 880, 560, 0.045, 0.035, 'triangle');
  }

  function cueFor(target) {
    const el = target && target.closest
      ? target.closest('button, a, label, [role="button"], .label-slot, .module-card, #flash-card, .quiz-opt, .match-def, .match-term')
      : null;
    if (!el || el.id === 'sound-toggle') return null;
    if (el.closest('canvas, #explorer-canvas-wrap, #hero-stage, #gallery-canvas')) return null;
    const quiz = el.closest('.quiz-opt');
    if (quiz) {
      if (quiz.classList.contains('correct')) return 'ok';
      if (quiz.classList.contains('wrong')) return 'bad';
      if (quiz.disabled) return 'deny';
      return 'click';
    }
    const check = el.closest('.lab-check-opts button');
    if (check) {
      if (check.classList.contains('ok')) return 'ok';
      if (check.classList.contains('bad')) return 'bad';
      return 'click';
    }
    if (el.closest('.match-def')) return el.closest('.match-def').classList.contains('solved') ? 'ok' : 'bad';
    if (el.id === 'order-check') {
      const text = document.getElementById('order-status')?.textContent || '';
      return text.startsWith('That matches') ? 'ok' : 'bad';
    }
    if (el.id === 'quiz-next' && /Results/.test(el.textContent)) return 'result';
    if (el.id === 'flash-card' || (el.closest('#flash-card') && !el.closest('button'))) return 'flip';
    if (el.closest('[data-model], #gallery-picks button, [data-type]')) return 'chime';
    if (el.id === 'btn-cutaway') return 'slice';
    if (el.id === 'btn-drugs' || el.id === 'load-hydrophilic' || el.id === 'load-lipophilic') return 'bubble';
    if (el.id === 'btn-rotate') return 'whoosh';
    if (el.id === 'btn-reset-view' || el.id === 'sim-reset') return 'release';
    if (el.closest('.part-btn')) return 'pop';
    if (el.closest('.label-slot')) {
      const text = document.getElementById('label-status')?.textContent || '';
      if (text.startsWith('Labels match')) return 'ok';
      if (text.startsWith('One or more')) return 'bad';
      return 'drop';
    }
    if (el.closest('[data-nav], [data-goto], .module-card')) return 'nav';
    if (el.closest('button, [role="button"], .ctrl-btn')) return 'click';
    if (el.closest('a[href]')) return 'nav';
    if (el.closest('label')) return 'tick';
    return null;
  }

  window.LipoverseSound = {
    unlock() { if (!muted) return context() && ctx.resume(); },
    muted() { return muted; },
    setMuted(next) {
      muted = !!next;
      if (muted) stopBody();
      try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch (error) { /* private mode */ }
      paintToggle();
    },
    toggle() {
      if (!muted) {
        sweep(420, 120, 0.1, 0.05);
        this.setMuted(true);
        return;
      }
      this.setMuted(false);
      this.unlock();
      this.pop();
    },
    grab() {
      if (!ready()) return;
      const now = performance.now();
      if (now - lastTouch < 90) return;
      lastTouch = now;
      const dest = vesicleOut();
      const bend = 0.9 + Math.random() * 0.18;
      tone(dest, 96 * bend, 46, 0.15, 0.1, 'sine');
      tone(dest, 168 * bend, 72, 0.11, 0.028, 'sine');
      noiseBurst(dest, 0.05, 0.02, 340 + Math.random() * 60, 'lowpass');
    },
    release() {
      const now = performance.now();
      if (now - lastRelease < 140) return;
      lastRelease = now;
      sweep(280, 110, 0.1, 0.04);
    },
    whoosh() {
      if (!ready()) return;
      const now = performance.now();
      if (now - lastWhoosh < 120) return;
      lastWhoosh = now;
      noiseBurst(uiOut(), 0.07, 0.035, 700 + Math.random() * 300, 'bandpass');
    },
    pop() { playNamed('pop'); },
    chime() { playNamed('chime'); },
    pulse() { sweep(190, 95, 0.16, 0.06); },
    bubble() { playNamed('bubble'); },
    ok() { playNamed('ok'); },
    bad() { playNamed('bad'); },
    send() { playNamed('send'); },
    result,
    startBody,
    stopBody,
    stageCue,
    syncBody(state) {
      if (!state || !state.on || document.hidden) {
        stopBody();
        return;
      }
      if (!bodyOn) startBody(state.stage);
      else if (state.stage !== bodyStage) {
        bodyStage = state.stage;
        stageCue(state.stage);
        clearBeat();
        scheduleBeat();
      }
      progressCue(state.stage, state.t || 0);
    },
    bindOrbit(controls) {
      if (!controls || boundOrbits.has(controls)) return;
      boundOrbits.add(controls);
      let active = false;
      let dragged = false;
      controls.addEventListener('start', () => {
        active = true;
        dragged = false;
        this.unlock();
        this.grab();
      });
      controls.addEventListener('change', () => {
        if (!active) return;
        dragged = true;
        this.whoosh();
      });
      controls.addEventListener('end', () => {
        if (!active) return;
        active = false;
        if (dragged) this.release();
      });
    }
  };

  paintToggle();
  document.getElementById('sound-toggle')?.addEventListener('click', () => window.LipoverseSound.toggle());
  document.addEventListener('pointerdown', () => { if (!muted) context(); }, { passive: true });
  document.addEventListener('click', (event) => {
    const name = cueFor(event.target);
    if (!name) return;
    window.LipoverseSound.unlock();
    if (name === 'result') {
      playNamed('click');
      const pct = parseInt(document.querySelector('.quiz-score-big')?.textContent, 10);
      if (Number.isFinite(pct)) setTimeout(() => result(pct), 140);
      return;
    }
    playNamed(name);
  });
  document.addEventListener('submit', (event) => {
    if (event.target && event.target.id === 'inquiry-form') window.LipoverseSound.send();
  });
  document.addEventListener('drop', (event) => {
    if (!event.target.closest('.label-slot')) return;
    setTimeout(() => {
      const text = document.getElementById('label-status')?.textContent || '';
      if (text.startsWith('Labels match')) window.LipoverseSound.ok();
      else if (text.startsWith('One or more')) window.LipoverseSound.bad();
      else window.LipoverseSound.pop();
    }, 0);
  });
  document.addEventListener('change', (event) => {
    const el = event.target;
    if (!el || !el.matches('input[type="checkbox"], input[type="radio"], select')) return;
    playNamed('tick');
  });
  document.addEventListener('focusin', (event) => {
    const el = event.target;
    if (!el || !el.matches('input, textarea, select') || el.type === 'hidden') return;
    const now = performance.now();
    if (now - lastTick < 280) return;
    lastTick = now;
    playNamed('tick');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const el = event.target.closest('[role="button"]');
    if (!el || el.tagName === 'BUTTON' || el.tagName === 'A') return;
    playNamed('nav');
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopBody(); });
})();
