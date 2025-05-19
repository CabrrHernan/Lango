import React, { useState, useRef, useEffect } from 'react';
import WordInfoPanel from './WordInfoPanel'; 


const testWords = [
  {
    word: "hello",
    count: 5,
    langCode: "en-US",
    nativeDefinition: "A greeting or expression of goodwill.",
    targetDefinition: "hello (English): A common greeting."
  },
  {
    word: "hola",
    count: 3,
    langCode: "es-ES",
    nativeDefinition: "Means 'hello' in Spanish.",
    targetDefinition: "hola (Español): Saludo informal o formal."
  },
  {
    word: "こんにちは",
    count: 2,
    langCode: "ja-JP",
    nativeDefinition: "A Japanese greeting meaning 'hello' or 'good afternoon'.",
    targetDefinition: "こんにちは（日本語）: 昼間の挨拶。"
  },
  {
    word: "bonjour",
    count: 4,
    langCode: "fr-FR",
    nativeDefinition: "A French greeting that means 'good day'.",
    targetDefinition: "bonjour (Français): Salutation utilisée pendant la journée."
  },
  {
    word: "hallo",
    count: 1,
    langCode: "de-DE",
    nativeDefinition: "German for 'hello'.",
    targetDefinition: "hallo (Deutsch): Eine allgemeine Begrüßung."
  },
  {
    word: "你好", 
    count: 3,
    langCode: "zh-CN",
    nativeDefinition: "Mandarin Chinese for 'hello'.",
    targetDefinition: "你好（中文）: 见面时使用的问候语。"
  }
];


export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! Ready to learn some new words today?' }
  ]);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [selectedWord, setSelectedWord] = useState(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
  if (!input.trim()) return;

  const userMsg = { from: 'user', text: input };
  setMessages(prev => [...prev, userMsg]);
  setInput('');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    const botReply = { from: 'bot', text: data.reply };

    setMessages(prev => [...prev, botReply]);
  } catch (err) {
    console.error('Failed to fetch bot reply:', err);
  }
};

  const wordCounts = {}; // Temporary store, will come from backend eventually

messages.forEach(msg => {
  msg.text.split(' ').forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/gi, ''); // strip punctuation
    wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
  });
});

  return (
    <main className="flex-grow p-4 overflow-auto bg-gray-100 min-h-screen">
      <div className="h-96 max-w-xl mx-auto flex flex-col space-y-3 w-full overflow-y-auto scrollbar-hide p-2 bg-white shadow rounded">

       {messages.map((msg, i) => (
  <div
    key={i}
    className={`p-2 rounded ${
      msg.from === 'bot' ? 'bg-blue-200 self-start' : 'bg-green-200 self-end'
    }`}
  >
    {msg.text.split(' ').map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/gi, '');
      const count = wordCounts[cleanWord] || 0;

      return (
        <span
          key={index}
          className="relative group cursor-pointer"
          onClick={() => setSelectedWord({ word: cleanWord, count })}
        >
          <span className="group-hover:bg-yellow-300 rounded transition duration-150">{word}</span>
          <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
            Seen {count} {count === 1 ? 'time' : 'times'}
          </span>{' '}
        </span>
      );
    })}
  </div>
))}
        <div ref={messagesEndRef} />
      </div>

      <div className="max-w-xl mx-auto mt-4 flex">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-r"
          onClick={sendMessage}
        >
          Send
        </button>
        {/*wordData={testWords[1]} */}
      </div>
      <WordInfoPanel
        
        wordData={selectedWord}
        onClose={() => setSelectedWord(null)}
      />
      
    </main>
  );
}
