document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    console.log('searchInput:', searchInput);
    const highlightBtn = document.getElementById('highlightBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
  
    async function injectScript() {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {
        console.log('Script already injected');
      }
    }
  
    async function sendMessage(action, data = {}) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      try {
        await chrome.tabs.sendMessage(tab.id, { action, data });
      } catch (e) {
        console.error('Error sending message:', e);
        // If message fails, try injecting the script again
        await injectScript();
        await chrome.tabs.sendMessage(tab.id, { action, data });
      }
    }
  
    highlightBtn.addEventListener('click', async () => {
      const searchText = searchInput.value;
      await injectScript();
      console.log('Highlighting:', searchText);
      sendMessage('highlight', { searchText });
    });
  
    prevBtn.addEventListener('click', async () => {
      await injectScript();
      sendMessage('navigate', { direction: 'prev' });
    });
  
    nextBtn.addEventListener('click', async () => {
      await injectScript();
      sendMessage('navigate', { direction: 'next' });
    });
  });
  