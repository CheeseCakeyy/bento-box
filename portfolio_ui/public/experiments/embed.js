// Only the compact card needs a different composition. The expanded preview
// uses each experiment's full original interface.
const mode = new URLSearchParams(location.search).get('embed');
document.documentElement.dataset.experiment = location.pathname.split('/').filter(Boolean).at(-2);
if (mode === 'card' || mode === 'expanded' || mode === 'poster') {
  document.documentElement.dataset.embed = mode;
}

// Escape from a focused demo still dismisses the portfolio's preview dialog.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && window.parent !== window) {
    window.parent.postMessage({ type: 'experiment:close' }, location.origin);
  }
});

// Same-origin previews share the portfolio click sparks.
if ((mode === 'card' || mode === 'expanded') && window.parent !== window) {
  document.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary) return;
    window.parent.postMessage({ type: 'experiment:click', x: event.clientX, y: event.clientY }, location.origin);
  }, { passive: true });
}

// Demos opened on their own keep the same click sparks as the portfolio.
if (!mode && window.parent === window) {
  const setupStandaloneSparks = () => {
    const canvas = document.createElement('canvas');
    canvas.className = 'experiment-standalone-sparks';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);
    const context = canvas.getContext('2d');
    if (!context) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let sparks = [];
    let frame = 0;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (now) => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      sparks = sparks.filter((spark) => {
        const progress = Math.min(1, (now - spark.started) / 650);
        if (progress >= 1) return false;
        const eased = progress * (2 - progress);
        const distance = eased * 22;
        const length = 9 * (1 - eased);
        const dx = Math.cos(spark.angle);
        const dy = Math.sin(spark.angle);
        context.beginPath();
        context.moveTo(spark.x + distance * dx, spark.y + distance * dy);
        context.lineTo(spark.x + (distance + length) * dx, spark.y + (distance + length) * dy);
        context.strokeStyle = '#a47855';
        context.lineWidth = 1.8;
        context.lineCap = 'round';
        context.stroke();
        return true;
      });
      if (sparks.length) frame = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || reducedMotion.matches) return;
      const started = performance.now();
      sparks.push(...Array.from({ length: 8 }, (_, index) => ({ x: event.clientX, y: event.clientY, angle: index * Math.PI / 4, started })));
      if (!frame) frame = requestAnimationFrame(draw);
    }, { passive: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupStandaloneSparks, { once: true });
  else setupStandaloneSparks();
}

// Keep the gallery scrollable even when the pointer is over a live iframe.
// Expanded demos retain their own original scroll behavior.
if (mode === 'card' && window.parent !== window) {
  document.addEventListener('wheel', (event) => {
    if (event.ctrlKey) return;
    const value = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const delta = value * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerWidth : 1);
    event.preventDefault();
    window.parent.postMessage({ type: 'experiment:wheel', delta }, location.origin);
  }, { passive: false });
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('#world');
    if (canvas) canvas.tabIndex = 0;
  });
}
