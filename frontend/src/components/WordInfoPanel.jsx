import React from 'react';
import { transliterate } from '../utils/transliterate';

export default function WordInfoPanel({ wordData, onClose }) {
  if (!wordData) return null;

  const {
    word,
    seen_count,            // Use consistent property name here
    lang_code,             // Use lang_code from backend instead of detectLang
    native_definition,
    english_definition,
    romanized: wordRomanized,
  } = wordData;

  // Use transliterate only if no romanized from backend
  const romanized = wordRomanized || transliterate(word, lang_code);

  function speakWord(word, langCode = 'en-US') {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      const matchedVoice = voices.find(voice => voice.lang.startsWith(langCode));
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = langCode;

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      loadVoices();
    }
  }

  return (
    <aside className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4 z-50 overflow-y-auto">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-black"
        onClick={onClose}
        aria-label="Close panel"
      >
        ✖
      </button>

      <h2 className="text-xl font-semibold mb-2">{word}</h2>

      {romanized && romanized !== word && (
        <p className="text-sm text-gray-500 italic mb-1">({romanized})</p>
      )}

      <p className="mb-2 text-sm text-gray-600">Seen {seen_count ?? 0} times</p>

      <button
        className="bg-blue-500 text-white px-3 py-1 rounded mb-4"
        onClick={() => speakWord(word, lang_code)}
      >
        🔊 Hear Pronunciation
      </button>

      <div className="mb-2">
        <h3 className="font-medium">Dictionary (Native Language)</h3>
        <p className="text-sm text-gray-700">
          {native_definition || "No definition available."}
        </p>
      </div>

      <div className="mb-2">
        <h3 className="font-medium">Dictionary (English)</h3>
        <p className="text-sm text-gray-700">
          {english_definition || "No definition available."}
        </p>
      </div>

      {romanized && romanized !== word && (
        <div className="mb-2">
          <h3 className="font-medium">Romanized Dictionary</h3>
          <p className="text-sm text-gray-700 italic">{romanized}</p>
        </div>
      )}
    </aside>
  );
}
