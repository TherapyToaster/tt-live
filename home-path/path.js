/*! tt-home-path v1 for therapytoaster.com Home ("Choose your path").
   Enhances #ttps with desktop pointer spotlight & ensures arcade DOM upgrades
   while respecting prefers-reduced-motion and keeping zero layout shift.
*/
(function (W, D) {
  if (W.ttHpRun) return;
  W.ttHpRun = 1;

  var P = (location.pathname || '/').replace(/\/+$/, '');
  if (P !== '' && P !== '/home' && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

  var mqReduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)');
  var mqHover = W.matchMedia && W.matchMedia('(hover: hover) and (pointer: fine)');

  function bindSpotlight() {
    var sec = D.getElementById('ttps');
    if (!sec || sec.getAttribute('data-hp-px')) return;
    sec.setAttribute('data-hp-px', '1');

    if ((mqReduce && mqReduce.matches) || (mqHover && !mqHover.matches)) return;

    var raf = 0, tx = 50, ty = 20;
    function flush() {
      raf = 0;
      sec.style.setProperty('--hp-x', tx.toFixed(1) + '%');
      sec.style.setProperty('--hp-y', ty.toFixed(1) + '%');
    }
    sec.addEventListener('pointermove', function (e) {
      if (mqReduce && mqReduce.matches) return;
      var r = sec.getBoundingClientRect();
      if (!r.width || !r.height) return;
      tx = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      ty = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      if (!raf) raf = W.requestAnimationFrame(flush);
    }, { passive: true });
    sec.addEventListener('pointerleave', function () {
      tx = 50; ty = 20;
      if (!raf) raf = W.requestAnimationFrame(flush);
    }, { passive: true });
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', bindSpotlight);
  else bindSpotlight();
})(window, document);
