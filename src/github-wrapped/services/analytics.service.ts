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
    "Remember: it's not a bug, it's an undocumented feature",
    "Your keyboard needs a vacation",
    "Coffee.exe has stopped working",
    "404: Social life not found",
    "sudo touch grass",
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
    "Your git history is basically a diary of regrets",
    "You've mass-produced more TODOs than actual code",
    "Your README has more promises than your code delivers",
    "You've starred more repos than you've finished projects",
];

const CODING_AGE_ROASTS: Record<string, string[]> = {
    ancient: [
        "You've been coding since dinosaurs roamed the earth",
        "Your first commit was probably on punch cards",
        "You remember when JavaScript was just a twinkle in Brendan's eye",
        "You're basically a living fossil of the tech world",
    ],
    veteran: [
        "You've seen frameworks rise and fall like empires",
        "Your Stack Overflow account is old enough to vote",
        "You've survived more JavaScript framework wars than most",
    ],
    experienced: [
        "You've been around the block a few times",
        "You've accumulated enough tech debt to buy a house",
        "Your GitHub is entering its teenage years",
    ],
    young: [
        "Still fresh, but the burnout is coming",
        "You sweet summer child",
        "The imposter syndrome hasn't fully kicked in yet",
    ],
};

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
    year: number,
    totalCommitsFromSearch?: number
): TimelineMonth[] {
    const timeline: TimelineMonth[] = [];
    const monthData: Record<number, { commits: number; highlights: string[] }> = {};

    // Initialize all months
    for (let i = 0; i < 12; i++) {
        monthData[i] = { commits: 0, highlights: [] };
    }

    // Aggregate contributions by month from contribution days
    let totalFromContributions = 0;
    for (const day of contributions) {
        const date = new Date(day.date);
        if (date.getFullYear() === year) {
            const month = date.getMonth();
            monthData[month].commits += day.count;
            totalFromContributions += day.count;
        }
    }

    // If we have a more accurate total from search API, scale the monthly values
    if (totalCommitsFromSearch && totalCommitsFromSearch > 0 && totalFromContributions > 0) {
        const scaleFactor = totalCommitsFromSearch / totalFromContributions;
        for (let i = 0; i < 12; i++) {
            monthData[i].commits = Math.round(monthData[i].commits * scaleFactor);
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

    // Generate highlights and timeline
    for (let i = 0; i < 12; i++) {
        const highlights: string[] = [];

        if (i === maxMonth && maxCommits > 0) {
            highlights.push('Your most productive month! 🔥');
        }

        if (monthData[i].commits === 0) {
            highlights.push('Taking a break?');
        } else if (monthData[i].commits > 100) {
            highlights.push('Coding machine! 💪');
        } else if (monthData[i].commits > 50) {
            highlights.push('Solid month! 👍');
        }

        timeline.push({
            month: MONTH_NAMES[i],
            year,
            commits: monthData[i].commits,
            prs: 0,
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
    if (stats.totalCommits > 2000) {
        titles.push({
            id: 'commit-god',
            title: 'Commit God',
            description: `${stats.totalCommits}+ commits! Are you okay?`,
            icon: '🌟',
        });
    } else if (stats.totalCommits > 1000) {
        titles.push({
            id: 'commit-legend',
            title: 'Commit Legend',
            description: `${stats.totalCommits}+ commits this year!`,
            icon: '�',
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
    } else if (stats.totalCommits > 0) {
        titles.push({
            id: 'casual-coder',
            title: 'Casual Coder',
            description: 'Quality over quantity, right?',
            icon: '🌱',
        });
    }

    // Based on PRs
    if (stats.totalPRsMerged > 100) {
        titles.push({
            id: 'pr-overlord',
            title: 'PR Overlord',
            description: 'The ultimate merger of worlds',
            icon: '👑',
        });
    } else if (stats.totalPRsMerged > 50) {
        titles.push({
            id: 'pr-master',
            title: 'Pull Request Master',
            description: 'The merger of worlds',
            icon: '🎯',
        });
    } else if (stats.totalPRsMerged > 20) {
        titles.push({
            id: 'pr-warrior',
            title: 'PR Warrior',
            description: 'Fighting the good fight, one PR at a time',
            icon: '⚔️',
        });
    }

    // Based on issues
    if (stats.totalIssues > 50) {
        titles.push({
            id: 'issuer-supreme',
            title: 'Issuer Supreme',
            description: 'You found ALL the bugs',
            icon: '🐛',
        });
    } else if (stats.totalIssues > 20) {
        titles.push({
            id: 'bug-hunter',
            title: 'Bug Hunter',
            description: 'No bug escapes your watchful eye',
            icon: '🔍',
        });
    } else if (stats.totalIssues > 5) {
        titles.push({
            id: 'issuer',
            title: 'The Issuer',
            description: 'Reporting problems like a pro',
            icon: '📝',
        });
    }

    // Based on streak
    if (stats.longestStreak > 100) {
        titles.push({
            id: 'streak-immortal',
            title: 'Streak Immortal',
            description: `${stats.longestStreak} days! Do you even sleep?`,
            icon: '🔥',
        });
    } else if (stats.longestStreak > 30) {
        titles.push({
            id: 'streak-warrior',
            title: 'Streak Warrior',
            description: `${stats.longestStreak} days of pure dedication`,
            icon: '⚔️',
        });
    } else if (stats.longestStreak > 7) {
        titles.push({
            id: 'week-warrior',
            title: 'Week Warrior',
            description: 'A solid week of coding!',
            icon: '💪',
        });
    }

    // Based on languages
    if (languages.length >= 10) {
        titles.push({
            id: 'language-collector',
            title: 'Language Collector',
            description: `Fluent in ${languages.length} languages! Overachiever much?`,
            icon: '📚',
        });
    } else if (languages.length >= 5) {
        titles.push({
            id: 'polyglot',
            title: 'Polyglot Programmer',
            description: `Fluent in ${languages.length} languages`,
            icon: '🌍',
        });
    } else if (languages.length >= 3) {
        titles.push({
            id: 'trilingual',
            title: 'Trilingual Coder',
            description: 'Diversity is your strength',
            icon: '🗣️',
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
            'C': { title: 'C Veteran', icon: '🎖️' },
            Ruby: { title: 'Ruby Royalty', icon: '💎' },
            PHP: { title: 'PHP Warrior', icon: '🐘' },
            Swift: { title: 'Swift Ninja', icon: '🍎' },
            Kotlin: { title: 'Kotlin Knight', icon: '🤖' },
            Shell: { title: 'Shell Wizard', icon: '🧙' },
            HTML: { title: 'HTML Hero', icon: '🌐' },
            CSS: { title: 'CSS Sorcerer', icon: '🎨' },
            Vue: { title: 'Vue Virtuoso', icon: '💚' },
            Dart: { title: 'Dart Master', icon: '🎯' },
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
    if (stats.daysCodedThisYear > 350) {
        titles.push({
            id: 'no-life',
            title: 'No Life Achievement',
            description: 'You coded almost every single day',
            icon: '🏠',
        });
    } else if (stats.daysCodedThisYear > 300) {
        titles.push({
            id: 'code-everyday',
            title: 'Code Every Day',
            description: 'You basically live on GitHub',
            icon: '🏠',
        });
    } else if (stats.daysCodedThisYear > 200) {
        titles.push({
            id: 'dedicated-dev',
            title: 'Dedicated Developer',
            description: 'More than half the year spent coding',
            icon: '💻',
        });
    }

    // Based on stars
    if (stats.totalStars > 1000) {
        titles.push({
            id: 'star-collector',
            title: 'Star Collector',
            description: 'Your repos are famous!',
            icon: '⭐',
        });
    } else if (stats.totalStars > 100) {
        titles.push({
            id: 'rising-star',
            title: 'Rising Star',
            description: 'People are noticing your work',
            icon: '🌟',
        });
    }

    // Weekend warrior
    if (stats.mostCommitsDay && new Date(stats.mostCommitsDay.date).getDay() === 0 || 
        stats.mostCommitsDay && new Date(stats.mostCommitsDay.date).getDay() === 6) {
        titles.push({
            id: 'weekend-warrior',
            title: 'Weekend Warrior',
            description: 'Your best day was on a weekend!',
            icon: '🎮',
        });
    }

    return titles;
}

export function generateFunFacts(
    codingAge: number,
    oldestStarredRepo: { name: string; year: number } | null,
    predictedAge: number,
    predictedAgeReason: string,
    contributions: ContributionDay[]
): FunFacts {
    // Most productive day of week (this IS accurate - calculated from contribution data)
    const mostProductiveDay = calculateMostProductiveWeekday(contributions);

    // Favorite time - we can't determine this accurately without fetching individual commits
    // GitHub contribution API only provides dates, not times
    const favoriteTimeOfDay = 'Unknown';

    // Random quote
    const quote = CODER_QUOTES[Math.floor(Math.random() * CODER_QUOTES.length)];

    // Age-based roast (use predicted age for more fun)
    let ageCategory: string;
    if (predictedAge >= 50) {
        ageCategory = 'ancient';
    } else if (predictedAge >= 35) {
        ageCategory = 'veteran';
    } else if (predictedAge >= 25) {
        ageCategory = 'experienced';
    } else {
        ageCategory = 'young';
    }

    const ageRoasts = CODING_AGE_ROASTS[ageCategory];
    const ageRoast = ageRoasts[Math.floor(Math.random() * ageRoasts.length)];

    // Combine with general roast
    const generalRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    const roast = Math.random() > 0.5 ? ageRoast : generalRoast;

    return {
        codingAge,
        predictedAge,
        predictedAgeReason,
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
    repos: Repository[],
    totalCommitsFromSearch?: number
): WrappedStats {
    // Use search API total if available (more accurate), otherwise sum from contributions
    const totalCommits = totalCommitsFromSearch || contributions.reduce((sum, day) => sum + day.count, 0);
    const streak = calculateStreak(contributions);
    const mostCommitsDay = calculateMostActiveDay(contributions);
    const daysCodedThisYear = calculateDaysCodedThisYear(contributions);
    const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);

    // Calculate most diverse day (day with most different repo languages)
    const repoLanguages = repos
        .filter(r => r.language)
        .map(r => r.language as string);
    const uniqueLanguages = [...new Set(repoLanguages)];

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
        mostDiverseDay: { 
            date: mostCommitsDay.date, 
            languages: uniqueLanguages.slice(0, 5) 
        },
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
