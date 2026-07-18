import { determineTargetLanguage, detectLanguage } from "../language";

export function buildWordPrompt(
  text: string,
  defaultTarget: "ru" | "en",
): string {
  const detected = detectLanguage(text);
  const target = determineTargetLanguage(detected, defaultTarget);

  return `You are a precise English-Russian dictionary. Translate the word "${text}" into ${target === "ru" ? "Russian" : "English"}.

Return ONLY a valid JSON object with this exact structure:
{
  "detectedLanguage": "${detected}",
  "targetLanguage": "${target}",
  "word": "${text}",
  "mainTranslation": "...",
  "alternatives": ["...", "..."],
  "partOfSpeech": "noun | verb | adjective | adverb | pronoun | preposition | conjunction | interjection | phrase | unknown",
  "pronunciation": "...",
  "shortExamples": [
    {
      "source": "...",
      "translation": "..."
    }
  ]
}

Rules:
- Provide 2-4 alternative translations.
- Part of speech must be accurate.
- Pronunciation: IPA or simple phonetic spelling.
- Include 1-2 short example sentences.
- Be concise. No explanations outside the JSON.`;
}

export function buildPhrasePrompt(
  text: string,
  defaultTarget: "ru" | "en",
): string {
  const detected = detectLanguage(text);
  const target = determineTargetLanguage(detected, defaultTarget);

  return `Translate the following text into ${target === "ru" ? "Russian" : "English"}.

Text: "${text}"

Return ONLY a valid JSON object:
{
  "detectedLanguage": "${detected}",
  "targetLanguage": "${target}",
  "translation": "..."
}

Rules:
- Provide one natural, accurate translation.
- No explanations outside the JSON.
- Preserve the tone and meaning.`;
}

export function buildPopupPrompt(
  text: string,
  sourceLang: "auto" | "en" | "ru",
  targetLang: "ru" | "en",
): string {
  let detected: "en" | "ru" | "unknown";
  if (sourceLang === "auto") {
    detected = detectLanguage(text);
  } else {
    detected = sourceLang;
  }

  return `Translate the following text from ${detected === "unknown" ? "unknown language" : detected === "en" ? "English" : "Russian"} into ${targetLang === "ru" ? "Russian" : "English"}.

Text: "${text}"

Return ONLY a valid JSON object:
{
  "detectedLanguage": "${detected}",
  "targetLanguage": "${targetLang}",
  "translation": "..."
}

Rules:
- One natural, accurate translation.
- No extra text outside JSON.`;
}
