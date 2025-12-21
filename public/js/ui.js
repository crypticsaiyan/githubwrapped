// UI functions

function showShareButton() {
  const shareBtn = document.querySelector('.share-btn');
  const restartBtn = document.querySelector('.restart-btn');
  const leftBtn = document.getElementById('navLeft');
  const rightBtn = document.getElementById('navRight');
  
  setTimeout(() => {
    if (shareBtn) shareBtn.classList.add('show');
    if (restartBtn) restartBtn.classList.add('show');
    
    if (leftBtn) {
      leftBtn.style.opacity = '1';
      leftBtn.style.pointerEvents = 'auto';
    }
    if (rightBtn && currentSlide < totalSlides - 1) {
      rightBtn.style.opacity = '1';
      rightBtn.style.display = 'flex';
      rightBtn.style.pointerEvents = 'auto';
    }
    
    updateAutoPlayButton();
  }, 300);
}

function showWrappedUI() {
  isInWrapped = true;
  totalSlides = document.querySelectorAll('.slide').length;
  
  document.getElementById('logo').style.visibility = 'visible';
  document.getElementById('headerControls').style.visibility = 'visible';
  
  const leftBtn = document.getElementById('navLeft');
  const rightBtn = document.getElementById('navRight');
  leftBtn.style.display = 'flex';
  rightBtn.style.display = 'flex';
  leftBtn.style.opacity = '0';
  rightBtn.style.opacity = '0';
  leftBtn.style.pointerEvents = 'none';
  rightBtn.style.pointerEvents = 'none';
  leftBtn.style.transition = 'opacity 0.5s ease';
  rightBtn.style.transition = 'opacity 0.5s ease';
  
  document.getElementById('progressBarContainer').style.display = 'block';
  document.getElementById('footer').style.display = 'none';
  
  generateProgressNav();
  updateNavButtons();
  
  const progressFill = document.getElementById('progressBarFill');
  const theme = document.getElementById('slide-0').dataset.theme;
  progressFill.style.width = '0%';
  progressFill.style.color = themeColors[theme];
  
  document.querySelectorAll('.nav-arrow').forEach(arrow => {
    arrow.style.color = themeColors[theme];
  });
  
  setTimeout(() => {
    startAutoPlay();
    updateAutoPlayButton();
  }, 500);
}

function hideWrappedUI() {
  isInWrapped = false;
  document.getElementById('logo').style.visibility = 'hidden';
  document.getElementById('progressNav').style.visibility = 'hidden';
  document.getElementById('headerControls').style.visibility = 'hidden';
  document.getElementById('navLeft').style.display = 'none';
  document.getElementById('navRight').style.display = 'none';
  document.getElementById('progressBarContainer').style.display = 'none';
  document.getElementById('footer').style.display = 'block';
}

function updateProgress(percent) {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${Math.round(percent)}%`;
}

function showLoading() {
  const slide0 = document.getElementById('slide-0');
  slide0.querySelectorAll('.title-label, .title-main, .github-3d-frame, .title-subtitle, .input-section').forEach(el => {
    el.style.display = 'none';
  });
  document.getElementById('loadingContainer').classList.add('active');
}

function hideLoading() {
  const slide0 = document.getElementById('slide-0');
  slide0.querySelectorAll('.title-label, .title-subtitle').forEach(el => {
    el.style.display = 'inline-flex';
  });
  slide0.querySelectorAll('.title-main').forEach(el => {
    el.style.display = 'block';
  });
  slide0.querySelectorAll('.github-3d-frame').forEach(el => {
    el.style.display = 'block';
  });
  document.getElementById('inputSection').style.display = 'flex';
  document.getElementById('loadingContainer').classList.remove('active');
}

function showError(message) {
  const el = document.getElementById('errorMessage');
  el.textContent = `❌ ${message}`;
  el.classList.add('active');
}

function hideError() {
  document.getElementById('errorMessage').classList.remove('active');
}

function resetAndRestart() {
  wrappedData = null;
  currentSlide = 0;
  
  document.querySelectorAll('.slide').forEach((slide, i) => {
    slide.classList.remove('active', 'exit');
    if (i === 0) slide.classList.add('active');
  });
  
  hideWrappedUI();
  updateDotPatternColor('green');
  document.getElementById('usernameInput').value = '';
}
