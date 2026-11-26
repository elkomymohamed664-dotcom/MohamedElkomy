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
  let lastTick = 0;
  let lastTouch = 0;
  const cueFlags = {};
  const boundOrbits = new WeakSet();

  function context() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) {
      try { ctx = new AudioCtx({ latencyHint: 'interactive' }); }
      catch (error) { ctx = new AudioCtx(); }
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function ready() {
    return !muted && context();
  }

  function whenRunning(fn) {
    if (muted) return;
    const c = context();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(() => {});
    fn();
  }

  function noiseBuffer() {
    if (noise) return noise;
    const len = ctx.sampleRate * 2;
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return noise;
  }

  let keeper = null;

  function keepHot() {
    if (keeper || !ctx || muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.00001;
    osc.frequency.value = 180;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    keeper = osc;
  }

  function stopHot() {
    if (!keeper) return;
    try { keeper.stop(); } catch (error) { /* already stopped */ }
    keeper = null;
  }

  function envTo(dest, duration, peak) {
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const level = Math.max(0.001, peak);
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.03, duration));
    gain.connect(dest);
    return gain;
  }

  function uiOut() { context(); return master; }

  function vesicleOut() {
    context();
    if (!vesicleBus) {
      vesicleBus = ctx.createBiquadFilter();
      vesicleBus.type = 'lowpass';
      vesicleBus.frequency.value = 2400;
      vesicleBus.Q.value = 0.4;
      vesicleBus.connect(master);
    }
    return vesicleBus;
  }

  function bodyOut() {
    context();
    if (!bodyBus) {
      bodyBus = ctx.createBiquadFilter();
      bodyBus.type = 'lowpass';
      bodyBus.frequency.value = 520;
      bodyBus.Q.value = 0.65;
      bodyBus.connect(master);
    }
    return bodyBus;
  }

  function tone(dest, from, to, duration, peak, type) {
    whenRunning(() => {
      const osc = ctx.createOscillator();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(Math.max(40, from), ctx.currentTime);
      if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(36, to), ctx.currentTime + duration);
      osc.connect(envTo(dest, duration, peak));
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.03);
    });
  }

  function noiseBurst(dest, duration, peak, freq, type) {
    whenRunning(() => {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      const filter = ctx.createBiquadFilter();
      filter.type = type || 'lowpass';
      filter.frequency.value = freq;
      src.connect(filter);
      filter.connect(envTo(dest, duration, peak));
      src.start();
      src.stop(ctx.currentTime + duration + 0.02);
    });
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
    const low = strong ? 110 : 86;
    tone(bodyOut(), low, 62, strong ? 0.18 : 0.12, strong ? 0.34 : 0.18, 'sine');
    tone(bodyOut(), low * 2.4, low * 1.5, strong ? 0.12 : 0.08, strong ? 0.16 : 0.08, 'sine');
    noiseBurst(bodyOut(), 0.06, strong ? 0.08 : 0.04, 320, 'lowpass');
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
    if (muted || flow) return;
    whenRunning(() => {
    if (flow || muted) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.45);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bodyOut());
    src.start();
    flow = { src, gain, filter };
    });
  }

  function setFlow(stage) {
    if (!flow) return;
    const freq = stage >= 3 ? 240 : stage === 1 ? 460 : 340;
    const level = stage === 1 ? 0.1 : stage === 4 ? 0.05 : 0.075;
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

  let dragAir = null;
  let dragIdle = 0;
  let dragStarting = false;

  function startDragAir() {
    if (muted || dragAir || dragStarting) return;
    dragStarting = true;
    whenRunning(() => {
    if (dragAir || muted) { dragStarting = false; return; }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 980;
    filter.Q.value = 0.65;
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.07, t);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(uiOut());
    src.start(t);
    dragAir = { src, gain };
    dragStarting = false;
    });
  }

  function stopDragAir() {
    clearTimeout(dragIdle);
    dragIdle = 0;
    if (!dragAir) return;
    const node = dragAir;
    dragAir = null;
    try {
      node.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.02);
    } catch (error) { /* context may be closed */ }
    setTimeout(() => { try { node.src.stop(); } catch (error) { /* already stopped */ } }, 80);
  }

  function injection() {
    noiseBurst(bodyOut(), 0.32, 0.16, 700, 'bandpass');
    tone(bodyOut(), 220, 110, 0.28, 0.16, 'sine');
  }

  function leak() {
    noiseBurst(bodyOut(), 0.18, 0.1, 340, 'lowpass');
    tone(bodyOut(), 260, 120, 0.2, 0.1, 'sine');
  }

  function uptake() {
    tone(bodyOut(), 300, 140, 0.38, 0.16, 'sine');
    noiseBurst(bodyOut(), 0.22, 0.1, 280, 'lowpass');
  }

  function releaseBurst() {
    [0, 90, 170, 260].forEach((delay, i) => {
      setTimeout(() => {
        if (!bodyOn && delay) return;
        tone(bodyOut(), 520 - i * 40, 220, 0.12, 0.1, 'triangle');
      }, delay);
    });
  }

  function stageCue(stage) {
    if (!ready()) return;
    Object.keys(cueFlags).forEach(key => { delete cueFlags[key]; });
    if (stage === 0) injection();
    else if (stage === 1) noiseBurst(bodyOut(), 0.24, 0.1, 360, 'lowpass');
    else if (stage === 2) noiseBurst(bodyOut(), 0.16, 0.08, 300, 'lowpass');
    else if (stage === 3) {
      noiseBurst(bodyOut(), 0.1, 0.12, 320, 'lowpass');
      tone(bodyOut(), 180, 110, 0.16, 0.14, 'sine');
    } else if (stage === 4) tone(bodyOut(), 160, 96, 0.2, 0.12, 'sine');
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
      tone(uiOut(), 523, 659, 0.1, 0.18, 'sine');
      setTimeout(() => tone(uiOut(), 784, 988, 0.14, 0.16, 'sine'), 110);
    } else if (pct >= 50) sweep(440, 660, 0.12, 0.14);
    else sweep(240, 140, 0.16, 0.14);
  }

  function playNamed(name) {
    if (name === 'ok') {
      tone(uiOut(), 660, 990, 0.1, 0.36, 'sine');
      return;
    }
    if (name === 'bad' || name === 'deny') return sweep(210, 96, 0.14, 0.22);
    if (name === 'flip') return sweep(640, 210, 0.11, 0.2);
    if (name === 'nav') return sweep(420, 760, 0.09, 0.28);
    if (name === 'chime') {
      tone(uiOut(), 740, 740, 0.07, 0.34, 'sine');
      tone(uiOut(), 1480, 1180, 0.06, 0.16, 'triangle');
      return;
    }
    if (name === 'slice') return noiseBurst(uiOut(), 0.08, 0.1, 1400, 'highpass');
    if (name === 'bubble') return sweep(640 + Math.random() * 120, 230, 0.07, 0.12);
    if (name === 'whoosh') return noiseBurst(uiOut(), 0.1, 0.1, 900, 'bandpass');
    if (name === 'release') return sweep(280, 110, 0.1, 0.12);
    if (name === 'pop') return sweep(880, 440, 0.07, 0.32);
    if (name === 'drop') return sweep(520, 260, 0.08, 0.2);
    if (name === 'tick') return tone(uiOut(), 980, 760, 0.045, 0.24, 'sine');
    if (name === 'send') return sweep(480, 920, 0.12, 0.28);
    if (name === 'click') {
      tone(uiOut(), 820, 1040, 0.055, 0.42, 'sine');
      tone(uiOut(), 1640, 1320, 0.04, 0.2, 'triangle');
      return;
    }
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
      if (muted) {
        stopBody();
        stopDragAir();
        stopHot();
      } else keepHot();
      try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch (error) { /* private mode */ }
      paintToggle();
    },
    toggle() {
      if (!muted) {
        sweep(420, 120, 0.1, 0.14);
        this.setMuted(true);
        return;
      }
      this.setMuted(false);
      this.unlock();
      this.pop();
    },
    grab() {
      if (muted) return;
      const now = performance.now();
      if (now - lastTouch < 70) return;
      lastTouch = now;
      whenRunning(() => {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1400;
        const gain = ctx.createGain();
        const t = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.11, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(uiOut());
        src.start(t);
        src.stop(t + 0.05);
      });
    },
    release() {},
    whoosh() {
      if (!ready()) return;
      const now = performance.now();
      if (now - lastWhoosh < 150) return;
      lastWhoosh = now;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1300;
      filter.Q.value = 0.8;
      const gain = ctx.createGain();
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.08, t + 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(vesicleOut());
      src.start(t);
      src.stop(t + 0.15);
    },
    pop() { playNamed('pop'); },
    chime() { playNamed('chime'); },
    pulse() { sweep(190, 95, 0.16, 0.14); },
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
      if (!controls || boundOrbits.has(controls) || !controls.domElement) return;
      boundOrbits.add(controls);
      const el = controls.domElement;
      let pressing = false;
      let moved = false;
      let origin = null;
      const endPress = (event) => {
        if (origin && event && event.pointerId !== origin.id) return;
        pressing = false;
        moved = false;
        origin = null;
        stopDragAir();
      };
      // OrbitControls also fires start/change for wheel zoom and for auto-rotate.
      // Those are not a press or a drag, so the tick and whoosh stay on the pointer.
      el.addEventListener('pointerdown', (event) => {
        if (!event.isPrimary) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pressing = true;
        moved = false;
        origin = { x: event.clientX, y: event.clientY, id: event.pointerId };
        this.unlock();
        this.grab();
      });
      el.addEventListener('pointermove', (event) => {
        if (!pressing || !origin || event.pointerId !== origin.id) return;
        if (!moved) {
          const dist = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
          if (dist < 2) return;
          moved = true;
        }
        startDragAir();
        clearTimeout(dragIdle);
        dragIdle = setTimeout(() => { if (pressing) stopDragAir(); }, 420);
      });
      el.addEventListener('pointerup', endPress);
      el.addEventListener('pointercancel', endPress);
    }
  };

  paintToggle();
  document.getElementById('sound-toggle')?.addEventListener('click', () => window.LipoverseSound.toggle());

  let pressedCue = null;
  function pressEl(target) {
    return target && target.closest ? target.closest('button, a, [role="button"], .module-card, .ctrl-btn') : null;
  }
  function waitForClick(target) {
    return !!(target && target.closest && target.closest('.quiz-opt, .lab-check-opts, .match-def, .label-slot, #order-check'));
  }

  document.addEventListener('pointerdown', (event) => {
    if (event.button > 0) return;
    if (!muted) {
      context();
      if (ctx) noiseBuffer();
      keepHot();
    }
    const el = pressEl(event.target);
    if (!el || el.id === 'sound-toggle' || waitForClick(event.target)) return;
    const name = cueFor(event.target);
    if (!name || name === 'result') return;
    pressedCue = el;
    playNamed(name);
  }, { passive: true });

  document.addEventListener('click', (event) => {
    const el = pressEl(event.target);
    if (pressedCue && el && (pressedCue === el || pressedCue.contains(event.target))) {
      pressedCue = null;
      if (!waitForClick(event.target)) return;
    }
    const name = cueFor(event.target);
    if (!name) return;
    window.LipoverseSound.unlock();
    if (name === 'result') {
      playNamed('click');
      const pct = parseInt(document.querySelector('.quiz-score-big')?.textContent, 10);
      if (Number.isFinite(pct)) setTimeout(() => result(pct), 80);
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
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    stopBody();
    stopDragAir();
  });
})();
