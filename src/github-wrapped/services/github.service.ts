// GitHub API Service
// Fetches data from GitHub REST/GraphQL APIs

import {
    GitHubProfile,
    ContributionDay,
    Repository,
    LanguageStat,
    SquadMember,
} from '../types'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql'

// Color mapping for popular languages
const LANGUAGE_COLORS: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Scala: '#c22d40',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Dart: '#00B4AB',
    Lua: '#000080',
    R: '#198CE7',
    MATLAB: '#e16737',
    Perl: '#0298c3',
    Haskell: '#5e5086',
    Elixir: '#6e4a7e',
    Clojure: '#db5855',
    Dockerfile: '#384d54',
    Makefile: '#427819',
}

function getLanguageColor(language: string): string {
    return LANGUAGE_COLORS[language] || '#858585'
}

function getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Wrapped-App',
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }
    return headers
}

async function handleRateLimit(response: Response): Promise<void> {
    if (response.status === 403) {
        const remaining = response.headers.get('X-RateLimit-Remaining')
        const resetTime = response.headers.get('X-RateLimit-Reset')
        
        if (remaining === '0' && resetTime) {
            const resetDate = new Date(parseInt(resetTime) * 1000)
            const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / 60000)
            throw new Error(`GitHub API rate limit exceeded. Resets in ${minutesUntilReset} minutes. Pass a GitHub token for higher limits.`)
        }
        throw new Error('GitHub API rate limit exceeded. Pass a GitHub token for higher limits (5000 req/hour vs 60).')
    }
}

export async function fetchUserProfile(
    username: string,
    token?: string
): Promise<GitHubProfile> {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
        headers: getHeaders(token),
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`User "${username}" not found on GitHub`)
        }
        await handleRateLimit(response)
        throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()

    return {
        username: data.login,
        avatarUrl: data.avatar_url,
        name: data.name,
        bio: data.bio,
        company: data.company,
        location: data.location,
        joinDate: data.created_at,
        followers: data.followers,
        following: data.following,
        publicRepos: data.public_repos,
    }
}

// Fetch contributions using Events API (no auth required, but limited to recent 90 days)
async function fetchContributionsFromEvents(
    username: string,
    year: number,
    token?: string
): Promise<ContributionDay[]> {
    const contributions: Map<string, number> = new Map()

    // Fetch multiple pages of events
    for (let page = 1; page <= 10; page++) {
        try {
            const response = await fetch(
                `${GITHUB_API_BASE}/users/${username}/events/public?per_page=100&page=${page}`,
                { headers: getHeaders(token) }
            )

            if (!response.ok) break

            const events = await response.json()
            if (events.length === 0) break

            for (const event of events) {
                const eventDate = new Date(event.created_at)
                if (eventDate.getFullYear() !== year) continue

                const dateKey = eventDate.toISOString().split('T')[0]

                // Count push events more heavily as they represent actual commits
                if (event.type === 'PushEvent') {
                    const commitCount = event.payload?.commits?.length || 1
                    contributions.set(dateKey, (contributions.get(dateKey) || 0) + commitCount)
                } else if (['PullRequestEvent', 'IssuesEvent', 'CreateEvent'].includes(event.type)) {
                    contributions.set(dateKey, (contributions.get(dateKey) || 0) + 1)
                }
            }
        } catch {
            break
        }
    }

    // Convert map to ContributionDay array
    const result: ContributionDay[] = []
    contributions.forEach((count, date) => {
        const d = new Date(date)
        result.push({
            date,
            count,
            weekday: d.getDay(),
        })
    })

    return result.sort((a, b) => a.date.localeCompare(b.date))
}

