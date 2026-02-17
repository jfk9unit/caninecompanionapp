# NASDU K9 Handler Courses Data
# Based on official NASDU certifications and BS 8517 standards

NASDU_COURSES = [
    {
        "course_id": "nasdu_level2_patrol",
        "title": "NASDU Level 2 Award - Patrol Dog Handler",
        "level": 2,
        "category": "patrol",
        "description": "Essential certification for security dog handlers working in patrol and general security roles. Covers basic commands, control techniques, and operational patrol duties.",
        "duration_hours": 50,
        "duration_days": 5,
        "price": 1299.00,
        "commission_price": 1454.88,  # 12% commission included
        "location": "Various UK Locations",
        "certification_body": "HABC / Highfield",
        "sia_recognized": True,
        "prerequisites": ["Valid SIA Security Guarding Licence", "Prior security experience"],
        "units": [
            "Roles and Responsibilities of a Security Dog Handler",
            "Control of a Security Dog",
            "Controlling a Patrol Dog under Operational Conditions",
            "Health, Well-being and Safety of a Security Dog"
        ],
        "skills_learned": [
            "Basic and advanced commands",
            "Handler-dog teamwork",
            "Patrol techniques",
            "Suspect apprehension protocols",
            "Canine first aid",
            "Legal aspects of dog handling"
        ],
        "image_url": "https://images.unsplash.com/photo-1582243310179-c628e101c0e3?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "career_paths": ["Site Security", "Event Security", "Patrol Officer"],
        "hourly_rate_after": "£15-20/hour",
        "featured": True
    },
    {
        "course_id": "nasdu_level2_gp",
        "title": "NASDU Level 2 Award - General Purpose Security Dog Handler",
        "level": 2,
        "category": "general_purpose",
        "description": "Comprehensive training for handlers working with general purpose security dogs. Ideal for those seeking versatile security roles.",
        "duration_hours": 60,
        "duration_days": 6,
        "price": 1499.00,
        "commission_price": 1678.88,
        "location": "Various UK Locations",
        "certification_body": "HABC / Highfield",
        "sia_recognized": True,
        "prerequisites": ["Valid SIA Security Guarding Licence", "Competence as a security officer"],
        "units": [
            "Roles and Responsibilities of a Security Dog Handler",
            "Control of a Security Dog",
            "Controlling a General Purpose Security Dog",
            "Health, Well-being and Safety of a Security Dog"
        ],
        "skills_learned": [
            "Property searches",
            "People screening",
            "Vehicle inspections",
            "Perimeter security",
            "Emergency response protocols"
        ],
        "image_url": "https://images.unsplash.com/photo-1669822308470-09f3f3e8d4a2?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "career_paths": ["Corporate Security", "Industrial Security", "Warehouse Protection"],
        "hourly_rate_after": "£16-22/hour",
        "featured": True
    },
    {
        "course_id": "nasdu_level2_tracking",
        "title": "NASDU Level 2 Award - GP/Tracking Dog Handler",
        "level": 2,
        "category": "tracking",
        "description": "Advanced certification combining general purpose skills with tracking capabilities. Requires prior handling experience.",
        "duration_hours": 120,
        "duration_days": 12,
        "price": 2499.00,
        "commission_price": 2798.88,
        "location": "Specialist Training Centres",
        "certification_body": "HABC / Highfield",
        "sia_recognized": True,
        "prerequisites": ["Valid SIA Licence", "Prior dog handling experience", "Recognition of Prior Learning (RPL)"],
        "units": [
            "Roles and Responsibilities of a Security Dog Handler",
            "Control of a Security Dog",
            "Control of a General Purpose Security Dog",
            "Management of a GP/Tracking Dog",
            "Health, Well-being and Safety of a Security Dog"
        ],
        "skills_learned": [
            "Tracking indications",
            "Scent discrimination",
            "Trail following",
            "Dog drive assessment",
            "Advanced obedience"
        ],
        "image_url": "https://images.unsplash.com/photo-1743616288254-be688ab6d2b6?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "career_paths": ["Search & Rescue Support", "Missing Person Operations", "Crime Scene Assistance"],
        "hourly_rate_after": "£20-28/hour",
        "featured": False
    },
    {
        "course_id": "nasdu_level3_drug",
        "title": "NASDU Level 3 Certificate - Proactive Drug Detection Dog Handler",
        "level": 3,
        "category": "detection",
        "description": "Specialist certification for handlers working with drug detection dogs. Compliant with BS 8517-2 standards.",
        "duration_hours": 100,
        "duration_days": 10,
        "price": 3299.00,
        "commission_price": 3694.88,
        "location": "Specialist Detection Centres",
        "certification_body": "HABC / Highfield",
        "sia_recognized": True,
        "prerequisites": ["Level 2 Qualification", "Security industry experience", "Enhanced DBS check"],
        "units": [
            "Roles and Responsibilities",
            "Control of a Detection Dog",
            "Operational Detection Procedures",
            "Health/Safety and Welfare Management"
        ],
        "skills_learned": [
            "Drug scent identification",
            "Indication training",
            "Search methodology",
            "Evidence preservation",
            "Legal requirements"
        ],
        "image_url": "https://images.unsplash.com/photo-1633969995096-457343d5d1ef?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "career_paths": ["Nightclub Security", "Festival Security", "Prison Security", "Port Authority"],
        "hourly_rate_after": "£22-32/hour",
        "featured": True
    },
    {
        "course_id": "nasdu_level3_explosive",
        "title": "NASDU Level 3 Certificate - Explosive Detection Dog Handler",
        "level": 3,
        "category": "detection",
        "description": "High-level certification for handlers working with explosive detection dogs. Critical role in counter-terrorism security.",
        "duration_hours": 160,
        "duration_days": 16,
        "price": 4999.00,
        "commission_price": 5598.88,
        "location": "Government-Approved Centres",
        "certification_body": "HABC / Highfield",
        "sia_recognized": True,
        "prerequisites": ["Level 2 & 3 Qualifications", "Security vetting", "Counter-terrorism clearance"],
        "units": [
            "Explosive Threat Assessment",
            "Detection Dog Management",
            "Search Operations",
            "Emergency Protocols",
            "Inter-agency Coordination"
        ],
        "skills_learned": [
            "Explosive scent recognition",
            "Building searches",
            "Vehicle sweeps",
            "VIP protection support",
            "Public event security"
        ],
        "image_url": "https://images.unsplash.com/photo-1725245045224-05727896e4f8?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "career_paths": ["Airport Security", "Government Buildings", "Major Events", "VIP Protection"],
        "hourly_rate_after": "£28-45/hour",
        "featured": True
    },
    {
        "course_id": "nasdu_refresher",
        "title": "NASDU Annual Refresher Course",
        "level": 2,
        "category": "refresher",
        "description": "Mandatory annual refresher to maintain NASDU certification. Updates skills and knowledge to current standards.",
        "duration_hours": 16,
        "duration_days": 2,
        "price": 399.00,
        "commission_price": 446.88,
        "location": "Various UK Locations",
        "certification_body": "NASDU",
        "sia_recognized": True,
        "prerequisites": ["Existing NASDU certification within 12 months"],
        "units": [
            "Skills Refresh",
            "Legislation Updates",
            "Practical Assessment",
            "Dog Welfare Review"
        ],
        "skills_learned": [
            "Updated protocols",
            "New legal requirements",
            "Skill maintenance",
            "Team re-certification"
        ],
        "image_url": "https://images.unsplash.com/photo-1614272708229-2e893c3da0b7?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "career_paths": ["Maintain current role", "Career progression"],
        "hourly_rate_after": "Maintains current rate",
        "featured": False
    }
]

