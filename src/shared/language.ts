export function detectLanguage(text: string): "en" | "ru" | "unknown" {
  const ruChars = /[а-яёА-ЯЁ]/;
  const enChars = /[a-zA-Z]/;

  const hasRu = ruChars.test(text);
  const hasEn = enChars.test(text);

  if (hasRu && !hasEn) return "ru";
  if (hasEn && !hasRu) return "en";
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
