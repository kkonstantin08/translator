interface CacheEntry {
  key: string;
  result: unknown;
  timestamp: number;
}

const CACHE_PREFIX = "lp_cache_";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function buildKey(
  text: string,
  mode: string,
  sourceLang?: string,
  targetLang?: string,
): string {
  const normalized = text.trim().toLowerCase().slice(0, 200);
  return `${mode}_${sourceLang || "auto"}_${targetLang || "default"}_${normalized}`;
}

export async function getCachedTranslation(
  text: string,
  mode: string,
  sourceLang?: string,
  targetLang?: string,
): Promise<unknown | null> {
  try {
    const key = CACHE_PREFIX + buildKey(text, mode, sourceLang, targetLang);
    const result = await chrome.storage.local.get(key);
    const entry = result[key] as CacheEntry | undefined;

    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      await chrome.storage.local.remove(key);
      return null;
    }
    return entry.result;
  } catch {
    return null;
  }
}

export async function setCachedTranslation(
  text: string,
  mode: string,
  result: unknown,
  sourceLang?: string,
  targetLang?: string,
): Promise<void> {
  try {
    const key = CACHE_PREFIX + buildKey(text, mode, sourceLang, targetLang);
    const entry: CacheEntry = {
      key,
      result,
      timestamp: Date.now(),
    };
    await chrome.storage.local.set({ [key]: entry });
  } catch {
    // Silently fail if cache is unavailable
  }
}

export async function clearTranslationCache(): Promise<void> {
  try {
    const all = await chrome.storage.local.get();
    const keysToRemove = Object.keys(all).filter((k) =>
      k.startsWith(CACHE_PREFIX),
    );
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
    }
  } catch {
    // Silently fail
  }
}
