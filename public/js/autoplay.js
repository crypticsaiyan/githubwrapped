// Auto-play functions

function updateProgressBar() {
  const progressFill = document.getElementById('progressBarFill');
  const currentTheme = document.querySelectorAll('.slide')[currentSlide]?.dataset.theme || 'green';
  const themeColor = themeColors[currentTheme];
  progressFill.style.color = themeColor;
  
  if (!autoPlayEnabled) {
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    progressFill.style.width = progress + '%';
  }
}

function animateProgressBar() {
  if (!autoPlayEnabled || !presentationStartTime) return;
  
  const progressFill = document.getElementById('progressBarFill');
  const totalElapsed = Date.now() - presentationStartTime;
  const totalDuration = totalAutoPlayDuration || (totalSlides * REVEAL_STEP_DELAY);
  
  const totalProgress = Math.min((totalElapsed / totalDuration) * 100, 100);
  progressFill.style.width = totalProgress + '%';
  
  if (totalProgress < 100 && autoPlayEnabled) {
    progressAnimationFrame = requestAnimationFrame(animateProgressBar);
  } else if (totalProgress >= 100) {
    progressFill.style.width = '100%';
    stopAutoPlay();
    showShareButton();
  }
}

function startAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  if (autoPlayTimeout) clearTimeout(autoPlayTimeout);

  const slides = Array.from(document.querySelectorAll('.slide'));
  autoPlayDurations = slides.map((slide, idx) => {
    const count = getRevealElements(slide).length;
    const isLastSlide = (idx === slides.length - 1);
    const stepDelay = isLastSlide ? 300 : REVEAL_STEP_DELAY;
    const bufferTime = isLastSlide ? 1000 : AUTO_PLAY_BASE_DELAY;
    return (count * stepDelay) + bufferTime;
  });
  totalAutoPlayDuration = autoPlayDurations.reduce((a, b) => a + b, 0);

  const elapsedBefore = autoPlayDurations.slice(0, currentSlide).reduce((a, b) => a + b, 0);
  autoPlayEnabled = true;
  presentationStartTime = Date.now() - elapsedBefore;
  resetTimer();

  const scheduleNext = () => {
    if (!autoPlayEnabled) return;
    if (currentSlide < totalSlides - 1) {
      const duration = autoPlayDurations[currentSlide] || (3 * REVEAL_STEP_DELAY);
      autoPlayTimeout = setTimeout(() => {
        nextSlide();
        scheduleNext();
      }, duration);
    }
  };
  scheduleNext();
}

function stopAutoPlay() {
  autoPlayEnabled = false;
  if (autoPlayInterval) { clearInterval(autoPlayInterval); autoPlayInterval = null; }
  if (autoPlayTimeout) { clearTimeout(autoPlayTimeout); autoPlayTimeout = null; }
  pauseTimer();
  presentationStartTime = null;
}

function resetTimer() {
  if (!presentationStartTime) {
    presentationStartTime = Date.now();
  }
  if (progressAnimationFrame) {
    cancelAnimationFrame(progressAnimationFrame);
  }
  if (autoPlayEnabled) {
    animateProgressBar();
  }
}

function pauseTimer() {
  if (progressAnimationFrame) {
    cancelAnimationFrame(progressAnimationFrame);
    progressAnimationFrame = null;
  }
}

function toggleAutoPlay() {
  if (autoPlayEnabled) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
  updateAutoPlayButton();
}

function updateAutoPlayButton() {
  const btn = document.getElementById('autoPlayBtn');
  if (btn) {
    btn.innerHTML = autoPlayEnabled ? 
      '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' :
      '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    btn.title = autoPlayEnabled ? 'Pause auto-play' : 'Start auto-play';
  }
}

function handleUserInteraction() {
  if (autoPlayEnabled) {
    stopAutoPlay();
    updateAutoPlayButton();
  }
}
