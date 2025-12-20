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
<svg width="420" height="550" viewBox="0 0 420 550" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#161b22;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#21262d;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e94560;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f39c12;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#a371f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#58a6ff;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <clipPath id="avatarClip">
      <circle cx="210" cy="110" r="55"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="420" height="550" fill="url(#bgGradient)" rx="24"/>
  
  <!-- Animated border effect -->
  <rect x="4" y="4" width="412" height="542" fill="none" stroke="url(#accentGradient)" stroke-width="2" rx="22" opacity="0.6"/>
  <rect x="8" y="8" width="404" height="534" fill="none" stroke="url(#purpleGradient)" stroke-width="1" rx="20" opacity="0.3"/>

  <!-- GitHub Wrapped Title -->
  <text x="210" y="38" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="15" font-weight="bold" letter-spacing="2">
    ✨ GITHUB WRAPPED ${year} ✨
  </text>

  <!-- Avatar glow ring -->
  <circle cx="210" cy="110" r="62" fill="none" stroke="url(#accentGradient)" stroke-width="3" opacity="0.5" filter="url(#glow)"/>
  <circle cx="210" cy="110" r="58" fill="#161b22"/>
  
  <!-- Avatar -->
  <image href="${profile.avatarUrl}" x="155" y="55" width="110" height="110" clip-path="url(#avatarClip)" filter="url(#shadow)"/>
  
  <!-- Username -->
  <text x="210" y="195" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
    @${profile.username}
  </text>

  <!-- Title/Achievement Badge -->
  <rect x="80" y="210" width="260" height="36" fill="url(#accentGradient)" rx="18" opacity="0.2"/>
  <rect x="81" y="211" width="258" height="34" fill="none" stroke="url(#accentGradient)" stroke-width="1" rx="17"/>
  <text x="210" y="234" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="15" font-weight="600">
    ${titleIcon} ${title}
  </text>

  <!-- Stats Container -->
  <rect x="25" y="265" width="370" height="200" fill="#ffffff" fill-opacity="0.03" rx="16"/>
  <rect x="25" y="265" width="370" height="200" fill="none" stroke="#30363d" stroke-width="1" rx="16"/>
  
  <!-- Stats Grid - Row 1 -->
  <text x="117" y="310" text-anchor="middle" fill="#e94560" font-family="Arial, sans-serif" font-size="32" font-weight="bold">
    ${formatNumber(stats.totalCommits)}
  </text>
  <text x="117" y="332" text-anchor="middle" fill="#8b949e" font-family="Arial, sans-serif" font-size="12">
    Commits
  </text>

  <text x="303" y="310" text-anchor="middle" fill="#f39c12" font-family="Arial, sans-serif" font-size="32" font-weight="bold">
    ${formatNumber(stats.totalPRsMerged)}
  </text>
  <text x="303" y="332" text-anchor="middle" fill="#8b949e" font-family="Arial, sans-serif" font-size="12">
    PRs Merged
  </text>

  <!-- Stats Grid - Row 2 -->
  <text x="117" y="390" text-anchor="middle" fill="#00d2d3" font-family="Arial, sans-serif" font-size="32" font-weight="bold">
    ${stats.longestStreak}
  </text>
  <text x="117" y="412" text-anchor="middle" fill="#8b949e" font-family="Arial, sans-serif" font-size="12">
    🔥 Day Streak
  </text>

  <!-- Top Language with color dot -->
  <circle cx="260" cy="380" r="10" fill="${langColor}"/>
  <text x="303" y="390" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="bold">
    ${langName}
  </text>
  <text x="303" y="412" text-anchor="middle" fill="#8b949e" font-family="Arial, sans-serif" font-size="12">
    Top Language
  </text>

  <!-- Days Coded Banner -->
  <rect x="25" y="440" width="370" height="40" fill="url(#purpleGradient)" rx="10" opacity="0.15"/>
  <text x="210" y="466" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" font-weight="500">
    📅 Coded ${stats.daysCodedThisYear} days • ⭐ ${formatNumber(stats.totalStars)} stars earned
  </text>

  <!-- Footer -->
  <text x="210" y="510" text-anchor="middle" fill="#8b949e" font-family="Arial, sans-serif" font-size="11">
    Generated with 💖 by GitHub Wrapped
  </text>
  
  <!-- Decorative elements -->
  <circle cx="30" cy="530" r="3" fill="#e94560" opacity="0.5"/>
  <circle cx="45" cy="535" r="2" fill="#f39c12" opacity="0.4"/>
  <circle cx="390" cy="530" r="3" fill="#58a6ff" opacity="0.5"/>
  <circle cx="375" cy="535" r="2" fill="#a371f7" opacity="0.4"/>
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
