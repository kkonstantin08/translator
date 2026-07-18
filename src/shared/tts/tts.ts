function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const handler = () => {
      resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Fallback: resolve after 1s even if voices didn't load
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

export async function speak(
  text: string,
  lang: "en" | "ru" | "unknown",
): Promise<void> {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const voices = await ensureVoices();
  const utterance = new SpeechSynthesisUtterance(text);

  let preferredVoice: SpeechSynthesisVoice | undefined;

  if (lang === "ru") {
    preferredVoice =
      voices.find((v) => v.lang.startsWith("ru-RU")) ||
      voices.find((v) => v.lang.startsWith("ru"));
  } else if (lang === "en") {
    preferredVoice =
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en-GB")) ||
      voices.find((v) => v.lang.startsWith("en"));
  }

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.rate = 0.9;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
