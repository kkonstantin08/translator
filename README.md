# LinguaPop AI

AI-powered English ↔ Russian translation Chromium extension.

## Features

- **Selected text translation** — auto-popup for single words with dictionary-style data, floating action button for phrases
- **Keyboard shortcuts** — `Alt+T` to translate selection, `Ctrl+Shift+L` to open popup
- **Toolbar popup** — manual translation with language and model selection, dark/light theme
- **Settings page** — configure Mistral API key, model, fallback providers, exclusions, theme
- **Text-to-speech** — pronounce original and translated text using browser Web Speech API
- **Mistral model selection** — choose between Small, Medium, and Large models
- **Translation cache** — automatic caching for 24 hours to save API tokens
- **Fallback translation providers** — optional LibreTranslate or Chrome built-in support
- **Context menu** — right-click any selected text to translate
- **Experimental page translation** — translate all visible text on a page (MVP)
- **Dark theme** — system-aware dark mode with manual toggle

## Tech Stack

- Manifest V3
- TypeScript
- Vite
- React (popup and options UI)
- Plain DOM + Shadow DOM (content script)
- Web Speech API
- `chrome.storage`

## Development Setup

```bash
npm install
npm run build
```

## Loading Unpacked Extension

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the `dist` folder

## Basic Usage

1. Select a **single word** on any webpage to see an automatic dictionary popup
2. Select a **phrase** and click the floating **Перевести** button
3. Click the extension icon to open the popup translator
4. Right-click selected text and choose **Перевести выделенное**
5. Press **Alt+T** to instantly translate selected text
6. Open **Настройки** to add your Mistral API key

## Keyboard Shortcuts

| Shortcut       | Action                          |
| -------------- | ------------------------------- |
| `Ctrl+Shift+L` | Open popup translator           |
| `Alt+T`        | Translate selected text on page |
| `Ctrl+Enter`   | Translate in popup              |
| `Escape`       | Close inline popup              |

## Privacy Note

Selected text is sent to the configured translation provider (Mistral API or external fallback) when you request a translation. Your API key is stored locally in `chrome.storage` and is never sent anywhere except to the Mistral API. Translations are cached locally for 24 hours.

## Permissions

| Permission                 | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `storage`                  | Save extension settings and translation cache locally |
| `activeTab`                | Interact with the current tab from the popup          |
| `contextMenus`             | Add "Перевести выделенное" to the right-click menu    |
| `https://api.mistral.ai/*` | Call the Mistral translation API                      |

## Known Limitations

- Experimental page translation may break layout on dynamic sites (SPA frameworks can overwrite translated text)
- Shadow DOM and iframe content is not translated by the page translation feature
- Chrome built-in translator fallback is limited (Chrome does not expose a full translation API to extensions)
- Very large pages may be slow or costly to translate

## Roadmap

- Improve page translation robustness for SPAs
- Add more fallback providers
- Support more language pairs
- Optional translation history (currently excluded by design)
