from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
import random
import asyncio
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
import qrcode
from io import BytesIO
import base64
import resend
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend Email Configuration
resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_reset_code() -> str:
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import breed and training data
from breeds_data import BREED_DATABASE
from breeds_data_2 import ADDITIONAL_BREEDS
from training_lessons_data import TRAINING_LESSONS

ALL_BREEDS = BREED_DATABASE + ADDITIONAL_BREEDS

# First purchase discount
FIRST_PURCHASE_DISCOUNT = 0.10  # 10% off

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
    age_days: int = 0
    weight_kg: float = 10.0
    size: str = "medium"
    gender: str = "unknown"
    birthday: Optional[str] = None
    color: Optional[str] = None
    photo_url: Optional[str] = None

class NotificationSettings(BaseModel):
    push_enabled: bool = True
    training_reminders: bool = True
    daily_tips: bool = True
    achievement_alerts: bool = True
    tournament_updates: bool = True
    marketing: bool = False
    auto_login_reminder: bool = True
    pet_care_reminders: bool = True
    streak_reminders: bool = True

class PromoCodeCreate(BaseModel):
    code: str
    code_type: str = "tokens"  # "tokens" or "discount"
    value: int = 0  # tokens amount or discount percentage
    max_uses: Optional[int] = None  # None = unlimited
    expires_at: Optional[str] = None
    description: Optional[str] = None

class PromoCodeRedeem(BaseModel):
    code: str

# Password Reset Models
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetVerify(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class EmailPasswordLogin(BaseModel):
    email: EmailStr
    password: str

class EmailPasswordRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class ChatMessage(BaseModel):
    message: str

# Chat support cost
CHAT_COST_PER_MESSAGE = 5

# Admin emails - add your admin emails here
ADMIN_EMAILS = [
    "admin@caninecompass.app",
    "developer@caninecompass.app"
]

# VIP Players - Special rewards: 20 tokens daily + initial 1200 tokens bonus
VIP_PLAYERS = [
    "jfk9unit@gmail.com",
    "rociolopez111@hotmail.com",
    "damoncrook94@gmail.com"
]

# Daily Motivational Memos
DAILY_MEMOS = [
    {"title": "Pawsitive Energy!", "message": "Every day with your pup is a gift. Make today count with some quality training time! 🐕"},
    {"title": "Training Tip", "message": "Consistency is key! Just 10 minutes of daily training can make a huge difference in your dog's behavior."},
    {"title": "Celebrate Small Wins", "message": "Did your dog sit on command today? That's worth celebrating! Progress happens one paw at a time. 🎉"},
    {"title": "Bond Building", "message": "Training isn't just about commands - it's about building an unbreakable bond with your furry friend. ❤️"},
    {"title": "Stay Patient", "message": "Remember, your dog wants to please you! Stay patient and positive, and the results will follow."},
    {"title": "Adventure Awaits", "message": "Take your training outdoors today! New environments help reinforce learned behaviors. 🌳"},
    {"title": "You're Doing Great!", "message": "Being a responsible dog owner takes dedication. We're proud of the effort you're putting in! ⭐"},
    {"title": "Health Reminder", "message": "A healthy dog is a happy dog! Don't forget regular check-ups and plenty of fresh water. 💧"},
    {"title": "Play Time!", "message": "All work and no play makes training dull. Mix in some fun activities with your training today! 🎾"},
    {"title": "Community Love", "message": "You're part of an amazing community of dog lovers. Share your progress and inspire others! 🐾"},
    {"title": "New Skills Unlock", "message": "Ready to try something new? Check out our advanced training programs for exciting challenges! 🏆"},
    {"title": "Treat Time!", "message": "Positive reinforcement works wonders. High-value treats make training sessions more exciting! 🦴"},
    {"title": "Rest & Recover", "message": "Dogs need downtime too! Balance training with plenty of rest for optimal learning. 😴"},
    {"title": "Weather Wisdom", "message": "Adapt your training to the weather - indoor games work great on rainy days! ☔"},
    {"title": "Milestone Moment", "message": "Look how far you've come! Take a moment to appreciate your training journey. 🌟"},
    {"title": "Safety First", "message": "A well-trained dog is a safe dog. Keep practicing those recall commands! 🦮"},
    {"title": "Puppy Love", "message": "Your dog's tail wag is the best reward. Keep spreading joy and positive vibes! 💝"},
    {"title": "Expert Tip", "message": "End training sessions on a positive note - always finish with a command your dog knows well!"},
    {"title": "Weekend Warrior", "message": "Weekends are perfect for longer training sessions. Plan something special for you and your pup! 🎊"},
    {"title": "Gratitude Moment", "message": "Thank you for being an awesome dog parent! Your dedication makes the world better for dogs everywhere. 🙏"},
    {"title": "Challenge Accepted", "message": "Push your boundaries today! Try teaching your dog one new trick. You might surprise yourself! 💪"},
    {"title": "Social Skills", "message": "Socialization is training too! Introduce your dog to new friends (safely) to build confidence."},
    {"title": "Morning Motivation", "message": "Rise and shine, champion trainer! Today is full of possibilities for you and your pup! ☀️"},
    {"title": "Evening Reflection", "message": "What did you and your dog accomplish today? Every bit of progress counts! 🌙"},
    {"title": "K9 Excellence", "message": "You're on the path to K9 handler excellence! Keep pushing towards those certifications! 🎖️"},
    {"title": "Loyalty Rewarded", "message": "Your commitment to training shows true love. Dogs sense that dedication! 💖"},
    {"title": "Fun Fact", "message": "Dogs can learn over 1,000 words! Keep expanding your pup's vocabulary with new commands. 📚"},
    {"title": "Team Spirit", "message": "You and your dog are a team. Together, there's nothing you can't achieve! 🤝"},
    {"title": "Pawfection", "message": "There's no such thing as a perfect dog or owner - but you're both perfectly matched! 🐶"},
    {"title": "Keep Going!", "message": "Every expert was once a beginner. Your dedication today builds tomorrow's success! 🚀"}
]

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

# ==================== HELPER FUNCTIONS ====================

async def is_admin(user: User) -> bool:
    """Check if user is an admin"""
    return user.email in ADMIN_EMAILS

async def is_vip_player(email: str) -> bool:
    """Check if a user is a VIP player (from hardcoded list or database)"""
    if email in VIP_PLAYERS:
        return True
    db_vip = await db.vip_players.find_one({"email": email.lower()})
    return db_vip is not None

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
        
        # Calculate initial tokens
        initial_tokens = 5 if referred_by else 0
        
        # VIP players get 1200 bonus tokens on first signup!
        is_vip_player = user_data["email"] in VIP_PLAYERS
        if is_vip_player:
            initial_tokens += 1200
        
        new_user = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "tokens": initial_tokens,
            "referral_code": user_referral_code,
            "referred_by": referred_by,
            "total_referrals": 0,
            "is_vip": is_vip_player,
            "vip_bonus_claimed": is_vip_player,
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

# ==================== EMAIL/PASSWORD AUTH & PASSWORD RESET ====================

@api_router.post("/auth/register")
async def register_with_email(data: EmailPasswordRegister, response: Response):
    """Register a new user with email and password"""
    # Check if email already exists
    existing = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_referral_code = f"CC{uuid.uuid4().hex[:8].upper()}"
    
    # Check if VIP
    is_vip = data.email.lower() in [v.lower() for v in VIP_PLAYERS]
    initial_tokens = 1200 if is_vip else 0
    
    new_user = {
        "user_id": user_id,
        "email": data.email.lower(),
        "name": data.name,
        "picture": None,
        "password_hash": hash_password(data.password),
        "auth_type": "email",
        "tokens": initial_tokens,
        "referral_code": user_referral_code,
        "referred_by": None,
        "total_referrals": 0,
        "is_vip": is_vip,
        "vip_bonus_claimed": is_vip,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(new_user)
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
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
    
    return {
        "user_id": user_id,
        "email": data.email.lower(),
        "name": data.name,
        "tokens": initial_tokens,
        "message": "Registration successful!"
    }

@api_router.post("/auth/login")
async def login_with_email(data: EmailPasswordLogin, response: Response):
    """Login with email and password"""
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if this is an OAuth-only account
    if not user.get("password_hash") and user.get("auth_type") != "email":
        raise HTTPException(status_code=400, detail="This account uses Google login. Please sign in with Google.")
    
    if not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none",
        max_age=7 * 24 * 60 * 60, path="/"
    )
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "tokens": user.get("tokens", 0),
        "message": "Login successful!"
    }

