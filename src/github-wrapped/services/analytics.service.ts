// Analytics Service
// Calculates derived statistics from raw GitHub data

import {
    ContributionDay,
    StreakData,
    AchievementTitle,
    FunFacts,
    TimelineMonth,
    WrappedStats,
    LanguageStat,
    Repository,
} from '../types';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CODER_QUOTES = [
    "Touch some grass dude 🌱",
    "Have you tried turning yourself off and on again?",
    "Your code works, but at what cost?",
    "Sleep is for people without deadlines",
    "Documentation? What's that?",
    "Works on my machine ¯\\_(ツ)_/¯",
    "console.log is a valid debugging strategy",
    "git push --force is a lifestyle choice",
    "The bug is a feature",
    "May your builds be ever green",
];

const ROASTS = [
    "You really said 'I'll fix it tomorrow' every day this year",
    "Your commit graph looks like a cry for help",
    "Even your IDE is tired of you",
    "You've got more abandoned projects than finished ones",
    "Your GitHub says 'developer', your code says 'learning'",
    "You commit more to GitHub than your relationships",
    "Your code has more bugs than a rainforest",
    "You probably google 'how to center a div' weekly",
];

export function calculateStreak(contributions: ContributionDay[]): StreakData {
    if (contributions.length === 0) {
        return {
            longestStreak: 0,
            longestStreakStart: null,
            longestStreakEnd: null,
            currentStreak: 0,
        };
    }

    // Sort by date
    const sorted = [...contributions].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let longestStreak = 0;
    let longestStreakStart: string | null = null;
    let longestStreakEnd: string | null = null;
    let currentStreak = 0;
    let streakStart: string | null = null;
    let tempStreak = 0;
    let tempStreakStart: string | null = null;

    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].count > 0) {
            if (tempStreak === 0) {
                tempStreakStart = sorted[i].date;
            }
            tempStreak++;

            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
                longestStreakStart = tempStreakStart;
                longestStreakEnd = sorted[i].date;
            }
        } else {
            tempStreak = 0;
            tempStreakStart = null;
        }
    }

    // Calculate current streak (from the end)
    for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].count > 0) {
            currentStreak++;
        } else {
            break;
        }
    }

    return {
        longestStreak,
        longestStreakStart,
        longestStreakEnd,
        currentStreak,
    };
}

export function calculateMostActiveDay(
    contributions: ContributionDay[]
): { date: string; count: number } {
    if (contributions.length === 0) {
        return { date: '', count: 0 };
    }

    const mostActive = contributions.reduce((max, day) =>
        day.count > max.count ? day : max
    );

    return { date: mostActive.date, count: mostActive.count };
}

export function calculateDaysCodedThisYear(contributions: ContributionDay[]): number {
    return contributions.filter(day => day.count > 0).length;
}

export function calculateMostProductiveWeekday(contributions: ContributionDay[]): string {
    const weekdayCounts: Record<number, number> = {};

    for (const day of contributions) {
        weekdayCounts[day.weekday] = (weekdayCounts[day.weekday] || 0) + day.count;
    }

    let maxDay = 0;
    let maxCount = 0;

    for (const [weekday, count] of Object.entries(weekdayCounts)) {
        if (count > maxCount) {
            maxCount = count;
            maxDay = parseInt(weekday);
        }
    }

    return DAY_NAMES[maxDay] || 'Unknown';
}

export function generateTimeline(
    contributions: ContributionDay[],
    year: number
): TimelineMonth[] {
    const timeline: TimelineMonth[] = [];
    const monthData: Record<number, { commits: number; highlights: string[] }> = {};

    // Initialize all months
    for (let i = 0; i < 12; i++) {
        monthData[i] = { commits: 0, highlights: [] };
    }

    // Aggregate contributions by month
    for (const day of contributions) {
        const date = new Date(day.date);
        if (date.getFullYear() === year) {
            const month = date.getMonth();
            monthData[month].commits += day.count;
        }
    }

    // Find the most active month
    let maxMonth = 0;
    let maxCommits = 0;
    for (const [month, data] of Object.entries(monthData)) {
        if (data.commits > maxCommits) {
            maxCommits = data.commits;
            maxMonth = parseInt(month);
        }
    }

    // Generate highlights
    for (let i = 0; i < 12; i++) {
        const highlights: string[] = [];

        if (i === maxMonth) {
            highlights.push('Your most productive month! 🔥');
        }

        if (monthData[i].commits === 0) {
            highlights.push('Taking a break?');
        } else if (monthData[i].commits > 100) {
            highlights.push('Coding machine! 💪');
        }

        timeline.push({
            month: MONTH_NAMES[i],
            year,
            commits: monthData[i].commits,
            prs: 0, // Would need separate data
            issues: 0,
            highlights,
        });
    }

    return timeline;
}

