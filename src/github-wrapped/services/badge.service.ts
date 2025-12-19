// Badge Generation Service
// Creates downloadable SVG badges with user stats

import { GitHubProfile, WrappedStats, LanguageStat, AchievementTitle } from '../types';

interface BadgeOptions {
    profile: GitHubProfile;
    stats: WrappedStats;
    topLanguage: LanguageStat | null;
    mainTitle: AchievementTitle | null;
    year: number;
}

export function generateBadgeSVG(options: BadgeOptions): string {
    const { profile, stats, topLanguage, mainTitle, year } = options;

    const title = mainTitle?.title || 'GitHub Developer';
    const titleIcon = mainTitle?.icon || '💻';
    const langName = topLanguage?.name || 'Code';
    const langColor = topLanguage?.color || '#858585';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="500" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f3460;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e94560;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f39c12;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="avatarClip">
      <circle cx="200" cy="100" r="60"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="400" height="500" fill="url(#bgGradient)" rx="20"/>
  
  <!-- Border glow -->
  <rect x="5" y="5" width="390" height="490" fill="none" stroke="url(#accentGradient)" stroke-width="2" rx="18" opacity="0.5"/>

  <!-- GitHub Wrapped Title -->
  <text x="200" y="35" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" font-weight="bold" opacity="0.8">
    ✨ GITHUB WRAPPED ${year} ✨
  </text>

  <!-- Avatar circle background -->
  <circle cx="200" cy="100" r="65" fill="url(#accentGradient)" opacity="0.3"/>
  <circle cx="200" cy="100" r="62" fill="#1a1a2e"/>
  
  <!-- Avatar placeholder (use image tag for actual avatar) -->
  <image href="${profile.avatarUrl}" x="140" y="40" width="120" height="120" clip-path="url(#avatarClip)"/>
  
  <!-- Username -->
  <text x="200" y="190" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="bold">
    @${profile.username}
  </text>

  <!-- Title/Achievement -->
  <text x="200" y="220" text-anchor="middle" fill="url(#accentGradient)" font-family="Arial, sans-serif" font-size="16" filter="url(#glow)">
    ${titleIcon} ${title}
  </text>

  <!-- Stats Container -->
  <rect x="30" y="250" width="340" height="180" fill="#ffffff" fill-opacity="0.05" rx="15"/>
  
  <!-- Stats Grid -->
  <!-- Total Commits -->
  <text x="115" y="290" text-anchor="middle" fill="#e94560" font-family="Arial, sans-serif" font-size="28" font-weight="bold">
    ${formatNumber(stats.totalCommits)}
  </text>
  <text x="115" y="310" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" opacity="0.7">
    Commits
  </text>

  <!-- PRs Merged -->
  <text x="285" y="290" text-anchor="middle" fill="#f39c12" font-family="Arial, sans-serif" font-size="28" font-weight="bold">
    ${formatNumber(stats.totalPRsMerged)}
  </text>
  <text x="285" y="310" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" opacity="0.7">
    PRs Merged
  </text>

  <!-- Longest Streak -->
  <text x="115" y="365" text-anchor="middle" fill="#00d2d3" font-family="Arial, sans-serif" font-size="28" font-weight="bold">
    ${stats.longestStreak}
  </text>
  <text x="115" y="385" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" opacity="0.7">
    Day Streak 🔥
  </text>

  <!-- Top Language -->
  <circle cx="250" cy="355" r="8" fill="${langColor}"/>
  <text x="285" y="365" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
    ${langName}
  </text>
  <text x="285" y="385" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" opacity="0.7">
    Top Language
  </text>

  <!-- Days Coded -->
  <text x="200" y="420" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" opacity="0.8">
    📅 Coded ${stats.daysCodedThisYear} days this year
  </text>

  <!-- Footer -->
  <text x="200" y="465" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" opacity="0.5">
    Generated with 💖 by GitHub Wrapped
  </text>
  
  <!-- Stars decoration -->
  <text x="30" y="475" fill="#ffffff" font-size="10" opacity="0.3">⭐</text>
  <text x="55" y="485" fill="#ffffff" font-size="8" opacity="0.2">✨</text>
  <text x="350" y="470" fill="#ffffff" font-size="10" opacity="0.3">⭐</text>
  <text x="370" y="480" fill="#ffffff" font-size="8" opacity="0.2">✨</text>
</svg>`;
}

function formatNumber(num: number): string {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export async function generateBadgeHTML(options: BadgeOptions): Promise<string> {
    const svg = generateBadgeSVG(options);
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
}

export const badgeService = {
    generateBadgeSVG,
    generateBadgeHTML,
};