# Pre-test questions for NASDU courses (50 questions, need 48/50 to pass)
NASDU_PRETEST_QUESTIONS = [
    {
        "id": 1,
        "question": "What does NASDU stand for?",
        "options": [
            "National Association of Security Dog Units",
            "National Association of Search Dog Units", 
            "National Alliance of Security Dog Users",
            "North American Security Dog Union"
        ],
        "correct_answer": 0
    },
    {
        "id": 2,
        "question": "What British Standard covers general purpose security dogs?",
        "options": ["BS 8517-1", "BS 7858", "BS 7499", "BS 8418"],
        "correct_answer": 0
    },
    {
        "id": 3,
        "question": "How often must a NASDU team certification be renewed?",
        "options": ["Every 6 months", "Every 12 months", "Every 24 months", "Every 3 years"],
        "correct_answer": 1
    },
    {
        "id": 4,
        "question": "What licence is required to work as a security dog handler in the UK?",
        "options": [
            "Door Supervisor Licence",
            "SIA Security Guarding Licence",
            "Close Protection Licence",
            "CCTV Operator Licence"
        ],
        "correct_answer": 1
    },
    {
        "id": 5,
        "question": "What is the minimum Guided Learning Hours (GLH) for a NASDU Level 2 Patrol Dog Handler course?",
        "options": ["30 hours", "40 hours", "50 hours", "60 hours"],
        "correct_answer": 2
    },
    {
        "id": 6,
        "question": "Which organisation endorses NASDU qualifications?",
        "options": ["City & Guilds", "HABC/Highfield", "BTEC", "NVQ"],
        "correct_answer": 1
    },
    {
        "id": 7,
        "question": "What is the handler's first responsibility when arriving at a site with a security dog?",
        "options": [
            "Release the dog immediately",
            "Conduct a visual site assessment",
            "Report to the client",
            "Begin patrolling"
        ],
        "correct_answer": 1
    },
    {
        "id": 8,
        "question": "In UK law, what level of force can a security dog handler use?",
        "options": [
            "Maximum force",
            "Any force necessary",
            "Reasonable and proportionate force",
            "Minimal force only"
        ],
        "correct_answer": 2
    },
    {
        "id": 9,
        "question": "What must be displayed on a security dog's collar?",
        "options": [
            "Nothing required",
            "ID tag with handler contact",
            "SIA licence number",
            "Dog's vaccination records"
        ],
        "correct_answer": 1
    },
    {
        "id": 10,
        "question": "How should a security dog be transported to a work site?",
        "options": [
            "In the front passenger seat",
            "In a secure, ventilated cage or vehicle compartment",
            "Loose in the vehicle",
            "On the handler's lap"
        ],
        "correct_answer": 1
    },
    {
        "id": 11,
        "question": "What is the primary purpose of a 'bark and hold' technique?",
        "options": [
            "To attack immediately",
            "To alert handler and contain suspect without biting",
            "To intimidate bystanders",
            "To demonstrate aggression"
        ],
        "correct_answer": 1
    },
    {
        "id": 12,
        "question": "How frequently should a security dog receive veterinary check-ups?",
        "options": [
            "Monthly",
            "Quarterly",
            "At least annually",
            "Only when sick"
        ],
        "correct_answer": 2
    },
    {
        "id": 13,
        "question": "What should a handler do if their dog bites someone during an incident?",
        "options": [
            "Continue patrolling",
            "Report immediately and seek medical attention for the person",
            "Hide the incident",
            "Release the person and leave"
        ],
        "correct_answer": 1
    },
    {
        "id": 14,
        "question": "Which breed is most commonly used for security dog work in the UK?",
        "options": [
            "Rottweiler",
            "German Shepherd Dog",
            "Labrador Retriever",
            "Bullmastiff"
        ],
        "correct_answer": 1
    },
    {
        "id": 15,
        "question": "What does 'SIA' stand for?",
        "options": [
            "Security Industry Authority",
            "Security International Association",
            "Safety and Investigation Agency",
            "Security Inspection Authority"
        ],
        "correct_answer": 0
    },
    {
        "id": 16,
        "question": "What is the recommended water intake for a working security dog?",
        "options": [
            "No water during shifts",
            "Water only before and after shifts",
            "Regular access to fresh water throughout the shift",
            "Water only when the dog requests it"
        ],
        "correct_answer": 2
    },
    {
        "id": 17,
        "question": "What is 'passive indication' in detection dog work?",
        "options": [
            "The dog barks loudly",
            "The dog sits or freezes to indicate a find",
            "The dog scratches at the target",
            "The dog retrieves the item"
        ],
        "correct_answer": 1
    },
    {
        "id": 18,
        "question": "What should a security dog handler do during a fire evacuation?",
        "options": [
            "Release the dog to find its own way out",
            "Continue patrolling",
            "Secure the dog and evacuate following standard procedures",
            "Leave the dog behind"
        ],
        "correct_answer": 2
    },
    {
        "id": 19,
        "question": "What is the purpose of 'socialisation' in security dog training?",
        "options": [
            "To make the dog friendly to everyone",
            "To expose the dog to various environments without overreacting",
            "To train the dog to play with other dogs",
            "To reduce the dog's protective instinct"
        ],
        "correct_answer": 1
    },
    {
        "id": 20,
        "question": "Which document must a security dog handler always carry while on duty?",
        "options": [
            "Passport",
            "Valid SIA licence",
            "Driving licence",
            "Birth certificate"
        ],
        "correct_answer": 1
    },
    {
        "id": 21,
        "question": "What is 'channelling' in security dog patrol work?",
        "options": [
            "Digging tunnels",
            "Guiding intruders towards a controlled area",
            "Swimming exercises",
            "Radio communication"
        ],
        "correct_answer": 1
    },
    {
        "id": 22,
        "question": "How long should a security dog rest between intense patrol activities?",
        "options": [
            "No rest needed",
            "5 minutes",
            "Adequate rest based on exertion level",
            "24 hours"
        ],
        "correct_answer": 2
    },
    {
        "id": 23,
        "question": "What should be checked on a dog's muzzle before use?",
        "options": [
            "Nothing",
            "Proper fit, condition, and allows panting",
            "Colour matches uniform",
            "Brand name"
        ],
        "correct_answer": 1
    },
    {
        "id": 24,
        "question": "What is 'drive' in relation to security dogs?",
        "options": [
            "The vehicle they travel in",
            "The dog's motivation and energy to work",
            "The patrol route",
            "The handler's car"
        ],
        "correct_answer": 1
    },
    {
        "id": 25,
        "question": "Under the Animal Welfare Act 2006, handlers must ensure dogs are free from:",
        "options": [
            "All work duties",
            "Pain, suffering, injury, and disease",
            "Training requirements",
            "Human contact"
        ],
        "correct_answer": 1
    },
    {
        "id": 26,
        "question": "What command recalls a security dog to the handler?",
        "options": [
            "Attack",
            "Stay",
            "Come/Hier",
            "Down"
        ],
        "correct_answer": 2
    },
    {
        "id": 27,
        "question": "What is the recommended lead length for standard patrol work?",
        "options": [
            "1 metre",
            "2-3 metres",
            "10 metres",
            "No lead required"
        ],
        "correct_answer": 1
    },
    {
        "id": 28,
        "question": "When can a security dog handler use their dog to detain someone?",
        "options": [
            "Any time they want",
            "When they're bored",
            "When there's reasonable grounds and it's proportionate",
            "Never"
        ],
        "correct_answer": 2
    },
    {
        "id": 29,
        "question": "What should handlers check for signs of in their dog before each shift?",
        "options": [
            "Happiness level",
            "Illness, injury, or fatigue",
            "Fur colour",
            "Tail wagging speed"
        ],
        "correct_answer": 1
    },
    {
        "id": 30,
        "question": "What is a 'stand-off' in security dog terminology?",
        "options": [
            "A rest break",
            "Maintaining distance while keeping suspect under control",
            "A training exercise",
            "A feeding position"
        ],
        "correct_answer": 1
    },
    {
        "id": 31,
        "question": "Which vaccination is essential for all security dogs?",
        "options": [
            "Flu vaccine only",
            "Rabies, distemper, parvovirus, and leptospirosis",
            "Human vaccines",
            "No vaccines needed"
        ],
        "correct_answer": 1
    },
    {
        "id": 32,
        "question": "What is the 'out' command used for?",
        "options": [
            "Sending the dog outside",
            "Commanding the dog to release/let go",
            "Telling the dog to sit",
            "Ending the shift"
        ],
        "correct_answer": 1
    },
    {
        "id": 33,
        "question": "How should incident reports involving security dogs be completed?",
        "options": [
            "Verbally only",
            "Not necessary",
            "In writing, accurately and promptly",
            "By the dog"
        ],
        "correct_answer": 2
    },
    {
        "id": 34,
        "question": "What environmental hazard should handlers be aware of in industrial sites?",
        "options": [
            "Too much grass",
            "Chemicals, sharp objects, and hazardous materials",
            "Other workers",
            "Parking spaces"
        ],
        "correct_answer": 1
    },
    {
        "id": 35,
        "question": "What is 'quartering' in search operations?",
        "options": [
            "Dividing money",
            "Systematic search pattern covering an area",
            "Resting for 15 minutes",
            "Feeding quarters"
        ],
        "correct_answer": 1
    },
    {
        "id": 36,
        "question": "What should a handler do if their dog shows signs of heat exhaustion?",
        "options": [
            "Continue working",
            "Ignore it",
            "Stop work, cool the dog, provide water, seek veterinary help",
            "Make the dog run faster"
        ],
        "correct_answer": 2
    },
    {
        "id": 37,
        "question": "What type of collar is typically used for security dog work?",
        "options": [
            "Decorative collar",
            "Check chain or flat collar with ID",
            "No collar",
            "Electric shock collar"
        ],
        "correct_answer": 1
    },
    {
        "id": 38,
        "question": "When working night shifts, what additional equipment might be needed?",
        "options": [
            "Sunglasses",
            "Torch and reflective equipment",
            "Reading glasses",
            "Umbrella"
        ],
        "correct_answer": 1
    },
    {
        "id": 39,
        "question": "What is the handler's responsibility regarding dog waste?",
        "options": [
            "Leave it anywhere",
            "Properly dispose of it hygienically",
            "Ignore it",
            "Collect it as evidence"
        ],
        "correct_answer": 1
    },
    {
        "id": 40,
        "question": "What does 'proactive' mean in drug detection work?",
        "options": [
            "Waiting for drugs to appear",
            "Actively searching for drugs rather than responding to alerts",
            "Being lazy",
            "Working part-time"
        ],
        "correct_answer": 1
    },
    {
        "id": 41,
        "question": "What should be included in a security dog's daily routine?",
        "options": [
            "Work only",
            "Exercise, feeding, rest, grooming, and health checks",
            "Sleep only",
            "TV watching"
        ],
        "correct_answer": 1
    },
    {
        "id": 42,
        "question": "What is the purpose of handler licensing requirements?",
        "options": [
            "Revenue generation",
            "To ensure handlers meet professional standards and legal requirements",
            "To limit competition",
            "Paperwork exercise"
        ],
        "correct_answer": 1
    },
    {
        "id": 43,
        "question": "How should a security dog react to loud noises during work?",
        "options": [
            "Panic and run",
            "Attack the source",
            "Remain calm and focused on handler commands",
            "Hide"
        ],
        "correct_answer": 2
    },
    {
        "id": 44,
        "question": "What is the minimum age for a dog to begin security work?",
        "options": [
            "6 months",
            "12 months",
            "18-24 months (fully matured)",
            "Any age"
        ],
        "correct_answer": 2
    },
    {
        "id": 45,
        "question": "What should handlers do with confidential site information?",
        "options": [
            "Share on social media",
            "Tell friends",
            "Maintain strict confidentiality",
            "Publish online"
        ],
        "correct_answer": 2
    },
    {
        "id": 46,
        "question": "What is 'imprinting' in detection dog training?",
        "options": [
            "Making paw prints",
            "Teaching the dog to recognise specific scents",
            "Tattooing the dog",
            "Printing documents"
        ],
        "correct_answer": 1
    },
    {
        "id": 47,
        "question": "How should handlers communicate with clients about their dog's capabilities?",
        "options": [
            "Exaggerate abilities",
            "Honestly and professionally",
            "Refuse to discuss",
            "Make up statistics"
        ],
        "correct_answer": 1
    },
    {
        "id": 48,
        "question": "What is the kennel temperature range for security dogs?",
        "options": [
            "Below freezing",
            "10-20°C (comfortable, well-ventilated)",
            "Above 35°C",
            "Temperature doesn't matter"
        ],
        "correct_answer": 1
    },
    {
        "id": 49,
        "question": "What documentation should accompany a security dog at all times?",
        "options": [
            "Nothing",
            "Vaccination records, ID, and team certification",
            "Recipe book",
            "Handler's bank statements"
        ],
        "correct_answer": 1
    },
    {
        "id": 50,
        "question": "What is the handler's duty of care towards the public?",
        "options": [
            "No duty exists",
            "To prevent harm and maintain control of the dog at all times",
            "To intimidate everyone",
            "To ignore public safety"
        ],
        "correct_answer": 1
    }
]

