import * as wanakana from 'wanakana';
import * as pinyin from 'pinyin';

export function transliterate(word, langCode) {
  switch (langCode) {
    case 'ja-JP':
      return wanakana.toRomaji(word);
    case 'zh-CN':
      return pinyin(word, { style: pinyin.STYLE_NORMAL }).flat().join(' ');
    default:
      return null;
  }
}
