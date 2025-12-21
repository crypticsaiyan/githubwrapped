// Navigation functions

function updateDotPatternColor(theme) {
  const dotPattern = document.getElementById('dotPattern');
  dotPattern.style.color = themeColors[theme] || themeColors.green;
}

function generateProgressNav() {
  const nav = document.getElementById('progressNav');
  const icons = [
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM8.5 8C9.33 8 10 8.67 10 9.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3.5 9.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>'
  ];
  
  nav.innerHTML = icons.map((icon, i) => 
    `<div class="progress-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})">${icon}</div>`
  ).join('');
  nav.style.visibility = 'visible';
}

function updateProgressNav() {
  const dots = document.querySelectorAll('.progress-dot');
  const currentTheme = document.querySelectorAll('.slide')[currentSlide]?.dataset.theme || 'green';
  const activeColor = themeColors[currentTheme];
  
  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'completed');
    dot.style.backgroundColor = '';
    if (i === currentSlide) {
      dot.classList.add('active');
      dot.style.backgroundColor = activeColor;
    } else if (i < currentSlide) {
      dot.classList.add('completed');
    }
  });
}

async function goToSlide(index) {
  if (index < 0 || index >= totalSlides || isTransitioning) return;
  if (index === currentSlide) return;
  
  isTransitioning = true;
  
  const slides = document.querySelectorAll('.slide');
  const currentSlideEl = slides[currentSlide];
  const nextSlideEl = slides[index];
  const isForward = index > currentSlide;
  
  const transitionType = transitionTypes[index] || 'none';
  const nextTheme = nextSlideEl.dataset.theme;
  const transitionColor = themeColors[nextTheme];
  
  currentSlideEl.querySelectorAll('.title-label, .title-main, .big-number, .title-subtitle, .stat-description, .deco-icons, .start-btn, .input-section, .repo-card, .language-card').forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth;
  });
  
  if (transitionType !== 'none' && isInWrapped) {
    await playTransition(transitionType, transitionColor, false);
  }
  
  currentSlideEl.classList.remove('sequential-reveal');
  currentSlideEl.classList.remove('active');
  currentSlideEl.classList.add(isForward ? 'exit' : 'prev');
  
  await new Promise(r => setTimeout(r, 50));
  
  prepareSlideForReveal(nextSlideEl);
  currentSlideEl.classList.remove('exit', 'prev');
  nextSlideEl.classList.add('sequential-reveal');
  nextSlideEl.classList.add('active');
  currentSlide = index;
  
  updateDotPatternColor(nextTheme);
  
  document.querySelectorAll('.nav-arrow').forEach(arrow => {
    arrow.style.color = themeColors[nextTheme];
  });
  
  updateProgressBar();
  updateProgressNav();
  updateNavButtons();
  
  if (transitionType !== 'none' && isInWrapped) {
    await playTransition(transitionType, transitionColor, true);
  }
  
  revealSlideContent(nextSlideEl);

  if (index === 1 && !isMusicPlaying) {
    bgMusic.play().catch(e => console.log('Audio play failed:', e));
    isMusicPlaying = true;
    document.getElementById('soundOnIcon').style.display = 'block';
    document.getElementById('soundOffIcon').style.display = 'none';
  }
  
  isTransitioning = false;
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    goToSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    handleUserInteraction();
    goToSlide(currentSlide - 1);
  }
}

function updateNavButtons() {
  const leftBtn = document.getElementById('navLeft');
  const rightBtn = document.getElementById('navRight');
  
  leftBtn.disabled = currentSlide === 0;
  rightBtn.disabled = currentSlide === totalSlides - 1;
  
  const presentationComplete = leftBtn.style.opacity === '1';
  
  if (presentationComplete) {
    if (currentSlide === totalSlides - 1) {
      rightBtn.style.display = 'none';
      rightBtn.style.pointerEvents = 'none';
    } else {
      rightBtn.style.display = 'flex';
      rightBtn.style.opacity = '1';
      rightBtn.style.pointerEvents = 'auto';
    }
    leftBtn.style.pointerEvents = 'auto';
  }
}
