import React, { useState } from 'react';

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! Ready to learn some new words today?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');
    // TODO: send input to backend and get bot reply
  };

  return (
    <main className="flex-grow p-4 overflow-auto bg-gray-100">
      <div className="max-w-xl mx-auto flex flex-col space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.from === 'bot' ? 'bg-blue-200 self-start' : 'bg-green-200 self-end'
            }`}
          >
            {msg.text}
          </div>
        ))}
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
      </div>
    </main>
  );
}
