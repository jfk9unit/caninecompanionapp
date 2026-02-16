from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    tokens: int = 0
    referral_code: str = ""
    referred_by: Optional[str] = None
    total_referrals: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DogProfile(BaseModel):
    dog_id: str = Field(default_factory=lambda: f"dog_{uuid.uuid4().hex[:12]}")
    user_id: str
    name: str
    breed: str
    age_years: int = 0
    age_months: int = 0
    weight_kg: float
    size: str
    gender: str = "unknown"
    birthday: Optional[str] = None
    color: Optional[str] = None
    microchip_id: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DogProfileCreate(BaseModel):
    name: str
    breed: str
    age_years: int = 0
    age_months: int = 0
    weight_kg: float
    size: str
    gender: str = "unknown"
    birthday: Optional[str] = None
    color: Optional[str] = None
    microchip_id: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class VirtualPet(BaseModel):
    pet_id: str = Field(default_factory=lambda: f"vpet_{uuid.uuid4().hex[:12]}")
    user_id: str
    linked_dog_id: Optional[str] = None
    name: str
    breed: str
    happiness: int = 100
    energy: int = 100
    training_level: int = 1
    experience_points: int = 0
    skills_unlocked: List[str] = []
    last_fed: Optional[datetime] = None
    last_played: Optional[datetime] = None
    last_trained: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Achievement(BaseModel):
    achievement_id: str
    user_id: str
    dog_id: Optional[str] = None
    title: str
    description: str
    badge_type: str  # bronze, silver, gold, platinum
    category: str  # training, health, social, streak
    earned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    certificate_url: Optional[str] = None
    shared: bool = False

class TrainingLesson(BaseModel):
    lesson_id: str
    title: str
    description: str
    level: str  # beginner, intermediate, advanced, expert
    category: str
    difficulty: int  # 1-10
    token_cost: int  # 6-15 based on difficulty
    duration_minutes: int
    steps: List[str]
    tips: List[str]
    toy_recommendations: List[str]
    treat_recommendations: List[str]
    order: int

class VoiceLog(BaseModel):
    log_id: str = Field(default_factory=lambda: f"voice_{uuid.uuid4().hex[:12]}")
    user_id: str
    dog_id: str
    transcript: str
    bullet_points: List[str]
    mood_detected: Optional[str] = None
    activities_mentioned: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VetInfo(BaseModel):
    vet_id: str = Field(default_factory=lambda: f"vet_{uuid.uuid4().hex[:12]}")
    user_id: str
    name: str
    clinic_name: str
    address: str
    phone: str
    email: Optional[str] = None
    emergency_available: bool = False
    notes: Optional[str] = None

# Token packages
TOKEN_PACKAGES = {
    "starter": {"tokens": 10, "price": 2.89, "currency": "gbp"},
    "value": {"tokens": 25, "price": 6.49, "currency": "gbp"},
    "premium": {"tokens": 50, "price": 11.99, "currency": "gbp"},
    "ultimate": {"tokens": 100, "price": 21.99, "currency": "gbp"},
}

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

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "CanineCompass API v2", "status": "healthy"}

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    referral_code = body.get("referral_code")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as http_client:
        resp = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        user_data = resp.json()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_referral_code = f"CC{uuid.uuid4().hex[:8].upper()}"
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": user_data["name"], "picture": user_data.get("picture")}}
        )
    else:
        referred_by = None
        if referral_code:
            referrer = await db.users.find_one({"referral_code": referral_code}, {"_id": 0})
            if referrer:
                referred_by = referrer["user_id"]
                # Give referrer bonus tokens
                await db.users.update_one(
                    {"user_id": referrer["user_id"]},
                    {"$inc": {"tokens": 5, "total_referrals": 1}}
                )
        
        new_user = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "tokens": 5 if referred_by else 0,  # Welcome bonus if referred
            "referral_code": user_referral_code,
            "referred_by": referred_by,
            "total_referrals": 0,
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
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none",
        max_age=7 * 24 * 60 * 60, path="/"
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