export function generateTitles(
    stats: WrappedStats,
    languages: LanguageStat[],
    repos: Repository[]
): AchievementTitle[] {
    const titles: AchievementTitle[] = [];

    // Based on commit count
    if (stats.totalCommits > 1000) {
        titles.push({
            id: 'commit-legend',
            title: 'Commit Legend',
            description: `${stats.totalCommits}+ commits this year!`,
            icon: '👑',
        });
    } else if (stats.totalCommits > 500) {
        titles.push({
            id: 'serial-committer',
            title: 'Serial Committer',
            description: 'Committing like there\'s no tomorrow',
            icon: '🔥',
        });
    } else if (stats.totalCommits > 100) {
        titles.push({
            id: 'loyal-committer',
            title: 'Loyal Committer',
            description: 'Consistent and dedicated',
            icon: '⭐',
        });
    }

    // Based on PRs
    if (stats.totalPRsMerged > 50) {
        titles.push({
            id: 'pr-master',
            title: 'Pull Request Master',
            description: 'The merger of worlds',
            icon: '🎯',
        });
    }

    // Based on streak
    if (stats.longestStreak > 30) {
        titles.push({
            id: 'streak-warrior',
            title: 'Streak Warrior',
            description: `${stats.longestStreak} days of pure dedication`,
            icon: '⚔️',
        });
    }

    // Based on languages
    if (languages.length >= 5) {
        titles.push({
            id: 'polyglot',
            title: 'Polyglot Programmer',
            description: `Fluent in ${languages.length} languages`,
            icon: '🌍',
        });
    }

    // Based on top language
    const topLang = languages[0];
    if (topLang) {
        const langTitles: Record<string, { title: string; icon: string }> = {
            JavaScript: { title: 'JavaScript Jedi', icon: '⚡' },
            TypeScript: { title: 'TypeScript Titan', icon: '💎' },
            Python: { title: 'Python Charmer', icon: '🐍' },
            Rust: { title: 'Rustacean', icon: '🦀' },
            Go: { title: 'Gopher', icon: '🐹' },
            Java: { title: 'Java Juggler', icon: '☕' },
            'C++': { title: 'C++ Champion', icon: '🏆' },
            Ruby: { title: 'Ruby Royalty', icon: '💎' },
        };

        const langTitle = langTitles[topLang.name];
        if (langTitle) {
            titles.push({
                id: `lang-${topLang.name.toLowerCase()}`,
                title: langTitle.title,
                description: `${topLang.percentage}% of your code is ${topLang.name}`,
                icon: langTitle.icon,
            });
        }
    }

    // Based on days coded
    if (stats.daysCodedThisYear > 300) {
        titles.push({
            id: 'code-everyday',
            title: 'Code Every Day',
            description: 'You basically live on GitHub',
            icon: '🏠',
        });
    }

    return titles;
}

export function generateFunFacts(
    codingAge: number,
    oldestStarredRepo: { name: string; year: number } | null,
    stats: WrappedStats,
    contributions: ContributionDay[]
): FunFacts {
    // Determine favorite time (mock - would need commit timestamps)
    const favoriteTimeOfDay = 'Night Owl (11PM - 2AM)'; // Placeholder

    // Most productive day of week
    const mostProductiveDay = calculateMostProductiveWeekday(contributions);

    // Random quote and roast
    const quote = CODER_QUOTES[Math.floor(Math.random() * CODER_QUOTES.length)];
    const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];

    return {
        codingAge,
        oldestStarredRepoYear: oldestStarredRepo?.year || null,
        oldestStarredRepoName: oldestStarredRepo?.name || null,
        favoriteTimeOfDay,
        mostProductiveDay,
        quote,
        roast,
    };
}

export function calculateTotalStats(
    contributions: ContributionDay[],
    prStats: { total: number; merged: number },
    issueCount: number,
    repos: Repository[]
): WrappedStats {
    const totalCommits = contributions.reduce((sum, day) => sum + day.count, 0);
    const streak = calculateStreak(contributions);
    const mostCommitsDay = calculateMostActiveDay(contributions);
    const daysCodedThisYear = calculateDaysCodedThisYear(contributions);
    const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);

    return {
        totalCommits,
        totalPRs: prStats.total,
        totalPRsMerged: prStats.merged,
        totalIssues: issueCount,
        totalReviews: 0, // Would need additional API call
        totalStars,
        longestStreak: streak.longestStreak,
        currentStreak: streak.currentStreak,
        mostCommitsDay,
        mostDiverseDay: { date: '', languages: [] }, // Would need per-commit language data
        daysCodedThisYear,
    };
}

export const analyticsService = {
    calculateStreak,
    calculateMostActiveDay,
    calculateDaysCodedThisYear,
    calculateMostProductiveWeekday,
    generateTimeline,
    generateTitles,
    generateFunFacts,
    calculateTotalStats,
};
