# LinguaPop AI

LinguaPop AI is a Chromium extension for English-Russian translation powered by Mistral, with inline translation popups, phrase translation, a toolbar translator, and configurable fallback providers.

## Features

- **Single-word translation** with a dictionary-style popup
- **Phrase translation** with a floating action button near the selection
- **Toolbar popup translator** with manual input
- **Settings page** for API key, model, theme, exclusions, and fallback providers
- **Text-to-speech** using the browser Web Speech API
- **Mistral model selection** for Small, Medium, and Large models
- **24-hour local translation cache**
- **Fallback providers** including LibreTranslate and Chrome built-in translation
- **Context menu translation**
- **Experimental full-page translation**
- **Light and dark theme support**

## Tech Stack

- Chrome Extension Manifest V3
- TypeScript
- Vite
- React for popup and options pages
- Plain DOM plus Shadow DOM for the content script
- Web Speech API
- `chrome.storage`

## Development

```bash
npm install
npm run build
```

## Load the Unpacked Extension

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the `dist` directory

## Usage

1. Select a **single word** on any page to open the inline dictionary popup
2. Select a **phrase** and click the floating translate button
3. Click the extension icon to open the toolbar translator
4. Right-click selected text and choose **Translate selection**
5. Press `Alt+T` to translate the current selection instantly
6. Open **Settings** and add your Mistral API key

## Keyboard Shortcuts

| Shortcut       | Action                          |
| -------------- | ------------------------------- |
| `Ctrl+Shift+L` | Open the popup translator       |
| `Alt+T`        | Translate selected text on page |
| `Ctrl+Enter`   | Translate text in the popup     |
| `Escape`       | Close the inline popup          |

## Privacy

Selected text is sent to the configured translation provider only when you request a translation. The Mistral API key is stored locally in `chrome.storage` and is only used for requests to the Mistral API. Translations are cached locally for 24 hours.

## Permissions

| Permission                 | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `storage`                  | Store settings and translation cache locally |
| `activeTab`                | Interact with the current tab from the popup |
| `contextMenus`             | Add a translate action to the right-click menu |
| `https://api.mistral.ai/*` | Send translation requests to the Mistral API |

## Known Limitations

- Experimental page translation may break layout on dynamic pages
- Shadow DOM and iframe content are not translated by the page translation feature
- Chrome built-in translation fallback is limited
- Very large pages may be slower or more expensive to translate

## Roadmap

- Improve full-page translation reliability
- Add more fallback providers
- Support more language pairs
- Add optional translation history
