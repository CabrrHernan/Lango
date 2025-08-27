from datetime import datetime
from . import db  # SQLAlchemy instance from __init__.py

# Association table for Word <-> Tags
word_tags = db.Table(
    'word_tags',
    db.Column('word_language_id', db.Integer, db.ForeignKey('word_language.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

# Association table for Message <-> Languages
message_languages = db.Table(
    'message_languages',
    db.Column('message_id', db.Integer, db.ForeignKey('message.id'), primary_key=True),
    db.Column('lang_code', db.String, db.ForeignKey('language.code'), primary_key=True)
)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    name = db.Column(db.String)
    native_language = db.Column(db.String, nullable=False)
    user_script = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    words = db.relationship('UserWord', back_populates='user')
    messages = db.relationship('Message', backref='user')


class Language(db.Model):
    code = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    native_name = db.Column(db.String)
    uses_spaces = db.Column(db.Boolean, default=True)
    requires_tokenization = db.Column(db.Boolean, default=False)
    supports_romanization = db.Column(db.Boolean, default=False)
    default_script = db.Column(db.String)
    direction = db.Column(db.String, default='ltr')

    word_links = db.relationship('WordLanguage', back_populates='language')
    messages = db.relationship('Message', secondary=message_languages, back_populates='languages')


class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    spelling = db.Column(db.String, nullable=False)  # actual text of the word


class WordLanguage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word_id = db.Column(db.Integer, db.ForeignKey('word.id'), nullable=False)
    lang_code = db.Column(db.String, db.ForeignKey('language.code'), nullable=False)
    
    definitions = db.Column(db.JSON, nullable=False)
    user_script = db.Column(db.String)

    seen_count = db.Column(db.Integer, default=0)
    click_count = db.Column(db.Integer, default=0)
    used_count = db.Column(db.Integer, default=0)
    
    last_seen = db.Column(db.DateTime)
    last_used = db.Column(db.DateTime)
    confidence_score = db.Column(db.Float, default=0.0)

    __table_args__ = (
        db.UniqueConstraint('word_id', 'lang_code', name='unique_word_language'),
    )

    word = db.relationship('Word', back_populates='languages')
    user_words = db.relationship('UserWord', back_populates='word_language')
    tags = db.relationship('Tag', secondary='word_tags', back_populates='words')


class UserWord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    word_language_id = db.Column(db.Integer, db.ForeignKey('word_language.id'), nullable=False)

    seen_count = db.Column(db.Integer, default=0)
    click_count = db.Column(db.Integer, default=0)
    used_count = db.Column(db.Integer, default=0)
    last_seen = db.Column(db.DateTime)
    last_used = db.Column(db.DateTime)
    confidence_score = db.Column(db.Float, default=0.0)
    is_known = db.Column(db.Boolean, default=False)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'word_language_id', name='unique_user_word'),
    )

    user = db.relationship('User', back_populates='words')
    word_language = db.relationship('WordLanguage', back_populates='user_words')


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    word_analysis = db.Column(db.JSON)  # optional AI breakdown
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ai_summary = db.Column(db.Text)
    ai_feedback = db.Column(db.Text)

    languages = db.relationship('Language', secondary=message_languages, back_populates='messages')


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)

    words = db.relationship('WordLanguage', secondary=word_tags, back_populates='tags')
