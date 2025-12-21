// Display wrapped data

function displayWrapped(data) {
  // Commits
  setAnimatedCount('commitsNumber', data.stats.totalCommits);
  const commitVerdict = getCommitVerdict(data.stats.totalCommits);
  document.getElementById('commitsDescription').innerHTML = commitVerdict;

  // Generate Contribution Graph
  const contributionGraph = document.getElementById('contributionGraph');
  if (contributionGraph && data.contributionDays && data.contributionDays.length > 0) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let monthsHtml = '<div class="contribution-months">';
    months.forEach(m => { monthsHtml += `<span class="contribution-month">${m}</span>`; });
    monthsHtml += '</div>';
    
    const contributionMap = {};
    data.contributionDays.forEach(day => {
      contributionMap[day.date] = day.count;
    });
    
    const year = data.year || 2025;
    const startDate = new Date(`${year}-01-01`);
    const startDayOfWeek = startDate.getDay();
    
    let gridHtml = '';
    for (let day = 0; day < 7; day++) {
      gridHtml += '<div class="contribution-week">';
      for (let week = 0; week < 52; week++) {
        const daysFromStart = week * 7 + day - startDayOfWeek;
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + daysFromStart);
        const dateStr = cellDate.toISOString().split('T')[0];
        
        const count = contributionMap[dateStr] || 0;
        
        let level = 0;
        if (count >= 10) level = 4;
        else if (count >= 5) level = 3;
        else if (count >= 2) level = 2;
        else if (count >= 1) level = 1;
        
        gridHtml += `<div class="contribution-day level-${level}" title="${dateStr}: ${count} contributions"></div>`;
      }
      gridHtml += '</div>';
    }
    
    contributionGraph.innerHTML = monthsHtml + gridHtml;
  } else if (contributionGraph) {
    contributionGraph.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center;">No contribution data available</p>';
  }

  // Repos
  const reposContainer = document.getElementById('reposContainer');
  if (data.topRepos && data.topRepos.length > 0) {
    reposContainer.innerHTML = data.topRepos.slice(0, 3).map((repo, i) => `
      <div class="repo-card ${i === 0 ? 'featured' : ''}">
        <span class="repo-rank">#${i + 1}</span>
        <div class="repo-avatar">${repo.name.charAt(0).toUpperCase()}</div>
        <div class="repo-info">
          <div class="repo-name">${repo.name}</div>
          ${repo.description ? `<div class="repo-description">${repo.description.slice(0, 60)}${repo.description.length > 60 ? '...' : ''}</div>` : ''}
        </div>
        <div class="repo-stats">
          <div class="repo-stat">
            <div class="repo-stat-value">${repo.stars}</div>
            <div class="repo-stat-label">Stars</div>
          </div>
          <div class="repo-stat">
            <div class="repo-stat-value">${repo.forks}</div>
            <div class="repo-stat-label">Forks</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Languages
  const languagesGrid = document.getElementById('languagesGrid');
  if (data.languages && data.languages.length > 0) {
    languagesGrid.innerHTML = data.languages.slice(0, 6).map((lang, index) => `
      <div class="language-card" style="--lang-color: ${lang.color}; --lang-percent: ${lang.percentage}%;">
        <span class="language-rank">#${index + 1}</span>
        <div class="language-dot" style="background: ${lang.color}"></div>
        <div class="language-info">
          <span class="language-name">${lang.name}</span>
          <div class="language-stats">
            <div class="language-bar-container">
              <div class="language-bar" style="width: ${lang.percentage}%; background: ${lang.color};"></div>
            </div>
            <span class="language-percent">${lang.percentage}%</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Streak
  setAnimatedCount('streakNumber', data.stats.longestStreak);
  setAnimatedCount('streakDays', data.stats.longestStreak);
  setAnimatedCount('daysCodedNumber', data.stats.daysCodedThisYear);

  // Badges/Titles
  const achievementsGrid = document.getElementById('achievementsGrid');
  if (data.titles && data.titles.length > 0) {
    achievementsGrid.innerHTML = data.titles.slice(0, 6).map(title => `
      <div class="achievement-badge" title="${title.description}">
        <span class="achievement-icon">${title.icon}</span>
        <span>${title.title}</span>
      </div>
    `).join('');
  } else {
    achievementsGrid.innerHTML = '<p style="color: rgba(255,255,255,0.5)">No badges earned yet</p>';
  }

  // Fun Facts
  if (data.funFacts) {
    document.getElementById('codingAge').textContent = data.funFacts.codingAge || '?';
    document.getElementById('predictedAge').textContent = data.funFacts.predictedAge || '25';
    document.getElementById('predictedAgeReason').textContent = data.funFacts.predictedAgeReason || '';
    document.getElementById('oldestStarYear').textContent = data.funFacts.oldestStarredRepoYear || '?';
    document.getElementById('oldestStarName').textContent = data.funFacts.oldestStarredRepoName || 'unknown';
    document.getElementById('mostProductiveDay').textContent = data.funFacts.mostProductiveDay || '-';
    document.getElementById('roastText').textContent = data.funFacts.roast || 'You coded so much, even your terminal needs therapy.';
  }

  // Timeline
  const timelineContainer = document.getElementById('timelineContainer');
  if (data.timeline && data.timeline.length > 0) {
    const maxCommits = Math.max(...data.timeline.map(m => m.commits));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let peakMonth = data.timeline[0];
    data.timeline.forEach(m => {
      if (m.commits > peakMonth.commits) peakMonth = m;
    });
    
    timelineContainer.innerHTML = data.timeline.map((m, i) => {
      const height = maxCommits > 0 ? Math.max(10, (m.commits / maxCommits) * 120) : 10;
      return `
        <div class="timeline-bar" style="height: ${height}px;" title="${m.month}: ${m.commits} commits">
          <span class="timeline-bar-value">${m.commits}</span>
          <span class="timeline-bar-label">${months[i] || m.month.slice(0,3)}</span>
        </div>
      `;
    }).join('');
    
    document.getElementById('peakMonth').textContent = peakMonth.month;
    setAnimatedCount('peakCommits', peakMonth.commits);
  }

  // Squad
  const squadContainer = document.getElementById('squadContainer');
  if (data.squad && data.squad.length > 0) {
    squadContainer.innerHTML = data.squad.map(member => `
      <div class="squad-member">
        <div class="squad-avatar">
          ${member.avatarUrl ? `<img src="${member.avatarUrl}" alt="${member.username}">` : member.username.charAt(0).toUpperCase()}
        </div>
        <span class="squad-name">${member.username}</span>
        <span class="squad-role">${member.collaborationType || 'collaborator'}</span>
      </div>
    `).join('');
  } else {
    squadContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5)">No squad data available yet</p>';
  }

  // Wisdom
  const quotes = [
    { text: '"Touch some grass, dude."', author: '— The Universe' },
    { text: '"It works on my machine."', author: '— Every Developer' },
    { text: '"There are only 10 types of people..."', author: '— Ancient Binary Proverb' },
    { text: '"Real programmers count from 0."', author: '— Dijkstra, probably' },
    { text: '"Sleep is for the weak. Coffee is for the coders."', author: '— Your IDE' }
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('wiseQuote').textContent = data.funFacts?.quote 
    ? `"${data.funFacts.quote}"` 
    : randomQuote.text;
  document.getElementById('quoteAuthor').textContent = randomQuote.author;

  // Summary page stats
  setAnimatedCount('summaryCommits', data.stats.totalCommits);
  setAnimatedCount('summaryPRs', data.stats.totalPRs || 0);
  setAnimatedCount('summaryStreak', data.stats.longestStreak);
  setAnimatedCount('summaryStars', data.stats.totalStars || 0);
  setAnimatedCount('summaryLanguages', data.languages?.length || 0);
  setAnimatedCount('summaryAchievements', data.titles?.length || 0);
  document.getElementById('summaryTopLang').textContent = data.languages?.[0]?.name || '-';
  document.getElementById('summaryTopRepo').textContent = data.topRepos?.[0]?.name || '-';

  // Card
  document.getElementById('cardUsername').textContent = data.username || 'Developer';
  
  // Card level calculation
  const commits = data.stats.totalCommits || 0;
  const prs = data.stats.totalPRs || 0;
  const prsMerged = data.stats.totalPRsMerged || 0;
  const streak = data.stats.longestStreak || 0;
  const stars = data.stats.totalStars || 0;
  const issues = data.stats.totalIssues || 0;
  const languages = data.languages?.length || 0;
  const badges = data.titles?.length || 0;
  const accountAge = data.funFacts?.codingAge || 0;
  const daysActive = data.stats.daysCodedThisYear || 0;
  
  const commitXP = Math.floor(Math.log10(commits + 1) * 100);
  const prXP = prsMerged * 15 + (prs - prsMerged) * 5;
  const streakXP = Math.min(streak * 3, 300);
  const starXP = Math.floor(Math.log10(stars + 1) * 80);
  const issueXP = Math.min(issues * 5, 150);
  const langXP = Math.min(languages * 15, 150);
  const badgeXP = badges * 20;
  const ageXP = Math.min(accountAge * 25, 250);
  const consistencyXP = Math.floor((daysActive / 365) * 200);
  
  const totalXP = commitXP + prXP + streakXP + starXP + issueXP + langXP + badgeXP + ageXP + consistencyXP;
  const level = Math.max(1, Math.min(999, Math.floor(Math.sqrt(totalXP * 1.5) + 1)));
  document.getElementById('cardLevel').textContent = `LV. ${level}`;

  // Card stats
  document.getElementById('cardCommits').textContent = formatNumber(data.stats.totalCommits);
  document.getElementById('cardPRs').textContent = formatNumber(data.stats.totalPRs || 0);
  document.getElementById('cardStreak').textContent = formatNumber(data.stats.longestStreak);
  document.getElementById('cardStars').textContent = formatNumber(data.stats.totalStars || 0);
  document.getElementById('cardLanguages').textContent = formatNumber(data.languages?.length || 0);
  document.getElementById('cardAchievements').textContent = formatNumber(data.titles?.length || 0);
  document.getElementById('cardTopLang').textContent = data.languages?.[0]?.name || '-';
  document.getElementById('cardTopRepo').textContent = data.topRepos?.[0]?.name || '-';

  // Profile image
  if (data.profile?.avatarUrl) {
    const cardProfileImg = document.getElementById('cardProfileImg');
    cardProfileImg.src = data.profile.avatarUrl;
  }

  showWrappedUI();
  setTimeout(() => goToSlide(1), 300);
}
