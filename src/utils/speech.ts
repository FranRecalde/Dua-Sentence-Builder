let cachedVoices: Record<string, SpeechSynthesisVoice | null> = {};

function getLanguageVoice(langPrefix: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  if (cachedVoices[langPrefix]) return cachedVoices[langPrefix];

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const matchExact = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
  if (matchExact) {
    cachedVoices[langPrefix] = matchExact;
    return matchExact;
  }

  return null;
}

// Pre-warm voices on load
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = {};
  };
}

/**
 * Sanitizes text for clean phonetic pronunciation:
 * - strips asterisks, literal brackets like [myself I call]
 * - strips optional brackets like (yo) -> keeps "yo"
 * - cleans punctuation
 */
export function sanitizeForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\[.*?\]/g, '') // remove literal notes
    .replace(/[()]/g, ' ') // convert brackets to space: (yo) -> yo
    .replace(/\*/g, '') // remove scaffolding asterisks
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speaks the text in Spanish or German using the Web Speech API
 */
export function speakSpanish(
  text: string,
  options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  } = {}
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  const cleanText = sanitizeForSpeech(text);
  if (!cleanText) return;

  try {
    window.speechSynthesis.cancel(); // Stop any currently playing audio

    // Auto-detect German if words contain common German patterns or if lang specified
    const targetLang = options.lang || (
      /habe|hast|hat|haben|gegessen|gespielt|gemacht|Currywurst|Schnitzel|Fußball/i.test(text)
        ? 'de-DE'
        : 'es-ES'
    );

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang;
    utterance.rate = options.rate ?? 0.85; // slightly slower modeling pace for language learners
    utterance.pitch = options.pitch ?? 1.0;

    const voice = getLanguageVoice(targetLang.slice(0, 2));
    if (voice) {
      utterance.voice = voice;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Error invoking speech synthesis:', err);
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
