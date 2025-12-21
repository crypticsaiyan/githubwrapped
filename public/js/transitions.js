// Create transition overlay content
function createTransitionContent(type, color) {
  const overlay = document.getElementById('transitionOverlay');
  overlay.innerHTML = '';
  
  switch(type) {
    case 'tiles':
      const tilesGrid = document.createElement('div');
      tilesGrid.className = 'tiles-grid';
      for (let i = 0; i < 48; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.background = color;
        const row = Math.floor(i / 8);
        const col = i % 8;
        const delay = (row + col) * 30;
        tile.style.animationDelay = delay + 'ms';
        tilesGrid.appendChild(tile);
      }
      overlay.appendChild(tilesGrid);
      return tilesGrid;
      
    case 'diagonal':
      const diagonal = document.createElement('div');
      diagonal.className = 'diagonal-wipe';
      diagonal.style.background = color;
      overlay.appendChild(diagonal);
      return diagonal;
      
    case 'bubble':
      const bubble = document.createElement('div');
      bubble.className = 'bubble-reveal';
      bubble.style.background = color;
      overlay.appendChild(bubble);
      return bubble;
      
    case 'split':
      const split = document.createElement('div');
      split.className = 'split-transition horizontal';
      split.innerHTML = `
        <div class="split-half" style="background: ${color}"></div>
        <div class="split-half" style="background: ${color}"></div>
      `;
      overlay.appendChild(split);
      return split;
      
    case 'wave':
      const wave = document.createElement('div');
      wave.className = 'wave-reveal';
      wave.style.background = color;
      overlay.appendChild(wave);
      return wave;
      
    default:
      return null;
  }
}

// Play transition animation
async function playTransition(type, color, isOut = false) {
  return new Promise((resolve) => {
    const element = createTransitionContent(type, color);
    if (!element) {
      resolve();
      return;
    }
    
    requestAnimationFrame(() => {
      element.classList.add(isOut ? 'animate-out' : 'animate');
      
      const durations = {
        tiles: isOut ? 600 : 1000,
        diagonal: isOut ? 700 : 1200,
        bubble: isOut ? 700 : 1200,
        split: isOut ? 500 : 800,
        wave: isOut ? 700 : 1200
      };
      
      setTimeout(() => {
        if (isOut) {
          document.getElementById('transitionOverlay').innerHTML = '';
        }
        resolve();
      }, durations[type] || 500);
    });
  });
}
