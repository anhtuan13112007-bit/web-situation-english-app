export type SpeechAccent = 'en-GB' | 'en-US';

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakEnglish(
  text: string,
  accent: SpeechAccent = 'en-GB',
  rate = 0.94
): void {
  if (!isSpeechSupported() || !text.trim()) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = accent;
  utterance.rate = rate;

  const voices = synth.getVoices();
  if (voices.length > 0) {
    const exactMatch = voices.find(
      (voice) => voice.lang.toLowerCase() === accent.toLowerCase()
    );
    const langPrefix = accent.slice(0, 2).toLowerCase();
    const fallbackMatch = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(langPrefix)
    );
    if (exactMatch) {
      utterance.voice = exactMatch;
    } else if (fallbackMatch) {
      utterance.voice = fallbackMatch;
    }
  }

  synth.speak(utterance);
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export interface SpeechRecognitionHandlers {
  lang?: SpeechAccent;
  onInterim?: (transcript: string) => void;
  onFinal: (transcript: string) => void;
  onError?: (errorMessageVi: string) => void;
  onEnd?: () => void;
}

export function startSpeechRecognition(
  handlers: SpeechRecognitionHandlers
): { stop: () => void; abort: () => void } | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    handlers.onError?.('Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói. Bạn hãy dùng Chrome/Edge hoặc nhập văn bản thay thế.');
    return null;
  }

  const recognition = new Ctor();
  recognition.lang = handlers.lang ?? 'en-GB';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  let finalText = '';

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const text = result[0]?.transcript ?? '';
      if (result.isFinal) {
        finalText += (finalText ? ' ' : '') + text;
      } else {
        interim += text;
      }
    }
    if (interim || finalText) {
      handlers.onInterim?.((finalText + ' ' + interim).trim());
    }
    if (finalText.trim()) {
      handlers.onFinal(finalText.trim());
    }
  };

  recognition.onerror = (event) => {
    const code = event.error;
    if (code === 'not-allowed' || code === 'service-not-allowed') {
      handlers.onError?.('Chưa cấp quyền micro. Hãy cho phép micro trong trình duyệt hoặc dùng ô gõ thay thế.');
    } else if (code === 'no-speech') {
      handlers.onError?.('Không nghe thấy giọng nói. Hãy thử nói to và rõ hơn.');
    } else if (code !== 'aborted') {
      handlers.onError?.(`Lỗi nhận diện giọng nói (${code}). Bạn có thể dùng ô gõ thay thế.`);
    }
  };

  recognition.onend = () => {
    handlers.onEnd?.();
  };

  try {
    recognition.start();
  } catch {
    handlers.onError?.('Không thể khởi động micro. Vui lòng thử lại.');
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    },
  };
}
