import os
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.String(100), primary_key=True)
    app_name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.String(100), nullable=False)
    state = db.Column(db.Text, default='{}')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    events = db.relationship('Event', backref='session', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'app_name': self.app_name,
            'user_id': self.user_id,
            'state': json.loads(self.state) if self.state else {},
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'events': [event.to_dict() for event in self.events]
        }

class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.String(100), db.ForeignKey('sessions.id'), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    event_metadata = db.Column(db.Text, default='{}')
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'metadata': json.loads(self.event_metadata) if self.event_metadata else {}
        }

class Memory(db.Model):
    __tablename__ = 'memories'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(100), nullable=False)
    app_name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    memory_type = db.Column(db.String(50), default='general')
    source_session_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'app_name': self.app_name,
            'content': self.content,
            'memory_type': self.memory_type,
            'source_session_id': self.source_session_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

def init_db(app):
    db_path = os.path.join(os.path.dirname(__file__), 'agent_data.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
