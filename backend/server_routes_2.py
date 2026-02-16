# server_routes_2.py - Additional routes to append to server.py

from breeds_data import BREED_DATABASE
from breeds_data_2 import ADDITIONAL_BREEDS
from training_lessons_data import TRAINING_LESSONS

# Combine all breeds
ALL_BREEDS = BREED_DATABASE + ADDITIONAL_BREEDS

# ==================== TRAINING LESSONS ====================

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
        raise HTTPException(status_code=400, detail=f"Not enough tokens. Need {lesson['token_cost']}, have {user.tokens}")
    
    # Check if already enrolled
    existing = await db.training_enrollments.find_one({
        "user_id": user.user_id, "dog_id": dog_id, "lesson_id": lesson_id
    })
    if existing and existing.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Already completed this lesson")
    
    # Deduct tokens
    await db.users.update_one({"user_id": user.user_id}, {"$inc": {"tokens": -lesson["token_cost"]}})
    
    # Create enrollment
    enrollment = {
        "enrollment_id": f"enroll_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "dog_id": dog_id,
        "lesson_id": lesson_id,
        "completed_steps": [],
        "status": "in_progress",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None
    }
    await db.training_enrollments.insert_one(enrollment)
    
    return {"message": "Enrolled successfully", "tokens_spent": lesson["token_cost"]}