# K9 Trainers for booking system
APPROVED_K9_TRAINERS = [
    {
        "trainer_id": "trainer_001",
        "name": "James Morrison",
        "title": "Senior K9 Instructor",
        "experience_years": 15,
        "specializations": ["Patrol Dogs", "Protection", "Obedience"],
        "certifications": ["NASDU Level 3", "Police Dog Instructor", "BS 8517 Assessor"],
        "rating": 4.9,
        "reviews": 127,
        "bio": "Former Metropolitan Police dog handler with 15 years of experience training protection and patrol dogs.",
        "location": "London",
        "image_url": "https://images.unsplash.com/photo-1633969995096-457343d5d1ef?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "availability": ["weekdays", "weekends"],
        "languages": ["English"],
        "verified": True
    },
    {
        "trainer_id": "trainer_002",
        "name": "Sarah Williams",
        "title": "Certified Behavioural Specialist",
        "experience_years": 12,
        "specializations": ["Behaviour Modification", "Anxiety", "Aggression"],
        "certifications": ["NASDU Level 2", "APBC Certified", "Canine Behaviour Diploma"],
        "rating": 4.8,
        "reviews": 98,
        "bio": "Specialising in transforming challenging behaviours into confident, well-adjusted K9 companions.",
        "location": "Manchester",
        "image_url": "https://images.unsplash.com/photo-1614272708229-2e893c3da0b7?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "availability": ["weekdays"],
        "languages": ["English", "Spanish"],
        "verified": True
    },
    {
        "trainer_id": "trainer_003",
        "name": "Michael O'Brien",
        "title": "Detection Dog Specialist",
        "experience_years": 18,
        "specializations": ["Drug Detection", "Explosive Detection", "Search & Rescue"],
        "certifications": ["NASDU Level 3 Detection", "Military K9 Instructor", "NPIA Certified"],
        "rating": 5.0,
        "reviews": 156,
        "bio": "Ex-military working dog handler specialising in detection training for security and law enforcement.",
        "location": "Birmingham",
        "image_url": "https://images.unsplash.com/photo-1725245045224-05727896e4f8?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "availability": ["weekdays", "weekends"],
        "languages": ["English"],
        "verified": True
    },
    {
        "trainer_id": "trainer_004",
        "name": "Emma Thompson",
        "title": "Puppy Development Expert",
        "experience_years": 10,
        "specializations": ["Puppy Training", "Socialisation", "Foundation Skills"],
        "certifications": ["NASDU Level 2", "Puppy School Certified", "IMDT Member"],
        "rating": 4.9,
        "reviews": 203,
        "bio": "Building strong foundations for future working dogs with positive, science-based training methods.",
        "location": "Leeds",
        "image_url": "https://images.unsplash.com/photo-1582243310179-c628e101c0e3?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "availability": ["weekdays", "weekends"],
        "languages": ["English", "French"],
        "verified": True
    },
    {
        "trainer_id": "trainer_005",
        "name": "David Chen",
        "title": "Protection Dog Expert",
        "experience_years": 14,
        "specializations": ["Personal Protection", "Executive Protection", "Guard Dogs"],
        "certifications": ["NASDU Level 3", "Schutzhund IPO", "Close Protection"],
        "rating": 4.7,
        "reviews": 89,
        "bio": "Training elite protection dogs for high-net-worth individuals and corporate security teams.",
        "location": "London",
        "image_url": "https://images.unsplash.com/photo-1669822308470-09f3f3e8d4a2?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "availability": ["weekdays"],
        "languages": ["English", "Mandarin"],
        "verified": True
    }
]

