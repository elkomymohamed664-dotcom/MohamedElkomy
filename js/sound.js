/* Soft liposome sound effects. Starts only after a user gesture. */
(function () {
  const KEY = 'lipoverse-sound';
  let muted = localStorage.getItem(KEY) === 'off';
  let ctx = null;
  let master = null;
  let lastWhoosh = 0;
  let lastRelease = 0;
  const boundOrbits = new WeakSet();

  function context() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) {
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = 0.42;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function ready() {
    return !muted && context();
  }

  function env(duration, peak) {
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    gain.connect(master);
    return gain;
  }

  function sweep(from, to, duration, peak) {
    if (!ready()) return;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(48, to), ctx.currentTime + duration);
    osc.connect(filter);
    filter.connect(env(duration, peak));
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.03);
  }

  function paintToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', muted ? 'false' : 'true');
    btn.textContent = muted ? 'Muted' : 'Sound';
  }

  window.LipoverseSound = {
    unlock() { if (!muted) return context() && ctx.resume(); },
    muted() { return muted; },
    setMuted(next) {
      muted = !!next;
      try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch (error) { /* private mode */ }
      paintToggle();
    },
    toggle() {
      this.setMuted(!muted);
      if (!muted) { this.unlock(); this.pop(); }
    },
    grab() { sweep(240, 520, 0.09, 0.07); },
    release() {
      const now = performance.now();
      if (now - lastRelease < 140) return;
      lastRelease = now;
      sweep(280, 110, 0.1, 0.045);
    },
    whoosh() {
      if (!ready()) return;
      const now = performance.now();
      if (now - lastWhoosh < 120) return;
      lastWhoosh = now;
      sweep(460 + Math.random() * 140, 170, 0.07, 0.055);
    },
    pop() { sweep(760, 260, 0.08, 0.08); },
    chime() {
      sweep(520, 340, 0.08, 0.05);
      setTimeout(() => sweep(780, 420, 0.1, 0.045), 75);
    },
    pulse() { sweep(190, 95, 0.16, 0.07); },
    bubble() { sweep(640 + Math.random() * 160, 230, 0.07, 0.05); },
    bindOrbit(controls) {
      if (!controls || boundOrbits.has(controls)) return;
      boundOrbits.add(controls);
      let active = false;
      controls.addEventListener('start', () => {
        active = true;
        this.unlock();
        this.grab();
      });
      controls.addEventListener('change', () => { if (active) this.whoosh(); });
      controls.addEventListener('end', () => {
        if (!active) return;
        active = false;
        this.release();
      });
    }
  };

  paintToggle();
  document.getElementById('sound-toggle')?.addEventListener('click', () => window.LipoverseSound.toggle());
  document.addEventListener('pointerdown', () => { if (!muted) context(); }, { passive: true });
})();
