import { callMistral } from "../mistral/client";
import {
  buildWordPrompt,
  buildPhrasePrompt,
  buildPopupPrompt,
  buildBatchPrompt,
  buildRewritePrompt,
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
  } else if (request.mode === "batch") {
    prompt = buildBatchPrompt(request.text, settings.defaultTargetLanguage);
  } else if (request.mode === "rewrite") {
    prompt = buildRewritePrompt(request.text);
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

  // Clean up potential markdown formatting
  let cleanContent = content.trim();
  if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }

  // Try to parse JSON
  let result: TranslationResult;
  try {
    result = JSON.parse(cleanContent) as TranslationResult;
  } catch {
    // Fallback: try to extract JSON with regex if there's trailing text
    try {
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
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
          mainTranslation: cleanContent.replace(/[\{\}"]/g, "").trim(),
          alternatives: [],
          partOfSpeech: "unknown",
          pronunciation: "",
          shortExamples: [],
        } as WordTranslationResult;
      } else if (request.mode === "batch") {
        let translationsFallback: string[] = [];
        try {
          translationsFallback = JSON.parse(request.text);
        } catch {
          translationsFallback = [request.text];
        }
        result = {
          translations: translationsFallback
        } as any;
      } else {
        result = {
          detectedLanguage: "unknown",
          targetLanguage:
            request.targetLanguage || settings.defaultTargetLanguage,
          translation: cleanContent.replace(/[\{\}"]/g, "").trim(),
        } as PhraseTranslationResult;
      }
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
