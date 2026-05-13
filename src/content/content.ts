import type {
  WordTranslationResult,
  PhraseTranslationResult,
} from "../shared/types";

function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const handler = () => {
      resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

async function speak(
  text: string,
  lang: "en" | "ru" | "unknown",
): Promise<void> {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const voices = await ensureVoices();
  const utterance = new SpeechSynthesisUtterance(text);

  let preferredVoice: SpeechSynthesisVoice | undefined;

  if (lang === "ru") {
    preferredVoice =
      voices.find((voice) => voice.lang.startsWith("ru-RU")) ||
      voices.find((voice) => voice.lang.startsWith("ru"));
  } else if (lang === "en") {
    preferredVoice =
      voices.find((voice) => voice.lang.startsWith("en-US")) ||
      voices.find((voice) => voice.lang.startsWith("en-GB")) ||
      voices.find((voice) => voice.lang.startsWith("en"));
  }

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.rate = 0.9;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

const POPUP_CSS = `
:host {
  all: initial;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.lp-popup, .lp-fab {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.lp-popup {
  position: absolute;
  z-index: 2147483647;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(36,0,41,.18), 0 2px 8px rgba(36,0,41,.08);
  padding: 16px;
  max-width: 340px;
  max-height: 420px;
  overflow-y: auto;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #e8e0e8;
  box-sizing: border-box;
}
.lp-fab {
  position: absolute;
  z-index: 2147483646;
  background: #df37a7;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(223,55,167,.35);
  transition: transform .1s, background .15s;
  font-family: inherit;
}
.lp-fab:hover { background: #c42e92; transform: translateY(-1px); }
.lp-fab:active { transform: translateY(0); }
.lp-loading { color: #6d526d; font-size: 14px; padding: 8px 0; display: flex; align-items: center; gap: 10px; }
.lp-spinner {
  width: 16px; height: 16px;
  border: 2px solid #d4ccd4;
  border-top-color: #df37a7;
  border-radius: 50%;
  animation: lp-spin 0.8s linear infinite;
}
@keyframes lp-spin { to { transform: rotate(360deg); } }
.lp-close-btn {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: #a090a0;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}
.lp-close-btn:hover { color: #240029; background: #f5f0f5; }
.lp-word-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; padding-right: 20px; }
.lp-word { font-size: 18px; font-weight: 700; color: #240029; }
.lp-pos { font-size: 12px; color: #6d526d; text-transform: lowercase; background: #f5f0f5; padding: 2px 8px; border-radius: 10px; }
.lp-pronunciation { font-size: 13px; color: #6d526d; margin-bottom: 8px; font-style: italic; }
.lp-result-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; padding-right: 20px; }
.lp-main-translation { font-size: 16px; font-weight: 600; color: #df37a7; flex: 1; min-width: 0; }
.lp-phrase-translation { font-size: 15px; color: #333; line-height: 1.6; flex: 1; min-width: 0; }
.lp-icon-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.lp-icon-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d4ccd4;
  border-radius: 10px;
  background: #fff;
  color: #240029;
  cursor: pointer;
  transition: all .15s;
  padding: 0;
}
.lp-icon-btn svg { width: 16px; height: 16px; fill: currentColor; }
.lp-icon-btn:hover { background: #f8f0f8; border-color: #c4bcc4; transform: translateY(-1px); }
.lp-icon-btn:active { transform: translateY(0); }
.lp-icon-btn.is-copied { background: #ecfdf3; border-color: #86efac; color: #166534; }
.lp-alternatives { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.lp-alt { background: #f8f0f8; color: #6d526d; padding: 3px 10px; border-radius: 12px; font-size: 12px; border: 1px solid #ece5ec; }
.lp-examples { margin-bottom: 12px; }
.lp-example { padding: 8px 10px; background: #faf8fa; border-radius: 8px; margin-bottom: 6px; font-size: 13px; border-left: 3px solid #df37a7; }
.lp-example div:first-child { color: #333; margin-bottom: 2px; }
.lp-example div:last-child { color: #6d526d; }
.lp-actions { display: none; }
.lp-error { color: #ef4444; font-size: 14px; padding: 8px 0; }
.lp-divider { height: 1px; background: #ece5ec; margin: 10px 0; }
`;

let currentHost: HTMLElement | null = null;
let currentFab: HTMLElement | null = null;
let isTranslatingPage = false;
const originalTexts = new WeakMap<Text, string>();
const translatedNodes = new WeakSet<Text>();

const ICONS = {
  translate:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.87 15.07 11 13.2a4.7 4.7 0 0 0 .95-2.2h2.39v-2H7v2h2.86A6.7 6.7 0 0 1 7 15.3l1.4 1.4a8.7 8.7 0 0 0 3.18-2.53l1.7 1.7.59-1.8ZM17.5 10h-2l-4.5 12h2l1.12-3h4.76L20 22h2l-4.5-12Zm-2.56 7 1.44-4.33L17.82 17h-2.88Z"/></svg>',
  speak:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3Zm13.5 2a3.5 3.5 0 0 0-2.5-3.35v6.69A3.5 3.5 0 0 0 16.5 12Zm0-7.5v2.06A7 7 0 0 1 21 12a7 7 0 0 1-4.5 5.44v2.06A9 9 0 0 0 23 12a9 9 0 0 0-6.5-7.5Z"/></svg>',
  copy:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>',
} as const;

function createHost(): HTMLElement {
  const host = document.createElement("div");
  host.id = "linguapop-host";
  host.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;";
  document.body.appendChild(host);
  return host;
}

function getOrCreateShadowRoot(): ShadowRoot {
  if (currentHost) {
    const existing = document.getElementById("linguapop-host");
    if (existing && existing.shadowRoot) return existing.shadowRoot;
    existing?.remove();
  }
  currentHost = createHost();
  const shadow = currentHost.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = POPUP_CSS;
  shadow.appendChild(style);
  return shadow;
}

function hidePopup() {
  const host = document.getElementById("linguapop-host");
  if (host) {
    host.remove();
    currentHost = null;
  }
}

function hideFab() {
  if (currentFab) {
    currentFab.remove();
    currentFab = null;
  }
}

function hideAll() {
  hidePopup();
  hideFab();
}

function createPopupInShadow(): HTMLElement {
  const shadow = getOrCreateShadowRoot();
  const existing = shadow.querySelector(".lp-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.className = "lp-popup";
  shadow.appendChild(popup);
  makeDraggable(popup);
  return popup;
}

function positionPopup(
  popup: HTMLElement,
  rect: DOMRect,
  position: "above" | "below",
) {
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = rect.left + scrollX;
  let top: number;

  const popupRect = popup.getBoundingClientRect();
  const popupWidth = Math.min(popupRect.width || 340, 340);
  const popupHeight = popupRect.height || 200;

  if (position === "above") {
    top = rect.top + scrollY - popupHeight - 10;
    if (top < scrollY + 10) {
      top = rect.bottom + scrollY + 10;
    }
  } else {
    top = rect.bottom + scrollY + 10;
    if (top + popupHeight > scrollY + viewportHeight - 10) {
      top = rect.top + scrollY - popupHeight - 10;
    }
  }

  const maxLeft = scrollX + viewportWidth - popupWidth - 10;
  if (left > maxLeft) left = maxLeft;
  if (left < scrollX + 10) left = scrollX + 10;

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function makeDraggable(popup: HTMLElement) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  popup.addEventListener("mousedown", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(".lp-btn, .lp-close-btn")) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = parseFloat(popup.style.left) || 0;
    initialTop = parseFloat(popup.style.top) || 0;
    popup.style.cursor = "grabbing";
    popup.style.userSelect = "none";
    e.preventDefault();
  });

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    popup.style.left = `${initialLeft + dx}px`;
    popup.style.top = `${initialTop + dy}px`;
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    isDragging = false;
    popup.style.cursor = "default";
    popup.style.userSelect = "";
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function attachPopupListeners(popup: HTMLElement) {
  popup.querySelectorAll(".lp-close-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      hidePopup();
    });
  });

  popup.querySelectorAll(".lp-btn-speak").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const b = e.currentTarget as HTMLElement;
      speak(b.dataset.text || "", (b.dataset.lang as "en" | "ru") || "unknown");
    });
  });

  popup.querySelectorAll(".lp-btn-copy").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const b = e.currentTarget as HTMLElement;
      const text = b.dataset.text || "";
      navigator.clipboard.writeText(text).then(() => {
        b.textContent = "Скопировано";
        setTimeout(() => (b.textContent = "Копировать"), 1500);
      });
    });
  });
}

