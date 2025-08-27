from datetime import datetime
from app import db
from models import User, Word, WordLanguage, Tag

# Create a sample word
w = Word(spelling="pain")
db.session.add(w)

# Create sample language
from models import Language
lang = Language.query.get("en")
if not lang:
    lang = Language(code="en", name="English")
    db.session.add(lang)

# Create WordLanguage
wl = WordLanguage(
    word=w,
    lang_code="en",
    definitions=[
        {
            "native": "pain",
            "english": "pain",
            "romanized": "pain",
            "part_of_speech": "noun",
            "rarity_level": 1,
            "examples": [{"native": "I feel pain", "english": "I feel pain", "romanized": "I feel pain"}]
        }
    ],
    user_script="pain"
)

# Add a tag
tag1 = Tag(name="food", description="food-related")
db.session.add(tag1)
db.session.commit()  # need commit before adding relationships

wl.tags.append(tag1)
db.session.add(wl)
db.session.commit()
