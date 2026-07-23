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
- Preserve the tone and meaning.
- The text contains Markdown formatting. You MUST preserve the exact Markdown formatting (such as bold **, italic *, lists -).
- IMPORTANT: For paragraphs, use double newlines. You must strictly escape all newlines in the JSON string as \\\\n.`;
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

export function buildBatchPrompt(
  textArrayStr: string,
  defaultTarget: "ru" | "en",
): string {
  const target = defaultTarget === "ru" ? "Russian" : "English";

  return `Translate the following JSON array of strings into ${target}. 

Input:
${textArrayStr}

Return ONLY a valid JSON object with this exact structure:
{
  "translations": ["...", "..."]
}

Rules:
- Provide one natural translation for each string.
- Maintain the exact order and number of items in the array (very important).
- No explanations outside the JSON.`;
}

export function buildRewritePrompt(
  text: string,
  targetLang: string,
  tone?: "normal" | "formal" | "friendly" | "shorter" | "grammar_only"
): string {
  const detected = detectLanguage(text);

  let toneInstruction = "- If the text is informal, keep it informal but natural.\\n- If it's formal, keep it formal.";
  
  if (tone === "formal") {
    toneInstruction = "- Make the tone strictly formal, professional, and polite. Use advanced vocabulary.";
  } else if (tone === "friendly") {
    toneInstruction = "- Make the tone highly friendly, casual, and enthusiastic.";
  } else if (tone === "shorter") {
    toneInstruction = "- Summarize or rephrase the text to be significantly shorter and more concise while keeping the main point.";
  } else if (tone === "grammar_only") {
    toneInstruction = "- ONLY fix grammar, punctuation, and typos. Keep the original style intact. Do NOT change the meaning or rewrite the text heavily.";
  }

  return `You are a professional writing assistant. Translate or rewrite the following text into natural, native-sounding ${targetLang}. 

Text: "${text}"

Return ONLY a valid JSON object:
{
  "detectedLanguage": "${detected}",
  "targetLanguage": "${targetLang === "Russian" || targetLang === "ru" ? "ru" : "en"}",
  "translation": "..."
}

Rules:
${toneInstruction}
- Fix any typos or grammar issues while translating.
- No explanations outside the JSON.
- IMPORTANT: For paragraphs, use double newlines. Strictly escape all newlines as \\\\n.`;
}
