import { useState, useEffect, useCallback } from "react";
import { getSettings, setSettings } from "../shared/storage";
import { translate } from "../shared/translation/service";
import { speak } from "../shared/tts/tts";
import { detectLanguage } from "../shared/language";
import { MISTRAL_MODELS, UI_STRINGS } from "../shared/constants";
import type { PhraseTranslationResult } from "../shared/types";

function applyThemeClass(theme: "light" | "dark" | "system") {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) {
    document.documentElement.classList.add("lp-dark");
  } else {
    document.documentElement.classList.remove("lp-dark");
  }
}

export default function PopupApp() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [sourceLang, setSourceLang] = useState<"auto" | "en" | "ru">("auto");
  const [targetLang, setTargetLang] = useState<"ru" | "en">("ru");
  const [model, setModel] = useState("");
  const [llmEnabled, setLlmEnabled] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setModel(s.selectedModel);
      setLlmEnabled(s.llmEnabled);
      setTheme(s.theme);
      applyThemeClass(s.theme);
    });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      getSettings().then((s) => applyThemeClass(s.theme));
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await translate({
        text: input.trim(),
        mode: "popup",
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      setResult((res as PhraseTranslationResult).translation);
    } catch (err) {
      const msg = (err as Error).message;
      const errors: Record<string, string> = {
        missing_api_key: UI_STRINGS.missingKey,
        invalid_api_key: UI_STRINGS.invalidKey,
        network_error: UI_STRINGS.networkError,
        rate_limit: UI_STRINGS.rateLimit,
        llm_disabled_no_fallback: UI_STRINGS.llmDisabled,
      };
      setError(errors[msg] || "Ошибка перевода.");
    } finally {
      setLoading(false);
    }
  }, [input, sourceLang, targetLang]);

  const handleSpeak = useCallback(() => {
    const textToSpeak = result || input;
    const lang = detectLanguage(textToSpeak) === "ru" ? "ru" : "en";
    speak(textToSpeak, lang);
  }, [input, result]);

  const handleCopy = useCallback(() => {
    const textToCopy = result || input;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [input, result]);

  const handleTranslatePage = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "START_PAGE_TRANSLATION" })
          .catch(() => {});
      }
    });
    window.close();
  }, []);

  const handleRestorePage = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "RESTORE_PAGE" })
          .catch(() => {});
      }
    });
    window.close();
  }, []);

  const openSettings = useCallback(() => {
    chrome.runtime.openOptionsPage();
  }, []);

  const cycleTheme = useCallback(async () => {
    const next =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    await setSettings({ theme: next });
    applyThemeClass(next);
  }, [theme]);

  const themeIcon = theme === "light" ? "☀" : theme === "dark" ? "☾" : "◐";

  return (
    <div className="lp-popup-ui">
      <div className="lp-popup-header">
        <h1>LinguaPop AI</h1>
        <div className="lp-popup-actions">
          <button
            onClick={cycleTheme}
            className="lp-icon-btn"
            title={`Тема: ${theme}`}
          >
            {themeIcon}
          </button>
          <button
            onClick={openSettings}
            className="lp-icon-btn"
            title="Настройки"
          >
            ⚙
          </button>
        </div>
      </div>

      <div className="lp-lang-row">
        <select
          value={sourceLang}
          onChange={(e) =>
            setSourceLang(e.target.value as "auto" | "en" | "ru")
          }
        >
          <option value="auto">Авто</option>
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>
        <span>→</span>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value as "ru" | "en")}
        >
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Введите текст для перевода..."
        rows={4}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleTranslate();
          }
        }}
      />

      <div className="lp-options-row">
        <select
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            setSettings({ selectedModel: e.target.value });
          }}
        >
          {MISTRAL_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <label className="lp-toggle">
          <input
            type="checkbox"
            checked={llmEnabled}
            onChange={(e) => {
              setLlmEnabled(e.target.checked);
              setSettings({ llmEnabled: e.target.checked });
            }}
          />
          LLM
        </label>
      </div>

      <button
        className="lp-primary-btn"
        onClick={handleTranslate}
        disabled={loading || !input.trim()}
      >
        {loading ? (
          <>
            <span className="lp-spinner-inline" />
            Перевод...
          </>
        ) : (
          UI_STRINGS.translate
        )}
      </button>

      {error && <div className="lp-error">{error}</div>}

      {result && (
        <div className="lp-result">
          <div className="lp-result-text">{result}</div>
          <div className="lp-result-actions">
            <button onClick={handleSpeak}>{UI_STRINGS.speak}</button>
            <button onClick={handleCopy}>
              {copied ? UI_STRINGS.copied : UI_STRINGS.copy}
            </button>
          </div>
        </div>
      )}

      <div className="lp-page-actions">
        <button className="lp-secondary-btn" onClick={handleTranslatePage}>
          {UI_STRINGS.translatePage}
        </button>
        <button className="lp-secondary-btn" onClick={handleRestorePage}>
          {UI_STRINGS.restorePage}
        </button>
      </div>
    </div>
  );
}