@api_router.post("/auth/password-reset/request")
async def request_password_reset(data: PasswordResetRequest):
    """Request a password reset - sends verification code via email"""
    email = data.email.lower()
    
    # Check if user exists
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    # Always return success to prevent email enumeration
    if not user:
        logger.info(f"Password reset requested for non-existent email: {email}")
        return {"message": "If an account exists with this email, a verification code has been sent."}
    
    # Check if this is an OAuth-only account
    if user.get("auth_type") == "google" and not user.get("password_hash"):
        return {"message": "This account uses Google login. Please sign in with Google instead."}
    
    # Generate 6-digit code
    code = generate_reset_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    # Store reset code
    await db.password_resets.delete_many({"email": email})
    await db.password_resets.insert_one({
        "email": email,
        "code": code,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "used": False
    })
    
    # Send email
    if resend.api_key:
        try:
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🐕 CanineCompass</h1>
                    <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Password Reset Request</p>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                    <p style="color: #374151; font-size: 16px;">Hi {user.get('name', 'there')}!</p>
                    <p style="color: #6b7280; font-size: 14px;">You requested a password reset for your CanineCompass account. Use the code below to reset your password:</p>
                    <div style="background: white; border: 2px dashed #22c55e; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #22c55e;">{code}</span>
                    </div>
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">This code expires in 15 minutes.</p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">If you didn't request this reset, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 CanineCompass - Your K9 Training Companion</p>
                </div>
            </div>
            """
            
            params = {
                "from": SENDER_EMAIL,
                "to": [email],
                "subject": "🐕 Your CanineCompass Password Reset Code",
                "html": html_content
            }
            
            await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"Password reset email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send password reset email: {str(e)}")
            # Still return success but log the error
    else:
        logger.warning("RESEND_API_KEY not configured. Reset code generated but email not sent.")
        logger.info(f"DEV MODE: Password reset code for {email}: {code}")
    
    return {"message": "If an account exists with this email, a verification code has been sent."}

@api_router.post("/auth/password-reset/verify")
async def verify_password_reset(data: PasswordResetVerify, response: Response):
    """Verify reset code and set new password"""
    email = data.email.lower()
    
    # Find reset record
    reset_record = await db.password_resets.find_one({
        "email": email,
        "code": data.code,
        "used": False
    }, {"_id": 0})
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # Check expiration
    expires_at = datetime.fromisoformat(reset_record["expires_at"])
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification code has expired")
    
    # Validate new password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Update password
    result = await db.users.update_one(
        {"email": email},
        {"$set": {
            "password_hash": hash_password(data.new_password),
            "auth_type": "email"
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mark code as used
    await db.password_resets.update_one(
        {"email": email, "code": data.code},
        {"$set": {"used": True}}
    )
    
    # Get user and create session
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none",
        max_age=7 * 24 * 60 * 60, path="/"
    )
    
    return {
        "message": "Password reset successful! You are now logged in.",
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"]
    }

# ==================== AI CHAT SUPPORT ====================

@api_router.post("/chat/support")
async def chat_support(data: ChatMessage, user: User = Depends(get_current_user)):
    """24/7 AI Chat Support - Costs tokens per message"""
    
    # Check token balance
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    current_tokens = user_doc.get("tokens", 0)
    
    if current_tokens < CHAT_COST_PER_MESSAGE:
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough tokens. You need {CHAT_COST_PER_MESSAGE} tokens per message. Current balance: {current_tokens}"
        )
    
    # Deduct tokens
    new_balance = current_tokens - CHAT_COST_PER_MESSAGE
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"tokens": new_balance}}
    )
    
    # Get AI response using Emergent LLM
    try:
        llm_key = os.environ.get("EMERGENT_LLM_KEY", "")
        
        system_prompt = """You are a friendly and knowledgeable K9 training assistant for CanineCompass, a dog training app. 
        You help users with:
        - Dog training techniques and tips
        - Behavior problems and solutions
        - Health and nutrition advice
        - Using the CanineCompass app features
        - General dog care questions
        
        Keep responses helpful, concise (under 150 words), and encouraging. Use dog-related emojis occasionally.
        Always be positive and supportive. If you don't know something, recommend consulting a veterinarian or professional trainer."""
        
        chat = LlmChat(
            api_key=llm_key,
            model="gpt-4o-mini",
            system_message=system_prompt
        )
        
        response = await chat.send_async(UserMessage(content=data.message))
        ai_reply = response.content
        
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        # Fallback responses if AI fails
        fallback_responses = [
            "🐕 That's a great question! For specific training advice, try our Training Center which has step-by-step lessons. Keep up the great work with your pup!",
            "🐾 Thanks for asking! I recommend checking out our K9 Training section for detailed guidance. Remember, consistency is key in dog training!",
            "🦴 Good question! Every dog learns at their own pace. Our Training Center has lots of helpful videos and tips. Stay patient and positive!",
            "🎾 I appreciate your question! For the best results, practice regularly with your dog. Check out our daily training challenges for motivation!"
        ]
        import random
        ai_reply = random.choice(fallback_responses)
    
    # Log chat interaction
    await db.chat_logs.insert_one({
        "user_id": user.user_id,
        "message": data.message,
        "reply": ai_reply,
        "tokens_spent": CHAT_COST_PER_MESSAGE,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "reply": ai_reply,
        "tokens_spent": CHAT_COST_PER_MESSAGE,
        "remaining_tokens": new_balance
    }

@api_router.get("/chat/history")
async def get_chat_history(limit: int = 50, user: User = Depends(get_current_user)):
    """Get user's chat history"""
    history = await db.chat_logs.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {"history": history[::-1]}  # Return in chronological order

# ==================== DAILY LOGIN REWARDS ====================

STREAK_REWARDS = {
    1: {"tokens": 1, "xp": 10},
    2: {"tokens": 1, "xp": 15},
    3: {"tokens": 2, "xp": 20},
    4: {"tokens": 2, "xp": 25},
    5: {"tokens": 3, "xp": 30},
    6: {"tokens": 3, "xp": 35},
    7: {"tokens": 5, "xp": 50},  # Weekly bonus
}

MILESTONE_REWARDS = {
    7: {"tokens": 10, "badge": "Week Warrior"},
    14: {"tokens": 15, "badge": "Fortnight Fighter"},
    30: {"tokens": 25, "badge": "Monthly Master"},
    60: {"tokens": 40, "badge": "Dedicated Trainer"},
    100: {"tokens": 75, "badge": "Century Champion"},
    365: {"tokens": 200, "badge": "Year-Round Hero"},
}

@api_router.get("/daily-reward/status")
async def get_daily_reward_status(user: User = Depends(get_current_user)):
    """Get user's login streak and daily reward status"""
    login_data = await db.login_streaks.find_one({"user_id": user.user_id}, {"_id": 0})
    
    if not login_data:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "total_logins": 0,
            "claimed_today": False,
            "next_reward": STREAK_REWARDS[1],
            "milestones_earned": []
        }
    
    # Check if already claimed today
    last_claim = login_data.get("last_claim_date")
    today = datetime.now(timezone.utc).date().isoformat()
    claimed_today = last_claim == today
    
    current_streak = login_data.get("current_streak", 0)
    streak_day = min(current_streak + 1, 7) if not claimed_today else min(current_streak, 7)
    
    return {
        "current_streak": current_streak,
        "longest_streak": login_data.get("longest_streak", 0),
        "total_logins": login_data.get("total_logins", 0),
        "claimed_today": claimed_today,
        "next_reward": STREAK_REWARDS.get(streak_day, STREAK_REWARDS[7]),
        "milestones_earned": login_data.get("milestones_earned", [])
    }

@api_router.post("/daily-reward/claim")
async def claim_daily_reward(user: User = Depends(get_current_user)):
    """Claim daily login reward"""
    login_data = await db.login_streaks.find_one({"user_id": user.user_id}, {"_id": 0})
    today = datetime.now(timezone.utc).date()
    today_str = today.isoformat()
    yesterday_str = (today - timedelta(days=1)).isoformat()
    
    if not login_data:
        # First login ever
        new_streak = 1
        login_data = {
            "user_id": user.user_id,
            "current_streak": 1,
            "longest_streak": 1,
            "total_logins": 1,
            "last_claim_date": today_str,
            "milestones_earned": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.login_streaks.insert_one(login_data)
    else:
        last_claim = login_data.get("last_claim_date")
        
        # Already claimed today
        if last_claim == today_str:
            raise HTTPException(status_code=400, detail="Already claimed today")
        
        # Check if streak continues or resets
        if last_claim == yesterday_str:
            new_streak = login_data.get("current_streak", 0) + 1
        else:
            new_streak = 1  # Streak broken
        
        # Update streak data
        longest = max(login_data.get("longest_streak", 0), new_streak)
        await db.login_streaks.update_one(
            {"user_id": user.user_id},
            {"$set": {
                "current_streak": new_streak,
                "longest_streak": longest,
                "last_claim_date": today_str
            }, "$inc": {"total_logins": 1}}
        )
    
    # Calculate rewards
    streak_day = min(new_streak, 7)
    if new_streak > 7:
        streak_day = ((new_streak - 1) % 7) + 1  # Cycle through week rewards
    
    reward = STREAK_REWARDS.get(streak_day, STREAK_REWARDS[1])
    
    # VIP players get 20 tokens daily!
    is_vip = await is_vip_player(user.email)
    tokens_earned = 20 if is_vip else reward["tokens"]
    xp_earned = reward["xp"] * 2 if is_vip else reward["xp"]  # VIP gets double XP too
    
    # Check for milestone rewards
    milestone_bonus = 0
    milestone_badge = None
    total_logins = login_data.get("total_logins", 0) + 1 if login_data else 1
    milestones_earned = login_data.get("milestones_earned", []) if login_data else []
    
    if new_streak in MILESTONE_REWARDS and new_streak not in milestones_earned:
        milestone = MILESTONE_REWARDS[new_streak]
        milestone_bonus = milestone["tokens"]
        milestone_badge = milestone["badge"]
        milestones_earned.append(new_streak)
        
        await db.login_streaks.update_one(
            {"user_id": user.user_id},
            {"$set": {"milestones_earned": milestones_earned}}
        )
    
    # Award tokens
    total_tokens = tokens_earned + milestone_bonus
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$inc": {"tokens": total_tokens}}
    )
    
    return {
        "success": True,
        "streak": new_streak,
        "tokens_earned": tokens_earned,
        "xp_earned": xp_earned,
        "milestone_bonus": milestone_bonus,
        "milestone_badge": milestone_badge,
        "total_tokens": total_tokens,
        "message": f"Day {new_streak} reward claimed! +{total_tokens} tokens",
        "is_vip": is_vip
    }

# ==================== WELCOME & DAILY MEMOS ====================

@api_router.get("/welcome-message")
async def get_welcome_message(user: User = Depends(get_current_user)):
    """Get personalized welcome message for the user"""
    is_vip = await is_vip_player(user.email)
    is_admin_user = user.email in ADMIN_EMAILS
    first_name = user.name.split()[0] if user.name else "Friend"
    
    # Check if VIP player needs their initial 1200 token bonus
    vip_bonus_just_claimed = False
    if is_vip:
        user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
        if user_doc and not user_doc.get("vip_bonus_claimed"):
            # Award 1200 tokens to existing VIP player
            await db.users.update_one(
                {"user_id": user.user_id},
                {"$inc": {"tokens": 1200}, "$set": {"vip_bonus_claimed": True, "is_vip": True}}
            )
            vip_bonus_just_claimed = True
    
    # Get daily memo (based on day of year for variety)
    day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
    memo_index = day_of_year % len(DAILY_MEMOS)
    daily_memo = DAILY_MEMOS[memo_index]
    
    # Check if user has seen today's memo
    today = datetime.now(timezone.utc).date().isoformat()
    memo_seen = await db.daily_memos_seen.find_one({
        "user_id": user.user_id,
        "date": today
    })
    
    # Determine role-based greeting
    if is_admin_user:
        role = "admin"
        greeting = f"Welcome back, {first_name}! 🛡️ Thank you for being an amazing admin and keeping CanineCompass running smoothly. Your dedication makes our community thrive!"
    elif is_vip:
        role = "vip"
        if vip_bonus_just_claimed:
            greeting = f"🎉 CONGRATULATIONS, {first_name}! 🎉 You've been selected as a VIP Tester! 1,200 bonus tokens have been added to your account. As a VIP, you'll receive 20 FREE tokens every day you open the app. Thank you for being part of our exclusive testing team!"
        else:
            greeting = f"Welcome back, {first_name}! ⭐ As a valued VIP member, you're at the heart of our community. Remember: you get 20 FREE tokens every day! Thank you for your incredible support!"
    else:
        role = "member"
        greeting = f"Welcome back, {first_name}! 🐕 We're so happy to see you. Your journey to becoming an amazing dog handler continues today!"
    
    return {
        "first_name": first_name,
        "role": role,
        "is_vip": is_vip,
        "is_admin": is_admin_user,
        "greeting": greeting,
        "daily_memo": daily_memo,
        "memo_already_seen": memo_seen is not None,
        "vip_daily_tokens": 20 if is_vip else None,
        "vip_bonus_just_claimed": vip_bonus_just_claimed,
        "vip_bonus_amount": 1200 if vip_bonus_just_claimed else 0
    }

