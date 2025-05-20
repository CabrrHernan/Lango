import React, { useState, useRef, useEffect } from 'react';
import WordInfoPanel from './WordInfoPanel';


const testWords = [
  {
    word: 'こんにちは',
    seen_count: 42,
    lang_code: 'ja-JP',
    native_definition: 'Hello (Japanese greeting)',
    english_definition: 'Hello',
    romanized: 'Konnichiwa',
  },
  {
    word: '苹果',
    seen_count: 17,
    lang_code: 'zh-CN',
    native_definition: '一种水果',
    english_definition: 'Apple (fruit)',
    romanized: 'Píngguǒ',
  },
  {
    word: 'computer',
    seen_count: 5,
    lang_code: 'en-US',
    native_definition: 'An electronic device for processing data',
    english_definition: 'Computer',
    romanized: '',  // No romanization needed for English
  },
  {
    word: 'ありがとう',
    seen_count: 30,
    lang_code: 'ja-JP',
    native_definition: '感谢',
    english_definition: 'Thank you',
    romanized: 'Arigatō',
  }
];



const isSpaceLang = (lang) => {
  if (!lang || lang === 'multi') return false;
  return ['en', 'es', 'fr', 'de','it','pt','ru'].some(code => lang.startsWith(code));
};


export default function ChatWindow() {
  const [messages, setMessages] = useState([
  {from: 'bot', text: 'こんにちは、 how are you? 你好吗？', langCode: 'multi'},
  { from: 'bot', text: 'こんにちは、元気ですか？', langCode: 'ja' },
  { from: 'bot', text: '你好，你怎么样？', langCode: 'zh' },
  { from: 'bot', text: 'Hello, how are you?', langCode: 'en' },
]);


  const [input, setInput] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [tokensByMsg, setTokensByMsg] = useState({
  0: [
    { text: "こんにちは、", lang: "ja" },
    { text: " how are you? ", lang: "en" },
    { text: "你好吗？", lang: "zh" }
  ],
  1: [{ text: 'こんにちは、元気ですか？', lang: 'ja' }],
  2: [{ text: '你好，你怎么样？', lang: 'zh' }],
  3: [{ text: 'Hello, how are you?', lang: 'en' }]
});


  const messagesEndRef = useRef(null);




  function speakSingleLangMessage(text, lang) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voices = synth.getVoices();
    console.log('Available voices:', voices);

    const voice = voices.find(v => v.lang.startsWith(lang));
    if (voice) utterance.voice = voice;
    else console.warn(`No matching voice for lang: ${lang}`);

    synth.speak(utterance);
  }
  function speakMultiLangMessage(chunks) {
    const synth = window.speechSynthesis;

    function speakChunk(i) {
      if (i >= chunks.length) return;

      const utterance = new SpeechSynthesisUtterance(chunks[i].text);
      utterance.lang = chunks[i].lang;
      const voices = synth.getVoices();
      const voice = voices.find(v => v.lang.startsWith(chunks[i].lang));
      if (voice) utterance.voice = voice;

      utterance.onend = () => speakChunk(i + 1);
      synth.speak(utterance);
    }

    speakChunk(0);
  }


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // For English-like langs, split by spaces
  const splitMessageToWords = (text) => text.split(/\s+/).filter(Boolean);

  

  const fetchChunks = async (text) => {
    try {
      const res = await fetch('/api/chunk-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      return data; // [{ text: "...", lang: "en" }, ...]
    } catch (err) {
      console.error('Chunk fetch failed:', err);
      return null;
    }
  };
  

  // For non-space langs, fetch tokens from backend
  const fetchTokens = async (msgIndex, text, langCode) => {
    if (tokensByMsg[msgIndex]) return; // already have tokens

    try {
      const res = await fetch('/api/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langCode }),
      });
      const data = await res.json();
      setTokensByMsg(prev => ({ ...prev, [msgIndex]: data.tokens }));
    } catch (err) {
      console.error('Tokenize fetch failed:', err);
      setTokensByMsg(prev => ({ ...prev, [msgIndex]: [] }));
    }
  };

  // On component mount and whenever messages change, fetch tokens for non-space langs
  useEffect(() => {
    messages.forEach((msg, i) => {
      if (!isSpaceLang(msg.langCode)) {
        fetchTokens(i, msg.text, msg.langCode);
      }
    });
  }, [messages]);



   const sendMessage = async () => {
  if (!input.trim()) return;
  const userMsg = { from: 'user', text: input, langCode: 'en' };
  setMessages(prev => [...prev, userMsg]);
  setInput('');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    const botReply = { from: 'bot', text: data.reply, langCode: data.langCode || 'en' };

    const chunks = await fetchChunks(data.reply);
    if (chunks && chunks.length > 1) {
      botReply.langCode = 'multi';
      setTokensByMsg(prev => ({
        ...prev,
        [messages.length + 1]: chunks,
      }));
    }

    setMessages(prev => [...prev, botReply]);
  } catch (err) {
    console.error('Failed to fetch bot reply:', err);
  }
};


  const onWordClick = async (word) => {
    try {
      const res = await fetch('/api/word-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      const data = await res.json();
      setSelectedWord(data);
    } catch (err) {
      console.error('Error fetching word info:', err);
    }
  };
 

    return (
    <main className="flex-grow p-4 overflow-auto bg-gray-100 min-h-screen">
      <div className="h-96 max-w-xl mx-auto flex flex-col space-y-3 w-full overflow-y-auto scrollbar-hide p-2 bg-white shadow rounded">
        {messages.map((msg, i) => {
  // Fallback tokens: if you don’t have tokensByMsg yet, split on spaces for space-delimited langs
  const tokens = tokensByMsg[i] && tokensByMsg[i].length > 0
    ? tokensByMsg[i]
    : isSpaceLang(msg.langCode)
    ? msg.text.split(' ')
    : [msg.text]; // if no tokens, fallback to full text as single chunk
    const lang = msg.langCode || 'en'; // fallback for test messages

  return (
    <div
      key={i}
      className={`p-2 rounded ${
        msg.from === 'bot' ? 'bg-blue-200 self-start' : 'bg-green-200 self-end'
      }`}
    >
      {tokens.map((word, idx) => {
  const displayText = typeof word === 'string' ? word : word.text;

  return (
    <span
      key={idx}
      className="relative group cursor-pointer"
      onClick={() => onWordClick(displayText)}
    >
      <span className="group-hover:bg-yellow-300 rounded transition duration-150">
        {displayText}
      </span>{' '}
    </span>
  );
})}

      <button
        className="mt-2 text-xs text-blue-500 hover:underline self-start"
        onClick={() => navigator.clipboard.writeText(msg.text)}
      >
        Copy
      </button>
      <button
          className="text-xs text-purple-500 hover:underline"
          onClick={() => {
            const lang = msg.langCode || 'en'; // Make sure this is actually 'ja' or 'zh' when needed

            if (!tokensByMsg[i] || tokensByMsg[i].length === 0) {
              // No token splitting (assume single-language message)
              speakSingleLangMessage(msg.text, lang);
            } else {
              // If tokensByMsg[i] exists and includes chunks like:
              // [{ text: "こんにちは", lang: "ja" }, { text: " hello", lang: "en" }]
              speakMultiLangMessage(tokensByMsg[i]);
            }
          }}
        >
          🔊 Read Aloud
        </button>
    </div>
  );
})}

        <div ref={messagesEndRef} />
      </div>

      <div className="max-w-xl mx-auto mt-4 flex">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-r"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>

      <WordInfoPanel wordData={testWords[1]} onClose={() => setSelectedWord(null)} />
    </main>
  );
}
