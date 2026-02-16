# CanineCompass V2 - PRD

## Original Problem Statement
Build a comprehensive canine training and care app covering all levels of dog training from puppy to advanced, with gamification features including:
- AI-powered virtual pet game (Tamagotchi-style)
- Token-based monetization system (£2.89 for 10 tokens via Stripe)
- Rewards/achievements with downloadable certificates
- Voice activity logging with AI summarization
- 200+ dog breeds database
- 75+ training lessons
- Puppy parenting guides, health records, behavior tracking
- Travel checklists and vet details

## User Choices
- AI-powered symptom analysis: GPT-5.2 via Emergent LLM Key
- Voice log summarization: GPT-5.2 via Emergent LLM Key
- Authentication: Emergent-managed Google OAuth
- Payments: Stripe integration
- Design: Modern, clean, gamified UI

## Architecture
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **AI Integration**: OpenAI GPT-5.2 via Emergent LLM Key
- **Payments**: Stripe Checkout

## Core Features Implemented (Feb 2026)

### 1. Authentication
- Google OAuth via Emergent Auth
- Session management with 7-day expiry
- Protected routes with cookie-based auth

### 2. Dog Profile Management
- Add/edit/delete dog profiles
- Track breed, age, weight, size, gender, birthday

### 3. Training Center (75 Lessons)
- Beginner (6-8 tokens): 20 lessons
- Intermediate (9-11 tokens): 20 lessons  
- Advanced (12-15 tokens): 35 lessons
- Categories: Obedience, Behavior, Tricks, Agility, Lifestyle, Health
- Step-by-step progress tracking with pro tips
- Toy & treat recommendations per lesson

### 4. Token Shop (NEW V2)
- 4 token packages: Starter (10/£2.89), Value (25/£6.49), Premium (50/£11.99), Ultimate (100/£21.99)
- Stripe checkout integration
- Referral system: 5 tokens per friend referred
- Payment status tracking

### 5. Virtual Pet Game (NEW V2)
- Create and name virtual pet
- Happiness and Energy stats
- Feed (+10 happiness) and Play (+15 XP)
- 8 trainable skills (Sit, Stay, Fetch, Roll, Shake, Speak, Heel, Down)
- Training costs 1 token per skill
- Level progression (XP-based)

### 6. Achievements Dashboard (NEW V2)
- Bronze/Silver/Gold badges
- Categories: Training, Social, Milestones
- Share achievements to social media
- Download printable certificates (PNG)
- Progress tracking for upcoming achievements

### 7. Voice Activity Log (NEW V2)
- Record or type daily activities
- AI summarization to bullet points via GPT-5.2
- Mood detection
- Activity extraction
- Chronological log history

### 8. Health Hub
- Health records timeline (vaccinations, checkups, medications)
- AI-powered symptom analyzer with GPT-5.2
- Vet details storage

### 9. Breed Explorer (132 Breeds)
- Small breeds: 25
- Medium breeds: 50+
- Large breeds: 50+
- Filter by size, search by name
- Full breed profiles: temperament, exercise needs, health concerns

### 10. Daily Activities
- Task scheduling (walks, feeding, grooming, training, vet)
- Date-based tracking
- Completion progress

### 11. Behavior Tracker
- Log behavior incidents with severity
- Common trigger tracking
- Weekly statistics

### 12. Travel Planner
- Trip checklists with 12 default items
- Custom checklist creation
- Packing progress tracking

### 13. Tips & Resources
- Parenting Do's (8) and Don'ts (8)
- Risk awareness: toxic foods, plants, household hazards, outdoor dangers

## API Endpoints

### Auth
- POST /api/auth/session - Create session from OAuth
- GET /api/auth/me - Get current user
- POST /api/auth/logout - End session

### Tokens & Payments
- GET /api/tokens/packages - Get available packages
- GET /api/tokens/balance - Get user token balance
- POST /api/payments/stripe/checkout - Create Stripe checkout
- GET /api/payments/status/{session_id} - Check payment status

### Dogs
- GET/POST /api/dogs - List/create dogs
- GET/PUT/DELETE /api/dogs/{dog_id} - Single dog CRUD

### Virtual Pet
- GET/POST /api/virtual-pet - Get/create pet
- POST /api/virtual-pet/feed - Feed pet
- POST /api/virtual-pet/play - Play with pet
- POST /api/virtual-pet/train - Train skill

### Training
- GET /api/training/lessons - List lessons (filter by level/category)
- GET /api/training/lessons/{lesson_id} - Get single lesson
- POST /api/training/enroll/{lesson_id} - Enroll in lesson
- GET /api/training/enrollments/{dog_id} - Get dog's enrollments
- POST /api/training/complete-step - Complete training step

### Achievements
- GET /api/achievements - List user achievements
- POST /api/achievements/{id}/share - Share achievement

### Voice Logs
- GET /api/voice-logs/{dog_id} - Get voice logs
- POST /api/voice-logs - Create voice log (with AI analysis)

### Health
- GET /api/health/{dog_id} - Get health records
- POST /api/health - Create health record
- POST /api/health/analyze - AI symptom analysis

### Other
- GET /api/breeds - List breeds (filter by size/search)
- GET /api/tasks/{dog_id} - Get tasks
- GET /api/behavior/{dog_id} - Get behavior logs
- GET /api/travel/{dog_id} - Get travel checklists
- GET /api/vets - Get vet details
- GET /api/dashboard/stats - Get dashboard statistics
- GET /api/tips/parenting - Get parenting tips

## Database Collections
- users
- user_sessions
- dogs
- virtual_pets
- achievements
- training_enrollments
- health_records
- tasks
- behavior_logs
- travel_checklists
- vets
- voice_logs
- payment_transactions

## Completed (Feb 2026)
- [x] V1 Core features (Auth, Dogs, Training, Health, Breeds, Activities, Behavior, Travel, Tips)
- [x] V2 Token Shop with Stripe integration
- [x] V2 Virtual Pet game with skills
- [x] V2 Achievements with certificates
- [x] V2 Voice Activity logging with AI
- [x] 132 dog breeds in database
- [x] 75 training lessons with categorization
- [x] Referral system

## Backlog

### P1 (High Priority)
- [ ] PayPal payment integration (user requested)
- [ ] Photo uploads for dog profiles
- [ ] Push notifications

### P2 (Medium Priority)
- [ ] Training streaks/gamification bonuses
- [ ] Vet appointment scheduling with reminders
- [ ] Data export functionality
- [ ] Multiple user support per dog

### P3 (Nice to Have)
- [ ] AI-powered training recommendations based on progress
- [ ] Photo gallery per dog
- [ ] Community/social features
- [ ] Premium subscription tier

## Tech Stack
- Frontend: React 19.0.0, Tailwind CSS, shadcn/ui, lucide-react
- Backend: FastAPI 0.110.1, Motor 3.3.1 (async MongoDB)
- Database: MongoDB
- Auth: Emergent-managed Google OAuth
- AI: OpenAI GPT-5.2 via emergentintegrations
- Payments: Stripe via emergentintegrations
