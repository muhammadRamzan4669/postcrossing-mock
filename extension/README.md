# PostCrossing Tab Sorter - Firefox Extension

A Firefox extension that automatically sorts your PostCrossing tabs by postcard number, making it easy to manage multiple postcards when browsing the PostCrossing website.

## Features

- 🔄 **Smart Sorting**: Automatically sorts tabs by the numeric part of postcard codes (e.g., CL-34269, CN-4087990, US-11797804)
- 🖱️ **Easy Access**: Click the toolbar button or use keyboard shortcut `Alt+Shift+S`
- 📌 **Respects Pinned Tabs**: Pinned tabs stay in place at the beginning
- 🎯 **Context Menu**: Right-click anywhere to access sorting option
- 📊 **Live Feedback**: Popup shows how many PostCrossing tabs will be sorted

## Installation

### Load Temporarily (Development/Testing)

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on..."**
3. Navigate to this folder and select `manifest.json`
4. The extension will appear in your toolbar

### Permanent Installation

To install permanently, you'll need to:
1. Package the extension as a `.xpi` file
2. Submit to Mozilla Add-ons for review, or
3. Sign it yourself through Mozilla's developer tools

## Usage

### Quick Start

1. Open several PostCrossing postcard pages in different tabs
2. Click the **PostCrossing Tab Sorter** button in your toolbar
3. Watch your tabs get organized by postcard number!

### Testing the Extension

1. Open the `test-tabs.html` file in Firefox
2. Right-click on the postcard links and select "Open link in new tab"
3. Open them in random order to shuffle your tabs
4. Use the extension to sort them

### Keyboard Shortcut

Press `Alt + Shift + S` to sort tabs without clicking the toolbar button.

### Context Menu

Right-click on any page and select "Sort PostCrossing Tabs by Number" from the context menu.

## How It Works

The extension:

1. **Scans Tab Titles**: Looks for postcard codes in the format `XX-######` (where XX is a country code and # are digits)
2. **Extracts Numbers**: Pulls out the numeric part of each postcard code
3. **Sorts Intelligently**:
   - PostCrossing tabs are sorted by number (ascending)
   - When numbers are equal, sorts by country code alphabetically
   - Non-PostCrossing tabs remain at the end in their original order
   - Pinned tabs are never moved

### Example Sorting

**Before sorting:**
- US-11797804 (tab 1)
- Regular webpage (tab 2)
- CL-34269 (tab 3)
- CN-4087990 (tab 4)
- Another webpage (tab 5)

**After sorting:**
- CL-34269 (tab 1) ← sorted by number
- CN-4087990 (tab 2) ← sorted by number
- US-11797804 (tab 3) ← sorted by number
- Regular webpage (tab 4) ← preserved order
- Another webpage (tab 5) ← preserved order

## Supported Postcard Formats

The extension recognizes these postcard code patterns:
- `CL-34269` (Chile)
- `CN-4087990` (China)
- `US-11797804` (United States)
- `DE-123456` (Germany)
- Any format matching `[A-Z]{2}-[0-9]+`

## Permissions Explained

The extension requests these permissions:

- **`tabs`**: Required to read tab titles and rearrange tab order
- **`contextMenus`**: Adds the right-click menu option for easy access

## Troubleshooting

### Extension Not Working

1. **Check Firefox Version**: Requires Firefox 109 or newer
2. **Reload Extension**: Go to `about:debugging` and reload the extension
3. **Check Tab Titles**: Ensure PostCrossing tabs have postcard codes in their titles
4. **Enable Debug Mode**: Edit `background.js` and set `DEBUG = true` for console logs

### No Tabs Being Sorted

- Make sure you have PostCrossing tabs open with recognizable postcard codes
- Check that the postcard codes are in the tab titles (not just the URL)
- Verify the codes match the pattern: two letters, hyphen, then numbers

### Keyboard Shortcut Not Working

- Check if another extension is using `Alt+Shift+S`
- You can change the shortcut in Firefox's extension settings

## Development

### File Structure

```
extension/
├── manifest.json      # Extension configuration
├── background.js      # Main sorting logic (service worker)
├── popup.html        # Toolbar button popup interface
├── popup.js          # Popup interaction logic
├── test-tabs.html    # Test page for development
└── README.md         # This file
```

### Key Components

- **Background Script**: Handles keyboard commands, context menus, and core sorting logic
- **Popup Interface**: Provides user-friendly button and status feedback
- **Manifest V3**: Uses modern Firefox extension APIs

### Making Changes

1. Edit the relevant files
2. Reload the extension at `about:debugging`
3. Test your changes
4. Use `DEBUG = true` in scripts for detailed logging

## Browser Compatibility

- **Firefox**: 109+ (Manifest V3 support)
- **Chrome/Edge**: Would need minor modifications for Chrome's extension API differences

## Privacy

This extension:
- ✅ Only accesses tab titles and positions
- ✅ Runs locally - no data sent anywhere
- ✅ No tracking or analytics
- ✅ Open source - you can review all code

## License

This extension is provided for educational and personal use. Feel free to modify and distribute according to your needs.

## Version History

### v1.0.0
- Initial release
- Manifest V3 support
- Popup interface
- Keyboard shortcuts
- Context menu integration
- Smart sorting algorithm
