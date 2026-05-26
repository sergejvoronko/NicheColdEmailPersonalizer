// Placeholder URL - Replace this with your actual Cloudflare Worker URL
const WORKER_URL = 'https://niche-email-worker.airbrushden.workers.dev';

document.getElementById('generateBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const resultContainer = document.getElementById('resultContainer');
  const emailResult = document.getElementById('emailResult');
  
  status.textContent = 'Scraping content from page...';
  resultContainer.classList.add('hidden');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) {
    status.textContent = 'Error: No active tab found.';
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, async (response) => {
    if (chrome.runtime.lastError) {
      status.textContent = 'Error: ' + chrome.runtime.lastError.message;
      return;
    }
    
    if (response && response.data) {
      status.textContent = 'Connecting to AI Worker...';
      
      try {
        const fetchResponse = await fetch(WORKER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profileText: response.data }),
        });
        
        if (!fetchResponse.ok) {
          throw new Error(`Worker returned ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        const result = await fetchResponse.json();
        
        if (result.email) {
          status.textContent = 'Generation complete!';
          emailResult.value = result.email;
          resultContainer.classList.remove('hidden');
        } else {
          status.textContent = 'Error: ' + (result.error || 'The worker did not return an email.');
        }
      } catch (error) {
        status.textContent = 'Worker Error: ' + error.message;
        console.error('Fetch error:', error);
      }
    } else {
      status.textContent = 'No profile content detected. Are you on a profile page?';
    }
  });
});

// Copy to Clipboard Functionality
document.getElementById('copyBtn').addEventListener('click', async () => {
  const emailResult = document.getElementById('emailResult');
  const copyBtn = document.getElementById('copyBtn');
  
  try {
    await navigator.clipboard.writeText(emailResult.value);
    
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    copyBtn.classList.replace('bg-green-500', 'bg-green-700');
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.replace('bg-green-700', 'bg-green-500');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy!', err);
    // Fallback for older browsers
    emailResult.select();
    document.execCommand('copy');
  }
});
