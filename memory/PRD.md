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

### 14. Leaderboard & Competitions (NEW)
- Overall rankings combining all metrics
- Category-specific leaderboards (Training, Pet XP, Achievements)
- Top 3 podium display with medals
- Personal rank and score breakdown
- 6 Weekly challenges:
  - Training Master: Complete 3 lessons (+5 tokens)
  - Daily Dedication: 5 consecutive days of tasks (+8 tokens)
  - Health Hero: Log 2 health records (+3 tokens)
  - Pet Lover: Play with pet 10 times (+5 tokens)
  - Social Star: Share 2 achievements (+4 tokens)
  - K9 Trainee: Complete 1 K9 security lesson (+10 tokens)
- Score formula: training*10 + achievements*5 + pet_xp + referrals*15

### 15. Seasonal Tournaments (NEW)
- **Spring Training Championship** (Mar-May): Most training lessons, scoring: training_completed
- **Summer Games Tournament** (Jun-Aug): Highest pet XP, scoring: pet_xp
- **Autumn Achiever Challenge** (Sep-Nov): Most achievements, scoring: achievements
- **Winter Guardian Championship** (Dec-Feb): K9 protection training, scoring: k9_training
- Prizes: 1st (100-150 tokens + gold badge), 2nd (50-75 tokens + silver badge), 3rd (25-35 tokens + bronze badge), top_10 (10-15 tokens + badge)

### 16. K9 Security & Protection Training (NEW)
- 15 specialized security lessons (k9_001 to k9_015)
- Token costs: 18-25 tokens per lesson
- 5-tier skill tree progression:
  - Tier 1 (Foundation): Alert & Watch, Perimeter Patrol
  - Tier 2 (Intermediate): Controlled Intimidation, Handler Protection
  - Tier 3 (Advanced): Threat Assessment, Vehicle Security, Building Clearing
  - Tier 4 (Expert): Escort & Crowd Control, Night Operations, Controlled Apprehension
  - Tier 5 (Master): Advanced Bite & Hold, Handler Protection Advanced, Tactical Operations, Executive Protection, Master Certification
- Rank progression: Recruit → Guardian Initiate → Shield Bearer → Threat Analyst → Elite Protector → K9 Master
- Badge rewards for each completed lesson

### 17. K9 Handler Credentials (NEW)
- 5-tier credential system:
  - Tier 1: Guardian Initiate (1 lesson)
  - Tier 2: Shield Bearer (3 lessons)
  - Tier 3: Threat Analyst (6 lessons)
  - Tier 4: Elite Protector (10 lessons)
  - Tier 5: K9 Protection Master (15 lessons)
- Downloadable PNG certificates with professional design
- Unique credential ID: K9-{user_id}-{count}
- Share credentials to social media
- Certificate history tracking

### 18. PWA & Mobile App Ready (NEW)
- Progressive Web App (PWA) support
- manifest.json with app metadata
- Service worker for offline support
- App icons (16x16 to 512x512)
- iOS splash screens
- Mobile bottom navigation bar
- Safe area support for notched phones
- Installable on Android/iOS home screens
- Push notification support

### 19. Redesigned Dashboard (NEW)
- Quick Actions grid: Start Training, K9 Security, Virtual Pet, Competitions
- Token balance card with quick buy button
- Quick stats row: Lessons Done, Achievements, Day Streak, Dogs
- Featured lesson card with start button
- Share Progress card with Web Share API
- Referral banner with invite friends functionality
- Your Dogs section with quick add
- Achievement teaser card

### 20. Interactive Training Experience (NEW)
- Practice timers (30 seconds with play/pause/reset)
- Expandable step details with quick tips
- Progress share cards during lessons
- Celebration confetti on lesson completion (canvas-confetti)
- Lesson completion modal with:
  - Trophy animation
  - XP earned display
  - Badge rewards
  - Share Achievement button

