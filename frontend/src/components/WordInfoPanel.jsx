import { useState, useEffect } from "react";

export default function WordInfoPanel({ wordLanguageId, onClose, userLanguage = 'en' }) {
  const [wordData, setWordData] = useState(null);

  useEffect(() => {
    if (!wordLanguageId) return;

    fetch(`/api/word/${wordLanguageId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch word data");
        return res.json();
      })
      .then(data => setWordData(data))
      .catch(err => console.error(err));
  }, [wordLanguageId]);

  if (!wordData) return <p>Loading...</p>;

  const {
    word,
    lang_code,
    seen_count,
    click_count,
    used_count,
    definitions = [],
    part_of_speech,
    rarity_level,
    tags = [],
    media = [],
    romanized
  } = wordData;

  const showRomanized = romanized && lang_code !== 'en';

  function speakWord(text, lang = lang_code) {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const voices = synth.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang));
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      if (voice) utterance.voice = voice;
      synth.speak(utterance);
    };
    if (!synth.getVoices().length) {
      synth.onvoiceschanged = loadVoices;
    } else {
      loadVoices();
    }
  }



  return (
    <aside className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-4 z-50 overflow-y-auto">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-black"
        onClick={onClose}
        aria-label="Close panel"
      >
        ✖
      </button>

      <h2 className="text-2xl font-semibold mb-2">{word}</h2>

      {showRomanized && (
        <p className="text-sm text-gray-500 italic mb-1">({wordData.romanized})</p>
      )}

      <div className="text-sm text-gray-600 mb-2">
  <p>Seen: {seen_count ?? 0}</p>
  <p>Clicked: {click_count ?? 0}</p>
  <p>Used: {used_count ?? 0}</p>
  <p>Part of speech: {part_of_speech}</p>
  <p>Rarity: {rarity_level}</p>
  
</div>

      <button
        className="bg-blue-500 text-white px-3 py-1 rounded mb-4"
        onClick={() => speakWord(word)}
      >
        🔊 Hear Pronunciation
      </button>

  

      {tags.length > 0 && (
        <div className="mb-2">
          <h3 className="font-medium">Tags:</h3>
          <ul className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <li key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">{tag}</li>
            ))}
          </ul>
        </div>
      )}

     {definitions.map((def, idx) => (
  <div key={idx} className="mb-4 border-b border-gray-200 pb-2">
    {/* Main definition */}
    <p className="text-sm font-medium">{def.native}</p>
    {def.romanized && (
      <p className="text-sm text-gray-500 italic">{def.romanized}</p>
    )}
    <p className="text-sm text-gray-700">{def.english}</p>

    {/* Examples */}
    {def.examples?.length > 0 && (
      <div className="ml-4 mt-2">
        <h4 className="text-xs font-semibold mb-1">Examples:</h4>
        {def.examples.map((ex, i) => (
          <div key={i} className="mb-1">
            <p className="text-xs">{ex.native}</p>
            {ex.romanized && (
              <p className="text-xs text-gray-500 italic">{ex.romanized}</p>
            )}
            <p className="text-xs text-gray-700">{ex.english}</p>
          </div>
        ))}
      </div>
    )}
  </div>
))}


      {media?.length > 0 && (
      <div className="mb-2">
        <h3 className="font-medium">Media:</h3>
        {media.map((m, i) => (
          <div key={i} className="mb-1">
            {m.type === 'audio' ? (
              <audio controls src={m.url}></audio>
            ) : (
              <img src={m.url} alt="media" className="max-w-full" />
            )}
          </div>
        ))}
      </div>
    )}
      
  </aside>
  );
}
