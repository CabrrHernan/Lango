import React, { useEffect, useState } from 'react';
import { fetchWords, deleteWord } from '../api/wordApi';

export default function WordList({ userId }) {
  const [words, setWords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetchWords(userId)
      .then(setWords)
      .catch(err => setError(err.message));
  }, [userId]);

  const handleDelete = async (id) => {
    try {
      await deleteWord(id);
      setWords(words.filter(w => w.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {words.map(w => (
        <li key={w.id}>
          {w.word} ({w.language}) - Seen {w.times_seen} times
          <button onClick={() => handleDelete(w.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
