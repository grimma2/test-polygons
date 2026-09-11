(function (global) {
  'use strict';

  function areaPct(el) {
    if (!el) return 0;
    var rect = el.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var visW = Math.max(0, Math.min(rect.right, vw) - Math.max(rect.left, 0));
    var visH = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
    var total = rect.width * rect.height;
    if (total <= 0) return 0;
    return Math.round((visW * visH / total) * 100);
  }

  function resolve(sel) {
    if (!sel) return null;
    if (typeof sel !== 'string') return sel;
    return document.querySelector(sel);
  }

  function watch(slotSel, opts) {
    opts = opts || {};
    var dwellMs = opts.dwellMs == null ? 1000 : opts.dwellMs;
    var inner = opts.inner || '.visibla-container';
    var pctEl = document.getElementById(opts.pctId || 'visPct');
    var mrcEl = document.getElementById(opts.mrcId || 'mrc');
    var above50Since = 0;

    function target() {
      var slot = resolve(slotSel);
      if (!slot) return null;
      return slot.querySelector(inner) || slot;
    }

    function update() {
      var el = target();
      var now = Date.now();
      var pct = areaPct(el);
      if (pctEl) {
        pctEl.textContent = pct + '%';
        pctEl.className = 'value ' + (pct >= 50 ? 'green' : 'red');
      }
      if (pct >= 50) {
        if (!above50Since) above50Since = now;
      } else {
        above50Since = 0;
      }
      var ok = pct >= 50 && above50Since > 0 && (now - above50Since) >= dwellMs;
      if (mrcEl) {
        mrcEl.textContent = ok ? 'YES' : 'NO';
        mrcEl.className = 'value ' + (ok ? 'green' : 'red');
      }
      if (el && el.classList) el.classList.toggle('viewable', ok);
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    setInterval(update, 250);
    update();
    return { update: update, target: target };
  }

  global.VisiblaHud = { watch: watch, areaPct: areaPct };
})(window);
