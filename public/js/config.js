// Configuration constants
const API_BASE = 'http://localhost:3000';

// Theme colors for dot pattern
const themeColors = {
  green: '#00ff87',
  pink: '#ff5caa',
  cyan: '#00ffd5',
  yellow: '#ffd93d',
  purple: '#a855f7'
};

// Creative transition types for each slide (only diagonal and split)
const transitionTypes = [
  'none',       // Slide 0: Landing (no transition needed)
  'diagonal',   // Slide 1: Commits
  'split',      // Slide 2: Repos
  'diagonal',   // Slide 3: Languages
  'split',      // Slide 4: Streak
  'diagonal',   // Slide 5: Fun Facts
  'split',      // Slide 6: Timeline
  'diagonal',   // Slide 7: Squad
  'split',      // Slide 8: Wisdom
  'diagonal'    // Slide 9: Summary
];

// Auto-play configuration
const AUTO_PLAY_BASE_DELAY = 5000; // base buffer after reveals, before transition
const REVEAL_STEP_DELAY = 1000;    // per-element delay in sequential reveal