// Try GraphQL first, fallback to Events API
export async function fetchContributionData(
    username: string,
    year: number,
    token?: string
): Promise<ContributionDay[]> {
    // If we have a token, try GraphQL first (more accurate)
    if (token) {
        const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  weekday
                }
              }
            }
          }
        }
      }
    `

        const from = `${year}-01-01T00:00:00Z`
        const to = `${year}-12-31T23:59:59Z`

        try {
            const response = await fetch(GITHUB_GRAPHQL_API, {
                method: 'POST',
                headers: {
                    ...getHeaders(token),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: { username, from, to },
                }),
            })

            if (response.ok) {
                const result = await response.json()

                if (!result.errors && result.data?.user?.contributionsCollection?.contributionCalendar?.weeks) {
                    const weeks = result.data.user.contributionsCollection.contributionCalendar.weeks
                    const contributions: ContributionDay[] = []

                    for (const week of weeks) {
                        for (const day of week.contributionDays) {
                            contributions.push({
                                date: day.date,
                                count: day.contributionCount,
                                weekday: day.weekday,
                            })
                        }
                    }
                    return contributions
                }
            }
        } catch (error) {
            console.warn('GraphQL API failed, falling back to Events API')
        }
    }

    // Fallback: Use Events API (works without auth, but limited data)
    console.log('Using Events API fallback for contributions')
    return fetchContributionsFromEvents(username, year, token)
}

export async function fetchUserRepos(
    username: string,
    token?: string
): Promise<Repository[]> {
    const repos: Repository[] = []
    let page = 1
    const perPage = 100

    while (page <= 3) {
        const response = await fetch(
            `${GITHUB_API_BASE}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
            { headers: getHeaders(token) }
        )

        if (!response.ok) break

        const data = await response.json()
        if (data.length === 0) break

        for (const repo of data) {
            repos.push({
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                commits: 0,
                url: repo.html_url,
                isPrivate: repo.private,
            })
        }

        page++
    }

    return repos
}

export async function fetchLanguageStats(
    username: string,
    token?: string
): Promise<LanguageStat[]> {
    const repos = await fetchUserRepos(username, token)
    const languageBytes: Record<string, number> = {}

    // Aggregate language bytes from repos
    for (const repo of repos.slice(0, 20)) {
        try {
            const response = await fetch(
                `${GITHUB_API_BASE}/repos/${repo.fullName}/languages`,
                { headers: getHeaders(token) }
            )

            if (response.ok) {
                const languages = await response.json()
                for (const [lang, bytes] of Object.entries(languages)) {
                    languageBytes[lang] = (languageBytes[lang] || 0) + (bytes as number)
                }
            }
        } catch {
            // Skip on error
        }
    }

    const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0)

    const stats: LanguageStat[] = Object.entries(languageBytes)
        .map(([name, bytes]) => ({
            name,
            bytes,
            percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 1000) / 10 : 0,
            color: getLanguageColor(name),
        }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 10)

    return stats
}

export async function fetchPRStats(
    username: string,
    year: number,
    token?: string
): Promise<{ total: number; merged: number }> {
    const query = `author:${username} created:${year}-01-01..${year}-12-31 type:pr`

    const response = await fetch(
        `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
        { headers: getHeaders(token) }
    )

    if (!response.ok) {
        return { total: 0, merged: 0 }
    }

    const data = await response.json()
    const total = data.total_count || 0

    const mergedQuery = `author:${username} created:${year}-01-01..${year}-12-31 type:pr is:merged`

    const mergedResponse = await fetch(
        `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(mergedQuery)}&per_page=1`,
        { headers: getHeaders(token) }
    )

    const mergedData = await mergedResponse.json()
    const merged = mergedData.total_count || 0

    return { total, merged }
}

export async function fetchIssueStats(
    username: string,
    year: number,
    token?: string
): Promise<number> {
    const query = `author:${username} created:${year}-01-01..${year}-12-31 type:issue`

    const response = await fetch(
        `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
        { headers: getHeaders(token) }
    )

    if (!response.ok) {
        return 0
    }

    const data = await response.json()
    return data.total_count || 0
}

// Fetch total commits from search API
export async function fetchTotalCommits(
    username: string,
    year: number,
    token?: string
): Promise<number> {
    const query = `author:${username} committer-date:${year}-01-01..${year}-12-31`

    const response = await fetch(
        `${GITHUB_API_BASE}/search/commits?q=${encodeURIComponent(query)}&per_page=1`,
        {
            headers: {
                ...getHeaders(token),
                Accept: 'application/vnd.github.cloak-preview+json', // Required for commit search
            }
        }
    )

    if (!response.ok) {
        return 0
    }

    const data = await response.json()
    return data.total_count || 0
}

