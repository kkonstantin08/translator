import os

filepath = 'src/shared/translation/service.ts'
with open(filepath, 'r') as f:
    content = f.read()

target = """  // Try to parse JSON
  let result: TranslationResult;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      result = parsed as TranslationResult;
    } else {
      throw new Error("no_json");
    }
  } catch {
    // Graceful degradation
    if (request.mode === "word") {
      result = {
        detectedLanguage: "unknown",
        targetLanguage: settings.defaultTargetLanguage,
        word: request.text,
        mainTranslation: content.trim(),
        alternatives: [],
        partOfSpeech: "unknown",
        pronunciation: "",
        shortExamples: [],
      } as WordTranslationResult;
    } else {
      result = {
        detectedLanguage: "unknown",
        targetLanguage:
          request.targetLanguage || settings.defaultTargetLanguage,
        translation: content.trim(),
      } as PhraseTranslationResult;
    }
  }"""

replacement = """  // Clean up potential markdown formatting
  let cleanContent = content.trim();
  if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.replace(/^```(?:json)?\\n?/, "").replace(/\\n?```$/, "").trim();
  }

  // Try to parse JSON
  let result: TranslationResult;
  try {
    result = JSON.parse(cleanContent) as TranslationResult;
  } catch {
    // Fallback: try to extract JSON with regex if there's trailing text
    try {
      const jsonMatch = cleanContent.match(/\\{[\\s\\S]*\\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]) as TranslationResult;
      } else {
        throw new Error("no_json");
      }
    } catch {
      // Graceful degradation
      if (request.mode === "word") {
        result = {
          detectedLanguage: "unknown",
          targetLanguage: settings.defaultTargetLanguage,
          word: request.text,
          mainTranslation: cleanContent.replace(/[\\{\\}"]/g, "").trim(),
          alternatives: [],
          partOfSpeech: "unknown",
          pronunciation: "",
          shortExamples: [],
        } as WordTranslationResult;
      } else {
        result = {
          detectedLanguage: "unknown",
          targetLanguage:
            request.targetLanguage || settings.defaultTargetLanguage,
          translation: cleanContent.replace(/[\\{\\}"]/g, "").trim(),
        } as PhraseTranslationResult;
      }
    }
  }"""

if target in content:
    with open(filepath, 'w') as f:
        f.write(content.replace(target, replacement))
    print("Patched successfully")
else:
    print("Target not found")
