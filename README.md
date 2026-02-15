#  Cute YouTube Coding Notes Companion 🌸

A cozy Chrome extension that helps students take **timestamped notes** while watching YouTube coding tutorials.

##  Features

- **📝 Timestamped Notes** - Capture notes with the exact video timestamp
- **💻 Code Mode** - Toggle code mode for syntax-friendly note formatting
- **⏱ Jump to Timestamp** - Click any timestamp to jump back to that moment
- **📋 Copy Code** - One-click copy for code snippets
- **📄 Export to Markdown** - Export all notes as a beautiful `.md` file
- **💾 Auto-Save** - Notes are saved locally per video

##  Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `chrome-extension` folder
6. The extension icon will appear in your toolbar! 🎉

##  How to Use

1. **Open any YouTube video** with a coding tutorial
2. **Click the extension icon** in your toolbar
3. **Watch and learn!** When you want to save a note:
   - Type your note in the textarea
   - Toggle **Code Mode** if you're saving code
   - Click **Add Note ✨**
4. **Click timestamps** to jump back to important moments
5. **Export your notes** when done studying

##  Design Philosophy

This extension is designed to be:

-  **Simple** - No overwhelming features
-  **Focused** - Just notes, nothing else
-  **Cozy** - Like a study buddy

## 📁 Project Structure

```
chrome-extension/
├── manifest.json        
├── background.js        
├── content.js          
├── content-styles.css  
├── popup/
│   ├── popup.html      
│   ├── popup.css      
│   └── popup.js        
├── icons/
│   ├── icon16.svg
│   ├── icon32.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md
```

##  Privacy

- ✅ All notes stored **locally** on your device
- ✅ **No accounts** required
- ✅ **No data collection**
- ✅ **No external APIs**

## 🛠 Technical Details

- **Manifest Version:** 3
- **Permissions:** `storage`, `activeTab`, `scripting`
- **Storage:** `chrome.storage.local`

##  Made with Love

This is a beginner-friendly student project designed to help you learn better while watching coding tutorials.

Happy studying! 📚✨