// Fetch repos the user has contributed to via merged PRs
export async function fetchContributedRepos(
    username: string,
    year: number,
    token?: string
): Promise<Repository[]> {
    const contributedRepos: Repository[] = []
    const seenRepos = new Set<string>()

    try {
        const prQuery = `author:${username} created:${year}-01-01..${year}-12-31 type:pr is:merged`
        const prResponse = await fetch(
            `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(prQuery)}&per_page=50`,
            { headers: getHeaders(token) }
        )

        if (prResponse.ok) {
            const prData = await prResponse.json()
            const prs = prData.items || []

            for (const pr of prs) {
                const repoUrl = pr.repository_url || ''
                const repoMatch = repoUrl.match(/repos\/([^/]+\/[^/]+)$/)

                if (repoMatch && !seenRepos.has(repoMatch[1])) {
                    const repoFullName = repoMatch[1]
                    seenRepos.add(repoFullName)

                    // Fetch repo details
                    try {
                        const repoResponse = await fetch(
                            `${GITHUB_API_BASE}/repos/${repoFullName}`,
                            { headers: getHeaders(token) }
                        )

                        if (repoResponse.ok) {
                            const repoData = await repoResponse.json()
                            // Only include repos not owned by the user
                            if (repoData.owner?.login !== username) {
                                contributedRepos.push({
                                    name: repoData.name,
                                    fullName: repoData.full_name,
                                    description: repoData.description,
                                    stars: repoData.stargazers_count,
                                    forks: repoData.forks_count,
                                    language: repoData.language,
                                    commits: 0,
                                    url: repoData.html_url,
                                    isPrivate: repoData.private,
                                })
                            }
                        }
                    } catch {
                        // Skip on error
                    }
                }
            }
        }
    } catch {
        // Skip on error
    }

    return contributedRepos
}