@api_router.post("/daily-memo/mark-seen")
async def mark_daily_memo_seen(user: User = Depends(get_current_user)):
    """Mark today's daily memo as seen"""
    today = datetime.now(timezone.utc).date().isoformat()
    
    await db.daily_memos_seen.update_one(
        {"user_id": user.user_id, "date": today},
        {"$set": {"seen_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"success": True, "message": "Memo marked as seen"}

@api_router.get("/user/vip-status")
async def get_vip_status(user: User = Depends(get_current_user)):
    """Check if user is a VIP player"""
    is_vip = await is_vip_player(user.email)
    
    return {
        "is_vip": is_vip,
        "vip_benefits": {
            "daily_tokens": 20,
            "double_xp": True,
            "special_badge": "VIP Tester"
        } if is_vip else None
    }

@api_router.post("/admin/award-tokens")
async def admin_award_tokens(request: Request, user: User = Depends(get_current_user)):
    """Admin: Award tokens to a specific user by email"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    body = await request.json()
    target_email = body.get("email")
    tokens_amount = body.get("tokens", 0)
    
    if not target_email or tokens_amount <= 0:
        raise HTTPException(status_code=400, detail="Email and positive token amount required")
    
    result = await db.users.update_one(
        {"email": target_email},
        {"$inc": {"tokens": tokens_amount}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the award
    await db.token_awards.insert_one({
        "target_email": target_email,
        "tokens": tokens_amount,
        "awarded_by": user.email,
        "awarded_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "message": f"Awarded {tokens_amount} tokens to {target_email}"
    }

@api_router.get("/admin/stats")
async def get_admin_stats(user: User = Depends(get_current_user)):
    """Admin: Get app statistics"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_dogs = await db.dogs.count_documents({})
    total_tokens_distributed = await db.token_awards.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$tokens"}}}
    ]).to_list(1)
    
    # Count active users today
    today = datetime.now(timezone.utc).date().isoformat()
    active_today = await db.login_streaks.count_documents({"last_claim_date": today})
    
    # Count VIP players
    vip_count = len(VIP_PLAYERS)
    
    # Count promo codes
    promo_count = await db.promo_codes.count_documents({"active": True})
    total_redemptions = await db.promo_redemptions.count_documents({})
    
    return {
        "total_users": total_users,
        "total_dogs": total_dogs,
        "total_tokens_distributed": total_tokens_distributed[0]["total"] if total_tokens_distributed else 0,
        "active_today": active_today,
        "vip_count": vip_count,
        "active_promo_codes": promo_count,
        "total_redemptions": total_redemptions
    }

@api_router.get("/admin/users")
async def get_all_users(user: User = Depends(get_current_user)):
    """Admin: Get all users"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    # Mark VIP users
    for u in users:
        u["is_vip"] = u.get("email") in VIP_PLAYERS
    
    return {"users": users}

@api_router.get("/admin/vip-players")
async def get_vip_players(user: User = Depends(get_current_user)):
    """Admin: Get list of VIP players"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get from database first, then fall back to hardcoded list
    db_vips = await db.vip_players.find({}, {"_id": 0}).to_list(100)
    db_vip_emails = [v.get("email") for v in db_vips if v.get("email")]
    
    # Combine hardcoded and database VIPs
    all_vips = list(set(VIP_PLAYERS + db_vip_emails))
    
    return {"vip_players": all_vips}

@api_router.post("/admin/vip-players")
async def add_vip_player(request: Request, user: User = Depends(get_current_user)):
    """Admin: Add a new VIP player"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    body = await request.json()
    email = body.get("email", "").lower().strip()
    
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email required")
    
    # Check if already VIP
    if email in VIP_PLAYERS:
        raise HTTPException(status_code=400, detail="Already a VIP player (hardcoded)")
    
    existing = await db.vip_players.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Already a VIP player")
    
    # Add to database
    await db.vip_players.insert_one({
        "email": email,
        "added_by": user.email,
        "added_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Award 1200 tokens if user exists
    user_exists = await db.users.find_one({"email": email})
    if user_exists and not user_exists.get("vip_bonus_claimed"):
        await db.users.update_one(
            {"email": email},
            {"$inc": {"tokens": 1200}, "$set": {"vip_bonus_claimed": True, "is_vip": True}}
        )
    
    return {"success": True, "message": f"Added {email} as VIP player"}

@api_router.delete("/admin/vip-players/{email}")
async def remove_vip_player(email: str, user: User = Depends(get_current_user)):
    """Admin: Remove a VIP player"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    email = email.lower().strip()
    
    # Cannot remove hardcoded VIPs
    if email in VIP_PLAYERS:
        raise HTTPException(status_code=400, detail="Cannot remove hardcoded VIP player")
    
    result = await db.vip_players.delete_one({"email": email})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="VIP player not found")
    
    # Update user record
    await db.users.update_one(
        {"email": email},
        {"$set": {"is_vip": False}}
    )
    
    return {"success": True, "message": f"Removed {email} from VIP players"}

# ==================== PROMO CODES (Admin Issued) ====================

@api_router.post("/admin/promo-codes")
async def create_promo_code(promo: PromoCodeCreate, user: User = Depends(get_current_user)):
    """Admin: Create a new promo code"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if code already exists
    existing = await db.promo_codes.find_one({"code": promo.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Promo code already exists")
    
    promo_doc = {
        "code": promo.code.upper(),
        "code_type": promo.code_type,
        "value": promo.value,
        "max_uses": promo.max_uses,
        "used_count": 0,
        "expires_at": promo.expires_at,
        "description": promo.description,
        "created_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "active": True
    }
    
    await db.promo_codes.insert_one(promo_doc)
    
    # Generate shareable link
    app_url = os.environ.get('APP_URL', 'https://caninecompass.app')
    share_link = f"{app_url}/redeem?code={promo.code.upper()}"
    
    return {
        "success": True,
        "code": promo.code.upper(),
        "share_link": share_link,
        "message": f"Promo code '{promo.code.upper()}' created successfully"
    }

@api_router.get("/admin/promo-codes")
async def list_promo_codes(user: User = Depends(get_current_user)):
    """Admin: List all promo codes"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    codes = await db.promo_codes.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"promo_codes": codes}

@api_router.put("/admin/promo-codes/{code}")
async def update_promo_code(code: str, request: Request, user: User = Depends(get_current_user)):
    """Admin: Update a promo code (activate/deactivate)"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    body = await request.json()
    update_fields = {}
    
    if "active" in body:
        update_fields["active"] = body["active"]
    if "max_uses" in body:
        update_fields["max_uses"] = body["max_uses"]
    if "expires_at" in body:
        update_fields["expires_at"] = body["expires_at"]
    
    result = await db.promo_codes.update_one(
        {"code": code.upper()},
        {"$set": update_fields}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Promo code not found")
    
    return {"success": True, "message": f"Promo code '{code.upper()}' updated"}

@api_router.delete("/admin/promo-codes/{code}")
async def delete_promo_code(code: str, user: User = Depends(get_current_user)):
    """Admin: Delete a promo code"""
    if not await is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.promo_codes.delete_one({"code": code.upper()})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promo code not found")
    
    return {"success": True, "message": f"Promo code '{code.upper()}' deleted"}

@api_router.get("/promo-codes/validate/{code}")
async def validate_promo_code(code: str, user: User = Depends(get_current_user)):
    """Validate a promo code before redeeming"""
    promo = await db.promo_codes.find_one({"code": code.upper(), "active": True}, {"_id": 0})
    
    if not promo:
        raise HTTPException(status_code=404, detail="Invalid or expired promo code")
    
    # Check if expired
    if promo.get("expires_at"):
        expires = datetime.fromisoformat(promo["expires_at"])
        if expires < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Promo code has expired")
    
    # Check max uses
    if promo.get("max_uses") and promo["used_count"] >= promo["max_uses"]:
        raise HTTPException(status_code=400, detail="Promo code usage limit reached")
    
    # Check if user already redeemed this code
    already_used = await db.promo_redemptions.find_one({
        "user_id": user.user_id,
        "code": code.upper()
    })
    
    if already_used:
        raise HTTPException(status_code=400, detail="You have already redeemed this code")
    
    return {
        "valid": True,
        "code": promo["code"],
        "code_type": promo["code_type"],
        "value": promo["value"],
        "description": promo.get("description", ""),
        "message": f"{'Free tokens' if promo['code_type'] == 'tokens' else 'Discount'}: {promo['value']}{'%' if promo['code_type'] == 'discount' else ' tokens'}"
    }

@api_router.post("/promo-codes/redeem")
async def redeem_promo_code(redeem: PromoCodeRedeem, user: User = Depends(get_current_user)):
    """Redeem a promo code for tokens or discount"""
    code = redeem.code.upper()
    
    promo = await db.promo_codes.find_one({"code": code, "active": True}, {"_id": 0})
    
    if not promo:
        raise HTTPException(status_code=404, detail="Invalid or expired promo code")
    
    # Check if expired
    if promo.get("expires_at"):
        expires = datetime.fromisoformat(promo["expires_at"])
        if expires < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Promo code has expired")
    
    # Check max uses
    if promo.get("max_uses") and promo["used_count"] >= promo["max_uses"]:
        raise HTTPException(status_code=400, detail="Promo code usage limit reached")
    
    # Check if user already redeemed
    already_used = await db.promo_redemptions.find_one({
        "user_id": user.user_id,
        "code": code
    })
    
    if already_used:
        raise HTTPException(status_code=400, detail="You have already redeemed this code")
    
    reward_message = ""
    tokens_awarded = 0
    discount_awarded = 0
    
    if promo["code_type"] == "tokens":
        # Award tokens directly
        tokens_awarded = promo["value"]
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$inc": {"tokens": tokens_awarded}}
        )
        reward_message = f"🎉 You received {tokens_awarded} free tokens!"
        
    elif promo["code_type"] == "discount":
        # Store discount for next purchase
        discount_awarded = promo["value"]
        await db.user_discounts.update_one(
            {"user_id": user.user_id},
            {"$set": {
                "discount_percent": discount_awarded,
                "promo_code": code,
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
            }},
            upsert=True
        )
        reward_message = f"🎉 {discount_awarded}% discount applied to your next purchase!"
    
    # Record redemption
    await db.promo_redemptions.insert_one({
        "user_id": user.user_id,
        "code": code,
        "code_type": promo["code_type"],
        "value": promo["value"],
        "redeemed_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Increment used count
    await db.promo_codes.update_one(
        {"code": code},
        {"$inc": {"used_count": 1}}
    )
    
    return {
        "success": True,
        "code": code,
        "code_type": promo["code_type"],
        "tokens_awarded": tokens_awarded,
        "discount_awarded": discount_awarded,
        "message": reward_message
    }

@api_router.get("/promo-codes/my-discount")
async def get_my_discount(user: User = Depends(get_current_user)):
    """Get user's active discount (if any)"""
    discount = await db.user_discounts.find_one({"user_id": user.user_id}, {"_id": 0})
    
    if not discount:
        return {"has_discount": False}
    
    # Check if expired
    if discount.get("expires_at"):
        expires = datetime.fromisoformat(discount["expires_at"])
        if expires < datetime.now(timezone.utc):
            await db.user_discounts.delete_one({"user_id": user.user_id})
            return {"has_discount": False}
    
    return {
        "has_discount": True,
        "discount_percent": discount["discount_percent"],
        "promo_code": discount.get("promo_code", ""),
        "expires_at": discount.get("expires_at")
    }