### 21. Payment Methods (NEW)
- Stripe checkout for cards & bank transfers
- PayPal integration (REQUIRES API KEYS: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
- Accepted: Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay, Bank Transfer
- 10% first purchase discount automatically applied
- Transaction history with discount tracking

### 22. Push Notifications Settings (NEW)
- Push notification master toggle
- Training reminders
- Daily tips
- Achievement alerts
- Tournament updates
- Promotional offers (marketing)
- Enable/Disable all buttons
- Service worker push subscription

### 23. QR Code Referrals (NEW)
- QR code generation for referral links
- Download QR code as PNG
- Shareable referral URL: caninecompass.app/join?ref={code}
- Web Share API integration

### 24. Deep Linking (NEW)
- Shareable lesson links: /training?lesson={id}
- Shareable achievement links: /achievements?view={id}
- K9 credential verification: /verify/{credential_id}
- Share text generation for social media

### 25. Enhanced Pet Age (NEW)
- Age input: years, months, days
- Granular age tracking for puppies
- Birthday calculation support

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

### Payments
- POST /api/payments/stripe/checkout - Create Stripe checkout
- GET /api/payments/status/{session_id} - Check Stripe payment status
- POST /api/payments/paypal/create - Create PayPal payment
- POST /api/payments/paypal/execute - Execute PayPal payment
- GET /api/payments/first-purchase-eligible - Check first purchase discount eligibility

### Notifications
- GET /api/notifications/settings - Get notification settings
- PUT /api/notifications/settings - Update notification settings
- POST /api/notifications/subscribe - Subscribe to push notifications
- DELETE /api/notifications/unsubscribe - Unsubscribe from push

### QR Codes & Deep Links
- GET /api/referral/qr-code - Generate referral QR code
- GET /api/share/lesson/{lesson_id} - Get lesson share link
- GET /api/share/achievement/{achievement_id} - Get achievement share link
- GET /api/share/k9-credential/{credential_id} - Get K9 credential share link

### K9 Credentials
- GET /api/k9/credentials - Get user's K9 handler credentials
- POST /api/k9/generate-certificate - Generate downloadable certificate
- GET /api/k9/certificates - Get certificate history

### Leaderboard & Competitions
- GET /api/leaderboard - Get rankings (filter by category: overall/training/pet/achievements)
- GET /api/leaderboard/my-rank - Get current user's rank and breakdown
- GET /api/competitions/challenges - Get weekly challenges with progress
- POST /api/competitions/claim/{challenge_id} - Claim challenge reward

### Seasonal Tournaments
- GET /api/tournaments/current - Get active tournament with leaderboard
- GET /api/tournaments/my-position - Get user's tournament position
- GET /api/tournaments/history - Get user's tournament history

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

- notification_settings
- push_subscriptions

## Completed (Feb 2026)
- [x] V1 Core features (Auth, Dogs, Training, Health, Breeds, Activities, Behavior, Travel, Tips)
- [x] V2 Token Shop with Stripe integration
- [x] V2 PayPal payment integration (REQUIRES API KEYS)
- [x] V2 10% first purchase discount
- [x] V2 Virtual Pet game with skills
- [x] V2 Achievements with certificates
- [x] V2 Voice Activity logging with AI
- [x] V2 Leaderboard & Weekly Competitions
- [x] V2 Seasonal Tournaments (4 seasonal competitions)
- [x] V2 K9 Security & Protection Training (15 lessons, skill tree)
- [x] V2 K9 Handler Credentials with downloadable certificates
- [x] V2 PWA & Mobile App Ready (manifest, service worker, icons)
- [x] V2 Redesigned Dashboard with Quick Actions & Sharing
- [x] V2 Interactive Training with timers, confetti, celebrations
- [x] V2 QR Code referrals with download
- [x] V2 Push Notification Settings
- [x] V2 Deep Linking for shared content
- [x] V2 Pet age in years/months/days
- [x] 132 dog breeds in database
- [x] 90 training lessons (75 regular + 15 K9 security)
- [x] Referral system with QR codes
- [x] Mobile-optimized bottom navigation

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