function attachPopupIconListeners(popup: HTMLElement) {
  popup.querySelectorAll(".lp-close-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      hidePopup();
    });
  });

  popup.querySelectorAll(".lp-icon-speak").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const button = e.currentTarget as HTMLElement;
      speak(
        button.dataset.text || "",
        (button.dataset.lang as "en" | "ru") || "unknown",
      );
    });
  });

  popup.querySelectorAll(".lp-icon-copy").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const button = e.currentTarget as HTMLElement;
      const text = button.dataset.text || "";
      navigator.clipboard.writeText(text).then(() => {
        button.classList.add("is-copied");
        button.setAttribute("title", "Copied");
        setTimeout(() => {
          button.classList.remove("is-copied");
          button.setAttribute("title", "Copy");
        }, 1200);
      });
    });
  });
}

function renderWordResult(
  popup: HTMLElement,
  result: WordTranslationResult,
  originalText: string,
) {
  const lang = result.detectedLanguage === "ru" ? "ru" : "en";
  const actionButtons = `
    <div class="lp-icon-actions">
      <button class="lp-icon-btn lp-icon-speak" type="button" title="Speak" data-text="${escapeHtml(originalText)}" data-lang="${lang}">${ICONS.speak}</button>
      <button class="lp-icon-btn lp-icon-copy" type="button" title="Copy" data-text="${escapeHtml(result.mainTranslation)}">${ICONS.copy}</button>
    </div>
  `;

  let html = `
    <button class="lp-close-btn" title="Закрыть">×</button>
    <div class="lp-word-header">
      <span class="lp-word">${escapeHtml(result.word)}</span>
      <span class="lp-pos">${escapeHtml(result.partOfSpeech)}</span>
    </div>
  `;
  if (result.pronunciation) {
    html += `<div class="lp-pronunciation">${escapeHtml(result.pronunciation)}</div>`;
  }
  html += `
    <div class="lp-result-header">
      <div class="lp-main-translation">${escapeHtml(result.mainTranslation)}</div>
      ${actionButtons}
    </div>
  `;

  if (result.alternatives && result.alternatives.length > 0) {
    html += `<div class="lp-alternatives">${result.alternatives.map((a) => `<span class="lp-alt">${escapeHtml(a)}</span>`).join("")}</div>`;
  }

  if (result.shortExamples && result.shortExamples.length > 0) {
    html += `<div class="lp-examples">`;
    for (const ex of result.shortExamples) {
      html += `<div class="lp-example"><div>${escapeHtml(ex.source)}</div><div>${escapeHtml(ex.translation)}</div></div>`;
    }
    html += `</div>`;
  }

  html += `
    <div class="lp-actions">
      <button class="lp-btn lp-btn-speak" data-text="${escapeHtml(originalText)}" data-lang="${lang}">Озвучить</button>
      <button class="lp-btn lp-btn-copy" data-text="${escapeHtml(result.mainTranslation)}">Копировать</button>
    </div>
  `;

  popup.innerHTML = html;
  attachPopupListeners(popup);
  attachPopupIconListeners(popup);
}

