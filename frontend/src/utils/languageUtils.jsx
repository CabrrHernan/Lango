import { franc } from 'franc';
import TinySegmenter from 'tiny-segmenter';  

const segmenter = new TinySegmenter();


export function detectLang(text) {
  if (!text || text.length < 3) return 'en-US';

  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    console.log('-> Detected: ja-JP');
    return 'ja-JP';
  }

  if (/[\u4E00-\u9FFF]/.test(text)) {
    console.log('-> Detected: zh-CN');
    return 'zh-CN';
  }

  const langCode = franc(text);
  const map = {
    eng: 'en-US',
    spa: 'es-ES',
    fra: 'fr-FR',
    deu: 'de-DE',
    ita: 'it-IT',
    por: 'pt-PT',
    rus: 'ru-RU',
  };

  return map[langCode] || 'en-US';
}

export const tokenize = (text, kuromojiTokenizer = null) => {
  if (!text) return [];

  const lang = detectLang(text) || '';

  if (lang.startsWith('ja')) {
    if (kuromojiTokenizer) {
      const tokens = kuromojiTokenizer.tokenize(text);
      return tokens ? tokens.map(t => t.surface_form) : [];
    }
    // If tokenizer not ready, fallback to splitting by characters or spaces
    return text.split(''); // fallback for Japanese text without tokenizer
  }

  if (lang.startsWith('zh')) {
    if (typeof segmenter !== 'undefined' && segmenter.segment) {
      return segmenter.segment(text) || [];
    }
    // fallback for Chinese if no segmenter
    return text.split('');
  }

  if (['en', 'es', 'fr', 'de', 'it', 'pt'].some(l => lang.startsWith(l))) {
    return text.toLowerCase().split(/[\s,.!?;:"'()\-]+/).filter(Boolean);
  }

  // Fallback for any other language: split on spaces
  return text.split(' ').filter(Boolean);
};

