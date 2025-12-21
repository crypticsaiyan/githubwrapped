// Fullscreen functions

function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function toggleFullscreen() {
  if (isFullscreen()) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
}

function updateFullscreenButton() {
  const enterIcon = document.getElementById('fullscreenEnterIcon');
  const exitIcon = document.getElementById('fullscreenExitIcon');
  const btn = document.getElementById('fullscreenBtn');
  if (isFullscreen()) {
    enterIcon.style.display = 'none';
    exitIcon.style.display = 'block';
    btn.title = 'Exit Fullscreen';
  } else {
    enterIcon.style.display = 'block';
    exitIcon.style.display = 'none';
    btn.title = 'Enter Fullscreen';
  }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('msfullscreenchange', updateFullscreenButton);

// Background music toggle
function toggleBackgroundMusic() {
  const soundOnIcon = document.getElementById('soundOnIcon');
  const soundOffIcon = document.getElementById('soundOffIcon');
  
  if (isMusicPlaying) {
    bgMusic.pause();
    soundOnIcon.style.display = 'none';
    soundOffIcon.style.display = 'block';
  } else {
    bgMusic.play().catch(e => console.log('Audio play failed:', e));
    soundOnIcon.style.display = 'block';
    soundOffIcon.style.display = 'none';
  }
  isMusicPlaying = !isMusicPlaying;
}
