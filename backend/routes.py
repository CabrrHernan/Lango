from flask import Blueprint, request, jsonify
from . import db
from .models import User, Language, Word, WordLanguage, UserWord, Message, Tag

app = Flask(__name__)
bp = Blueprint("api", __name__, url_prefix="/api")

# ---------------------------
# User endpoints
# ---------------------------
@bp.route("/users", methods=["POST"])
def create_user():
    data = request.json
    user = User(
        email=data["email"],
        name=data.get("name"),
        native_language=data["native_language"],
        user_script=data.get("user_script")
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "email": user.email})

@bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "native_language": user.native_language
    })


# ---------------------------
# Language endpoints
# ---------------------------
@bp.route("/languages", methods=["GET"])
def list_languages():
    langs = Language.query.all()
    return jsonify([{"code": l.code, "name": l.name} for l in langs])

# ---------------------------
# Word endpoints
# ---------------------------
@bp.route("/words", methods=["POST"])
def add_word():
    data = request.json
    word = Word(spelling=data["spelling"])
    db.session.add(word)
    db.session.commit()

    for lang_def in data.get("languages", []):
        wl = WordLanguage(
            word_id=word.id,
            lang_code=lang_def["lang_code"],
            definitions=lang_def["definitions"],
            user_script=lang_def.get("user_script")
        )
        db.session.add(wl)
    db.session.commit()
    return jsonify({"id": word.id, "spelling": word.spelling})

@api.route('/word/<int:word_language_id>', methods=['GET'])
def get_word(word_language_id):
    word_lang = WordLanguage.query.get(word_language_id)
    if not word_lang:
        abort(404, description="Word not found")

    # Build tags array
    tags = [tag.name for tag in word_lang.tags]

    # Build definitions array
    definitions = []
    for d in word_lang.definitions:  # definitions stored as JSON
        definitions.append({
            "native": d.get("native"),
            "english": d.get("english"),
            "romanized": d.get("romanized"),
            "part_of_speech": d.get("part_of_speech"),
            "rarity_level": d.get("rarity_level"),
            "examples": d.get("examples", [])
        })

    response = {
        "id": word_lang.id,
        "word": word_lang.word.spelling,
        "lang_code": word_lang.lang_code,
        "seen_count": word_lang.seen_count,
        "click_count": word_lang.click_count,
        "used_count": word_lang.used_count,
        "confidence_score": word_lang.confidence_score,
        "definitions": definitions,
        "tags": tags,
        "romanized": word_lang.user_script,
        "media": getattr(word_lang, 'media', []),  # optional field if you add media later
    }

    return jsonify(response)
