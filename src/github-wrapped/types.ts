// GitHub Wrapped Types

export interface GitHubProfile {
    username: string;
    avatarUrl: string;
    name: string | null;
    bio: string | null;
    company: string | null;
    location: string | null;
    joinDate: string;
    followers: number;
    following: number;
    publicRepos: number;
}

export interface ContributionDay {
    date: string;
    count: number;
    weekday: number;
}

export interface ContributionStats {
    totalCommits: number;
    totalPRs: number;
    totalPRsMerged: number;
    totalIssues: number;
    totalReviews: number;
    contributionDays: ContributionDay[];
}

export interface LanguageStat {
    name: string;
    percentage: number;
    color: string;
    bytes: number;
}

export interface Repository {
    name: string;
    fullName: string;
    description: string | null;
    stars: number;
    forks: number;
    language: string | null;
    commits: number;
    url: string;
    isPrivate: boolean;
}

export interface TimelineMonth {
    month: string;
    year: number;
    commits: number;
    prs: number;
    issues: number;
    highlights: string[];
}

export interface AchievementTitle {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface SquadMember {
    username: string;
    avatarUrl: string;
    sharedProjects: number;
    collaborationType: 'maintainer' | 'contributor' | 'reviewer';
}

export interface StreakData {
    longestStreak: number;
    longestStreakStart: string | null;
    longestStreakEnd: string | null;
    currentStreak: number;
}

export interface FunFacts {
    codingAge: number; // years since account creation
    predictedAge: number; // predicted "GitHub age" based on starred repos
    predictedAgeReason: string; // why we predicted this age
    oldestStarredRepoYear: number | null;
    oldestStarredRepoName: string | null;
    favoriteTimeOfDay: string; // "Night Owl (2AM-4AM)" etc.
    mostProductiveDay: string; // "Saturday"
    quote: string;
    roast: string; // Funny roast based on stats
}

export interface MusicTrack {
    title: string;
    artist: string;
    vibe: string;
}

export interface DayRecord {
    date: string;
    count: number;
}

export interface WrappedStats {
    totalCommits: number;
    totalPRs: number;
    totalPRsMerged: number;
    totalIssues: number;
    totalReviews: number;
    totalStars: number;
    longestStreak: number;
    currentStreak: number;
    mostCommitsDay: DayRecord;
    mostDiverseDay: { date: string; languages: string[] };
    daysCodedThisYear: number;
}

export interface WrappedData {
    username: string;
    year: number;
    status: 'processing' | 'completed' | 'failed';
    error?: string;
    generatedAt: string;

    profile: GitHubProfile;
    stats: WrappedStats;
    languages: LanguageStat[];
    topRepos: Repository[];
    timeline: TimelineMonth[];
    titles: AchievementTitle[];
    squad: SquadMember[];
    funFacts: FunFacts;
    streak: StreakData;
}

// API Request/Response types
export interface GenerateWrappedRequest {
    year?: number;
}

export interface WrappedStatusResponse {
    username: string;
    status: 'processing' | 'completed' | 'failed';
    progress?: number;
    error?: string;
}

// Event payload types
export interface FetchGitHubDataPayload {
    username: string;
    year: number;
    traceId: string;
}

export interface CalculateStatsPayload {
    username: string;
    year: number;
    traceId: string;
}

export interface GenerateAchievementsPayload {
    username: string;
    year: number;
    traceId: string;
}

export interface GenerateWrappedPayload {
    username: string;
    year: number;
    traceId: string;
}
