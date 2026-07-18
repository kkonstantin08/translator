import { useState, useEffect, useCallback } from "react";
import { getSettings, setSettings } from "../shared/storage";
import { testApiKey } from "../shared/mistral/client";
import { clearTranslationCache } from "../shared/cache";
import {
  MISTRAL_MODELS,
  FALLBACK_PROVIDERS,
  UI_STRINGS,
} from "../shared/constants";
import type { Settings } from "../shared/types";

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

export default function OptionsApp() {
  const [settings, setLocalSettings] = useState<Settings>({
    mistralApiKey: "",
    selectedModel: "mistral-small-latest",
    defaultTargetLanguage: "ru",
    llmEnabled: true,
    fallbackProvider: "none",
    libreTranslateEndpoint: "",
    excludedSites: [],
    theme: "system",
  });
  const [keyStatus, setKeyStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [excludedInput, setExcludedInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setLocalSettings(s);
      applyThemeClass(s.theme);
    });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      getSettings().then((s) => applyThemeClass(s.theme));
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      const updated = { ...settings, [key]: value };
      setLocalSettings(updated);
    },
    [settings],
  );

  const handleSave = useCallback(async () => {
    await setSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const handleCheckKey = useCallback(async () => {
    setKeyStatus("checking");
    try {
      await testApiKey(settings.mistralApiKey, settings.selectedModel);
      setKeyStatus("valid");
    } catch {
      setKeyStatus("invalid");
    }
  }, [settings.mistralApiKey, settings.selectedModel]);

  const handleClearCache = useCallback(async () => {
    await clearTranslationCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  }, []);

  const addExcludedSite = useCallback(() => {
    if (!excludedInput.trim()) return;
    if (settings.excludedSites.includes(excludedInput.trim())) {
      setExcludedInput("");
      return;
    }
    const sites = [...settings.excludedSites, excludedInput.trim()];
    updateSetting("excludedSites", sites);
    setExcludedInput("");
  }, [excludedInput, settings.excludedSites, updateSetting]);

  const removeExcludedSite = useCallback(
    (site: string) => {
      const sites = settings.excludedSites.filter((s) => s !== site);
      updateSetting("excludedSites", sites);
    },
    [settings.excludedSites, updateSetting],
  );

  return (
    <div className="lp-options-page">
      <div className="lp-options-card">
        <h1>LinguaPop AI — Настройки</h1>
        <div className="lp-options-subtitle">
          Настройте API ключ, модель и параметры перевода
        </div>

        <section>
          <h2>{UI_STRINGS.apiKeyLabel}</h2>
          <div className="lp-help-text">
            Получить API ключи можно в консоли Mistral (
            <a
              href="https://console.mistral.ai/api-keys/"
              target="_blank"
              rel="noopener noreferrer"
            >
              console.mistral.ai
            </a>
            ).
            <br />
            Можно указать несколько ключей (каждый с новой строки или через
            запятую). Если лимит одного ключа исчерпан, расширение автоматически
            перейдет к следующему.
          </div>
          <div className="lp-key-row">
            <textarea
              value={settings.mistralApiKey}
              onChange={(e) => updateSetting("mistralApiKey", e.target.value)}
              placeholder="Вставьте API ключи Mistral..."
              rows={3}
            />
            <button
              onClick={handleCheckKey}
              disabled={keyStatus === "checking"}
            >
              {keyStatus === "checking" ? "Проверка..." : UI_STRINGS.checkKey}
            </button>
          </div>
          {keyStatus === "valid" && (
            <div className="lp-status valid">{UI_STRINGS.keyWorks}</div>
          )}
          {keyStatus === "invalid" && (
            <div className="lp-status invalid">{UI_STRINGS.invalidKey}</div>
          )}
        </section>

        <section>
          <h2>Модель Mistral</h2>
          <select
            value={settings.selectedModel}
            onChange={(e) => updateSetting("selectedModel", e.target.value)}
          >
            {MISTRAL_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </section>

        <section>
          <h2>Язык перевода по умолчанию</h2>
          <select
            value={settings.defaultTargetLanguage}
            onChange={(e) =>
              updateSetting(
                "defaultTargetLanguage",
                e.target.value as "ru" | "en",
              )
            }
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </section>

        <section>
          <h2>Режим перевода</h2>
          <label className="lp-switch-label">
            <span className="lp-switch">
              <input
                type="checkbox"
                checked={settings.llmEnabled}
                onChange={(e) => updateSetting("llmEnabled", e.target.checked)}
              />
              <span className="lp-slider" />
            </span>
            <span className="lp-switch-text">
              {settings.llmEnabled
                ? "Использовать LLM (Mistral)"
                : "LLM отключён"}
            </span>
          </label>
        </section>

        <section>
          <h2>Fallback-переводчик</h2>
          <select
            value={settings.fallbackProvider}
            onChange={(e) =>
              updateSetting(
                "fallbackProvider",
                e.target.value as Settings["fallbackProvider"],
              )
            }
          >
            <option value="none">Не использовать</option>
            {FALLBACK_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </section>

        <section>
          <h2>LibreTranslate endpoint (опционально)</h2>
          <input
            type="text"
            value={settings.libreTranslateEndpoint}
            onChange={(e) =>
              updateSetting("libreTranslateEndpoint", e.target.value)
            }
            placeholder="https://libretranslate.de"
          />
        </section>

        <section>
          <h2>Исключённые сайты</h2>
          <div className="lp-excluded-row">
            <input
              type="text"
              value={excludedInput}
              onChange={(e) => setExcludedInput(e.target.value)}
              placeholder="example.com"
              onKeyDown={(e) => e.key === "Enter" && addExcludedSite()}
            />
            <button onClick={addExcludedSite}>Добавить</button>
          </div>
          <div className="lp-excluded-list">
            {settings.excludedSites.map((site) => (
              <span key={site} className="lp-excluded-tag">
                {site}
                <button
                  onClick={() => removeExcludedSite(site)}
                  title="Удалить"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2>Тема оформления</h2>
          <select
            value={settings.theme}
            onChange={(e) => {
              const val = e.target.value as Settings["theme"];
              updateSetting("theme", val);
              applyThemeClass(val);
            }}
          >
            <option value="system">Системная</option>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </section>

        <section>
          <h2>Кэш переводов</h2>
          <div className="lp-key-row">
            <input
              type="text"
              value={
                cacheCleared ? "Кэш очищен!" : "Кэш хранит переводы 24 часа"
              }
              readOnly
              style={{ color: cacheCleared ? "#16a34a" : undefined }}
            />
            <button onClick={handleClearCache}>Очистить кэш</button>
          </div>
        </section>

        <div className="lp-save-row">
          <button className="lp-save-btn" onClick={handleSave}>
            {saved ? "Сохранено!" : "Сохранить настройки"}
          </button>
        </div>
      </div>
    </div>
  );
}
