// API functions

async function generateWrapped() {
  const username = document.getElementById('usernameInput').value.trim();
  if (!username) { showError('Please enter a GitHub username'); return; }

  enterFullscreen();
  hideError();
  showLoading();

  try {
    const token = document.getElementById('tokenInput').value.trim();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/wrapped/${username}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ 
        year: new Date().getFullYear()
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to start generation');
    }

    pollStatus(username);
  } catch (error) {
    hideLoading(); showError(error.message);
  }
}

function pollStatus(username) {
  let attempts = 0;
  const maxAttempts = 60;

  pollInterval = setInterval(async () => {
    attempts++;
    try {
      const response = await fetch(`${API_BASE}/wrapped/${username}/status`);
      const data = await response.json();
      updateProgress(data.progress || Math.min(attempts * 5, 90));

      if (data.status === 'completed') {
        clearInterval(pollInterval);
        fetchWrappedData(username);
      } else if (data.status === 'failed') {
        clearInterval(pollInterval); hideLoading();
        showError(data.error || 'Generation failed');
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval); hideLoading();
        showError('Generation timed out. Please try again.');
      }
    } catch (error) {
      clearInterval(pollInterval); hideLoading();
      showError('Failed to check status');
    }
  }, 2000);
}

async function fetchWrappedData(username) {
  try {
    const response = await fetch(`${API_BASE}/wrapped/${username}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch data');
    }

    wrappedData = result.data;
    hideLoading();
    displayWrapped(wrappedData);
  } catch (error) {
    hideLoading(); showError(error.message);
  }
}
