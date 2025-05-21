import React, { useState } from 'react';

function SpellCheckInput() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const checkSpelling = async (word) => {
    if (!word) return;

    try {
      const response = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Spell check error:', error);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);

    // Optionally only check the last typed word or after a pause
    const lastWord = val.trim().split(/\s+/).pop();
    checkSpelling(lastWord);
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Type something..."
      />
      {result && (
        <div>
          <p>Original: {result.original}</p>
          {result.valid ? (
            <p>Corrected: {result.corrected}</p>
          ) : (
            <p style={{ color: 'red' }}>Word not recognized</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SpellCheckInput;
