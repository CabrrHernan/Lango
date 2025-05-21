from datetime import datetime
from sqlalchemy.sql import func

class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String, nullable=False)
    lang_code = db.Column(db.String, nullable=False)
    definitions = db.Column(db.JSON, nullable=False)  # list of definition objects
    user_script = db.Column(db.String, nullable=True)  # transliteration to user's script

    seen_count = db.Column(db.Integer, default=0)       # how many times word appeared in text
    click_count = db.Column(db.Integer, default=0)      # how many times user clicked for details
    used_count = db.Column(db.Integer, default=0)       # how many times user actively used the word

    last_seen = db.Column(db.DateTime, nullable=True)   # last time word was seen in user text
    last_used = db.Column(db.DateTime, nullable=True)   # last time user used the word

    confidence_score = db.Column(db.Float, default=0.0) # AI-driven confidence or familiarity score

    def mark_seen(self):
        self.seen_count += 1
        self.last_seen = datetime.utcnow()

    def mark_used(self):
        self.used_count += 1
        self.last_used = datetime.utcnow()

    def mark_clicked(self):
        self.click_count += 1

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    name = db.Column(db.String)
    native_language = db.Column(db.String, nullable=False)
    user_script = db.Column(db.String)  # used for transliteration
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserWord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    word_id = db.Column(db.Integer, db.ForeignKey('word.id'), nullable=False)

    # User-specific tracking info:
    seen_count = db.Column(db.Integer, default=0)
    click_count = db.Column(db.Integer, default=0)
    used_count = db.Column(db.Integer, default=0)

    last_seen = db.Column(db.DateTime)
    last_used = db.Column(db.DateTime)

    confidence_score = db.Column(db.Float, default=0.0)  # AI estimate of user's knowledge/confidence
    
    # Additional flags:
    is_known = db.Column(db.Boolean, default=False)   # e.g. user has marked this word as known

    # Relationships
    user = db.relationship('User', backref='known_words')
    word = db.relationship('Word', backref='user_associations')





    __table_args__ = (
        db.UniqueConstraint('user_id', 'word', name='unique_user_word'),
    )

class Language(db.Model):
    code = db.Column(db.String, primary_key=True)  # e.g. 'en', 'ja', 'zh'
    name = db.Column(db.String, nullable=False)    # e.g. 'English', 'Japanese'
    native_name = db.Column(db.String)             # e.g. '日本語', '中文'
    
    uses_spaces = db.Column(db.Boolean, default=True)       # true for English, false for Chinese, Japanese
    requires_tokenization = db.Column(db.Boolean, default=False)  # true for languages like Chinese, Japanese
    supports_romanization = db.Column(db.Boolean, default=False)  # true for Japanese, Korean, etc.
    
    default_script = db.Column(db.String)           # e.g. 'Latin', 'Cyrillic', 'Hiragana+Kanji'
    direction = db.Column(db.String, default='ltr') # 'ltr' or 'rtl' (Arabic, Hebrew = rtl)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    text = db.Column(db.Text, nullable=False)
    lang_code = db.Column(db.String, db.ForeignKey('language.code'), nullable=False)  # e.g., 'en', 'ja'

    word_analysis = db.Column(db.JSON)  # Optional: token breakdown, AI tagging
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    ai_summary = db.Column(db.Text)     # Optional: AI-generated summary or definition usage
    ai_feedback = db.Column(db.Text)    # Optional: grammatical or vocabulary corrections
    
