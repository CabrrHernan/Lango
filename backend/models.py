from database import db

class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    word = db.Column(db.String, nullable=False)
    normalized = db.Column(db.String, nullable=False)
    romanized = db.Column(db.String)
    language = db.Column(db.String, nullable=False)
    definition_native = db.Column(db.Text)
    definition_english = db.Column(db.Text)
    times_seen = db.Column(db.Integer, default=1)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'word', name='unique_user_word'),
    )
