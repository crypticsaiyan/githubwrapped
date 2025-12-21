// Share functionality

function shareWrapped() {
  const frontCard = document.querySelector('.github-card.front');
  if (!frontCard) return;

  let shareOverlay = document.querySelector('.share-overlay');
  if (!shareOverlay) {
    shareOverlay = document.createElement('div');
    shareOverlay.className = 'share-overlay';
    shareOverlay.innerHTML = `
      <div class="share-modal">
        <div class="share-card-container"></div>
        <div class="share-actions">
          <button class="download-btn" onclick="downloadCard()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            DOWNLOAD IMAGE
          </button>
          <button class="close-share-btn" onclick="closeShareOverlay()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            CLOSE
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(shareOverlay);

    shareOverlay.addEventListener('click', (e) => {
      if (e.target === shareOverlay) closeShareOverlay();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && shareOverlay.classList.contains('active')) {
        closeShareOverlay();
      }
    });
  }

  const cardContainer = shareOverlay.querySelector('.share-card-container');
  cardContainer.innerHTML = '';
  const cardClone = frontCard.cloneNode(true);
  cardClone.className = 'github-card share-card-preview';
  cardClone.style.transform = 'none';
  cardClone.style.position = 'relative';
  cardContainer.appendChild(cardClone);

  shareOverlay.classList.add('active');
}

function closeShareOverlay() {
  const shareOverlay = document.querySelector('.share-overlay');
  if (shareOverlay) shareOverlay.classList.remove('active');
}

async function downloadCard() {
  const cardElement = document.querySelector('.share-card-preview');
  if (!cardElement) return;

  const downloadBtn = document.querySelector('.download-btn');
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML = 'Generating...';
  downloadBtn.disabled = true;

  try {
    await document.fonts.ready;

    const profileImg = cardElement.querySelector('.card-profile-img');
    let originalSrc = null;
    
    if (profileImg && profileImg.src) {
      originalSrc = profileImg.src;
      try {
        const response = await fetch(profileImg.src);
        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        profileImg.src = base64;
      } catch (imgError) {
        console.log('Fetch failed, trying canvas method');
        try {
          const canvas = document.createElement('canvas');
          canvas.width = profileImg.naturalWidth || 130;
          canvas.height = profileImg.naturalHeight || 130;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(profileImg, 0, 0);
          profileImg.src = canvas.toDataURL('image/png');
        } catch (canvasError) {
          console.log('Canvas method also failed, using placeholder');
          profileImg.style.display = 'none';
        }
      }
    }

    const crtOverlay = document.createElement('div');
    crtOverlay.className = 'card-crt-overlay';
    crtOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('/static/crt.jpg') repeat;
      background-size: 500px;
      opacity: 0.08;
      pointer-events: none;
      border-radius: 16px;
      z-index: 100;
    `;
    cardElement.style.position = 'relative';
    cardElement.appendChild(crtOverlay);

    const dataUrl = await domtoimage.toPng(cardElement, {
      quality: 1,
      scale: 2,
      style: {
        transform: 'none'
      },
      cacheBust: true
    });

    crtOverlay.remove();

    if (profileImg && originalSrc) {
      profileImg.src = originalSrc;
      profileImg.style.display = '';
    }

    const link = document.createElement('a');
    link.download = `github-wrapped-2025-${document.getElementById('cardUsername').textContent || 'user'}.png`;
    link.href = dataUrl;
    link.click();

    downloadBtn.innerHTML = originalText;
    downloadBtn.disabled = false;
  } catch (error) {
    console.error('Error generating image:', error);
    downloadBtn.innerHTML = originalText;
    downloadBtn.disabled = false;
    alert('Failed to generate image. Please try again.');
  }
}

// Card zoom functionality
function initCardZoom() {
  const frontCard = document.querySelector('.github-card.front');
  if (!frontCard) return;

  let overlay = document.querySelector('.card-zoom-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'card-zoom-overlay';
    overlay.innerHTML = '<div class="card-zoom-hint">Click anywhere to close</div>';
    document.body.appendChild(overlay);
  }

  frontCard.addEventListener('click', (e) => {
    e.stopPropagation();
    const cardClone = frontCard.cloneNode(true);
    cardClone.className = 'github-card zoomed-card';
    cardClone.style.position = 'relative';
    cardClone.style.transform = 'scale(1.8)';
    
    const existingClone = overlay.querySelector('.zoomed-card');
    if (existingClone) existingClone.remove();
    
    overlay.insertBefore(cardClone, overlay.firstChild);
    overlay.classList.add('active');
  });

  overlay.addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
    }
  });
}
