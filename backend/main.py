from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional, List, Dict
import os
import uvicorn
import joblib
import numpy as np
from dotenv import load_dotenv

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_BACKEND_DIR, ".env"))
import json
import hashlib
from datetime import datetime
import chat_service

app = FastAPI(title="Heart Disease Prediction API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class HealthData(BaseModel): 
    age: int
    sex: int  # 1 = male, 0 = female
    chest_pain_type: int  # 0-3
    resting_bp: int  # mm Hg
    cholesterol: int  # mg/dl
    fasting_bs: int  # 1 = >120 mg/dl, 0 = <=120 mg/dl
    resting_ecg: int  # 0-2
    max_heart_rate: int
    exercise_angina: int  # 1 = yes, 0 = no
    st_depression: float
    st_slope: int  # 0-2
    num_vessels: int  # 0-3
    thalassemia: int  # 0-2
    
    # Additional health and lifestyle features (optional with defaults)
    smoking: int = 0  # 0 = no, 1 = yes
    alcohol_intake: int = 0  # 0 = none, 1 = moderate, 2 = high
    physical_activity: int = 1  # 0 = low, 1 = moderate, 2 = high
    bmi: float = 25.0  # must be > 0 and < 60
    diabetes: int = 0  # 0 = no, 1 = yes
    family_history: int = 0  # 0 = no, 1 = yes
    
    class Config:
        schema_extra = {
            "example": {
                "age": 45,
                "sex": 1,
                "chest_pain_type": 2,
                "resting_bp": 130,
                "cholesterol": 200,
                "fasting_bs": 0,
                "resting_ecg": 0,
                "max_heart_rate": 150,
                "exercise_angina": 0,
                "st_depression": 1.0,
                "st_slope": 1,
                "num_vessels": 0,
                "thalassemia": 2,
                "smoking": 0,
                "alcohol_intake": 1,
                "physical_activity": 1,
                "bmi": 25.5,
                "diabetes": 0,
                "family_history": 1
            }
        }
    
    @validator('max_heart_rate', pre=True)
    def convert_max_heart_rate(cls, v):
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                raise ValueError('max_heart_rate must be a valid number')
        return v
    
    @validator('st_depression', pre=True)
    def convert_st_depression(cls, v):
        if isinstance(v, str):
            try:
                return float(v)
            except ValueError:
                raise ValueError('st_depression must be a valid number')
        return v
    
    @validator('smoking', pre=True)
    def validate_smoking(cls, v):
        if isinstance(v, str):
            try:
                v = int(v)
            except ValueError:
                raise ValueError('smoking must be 0 (no) or 1 (yes)')
        if v not in [0, 1]:
            raise ValueError('smoking must be 0 (no) or 1 (yes)')
        return v
    
    @validator('alcohol_intake', pre=True)
    def validate_alcohol_intake(cls, v):
        if isinstance(v, str):
            try:
                v = int(v)
            except ValueError:
                raise ValueError('alcohol_intake must be 0 (none), 1 (moderate), or 2 (high)')
        if v not in [0, 1, 2]:
            raise ValueError('alcohol_intake must be 0 (none), 1 (moderate), or 2 (high)')
        return v
    
    @validator('physical_activity', pre=True)
    def validate_physical_activity(cls, v):
        if isinstance(v, str):
            try:
                v = int(v)
            except ValueError:
                raise ValueError('physical_activity must be 0 (low), 1 (moderate), or 2 (high)')
        if v not in [0, 1, 2]:
            raise ValueError('physical_activity must be 0 (low), 1 (moderate), or 2 (high)')
        return v
    
    @validator('bmi', pre=True)
    def validate_bmi(cls, v):
        if isinstance(v, str):
            try:
                v = float(v)
            except ValueError:
                raise ValueError('bmi must be a valid number')
        if not isinstance(v, (int, float)):
            raise ValueError('bmi must be a number')
        if v <= 0 or v >= 60:
            raise ValueError('bmi must be greater than 0 and less than 60')
        return float(v)
    
    @validator('diabetes', pre=True)
    def validate_diabetes(cls, v):
        if isinstance(v, str):
            try:
                v = int(v)
            except ValueError:
                raise ValueError('diabetes must be 0 (no) or 1 (yes)')
        if v not in [0, 1]:
            raise ValueError('diabetes must be 0 (no) or 1 (yes)')
        return v
    
    @validator('family_history', pre=True)
    def validate_family_history(cls, v):
        if isinstance(v, str):
            try:
                v = int(v)
            except ValueError:
                raise ValueError('family_history must be 0 (no) or 1 (yes)')
        if v not in [0, 1]:
            raise ValueError('family_history must be 0 (no) or 1 (yes)')
        return v

class PredictionResponse(BaseModel):
    prediction: int  # 0 = no disease, 1 = has disease
    confidence: float  # percentage
    risk_score: float  # 0-100 scale
    risk_level: str  # Low/Medium/High
    advice: List[str]  # personalized recommendations
    contributing_factors: List[dict]

@app.get("/")
async def root():
    return {"message": "Heart Disease Prediction API"}

# User data models
class User(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str
    dateOfBirth: str
    createdAt: str
    smoking: Optional[int] = 0
    alcohol_intake: Optional[int] = 0
    physical_activity: Optional[int] = 1
    bmi: Optional[float] = 25.0
    diabetes: Optional[int] = 0
    family_history: Optional[int] = 0
    avatar: Optional[str] = "teal"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    email: str
    firstName: str
    lastName: str
    dateOfBirth: str
    createdAt: str
    smoking: Optional[int] = 0
    alcohol_intake: Optional[int] = 0
    physical_activity: Optional[int] = 1
    bmi: Optional[float] = 25.0
    diabetes: Optional[int] = 0
    family_history: Optional[int] = 0
    avatar: Optional[str] = "teal"


class ChatMessageItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_email: str
    history: Optional[List[ChatMessageItem]] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    messages: List[dict]

class ChatSessionSummary(BaseModel):
    id: str
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    preview: str = ""

# Load model and scaler at startup
model = None
scaler = None
feature_names = None

# In-memory user storage (in production, use a database)
users_db: Dict[str, User] = {}
USERS_FILE = "users.json"

def load_users():
    """Load users from file"""
    global users_db
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r') as f:
                users_data = json.load(f)
                users_db = {user['email']: User(**user) for user in users_data}
    except Exception as e:
        print(f"Error loading users: {e}")
        users_db = {}

def save_users():
    """Save users to file"""
    try:
        users_data = [user.dict() for user in users_db.values()]
        with open(USERS_FILE, 'w') as f:
            json.dump(users_data, f, indent=2)
    except Exception as e:
        print(f"Error saving users: {e}")

def hash_password(password: str) -> str:
    """Hash password for storage"""
    return hashlib.sha256(password.encode()).hexdigest()

# Load users on startup
load_users()

@app.on_event("startup")
async def load_model():
    global model, scaler, feature_names
    try:
        model = joblib.load('models/heart_disease_model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        feature_names = joblib.load('models/feature_names.pkl')
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")

    if chat_service._get_openai_key():
        print("OpenAI API key loaded — chatbot AI mode enabled.")
    else:
        print("OPENAI_API_KEY not set — chatbot running in demo mode.")

def get_risk_level(confidence: float) -> str:
    """Determine risk level based on confidence score"""
    if confidence < 60:
        return "Low"
    elif confidence < 80:
        return "Medium"
    else:
        return "High"

def get_contributing_factors(data_dict: dict, feature_importance: dict) -> List[dict]:
    """Get top contributing factors with their importance"""
    factors = []
    for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:5]:
        factors.append({
            "feature": feature,
            "importance": round(importance * 100, 2),
            "value": data_dict.get(feature, "N/A")
        })
    return factors

class ProfileUpdate(BaseModel):
    email: str
    firstName: str
    lastName: str
    dateOfBirth: str
    smoking: Optional[int] = 0
    alcohol_intake: Optional[int] = 0
    physical_activity: Optional[int] = 1
    bmi: Optional[float] = 25.0
    diabetes: Optional[int] = 0
    family_history: Optional[int] = 0
    avatar: Optional[str] = "teal"

@app.post("/signup", response_model=UserResponse)
async def signup_user(user: User):
    """Register a new user"""
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password for security
    hashed_password = hash_password(user.password)
    
    # Create new user with hashed password
    new_user = User(
        email=user.email,
        password=hashed_password,
        firstName=user.firstName,
        lastName=user.lastName,
        dateOfBirth=user.dateOfBirth,
        createdAt=datetime.now().isoformat(),
        smoking=user.smoking,
        alcohol_intake=user.alcohol_intake,
        physical_activity=user.physical_activity,
        bmi=user.bmi,
        diabetes=user.diabetes,
        family_history=user.family_history,
        avatar=user.avatar
    )
    
    # Store user
    users_db[user.email] = new_user
    save_users()
    
    # Return user without password
    return UserResponse(
        email=new_user.email,
        firstName=new_user.firstName,
        lastName=new_user.lastName,
        dateOfBirth=new_user.dateOfBirth,
        createdAt=new_user.createdAt,
        smoking=new_user.smoking,
        alcohol_intake=new_user.alcohol_intake,
        physical_activity=new_user.physical_activity,
        bmi=new_user.bmi,
        diabetes=new_user.diabetes,
        family_history=new_user.family_history,
        avatar=new_user.avatar
    )

@app.post("/login", response_model=UserResponse)
async def login_user(login_data: UserLogin):
    """Authenticate user login"""
    if login_data.email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    stored_user = users_db[login_data.email]
    hashed_input_password = hash_password(login_data.password)
    
    if stored_user.password != hashed_input_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Return user without password
    return UserResponse(
        email=stored_user.email,
        firstName=stored_user.firstName,
        lastName=stored_user.lastName,
        dateOfBirth=stored_user.dateOfBirth,
        createdAt=stored_user.createdAt,
        smoking=stored_user.smoking or 0,
        alcohol_intake=stored_user.alcohol_intake or 0,
        physical_activity=stored_user.physical_activity or 1,
        bmi=stored_user.bmi or 25.0,
        diabetes=stored_user.diabetes or 0,
        family_history=stored_user.family_history or 0,
        avatar=stored_user.avatar or "teal"
    )

@app.post("/update-profile", response_model=UserResponse)
async def update_profile(data: ProfileUpdate):
    """Update user profile and lifestyle defaults"""
    if data.email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    stored_user = users_db[data.email]
    
    # Update fields
    stored_user.firstName = data.firstName
    stored_user.lastName = data.lastName
    stored_user.dateOfBirth = data.dateOfBirth
    stored_user.smoking = data.smoking
    stored_user.alcohol_intake = data.alcohol_intake
    stored_user.physical_activity = data.physical_activity
    stored_user.bmi = data.bmi
    stored_user.diabetes = data.diabetes
    stored_user.family_history = data.family_history
    stored_user.avatar = data.avatar
    
    users_db[data.email] = stored_user
    save_users()
    
    return UserResponse(
        email=stored_user.email,
        firstName=stored_user.firstName,
        lastName=stored_user.lastName,
        dateOfBirth=stored_user.dateOfBirth,
        createdAt=stored_user.createdAt,
        smoking=stored_user.smoking,
        alcohol_intake=stored_user.alcohol_intake,
        physical_activity=stored_user.physical_activity,
        bmi=stored_user.bmi,
        diabetes=stored_user.diabetes,
        family_history=stored_user.family_history,
        avatar=stored_user.avatar
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Healthcare AI chatbot endpoint"""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session_id = chat_service.get_or_create_session(
        request.session_id, request.user_email
    )

    history = None
    if request.history:
        history = [h.dict() for h in request.history]

    chat_service.append_message(session_id, "user", request.message.strip())

    reply = await chat_service.generate_reply(
        request.message.strip(),
        session_id,
        history=history,
    )

    chat_service.append_message(session_id, "assistant", reply)

    session = chat_service.chat_sessions[session_id]
    return ChatResponse(
        reply=reply,
        session_id=session_id,
        messages=session["messages"],
    )

@app.get("/chat/sessions/{user_email}", response_model=List[ChatSessionSummary])
async def get_chat_sessions(user_email: str):
    """Get all chat sessions for a user"""
    sessions = chat_service.get_user_sessions(user_email)
    return [ChatSessionSummary(**s) for s in sessions]

@app.get("/chat/sessions/{user_email}/{session_id}")
async def get_chat_session(user_email: str, session_id: str):
    """Get a specific chat session with full history"""
    if session_id not in chat_service.chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    session = chat_service.chat_sessions[session_id]
    if session.get("user_email") != user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    return session

@app.delete("/chat/sessions/{user_email}/{session_id}")
async def delete_chat_session(user_email: str, session_id: str):
    """Delete a chat session"""
    if session_id not in chat_service.chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    if chat_service.chat_sessions[session_id].get("user_email") != user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    del chat_service.chat_sessions[session_id]
    chat_service.save_sessions()
    return {"message": "Session deleted"}

def generate_personalized_advice(data: HealthData) -> List[str]:
    """Generate personalized health recommendations based on input values"""
    advice = []
    
    if data.cholesterol > 240:
        advice.append("Reduce fatty food intake and monitor cholesterol")
    
    if data.resting_bp > 140:
        advice.append("Control blood pressure with diet and medication")
    
    if data.smoking == 1:
        advice.append("Quit smoking to reduce heart risk")
    
    if data.physical_activity == 0:
        advice.append("Increase daily physical activity")
    
    if data.bmi > 30:
        advice.append("Work on weight loss and balanced diet")
    
    if data.diabetes == 1:
        advice.append("Monitor blood sugar regularly")
    
    if data.alcohol_intake == 2:
        advice.append("Reduce alcohol consumption")
    
    # Return 3-5 relevant suggestions (limit to 5 max)
    return advice[:5]

def get_risk_level_from_score(risk_score: float) -> str:
    """Determine risk level based on risk score"""
    if risk_score < 50:
        return "Low"
    elif risk_score <= 75:
        return "Medium"
    else:
        return "High"

def get_top_contributing_factors(data_dict: dict, feature_importance: dict, top_n: int = 3) -> List[dict]:
    """Get top N contributing factors"""
    # Sort features by importance
    sorted_features = sorted(
        feature_importance.items(), 
        key=lambda x: x[1], 
        reverse=True
    )
    
    # Get top N features
    top_factors = []
    for feature_name, importance in sorted_features[:top_n]:
        if feature_name in data_dict:
            top_factors.append({
                "feature": feature_name,
                "importance": round(importance * 100, 2),
                "value": str(data_dict[feature_name])
            })
    
    return top_factors

@app.options("/predict")
async def options_predict():
    """Handle OPTIONS preflight requests"""
    from fastapi.responses import Response
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.post("/predict", response_model=PredictionResponse)
async def predict_heart_disease(data: HealthData):
    if model is None or scaler is None or feature_names is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Basic validation before prediction
    if data.age <= 0:
        raise HTTPException(status_code=400, detail="Age must be greater than 0")
    if data.resting_bp < 50 or data.resting_bp > 250:
        raise HTTPException(status_code=400, detail="Resting blood pressure must be between 50 and 250 mm Hg")
    if data.bmi <= 0:
        raise HTTPException(status_code=400, detail="BMI must be greater than 0")
    
    # Convert input data to numpy array in the correct order
    # Final order: [age, sex, chest_pain_type, resting_bp, cholesterol,
    # fasting_bs, resting_ecg, max_heart_rate, exercise_angina,
    # st_depression, st_slope, num_vessels, thalassemia,
    # smoking, alcohol_intake, physical_activity, bmi, diabetes, family_history,
    # cholesterol_age_ratio, heart_rate_age_ratio]
    
    # Calculate derived features
    cholesterol_age_ratio = data.cholesterol / data.age
    heart_rate_age_ratio = data.max_heart_rate / data.age
    
    input_data = np.array([[
        data.age, data.sex, data.chest_pain_type, data.resting_bp, data.cholesterol,
        data.fasting_bs, data.resting_ecg, data.max_heart_rate, data.exercise_angina,
        data.st_depression, data.st_slope, data.num_vessels, data.thalassemia,
        data.smoking, data.alcohol_intake, data.physical_activity, data.bmi, data.diabetes, data.family_history,
        cholesterol_age_ratio, heart_rate_age_ratio
    ]])
    
    # Scale the input data
    input_scaled = scaler.transform(input_data)
    
    # Make prediction
    prediction = int(model.predict(input_scaled)[0])
    prediction_proba = model.predict_proba(input_scaled)[0]
    confidence = float(max(prediction_proba) * 100)
    
    # Calculate risk score (same as confidence for binary classification)
    risk_score = confidence
    
    # Get feature importance from the model (convert numpy types to Python native)
    feature_importance = {
        name: float(importance) 
        for name, importance in zip(feature_names, model.feature_importances_)
    }
    
    # Get contributing factors - include all new fields
    data_dict = {
        'age': data.age,
        'sex': data.sex,
        'chest_pain_type': data.chest_pain_type,
        'resting_bp': data.resting_bp,
        'cholesterol': data.cholesterol,
        'fasting_bs': data.fasting_bs,
        'resting_ecg': data.resting_ecg,
        'max_heart_rate': data.max_heart_rate,
        'exercise_angina': data.exercise_angina,
        'st_depression': data.st_depression,
        'st_slope': data.st_slope,
        'num_vessels': data.num_vessels,
        'thalassemia': data.thalassemia,
        'smoking': data.smoking,
        'alcohol_intake': data.alcohol_intake,
        'physical_activity': data.physical_activity,
        'bmi': data.bmi,
        'diabetes': data.diabetes,
        'family_history': data.family_history
    }
    
    # Generate personalized advice
    advice = generate_personalized_advice(data)
    
    # Get top 3 contributing factors
    contributing_factors = get_top_contributing_factors(data_dict, feature_importance, top_n=3)
    
    # Determine risk level based on risk score
    risk_level = get_risk_level_from_score(risk_score)
    
    return {
        "prediction": int(prediction),
        "confidence": round(confidence, 2),
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "advice": advice,
        "contributing_factors": contributing_factors
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
