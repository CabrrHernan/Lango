// src/utils/languageUtils.js
import { franc } from 'franc';

export function detectLang(word) {
  // Heuristic detection based on Unicode ranges
  if (/[\u3040-\u30FF]/.test(word)) {
    console.log(`-> Detected: ja-JP`);
    return 'ja-JP'; // Hiragana or Katakana
  }
    
  if (/[\u4E00-\u9FFF]/.test(word)) {
    console.log(`-> Detected: zh-CN`);
    return 'zh-CN';
  }

  // Fallback to franc (for longer Latin-script words)
  const langCode = franc(word);
  const map = {
    'eng': 'en-US',
    'spa': 'es-ES',
    'fra': 'fr-FR',
    'deu': 'de-DE',
    'ita': 'it-IT',
    'por': 'pt-PT',
    'rus': 'ru-RU',
    // Extend as needed
  };

  return map[langCode] || 'en-US';
}

