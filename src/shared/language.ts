export function detectLanguage(text: string): "en" | "ru" | "unknown" {
  const ruChars = /[а-яёА-ЯЁ]/;
  const enChars = /[a-zA-Z]/;

  // If the text contains Russian characters, we treat it as Russian
  // because Russian text frequently contains English terms (brands, tech words).
  if (ruChars.test(text)) return "ru";
  
  // Otherwise, if it has English characters, treat it as English.
  if (enChars.test(text)) return "en";

  return "unknown";
}

export function determineTargetLanguage(
  detected: "en" | "ru" | "unknown",
  defaultTarget: "ru" | "en",
): "ru" | "en" {
  if (detected === "en") return "ru";
  if (detected === "ru") return "en";
  return defaultTarget;
}
