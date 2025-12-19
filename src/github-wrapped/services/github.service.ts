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

export async function fetchCollaborators(
    username: string,
    token?: string
): Promise<SquadMember[]> {
    const repos = await fetchUserRepos(username, token)
    const collaboratorCounts: Record<string, { count: number; avatar: string }> = {}

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
                            if (!collaboratorCounts[contributor.login]) {
                                collaboratorCounts[contributor.login] = {
                                    count: 0,
                                    avatar: contributor.avatar_url,
                                }
                            }
                            collaboratorCounts[contributor.login].count++
                        }
                    }
                }
            }
        } catch {
            // Skip on error
        }
    }

    const squad: SquadMember[] = Object.entries(collaboratorCounts)
        .map(([login, data]) => ({
            username: login,
            avatarUrl: data.avatar,
            sharedProjects: data.count,
            collaborationType: 'contributor' as const,
        }))
        .sort((a, b) => b.sharedProjects - a.sharedProjects)
        .slice(0, 5)

    return squad
}

export async function fetchStarredRepos(
    username: string,
    token?: string
): Promise<{ oldest: { name: string; year: number } | null }> {
    const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/starred?per_page=100&sort=created&direction=asc`,
        { headers: getHeaders(token) }
    )

    if (!response.ok) {
        return { oldest: null }
    }

    const repos = await response.json()

    if (repos.length > 0) {
        const oldest = repos[0]
        const year = new Date(oldest.created_at).getFullYear()
        return {
            oldest: {
                name: oldest.full_name,
                year,
            },
        }
    }

    return { oldest: null }
}

export const githubService = {
    fetchUserProfile,
    fetchContributionData,
    fetchUserRepos,
    fetchLanguageStats,
    fetchPRStats,
    fetchIssueStats,
    fetchTotalCommits,
    fetchCollaborators,
    fetchStarredRepos,
}
