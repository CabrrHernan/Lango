from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db
from models import Word

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///words.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

with app.app_context():
    db.create_all()

@app.route('/api/words', methods=['GET'])
def get_words():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    words = Word.query.filter_by(user_id=user_id).all()
    result = []
    for w in words:
        result.append({
            "id": w.id,
            "word": w.word,
            "normalized": w.normalized,
            "romanized": w.romanized,
            "language": w.language,
            "definition_native": w.definition_native,
            "definition_english": w.definition_english,
            "times_seen": w.times_seen
        })
    return jsonify(result)


@app.route('/api/words', methods=['POST'])
def add_or_update_word():
    data = request.json
    required = ['userId', 'word', 'normalized', 'language']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    word_entry = Word.query.filter_by(user_id=data['userId'], word=data['word']).first()
    if word_entry:
        word_entry.times_seen += 1
        # Optionally update definitions or romanized if provided
        if 'definition_native' in data:
            word_entry.definition_native = data['definition_native']
        if 'definition_english' in data:
            word_entry.definition_english = data['definition_english']
        if 'romanized' in data:
            word_entry.romanized = data['romanized']
    else:
        word_entry = Word(
            user_id=data['userId'],
            word=data['word'],
            normalized=data['normalized'],
            romanized=data.get('romanized'),
            language=data['language'],
            definition_native=data.get('definition_native'),
            definition_english=data.get('definition_english'),
            times_seen=1
        )
        db.session.add(word_entry)

    db.session.commit()
    return jsonify({"message": "Word saved", "wordId": word_entry.id})

@app.route('/api/words/<int:word_id>', methods=['DELETE'])
def delete_word(word_id):
    word_entry = Word.query.get(word_id)
    if not word_entry:
        return jsonify({"error": "Word not found"}), 404
    db.session.delete(word_entry)
    db.session.commit()
    return jsonify({"message": "Word deleted"})


if __name__ == '__main__':
    app.run(debug=True)
