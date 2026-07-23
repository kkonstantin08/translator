interface CacheEntry {
  key: string;
  result: unknown;
  timestamp: number;
}

const CACHE_PREFIX = "lp_cache_";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const MAX_CACHE_ITEMS = 1000;

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function buildKey(
  text: string,
  mode: string,
  sourceLang?: string,
  targetLang?: string,
  tone?: string,
): string {
  const hash = hashString(text);
  const snippet = text.trim().toLowerCase().slice(0, 30).replace(/[^a-z0-9а-яё]/g, "");
  return `${mode}_${sourceLang || "auto"}_${targetLang || "default"}_${tone || "none"}_${snippet}_${hash}`;
}

export async function getCachedTranslation(
  text: string,
  mode: string,
  sourceLang?: string,
  targetLang?: string,
  tone?: string,
): Promise<unknown | null> {
  try {
    const key = CACHE_PREFIX + buildKey(text, mode, sourceLang, targetLang, tone);
    const result = await chrome.storage.local.get(key);
    const entry = result[key] as CacheEntry | undefined;

    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      await chrome.storage.local.remove(key);
      return null;
    }
    
    // Update timestamp to mark as recently used
    entry.timestamp = Date.now();
    await chrome.storage.local.set({ [key]: entry });
    
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
  tone?: string,
): Promise<void> {
  try {
    const key = CACHE_PREFIX + buildKey(text, mode, sourceLang, targetLang, tone);
    const entry: CacheEntry = {
      key,
      result,
      timestamp: Date.now(),
    };
    await chrome.storage.local.set({ [key]: entry });
    
    // LRU Cleanup
    const all = await chrome.storage.local.get();
    const cacheKeys = Object.keys(all).filter((k) => k.startsWith(CACHE_PREFIX));
    
    if (cacheKeys.length > MAX_CACHE_ITEMS) {
      const entries = cacheKeys.map((k) => all[k] as CacheEntry);
      entries.sort((a, b) => a.timestamp - b.timestamp);
      
      const excess = cacheKeys.length - MAX_CACHE_ITEMS;
      const keysToRemove = entries.slice(0, excess).map((e) => e.key);
      
      await chrome.storage.local.remove(keysToRemove);
    }
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
