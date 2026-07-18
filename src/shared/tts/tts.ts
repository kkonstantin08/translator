let currentAudio: HTMLAudioElement | null = null;
let currentAudioContext: AudioContext | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null;

export async function speak(
  text: string,
  lang: "en" | "ru" | "unknown",
): Promise<void> {
  stopSpeaking();

  if (!text || lang === "unknown") return;

  // Google Translate TTS typically limits to ~200 characters per request.
  const safeText = text.slice(0, 200);
  const targetLang = lang === "ru" ? "ru" : "en";
  
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    safeText,
  )}&tl=${targetLang}&client=tw-ob`;

  try {
    const response = await new Promise<{ success: boolean; dataUrl?: string }>(
      (resolve) => {
        chrome.runtime.sendMessage(
          { type: "FETCH_TTS", url },
          (res) => resolve(res || { success: false })
        );
      }
    );

    if (!response.success || !response.dataUrl) {
      throw new Error("TTS fetch returned false");
    }

    // Extract base64 from dataUrl (data:audio/mpeg;base64,....)
    const base64 = response.dataUrl.split(',')[1];
    const arrayBuffer = base64ToArrayBuffer(base64);
    
    currentAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await currentAudioContext.decodeAudioData(arrayBuffer);
    
    currentAudioSource = currentAudioContext.createBufferSource();
    currentAudioSource.buffer = audioBuffer;
    currentAudioSource.connect(currentAudioContext.destination);
    currentAudioSource.start();

  } catch (error) {
    console.warn("[LinguaPop] Audio playback failed:", error);
    // Fallback to Web Speech API if Google fails or is blocked by CORS/network
    fallbackSpeak(text, targetLang);
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function stopSpeaking(): void {
  if (currentAudioSource) {
    try {
      currentAudioSource.stop();
    } catch (e) {}
    currentAudioSource = null;
  }
  if (currentAudioContext) {
    currentAudioContext.close().catch(() => {});
    currentAudioContext = null;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Fallback logic in case Google API is unreachable
function fallbackSpeak(text: string, lang: "en" | "ru"): void {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  
  let preferredVoice = voices.find((v) => 
    v.lang.startsWith(lang === "ru" ? "ru" : "en") && 
    (v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Natural"))
  ) || voices.find((v) => v.lang.startsWith(lang === "ru" ? "ru" : "en"));

  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 0.9;
  
  window.speechSynthesis.speak(utterance);
}
