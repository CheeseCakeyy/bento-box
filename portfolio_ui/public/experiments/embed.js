// Only the compact card needs a different composition. The expanded preview
// uses each experiment's full original interface.
const mode = new URLSearchParams(location.search).get('embed');
if (mode === 'card' || mode === 'expanded' || mode === 'poster') {
  document.documentElement.dataset.embed = mode;
}

// Escape from a focused demo still dismisses the portfolio's preview dialog.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && window.parent !== window) {
    window.parent.postMessage({ type: 'experiment:close' }, location.origin);
  }
});