# Booking pricing
TRAINER_PRICING = {
    "virtual": {
        "30min": {"price": 29.99, "description": "30 minute virtual consultation"},
        "60min": {"price": 45.00, "description": "1 hour virtual training session"}
    },
    "in_person": {
        "60min": {"price": 179.99, "description": "1 hour in-person training"},
        "120min": {"price": 320.00, "description": "2 hour in-person session"},
        "180min": {"price": 420.00, "description": "3 hour intensive training"}
    },
    "travel": {
        "call_out_fee": 25.00,
        "per_mile": 0.85
    },
    "admin_fee": 25.00  # For rescheduling
}

# Training equipment descriptions
TRAINING_EQUIPMENT = [
    {
        "name": "Protection Bite Sleeve",
        "description": "Professional-grade bite training equipment for protection work",
        "used_for": ["Protection training", "Bite work", "Apprehension exercises"]
    },
    {
        "name": "Long Line Lead (15m)",
        "description": "Extended lead for recall training and distance work",
        "used_for": ["Recall training", "Distance commands", "Field work"]
    },
    {
        "name": "Agility Equipment",
        "description": "Jumps, tunnels, and obstacles for physical conditioning",
        "used_for": ["Physical fitness", "Coordination", "Confidence building"]
    },
    {
        "name": "Scent Detection Kit",
        "description": "Training aids for developing scent discrimination",
        "used_for": ["Detection training", "Scent work", "Search exercises"]
    },
    {
        "name": "Reward Pouch & High-Value Treats",
        "description": "Motivation tools for positive reinforcement training",
        "used_for": ["All training types", "Reward-based learning"]
    }
]