# ==================== TOKEN & PAYMENT ROUTES ====================

@api_router.get("/tokens/packages")
async def get_token_packages():
    return TOKEN_PACKAGES

@api_router.get("/tokens/balance")
async def get_token_balance(user: User = Depends(get_current_user)):
    return {"tokens": user.tokens, "referral_code": user.referral_code}

@api_router.post("/payments/stripe/checkout")
async def create_stripe_checkout(request: Request, package_id: str, user: User = Depends(get_current_user)):
    if package_id not in TOKEN_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    package = TOKEN_PACKAGES[package_id]
    body = await request.json()
    origin_url = body.get("origin_url", "")
    
    if not origin_url:
        raise HTTPException(status_code=400, detail="origin_url required")
    
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    success_url = f"{origin_url}/tokens?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/tokens"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(package["price"]),
        currency=package["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user.user_id,
            "package_id": package_id,
            "tokens": str(package["tokens"])
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Record pending transaction
    await db.payment_transactions.insert_one({
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "session_id": session.session_id,
        "package_id": package_id,
        "amount": package["price"],
        "currency": package["currency"],
        "tokens": package["tokens"],
        "payment_method": "stripe",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, user: User = Depends(get_current_user)):
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = "https://pup-parent-pro.preview.emergentagent.com"
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Check if already processed
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if txn and txn.get("payment_status") == "completed":
        return {"status": "completed", "already_processed": True}
    
    if status.payment_status == "paid" and txn and txn.get("payment_status") != "completed":
        # Credit tokens
        tokens_to_add = int(status.metadata.get("tokens", 0))
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$inc": {"tokens": tokens_to_add}}
        )
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
            
            if txn and txn.get("payment_status") != "completed":
                tokens_to_add = int(webhook_response.metadata.get("tokens", 0))
                user_id = webhook_response.metadata.get("user_id")
                
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$inc": {"tokens": tokens_to_add}}
                )
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
                )
        
        return {"status": "processed"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

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

# ==================== VIRTUAL PET ====================

@api_router.get("/virtual-pet")
async def get_virtual_pet(user: User = Depends(get_current_user)):
    pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
    return pet

@api_router.post("/virtual-pet")
async def create_virtual_pet(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    
    existing = await db.virtual_pets.find_one({"user_id": user.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Virtual pet already exists")
    
    pet = VirtualPet(
        user_id=user.user_id,
        linked_dog_id=body.get("linked_dog_id"),
        name=body.get("name", "Buddy"),
        breed=body.get("breed", "Mixed")
    )
    doc = pet.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.virtual_pets.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.post("/virtual-pet/feed")
async def feed_virtual_pet(user: User = Depends(get_current_user)):
    pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
    if not pet:
        raise HTTPException(status_code=404, detail="No virtual pet found")
    
    await db.virtual_pets.update_one(
        {"user_id": user.user_id},
        {"$set": {"happiness": min(100, pet.get("happiness", 50) + 10), "last_fed": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Pet fed!", "happiness": min(100, pet.get("happiness", 50) + 10)}

@api_router.post("/virtual-pet/play")
async def play_with_virtual_pet(user: User = Depends(get_current_user)):
    pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
    if not pet:
        raise HTTPException(status_code=404, detail="No virtual pet found")
    
    xp_gain = 15
    new_xp = pet.get("experience_points", 0) + xp_gain
    new_level = 1 + (new_xp // 100)
    
    await db.virtual_pets.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "happiness": min(100, pet.get("happiness", 50) + 15),
            "energy": max(0, pet.get("energy", 50) - 10),
            "experience_points": new_xp,
            "training_level": new_level,
            "last_played": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Played with pet!", "xp_gained": xp_gain, "new_level": new_level}

@api_router.post("/virtual-pet/train")
async def train_virtual_pet(skill: str, user: User = Depends(get_current_user)):
    pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
    if not pet:
        raise HTTPException(status_code=404, detail="No virtual pet found")
    
    if user.tokens < 1:
        raise HTTPException(status_code=400, detail="Not enough tokens")
    
    # Deduct token and add skill
    await db.users.update_one({"user_id": user.user_id}, {"$inc": {"tokens": -1}})
    
    skills = pet.get("skills_unlocked", [])
    if skill not in skills:
        skills.append(skill)
    
    xp_gain = 25
    new_xp = pet.get("experience_points", 0) + xp_gain
    new_level = 1 + (new_xp // 100)
    
    await db.virtual_pets.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "skills_unlocked": skills,
            "experience_points": new_xp,
            "training_level": new_level,
            "last_trained": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": f"Learned {skill}!", "skills": skills, "new_level": new_level}

# ==================== ACHIEVEMENTS ====================

@api_router.get("/achievements")
async def get_achievements(user: User = Depends(get_current_user)):
    achievements = await db.achievements.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return achievements

@api_router.post("/achievements/{achievement_id}/share")
async def share_achievement(achievement_id: str, user: User = Depends(get_current_user)):
    result = await db.achievements.update_one(
        {"achievement_id": achievement_id, "user_id": user.user_id},
        {"$set": {"shared": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    # Award sharing badge
    sharing_badges = await db.achievements.count_documents({"user_id": user.user_id, "shared": True})
    if sharing_badges == 1:
        await db.achievements.insert_one({
            "achievement_id": f"ach_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "title": "Social Butterfly",
            "description": "Shared your first achievement",
            "badge_type": "bronze",
            "category": "social",
            "earned_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Achievement shared!", "bonus_badge": sharing_badges == 1}

# ==================== VET INFO ====================

@api_router.get("/vets")
async def get_vets(user: User = Depends(get_current_user)):
    vets = await db.vets.find({"user_id": user.user_id}, {"_id": 0}).to_list(50)
    return vets

@api_router.post("/vets")
async def add_vet(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    vet = VetInfo(user_id=user.user_id, **body)
    doc = vet.model_dump()
    await db.vets.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.delete("/vets/{vet_id}")
async def delete_vet(vet_id: str, user: User = Depends(get_current_user)):
    result = await db.vets.delete_one({"vet_id": vet_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vet not found")
    return {"message": "Vet deleted"}

# ==================== VOICE LOGS ====================

@api_router.get("/voice-logs/{dog_id}")
async def get_voice_logs(dog_id: str, user: User = Depends(get_current_user)):
    logs = await db.voice_logs.find(
        {"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return logs

@api_router.post("/voice-logs")
async def create_voice_log(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    transcript = body.get("transcript", "")
    dog_id = body.get("dog_id")
    
    if not transcript or not dog_id:
        raise HTTPException(status_code=400, detail="transcript and dog_id required")
    
    # Use AI to extract bullet points
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"voice_{uuid.uuid4().hex[:8]}",
        system_message="Extract key activities and observations from this voice log about a dog. Return as a JSON with keys: bullet_points (list of 3-5 concise bullet points), mood_detected (happy/calm/anxious/excited/tired), activities_mentioned (list of activities like walk, play, eat, sleep, etc)"
    ).with_model("openai", "gpt-5.2")
    
    response = await chat.send_message(UserMessage(text=transcript))
    
    # Parse AI response
    import json
    try:
        parsed = json.loads(response)
        bullet_points = parsed.get("bullet_points", [transcript])
        mood = parsed.get("mood_detected", "calm")
        activities = parsed.get("activities_mentioned", [])
    except:
        bullet_points = [transcript]
        mood = "calm"
        activities = []
    
    log = VoiceLog(
        user_id=user.user_id,
        dog_id=dog_id,
        transcript=transcript,
        bullet_points=bullet_points,
        mood_detected=mood,
        activities_mentioned=activities
    )
    doc = log.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.voice_logs.insert_one(doc)
    
    return {k: v for k, v in doc.items() if k != "_id"}
