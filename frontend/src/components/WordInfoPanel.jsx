import React from 'react';
import { detectLang } from '../utils/languageUtils';
import { transliterate } from '../utils/transliterate';

export default function WordInfoPanel({ wordData, onClose }) {
  if (!wordData) return null;

  
  const { word, count } = wordData;
  const langCode = detectLang(word);
  const romanized = transliterate(word, langCode);


 function speakWord(word, langCode = 'en-US') {
  const synth = window.speechSynthesis;

  // Make sure voices are loaded
    const loadVoices = () => {
    console.log("Detected langCode:", langCode);
    console.log("Speaking:", word);

    const voices = synth.getVoices();
    const matchedVoice = voices.find(voice => voice.lang.startsWith(langCode));

    console.log("Matched voice:", matchedVoice);


    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = langCode;

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else {
      console.warn(`No voice found for language ${langCode}, using default.`);
    }

    synth.speak(utterance);
  };

  if (synth.getVoices().length === 0) {
    // Chrome needs this event to be triggered before voices are ready
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
      <>
        <p className="text-sm text-gray-500 italic mb-1">({romanized})</p>
       
      </>
    )}

    <p className="mb-2 text-sm text-gray-600">Seen {count} times</p>

    <button
      className="bg-blue-500 text-white px-3 py-1 rounded mb-4"
      onClick={() => speakWord(word, langCode)}
    >
      🔊 Hear Pronunciation
    </button>

    <div className="mb-2">
      <h3 className="font-medium">Dictionary (Native Language)</h3>
      <p className="text-sm text-gray-700">
        {wordData.nativeDefinition || "No definition available."}
      </p>
    </div>

    <div className="mb-2">
      <h3 className="font-medium">Dictionary (Target Language)</h3>
      <p className="text-sm text-gray-700">
        {wordData.targetDefinition || "No definition available."}
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