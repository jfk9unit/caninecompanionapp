from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DogProfile(BaseModel):
    dog_id: str = Field(default_factory=lambda: f"dog_{uuid.uuid4().hex[:12]}")
    user_id: str
    name: str
    breed: str
    age_months: int
    weight_kg: float
    size: str  # small, medium, large
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DogProfileCreate(BaseModel):
    name: str
    breed: str
    age_months: int
    weight_kg: float
    size: str
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class TrainingModule(BaseModel):
    module_id: str = Field(default_factory=lambda: f"mod_{uuid.uuid4().hex[:12]}")
    title: str
    description: str
    level: str  # beginner, intermediate, advanced
    category: str  # obedience, behavior, tricks, agility
    steps: List[str]
    tips: List[str]
    duration_minutes: int
    order: int

class TrainingProgress(BaseModel):
    progress_id: str = Field(default_factory=lambda: f"prog_{uuid.uuid4().hex[:12]}")
    user_id: str
    dog_id: str
    module_id: str
    completed_steps: List[int] = []
    status: str = "not_started"  # not_started, in_progress, completed
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class HealthRecord(BaseModel):
    record_id: str = Field(default_factory=lambda: f"health_{uuid.uuid4().hex[:12]}")
    user_id: str
    dog_id: str
    record_type: str  # vaccination, checkup, medication, illness, surgery
    title: str
    description: str
    date: datetime
    vet_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HealthRecordCreate(BaseModel):
    dog_id: str
    record_type: str
    title: str
    description: str
    date: str  # ISO format
    vet_name: Optional[str] = None
    notes: Optional[str] = None

class SymptomAnalysis(BaseModel):
    symptoms: List[str]
    dog_id: str
    severity: str  # mild, moderate, severe
    additional_info: Optional[str] = None

class DailyTask(BaseModel):
    task_id: str = Field(default_factory=lambda: f"task_{uuid.uuid4().hex[:12]}")
    user_id: str
    dog_id: str
    title: str
    task_type: str  # walk, feed, play, grooming, training, medication
    scheduled_time: Optional[str] = None
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    recurring: bool = False
    recurrence_pattern: Optional[str] = None  # daily, weekly
    date: str  # YYYY-MM-DD
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DailyTaskCreate(BaseModel):
    dog_id: str
    title: str
    task_type: str
    scheduled_time: Optional[str] = None
    recurring: bool = False
    recurrence_pattern: Optional[str] = None
    date: str

class BehaviorLog(BaseModel):
    log_id: str = Field(default_factory=lambda: f"behav_{uuid.uuid4().hex[:12]}")
    user_id: str
    dog_id: str
    behavior_type: str  # aggression, anxiety, excitement, illness_sign, discomfort
    severity: str  # low, medium, high
    description: str
    triggers: Optional[List[str]] = []
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class BehaviorLogCreate(BaseModel):
    dog_id: str
    behavior_type: str
    severity: str
    description: str
    triggers: Optional[List[str]] = []
    notes: Optional[str] = None

class TravelChecklist(BaseModel):
    checklist_id: str = Field(default_factory=lambda: f"travel_{uuid.uuid4().hex[:12]}")
    user_id: str
    dog_id: str
    title: str
    destination: str
    travel_date: str
    items: List[dict]  # {item: str, checked: bool}
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TravelChecklistCreate(BaseModel):
    dog_id: str
    title: str
    destination: str
    travel_date: str
    items: List[dict]
    notes: Optional[str] = None

# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request) -> User:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        user_data = resp.json()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": user_data["name"], "picture": user_data.get("picture")}}
        )
    else:
        new_user = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    session_token = user_data.get("session_token", f"sess_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== DOG PROFILES ====================

@api_router.get("/dogs", response_model=List[dict])
async def get_dogs(user: User = Depends(get_current_user)):
    dogs = await db.dogs.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return dogs

@api_router.post("/dogs")
async def create_dog(dog_data: DogProfileCreate, user: User = Depends(get_current_user)):
    dog = DogProfile(user_id=user.user_id, **dog_data.model_dump())
    doc = dog.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.dogs.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.get("/dogs/{dog_id}")
async def get_dog(dog_id: str, user: User = Depends(get_current_user)):
    dog = await db.dogs.find_one({"dog_id": dog_id, "user_id": user.user_id}, {"_id": 0})
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    return dog

@api_router.put("/dogs/{dog_id}")
async def update_dog(dog_id: str, dog_data: DogProfileCreate, user: User = Depends(get_current_user)):
    result = await db.dogs.update_one(
        {"dog_id": dog_id, "user_id": user.user_id},
        {"$set": dog_data.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Dog not found")
    return await db.dogs.find_one({"dog_id": dog_id}, {"_id": 0})

@api_router.delete("/dogs/{dog_id}")
async def delete_dog(dog_id: str, user: User = Depends(get_current_user)):
    result = await db.dogs.delete_one({"dog_id": dog_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dog not found")
    return {"message": "Dog deleted"}

# ==================== TRAINING MODULES ====================

TRAINING_MODULES = [
    # Beginner - Puppy Basics
    {"module_id": "mod_puppy_01", "title": "House Training Basics", "description": "Essential potty training techniques for puppies", "level": "beginner", "category": "obedience", "steps": ["Establish a routine", "Pick a designated potty spot", "Use positive reinforcement", "Watch for signs", "Be patient and consistent"], "tips": ["Take puppy out after meals", "Praise immediately after success", "Never punish accidents"], "duration_minutes": 15, "order": 1},
    {"module_id": "mod_puppy_02", "title": "Basic Commands: Sit", "description": "Teach your dog the fundamental sit command", "level": "beginner", "category": "obedience", "steps": ["Hold treat above nose", "Move treat backward over head", "Say 'sit' as bottom touches ground", "Reward immediately", "Practice daily"], "tips": ["Keep sessions short (5 min)", "Use high-value treats", "Be consistent with hand signals"], "duration_minutes": 10, "order": 2},
    {"module_id": "mod_puppy_03", "title": "Leash Introduction", "description": "Getting your puppy comfortable with collar and leash", "level": "beginner", "category": "obedience", "steps": ["Let puppy sniff collar/leash", "Put collar on for short periods", "Attach leash indoors first", "Practice walking inside", "Graduate to backyard"], "tips": ["Make it positive experience", "Don't force or drag", "Reward calm behavior"], "duration_minutes": 20, "order": 3},
    {"module_id": "mod_puppy_04", "title": "Socialization Fundamentals", "description": "Exposing your puppy to new experiences safely", "level": "beginner", "category": "behavior", "steps": ["Introduce new sounds gradually", "Meet vaccinated friendly dogs", "Visit different environments", "Meet various people", "Expose to household noises"], "tips": ["Watch for stress signs", "Keep experiences positive", "Don't overwhelm"], "duration_minutes": 30, "order": 4},
    {"module_id": "mod_puppy_05", "title": "Crate Training", "description": "Making the crate a safe happy place", "level": "beginner", "category": "behavior", "steps": ["Choose right size crate", "Make it comfortable", "Feed meals in crate", "Practice closing door briefly", "Gradually increase time"], "tips": ["Never use crate as punishment", "Exercise before crate time", "Leave toys inside"], "duration_minutes": 25, "order": 5},
    
    # Intermediate
    {"module_id": "mod_inter_01", "title": "Stay Command", "description": "Teaching your dog to stay in place", "level": "intermediate", "category": "obedience", "steps": ["Start from sit position", "Say 'stay' with hand signal", "Take one step back", "Return and reward", "Gradually increase distance"], "tips": ["Use release word", "Don't rush distance", "Practice in different locations"], "duration_minutes": 15, "order": 6},
    {"module_id": "mod_inter_02", "title": "Recall Training", "description": "Getting your dog to come when called every time", "level": "intermediate", "category": "obedience", "steps": ["Start in low-distraction area", "Use happy excited voice", "Reward heavily when they come", "Never punish after recall", "Practice with long leash"], "tips": ["Make coming to you the best thing ever", "Use high-value rewards", "Never call for negative things"], "duration_minutes": 20, "order": 7},
    {"module_id": "mod_inter_03", "title": "Loose Leash Walking", "description": "Walking without pulling", "level": "intermediate", "category": "obedience", "steps": ["Reward for staying by your side", "Stop when pulling occurs", "Change direction randomly", "Use treats to lure to position", "Practice consistency"], "tips": ["Be patient - this takes time", "Use front-clip harness if needed", "Short sessions are better"], "duration_minutes": 25, "order": 8},
    {"module_id": "mod_inter_04", "title": "Leave It Command", "description": "Teaching impulse control", "level": "intermediate", "category": "obedience", "steps": ["Hold treat in closed fist", "Wait for dog to back off", "Say 'leave it' and reward from other hand", "Practice with treat on floor", "Increase difficulty gradually"], "tips": ["Always reward with different treat", "Practice with various objects", "Essential for safety"], "duration_minutes": 15, "order": 9},
    {"module_id": "mod_inter_05", "title": "Managing Separation Anxiety", "description": "Helping your dog cope when alone", "level": "intermediate", "category": "behavior", "steps": ["Practice short absences", "Create calm departure routine", "Use puzzle toys when leaving", "Don't make returns exciting", "Consider calming aids"], "tips": ["Never punish anxiety", "Build independence gradually", "Consult vet if severe"], "duration_minutes": 30, "order": 10},
    
    # Advanced
    {"module_id": "mod_adv_01", "title": "Off-Leash Reliability", "description": "Achieving dependable off-leash control", "level": "advanced", "category": "obedience", "steps": ["Perfect recall on long line", "Practice in fenced areas", "Add distractions gradually", "Use high-value rewards", "Know when to leash up"], "tips": ["Safety first - use appropriate areas", "Be honest about reliability", "Always have backup plan"], "duration_minutes": 30, "order": 11},
    {"module_id": "mod_adv_02", "title": "Agility Foundations", "description": "Introduction to agility equipment", "level": "advanced", "category": "agility", "steps": ["Start with ground poles", "Introduce low jumps", "Practice tunnel entries", "Work on weave poles basics", "Build handler communication"], "tips": ["Check for physical readiness", "Keep sessions fun", "Don't rush height/speed"], "duration_minutes": 45, "order": 12},
    {"module_id": "mod_adv_03", "title": "Advanced Tricks", "description": "Impressive tricks like roll over and play dead", "level": "advanced", "category": "tricks", "steps": ["Break into small steps", "Use luring technique", "Shape behavior gradually", "Add verbal cue last", "Practice chains"], "tips": ["Keep it fun", "Use favorite treats", "Short training bursts"], "duration_minutes": 20, "order": 13},
    {"module_id": "mod_adv_04", "title": "Reactive Dog Management", "description": "Managing reactivity to dogs or people", "level": "advanced", "category": "behavior", "steps": ["Identify triggers and threshold", "Practice LAT (Look at That)", "Counter-conditioning exercises", "Create distance when needed", "Manage environment"], "tips": ["Work with professional if severe", "Patience is essential", "Celebrate small wins"], "duration_minutes": 30, "order": 14},
    {"module_id": "mod_adv_05", "title": "Canine Good Citizen Prep", "description": "Preparing for CGC certification", "level": "advanced", "category": "obedience", "steps": ["Review all basic commands", "Practice with strangers", "Work on grooming acceptance", "Train supervised separation", "Simulate test conditions"], "tips": ["Find local evaluators", "Practice in various settings", "Focus on weak areas"], "duration_minutes": 45, "order": 15},
]

@api_router.get("/training/modules")
async def get_training_modules(level: Optional[str] = None, category: Optional[str] = None):
    modules = TRAINING_MODULES
    if level:
        modules = [m for m in modules if m["level"] == level]
    if category:
        modules = [m for m in modules if m["category"] == category]
    return sorted(modules, key=lambda x: x["order"])

@api_router.get("/training/modules/{module_id}")
async def get_training_module(module_id: str):
    module = next((m for m in TRAINING_MODULES if m["module_id"] == module_id), None)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

@api_router.get("/training/progress/{dog_id}")
async def get_training_progress(dog_id: str, user: User = Depends(get_current_user)):
    progress = await db.training_progress.find(
        {"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}
    ).to_list(100)
    return progress

@api_router.post("/training/progress")
async def update_training_progress(
    module_id: str,
    dog_id: str,
    completed_step: int,
    user: User = Depends(get_current_user)
):
    existing = await db.training_progress.find_one(
        {"user_id": user.user_id, "dog_id": dog_id, "module_id": module_id}, {"_id": 0}
    )
    
    module = next((m for m in TRAINING_MODULES if m["module_id"] == module_id), None)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    total_steps = len(module["steps"])
    
    if existing:
        completed_steps = existing.get("completed_steps", [])
        if completed_step not in completed_steps:
            completed_steps.append(completed_step)
        
        status = "in_progress"
        completed_at = None
        if len(completed_steps) >= total_steps:
            status = "completed"
            completed_at = datetime.now(timezone.utc).isoformat()
        
        await db.training_progress.update_one(
            {"user_id": user.user_id, "dog_id": dog_id, "module_id": module_id},
            {"$set": {"completed_steps": completed_steps, "status": status, "completed_at": completed_at}}
        )
    else:
        progress = {
            "progress_id": f"prog_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "dog_id": dog_id,
            "module_id": module_id,
            "completed_steps": [completed_step],
            "status": "in_progress",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": None
        }
        await db.training_progress.insert_one(progress)
    
    return await db.training_progress.find_one(
        {"user_id": user.user_id, "dog_id": dog_id, "module_id": module_id}, {"_id": 0}
    )

# ==================== HEALTH RECORDS ====================

@api_router.get("/health/{dog_id}")
async def get_health_records(dog_id: str, user: User = Depends(get_current_user)):
    records = await db.health_records.find(
        {"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}
    ).sort("date", -1).to_list(100)
    return records

@api_router.post("/health")
async def create_health_record(record_data: HealthRecordCreate, user: User = Depends(get_current_user)):
    record = HealthRecord(
        user_id=user.user_id,
        dog_id=record_data.dog_id,
        record_type=record_data.record_type,
        title=record_data.title,
        description=record_data.description,
        date=datetime.fromisoformat(record_data.date),
        vet_name=record_data.vet_name,
        notes=record_data.notes
    )
    doc = record.model_dump()
    doc["date"] = doc["date"].isoformat()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.health_records.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.delete("/health/{record_id}")
async def delete_health_record(record_id: str, user: User = Depends(get_current_user)):
    result = await db.health_records.delete_one({"record_id": record_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted"}

# ==================== AI SYMPTOM ANALYZER ====================

@api_router.post("/health/analyze")
async def analyze_symptoms(analysis: SymptomAnalysis, user: User = Depends(get_current_user)):
    dog = await db.dogs.find_one({"dog_id": analysis.dog_id, "user_id": user.user_id}, {"_id": 0})
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    symptoms_text = ", ".join(analysis.symptoms)
    
    chat = LlmChat(
        api_key=api_key,
        session_id=f"symptom_{uuid.uuid4().hex[:8]}",
        system_message="""You are a veterinary health assistant AI. Analyze dog symptoms and provide helpful guidance. 
        Always remind users that this is not a replacement for professional veterinary care.
        Structure your response with: 
        1. Possible Causes (list 2-3 likely causes)
        2. Recommended Actions (immediate steps)
        3. Warning Signs (when to seek emergency care)
        4. Home Care Tips (if applicable)
        Keep responses concise but thorough."""
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Analyze these symptoms for a {dog['breed']}, {dog['age_months']} months old, {dog['weight_kg']}kg ({dog['size']} size):

Symptoms: {symptoms_text}
Severity reported: {analysis.severity}
Additional info: {analysis.additional_info or 'None provided'}

Provide analysis and recommendations."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    
    # Save analysis to history
    analysis_record = {
        "analysis_id": f"analysis_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "dog_id": analysis.dog_id,
        "symptoms": analysis.symptoms,
        "severity": analysis.severity,
        "ai_response": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.symptom_analyses.insert_one(analysis_record)
    
    return {"analysis": response, "analysis_id": analysis_record["analysis_id"]}

# ==================== DAILY TASKS ====================

@api_router.get("/tasks/{dog_id}")
async def get_tasks(dog_id: str, date: str, user: User = Depends(get_current_user)):
    tasks = await db.tasks.find(
        {"user_id": user.user_id, "dog_id": dog_id, "date": date}, {"_id": 0}
    ).to_list(100)
    return tasks

@api_router.post("/tasks")
async def create_task(task_data: DailyTaskCreate, user: User = Depends(get_current_user)):
    task = DailyTask(user_id=user.user_id, **task_data.model_dump())
    doc = task.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    if doc["completed_at"]:
        doc["completed_at"] = doc["completed_at"].isoformat()
    await db.tasks.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/tasks/{task_id}/complete")
async def complete_task(task_id: str, user: User = Depends(get_current_user)):
    result = await db.tasks.update_one(
        {"task_id": task_id, "user_id": user.user_id},
        {"$set": {"is_completed": True, "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return await db.tasks.find_one({"task_id": task_id}, {"_id": 0})

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user: User = Depends(get_current_user)):
    result = await db.tasks.delete_one({"task_id": task_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

# ==================== BEHAVIOR LOGS ====================

@api_router.get("/behavior/{dog_id}")
async def get_behavior_logs(dog_id: str, user: User = Depends(get_current_user)):
    logs = await db.behavior_logs.find(
        {"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}
    ).sort("date", -1).to_list(100)
    return logs

@api_router.post("/behavior")
async def create_behavior_log(log_data: BehaviorLogCreate, user: User = Depends(get_current_user)):
    log = BehaviorLog(user_id=user.user_id, **log_data.model_dump())
    doc = log.model_dump()
    doc["date"] = doc["date"].isoformat()
    await db.behavior_logs.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.delete("/behavior/{log_id}")
async def delete_behavior_log(log_id: str, user: User = Depends(get_current_user)):
    result = await db.behavior_logs.delete_one({"log_id": log_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"message": "Log deleted"}

# ==================== TRAVEL CHECKLISTS ====================

DEFAULT_TRAVEL_ITEMS = [
    {"item": "Food and treats", "checked": False},
    {"item": "Water and bowl", "checked": False},
    {"item": "Leash and collar with ID tags", "checked": False},
    {"item": "Vaccination records", "checked": False},
    {"item": "Medications", "checked": False},
    {"item": "Crate or carrier", "checked": False},
    {"item": "Bedding/blanket", "checked": False},
    {"item": "Waste bags", "checked": False},
    {"item": "First aid kit", "checked": False},
    {"item": "Favorite toys", "checked": False},
    {"item": "Grooming supplies", "checked": False},
    {"item": "Recent photo (for emergencies)", "checked": False},
]

@api_router.get("/travel/{dog_id}")
async def get_travel_checklists(dog_id: str, user: User = Depends(get_current_user)):
    checklists = await db.travel_checklists.find(
        {"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}
    ).sort("travel_date", -1).to_list(100)
    return checklists

@api_router.get("/travel/defaults/items")
async def get_default_travel_items():
    return DEFAULT_TRAVEL_ITEMS

@api_router.post("/travel")
async def create_travel_checklist(checklist_data: TravelChecklistCreate, user: User = Depends(get_current_user)):
    checklist = TravelChecklist(user_id=user.user_id, **checklist_data.model_dump())
    doc = checklist.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.travel_checklists.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/travel/{checklist_id}/item")
async def update_checklist_item(checklist_id: str, item_index: int, checked: bool, user: User = Depends(get_current_user)):
    checklist = await db.travel_checklists.find_one(
        {"checklist_id": checklist_id, "user_id": user.user_id}, {"_id": 0}
    )
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    items = checklist["items"]
    if 0 <= item_index < len(items):
        items[item_index]["checked"] = checked
        await db.travel_checklists.update_one(
            {"checklist_id": checklist_id},
            {"$set": {"items": items}}
        )
    
    return await db.travel_checklists.find_one({"checklist_id": checklist_id}, {"_id": 0})

@api_router.delete("/travel/{checklist_id}")
async def delete_travel_checklist(checklist_id: str, user: User = Depends(get_current_user)):
    result = await db.travel_checklists.delete_one({"checklist_id": checklist_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Checklist not found")
    return {"message": "Checklist deleted"}

# ==================== BREED DATABASE ====================

BREED_DATABASE = [
    # Small Breeds
    {"breed_id": "chihuahua", "name": "Chihuahua", "size": "small", "weight_range": "1-3 kg", "life_expectancy": "12-20 years", "temperament": ["Alert", "Quick", "Devoted"], "exercise_needs": "Low", "grooming_needs": "Low", "good_with_kids": "Moderate", "good_with_pets": "Moderate", "trainability": "Moderate", "description": "The smallest dog breed, known for its big personality and loyalty to its owner.", "health_concerns": ["Patellar luxation", "Heart problems", "Hypoglycemia"], "image_url": "https://images.unsplash.com/photo-1597633544424-4da83d99c5f7?w=400"},
    {"breed_id": "pomeranian", "name": "Pomeranian", "size": "small", "weight_range": "1.5-3.5 kg", "life_expectancy": "12-16 years", "temperament": ["Playful", "Friendly", "Active"], "exercise_needs": "Low", "grooming_needs": "High", "good_with_kids": "Moderate", "good_with_pets": "Good", "trainability": "High", "description": "A fluffy, spirited small dog with a fox-like expression and confident demeanor.", "health_concerns": ["Luxating patella", "Tracheal collapse", "Dental issues"], "image_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"},
    {"breed_id": "french_bulldog", "name": "French Bulldog", "size": "small", "weight_range": "8-14 kg", "life_expectancy": "10-12 years", "temperament": ["Adaptable", "Playful", "Alert"], "exercise_needs": "Low", "grooming_needs": "Low", "good_with_kids": "Excellent", "good_with_pets": "Good", "trainability": "Moderate", "description": "A charming, adaptable companion known for bat-like ears and affectionate nature.", "health_concerns": ["Brachycephalic syndrome", "Hip dysplasia", "Allergies"], "image_url": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400"},
    {"breed_id": "dachshund", "name": "Dachshund", "size": "small", "weight_range": "7-15 kg", "life_expectancy": "12-16 years", "temperament": ["Curious", "Brave", "Lively"], "exercise_needs": "Moderate", "grooming_needs": "Low to Moderate", "good_with_kids": "Good", "good_with_pets": "Moderate", "trainability": "Moderate", "description": "The 'wiener dog' with a long body and short legs, originally bred for hunting.", "health_concerns": ["Intervertebral disc disease", "Obesity", "Dental problems"], "image_url": "https://images.unsplash.com/photo-1612195583950-b8fd34c87093?w=400"},
    
    # Medium Breeds
    {"breed_id": "beagle", "name": "Beagle", "size": "medium", "weight_range": "9-11 kg", "life_expectancy": "12-15 years", "temperament": ["Friendly", "Curious", "Merry"], "exercise_needs": "High", "grooming_needs": "Low", "good_with_kids": "Excellent", "good_with_pets": "Excellent", "trainability": "Moderate", "description": "A happy, outgoing hound breed with an excellent nose and friendly disposition.", "health_concerns": ["Hip dysplasia", "Epilepsy", "Hypothyroidism"], "image_url": "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400"},
    {"breed_id": "border_collie", "name": "Border Collie", "size": "medium", "weight_range": "14-20 kg", "life_expectancy": "12-15 years", "temperament": ["Intelligent", "Energetic", "Alert"], "exercise_needs": "Very High", "grooming_needs": "Moderate", "good_with_kids": "Good", "good_with_pets": "Good", "trainability": "Excellent", "description": "Widely considered the most intelligent dog breed, excel at herding and agility.", "health_concerns": ["Hip dysplasia", "Collie eye anomaly", "Epilepsy"], "image_url": "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400"},
    {"breed_id": "cocker_spaniel", "name": "Cocker Spaniel", "size": "medium", "weight_range": "12-15 kg", "life_expectancy": "10-14 years", "temperament": ["Happy", "Smart", "Gentle"], "exercise_needs": "Moderate", "grooming_needs": "High", "good_with_kids": "Excellent", "good_with_pets": "Excellent", "trainability": "High", "description": "A beautiful sporting breed with silky ears and a perpetually wagging tail.", "health_concerns": ["Ear infections", "Eye problems", "Hip dysplasia"], "image_url": "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"},
    {"breed_id": "australian_shepherd", "name": "Australian Shepherd", "size": "medium", "weight_range": "18-29 kg", "life_expectancy": "12-15 years", "temperament": ["Smart", "Work-oriented", "Exuberant"], "exercise_needs": "Very High", "grooming_needs": "Moderate", "good_with_kids": "Good", "good_with_pets": "Good", "trainability": "Excellent", "description": "A versatile, intelligent herding dog with a beautiful merle coat pattern.", "health_concerns": ["Hip dysplasia", "MDR1 gene mutation", "Eye problems"], "image_url": "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400"},
    
    # Large Breeds
    {"breed_id": "labrador", "name": "Labrador Retriever", "size": "large", "weight_range": "25-36 kg", "life_expectancy": "10-12 years", "temperament": ["Friendly", "Active", "Outgoing"], "exercise_needs": "High", "grooming_needs": "Moderate", "good_with_kids": "Excellent", "good_with_pets": "Excellent", "trainability": "Excellent", "description": "America's most popular breed, known for friendliness and versatility.", "health_concerns": ["Hip dysplasia", "Obesity", "Ear infections"], "image_url": "https://images.unsplash.com/photo-1579213838826-64a957194869?w=400"},
    {"breed_id": "golden_retriever", "name": "Golden Retriever", "size": "large", "weight_range": "25-34 kg", "life_expectancy": "10-12 years", "temperament": ["Intelligent", "Friendly", "Devoted"], "exercise_needs": "High", "grooming_needs": "Moderate to High", "good_with_kids": "Excellent", "good_with_pets": "Excellent", "trainability": "Excellent", "description": "A beautiful, loyal family dog with a gentle temperament and golden coat.", "health_concerns": ["Cancer", "Hip dysplasia", "Heart problems"], "image_url": "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400"},
    {"breed_id": "german_shepherd", "name": "German Shepherd", "size": "large", "weight_range": "22-40 kg", "life_expectancy": "9-13 years", "temperament": ["Confident", "Courageous", "Smart"], "exercise_needs": "High", "grooming_needs": "Moderate", "good_with_kids": "Good", "good_with_pets": "Moderate", "trainability": "Excellent", "description": "A versatile working dog known for intelligence, loyalty, and courage.", "health_concerns": ["Hip dysplasia", "Degenerative myelopathy", "Bloat"], "image_url": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400"},
    {"breed_id": "rottweiler", "name": "Rottweiler", "size": "large", "weight_range": "36-60 kg", "life_expectancy": "8-10 years", "temperament": ["Confident", "Calm", "Courageous"], "exercise_needs": "Moderate to High", "grooming_needs": "Low", "good_with_kids": "Good (with training)", "good_with_pets": "Moderate", "trainability": "High", "description": "A powerful, protective breed that is deeply loyal to family.", "health_concerns": ["Hip dysplasia", "Heart problems", "Cancer"], "image_url": "https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=400"},
    {"breed_id": "siberian_husky", "name": "Siberian Husky", "size": "large", "weight_range": "16-27 kg", "life_expectancy": "12-14 years", "temperament": ["Outgoing", "Mischievous", "Loyal"], "exercise_needs": "Very High", "grooming_needs": "High", "good_with_kids": "Good", "good_with_pets": "Moderate", "trainability": "Moderate", "description": "A beautiful, athletic sled dog with striking eyes and thick coat.", "health_concerns": ["Hip dysplasia", "Eye problems", "Zinc deficiency"], "image_url": "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400"},
    {"breed_id": "great_dane", "name": "Great Dane", "size": "large", "weight_range": "50-79 kg", "life_expectancy": "7-10 years", "temperament": ["Friendly", "Patient", "Dependable"], "exercise_needs": "Moderate", "grooming_needs": "Low", "good_with_kids": "Excellent", "good_with_pets": "Good", "trainability": "Moderate", "description": "The 'Apollo of Dogs', a gentle giant known for its imposing size and sweet nature.", "health_concerns": ["Bloat", "Hip dysplasia", "Heart disease"], "image_url": "https://images.unsplash.com/photo-1581888475780-53b86d3e5a49?w=400"},
]

@api_router.get("/breeds")
async def get_breeds(size: Optional[str] = None):
    breeds = BREED_DATABASE
    if size:
        breeds = [b for b in breeds if b["size"] == size]
    return breeds

@api_router.get("/breeds/{breed_id}")
async def get_breed(breed_id: str):
    breed = next((b for b in BREED_DATABASE if b["breed_id"] == breed_id), None)
    if not breed:
        raise HTTPException(status_code=404, detail="Breed not found")
    return breed

# ==================== TIPS & RESOURCES ====================

PARENTING_TIPS = {
    "dos": [
        {"title": "Positive Reinforcement", "description": "Always reward good behavior with treats, praise, or play. Dogs learn best through positive associations."},
        {"title": "Consistent Schedule", "description": "Maintain regular feeding, walking, and sleeping times. Dogs thrive on routine and predictability."},
        {"title": "Early Socialization", "description": "Expose puppies to various people, animals, and environments during their critical period (3-14 weeks)."},
        {"title": "Regular Exercise", "description": "Provide appropriate physical and mental stimulation based on your dog's breed and age."},
        {"title": "Annual Vet Checkups", "description": "Schedule regular veterinary visits for vaccinations, dental care, and health screenings."},
        {"title": "Proper Nutrition", "description": "Feed age-appropriate, high-quality food in correct portions. Consult your vet for specific needs."},
        {"title": "Mental Stimulation", "description": "Use puzzle toys, training sessions, and interactive games to keep your dog's mind sharp."},
        {"title": "Safe Environment", "description": "Dog-proof your home, secure toxic substances, and provide a comfortable resting area."},
    ],
    "donts": [
        {"title": "Never Hit or Yell", "description": "Physical punishment damages trust and can cause fear-based behavioral problems."},
        {"title": "Don't Skip Training", "description": "Even small dogs need basic obedience training for safety and good behavior."},
        {"title": "Avoid Table Scraps", "description": "Many human foods are toxic to dogs. Stick to dog-safe treats and foods."},
        {"title": "Don't Ignore Warning Signs", "description": "Changes in appetite, behavior, or energy levels can indicate health issues."},
        {"title": "Never Leave Dogs in Hot Cars", "description": "Cars heat up rapidly and can cause fatal heatstroke within minutes."},
        {"title": "Don't Overfeed", "description": "Obesity is a leading health problem in dogs. Follow feeding guidelines."},
        {"title": "Avoid Punishment After the Fact", "description": "Dogs don't understand delayed punishment. Correct in the moment or not at all."},
        {"title": "Don't Skip Parasite Prevention", "description": "Fleas, ticks, and worms can cause serious health problems. Use preventatives."},
    ],
    "risks": [
        {"title": "Toxic Foods", "items": ["Chocolate", "Grapes/Raisins", "Onions/Garlic", "Xylitol", "Alcohol", "Caffeine", "Macadamia nuts"]},
        {"title": "Toxic Plants", "items": ["Lilies", "Azaleas", "Sago Palm", "Tulips", "Oleander", "Ivy"]},
        {"title": "Household Hazards", "items": ["Cleaning products", "Medications", "Small objects (choking)", "Electrical cords", "Open windows"]},
        {"title": "Outdoor Dangers", "items": ["Antifreeze", "Pesticides", "Wild animals", "Extreme temperatures", "Traffic"]},
    ]
}

@api_router.get("/tips/parenting")
async def get_parenting_tips():
    return PARENTING_TIPS

# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: User = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Get dogs count
    dogs_count = await db.dogs.count_documents({"user_id": user.user_id})
    
    # Get today's tasks
    today_tasks = await db.tasks.find(
        {"user_id": user.user_id, "date": today}, {"_id": 0}
    ).to_list(100)
    tasks_completed = len([t for t in today_tasks if t.get("is_completed")])
    tasks_total = len(today_tasks)
    
    # Get training progress
    all_progress = await db.training_progress.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).to_list(1000)
    completed_modules = len([p for p in all_progress if p.get("status") == "completed"])
    total_modules = len(TRAINING_MODULES)
    
    # Get recent behavior alerts
    recent_behaviors = await db.behavior_logs.find(
        {"user_id": user.user_id, "severity": {"$in": ["medium", "high"]}}
    ).sort("date", -1).to_list(5)
    alerts_count = len(recent_behaviors)
    
    return {
        "dogs_count": dogs_count,
        "tasks_completed": tasks_completed,
        "tasks_total": tasks_total,
        "training_completed": completed_modules,
        "training_total": total_modules,
        "behavior_alerts": alerts_count
    }

# ==================== APP SETUP ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
