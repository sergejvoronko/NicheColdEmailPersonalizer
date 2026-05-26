chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    // Basic scraping: get all text content from the body, excluding scripts and styles
    const bodyClone = document.body.cloneNode(true);
    const scripts = bodyClone.getElementsByTagName('script');
    const styles = bodyClone.getElementsByTagName('style');

    while (scripts.length > 0) scripts[0].parentNode.removeChild(scripts[0]);
    while (styles.length > 0) styles[0].parentNode.removeChild(styles[0]);

    const text = bodyClone.innerText || bodyClone.textContent;
    const cleanedText = text.replace(/\s+/g, ' ').trim();

    sendResponse({ data: cleanedText });
  }
  return true; // Keep the message channel open for async response
});
