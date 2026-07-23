# LinguaPop AI 🌍✨

**LinguaPop AI** is a next-generation Chromium extension for seamless English ↔ Russian translation and writing assistance. Powered by leading AI models (OpenAI, Anthropic, Gemini, Mistral) and modern web technologies, it provides intelligent context-aware translation, text rewriting, and full-page localization without breaking your browsing experience.

## ✨ Key Features

* **🤖 Multi-LLM Support:** Choose your preferred AI provider! LinguaPop natively supports OpenAI (ChatGPT), Anthropic (Claude), Google (Gemini), and Mistral. Bring your own API keys.
* **⚡ Smart Fallback (Chrome Built-in AI):** If your primary API key runs out or the network drops, LinguaPop can automatically fall back to Chrome's local, built-in AI models (Nano) to ensure you never lose translation capabilities.
* **✍️ AI Writing Assistant:** Click the floating LinguaPop button inside any `<textarea>` or input field. Write in your native language, and the AI will rewrite it into perfect, native-sounding English (or another chosen language), instantly replacing the text right in the input box!
* **📖 Smart Dictionary (Single Word):** Highlight any word to instantly see a rich popup with alternatives, part of speech, pronunciation (IPA), and contextual examples.
* **📝 Contextual Phrase Translation:** Highlight sentences or paragraphs. The model translates them with high accuracy, preserving the original tone and Markdown formatting.
* **🌊 Waterfall Page Translation:** Translate entire web pages with a beautiful top-to-bottom streaming effect. The extension intelligently batches paragraphs and replaces them live as responses arrive.
* **⚙️ Advanced Customization:**
  * **Site Exceptions:** Configure a blacklist of domains where the Writing Assistant should not appear.
  * **Import / Export Settings:** Easily back up your API keys, preferences, and excluded sites to a JSON file and restore them anytime.
  * **Translation History:** Keep track of your original inputs and the AI-generated rewrites.
* **🗄️ Lightning-Fast LRU Cache:** 100% local `chrome.storage` caching mechanism. Repeated phrases load instantly (0ms) and save your API tokens.
* **🎨 Beautiful UI/UX:** Crafted with modern web standards, featuring Dark/Light mode support, fluid animations, and a non-intrusive Shadow DOM popup system.

---

## 🚀 Installation Guide

You can install LinguaPop AI in two ways: by downloading a pre-built release, or by building it from the source code.

### Option A: Install from Releases (Easiest)

1. Go to the [Releases](../../releases) page of this repository.
2. Download the latest `dist.zip` file.
3. Extract the ZIP file to a folder on your computer.
4. Open your Chromium-based browser (Chrome, Edge, Brave, etc.) and navigate to `chrome://extensions`.
5. Enable **Developer mode** (usually a toggle in the top right corner).
   
   ![Enable Developer Mode](placeholder-developer-mode.png)
   *(Placeholder: Screenshot showing the Developer mode toggle)*

6. Click **Load unpacked** and select the folder where you extracted `dist.zip`.

   ![Load Unpacked](placeholder-load-unpacked.png)
   *(Placeholder: Screenshot showing the Load Unpacked button and folder selection)*

### Option B: Build from Source (For Developers)

If you want to modify the code or build the latest version directly from the `master` branch:

**Prerequisites:**
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm or yarn

**Steps:**
1. Clone the repository:
   ```bash
   git clone https://github.com/kkonstantin08/translator.git
   cd translator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
   This will generate a `dist` folder in your project directory.
4. Load the `dist` folder into your browser:
   * Navigate to `chrome://extensions`
   * Enable **Developer mode**
   * Click **Load unpacked** and select the generated `dist` directory.

---

## ⚙️ Configuration & LLM Setup

To use LinguaPop, you need to configure your preferred AI provider in the settings.

1. Click on the LinguaPop extension icon in your browser toolbar to open the **Options Page**.
2. Navigate to the **"Провайдеры ИИ" (AI Providers)** tab.

   ![AI Providers Tab](placeholder-ai-providers-tab.png)
   *(Placeholder: Screenshot of the AI Providers settings tab)*

3. **Select your Active Provider:** Choose between OpenAI, Anthropic, Gemini, or Mistral.
4. **Enter your API Key:** Paste your API key(s) for the selected provider. You can enter multiple keys (one per line) for load balancing or rate-limit circumvention. The extension securely stores these locally.
5. **Select the Model:** Choose the specific model you want to use (e.g., `gpt-4o`, `claude-3-5-sonnet`, `gemini-1.5-pro`).
6. **Configure Fallback (Optional but Recommended):** In the "Fallback-переводчик" section, select "Chrome Built-in AI". If your primary API fails or you run out of credits, LinguaPop will automatically use Chrome's local Nano model to continue translating without interruption!

---

## ⌨️ How to Use

* **Read:** Highlight text on any website. A tiny LinguaPop action button will appear. Click it (or press `Alt+T`) to see the translation.
* **Write:** Focus any text input on the web (like a comment box, email client, or chat). Click the pink LinguaPop button in the corner to magically rewrite your draft into fluent English (or your selected language).
* **Full Page Translation:** Right-click anywhere on the page and select **Перевести страницу на русский (LinguaPop)** from the context menu.

### Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Alt + T` | Translate the currently selected text (or full page if nothing is selected) |
| `Ctrl/Cmd + Shift + L` | Open the manual popup translator in the toolbar |
| `Escape` | Close any active inline popups |

---

## 🔒 Privacy & Security

**Your data stays yours.** 
LinguaPop only sends the text you actively choose to translate (or the page content when explicitly requested) directly to the AI provider you configured. 

* API Keys are stored locally and securely in your browser's `chrome.storage`.
* The extension does not collect telemetry, analytics, or background tracking data.
* The translation cache is strictly local and uses an LRU (Least Recently Used) algorithm to prevent memory bloat.

---

## 🛠️ Tech Stack

* **Architecture:** Chrome Extension Manifest V3
* **Frontend:** React, TypeScript, Vite
* **Content Injection:** Vanilla TS + Shadow DOM (to completely isolate CSS and avoid website styling conflicts)
* **LLM Integration:** Direct API calls to multiple providers (OpenAI, Anthropic, Gemini, Mistral)
* **Storage:** `chrome.storage.local` and `chrome.storage.sync`