export async function fetchCollaborators(
    username: string,
    year: number,
    token?: string
): Promise<SquadMember[]> {
    const squadScores: Record<string, { 
        score: number
        avatar: string
        sharedProjects: number
        contributedTo: number
        collaborationType: 'maintainer' | 'contributor' | 'reviewer'
    }> = {}

    // 1. Get contributors on user's own repos
    const repos = await fetchUserRepos(username, token)
    for (const repo of repos.slice(0, 10)) {
        try {
            const response = await fetch(
                `${GITHUB_API_BASE}/repos/${repo.fullName}/contributors?per_page=10`,
                { headers: getHeaders(token) }
            )

            if (response.ok) {
                const contributors = await response.json()
                if (Array.isArray(contributors)) {
                    for (const contributor of contributors) {
                        if (contributor.login !== username) {
                            if (!squadScores[contributor.login]) {
                                squadScores[contributor.login] = {
                                    score: 0,
                                    avatar: contributor.avatar_url,
                                    sharedProjects: 0,
                                    contributedTo: 0,
                                    collaborationType: 'contributor',
                                }
                            }
                            squadScores[contributor.login].sharedProjects++
                            squadScores[contributor.login].score += 1 // 1 point per shared project
                        }
                    }
                }
            }
        } catch {
            // Skip on error
        }
    }

    // 2. Find repo owners the user has contributed to via PRs
    // AND find co-contributors (other people who contributed to the same repos)
    const contributedRepos: Set<string> = new Set()
    
    try {
        const prQuery = `author:${username} created:${year}-01-01..${year}-12-31 type:pr is:merged`
        const prResponse = await fetch(
            `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(prQuery)}&per_page=50`,
            { headers: getHeaders(token) }
        )

        if (prResponse.ok) {
            const prData = await prResponse.json()
            const prs = prData.items || []

            for (const pr of prs) {
                // Extract repo info from repository_url
                const repoUrl = pr.repository_url || ''
                const repoMatch = repoUrl.match(/repos\/([^/]+\/[^/]+)/)
                const ownerMatch = repoUrl.match(/repos\/([^/]+)\//)
                
                if (repoMatch) {
                    contributedRepos.add(repoMatch[1]) // Store full repo name for co-contributor lookup
                }
                
                if (ownerMatch) {
                    const repoOwner = ownerMatch[1]
                    if (repoOwner !== username) {
                        if (!squadScores[repoOwner]) {
                            // Fetch avatar for this user
                            try {
                                const userResponse = await fetch(
                                    `${GITHUB_API_BASE}/users/${repoOwner}`,
                                    { headers: getHeaders(token) }
                                )
                                if (userResponse.ok) {
                                    const userData = await userResponse.json()
                                    squadScores[repoOwner] = {
                                        score: 0,
                                        avatar: userData.avatar_url,
                                        sharedProjects: 0,
                                        contributedTo: 0,
                                        collaborationType: 'maintainer',
                                    }
                                }
                            } catch {
                                // Skip if can't fetch user
                                continue
                            }
                        }
                        if (squadScores[repoOwner]) {
                            squadScores[repoOwner].contributedTo++
                            squadScores[repoOwner].score += 3 // 3 points per PR contribution (higher weight!)
                            squadScores[repoOwner].collaborationType = 'maintainer'
                        }
                    }
                }
            }
        }
    } catch {
        // Skip PR analysis on error
    }

    // 3. Find co-contributors: other people who contributed to repos the user also contributed to
    for (const repoFullName of Array.from(contributedRepos).slice(0, 5)) {
        try {
            const response = await fetch(
                `${GITHUB_API_BASE}/repos/${repoFullName}/contributors?per_page=15`,
                { headers: getHeaders(token) }
            )

            if (response.ok) {
                const contributors = await response.json()
                if (Array.isArray(contributors)) {
                    for (const contributor of contributors) {
                        if (contributor.login !== username) {
                            if (!squadScores[contributor.login]) {
                                squadScores[contributor.login] = {
                                    score: 0,
                                    avatar: contributor.avatar_url,
                                    sharedProjects: 0,
                                    contributedTo: 0,
                                    collaborationType: 'contributor',
                                }
                            }
                            squadScores[contributor.login].sharedProjects++
                            squadScores[contributor.login].score += 2 // 2 points for co-contributor
                        }
                    }
                }
            }
        } catch {
            // Skip on error
        }
    }

    // Build squad sorted by score
    const squad: SquadMember[] = Object.entries(squadScores)
        .map(([login, data]) => ({
            username: login,
            avatarUrl: data.avatar,
            sharedProjects: data.sharedProjects + data.contributedTo,
            collaborationType: data.collaborationType,
        }))
        .sort((a, b) => {
            const scoreA = squadScores[a.username].score
            const scoreB = squadScores[b.username].score
            return scoreB - scoreA
        })
        .slice(0, 5)

    return squad
}

export interface StarredReposData {
    oldest: { name: string; year: number } | null;
    totalStarred: number;
    starredLanguages: string[];
    starredTopics: string[];
    predictedAge: number;
    ageReason: string;
}

export async function fetchStarredRepos(
    username: string,
    token?: string
): Promise<StarredReposData> {
    const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/starred?per_page=100&sort=created&direction=asc`,
        { headers: getHeaders(token) }
    )

    if (!response.ok) {
        return { 
            oldest: null, 
            totalStarred: 0, 
            starredLanguages: [], 
            starredTopics: [],
            predictedAge: 0,
            ageReason: 'Not enough data'
        }
    }

    const repos = await response.json()
    
    // Collect languages and topics from starred repos
    const languages: string[] = []
    const topics: string[] = []
    
    for (const repo of repos) {
        if (repo.language) languages.push(repo.language)
        if (repo.topics) topics.push(...repo.topics)
    }

    // Predict "GitHub age" based on what they star
    const { predictedAge, ageReason } = predictGitHubAge(languages, topics, repos)

    if (repos.length > 0) {
        const oldest = repos[0]
        const year = new Date(oldest.created_at).getFullYear()
        return {
            oldest: { name: oldest.full_name, year },
            totalStarred: repos.length,
            starredLanguages: [...new Set(languages)],
            starredTopics: [...new Set(topics)],
            predictedAge,
            ageReason,
        }
    }

    return { 
        oldest: null, 
        totalStarred: repos.length,
        starredLanguages: [...new Set(languages)],
        starredTopics: [...new Set(topics)],
        predictedAge,
        ageReason,
    }
}

interface RepoWithDate {
    created_at?: string
    pushed_at?: string
    language?: string
    topics?: string[]
    stargazers_count?: number
    forks_count?: number
}

// Predict how old someone "feels" based on their tech taste and interests
// This is meant to be fun and relatable - like a personality quiz
function predictGitHubAge(languages: string[], topics: string[], repos: unknown[]): { predictedAge: number; ageReason: string } {
    const currentYear = new Date().getFullYear()
    const typedRepos = repos as RepoWithDate[]
    
    // Start at age 25 (neutral developer age)
    let age = 25
    let reason = ''

    const langCounts = languages.reduce((acc, l) => {
        acc[l] = (acc[l] || 0) + 1
        return acc
    }, {} as Record<string, number>)
    
    const topicSet = new Set(topics.map(t => t.toLowerCase()))

    // === REPO CREATION DATES - When were the repos you star created? ===
    const repoYears = typedRepos.filter(r => r.created_at).map(r => new Date(r.created_at!).getFullYear())
    
    if (repoYears.length > 0) {
        const oldestYear = Math.min(...repoYears)
        const avgYear = Math.round(repoYears.reduce((a, b) => a + b, 0) / repoYears.length)
        
        // Starring very old repos = old soul
        if (oldestYear <= 2009) {
            age += 25
            reason = `You star repos from ${oldestYear}... mass respect 🧓`
        } else if (oldestYear <= 2012) {
            age += 15
            reason = `Repos from ${oldestYear}? You've seen things.`
        } else if (oldestYear <= 2015) {
            age += 8
            reason = `Your oldest starred repo is from ${oldestYear}`
        } else if (oldestYear >= 2023) {
            age -= 8
            reason = `Only stars fresh repos (${oldestYear}+) - zoomer energy`
        }

        // Average repo age
        const avgAge = currentYear - avgYear
        if (avgAge > 10 && !reason) {
            age += 12
            reason = `Avg starred repo is ${avgAge} years old - vintage taste`
        } else if (avgAge < 2 && !reason) {
            age -= 5
            reason = `Chasing the new hotness (avg repo < 2 years old)`
        }
    }

    // === LANGUAGE VIBES ===
    // Boomer languages
    if (langCounts['COBOL'] || langCounts['Fortran'] || langCounts['Pascal']) {
        age += 30
        if (!reason) reason = `COBOL/Fortran? Are you a time traveler? 👴`
    }
    if (langCounts['Perl']) {
        age += 15
        if (!reason) reason = `Perl lover - you've seen the regex wars`
    }
    if (langCounts['PHP'] && langCounts['PHP'] > 5) {
        age += 10
        if (!reason) reason = `Heavy PHP energy - WordPress flashbacks?`
    }
    
    // Millennial languages
    if (langCounts['Ruby'] && langCounts['Ruby'] > 3) {
        age += 5
        if (!reason) reason = `Ruby fan - 2010 called, they want their gems back`
    }
    if (langCounts['Java'] && langCounts['Java'] > 5) {
        age += 8
        if (!reason) reason = `Java enthusiast - enterprise soul`
    }
    if (langCounts['Objective-C']) {
        age += 10
        if (!reason) reason = `Objective-C? Pre-Swift iOS veteran`
    }

    // Zoomer/modern languages
    if (langCounts['Zig'] || langCounts['Gleam'] || langCounts['Mojo']) {
        age -= 10
        if (!reason) reason = `${langCounts['Zig'] ? 'Zig' : langCounts['Gleam'] ? 'Gleam' : 'Mojo'}? Bleeding edge zoomer`
    }
    if (langCounts['Rust'] && langCounts['Rust'] > 5) {
        age -= 3
        if (!reason) reason = `Rust evangelist energy 🦀`
    }
    if (langCounts['TypeScript'] && langCounts['TypeScript'] > 10) {
        age -= 2
        if (!reason) reason = `TypeScript maximalist`
    }

    // === TOPIC VIBES ===
    // Old school
    if (topicSet.has('vim') || topicSet.has('emacs')) {
        age += 12
        if (!reason) reason = `${topicSet.has('vim') ? 'Vim' : 'Emacs'} user - a person of culture`
    }
    if (topicSet.has('jquery')) {
        age += 15
        if (!reason) reason = `jQuery in 2024? Respect the classics 📜`
    }
    if (topicSet.has('xml') || topicSet.has('soap')) {
        age += 18
        if (!reason) reason = `XML/SOAP enthusiast - enterprise PTSD`
    }

    // Modern/trendy
    if (topicSet.has('web3') || topicSet.has('blockchain') || topicSet.has('nft')) {
        age -= 5
        if (!reason) reason = `Web3 interests - wagmi energy`
    }
    if (topicSet.has('ai') || topicSet.has('llm') || topicSet.has('gpt') || topicSet.has('machine-learning')) {
        age -= 3
        if (!reason) reason = `AI/ML hypetrain passenger 🚂`
    }
    if (topicSet.has('tiktok') || topicSet.has('discord-bot')) {
        age -= 8
        if (!reason) reason = `TikTok/Discord era developer`
    }

    // Neutral/timeless
    if (topicSet.has('linux') || topicSet.has('kernel')) {
        age += 5
        if (!reason) reason = `Linux/kernel interest - respects the foundations`
    }

    // === STAR COUNT VIBES ===
    if (repos.length > 500) {
        age += 8
        if (!reason) reason = `${repos.length} starred repos - you've been around`
    } else if (repos.length < 5) {
        age -= 5
        if (!reason) reason = `Minimalist starrer - just got here?`
    }

    // Clamp between 16 and 70
    age = Math.max(16, Math.min(70, age))
    
    if (!reason) {
        reason = repos.length > 0 ? `Based on your ${repos.length} starred repos` : `Not enough data to judge you 😅`
    }

    return { predictedAge: age, ageReason: reason }
}

export const githubService = {
    fetchUserProfile,
    fetchContributionData,
    fetchUserRepos,
    fetchLanguageStats,
    fetchPRStats,
    fetchIssueStats,
    fetchTotalCommits,
    fetchContributedRepos,
    fetchCollaborators,
    fetchStarredRepos,
}
