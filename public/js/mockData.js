// Mock data for demo mode

function generateMockData(username) {
  return {
    username: username || 'demo_user',
    year: 2025,
    status: 'completed',
    generatedAt: new Date().toISOString(),
    profile: {
      username: username || 'demo_user',
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username || 'demo'}`,
      name: username ? username.charAt(0).toUpperCase() + username.slice(1) : 'Demo Developer',
      bio: 'A passionate developer exploring the world of code',
      company: 'OpenSource Inc',
      location: 'The Cloud',
      joinDate: '2020-01-15T00:00:00Z',
      followers: 1234,
      following: 567,
      publicRepos: 42
    },
    stats: {
      totalCommits: 847,
      totalPRs: 56,
      totalPRsMerged: 48,
      totalIssues: 23,
      totalReviews: 89,
      totalStars: 156,
      longestStreak: 42,
      currentStreak: 7,
      mostCommitsDay: { date: '2025-03-15', count: 28 },
      mostDiverseDay: { date: '2025-06-20', languages: ['TypeScript', 'Python', 'Go'] },
      daysCodedThisYear: 234
    },
    languages: [
      { name: 'TypeScript', percentage: 35.2, color: '#3178c6', bytes: 450000 },
      { name: 'Python', percentage: 24.8, color: '#3572A5', bytes: 320000 },
      { name: 'JavaScript', percentage: 18.5, color: '#f1e05a', bytes: 240000 },
      { name: 'Go', percentage: 12.1, color: '#00ADD8', bytes: 155000 },
      { name: 'Rust', percentage: 5.7, color: '#dea584', bytes: 73000 },
      { name: 'CSS', percentage: 3.7, color: '#563d7c', bytes: 48000 }
    ],
    topRepos: [
      { name: 'awesome-project', fullName: `${username}/awesome-project`, description: 'An awesome open source project that helps developers', stars: 234, forks: 45, language: 'TypeScript', commits: 156, url: '#', isPrivate: false },
      { name: 'cli-tool', fullName: `${username}/cli-tool`, description: 'A powerful CLI tool for automation', stars: 89, forks: 12, language: 'Go', commits: 78, url: '#', isPrivate: false },
      { name: 'web-app', fullName: `${username}/web-app`, description: 'Modern web application with React', stars: 56, forks: 8, language: 'JavaScript', commits: 234, url: '#', isPrivate: false }
    ],
    timeline: [
      { month: 'January', year: 2025, commits: 65, prs: 4, issues: 2, highlights: [] },
      { month: 'February', year: 2025, commits: 78, prs: 6, issues: 1, highlights: [] },
      { month: 'March', year: 2025, commits: 92, prs: 8, issues: 3, highlights: [] },
      { month: 'April', year: 2025, commits: 54, prs: 3, issues: 2, highlights: [] },
      { month: 'May', year: 2025, commits: 87, prs: 7, issues: 4, highlights: [] },
      { month: 'June', year: 2025, commits: 103, prs: 9, issues: 2, highlights: [] },
      { month: 'July', year: 2025, commits: 76, prs: 5, issues: 1, highlights: [] },
      { month: 'August', year: 2025, commits: 68, prs: 4, issues: 3, highlights: [] },
      { month: 'September', year: 2025, commits: 91, prs: 6, issues: 2, highlights: [] },
      { month: 'October', year: 2025, commits: 82, prs: 5, issues: 1, highlights: [] },
      { month: 'November', year: 2025, commits: 73, prs: 4, issues: 2, highlights: [] },
      { month: 'December', year: 2025, commits: 45, prs: 3, issues: 0, highlights: [] }
    ],
    titles: [
      { id: 'commit-master', title: 'Commit Master', description: '500+ commits this year', icon: '🔥' },
      { id: 'streak-lord', title: 'Streak Lord', description: '30+ day coding streak', icon: '⚡' },
      { id: 'polyglot', title: 'Polyglot', description: '5+ programming languages', icon: '🌐' },
      { id: 'open-sourcerer', title: 'Open Sourcerer', description: 'Active contributor', icon: '✨' }
    ],
    squad: [
      { username: 'alice_dev', avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice', sharedProjects: 5, collaborationType: 'contributor' },
      { username: 'bob_coder', avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=bob', sharedProjects: 3, collaborationType: 'reviewer' }
    ],
    funFacts: {
      codingAge: 4,
      predictedAge: 28,
      predictedAgeReason: 'TypeScript maximalist energy detected',
      oldestStarredRepoYear: 2018,
      oldestStarredRepoName: 'torvalds/linux',
      favoriteTimeOfDay: 'Night Owl (10PM-2AM)',
      mostProductiveDay: 'Wednesday',
      quote: 'Code is poetry',
      roast: 'You commit more on weekends than weekdays... work-life balance who?'
    },
    streak: {
      longestStreak: 42,
      longestStreakStart: '2025-02-01',
      longestStreakEnd: '2025-03-14',
      currentStreak: 7
    },
    contributionDays: generateMockContributionDays()
  };
}

function generateMockContributionDays() {
  const days = [];
  const startDate = new Date('2025-01-01');
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dayOfWeek = date.getDay();
    const weekOfYear = Math.floor(i / 7);
    const baseChance = 0.3 + Math.sin((weekOfYear / 52) * Math.PI) * 0.3;
    const weekendPenalty = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.5 : 1;
    const hasCommit = Math.random() < (baseChance * weekendPenalty);
    const count = hasCommit ? Math.floor(Math.random() * 12) + 1 : 0;
    days.push({
      date: date.toISOString().split('T')[0],
      count: count,
      weekday: dayOfWeek
    });
  }
  return days;
}
