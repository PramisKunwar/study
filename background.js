// Background service worker for Cute YouTube Coding Notes Companion 🌸

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoInfo') {
    // Forward request to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getVideoInfo' }, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ error: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'jumpToTimestamp') {
    // Forward jump request to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'jumpToTimestamp',
          timestamp: request.timestamp
        }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true;
  }

  if (request.action === 'exportNotes') {
    // Handle export - create and download markdown file
    const { notes, videoTitle } = request;
    const markdown = generateMarkdown(notes, videoTitle);
    
    // Send markdown back to popup for download
    sendResponse({ markdown, filename: `notes-${sanitizeFilename(videoTitle)}.md` });
    return true;
  }
});

// Generate markdown from notes
function generateMarkdown(notes, videoTitle) {
  let md = `# Notes – ${videoTitle}\n\n`;
  
  notes.sort((a, b) => a.timestamp - b.timestamp);
  
  notes.forEach(note => {
    const timeStr = formatTimestamp(note.timestamp);
    md += `## ⏱ ${timeStr}\n`;
    
    if (note.isCode) {
      md += `\`\`\`js\n${note.content}\n\`\`\`\n\n`;
    } else {
      md += `${note.content}\n\n`;
    }
  });
  
  return md;
}

// Format seconds to mm:ss
function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Sanitize filename
function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 50);
}