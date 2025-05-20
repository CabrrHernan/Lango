from flask import Flask, request, jsonify
import some_language_detection_lib  # Replace with your chosen library
import some_tokenizer  # Replace with your tokenizer for JP/CN etc.
from database import db
from models import Word
import requests  # for external API calls
import re


app = Flask(__name__)

#Detects the languages in a msg
def detect_languages(text):
    # Example stub - replace with actual detection logic
    # Returns a list of language codes detected, e.g. ['en', 'ja']
    return some_language_detection_lib.detect(text)

#Parces msg and finds the "spaces" in non-space langagues
def tokenize(text, lang):
    # Only tokenize if lang is non-space language
    if lang in ['ja', 'zh']:  # Japanese, Chinese, etc.
        return some_tokenizer.tokenize(text)
    else:
        return text.split()


def chunk_by_language_ai(text):
    # Naive token-based split
    import re
    tokens = re.findall(r'\w+|\W+', text)
    
    chunks = []
    current_chunk = ""
    current_lang = None

    for token in tokens:
        result = lang_detector(token[:50])[0]  # avoid long tokens
        lang = result['label'].lower().replace("__label__", "")
        
        if lang != current_lang:
            if current_chunk:
                chunks.append({'text': current_chunk.strip(), 'lang': current_lang})
            current_chunk = token
            current_lang = lang
        else:
            current_chunk += token

    if current_chunk:
        chunks.append({'text': current_chunk.strip(), 'lang': current_lang})
        
    return chunks


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    detected_langs = detect_languages(message)

    # For demo, just echoing back message; you can replace with AI/chatbot reply here
    bot_reply = f"Echo: {message}"

    # Build tokens for each language segment (simplified here as one language)
    tokens = []
    for lang in detected_langs:
        if lang in ['ja', 'zh']:
            tokens = tokenize(message, lang)
            break  # For simplicity, only tokenize first non-space lang

    response = {
        'reply': bot_reply,
        'langCode': detected_langs[0] if detected_langs else 'en',
        'tokens': tokens if tokens else None
    }
    return jsonify(response)



# Helper: fetch definitions from external dictionary API
def fetch_definitions(word, lang_code):
    try:
        url = f"https://api.dictionaryapi.dev/api/v2/entries/{lang_code}/{word}"
        response = requests.get(url)
        if response.status_code != 200:
            return None
        data = response.json()
        # Simplify: get first definition from first meaning
        for entry in data:
            meanings = entry.get("meanings", [])
            if meanings:
                defs = meanings[0].get("definitions", [])
                if defs:
                    return defs[0].get("definition")
        return None
    except Exception as e:
        print(f"API fetch error: {e}")
        return None

#Used to make non-Alphabet words into Alphabet versions 
def needs_romanization(word):
    # True if word contains non-ASCII letters
    return bool(re.search(r'[^a-zA-Z]', word))

@app.route('/api/word/<lang_code>/<word>', methods=['GET'])
def get_word_info(lang_code, word):
    word_entry = Word.query.filter_by(word=word, lang_code=lang_code).first()

    if word_entry:
        word_entry.seen_count += 1
        db.session.commit()
        return jsonify({
            "word": word_entry.word,
            "lang_code": word_entry.lang_code,
            "native_definition": word_entry.native_definition,
            "english_definition": word_entry.english_definition,
            "romanized": word_entry.romanized if needs_romanization(word_entry.word) else None,
            "seen_count": word_entry.seen_count
        })

    native_def = fetch_definitions(word, lang_code)
    english_def = fetch_definitions(word, 'en')# Until langauge selections is an option

    romanized = None  # keep null unless you add romanization later

    new_word = Word(
        word=word,
        lang_code=lang_code,
        native_definition=native_def,
        english_definition=english_def,
        romanized=romanized,
        seen_count=1
    )
    db.session.add(new_word)
    db.session.commit()

    return jsonify({
        "word": new_word.word,
        "lang_code": new_word.lang_code,
        "native_definition": new_word.native_definition,
        "english_definition": new_word.english_definition,
        "romanized": None,  # keep null
        "seen_count": new_word.seen_count
    })


if __name__ == '__main__':
    app.run(debug=True)