# Behavioural issues we address
BEHAVIOURAL_ISSUES = [
    {
        "issue": "Aggression",
        "description": "Reactive behaviour towards people or other dogs",
        "approach": "Systematic desensitisation and counter-conditioning",
        "typical_sessions": "6-12 sessions"
    },
    {
        "issue": "Separation Anxiety",
        "description": "Distress when left alone",
        "approach": "Gradual independence training and coping strategies",
        "typical_sessions": "4-8 sessions"
    },
    {
        "issue": "Fearfulness",
        "description": "Excessive fear of sounds, objects, or situations",
        "approach": "Confidence building through positive exposure",
        "typical_sessions": "5-10 sessions"
    },
    {
        "issue": "Leash Reactivity",
        "description": "Barking, lunging, or pulling on walks",
        "approach": "Focus training and controlled exposure",
        "typical_sessions": "4-6 sessions"
    },
    {
        "issue": "Resource Guarding",
        "description": "Protecting food, toys, or spaces",
        "approach": "Trade games and trust-building exercises",
        "typical_sessions": "3-6 sessions"
    },
    {
        "issue": "Poor Recall",
        "description": "Failure to return when called",
        "approach": "High-value reward training and distraction proofing",
        "typical_sessions": "4-8 sessions"
    }
]

# Supported languages for multi-language feature
SUPPORTED_LANGUAGES = {
    "en-GB": {
        "name": "English (UK)",
        "flag": "🇬🇧",
        "currency": "GBP",
        "currency_symbol": "£"
    },
    "en-US": {
        "name": "English (US)",
        "flag": "🇺🇸",
        "currency": "USD",
        "currency_symbol": "$"
    },
    "es": {
        "name": "Español",
        "flag": "🇪🇸",
        "currency": "EUR",
        "currency_symbol": "€"
    },
    "fr": {
        "name": "Français",
        "flag": "🇫🇷",
        "currency": "EUR",
        "currency_symbol": "€"
    },
    "de": {
        "name": "Deutsch",
        "flag": "🇩🇪",
        "currency": "EUR",
        "currency_symbol": "€"
    }
}
