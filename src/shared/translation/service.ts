import { callMistral } from "../mistral/client";
import {
  buildWordPrompt,
  buildPhrasePrompt,
  buildPopupPrompt,
} from "../mistral/prompts";
import { getSettings } from "../storage";
import { translateWithFallback } from "./fallback";
import { getCachedTranslation, setCachedTranslation } from "../cache";
import type {
  TranslationRequest,
  WordTranslationResult,
  PhraseTranslationResult,
  TranslationResult,
} from "../types";

export async function translate(
  request: TranslationRequest,
): Promise<TranslationResult> {
  const settings = await getSettings();

  // Check cache first
  const cached = await getCachedTranslation(
    request.text,
    request.mode,
    request.sourceLanguage,
    request.targetLanguage,
  );
  if (cached) {
    return cached as TranslationResult;
  }

  if (!settings.llmEnabled) {
    const result = await translateWithFallback(request, settings);
    await setCachedTranslation(
      request.text,
      request.mode,
      result,
      request.sourceLanguage,
      request.targetLanguage,
    );
    return result;
  }

  let prompt: string;
  if (request.mode === "word") {
    prompt = buildWordPrompt(request.text, settings.defaultTargetLanguage);
  } else if (request.mode === "phrase") {
    prompt = buildPhrasePrompt(request.text, settings.defaultTargetLanguage);
  } else {
    prompt = buildPopupPrompt(
      request.text,
      request.sourceLanguage || "auto",
      request.targetLanguage || settings.defaultTargetLanguage,
    );
  }

  const content = await callMistral(prompt, {
    model: settings.selectedModel,
  });

  // Try to parse JSON
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
  }

  await setCachedTranslation(
    request.text,
    request.mode,
    result,
    request.sourceLanguage,
    request.targetLanguage,
  );

  return result;
}
