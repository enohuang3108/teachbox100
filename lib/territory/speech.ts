export const SPEECH_RATES = [0.7, 0.9, 1, 1.2, 1.4] as const;

export interface SpeechPreferences {
  reading: boolean;
  speechRate: number;
  voiceURI: string;
}

/** 聲音屬於裝置；分享或換機找不到原聲音時，回到台灣華語、其他中文。 */
export function questionVoice(voices: readonly SpeechSynthesisVoice[], voiceURI: string) {
  return voices.find((voice) => voice.voiceURI === voiceURI)
    ?? voices.find((voice) => /^zh[-_]TW$/i.test(voice.lang))
    ?? voices.find((voice) => /^zh(?:[-_]|$)/i.test(voice.lang));
}
