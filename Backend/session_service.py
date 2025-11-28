import json
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from database import db, Session, Event

class DatabaseSessionService:
    def __init__(self, app_name: str = "medical_agent"):
        self.app_name = app_name
    
    def create_session(self, user_id: str, session_id: Optional[str] = None, initial_state: Optional[Dict] = None) -> Session:
        if session_id is None:
            session_id = str(uuid.uuid4())
        
        existing = Session.query.filter_by(id=session_id, app_name=self.app_name, user_id=user_id).first()
        if existing:
            return existing
        
        session = Session(
            id=session_id,
            app_name=self.app_name,
            user_id=user_id,
            state=json.dumps(initial_state or {})
        )
        db.session.add(session)
        db.session.commit()
        return session
    
    def get_session(self, user_id: str, session_id: str) -> Optional[Session]:
        return Session.query.filter_by(id=session_id, app_name=self.app_name, user_id=user_id).first()
    
    def list_sessions(self, user_id: str) -> List[Session]:
        return Session.query.filter_by(app_name=self.app_name, user_id=user_id).order_by(Session.updated_at.desc()).all()
    
    def delete_session(self, user_id: str, session_id: str) -> bool:
        session = self.get_session(user_id, session_id)
        if session:
            db.session.delete(session)
            db.session.commit()
            return True
        return False
    
    def update_session_state(self, user_id: str, session_id: str, state: Dict) -> Optional[Session]:
        session = self.get_session(user_id, session_id)
        if session:
            session.state = json.dumps(state)
            session.updated_at = datetime.utcnow()
            db.session.commit()
            return session
        return None
    
    def add_event(self, user_id: str, session_id: str, role: str, content: str, metadata: Optional[Dict] = None) -> Optional[Event]:
        session = self.get_session(user_id, session_id)
        if not session:
            session = self.create_session(user_id, session_id)
        
        event = Event(
            session_id=session_id,
            role=role,
            content=content,
            event_metadata=json.dumps(metadata or {})
        )
        db.session.add(event)
        session.updated_at = datetime.utcnow()
        db.session.commit()
        return event
    
    def get_events(self, user_id: str, session_id: str, limit: Optional[int] = None) -> List[Event]:
        session = self.get_session(user_id, session_id)
        if not session:
            return []
        
        query = Event.query.filter_by(session_id=session_id).order_by(Event.timestamp)
        if limit:
            query = query.limit(limit)
        return query.all()
    
    def get_conversation_history(self, user_id: str, session_id: str, limit: Optional[int] = 10) -> List[Dict]:
        events = self.get_events(user_id, session_id, limit)
        return [
            {
                'role': event.role,
                'content': event.content
            }
            for event in events
        ]
    
    def compact_events(self, user_id: str, session_id: str, max_events: int = 20):
        session = self.get_session(user_id, session_id)
        if not session:
            return
        
        events = Event.query.filter_by(session_id=session_id).order_by(Event.timestamp).all()
        if len(events) > max_events:
            events_to_delete = events[:-max_events]
            for event in events_to_delete:
                db.session.delete(event)
            db.session.commit()
