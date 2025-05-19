const BASE_URL = 'http://localhost:5000/api/words';

export async function fetchWords(userId) {
  const res = await fetch(`${BASE_URL}?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch words');
  return res.json();
}

export async function saveWord(wordData) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wordData),
  });
  if (!res.ok) throw new Error('Failed to save word');
  return res.json();
}

export async function deleteWord(wordId) {
  const res = await fetch(`${BASE_URL}/${wordId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete word');
  return res.json();
}
