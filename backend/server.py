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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import breed and training data
from breeds_data import BREED_DATABASE
from breeds_data_2 import ADDITIONAL_BREEDS
from training_lessons_data import TRAINING_LESSONS

ALL_BREEDS = BREED_DATABASE + ADDITIONAL_BREEDS

# Token packages
TOKEN_PACKAGES = {
    "starter": {"tokens": 10, "price": 2.89, "currency": "gbp"},
    "value": {"tokens": 25, "price": 6.49, "currency": "gbp"},
    "premium": {"tokens": 50, "price": 11.99, "currency": "gbp"},
    "ultimate": {"tokens": 100, "price": 21.99, "currency": "gbp"},
}

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
    {"item": "Recent photo", "checked": False},
]

PARENTING_TIPS = {
    "dos": [
        {"title": "Positive Reinforcement", "description": "Always reward good behavior with treats, praise, or play."},
        {"title": "Consistent Schedule", "description": "Maintain regular feeding, walking, and sleeping times."},
        {"title": "Early Socialization", "description": "Expose puppies to various people, animals, and environments."},
        {"title": "Regular Exercise", "description": "Provide appropriate physical and mental stimulation."},
        {"title": "Annual Vet Checkups", "description": "Schedule regular veterinary visits."},
        {"title": "Proper Nutrition", "description": "Feed age-appropriate, high-quality food."},
        {"title": "Mental Stimulation", "description": "Use puzzle toys and training sessions."},
        {"title": "Safe Environment", "description": "Dog-proof your home."},
    ],
    "donts": [
        {"title": "Never Hit or Yell", "description": "Physical punishment damages trust."},
        {"title": "Don't Skip Training", "description": "All dogs need basic obedience."},
        {"title": "Avoid Table Scraps", "description": "Many human foods are toxic."},
        {"title": "Don't Ignore Warning Signs", "description": "Changes may indicate health issues."},
        {"title": "Never Leave in Hot Cars", "description": "Fatal heatstroke risk."},
        {"title": "Don't Overfeed", "description": "Obesity is common."},
        {"title": "Avoid Late Punishment", "description": "Dogs don't understand delay."},
        {"title": "Don't Skip Parasite Prevention", "description": "Use preventatives."},
    ],
    "risks": [
        {"title": "Toxic Foods", "items": ["Chocolate", "Grapes", "Onions", "Xylitol", "Alcohol", "Caffeine"]},
        {"title": "Toxic Plants", "items": ["Lilies", "Azaleas", "Sago Palm", "Tulips", "Oleander"]},
        {"title": "Household Hazards", "items": ["Cleaning products", "Medications", "Small objects", "Electrical cords"]},
        {"title": "Outdoor Dangers", "items": ["Antifreeze", "Pesticides", "Wild animals", "Traffic"]},
    ]
}

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
    photo_url: Optional[str] = None

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
    return {"message": "CanineCompass API v2", "status": "healthy", "breeds_count": len(ALL_BREEDS), "lessons_count": len(TRAINING_LESSONS)}

# ==================== AUTH ====================

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
                await db.users.update_one(
                    {"user_id": referrer["user_id"]},
                    {"$inc": {"tokens": 5, "total_referrals": 1}}
                )
        
        new_user = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "tokens": 5 if referred_by else 0,
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

# ==================== TOKENS & PAYMENTS ====================

@api_router.get("/tokens/packages")
async def get_token_packages():
    return TOKEN_PACKAGES

@api_router.get("/tokens/balance")
async def get_token_balance(user: User = Depends(get_current_user)):
    return {"tokens": user.tokens, "referral_code": user.referral_code, "total_referrals": user.total_referrals}

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
        metadata={"user_id": user.user_id, "package_id": package_id, "tokens": str(package["tokens"])}
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
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
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    status = await stripe_checkout.get_checkout_status(session_id)
    
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if txn and txn.get("payment_status") == "completed":
        return {"status": "completed", "already_processed": True}
    
    if status.payment_status == "paid" and txn and txn.get("payment_status") != "completed":
        tokens_to_add = int(status.metadata.get("tokens", 0))
        await db.users.update_one({"user_id": user.user_id}, {"$inc": {"tokens": tokens_to_add}})
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"status": status.status, "payment_status": status.payment_status}

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    return {"status": "processed"}

