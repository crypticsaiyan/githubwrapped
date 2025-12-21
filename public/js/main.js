// Main initialization

document.addEventListener('DOMContentLoaded', () => {
  updateDotPatternColor('green');
  document.getElementById('usernameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateWrapped();
  });
  initCardZoom();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!isInWrapped) return;
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft') prevSlide();
});
