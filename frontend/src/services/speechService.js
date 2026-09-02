/**
 * Web Speech API Speech-to-Text Provider
 */
export class SpeechToTextProvider {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.transcriptHandler = null;
    this.errorHandler = null;
    this.statusHandler = null;

    this.init();
  }

  isSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  init() {
    if (!this.isSupported()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (this.transcriptHandler) {
        this.transcriptHandler({
          finalTranscript,
          interimTranscript,
          rawText: finalTranscript || interimTranscript
        });
      }
    };

    this.recognition.onerror = (event) => {
      let message = 'Speech recognition error';
      if (event.error === 'not-allowed') {
        message = 'Microphone access was denied. Please allow microphone permissions.';
      } else if (event.error === 'no-speech') {
        message = 'No speech was detected. Please check your microphone.';
      } else if (event.error === 'network') {
        message = 'Network issue with speech recognition service.';
      }

      if (this.errorHandler) {
        this.errorHandler({ error: event.error, message });
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Auto-restart if still flagged as listening (browser auto-timeout recovery)
        try {
          this.recognition.start();
        } catch (e) {
          this.isListening = false;
          if (this.statusHandler) this.statusHandler(false);
        }
      } else {
        if (this.statusHandler) this.statusHandler(false);
      }
    };
  }

  start(onTranscript, onError, onStatusChange) {
    if (!this.isSupported()) {
      if (onError) onError({ error: 'unsupported', message: 'Speech recognition is not supported in this browser. Please use text input or Chrome/Edge.' });
      return false;
    }

    this.transcriptHandler = onTranscript;
    this.errorHandler = onError;
    this.statusHandler = onStatusChange;

    try {
      this.recognition.start();
      this.isListening = true;
      if (this.statusHandler) this.statusHandler(true);
      return true;
    } catch (err) {
      if (this.errorHandler) this.errorHandler({ error: err.name, message: err.message });
      return false;
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.statusHandler) this.statusHandler(false);
  }
}

export const speechService = new SpeechToTextProvider();
export default speechService;