# ==================== DOG PROFILES ====================

@api_router.get("/dogs")
async def get_dogs(user: User = Depends(get_current_user)):
    dogs = await db.dogs.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return dogs

@api_router.post("/dogs")
async def create_dog(dog_data: DogProfileCreate, user: User = Depends(get_current_user)):
    dog = {
        "dog_id": f"dog_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        **dog_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.dogs.insert_one(dog)
    return {k: v for k, v in dog.items() if k != "_id"}

@api_router.get("/dogs/{dog_id}")
async def get_dog(dog_id: str, user: User = Depends(get_current_user)):
    dog = await db.dogs.find_one({"dog_id": dog_id, "user_id": user.user_id}, {"_id": 0})
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    return dog

@api_router.put("/dogs/{dog_id}")
async def update_dog(dog_id: str, dog_data: DogProfileCreate, user: User = Depends(get_current_user)):
    result = await db.dogs.update_one({"dog_id": dog_id, "user_id": user.user_id}, {"$set": dog_data.model_dump()})
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
    
    pet = {
        "pet_id": f"vpet_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "linked_dog_id": body.get("linked_dog_id"),
        "name": body.get("name", "Buddy"),
        "breed": body.get("breed", "Mixed"),
        "happiness": 100,
        "energy": 100,
        "training_level": 1,
        "experience_points": 0,
        "skills_unlocked": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.virtual_pets.insert_one(pet)
    return {k: v for k, v in pet.items() if k != "_id"}

@api_router.post("/virtual-pet/feed")
async def feed_virtual_pet(user: User = Depends(get_current_user)):
    pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
    if not pet:
        raise HTTPException(status_code=404, detail="No virtual pet")
    
    new_happiness = min(100, pet.get("happiness", 50) + 10)
    await db.virtual_pets.update_one(
        {"user_id": user.user_id},
        {"$set": {"happiness": new_happiness, "last_fed": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Pet fed!", "happiness": new_happiness}

@api_router.post("/virtual-pet/play")
async def play_with_virtual_pet(user: User = Depends(get_current_user)):
    pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
    if not pet:
        raise HTTPException(status_code=404, detail="No virtual pet")
    
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
    return {"message": "Played!", "xp_gained": xp_gain, "new_level": new_level}

@api_router.post("/virtual-pet/train")
async def train_virtual_pet(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    skill = body.get("skill", "sit")
    
    pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
    if not pet:
        raise HTTPException(status_code=404, detail="No virtual pet")
    
    if user.tokens < 1:
        raise HTTPException(status_code=400, detail="Not enough tokens")
    
    await db.users.update_one({"user_id": user.user_id}, {"$inc": {"tokens": -1}})
    
    skills = pet.get("skills_unlocked", [])
    if skill not in skills:
        skills.append(skill)
    
    xp_gain = 25
    new_xp = pet.get("experience_points", 0) + xp_gain
    new_level = 1 + (new_xp // 100)
    
    await db.virtual_pets.update_one(
        {"user_id": user.user_id},
        {"$set": {"skills_unlocked": skills, "experience_points": new_xp, "training_level": new_level}}
    )
    return {"message": f"Learned {skill}!", "skills": skills, "new_level": new_level}

# ==================== ACHIEVEMENTS ====================

@api_router.get("/achievements")
async def get_achievements(user: User = Depends(get_current_user)):
    return await db.achievements.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)

@api_router.post("/achievements/{achievement_id}/share")
async def share_achievement(achievement_id: str, user: User = Depends(get_current_user)):
    result = await db.achievements.update_one(
        {"achievement_id": achievement_id, "user_id": user.user_id},
        {"$set": {"shared": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    # Award sharing badge
    count = await db.achievements.count_documents({"user_id": user.user_id, "shared": True})
    if count == 1:
        await db.achievements.insert_one({
            "achievement_id": f"ach_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "title": "Social Butterfly",
            "description": "Shared your first achievement",
            "badge_type": "bronze",
            "category": "social",
            "earned_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Shared!", "bonus_badge": count == 1}

# ==================== TRAINING ====================

@api_router.get("/training/lessons")
async def get_training_lessons(level: Optional[str] = None, category: Optional[str] = None):
    lessons = TRAINING_LESSONS
    if level:
        lessons = [l for l in lessons if l["level"] == level]
    if category:
        lessons = [l for l in lessons if l["category"] == category]
    return sorted(lessons, key=lambda x: x["order"])

@api_router.get("/training/lessons/{lesson_id}")
async def get_training_lesson(lesson_id: str):
    lesson = next((l for l in TRAINING_LESSONS if l["lesson_id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@api_router.post("/training/enroll/{lesson_id}")
async def enroll_in_lesson(lesson_id: str, dog_id: str, user: User = Depends(get_current_user)):
    lesson = next((l for l in TRAINING_LESSONS if l["lesson_id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    if user.tokens < lesson["token_cost"]:
        raise HTTPException(status_code=400, detail=f"Need {lesson['token_cost']} tokens")
    
    existing = await db.training_enrollments.find_one({
        "user_id": user.user_id, "dog_id": dog_id, "lesson_id": lesson_id, "status": "completed"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already completed")
    
    await db.users.update_one({"user_id": user.user_id}, {"$inc": {"tokens": -lesson["token_cost"]}})
    
    enrollment = {
        "enrollment_id": f"enroll_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "dog_id": dog_id,
        "lesson_id": lesson_id,
        "completed_steps": [],
        "status": "in_progress",
        "started_at": datetime.now(timezone.utc).isoformat()
    }
    await db.training_enrollments.insert_one(enrollment)
    
    return {"message": "Enrolled!", "tokens_spent": lesson["token_cost"]}

@api_router.get("/training/enrollments/{dog_id}")
async def get_training_enrollments(dog_id: str, user: User = Depends(get_current_user)):
    return await db.training_enrollments.find({"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}).to_list(100)

@api_router.post("/training/complete-step")
async def complete_training_step(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    enrollment_id = body.get("enrollment_id")
    step_index = body.get("step_index")
    
    enrollment = await db.training_enrollments.find_one({"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    lesson = next((l for l in TRAINING_LESSONS if l["lesson_id"] == enrollment["lesson_id"]), None)
    
    completed_steps = enrollment.get("completed_steps", [])
    if step_index not in completed_steps:
        completed_steps.append(step_index)
    
    status = "in_progress"
    if len(completed_steps) >= len(lesson["steps"]):
        status = "completed"
        # Award achievement
        await db.achievements.insert_one({
            "achievement_id": f"ach_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "dog_id": enrollment["dog_id"],
            "title": f"Completed: {lesson['title']}",
            "description": f"Finished {lesson['title']} training",
            "badge_type": "bronze" if lesson["level"] == "beginner" else "silver" if lesson["level"] == "intermediate" else "gold",
            "category": "training",
            "earned_at": datetime.now(timezone.utc).isoformat()
        })
    
    await db.training_enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": {"completed_steps": completed_steps, "status": status}}
    )
    
    return {"message": "Step completed", "status": status}

# ==================== BREEDS ====================

@api_router.get("/breeds")
async def get_breeds(size: Optional[str] = None, search: Optional[str] = None):
    breeds = ALL_BREEDS
    if size:
        breeds = [b for b in breeds if b["size"] == size]
    if search:
        s = search.lower()
        breeds = [b for b in breeds if s in b["name"].lower()]
    return breeds

@api_router.get("/breeds/{breed_id}")
async def get_breed(breed_id: str):
    breed = next((b for b in ALL_BREEDS if b["breed_id"] == breed_id), None)
    if not breed:
        raise HTTPException(status_code=404, detail="Breed not found")
    return breed

# ==================== HEALTH ====================

@api_router.get("/health/{dog_id}")
async def get_health_records(dog_id: str, user: User = Depends(get_current_user)):
    return await db.health_records.find({"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}).sort("date", -1).to_list(100)

@api_router.post("/health")
async def create_health_record(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    record = {
        "record_id": f"health_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        **{k: v for k, v in body.items()},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.health_records.insert_one(record)
    return {k: v for k, v in record.items() if k != "_id"}

@api_router.delete("/health/{record_id}")
async def delete_health_record(record_id: str, user: User = Depends(get_current_user)):
    result = await db.health_records.delete_one({"record_id": record_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

@api_router.post("/health/analyze")
async def analyze_symptoms(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    dog = await db.dogs.find_one({"dog_id": body.get("dog_id"), "user_id": user.user_id}, {"_id": 0})
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"symptom_{uuid.uuid4().hex[:8]}",
        system_message="Veterinary assistant. Analyze symptoms. Always remind this isn't professional advice."
    ).with_model("openai", "gpt-5.2")
    
    response = await chat.send_message(UserMessage(
        text=f"Analyze for {dog['breed']}: {', '.join(body.get('symptoms', []))}. Severity: {body.get('severity')}"))
    return {"analysis": response}

# ==================== TASKS ====================

@api_router.get("/tasks/{dog_id}")
async def get_tasks(dog_id: str, date: str, user: User = Depends(get_current_user)):
    return await db.tasks.find({"user_id": user.user_id, "dog_id": dog_id, "date": date}, {"_id": 0}).to_list(100)

@api_router.post("/tasks")
async def create_task(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    task = {
        "task_id": f"task_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        **{k: v for k, v in body.items()},
        "is_completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tasks.insert_one(task)
    return {k: v for k, v in task.items() if k != "_id"}

@api_router.put("/tasks/{task_id}/complete")
async def complete_task(task_id: str, user: User = Depends(get_current_user)):
    await db.tasks.update_one(
        {"task_id": task_id, "user_id": user.user_id},
        {"$set": {"is_completed": True, "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    return await db.tasks.find_one({"task_id": task_id}, {"_id": 0})

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user: User = Depends(get_current_user)):
    await db.tasks.delete_one({"task_id": task_id, "user_id": user.user_id})
    return {"message": "Deleted"}

# ==================== BEHAVIOR ====================

@api_router.get("/behavior/{dog_id}")
async def get_behavior_logs(dog_id: str, user: User = Depends(get_current_user)):
    return await db.behavior_logs.find({"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}).sort("date", -1).to_list(100)

@api_router.post("/behavior")
async def create_behavior_log(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    log = {
        "log_id": f"behav_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        **{k: v for k, v in body.items()},
        "date": datetime.now(timezone.utc).isoformat()
    }
    await db.behavior_logs.insert_one(log)
    return {k: v for k, v in log.items() if k != "_id"}

@api_router.delete("/behavior/{log_id}")
async def delete_behavior_log(log_id: str, user: User = Depends(get_current_user)):
    await db.behavior_logs.delete_one({"log_id": log_id, "user_id": user.user_id})
    return {"message": "Deleted"}

# ==================== TRAVEL ====================

@api_router.get("/travel/{dog_id}")
async def get_travel_checklists(dog_id: str, user: User = Depends(get_current_user)):
    return await db.travel_checklists.find({"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}).to_list(100)

@api_router.get("/travel/defaults/items")
async def get_default_travel_items():
    return DEFAULT_TRAVEL_ITEMS

@api_router.post("/travel")
async def create_travel_checklist(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    checklist = {
        "checklist_id": f"travel_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        **{k: v for k, v in body.items()},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.travel_checklists.insert_one(checklist)
    return {k: v for k, v in checklist.items() if k != "_id"}

@api_router.put("/travel/{checklist_id}/item")
async def update_checklist_item(checklist_id: str, item_index: int, checked: bool, user: User = Depends(get_current_user)):
    checklist = await db.travel_checklists.find_one({"checklist_id": checklist_id, "user_id": user.user_id}, {"_id": 0})
    if checklist:
        items = checklist["items"]
        if 0 <= item_index < len(items):
            items[item_index]["checked"] = checked
            await db.travel_checklists.update_one({"checklist_id": checklist_id}, {"$set": {"items": items}})
    return await db.travel_checklists.find_one({"checklist_id": checklist_id}, {"_id": 0})

@api_router.delete("/travel/{checklist_id}")
async def delete_travel_checklist(checklist_id: str, user: User = Depends(get_current_user)):
    await db.travel_checklists.delete_one({"checklist_id": checklist_id, "user_id": user.user_id})
    return {"message": "Deleted"}

# ==================== VETS ====================

@api_router.get("/vets")
async def get_vets(user: User = Depends(get_current_user)):
    return await db.vets.find({"user_id": user.user_id}, {"_id": 0}).to_list(50)

@api_router.post("/vets")
async def add_vet(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    vet = {"vet_id": f"vet_{uuid.uuid4().hex[:12]}", "user_id": user.user_id, **body}
    await db.vets.insert_one(vet)
    return {k: v for k, v in vet.items() if k != "_id"}

@api_router.delete("/vets/{vet_id}")
async def delete_vet(vet_id: str, user: User = Depends(get_current_user)):
    await db.vets.delete_one({"vet_id": vet_id, "user_id": user.user_id})
    return {"message": "Deleted"}

# ==================== VOICE LOGS ====================

@api_router.get("/voice-logs/{dog_id}")
async def get_voice_logs(dog_id: str, user: User = Depends(get_current_user)):
    return await db.voice_logs.find({"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}).sort("created_at", -1).to_list(50)

@api_router.post("/voice-logs")
async def create_voice_log(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    transcript = body.get("transcript", "")
    dog_id = body.get("dog_id")
    
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"voice_{uuid.uuid4().hex[:8]}",
        system_message="Extract bullet points from dog activity log. Return JSON: {bullet_points: [], mood: string, activities: []}"
    ).with_model("openai", "gpt-5.2")
    
    response = await chat.send_message(UserMessage(text=transcript))
    
    import json
    try:
        parsed = json.loads(response)
    except:
        parsed = {"bullet_points": [transcript], "mood": "calm", "activities": []}
    
    log = {
        "log_id": f"voice_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "dog_id": dog_id,
        "transcript": transcript,
        "bullet_points": parsed.get("bullet_points", []),
        "mood_detected": parsed.get("mood", "calm"),
        "activities_mentioned": parsed.get("activities", []),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.voice_logs.insert_one(log)
    return {k: v for k, v in log.items() if k != "_id"}

# ==================== TIPS ====================

@api_router.get("/tips/parenting")
async def get_parenting_tips():
    return PARENTING_TIPS

# ==================== DASHBOARD ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: User = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    dogs_count = await db.dogs.count_documents({"user_id": user.user_id})
    today_tasks = await db.tasks.find({"user_id": user.user_id, "date": today}, {"_id": 0}).to_list(100)
    tasks_completed = len([t for t in today_tasks if t.get("is_completed")])
    enrollments = await db.training_enrollments.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    completed_lessons = len([e for e in enrollments if e.get("status") == "completed"])
    achievements_count = await db.achievements.count_documents({"user_id": user.user_id})
    
    return {
        "dogs_count": dogs_count,
        "tasks_completed": tasks_completed,
        "tasks_total": len(today_tasks),
        "training_completed": completed_lessons,
        "training_total": len(TRAINING_LESSONS),
        "achievements_count": achievements_count,
        "tokens": user.tokens
    }

# ==================== LEADERBOARD & COMPETITIONS ====================

WEEKLY_CHALLENGES = [
    {"id": "training_master", "title": "Training Master", "description": "Complete 3 training lessons this week", "target": 3, "reward_tokens": 5, "type": "training"},
    {"id": "daily_streak", "title": "Daily Dedication", "description": "Complete tasks for 5 consecutive days", "target": 5, "reward_tokens": 8, "type": "tasks"},
    {"id": "health_hero", "title": "Health Hero", "description": "Log 2 health records this week", "target": 2, "reward_tokens": 3, "type": "health"},
    {"id": "pet_lover", "title": "Pet Lover", "description": "Play with your virtual pet 10 times", "target": 10, "reward_tokens": 5, "type": "pet"},
    {"id": "social_star", "title": "Social Star", "description": "Share 2 achievements with friends", "target": 2, "reward_tokens": 4, "type": "social"},
]

@api_router.get("/leaderboard")
async def get_leaderboard(category: str = "overall", limit: int = 20):
    """Get leaderboard rankings"""
    pipeline = []
    
    if category == "training":
        # Top trainers by completed lessons
        pipeline = [
            {"$match": {"status": "completed"}},
            {"$group": {"_id": "$user_id", "score": {"$sum": 1}}},
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
        results = await db.training_enrollments.aggregate(pipeline).to_list(limit)
    elif category == "achievements":
        # Top by achievement count
        pipeline = [
            {"$group": {"_id": "$user_id", "score": {"$sum": 1}}},
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
        results = await db.achievements.aggregate(pipeline).to_list(limit)
    elif category == "pet":
        # Top by virtual pet XP
        results = await db.virtual_pets.find({}, {"_id": 0, "user_id": 1, "experience_points": 1, "name": 1}).sort("experience_points", -1).limit(limit).to_list(limit)
        results = [{"_id": r["user_id"], "score": r.get("experience_points", 0), "pet_name": r.get("name")} for r in results]
    else:
        # Overall - combine metrics
        users = await db.users.find({}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "tokens": 1, "total_referrals": 1}).to_list(100)
        
        user_scores = []
        for u in users:
            training_count = await db.training_enrollments.count_documents({"user_id": u["user_id"], "status": "completed"})
            achievement_count = await db.achievements.count_documents({"user_id": u["user_id"]})
            pet = await db.virtual_pets.find_one({"user_id": u["user_id"]}, {"_id": 0})
            pet_xp = pet.get("experience_points", 0) if pet else 0
            
            # Calculate overall score
            score = (training_count * 10) + (achievement_count * 5) + (pet_xp) + (u.get("total_referrals", 0) * 15)
            
            user_scores.append({
                "user_id": u["user_id"],
                "name": u["name"],
                "picture": u.get("picture"),
                "score": score,
                "training_completed": training_count,
                "achievements": achievement_count,
                "pet_xp": pet_xp,
                "referrals": u.get("total_referrals", 0)
            })
        
        user_scores.sort(key=lambda x: x["score"], reverse=True)
        return {"leaderboard": user_scores[:limit], "category": category}
    
    # Enrich with user data
    enriched = []
    for i, r in enumerate(results):
        user = await db.users.find_one({"user_id": r["_id"]}, {"_id": 0, "name": 1, "picture": 1})
        if user:
            enriched.append({
                "rank": i + 1,
                "user_id": r["_id"],
                "name": user.get("name", "Anonymous"),
                "picture": user.get("picture"),
                "score": r["score"],
                "pet_name": r.get("pet_name")
            })
    
    return {"leaderboard": enriched, "category": category}

@api_router.get("/leaderboard/my-rank")
async def get_my_rank(user: User = Depends(get_current_user)):
    """Get current user's ranking"""
    # Calculate user's overall score
    training_count = await db.training_enrollments.count_documents({"user_id": user.user_id, "status": "completed"})
    achievement_count = await db.achievements.count_documents({"user_id": user.user_id})
    pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
    pet_xp = pet.get("experience_points", 0) if pet else 0
    
    my_score = (training_count * 10) + (achievement_count * 5) + (pet_xp) + (user.total_referrals * 15)
    
    # Count users with higher scores (simplified)
    all_users = await db.users.find({}, {"_id": 0, "user_id": 1, "total_referrals": 1}).to_list(1000)
    higher_count = 0
    
    for u in all_users:
        if u["user_id"] == user.user_id:
            continue
        tc = await db.training_enrollments.count_documents({"user_id": u["user_id"], "status": "completed"})
        ac = await db.achievements.count_documents({"user_id": u["user_id"]})
        p = await db.virtual_pets.find_one({"user_id": u["user_id"]}, {"_id": 0})
        px = p.get("experience_points", 0) if p else 0
        score = (tc * 10) + (ac * 5) + (px) + (u.get("total_referrals", 0) * 15)
        if score > my_score:
            higher_count += 1
    
    return {
        "rank": higher_count + 1,
        "score": my_score,
        "breakdown": {
            "training": training_count,
            "achievements": achievement_count,
            "pet_xp": pet_xp,
            "referrals": user.total_referrals
        }
    }

@api_router.get("/competitions/challenges")
async def get_weekly_challenges(user: User = Depends(get_current_user)):
    """Get current weekly challenges and user progress"""
    # Get start of current week (Monday)
    today = datetime.now(timezone.utc)
    week_start = today - timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    challenges_with_progress = []
    
    for challenge in WEEKLY_CHALLENGES:
        progress = 0
        
        if challenge["type"] == "training":
            # Count training completions this week
            progress = await db.training_enrollments.count_documents({
                "user_id": user.user_id,
                "status": "completed"
            })
        elif challenge["type"] == "tasks":
            # Count days with completed tasks this week
            days_with_tasks = set()
            tasks = await db.tasks.find({
                "user_id": user.user_id,
                "is_completed": True
            }, {"_id": 0, "date": 1}).to_list(100)
            for t in tasks:
                if t.get("date"):
                    days_with_tasks.add(t["date"])
            progress = len(days_with_tasks)
        elif challenge["type"] == "health":
            progress = await db.health_records.count_documents({"user_id": user.user_id})
        elif challenge["type"] == "pet":
            pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
            progress = (pet.get("experience_points", 0) // 15) if pet else 0  # Each play = 15 XP
        elif challenge["type"] == "social":
            progress = await db.achievements.count_documents({"user_id": user.user_id, "shared": True})
        
        is_completed = progress >= challenge["target"]
        
        # Check if already claimed
        claimed = await db.challenge_claims.find_one({
            "user_id": user.user_id,
            "challenge_id": challenge["id"],
            "week_start": week_start.isoformat()
        })
        
        challenges_with_progress.append({
            **challenge,
            "progress": min(progress, challenge["target"]),
            "is_completed": is_completed,
            "is_claimed": claimed is not None,
            "can_claim": is_completed and not claimed
        })
    
    return {
        "challenges": challenges_with_progress,
        "week_start": week_start.isoformat(),
        "week_end": (week_start + timedelta(days=6)).isoformat()
    }

@api_router.post("/competitions/claim/{challenge_id}")
async def claim_challenge_reward(challenge_id: str, user: User = Depends(get_current_user)):
    """Claim reward for completed challenge"""
    challenge = next((c for c in WEEKLY_CHALLENGES if c["id"] == challenge_id), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    today = datetime.now(timezone.utc)
    week_start = today - timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Check if already claimed
    existing = await db.challenge_claims.find_one({
        "user_id": user.user_id,
        "challenge_id": challenge_id,
        "week_start": week_start.isoformat()
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already claimed")
    
    # Verify completion (simplified check)
    # In production, would re-verify the actual progress
    
    # Award tokens
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$inc": {"tokens": challenge["reward_tokens"]}}
    )
    
    # Record claim
    await db.challenge_claims.insert_one({
        "claim_id": f"claim_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "challenge_id": challenge_id,
        "week_start": week_start.isoformat(),
        "tokens_awarded": challenge["reward_tokens"],
        "claimed_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Award achievement for first challenge
    claims_count = await db.challenge_claims.count_documents({"user_id": user.user_id})
    if claims_count == 1:
        await db.achievements.insert_one({
            "achievement_id": f"ach_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "title": "Challenge Accepted",
            "description": "Completed your first weekly challenge",
            "badge_type": "bronze",
            "category": "milestone",
            "earned_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {
        "message": f"Claimed {challenge['reward_tokens']} tokens!",
        "tokens_awarded": challenge["reward_tokens"],
        "new_achievement": claims_count == 1
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
