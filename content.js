// Content script for YouTube video interaction 🎬

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoInfo') {
    const videoInfo = getVideoInfo();
    sendResponse(videoInfo);
  }

  if (request.action === 'jumpToTimestamp') {
    jumpToTimestamp(request.timestamp);
    sendResponse({ success: true });
  }

  return true;
});

// Get current video information
function getVideoInfo() {
  const video = document.querySelector('video');
  const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer, h1.ytd-watch-metadata yt-formatted-string');
  
  if (!video) {
    return { error: 'No video found on this page' };
  }

  // Extract video ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');

  if (!videoId) {
    return { error: 'Not a YouTube video page' };
  }

  return {
    videoId: videoId,
    videoTitle: titleElement?.textContent?.trim() || 'Untitled Video',
    currentTime: Math.floor(video.currentTime),
    duration: Math.floor(video.duration)
  };
}

// Jump video to specific timestamp
function jumpToTimestamp(timestamp) {
  const video = document.querySelector('video');
  if (video) {
    video.currentTime = timestamp;
    video.play();
  }
}

// Add visual feedback when note is added
function showNoteFeedback() {
  const feedback = document.createElement('div');
  feedback.className = 'cute-notes-feedback';
  feedback.textContent = '✨ Note added!';
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.classList.add('fade-out');
    setTimeout(() => feedback.remove(), 300);
  }, 1500);
}

// Listen for note added event
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'noteAdded') {
    showNoteFeedback();
  }
});