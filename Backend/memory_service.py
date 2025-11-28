import json
from datetime import datetime
from typing import Optional, List, Dict, Any

from database import db, Memory, Session, Event

class DatabaseMemoryService:
    def __init__(self, app_name: str = "medical_agent"):
        self.app_name = app_name
    
    def add_memory(self, user_id: str, content: str, memory_type: str = "general", source_session_id: Optional[str] = None) -> Memory:
        memory = Memory(
            user_id=user_id,
            app_name=self.app_name,
            content=content,
            memory_type=memory_type,
            source_session_id=source_session_id
        )
        db.session.add(memory)
        db.session.commit()
        return memory
    
    def add_session_to_memory(self, user_id: str, session_id: str, summary: Optional[str] = None) -> Optional[Memory]:
        session = Session.query.filter_by(id=session_id, app_name=self.app_name, user_id=user_id).first()
        if not session:
            return None
        
        events = Event.query.filter_by(session_id=session_id).order_by(Event.timestamp).all()
        if not events:
            return None
        
        if summary:
            content = summary
        else:
            conversation_parts = []
            for event in events:
                conversation_parts.append(f"{event.role}: {event.content}")
            content = "\n".join(conversation_parts)
        
        memory = Memory(
            user_id=user_id,
            app_name=self.app_name,
            content=content,
            memory_type="session_summary",
            source_session_id=session_id
        )
        db.session.add(memory)
        db.session.commit()
        return memory
    
    def search_memories(self, user_id: str, query: str, limit: int = 5) -> List[Memory]:
        query_lower = query.lower()
        keywords = query_lower.split()
        
        memories = Memory.query.filter_by(app_name=self.app_name, user_id=user_id).all()
        
        scored_memories = []
        for memory in memories:
            content_lower = memory.content.lower()
            score = sum(1 for keyword in keywords if keyword in content_lower)
            if score > 0:
                scored_memories.append((memory, score))
        
        scored_memories.sort(key=lambda x: x[1], reverse=True)
        return [m for m, _ in scored_memories[:limit]]
    
    def get_all_memories(self, user_id: str, memory_type: Optional[str] = None) -> List[Memory]:
        query = Memory.query.filter_by(app_name=self.app_name, user_id=user_id)
        if memory_type:
            query = query.filter_by(memory_type=memory_type)
        return query.order_by(Memory.created_at.desc()).all()
    
    def delete_memory(self, memory_id: int, user_id: str) -> bool:
        memory = Memory.query.filter_by(id=memory_id, user_id=user_id, app_name=self.app_name).first()
        if memory:
            db.session.delete(memory)
            db.session.commit()
            return True
        return False
    
    def get_context_for_agent(self, user_id: str, current_query: str, max_memories: int = 3) -> str:
        relevant_memories = self.search_memories(user_id, current_query, limit=max_memories)
        
        if not relevant_memories:
            return ""
        
        context_parts = ["### Relevant Past Information:"]
        for memory in relevant_memories:
            context_parts.append(f"- {memory.content[:500]}...")
        
        return "\n".join(context_parts)
