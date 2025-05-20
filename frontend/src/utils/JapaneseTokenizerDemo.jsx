import React, { useEffect, useState } from 'react';
import kuromoji from 'kuromoji';

export default function JapaneseTokenizerDemo() {
  const [tokenizer, setTokenizer] = useState(null);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    kuromoji.builder({ dicPath: '/kuromoji/dict/' }).build((err, tokenizerInstance) => {
      if (err) {
        console.error(err);
        return;
      }
      setTokenizer(tokenizerInstance);
    });
  }, []);

  const tokenizeText = (text) => {
    if (!tokenizer) return;
    const tokens = tokenizer.tokenize(text);
    setTokens(tokens);
  };

  return (
    <div>
      <button onClick={() => tokenizeText("こんにちは、元気ですか？")}>
        Tokenize Japanese text
      </button>

      <ul>
        {tokens.map((token, i) => (
          <li key={i}>
            {token.surface_form} - {token.pos} ({token.pos_detail_1})
          </li>
        ))}
      </ul>
    </div>
  );
}
