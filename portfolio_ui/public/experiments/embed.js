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
