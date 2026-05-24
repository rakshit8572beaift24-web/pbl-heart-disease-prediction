import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Optional

SESSIONS_FILE = "chat_sessions.json"

HEALTHCARE_SYSTEM_PROMPT = """You are MediAI, a compassionate healthcare assistant for a heart disease prediction platform.
Your role is to provide general health education and wellness guidance related to:
- Heart health, cardiovascular wellness, and risk factors
- Healthy lifestyle (diet, exercise, sleep, stress)
- Understanding medical terms in simple language
- When to seek professional medical care

IMPORTANT RULES:
- You are NOT a doctor and cannot diagnose, prescribe, or replace professional medical advice.
- Always encourage users to consult qualified healthcare providers for diagnosis and treatment.
- If someone describes emergency symptoms (chest pain, difficulty breathing, stroke signs), urge them to call emergency services immediately.
- Keep responses clear, supportive, and concise (2-4 short paragraphs max unless asked for detail).
- Use plain language accessible to non-medical users."""

chat_sessions: Dict[str, dict] = {}


def load_sessions():
    global chat_sessions
    try:
        if os.path.exists(SESSIONS_FILE):
            with open(SESSIONS_FILE, "r") as f:
                chat_sessions = json.load(f)
    except Exception as e:
        print(f"Error loading chat sessions: {e}")
        chat_sessions = {}


def save_sessions():
    try:
        with open(SESSIONS_FILE, "w") as f:
            json.dump(chat_sessions, f, indent=2)
    except Exception as e:
        print(f"Error saving chat sessions: {e}")


def get_or_create_session(session_id: Optional[str], user_email: str) -> str:
    if session_id and session_id in chat_sessions:
        if chat_sessions[session_id].get("user_email") == user_email:
            return session_id

    new_id = str(uuid.uuid4())
    chat_sessions[new_id] = {
        "id": new_id,
        "user_email": user_email,
        "title": "New conversation",
        "messages": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    save_sessions()
    return new_id


def get_user_sessions(user_email: str) -> List[dict]:
    sessions = [
        {
            "id": s["id"],
            "title": s.get("title", "Conversation"),
            "created_at": s.get("created_at"),
            "updated_at": s.get("updated_at"),
            "preview": _last_user_message(s),
        }
        for s in chat_sessions.values()
        if s.get("user_email") == user_email
    ]
    return sorted(sessions, key=lambda x: x.get("updated_at", ""), reverse=True)


def _last_user_message(session: dict) -> str:
    for msg in reversed(session.get("messages", [])):
        if msg.get("role") == "user":
            return msg.get("content", "")[:80]
    return ""


def _auto_title(session: dict, first_message: str):
    if session.get("title") == "New conversation" and first_message:
        session["title"] = first_message[:50] + ("..." if len(first_message) > 50 else "")


def _get_openai_key() -> Optional[str]:
    key = os.getenv("OPENAI_API_KEY", "").strip()
    placeholders = {"", "your_openai_api_key_here", "sk-your-key-here"}
    return key if key not in placeholders else None


async def generate_reply(
    message: str,
    session_id: str,
    history: Optional[List[dict]] = None,
) -> str:
    api_key = _get_openai_key()
    if not api_key:
        return _fallback_reply(message)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key, timeout=90.0)
        messages = [{"role": "system", "content": HEALTHCARE_SYSTEM_PROMPT}]

        if history:
            for h in history[-10:]:
                if h.get("role") in ("user", "assistant") and h.get("content"):
                    messages.append({"role": h["role"], "content": h["content"]})
        else:
            session = chat_sessions.get(session_id, {})
            for h in session.get("messages", [])[-10:]:
                messages.append({"role": h["role"], "content": h["content"]})

        messages.append({"role": "user", "content": message})

        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            max_tokens=600,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI error: {e}")
        return (
            "I'm having trouble connecting to the AI service right now. "
            "Please try again in a moment. For urgent health concerns, contact a healthcare professional immediately."
        )


def _fallback_reply(message: str) -> str:
    lower = message.lower()
    if any(w in lower for w in ["chest pain", "heart attack", "can't breathe", "stroke"]):
        return (
            "⚠️ If you're experiencing chest pain, difficulty breathing, or stroke symptoms, "
            "please call emergency services (911) immediately.\n\n"
            "I'm running in demo mode without an OpenAI API key. "
            "Set OPENAI_API_KEY in your backend environment for full AI responses."
        )
    if any(w in lower for w in ["heart", "cardio", "cholesterol", "blood pressure"]):
        return (
            "Heart health tip: Regular exercise, a balanced diet low in saturated fats, "
            "managing stress, and avoiding smoking support cardiovascular wellness. "
            "Use our heart disease predictor on the dashboard for a risk assessment, "
            "and always follow up with your doctor.\n\n"
            "(Demo mode — add OPENAI_API_KEY for personalized AI answers.)"
        )
    return (
        "Thank you for your health question! I'm MediAI, your healthcare assistant. "
        "In demo mode, please set OPENAI_API_KEY in the backend for full AI-powered responses. "
        "For medical emergencies, contact emergency services. For personal health advice, consult your doctor."
    )


def append_message(session_id: str, role: str, content: str) -> dict:
    session = chat_sessions[session_id]
    session["messages"].append(
        {"role": role, "content": content, "timestamp": datetime.now().isoformat()}
    )
    session["updated_at"] = datetime.now().isoformat()
    if role == "user" and len(session["messages"]) == 1:
        _auto_title(session, content)
    save_sessions()
    return session


load_sessions()
