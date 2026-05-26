const WORKER_URL = 'https://niche-email-worker.workers.dev';

document.getElementById('generateBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const resultContainer = document.getElementById('resultContainer');
  const emailResult = document.getElementById('emailResult');
  
  status.textContent = 'Scraping content...';
  resultContainer.classList.add('hidden');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, async (response) => {
      if (chrome.runtime.lastError) {
        status.textContent = 'Error: ' + chrome.runtime.lastError.message;
        return;
      }
      
      if (response && response.data) {
        status.textContent = 'Generating email...';
        
        try {
          const fetchResponse = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profileText: response.data }),
          });
          
          const result = await fetchResponse.json();
          
          if (result.email) {
            status.textContent = 'Email generated!';
            emailResult.value = result.email;
            resultContainer.classList.remove('hidden');
          } else {
            status.textContent = 'Error: ' + (result.error || 'Failed to generate email');
          }
        } catch (error) {
          status.textContent = 'Error connecting to worker: ' + error.message;
        }
      } else {
        status.textContent = 'No content found on page.';
      }
    });
  }
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const emailResult = document.getElementById('emailResult');
  emailResult.select();
  document.execCommand('copy');
  
  const copyBtn = document.getElementById('copyBtn');
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = originalText;
  }, 2000);
});
