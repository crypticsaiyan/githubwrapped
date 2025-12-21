// Animation utilities

function animateNumbers(slideEl) {
  const countElements = slideEl.querySelectorAll('.big-number[data-count], [data-animate-count]');
  countElements.forEach(el => {
    const target = parseInt(el.dataset.count || el.textContent.replace(/[^0-9]/g, ''), 10);
    if (isNaN(target)) return;
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';
    animateValue(el, 0, target, 800);
  });
}

function animateValue(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * easeOut);
    
    element.textContent = formatNumber(current);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatNumber(end);
    }
  }
  
  requestAnimationFrame(update);
}

function setAnimatedCount(elementId, value) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.dataset.count = value;
  el.dataset.animateCount = 'true';
  el.dataset.animated = 'false';
  el.textContent = formatNumber(0);
}

function getRevealElements(slideEl) {
  return Array.from(slideEl.querySelectorAll([
    '.title-label',
    '.title-main',
    '.big-number',
    '.title-subtitle',
    '.stat-description',
    '.github-3d-frame',
    '.contribution-graph',
    '.repos-container',
    '.languages-grid',
    '.achievements-grid',
    '.timeline-container',
    '.squad-container',
    '.quote-container',
    '.summary-layout',
    '.summary-header',
    '.summary-title',
    '.summary-stats',
    '.stats-grid',
    '.stat-item',
    '.stat-item-value',
    '.deco-icons',
    '.start-btn',
    '.input-section'
  ].join(', ')));
}

function prepareSlideForReveal(slideEl) {
  const elements = getRevealElements(slideEl);
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = 'opacity 400ms ease, transform 400ms ease';
  });
}

function revealSlideContent(slideEl) {
  const elements = getRevealElements(slideEl);
  const slides = Array.from(document.querySelectorAll('.slide'));
  const slideIndex = slides.indexOf(slideEl);
  const isLastSlide = (slideIndex === slides.length - 1);
  let delay = 0;
  const step = isLastSlide ? 300 : REVEAL_STEP_DELAY;
  
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';

      const candidates = [el, ...Array.from(el.querySelectorAll('[data-animate-count="true"]'))];
      candidates.forEach(node => {
        const nodeTarget = parseInt((node.dataset && node.dataset.count) || node.textContent.replace(/[^0-9]/g, ''), 10);
        const shouldAnimate = (!isNaN(nodeTarget)) && (
          (node.dataset && node.dataset.animateCount) === 'true' || node.classList.contains('big-number')
        );
        if (shouldAnimate && node.dataset.animated !== 'true') {
          node.dataset.animated = 'true';
          animateValue(node, 0, nodeTarget, 800);
        }
      });

      if (isLastSlide && index === elements.length - 1) {
        setTimeout(() => {
          showShareButton();
        }, 500);
      }
    }, delay);
    delay += step;
  });
}