@api_router.get("/training/enrollments/{dog_id}")
async def get_training_enrollments(dog_id: str, user: User = Depends(get_current_user)):
    enrollments = await db.training_enrollments.find(
        {"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}
    ).to_list(100)
    return enrollments

@api_router.post("/training/complete-step")
async def complete_training_step(enrollment_id: str, step_index: int, user: User = Depends(get_current_user)):
    enrollment = await db.training_enrollments.find_one(
        {"enrollment_id": enrollment_id, "user_id": user.user_id}, {"_id": 0}
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    lesson = next((l for l in TRAINING_LESSONS if l["lesson_id"] == enrollment["lesson_id"]), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    completed_steps = enrollment.get("completed_steps", [])
    if step_index not in completed_steps:
        completed_steps.append(step_index)
    
    # Check if lesson completed
    status = enrollment["status"]
    completed_at = None
    xp_earned = 0
    
    if len(completed_steps) >= len(lesson["steps"]):
        status = "completed"
        completed_at = datetime.now(timezone.utc).isoformat()
        xp_earned = lesson["difficulty"] * 10
        
        # Award achievement if first completion
        achievement_check = await db.achievements.find_one({
            "user_id": user.user_id, "category": "training", "title": f"Completed: {lesson['title']}"
        })
        if not achievement_check:
            await db.achievements.insert_one({
                "achievement_id": f"ach_{uuid.uuid4().hex[:12]}",
                "user_id": user.user_id,
                "dog_id": enrollment["dog_id"],
                "title": f"Completed: {lesson['title']}",
                "description": f"Successfully completed the {lesson['title']} training lesson",
                "badge_type": "bronze" if lesson["level"] == "beginner" else "silver" if lesson["level"] == "intermediate" else "gold",
                "category": "training",
                "earned_at": datetime.now(timezone.utc).isoformat()
            })
    
    await db.training_enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$set": {"completed_steps": completed_steps, "status": status, "completed_at": completed_at}}
    )
    
    return {"message": "Step completed", "status": status, "xp_earned": xp_earned}

# ==================== BREEDS ====================

@api_router.get("/breeds")
async def get_breeds(size: Optional[str] = None, search: Optional[str] = None):
    breeds = ALL_BREEDS
    if size:
        breeds = [b for b in breeds if b["size"] == size]
    if search:
        search_lower = search.lower()
        breeds = [b for b in breeds if search_lower in b["name"].lower() or search_lower in b.get("origin", "").lower()]
    return breeds

@api_router.get("/breeds/{breed_id}")
async def get_breed(breed_id: str):
    breed = next((b for b in ALL_BREEDS if b["breed_id"] == breed_id), None)
    if not breed:
        raise HTTPException(status_code=404, detail="Breed not found")
    return breed

# ==================== HEALTH RECORDS ====================

@api_router.get("/health/{dog_id}")
async def get_health_records(dog_id: str, user: User = Depends(get_current_user)):
    records = await db.health_records.find(
        {"user_id": user.user_id, "dog_id": dog_id}, {"_id": 0}
    ).sort("date", -1).to_list(100)
    return records

@api_router.post("/health")
async def create_health_record(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    record = {
        "record_id": f"health_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "dog_id": body.get("dog_id"),
        "record_type": body.get("record_type"),
        "title": body.get("title"),
        "description": body.get("description"),
        "date": body.get("date"),
        "vet_name": body.get("vet_name"),
        "notes": body.get("notes"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.health_records.insert_one(record)
    return {k: v for k, v in record.items() if k != "_id"}

@api_router.delete("/health/{record_id}")
async def delete_health_record(record_id: str, user: User = Depends(get_current_user)):
    result = await db.health_records.delete_one({"record_id": record_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted"}

# ==================== AI SYMPTOM ANALYZER ====================

@api_router.post("/health/analyze")
async def analyze_symptoms(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    dog_id = body.get("dog_id")
    symptoms = body.get("symptoms", [])
    severity = body.get("severity", "mild")
    additional_info = body.get("additional_info", "")
    
    dog = await db.dogs.find_one({"dog_id": dog_id, "user_id": user.user_id}, {"_id": 0})
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    symptoms_text = ", ".join(symptoms)
    
    chat = LlmChat(
        api_key=api_key,
        session_id=f"symptom_{uuid.uuid4().hex[:8]}",
        system_message="""You are a veterinary health assistant. Analyze dog symptoms and provide helpful guidance.
        Always remind users this is not a replacement for professional veterinary care.
        Structure response with: 1. Possible Causes 2. Recommended Actions 3. Warning Signs 4. Home Care Tips"""
    ).with_model("openai", "gpt-5.2")
    
    age_str = f"{dog.get('age_years', 0)} years {dog.get('age_months', 0)} months"
    prompt = f"""Analyze symptoms for a {dog['breed']}, {age_str} old, {dog['weight_kg']}kg ({dog['size']} size):
Symptoms: {symptoms_text}
Severity: {severity}
Additional info: {additional_info or 'None'}"""
    
    response = await chat.send_message(UserMessage(text=prompt))
    return {"analysis": response}

# ==================== DAILY TASKS ====================

@api_router.get("/tasks/{dog_id}")
async def get_tasks(dog_id: str, date: str, user: User = Depends(get_current_user)):
    tasks = await db.tasks.find(
        {"user_id": user.user_id, "dog_id": dog_id, "date": date}, {"_id": 0}
    ).to_list(100)
    return tasks

@api_router.post("/tasks")
async def create_task(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    task = {
        "task_id": f"task_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "dog_id": body.get("dog_id"),
        "title": body.get("title"),
        "task_type": body.get("task_type"),
        "scheduled_time": body.get("scheduled_time"),
        "is_completed": False,
        "completed_at": None,
        "recurring": body.get("recurring", False),
        "recurrence_pattern": body.get("recurrence_pattern"),
        "date": body.get("date"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tasks.insert_one(task)
    return {k: v for k, v in task.items() if k != "_id"}

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
async def create_behavior_log(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    log = {
        "log_id": f"behav_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "dog_id": body.get("dog_id"),
        "behavior_type": body.get("behavior_type"),
        "severity": body.get("severity"),
        "description": body.get("description"),
        "triggers": body.get("triggers", []),
        "notes": body.get("notes"),
        "date": datetime.now(timezone.utc).isoformat()
    }
    await db.behavior_logs.insert_one(log)
    return {k: v for k, v in log.items() if k != "_id"}

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
async def create_travel_checklist(request: Request, user: User = Depends(get_current_user)):
    body = await request.json()
    checklist = {
        "checklist_id": f"travel_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "dog_id": body.get("dog_id"),
        "title": body.get("title"),
        "destination": body.get("destination"),
        "travel_date": body.get("travel_date"),
        "items": body.get("items", DEFAULT_TRAVEL_ITEMS),
        "notes": body.get("notes"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.travel_checklists.insert_one(checklist)
    return {k: v for k, v in checklist.items() if k != "_id"}

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

# ==================== TIPS ====================

PARENTING_TIPS = {
    "dos": [
        {"title": "Positive Reinforcement", "description": "Always reward good behavior with treats, praise, or play."},
        {"title": "Consistent Schedule", "description": "Maintain regular feeding, walking, and sleeping times."},
        {"title": "Early Socialization", "description": "Expose puppies to various people, animals, and environments."},
        {"title": "Regular Exercise", "description": "Provide appropriate physical and mental stimulation."},
        {"title": "Annual Vet Checkups", "description": "Schedule regular veterinary visits for vaccinations and health screenings."},
        {"title": "Proper Nutrition", "description": "Feed age-appropriate, high-quality food in correct portions."},
        {"title": "Mental Stimulation", "description": "Use puzzle toys and training sessions to keep your dog's mind sharp."},
        {"title": "Safe Environment", "description": "Dog-proof your home and provide a comfortable resting area."},
    ],
    "donts": [
        {"title": "Never Hit or Yell", "description": "Physical punishment damages trust and can cause fear-based problems."},
        {"title": "Don't Skip Training", "description": "Even small dogs need basic obedience training for safety."},
        {"title": "Avoid Table Scraps", "description": "Many human foods are toxic to dogs."},
        {"title": "Don't Ignore Warning Signs", "description": "Changes in appetite or behavior can indicate health issues."},
        {"title": "Never Leave Dogs in Hot Cars", "description": "Cars heat up rapidly and can cause fatal heatstroke."},
        {"title": "Don't Overfeed", "description": "Obesity is a leading health problem in dogs."},
        {"title": "Avoid Punishment After the Fact", "description": "Dogs don't understand delayed punishment."},
        {"title": "Don't Skip Parasite Prevention", "description": "Use flea, tick, and worm preventatives."},
    ],
    "risks": [
        {"title": "Toxic Foods", "items": ["Chocolate", "Grapes/Raisins", "Onions/Garlic", "Xylitol", "Alcohol", "Caffeine", "Macadamia nuts"]},
        {"title": "Toxic Plants", "items": ["Lilies", "Azaleas", "Sago Palm", "Tulips", "Oleander", "Ivy"]},
        {"title": "Household Hazards", "items": ["Cleaning products", "Medications", "Small objects", "Electrical cords", "Open windows"]},
        {"title": "Outdoor Dangers", "items": ["Antifreeze", "Pesticides", "Wild animals", "Extreme temperatures", "Traffic"]},
    ]
}

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
    tasks_total = len(today_tasks)
    
    all_enrollments = await db.training_enrollments.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    completed_lessons = len([e for e in all_enrollments if e.get("status") == "completed"])
    
    recent_behaviors = await db.behavior_logs.find(
        {"user_id": user.user_id, "severity": {"$in": ["medium", "high"]}}
    ).sort("date", -1).to_list(5)
    
    achievements_count = await db.achievements.count_documents({"user_id": user.user_id})
    
    return {
        "dogs_count": dogs_count,
        "tasks_completed": tasks_completed,
        "tasks_total": tasks_total,
        "training_completed": completed_lessons,
        "training_total": len(TRAINING_LESSONS),
        "behavior_alerts": len(recent_behaviors),
        "achievements_count": achievements_count,
        "tokens": user.tokens
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