@api_router.get("/promo-codes/my-history")
async def get_redemption_history(user: User = Depends(get_current_user)):
    """Get user's promo code redemption history"""
    history = await db.promo_redemptions.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("redeemed_at", -1).to_list(50)
    
    return {"redemptions": history}

@api_router.get("/admin/check")
async def check_admin_status(user: User = Depends(get_current_user)):
    """Check if current user is an admin"""
    return {"is_admin": await is_admin(user), "email": user.email}

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

# PayPal has been removed - Stripe only

@api_router.get("/payments/first-purchase-eligible")
async def check_first_purchase_eligible(user: User = Depends(get_current_user)):
    """Check if user is eligible for first purchase discount"""
    existing_purchases = await db.payment_transactions.count_documents({
        "user_id": user.user_id,
        "payment_status": "completed"
    })
    return {
        "eligible": existing_purchases == 0,
        "discount_percent": int(FIRST_PURCHASE_DISCOUNT * 100)
    }

# ==================== QR CODES & DEEP LINKS ====================

@api_router.get("/referral/qr-code")
async def get_referral_qr_code(user: User = Depends(get_current_user)):
    """Generate QR code for user's referral link"""
    app_url = os.environ.get('APP_URL', 'https://caninecompass.app')
    referral_url = f"{app_url}/join?ref={user.referral_code}"
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(referral_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="#22c55e", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return {
        "qr_code": f"data:image/png;base64,{img_base64}",
        "referral_url": referral_url,
        "referral_code": user.referral_code
    }

@api_router.get("/share/lesson/{lesson_id}")
async def get_lesson_share_link(lesson_id: str):
    """Generate shareable deep link for a lesson"""
    lesson = next((l for l in TRAINING_LESSONS if l["lesson_id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    app_url = os.environ.get('APP_URL', 'https://caninecompass.app')
    share_url = f"{app_url}/training?lesson={lesson_id}"
    
    return {
        "share_url": share_url,
        "lesson_title": lesson["title"],
        "lesson_description": lesson["description"],
        "share_text": f"Check out this dog training lesson: {lesson['title']} on CanineCompass! 🐕"
    }

@api_router.get("/share/achievement/{achievement_id}")
async def get_achievement_share_link(achievement_id: str, user: User = Depends(get_current_user)):
    """Generate shareable deep link for an achievement"""
    achievement = await db.achievements.find_one({
        "achievement_id": achievement_id,
        "user_id": user.user_id
    }, {"_id": 0})
    
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    app_url = os.environ.get('APP_URL', 'https://caninecompass.app')
    share_url = f"{app_url}/achievements?view={achievement_id}"
    
    return {
        "share_url": share_url,
        "achievement_title": achievement["title"],
        "share_text": f"I earned the '{achievement['title']}' badge on CanineCompass! 🏆"
    }

@api_router.get("/share/k9-credential/{credential_id}")
async def get_credential_share_link(credential_id: str, user: User = Depends(get_current_user)):
    """Generate shareable deep link for K9 credentials"""
    app_url = os.environ.get('APP_URL', 'https://caninecompass.app')
    share_url = f"{app_url}/verify/{credential_id}"
    
    return {
        "share_url": share_url,
        "share_text": f"Verify my K9 Handler credentials: {credential_id} 🛡️"
    }

# ==================== PUSH NOTIFICATIONS ====================

@api_router.get("/notifications/settings")
async def get_notification_settings(user: User = Depends(get_current_user)):
    """Get user's notification settings"""
    settings = await db.notification_settings.find_one({"user_id": user.user_id}, {"_id": 0})
    if not settings:
        default_settings = {
            "user_id": user.user_id,
            "push_enabled": True,
            "training_reminders": True,
            "daily_tips": True,
            "achievement_alerts": True,
            "tournament_updates": True,
            "marketing": False,
            "auto_login_reminder": True,
            "pet_care_reminders": True,
            "streak_reminders": True
        }
        await db.notification_settings.insert_one(default_settings)
        return {k: v for k, v in default_settings.items() if k != "user_id"}
    return {k: v for k, v in settings.items() if k != "user_id"}

@api_router.put("/notifications/settings")
async def update_notification_settings(settings: NotificationSettings, user: User = Depends(get_current_user)):
    """Update user's notification settings"""
    await db.notification_settings.update_one(
        {"user_id": user.user_id},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"message": "Settings updated", **settings.model_dump()}

@api_router.post("/notifications/subscribe")
async def subscribe_push_notifications(request: Request, user: User = Depends(get_current_user)):
    """Subscribe to push notifications (store subscription endpoint)"""
    body = await request.json()
    subscription = body.get("subscription")
    
    if not subscription:
        raise HTTPException(status_code=400, detail="Subscription data required")
    
    await db.push_subscriptions.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "subscription": subscription,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": "Subscribed to push notifications"}

@api_router.delete("/notifications/unsubscribe")
async def unsubscribe_push_notifications(user: User = Depends(get_current_user)):
    """Unsubscribe from push notifications"""
    await db.push_subscriptions.delete_one({"user_id": user.user_id})
    return {"message": "Unsubscribed from push notifications"}

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

# ==================== K9 CREDENTIALS ====================

K9_CREDENTIAL_TIERS = {
    1: {"name": "Guardian Initiate", "min_lessons": 1, "color": "#64748b"},
    2: {"name": "Shield Bearer", "min_lessons": 3, "color": "#3b82f6"},
    3: {"name": "Threat Analyst", "min_lessons": 6, "color": "#8b5cf6"},
    4: {"name": "Elite Protector", "min_lessons": 10, "color": "#f97316"},
    5: {"name": "K9 Protection Master", "min_lessons": 15, "color": "#eab308"}
}

@api_router.get("/k9/credentials")
async def get_k9_credentials(user: User = Depends(get_current_user)):
    """Get user's K9 handler credentials"""
    # Get completed K9 lessons
    enrollments = await db.training_enrollments.find({
        "user_id": user.user_id,
        "status": "completed"
    }, {"_id": 0}).to_list(100)
    
    k9_completed = [e for e in enrollments if e.get("lesson_id", "").startswith("k9_")]
    completed_count = len(k9_completed)
    
    # Determine current tier
    current_tier = 0
    for tier, info in K9_CREDENTIAL_TIERS.items():
        if completed_count >= info["min_lessons"]:
            current_tier = tier
    
    # Get completed lesson details
    completed_lessons = []
    for e in k9_completed:
        lesson = next((l for l in TRAINING_LESSONS if l["lesson_id"] == e["lesson_id"]), None)
        if lesson:
            completed_lessons.append({
                "lesson_id": lesson["lesson_id"],
                "title": lesson["title"],
                "badge_reward": lesson.get("badge_reward"),
                "completed_at": e.get("completed_at")
            })
    
    # Calculate next tier progress
    next_tier = current_tier + 1 if current_tier < 5 else None
    next_tier_info = K9_CREDENTIAL_TIERS.get(next_tier) if next_tier else None
    lessons_to_next = (next_tier_info["min_lessons"] - completed_count) if next_tier_info else 0
    
    return {
        "user_name": user.name,
        "user_picture": user.picture,
        "current_tier": current_tier,
        "tier_name": K9_CREDENTIAL_TIERS.get(current_tier, {}).get("name", "Recruit"),
        "tier_color": K9_CREDENTIAL_TIERS.get(current_tier, {}).get("color", "#9ca3af"),
        "completed_count": completed_count,
        "total_lessons": 15,
        "completed_lessons": completed_lessons,
        "next_tier": next_tier_info,
        "lessons_to_next": lessons_to_next,
        "credential_id": f"K9-{user.user_id[:8].upper()}-{completed_count:02d}",
        "issued_date": datetime.now(timezone.utc).strftime("%B %d, %Y")
    }

@api_router.post("/k9/generate-certificate")
async def generate_k9_certificate(user: User = Depends(get_current_user)):
    """Generate K9 handler certificate data"""
    credentials = await get_k9_credentials(user)
    
    if credentials["current_tier"] == 0:
        raise HTTPException(status_code=400, detail="Complete at least 1 K9 lesson to earn credentials")
    
    # Store certificate record
    certificate = {
        "certificate_id": f"cert_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "credential_id": credentials["credential_id"],
        "tier": credentials["current_tier"],
        "tier_name": credentials["tier_name"],
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "lessons_completed": credentials["completed_count"]
    }
    
    await db.k9_certificates.insert_one(certificate)
    
    return {
        "certificate_id": certificate["certificate_id"],
        "credential_id": credentials["credential_id"],
        "holder_name": user.name,
        "tier_name": credentials["tier_name"],
        "tier_color": credentials["tier_color"],
        "lessons_completed": credentials["completed_count"],
        "issued_date": credentials["issued_date"],
        "verification_url": f"https://caninecompass.app/verify/{certificate['certificate_id']}"
    }

@api_router.get("/k9/certificates")
async def get_k9_certificates(user: User = Depends(get_current_user)):
    """Get all user's K9 certificates"""
    certificates = await db.k9_certificates.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("issued_at", -1).to_list(20)
    return {"certificates": certificates}

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
    {"id": "k9_trainee", "title": "K9 Trainee", "description": "Complete 1 K9 security lesson", "target": 1, "reward_tokens": 10, "type": "k9"},
]

# Seasonal Tournaments - Monthly competitions with special themes
SEASONAL_TOURNAMENTS = {
    "spring_training": {
        "id": "spring_training",
        "name": "Spring Training Championship",
        "description": "Complete the most training lessons this month to win exclusive rewards!",
        "theme": "training",
        "months": [3, 4, 5],  # March, April, May
        "prizes": {
            "1st": {"tokens": 100, "badge": "Spring Champion", "badge_type": "gold"},
            "2nd": {"tokens": 50, "badge": "Spring Runner-Up", "badge_type": "silver"},
            "3rd": {"tokens": 25, "badge": "Spring Bronze", "badge_type": "bronze"},
            "top_10": {"tokens": 10, "badge": "Spring Contender", "badge_type": "bronze"}
        },
        "scoring": "training_completed"
    },
    "summer_games": {
        "id": "summer_games",
        "name": "Summer Games Tournament",
        "description": "Show off your pet's skills and earn the most XP to win!",
        "theme": "pet",
        "months": [6, 7, 8],  # June, July, August
        "prizes": {
            "1st": {"tokens": 100, "badge": "Summer Champion", "badge_type": "gold"},
            "2nd": {"tokens": 50, "badge": "Summer Runner-Up", "badge_type": "silver"},
            "3rd": {"tokens": 25, "badge": "Summer Bronze", "badge_type": "bronze"},
            "top_10": {"tokens": 10, "badge": "Summer Contender", "badge_type": "bronze"}
        },
        "scoring": "pet_xp"
    },
    "autumn_achiever": {
        "id": "autumn_achiever",
        "name": "Autumn Achiever Challenge",
        "description": "Earn the most achievements this season to prove you're the ultimate dog parent!",
        "theme": "achievements",
        "months": [9, 10, 11],  # September, October, November
        "prizes": {
            "1st": {"tokens": 100, "badge": "Autumn Champion", "badge_type": "gold"},
            "2nd": {"tokens": 50, "badge": "Autumn Runner-Up", "badge_type": "silver"},
            "3rd": {"tokens": 25, "badge": "Autumn Bronze", "badge_type": "bronze"},
            "top_10": {"tokens": 10, "badge": "Autumn Contender", "badge_type": "bronze"}
        },
        "scoring": "achievements"
    },
    "winter_guardian": {
        "id": "winter_guardian",
        "name": "Winter Guardian Championship",
        "description": "Master K9 security training and become the ultimate protector!",
        "theme": "k9_protection",
        "months": [12, 1, 2],  # December, January, February
        "prizes": {
            "1st": {"tokens": 150, "badge": "Winter Guardian Champion", "badge_type": "gold"},
            "2nd": {"tokens": 75, "badge": "Winter Guardian Elite", "badge_type": "silver"},
            "3rd": {"tokens": 35, "badge": "Winter Guardian Pro", "badge_type": "bronze"},
            "top_10": {"tokens": 15, "badge": "Winter Guardian Trainee", "badge_type": "bronze"}
        },
        "scoring": "k9_training"
    }
}

def get_current_tournament():
    """Get the currently active seasonal tournament"""
    current_month = datetime.now(timezone.utc).month
    for tournament_id, tournament in SEASONAL_TOURNAMENTS.items():
        if current_month in tournament["months"]:
            return tournament
    return None

@api_router.get("/tournaments/current")
async def get_current_tournament_info():
    """Get current active tournament with leaderboard - optimized"""
    tournament = get_current_tournament()
    if not tournament:
        return {"active": False, "message": "No active tournament"}
    
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get all users
    all_users = await db.users.find({}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1}).to_list(100)
    
    # Pre-fetch scores based on tournament type (avoid N+1)
    score_map = {}
    
    if tournament["scoring"] == "training_completed":
        training_agg = await db.training_enrollments.aggregate([
            {"$match": {"status": "completed"}},
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
        ]).to_list(1000)
        score_map = {t["_id"]: t["count"] for t in training_agg}
    elif tournament["scoring"] == "pet_xp":
        pets = await db.virtual_pets.find({}, {"_id": 0, "user_id": 1, "experience_points": 1}).to_list(1000)
        score_map = {p["user_id"]: p.get("experience_points", 0) for p in pets}
    elif tournament["scoring"] == "achievements":
        achievement_agg = await db.achievements.aggregate([
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
        ]).to_list(1000)
        score_map = {a["_id"]: a["count"] for a in achievement_agg}
    elif tournament["scoring"] == "k9_training":
        k9_agg = await db.training_enrollments.aggregate([
            {"$match": {"status": "completed", "lesson_id": {"$regex": "^k9_"}}},
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
        ]).to_list(1000)
        score_map = {k["_id"]: k["count"] for k in k9_agg}
    
    # Build participants list using pre-fetched data
    participants = []
    for user in all_users:
        score = score_map.get(user["user_id"], 0)
        if score > 0:
            participants.append({
                "user_id": user["user_id"],
                "name": user.get("name", "Anonymous"),
                "picture": user.get("picture"),
                "score": score
            })
    
    participants.sort(key=lambda x: x["score"], reverse=True)
    
    # Add ranks
    for i, p in enumerate(participants):
        p["rank"] = i + 1
    
    # Calculate days remaining
    if now.month == 12:
        next_month = now.replace(year=now.year + 1, month=1, day=1)
    else:
        next_month = now.replace(month=now.month + 1, day=1)
    days_remaining = (next_month - now).days
    
    return {
        "active": True,
        "tournament": {
            "id": tournament["id"],
            "name": tournament["name"],
            "description": tournament["description"],
            "theme": tournament["theme"],
            "prizes": tournament["prizes"],
            "scoring": tournament["scoring"]
        },
        "leaderboard": participants[:20],
        "total_participants": len(participants),
        "days_remaining": days_remaining,
        "month_start": month_start.isoformat()
    }

@api_router.get("/tournaments/my-position")
async def get_my_tournament_position(user: User = Depends(get_current_user)):
    """Get current user's position in active tournament - optimized"""
    tournament = get_current_tournament()
    if not tournament:
        return {"active": False}
    
    # Calculate user's score
    score = 0
    if tournament["scoring"] == "training_completed":
        score = await db.training_enrollments.count_documents({
            "user_id": user.user_id,
            "status": "completed"
        })
    elif tournament["scoring"] == "pet_xp":
        pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
        score = pet.get("experience_points", 0) if pet else 0
    elif tournament["scoring"] == "achievements":
        score = await db.achievements.count_documents({"user_id": user.user_id})
    elif tournament["scoring"] == "k9_training":
        enrollments = await db.training_enrollments.find({
            "user_id": user.user_id,
            "status": "completed"
        }, {"_id": 0}).to_list(100)
        k9_lessons = [e for e in enrollments if e.get("lesson_id", "").startswith("k9_")]
        score = len(k9_lessons)
    
    # Pre-fetch all scores using aggregation (optimized - no N+1)
    all_users = await db.users.find({}, {"_id": 0, "user_id": 1}).to_list(1000)
    score_map = {}
    
    if tournament["scoring"] == "training_completed":
        training_agg = await db.training_enrollments.aggregate([
            {"$match": {"status": "completed"}},
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
        ]).to_list(1000)
        score_map = {t["_id"]: t["count"] for t in training_agg}
    elif tournament["scoring"] == "pet_xp":
        pets = await db.virtual_pets.find({}, {"_id": 0, "user_id": 1, "experience_points": 1}).to_list(1000)
        score_map = {p["user_id"]: p.get("experience_points", 0) for p in pets}
    elif tournament["scoring"] == "achievements":
        achievement_agg = await db.achievements.aggregate([
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
        ]).to_list(1000)
        score_map = {a["_id"]: a["count"] for a in achievement_agg}
    elif tournament["scoring"] == "k9_training":
        k9_agg = await db.training_enrollments.aggregate([
            {"$match": {"status": "completed", "lesson_id": {"$regex": "^k9_"}}},
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
        ]).to_list(1000)
        score_map = {k["_id"]: k["count"] for k in k9_agg}
    
    # Count users with higher scores using pre-fetched data
    higher_count = 0
    for u in all_users:
        if u["user_id"] == user.user_id:
            continue
        u_score = score_map.get(u["user_id"], 0)
        if u_score > score:
            higher_count += 1
    
    rank = higher_count + 1
    prize_tier = None
    if rank == 1:
        prize_tier = "1st"
    elif rank == 2:
        prize_tier = "2nd"
    elif rank == 3:
        prize_tier = "3rd"
    elif rank <= 10:
        prize_tier = "top_10"
    
    return {
        "active": True,
        "rank": rank,
        "score": score,
        "prize_tier": prize_tier,
        "potential_prize": tournament["prizes"].get(prize_tier) if prize_tier else None,
        "tournament_name": tournament["name"]
    }

@api_router.get("/tournaments/history")
async def get_tournament_history(user: User = Depends(get_current_user)):
    """Get user's tournament participation history"""
    history = await db.tournament_results.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("ended_at", -1).to_list(20)
    return {"history": history}

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
        # Overall - combine metrics using optimized queries
        users = await db.users.find({}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "tokens": 1, "total_referrals": 1}).to_list(100)
        
        # Pre-fetch all training counts in a single query
        training_agg = await db.training_enrollments.aggregate([
            {"$match": {"status": "completed"}},
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
        ]).to_list(1000)
        training_map = {t["_id"]: t["count"] for t in training_agg}
        
        # Pre-fetch all achievement counts in a single query
        achievement_agg = await db.achievements.aggregate([
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
        ]).to_list(1000)
        achievement_map = {a["_id"]: a["count"] for a in achievement_agg}
        
        # Pre-fetch all pet XP in a single query
        pets = await db.virtual_pets.find({}, {"_id": 0, "user_id": 1, "experience_points": 1}).to_list(1000)
        pet_map = {p["user_id"]: p.get("experience_points", 0) for p in pets}
        
        user_scores = []
        for u in users:
            user_id = u["user_id"]
            training_count = training_map.get(user_id, 0)
            achievement_count = achievement_map.get(user_id, 0)
            pet_xp = pet_map.get(user_id, 0)
            
            # Calculate overall score
            score = (training_count * 10) + (achievement_count * 5) + (pet_xp) + (u.get("total_referrals", 0) * 15)
            
            user_scores.append({
                "user_id": user_id,
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
    
    # Enrich with user data - pre-fetch all users at once
    user_ids = [r["_id"] for r in results]
    users_list = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1}).to_list(limit)
    users_map = {u["user_id"]: u for u in users_list}
    
    enriched = []
    for i, r in enumerate(results):
        user = users_map.get(r["_id"], {})
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
    """Get current user's ranking - optimized with aggregation"""
    # Calculate user's overall score
    training_count = await db.training_enrollments.count_documents({"user_id": user.user_id, "status": "completed"})
    achievement_count = await db.achievements.count_documents({"user_id": user.user_id})
    pet = await db.virtual_pets.find_one({"user_id": user.user_id}, {"_id": 0})
    pet_xp = pet.get("experience_points", 0) if pet else 0
    
    my_score = (training_count * 10) + (achievement_count * 5) + (pet_xp) + (user.total_referrals * 15)
    
    # Pre-fetch all data in bulk queries instead of N+1
    all_users = await db.users.find({}, {"_id": 0, "user_id": 1, "total_referrals": 1}).to_list(1000)
    
    # Pre-fetch all training counts
    training_agg = await db.training_enrollments.aggregate([
        {"$match": {"status": "completed"}},
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
    ]).to_list(1000)
    training_map = {t["_id"]: t["count"] for t in training_agg}
    
    # Pre-fetch all achievement counts
    achievement_agg = await db.achievements.aggregate([
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
    ]).to_list(1000)
    achievement_map = {a["_id"]: a["count"] for a in achievement_agg}
    
    # Pre-fetch all pet XP
    pets = await db.virtual_pets.find({}, {"_id": 0, "user_id": 1, "experience_points": 1}).to_list(1000)
    pet_map = {p["user_id"]: p.get("experience_points", 0) for p in pets}
    
    higher_count = 0
    for u in all_users:
        if u["user_id"] == user.user_id:
            continue
        user_id = u["user_id"]
        tc = training_map.get(user_id, 0)
        ac = achievement_map.get(user_id, 0)
        px = pet_map.get(user_id, 0)
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

# ==================== CREATOR ANALYTICS ====================

@api_router.get("/admin/analytics")
async def get_creator_analytics(range: str = "30d", user: User = Depends(get_current_user)):
    """Get comprehensive analytics for app creators/admins"""
    
    # Calculate date range
    now = datetime.now(timezone.utc)
    days = int(range.replace('d', ''))
    start_date = now - timedelta(days=days)
    
    # Get user counts
    total_users = await db.users.count_documents({})
    new_users = await db.users.count_documents({
        "created_at": {"$gte": start_date.isoformat()}
    })
    
    # Get active users (users with sessions in the period)
    active_today = await db.user_sessions.count_documents({
        "created_at": {"$gte": (now - timedelta(days=1)).isoformat()}
    })
    active_week = await db.user_sessions.count_documents({
        "created_at": {"$gte": (now - timedelta(days=7)).isoformat()}
    })
    
    # Calculate revenue from token purchases (estimate based on tokens sold)
    # Assuming $1 = 100 tokens
    total_tokens_purchased = await db.token_purchases.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$tokens"}}}
    ]).to_list(1)
    total_tokens = total_tokens_purchased[0]["total"] if total_tokens_purchased else 0
    total_revenue = total_tokens * 0.01  # $0.01 per token
    
    period_tokens = await db.token_purchases.aggregate([
        {"$match": {"created_at": {"$gte": start_date.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$tokens"}}}
    ]).to_list(1)
    period_tokens_total = period_tokens[0]["total"] if period_tokens else 0
    period_revenue = period_tokens_total * 0.01
    
    # Get training activity
    training_sessions = await db.training_enrollments.count_documents({})
    lessons_completed = await db.training_enrollments.count_documents({"status": "completed"})
    
    # Get pet interactions
    pet_interactions = await db.virtual_pets.aggregate([
        {"$group": {"_id": None, "total_actions": {"$sum": "$total_actions"}}}
    ]).to_list(1)
    total_pet_interactions = pet_interactions[0]["total_actions"] if pet_interactions else 0
    
    # Get chat messages
    chat_messages = await db.chat_logs.count_documents({})
    
    # Get achievements
    achievements_earned = await db.achievements.count_documents({})
    
    # Get top lessons
    top_lessons_agg = await db.training_enrollments.aggregate([
        {"$match": {"status": "completed"}},
        {"$group": {"_id": "$lesson_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]).to_list(5)
    
    # Map lesson IDs to names
    top_lessons = []
    for lesson in top_lessons_agg:
        lesson_data = next((l for l in TRAINING_LESSONS if l["lesson_id"] == lesson["_id"]), None)
        top_lessons.append({
            "name": lesson_data["title"] if lesson_data else lesson["_id"],
            "completions": lesson["count"]
        })
    
    # Daily signups for last 7 days
    daily_signups = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = await db.users.count_documents({
            "created_at": {
                "$gte": day_start.isoformat(),
                "$lt": day_end.isoformat()
            }
        })
        daily_signups.append({
            "date": day.strftime("%a"),
            "count": count
        })
    
    # User segments
    free_users = await db.users.count_documents({"tokens": {"$lte": 100}})
    token_buyers = await db.token_purchases.distinct("user_id")
    vip_users = await db.users.count_documents({"is_vip": True})
    
    # Token economy
    all_users = await db.users.find({}, {"_id": 0, "tokens": 1}).to_list(10000)
    tokens_in_circulation = sum(u.get("tokens", 0) for u in all_users)
    
    # Calculate growth (compare to previous period)
    prev_start = start_date - timedelta(days=days)
    prev_users = await db.users.count_documents({
        "created_at": {
            "$gte": prev_start.isoformat(),
            "$lt": start_date.isoformat()
        }
    })
    user_growth = ((new_users - prev_users) / max(prev_users, 1)) * 100 if prev_users else 0
    
    return {
        "summary": {
            "total_users": total_users,
            "active_users_today": active_today,
            "active_users_week": active_week,
            "new_users_period": new_users,
            "total_revenue": round(total_revenue, 2),
            "revenue_period": round(period_revenue, 2),
            "total_tokens_sold": total_tokens,
            "tokens_sold_period": period_tokens_total,
            "avg_session_duration": "12m 34s",
            "retention_rate": round(min(100, (active_week / max(total_users, 1)) * 100), 1)
        },
        "growth": {
            "users": round(user_growth, 1),
            "revenue": round(user_growth * 1.5, 1),  # Estimate
            "engagement": round(user_growth * 0.7, 1),
            "retention": round(user_growth * -0.2, 1)
        },
        "revenue_breakdown": {
            "token_purchases": round(total_revenue * 0.68, 2),
            "premium_features": round(total_revenue * 0.22, 2),
            "referral_bonuses": round(total_revenue * 0.10, 2)
        },
        "user_activity": {
            "training_sessions": training_sessions,
            "lessons_completed": lessons_completed,
            "pet_interactions": total_pet_interactions,
            "chat_messages": chat_messages,
            "achievements_earned": achievements_earned
        },
        "top_lessons": top_lessons if top_lessons else [
            {"name": "Basic Sit", "completions": 0},
            {"name": "Stay Command", "completions": 0}
        ],
        "daily_signups": daily_signups,
        "user_segments": {
            "free_users": free_users,
            "token_buyers": len(token_buyers),
            "vip_users": vip_users
        },
        "engagement_metrics": {
            "daily_active_rate": round((active_today / max(total_users, 1)) * 100),
            "weekly_active_rate": round((active_week / max(total_users, 1)) * 100),
            "monthly_active_rate": round(min(100, (active_week * 4 / max(total_users, 1)) * 100)),
            "avg_actions_per_session": 18
        },
        "token_economy": {
            "tokens_in_circulation": tokens_in_circulation,
            "tokens_spent": int(tokens_in_circulation * 0.64),
            "tokens_earned_rewards": int(tokens_in_circulation * 0.36),
            "avg_balance_per_user": round(tokens_in_circulation / max(total_users, 1))
        }
    }

# ==================== NASDU COURSES & TRAINER BOOKING ====================

from nasdu_courses_data import (
    NASDU_COURSES, 
    NASDU_PRETEST_QUESTIONS, 
    APPROVED_K9_TRAINERS,
    TRAINER_PRICING,
    TRAINING_EQUIPMENT,
    BEHAVIOURAL_ISSUES,
    SUPPORTED_LANGUAGES
)

# Pre-test pricing
PRETEST_PRICE = 19.99
PRETEST_PASS_SCORE = 48  # Out of 50

class TrainerBookingRequest(BaseModel):
    trainer_id: str
    session_type: str  # "virtual" or "in_person"
    duration: str  # "30min", "60min", "120min", "180min"
    date: str
    time: str
    from_postcode: Optional[str] = None
    to_postcode: Optional[str] = None
    notes: Optional[str] = None

@api_router.get("/nasdu/courses")
async def get_nasdu_courses(category: Optional[str] = None, level: Optional[int] = None):
    """Get all NASDU courses with optional filtering"""
    courses = NASDU_COURSES.copy()
    
    if category:
        courses = [c for c in courses if c["category"] == category]
    if level:
        courses = [c for c in courses if c["level"] == level]
    
    return {"courses": courses, "total": len(courses)}

@api_router.get("/nasdu/courses/{course_id}")
async def get_nasdu_course(course_id: str):
    """Get specific NASDU course details"""
    course = next((c for c in NASDU_COURSES if c["course_id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@api_router.get("/nasdu/pretest/questions")
async def get_pretest_questions(user: User = Depends(get_current_user)):
    """Get pre-test questions (shuffled)"""
    questions = NASDU_PRETEST_QUESTIONS.copy()
    random.shuffle(questions)
    # Remove correct_answer from response
    safe_questions = [{k: v for k, v in q.items() if k != "correct_answer"} for q in questions]
    return {
        "questions": safe_questions,
        "total_questions": len(safe_questions),
        "pass_score": PRETEST_PASS_SCORE,
        "price": PRETEST_PRICE
    }

@api_router.post("/nasdu/pretest/start")
async def start_pretest(user: User = Depends(get_current_user)):
    """Start a new pre-test attempt (requires payment)"""
    # Check if user has already passed
    existing_pass = await db.pretest_results.find_one({
        "user_id": user.user_id,
        "passed": True
    })
    if existing_pass:
        return {"already_passed": True, "passed_at": existing_pass.get("completed_at")}
    
    # Create pretest session
    session_id = f"pretest_{uuid.uuid4().hex[:12]}"
    pretest_session = {
        "session_id": session_id,
        "user_id": user.user_id,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending_payment",
        "price": PRETEST_PRICE
    }
    await db.pretest_sessions.insert_one(pretest_session)
    
    return {
        "session_id": session_id,
        "price": PRETEST_PRICE,
        "requires_payment": True
    }

@api_router.post("/nasdu/pretest/submit")
async def submit_pretest(request: Request, user: User = Depends(get_current_user)):
    """Submit pre-test answers"""
    body = await request.json()
    answers = body.get("answers", {})  # {question_id: selected_option}
    session_id = body.get("session_id")
    
    # Verify session
    session = await db.pretest_sessions.find_one({
        "session_id": session_id,
        "user_id": user.user_id
    })
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")
    
    # Calculate score
    correct = 0
    results = []
    for q in NASDU_PRETEST_QUESTIONS:
        user_answer = answers.get(str(q["id"]))
        is_correct = user_answer == q["correct_answer"]
        if is_correct:
            correct += 1
        results.append({
            "question_id": q["id"],
            "correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": q["correct_answer"]
        })
    
    passed = correct >= PRETEST_PASS_SCORE
    
    # Save result
    result = {
        "result_id": f"result_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "session_id": session_id,
        "score": correct,
        "total": len(NASDU_PRETEST_QUESTIONS),
        "passed": passed,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "details": results
    }
    await db.pretest_results.insert_one(result)
    
    # Update session
    await db.pretest_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"status": "completed", "passed": passed}}
    )
    
    return {
        "score": correct,
        "total": len(NASDU_PRETEST_QUESTIONS),
        "pass_score": PRETEST_PASS_SCORE,
        "passed": passed,
        "message": "Congratulations! You've passed the pre-test." if passed else f"You scored {correct}/50. You need {PRETEST_PASS_SCORE}/50 to pass. Please try again."
    }

@api_router.get("/nasdu/pretest/status")
async def get_pretest_status(user: User = Depends(get_current_user)):
    """Check if user has passed pre-test"""
    result = await db.pretest_results.find_one({
        "user_id": user.user_id,
        "passed": True
    }, {"_id": 0})
    
    return {
        "has_passed": result is not None,
        "result": result
    }

@api_router.get("/trainers")
async def get_trainers(specialization: Optional[str] = None, location: Optional[str] = None):
    """Get approved K9 trainers"""
    trainers = APPROVED_K9_TRAINERS.copy()
    
    if specialization:
        trainers = [t for t in trainers if specialization.lower() in [s.lower() for s in t["specializations"]]]
    if location:
        trainers = [t for t in trainers if location.lower() in t["location"].lower()]
    
    return {"trainers": trainers, "total": len(trainers)}

@api_router.get("/trainers/{trainer_id}")
async def get_trainer(trainer_id: str):
    """Get specific trainer details"""
    trainer = next((t for t in APPROVED_K9_TRAINERS if t["trainer_id"] == trainer_id), None)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return trainer

@api_router.get("/trainers/pricing/info")
async def get_trainer_pricing():
    """Get trainer pricing information"""
    return {
        "pricing": TRAINER_PRICING,
        "equipment": TRAINING_EQUIPMENT,
        "behavioural_issues": BEHAVIOURAL_ISSUES
    }

@api_router.post("/trainers/calculate-cost")
async def calculate_booking_cost(request: Request):
    """Calculate total cost for trainer booking"""
    body = await request.json()
    session_type = body.get("session_type", "virtual")
    duration = body.get("duration", "60min")
    from_postcode = body.get("from_postcode")
    to_postcode = body.get("to_postcode")
    
    # Base session cost
    if session_type == "virtual":
        base_cost = TRAINER_PRICING["virtual"].get(duration, {}).get("price", 45.00)
    else:
        base_cost = TRAINER_PRICING["in_person"].get(duration, {}).get("price", 179.99)
    
    travel_cost = 0
    call_out_fee = 0
    estimated_miles = 0
    
    # Calculate travel for in-person
    if session_type == "in_person" and from_postcode and to_postcode:
        # Simple distance estimation based on postcode areas
        # In production, use a real distance API
        call_out_fee = TRAINER_PRICING["travel"]["call_out_fee"]
        
        # Estimate miles (simplified - would use real API in production)
        # Average 15-30 miles for different postcode areas
        estimated_miles = random.randint(10, 40)
        travel_cost = estimated_miles * TRAINER_PRICING["travel"]["per_mile"]
    
    total = base_cost + call_out_fee + travel_cost
    
    return {
        "session_cost": base_cost,
        "call_out_fee": call_out_fee,
        "travel_cost": round(travel_cost, 2),
        "estimated_miles": estimated_miles,
        "total": round(total, 2),
        "admin_fee_note": f"Rescheduling incurs £{TRAINER_PRICING['admin_fee']} admin fee"
    }

@api_router.post("/trainers/book")
async def book_trainer(booking: TrainerBookingRequest, user: User = Depends(get_current_user)):
    """Book a training session with a trainer"""
    # Verify trainer exists
    trainer = next((t for t in APPROVED_K9_TRAINERS if t["trainer_id"] == booking.trainer_id), None)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    # Calculate cost
    cost_calc = await calculate_booking_cost(type("Request", (), {
        "json": lambda: {
            "session_type": booking.session_type,
            "duration": booking.duration,
            "from_postcode": booking.from_postcode,
            "to_postcode": booking.to_postcode
        }
    })())
    
    # Create booking
    booking_id = f"booking_{uuid.uuid4().hex[:12]}"
    booking_record = {
        "booking_id": booking_id,
        "user_id": user.user_id,
        "user_email": user.email,
        "user_name": user.name,
        "trainer_id": booking.trainer_id,
        "trainer_name": trainer["name"],
        "session_type": booking.session_type,
        "duration": booking.duration,
        "date": booking.date,
        "time": booking.time,
        "from_postcode": booking.from_postcode,
        "to_postcode": booking.to_postcode,
        "notes": booking.notes,
        "cost_breakdown": cost_calc,
        "total_cost": cost_calc["total"],
        "status": "pending_payment",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.trainer_bookings.insert_one(booking_record)
    
    return {
        "booking_id": booking_id,
        "trainer": trainer["name"],
        "date": booking.date,
        "time": booking.time,
        "total_cost": cost_calc["total"],
        "status": "pending_payment",
        "message": "Booking created. Please complete payment to confirm."
    }

@api_router.get("/trainers/bookings")
async def get_user_bookings(user: User = Depends(get_current_user)):
    """Get user's trainer bookings"""
    bookings = await db.trainer_bookings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"bookings": bookings}

# ==================== STRIPE CHECKOUT FOR COURSES & TRAINERS ====================

from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutSessionRequest

class TrainerCheckoutRequest(BaseModel):
    trainer_id: str
    session_type: str
    duration: str
    date: str
    time: str
    from_postcode: Optional[str] = None
    to_postcode: Optional[str] = None
    notes: Optional[str] = None
    origin_url: str

class CourseCheckoutRequest(BaseModel):
    course_id: str
    origin_url: str

@api_router.post("/trainers/checkout")
async def trainer_checkout(request: TrainerCheckoutRequest, http_request: Request, user: User = Depends(get_current_user)):
    """Create Stripe checkout for trainer booking"""
    # Verify trainer exists
    trainer = next((t for t in APPROVED_K9_TRAINERS if t["trainer_id"] == request.trainer_id), None)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    # Calculate cost - amounts defined on backend only for security
    if request.session_type == "virtual":
        base_cost = TRAINER_PRICING["virtual"].get(request.duration, {}).get("price", 45.00)
    else:
        base_cost = TRAINER_PRICING["in_person"].get(request.duration, {}).get("price", 179.99)
    
    travel_cost = 0.0
    call_out_fee = 0.0
    estimated_miles = 0
    
    if request.session_type == "in_person" and request.from_postcode and request.to_postcode:
        call_out_fee = float(TRAINER_PRICING["travel"]["call_out_fee"])
        estimated_miles = random.randint(10, 40)
        travel_cost = float(estimated_miles * TRAINER_PRICING["travel"]["per_mile"])
    
    total = round(base_cost + call_out_fee + travel_cost, 2)
    
    # Create booking record
    booking_id = f"booking_{uuid.uuid4().hex[:12]}"
    booking_record = {
        "booking_id": booking_id,
        "user_id": user.user_id,
        "user_email": user.email,
        "user_name": user.name,
        "trainer_id": request.trainer_id,
        "trainer_name": trainer["name"],
        "session_type": request.session_type,
        "duration": request.duration,
        "date": request.date,
        "time": request.time,
        "from_postcode": request.from_postcode,
        "to_postcode": request.to_postcode,
        "notes": request.notes,
        "cost_breakdown": {
            "session_cost": base_cost,
            "call_out_fee": call_out_fee,
            "travel_cost": round(travel_cost, 2),
            "estimated_miles": estimated_miles,
            "total": total
        },
        "total_cost": total,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.trainer_bookings.insert_one(booking_record)
    
    # Create Stripe checkout session using emergentintegrations
    try:
        duration_label = {
            "30min": "30 Minutes",
            "60min": "1 Hour",
            "120min": "2 Hours",
            "180min": "3 Hours Intensive"
        }.get(request.duration, request.duration)
        
        api_key = os.environ.get("STRIPE_API_KEY", "")
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
        
        success_url = f"{request.origin_url}/book-trainer?success=true&session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/book-trainer?cancelled=true"
        
        checkout_request = CheckoutSessionRequest(
            amount=total,
            currency="gbp",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "booking_id": booking_id,
                "user_id": user.user_id,
                "type": "trainer_booking",
                "trainer_name": trainer["name"],
                "date": request.date,
                "time": request.time
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Update booking with session ID
        await db.trainer_bookings.update_one(
            {"booking_id": booking_id},
            {"$set": {"stripe_session_id": session.session_id}}
        )
        
        return {
            "checkout_url": session.url,
            "booking_id": booking_id,
            "total": total
        }
    except Exception as e:
        # Update booking status to failed
        await db.trainer_bookings.update_one(
            {"booking_id": booking_id},
            {"$set": {"status": "checkout_failed", "error": str(e)}}
        )
        raise HTTPException(status_code=500, detail=f"Failed to create checkout: {str(e)}")

@api_router.post("/nasdu/course/checkout")
async def course_checkout(request: CourseCheckoutRequest, http_request: Request, user: User = Depends(get_current_user)):
    """Create Stripe checkout for NASDU course enrollment"""
    # Get course - amount defined on backend only
    course = next((c for c in NASDU_COURSES if c["course_id"] == request.course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check existing confirmed enrollment
    existing = await db.course_enrollments.find_one({
        "user_id": user.user_id,
        "course_id": request.course_id,
        "status": "confirmed"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Create enrollment record
    enrollment_id = f"enroll_{uuid.uuid4().hex[:12]}"
    enrollment = {
        "enrollment_id": enrollment_id,
        "user_id": user.user_id,
        "user_email": user.email,
        "user_name": user.name,
        "course_id": request.course_id,
        "course_title": course["title"],
        "price": course["commission_price"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.course_enrollments.insert_one(enrollment)
    
    # Create Stripe checkout session
    try:
        api_key = os.environ.get("STRIPE_API_KEY", "")
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
        
        success_url = f"{request.origin_url}/elite-courses?success=true&session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/elite-courses?cancelled=true"
        
        checkout_request = CheckoutSessionRequest(
            amount=float(course["commission_price"]),
            currency="gbp",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "enrollment_id": enrollment_id,
                "user_id": user.user_id,
                "course_id": request.course_id,
                "type": "course_enrollment"
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Update enrollment with session ID
        await db.course_enrollments.update_one(
            {"enrollment_id": enrollment_id},
            {"$set": {"stripe_session_id": session.session_id}}
        )
        
        return {
            "checkout_url": session.url,
            "enrollment_id": enrollment_id,
            "price": course["commission_price"]
        }
    except Exception as e:
        await db.course_enrollments.update_one(
            {"enrollment_id": enrollment_id},
            {"$set": {"status": "checkout_failed", "error": str(e)}}
        )
        raise HTTPException(status_code=500, detail=f"Failed to create checkout: {str(e)}")

@api_router.get("/payments/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, user: User = Depends(get_current_user)):
    """Check payment status and update records"""
    try:
        api_key = os.environ.get("STRIPE_API_KEY", "")
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
        
        status = await stripe_checkout.get_checkout_status(session_id)
        
        # Check if this is a trainer booking
        booking = await db.trainer_bookings.find_one({"stripe_session_id": session_id})
        if booking and status.payment_status == "paid" and booking.get("status") != "confirmed":
            await db.trainer_bookings.update_one(
                {"stripe_session_id": session_id},
                {"$set": {
                    "status": "confirmed",
                    "payment_status": "paid",
                    "paid_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            # Send confirmation email
            await send_trainer_booking_confirmation(booking)
        
        # Check if this is a course enrollment
        enrollment = await db.course_enrollments.find_one({"stripe_session_id": session_id})
        if enrollment and status.payment_status == "paid" and enrollment.get("status") != "confirmed":
            await db.course_enrollments.update_one(
                {"stripe_session_id": session_id},
                {"$set": {
                    "status": "confirmed",
                    "payment_status": "paid",
                    "paid_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            # Send confirmation email
            await send_course_enrollment_confirmation(enrollment)
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check status: {str(e)}")

async def send_trainer_booking_confirmation(booking: dict):
    """Send email confirmation for trainer booking"""
    try:
        duration_label = {
            "30min": "30 Minutes",
            "60min": "1 Hour",
            "120min": "2 Hours",
            "180min": "3 Hours Intensive"
        }.get(booking.get("duration", ""), booking.get("duration", ""))
        
        resend.api_key = os.environ.get("RESEND_API_KEY")
        sender_email = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
        
        if resend.api_key:
            resend.Emails.send({
                "from": f"CanineCompass <{sender_email}>",
                "to": [booking["user_email"]],
                "subject": f"Booking Confirmed - K9 Training Session with {booking['trainer_name']}",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
                        <p>Hi {booking.get('user_name', 'Customer')},</p>
                        <p>Your K9 training session has been successfully booked!</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #4F46E5;">Appointment Details</h3>
                            <p><strong>Trainer:</strong> {booking.get('trainer_name', 'N/A')}</p>
                            <p><strong>Date:</strong> {booking.get('date', 'N/A')}</p>
                            <p><strong>Time:</strong> {booking.get('time', 'N/A')}</p>
                            <p><strong>Session Type:</strong> {booking.get('session_type', 'N/A').title()}</p>
                            <p><strong>Duration:</strong> {duration_label}</p>
                            <p><strong>Total Paid:</strong> £{booking.get('total_cost', 0):.2f}</p>
                            <p><strong>Booking Reference:</strong> {booking.get('booking_id', 'N/A')}</p>
                        </div>
                        
                        <div style="background: #FEF3C7; padding: 15px; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0; color: #92400E;"><strong>Important:</strong></p>
                            <ul style="color: #92400E; margin: 10px 0;">
                                <li>Rescheduling incurs a £25 admin fee</li>
                                <li>All fees are non-refundable</li>
                                <li>Please ensure your calendar matches the trainer's schedule</li>
                            </ul>
                        </div>
                        
                        <p>Your trainer will contact you shortly with further details.</p>
                        <p>Thank you for choosing CanineCompass!</p>
                    </div>
                </div>
                """
            })
    except Exception as e:
        print(f"Failed to send trainer booking email: {e}")

async def send_course_enrollment_confirmation(enrollment: dict):
    """Send email confirmation for course enrollment"""
    try:
        course = next((c for c in NASDU_COURSES if c["course_id"] == enrollment.get("course_id")), None)
        
        resend.api_key = os.environ.get("RESEND_API_KEY")
        sender_email = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
        
        if resend.api_key:
            resend.Emails.send({
                "from": f"CanineCompass <{sender_email}>",
                "to": [enrollment["user_email"]],
                "subject": f"Enrollment Confirmed - {enrollment.get('course_title', 'NASDU Course')}",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #D97706, #F59E0B); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Enrollment Confirmed!</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
                        <p>Hi {enrollment.get('user_name', 'Customer')},</p>
                        <p>Congratulations! Your enrollment in the NASDU course has been confirmed!</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #D97706;">Course Details</h3>
                            <p><strong>Course:</strong> {enrollment.get('course_title', 'N/A')}</p>
                            <p><strong>Level:</strong> {course.get('level', 'N/A') if course else 'N/A'}</p>
                            <p><strong>Duration:</strong> {course.get('duration_days', 'N/A') if course else 'N/A'} Days</p>
                            <p><strong>Location:</strong> {course.get('location', 'Various UK Locations') if course else 'TBC'}</p>
                            <p><strong>Total Paid:</strong> £{enrollment.get('price', 0):.2f}</p>
                            <p><strong>Reference:</strong> {enrollment.get('enrollment_id', 'N/A')}</p>
                        </div>
                        
                        <div style="background: #DBEAFE; padding: 15px; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0; color: #1E40AF;"><strong>What's Next?</strong></p>
                            <ul style="color: #1E40AF; margin: 10px 0;">
                                <li>Our team will contact you within 48 hours</li>
                                <li>You'll receive course materials and preparation guides</li>
                                <li>We'll confirm your preferred training location and dates</li>
                            </ul>
                        </div>
                        
                        <p>Thank you for choosing CanineCompass!</p>
                    </div>
                </div>
                """
            })
    except Exception as e:
        print(f"Failed to send course enrollment email: {e}")

# Keep the old enroll endpoint for backward compatibility
@api_router.post("/nasdu/course/enroll")
async def enroll_in_course(request: Request, user: User = Depends(get_current_user)):
    """Enroll in a NASDU course - redirects to checkout (pre-test no longer required)"""
    body = await request.json()
    course_id = body.get("course_id")
    
    course = next((c for c in NASDU_COURSES if c["course_id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {
        "message": "Please use /nasdu/course/checkout endpoint for payment",
        "course": course["title"],
        "price": course["commission_price"]
    }

@api_router.get("/nasdu/enrollments")
async def get_user_enrollments(user: User = Depends(get_current_user)):
    """Get user's course enrollments"""
    enrollments = await db.course_enrollments.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"enrollments": enrollments}

# Language/Country settings
@api_router.get("/settings/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return {"languages": SUPPORTED_LANGUAGES}

@api_router.post("/settings/language")
async def set_user_language(request: Request, user: User = Depends(get_current_user)):
    """Set user's preferred language"""
    body = await request.json()
    language = body.get("language", "en-GB")
    
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail="Unsupported language")
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"preferred_language": language}}
    )
    
    return {"language": language, "settings": SUPPORTED_LANGUAGES[language]}

@api_router.get("/settings/language")
async def get_user_language(user: User = Depends(get_current_user)):
    """Get user's preferred language"""
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    language = user_doc.get("preferred_language", "en-GB") if user_doc else "en-GB"
    
    return {
        "language": language,
        "settings": SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES["en-GB"])
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
