// Cute YouTube Coding Notes Companion - Popup Logic 🌸

// DOM Elements
const videoTitleEl = document.getElementById('videoTitle');
const currentTimeEl = document.getElementById('currentTime');
const noteInputEl = document.getElementById('noteInput');
const codeToggleEl = document.getElementById('codeToggle');
const addNoteBtnEl = document.getElementById('addNoteBtn');
const notesListEl = document.getElementById('notesList');
const exportBtnEl = document.getElementById('exportBtn');
const clearBtnEl = document.getElementById('clearBtn');
const toastEl = document.getElementById('toast');

// State
let currentVideoInfo = null;
let isCodeMode = false;
let notes = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await getVideoInfo();
  await loadNotes();
  setupEventListeners();
  startTimestampUpdate();
}

// Get video info from content script
async function getVideoInfo() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getVideoInfo' });
    
    if (response?.error) {
      videoTitleEl.textContent = response.error;
      disableControls(true);
      return;
    }
    
    if (response?.videoId) {
      currentVideoInfo = response;
      videoTitleEl.textContent = truncateText(response.videoTitle, 40);
      updateTimestampDisplay(response.currentTime);
      disableControls(false);
    }
  } catch (error) {
    videoTitleEl.textContent = 'Open a YouTube video to start!';
    disableControls(true);
  }
}

// Load notes from storage
async function loadNotes() {
  if (!currentVideoInfo?.videoId) return;
  
  const storageKey = `notes_${currentVideoInfo.videoId}`;
  const result = await chrome.storage.local.get(storageKey);
  notes = result[storageKey] || [];
  renderNotes();
}

// Save notes to storage
async function saveNotes() {
  if (!currentVideoInfo?.videoId) return;
  
  const storageKey = `notes_${currentVideoInfo.videoId}`;
  await chrome.storage.local.set({ [storageKey]: notes });
}

// Setup event listeners
function setupEventListeners() {
  // Toggle code mode
  codeToggleEl.addEventListener('click', () => {
    isCodeMode = !isCodeMode;
    codeToggleEl.classList.toggle('active', isCodeMode);
    noteInputEl.classList.toggle('code-mode', isCodeMode);
    noteInputEl.placeholder = isCodeMode 
      ? 'Paste your code here... 💻' 
      : 'Write your note here... ✏️';
  });

  // Add note
  addNoteBtnEl.addEventListener('click', addNote);
  
  // Add note on Ctrl+Enter
  noteInputEl.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      addNote();
    }
  });

  // Export notes
  exportBtnEl.addEventListener('click', exportNotes);

  // Clear all notes
  clearBtnEl.addEventListener('click', clearNotes);
}

// Add a new note
async function addNote() {
  const content = noteInputEl.value.trim();
  if (!content || !currentVideoInfo) return;

  // Get fresh timestamp
  await getVideoInfo();
  
  const note = {
    id: Date.now(),
    content,
    timestamp: currentVideoInfo.currentTime,
    isCode: isCodeMode,
    createdAt: new Date().toISOString()
  };

  notes.push(note);
  await saveNotes();
  renderNotes();
  
  // Clear input
  noteInputEl.value = '';
  
  // Notify content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'noteAdded' });
    }
  });
  
  showToast('Note added! ✨');
}

// Render notes list
function renderNotes() {
  if (notes.length === 0) {
    notesListEl.innerHTML = '<p class="empty-state">No notes yet! Start taking notes while watching 📚</p>';
    return;
  }

  // Sort by timestamp
  const sortedNotes = [...notes].sort((a, b) => a.timestamp - b.timestamp);

  notesListEl.innerHTML = sortedNotes.map(note => `
    <div class="note-card" data-id="${note.id}">
      <div class="note-header">
        <span class="note-timestamp" data-timestamp="${note.timestamp}">
          ⏱ ${formatTimestamp(note.timestamp)}
        </span>
        <div class="note-actions">
          ${note.isCode ? `<button class="icon-btn copy-btn" data-content="${escapeHtml(note.content)}">📋</button>` : ''}
          <button class="icon-btn delete-btn" data-id="${note.id}">🗑️</button>
        </div>
      </div>
      <div class="note-content ${note.isCode ? 'code' : ''}">${escapeHtml(note.content)}</div>
    </div>
  `).join('');

  // Add event listeners to note elements
  notesListEl.querySelectorAll('.note-timestamp').forEach(el => {
    el.addEventListener('click', () => jumpToTimestamp(parseInt(el.dataset.timestamp)));
  });

  notesListEl.querySelectorAll('.copy-btn').forEach(el => {
    el.addEventListener('click', () => copyToClipboard(el.dataset.content));
  });

  notesListEl.querySelectorAll('.delete-btn').forEach(el => {
    el.addEventListener('click', () => deleteNote(parseInt(el.dataset.id)));
  });
}

// Jump to timestamp in video
async function jumpToTimestamp(timestamp) {
  await chrome.runtime.sendMessage({ action: 'jumpToTimestamp', timestamp });
  showToast('Jumped to timestamp! ⏱');
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied! 📋');
  } catch (err) {
    showToast('Failed to copy 😢');
  }
}

// Delete a note
async function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);
  await saveNotes();
  renderNotes();
  showToast('Note deleted! 🗑️');
}

// Export notes to markdown
async function exportNotes() {
  if (notes.length === 0) {
    showToast('No notes to export! 📝');
    return;
  }

  const markdown = generateMarkdown();
  downloadFile(markdown, `notes-${sanitizeFilename(currentVideoInfo.videoTitle)}.md`);
  showToast('Notes saved! 🎉');
}

// Generate markdown content
function generateMarkdown() {
  let md = `# Notes – ${currentVideoInfo.videoTitle}\n\n`;
  
  const sortedNotes = [...notes].sort((a, b) => a.timestamp - b.timestamp);
  
  sortedNotes.forEach(note => {
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

// Download file
function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Clear all notes
async function clearNotes() {
  if (notes.length === 0) return;
  
  if (confirm('Are you sure you want to delete all notes? 🤔')) {
    notes = [];
    await saveNotes();
    renderNotes();
    showToast('All notes cleared! 🧹');
  }
}

// Update timestamp display periodically
function startTimestampUpdate() {
  setInterval(async () => {
    if (currentVideoInfo) {
      await getVideoInfo();
    }
  }, 1000);
}

// Update timestamp display
function updateTimestampDisplay(seconds) {
  currentTimeEl.textContent = formatTimestamp(seconds);
}

// Format seconds to mm:ss
function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Sanitize filename
function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 50);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show toast notification
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2000);
}

// Disable/enable controls
function disableControls(disabled) {
  addNoteBtnEl.disabled = disabled;
  exportBtnEl.disabled = disabled;
  clearBtnEl.disabled = disabled;
  noteInputEl.disabled = disabled;
  codeToggleEl.disabled = disabled;
}