function renderPhraseResult(
  popup: HTMLElement,
  result: PhraseTranslationResult,
  originalText: string,
) {
  const lang = result.detectedLanguage === "ru" ? "ru" : "en";

  popup.innerHTML = `
    <button class="lp-close-btn" title="Закрыть">×</button>
    <div class="lp-result-header">
      <div class="lp-phrase-translation">${escapeHtml(result.translation)}</div>
      <div class="lp-icon-actions">
        <button class="lp-icon-btn lp-icon-speak" type="button" title="Speak" data-text="${escapeHtml(originalText)}" data-lang="${lang}">${ICONS.speak}</button>
        <button class="lp-icon-btn lp-icon-copy" type="button" title="Copy" data-text="${escapeHtml(result.translation)}">${ICONS.copy}</button>
      </div>
    </div>
    <div class="lp-actions">
      <button class="lp-btn lp-btn-speak" data-text="${escapeHtml(originalText)}" data-lang="${lang}">Озвучить</button>
      <button class="lp-btn lp-btn-copy" data-text="${escapeHtml(result.translation)}">Копировать</button>
    </div>
  `;

  attachPopupListeners(popup);
  attachPopupIconListeners(popup);
}

function renderError(popup: HTMLElement, error: string) {
  const messages: Record<string, string> = {
    missing_api_key: "Укажите API ключ в настройках расширения.",
    invalid_api_key: "Неверный API ключ.",
    network_error: "Ошибка сети. Проверьте подключение.",
    rate_limit: "Превышен лимит запросов.",
    llm_disabled_no_fallback:
      "LLM отключён. Настройте fallback-переводчик в настройках.",
  };

  popup.innerHTML = `
    <button class="lp-close-btn" title="Закрыть">×</button>
    <div class="lp-error">${messages[error] || "Ошибка перевода."}</div>
  `;
  attachPopupListeners(popup);
}

