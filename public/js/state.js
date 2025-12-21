// Application state
let currentSlide = 0;
let totalSlides = 0;
let wrappedData = null;
let pollInterval = null;
let isInWrapped = false;
let autoPlayInterval = null;
let autoPlayTimeout = null;
let autoPlayEnabled = false;
let autoPlayDurations = [];
let totalAutoPlayDuration = 0;
let presentationStartTime = null;
let progressAnimationFrame = null;
let isTransitioning = false;

// Background music
const bgMusic = new Audio('/static/bg.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;
let isMusicPlaying = false;
