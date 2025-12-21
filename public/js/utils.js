// Utility functions

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function calculatePercentile(value, type) {
  const thresholds = {
    commits: [
      { max: 50, percentile: 70 },
      { max: 100, percentile: 50 },
      { max: 300, percentile: 30 },
      { max: 500, percentile: 20 },
      { max: 1000, percentile: 10 },
      { max: 2000, percentile: 5 },
      { max: Infinity, percentile: 1 }
    ]
  };

  const ranges = thresholds[type] || thresholds.commits;
  for (const range of ranges) {
    if (value <= range.max) {
      return range.percentile.toFixed(2);
    }
  }
  return '1.00';
}

function getCommitVerdict(commits) {
  if (commits === 0) return `You <span class="highlight-box">didn't commit at all</span>... time to start!`;
  if (commits < 10) return `You <span class="highlight-box">barely committed</span> this year`;
  if (commits < 50) return `You committed <span class="highlight-box">a little bit</span>`;
  if (commits < 100) return `You committed <span class="highlight-box">a decent amount</span>`;
  if (commits < 300) return `You committed <span class="highlight-box">quite a bit</span>!`;
  if (commits < 500) return `You committed <span class="highlight-box">a lot</span>!`;
  if (commits < 1000) return `You committed <span class="highlight-box">A LOT</span>!`;
  if (commits < 2000) return `You're a <span class="highlight-box">commit machine</span>!`;
  return `You're absolutely <span class="highlight-box">CRACKED</span>!`;
}