function showWordPopup(selection: Selection, text: string) {
  hideFab();
  hidePopup();

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const popup = createPopupInShadow();
  popup.innerHTML = `<div class="lp-loading"><div class="lp-spinner"></div>Перевод...</div>`;

  requestAnimationFrame(() => {
    positionPopup(popup, rect, "above");
  });

  chrome.runtime.sendMessage(
    { type: "TRANSLATE", data: { text, mode: "word" } },
    (response) => {
      const host = document.getElementById("linguapop-host");
      if (!host || !host.shadowRoot) return;
      const currentPopup = host.shadowRoot.querySelector(
        ".lp-popup",
      ) as HTMLElement;
      if (!currentPopup) return;

      if (response?.success) {
        renderWordResult(
          currentPopup,
          response.result as WordTranslationResult,
          text,
        );
      } else {
        renderError(currentPopup, response?.error || "unknown");
      }
      requestAnimationFrame(() => {
        positionPopup(currentPopup, rect, "above");
      });
    },
  );
}

function showFab(selection: Selection, text: string) {
  hidePopup();
  hideFab();

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const fab = document.createElement("button");
  fab.className = "lp-fab";
  fab.style.cssText = `
    position: absolute;
    z-index: 2147483646;
    background: #df37a7;
    color: #fff;
    border: none;
    border-radius: 999px;
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(223, 55, 167, 0.35);
    transition: transform 0.1s, background 0.15s;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  fab.textContent = "Перевести";
  fab.innerHTML = ICONS.translate;
  fab.setAttribute("title", "Translate");
  fab.setAttribute("aria-label", "Translate");
  fab.addEventListener("click", (e) => {
    e.stopPropagation();
    hideFab();
    showPhrasePopup(selection, text);
  });

  document.body.appendChild(fab);
  currentFab = fab;

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  fab.style.left = `${Math.max(10, rect.right + scrollX - 42)}px`;
  fab.style.top = `${rect.bottom + scrollY + 8}px`;
}

function showPhrasePopup(selection: Selection, text: string) {
  hidePopup();

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const popup = createPopupInShadow();
  popup.innerHTML = `<div class="lp-loading"><div class="lp-spinner"></div>Перевод...</div>`;

  requestAnimationFrame(() => {
    positionPopup(popup, rect, "below");
  });

  chrome.runtime.sendMessage(
    { type: "TRANSLATE", data: { text, mode: "phrase" } },
    (response) => {
      const host = document.getElementById("linguapop-host");
      if (!host || !host.shadowRoot) return;
      const currentPopup = host.shadowRoot.querySelector(
        ".lp-popup",
      ) as HTMLElement;
      if (!currentPopup) return;

      if (response?.success) {
        renderPhraseResult(
          currentPopup,
          response.result as PhraseTranslationResult,
          text,
        );
      } else {
        renderError(currentPopup, response?.error || "unknown");
      }
      requestAnimationFrame(() => {
        positionPopup(currentPopup, rect, "below");
      });
    },
  );
}

let selectionTimeout: ReturnType<typeof setTimeout> | null = null;

function handleSelection() {
  if (selectionTimeout) clearTimeout(selectionTimeout);
  selectionTimeout = setTimeout(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      hideAll();
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      hideAll();
      return;
    }

    // Don't show popup for selections inside inputs/textareas
    const focusNode = selection.focusNode;
    if (focusNode) {
      const parent = focusNode.parentElement;
      if (parent) {
        const tag = parent.tagName.toLowerCase();
        if (["input", "textarea", "select"].includes(tag)) {
          hideAll();
          return;
        }
        if (
          parent.closest('input, textarea, select, [contenteditable="true"]')
        ) {
          hideAll();
          return;
        }
      }
    }

    checkExcluded().then((excluded) => {
      if (excluded) return;

      const words = text.split(/\s+/).filter((w) => w.length > 0);
      if (words.length === 1 && text.length > 0 && text.length < 50) {
        showWordPopup(selection, text);
      } else {
        showFab(selection, text);
      }
    });
  }, 150);
}

async function checkExcluded(): Promise<boolean> {
  try {
    const hostname = window.location.hostname;
    return new Promise((resolve) => {
      chrome.storage.sync.get("excludedSites", (result) => {
        const sites: string[] = (result.excludedSites as string[]) || [];
        resolve(sites.some((site) => hostname.includes(site)));
      });
    });
  } catch {
    return false;
  }
}

document.addEventListener("mouseup", (e) => {
  const target = e.target as Node;
  const host = document.getElementById("linguapop-host");
  if (host && host.shadowRoot) {
    const popup = host.shadowRoot.querySelector(".lp-popup");
    if (popup && popup.contains(target)) {
      return;
    }
  }
  if (currentFab && currentFab.contains(target)) {
    return;
  }
  handleSelection();
});
document.addEventListener("keyup", (e) => {
  if (
    e.key === "Shift" ||
    e.key === "Control" ||
    e.key === "Alt" ||
    e.key === "Meta"
  )
    return;
  handleSelection();
});

document.addEventListener("mousedown", (e) => {
  const target = e.target as Node;
  const host = document.getElementById("linguapop-host");
  if (host && host.shadowRoot) {
    const popup = host.shadowRoot.querySelector(".lp-popup");
    if (popup && popup.contains(target)) {
      return;
    }
  }
  if (currentFab && currentFab.contains(target)) {
    return;
  }
  hideAll();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideAll();
  }
});

let lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const delta = Math.abs(window.scrollY - lastScrollY);
  if (delta > 80) {
    hideAll();
  }
  lastScrollY = window.scrollY;
});

// Keyboard shortcut: Alt+T to translate current selection
document.addEventListener("keydown", (e) => {
  if (
    e.altKey &&
    (e.key === "t" || e.key === "T") &&
    !e.ctrlKey &&
    !e.metaKey
  ) {
    e.preventDefault();
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      if (text) {
        const words = text.split(/\s+/).filter((w) => w.length > 0);
        if (words.length === 1 && text.length < 50) {
          showWordPopup(selection, text);
        } else {
          showPhrasePopup(selection, text);
        }
      }
    }
  }
});

// Context menu handler
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "CONTEXT_MENU_TRANSLATE") {
    const text = request.text as string;
    hideAll();

    const popup = createPopupInShadow();
    popup.innerHTML = `<div class="lp-loading"><div class="lp-spinner"></div>Перевод...</div>`;

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    popup.style.left = `${scrollX + Math.max(10, window.innerWidth / 2 - 150)}px`;
    popup.style.top = `${scrollY + Math.max(10, window.innerHeight / 2 - 100)}px`;

    const mode =
      text.split(/\s+/).filter((w) => w.length > 0).length === 1
        ? "word"
        : "phrase";
    chrome.runtime.sendMessage(
      { type: "TRANSLATE", data: { text, mode } },
      (response) => {
        const host = document.getElementById("linguapop-host");
        if (!host || !host.shadowRoot) return;
        const currentPopup = host.shadowRoot.querySelector(
          ".lp-popup",
        ) as HTMLElement;
        if (!currentPopup) return;

        if (response?.success) {
          if (mode === "word") {
            renderWordResult(
              currentPopup,
              response.result as WordTranslationResult,
              text,
            );
          } else {
            renderPhraseResult(
              currentPopup,
              response.result as PhraseTranslationResult,
              text,
            );
          }
        } else {
          renderError(currentPopup, response?.error || "unknown");
        }
      },
    );
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "START_PAGE_TRANSLATION") {
    startPageTranslation();
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "RESTORE_PAGE") {
    restorePage();
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "KEYBOARD_SHORTCUT_TRANSLATE") {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      if (text) {
        const words = text.split(/\s+/).filter((w) => w.length > 0);
        if (words.length === 1 && text.length < 50) {
          showWordPopup(selection, text);
        } else {
          showPhrasePopup(selection, text);
        }
        sendResponse({ success: true });
        return true;
      }
    }
    sendResponse({ success: false, error: "no_selection" });
    return true;
  }

  return false;
});

// Page translation MVP
function startPageTranslation() {
  if (isTranslatingPage) return;
  isTranslatingPage = true;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName.toLowerCase();
        if (
          [
            "script",
            "style",
            "noscript",
            "input",
            "textarea",
            "code",
            "pre",
            "iframe",
          ].includes(tag)
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        if (
          parent.closest(
            'script, style, noscript, input, textarea, code, pre, iframe, [translate="no"]',
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        const style = window.getComputedStyle(parent);
        if (style.display === "none" || style.visibility === "hidden") {
          return NodeFilter.FILTER_REJECT;
        }

        const text = node.textContent?.trim() || "";
        if (text.length < 3) return NodeFilter.FILTER_REJECT;
        if (!/[a-zA-Zа-яёА-ЯЁ]/.test(text)) return NodeFilter.FILTER_REJECT;
        if (translatedNodes.has(node as Text)) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    nodes.push(node as Text);
  }

  const batches: Text[][] = [];
  let currentBatch: Text[] = [];
  let currentChars = 0;
  const MAX_BATCH_CHARS = 800;

  for (const n of nodes) {
    const len = n.textContent?.length || 0;
    if (currentChars + len > MAX_BATCH_CHARS && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [n];
      currentChars = len;
    } else {
      currentBatch.push(n);
      currentChars += len;
    }
  }
  if (currentBatch.length > 0) batches.push(currentBatch);

  for (const batch of batches) {
    const texts = batch.map((n) => n.textContent?.trim() || "");
    const DELIMITER = "\n\u0001\n";
    const combined = texts.join(DELIMITER);

    chrome.runtime.sendMessage(
      { type: "TRANSLATE", data: { text: combined, mode: "phrase" } },
      (response) => {
        if (response?.success) {
          const result = response.result as PhraseTranslationResult;
          const parts = result.translation
            .split(DELIMITER)
            .map((s) => s.trim());
          batch.forEach((n, i) => {
            if (parts[i] && !translatedNodes.has(n)) {
              originalTexts.set(n, n.textContent || "");
              n.textContent = parts[i];
              translatedNodes.add(n);
            }
          });
        }
      },
    );
  }
}

function restorePage() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    if (translatedNodes.has(textNode)) {
      const original = originalTexts.get(textNode);
      if (original !== undefined) {
        textNode.textContent = original;
      }
      translatedNodes.delete(textNode);
    }
  }
  isTranslatingPage = false;
}
