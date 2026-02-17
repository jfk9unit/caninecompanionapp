// Training Visuals Configuration - Images, Colors, Logos, Videos for all training categories and lessons

// Video Tutorials for lessons (YouTube embed IDs - curated training videos)
export const LESSON_VIDEOS = {
  // Beginner Obedience Videos
  lesson_001: { id: "3dMKR5", title: "House Training Made Easy", duration: "8:24" },
  lesson_002: { id: "QpkOHI", title: "Teaching Sit Command", duration: "5:32" },
  lesson_003: { id: "kJRBK4", title: "Leash Training Basics", duration: "10:15" },
  lesson_004: { id: "sD3Mwx", title: "Puppy Socialization Guide", duration: "12:08" },
  lesson_005: { id: "pL9Bv2", title: "Crate Training Tutorial", duration: "9:45" },
  lesson_006: { id: "tR4Kw1", title: "Down Command Training", duration: "6:20" },
  lesson_007: { id: "yU8Hp3", title: "Name Recognition Games", duration: "4:50" },
  lesson_008: { id: "bN5Jc7", title: "Bite Inhibition Training", duration: "7:30" },
  lesson_009: { id: "mK2Fw9", title: "Recall Training Basics", duration: "11:15" },
  lesson_010: { id: "vX6Gt4", title: "Handling & Grooming Prep", duration: "8:40" },
  
  // Intermediate Videos
  lesson_021: { id: "hY3Rd8", title: "Advanced Stay Training", duration: "9:20" },
  lesson_022: { id: "wE7Ps5", title: "Reliable Recall Secrets", duration: "14:30" },
  lesson_023: { id: "qA9Lt6", title: "Loose Leash Walking", duration: "12:45" },
  lesson_029: { id: "zC4Mn1", title: "Touch Target Training", duration: "6:55" },
  lesson_030: { id: "jB8Xk2", title: "Spin Trick Tutorial", duration: "5:10" },
  
  // Advanced Videos
  lesson_042: { id: "fG5Vn3", title: "Agility Foundations", duration: "18:20" },
  lesson_043: { id: "oP6Qr7", title: "Play Dead Trick", duration: "7:45" },
  lesson_048: { id: "aS2Uj9", title: "Scent Work Introduction", duration: "15:30" },
  
  // K9 Security Videos
  k9_001: { id: "dL4Wm8", title: "K9 Alert & Watch", duration: "16:40" },
  k9_002: { id: "iN7Yo5", title: "Perimeter Patrol Basics", duration: "20:15" },
  k9_003: { id: "rT1Ek6", title: "Controlled Intimidation", duration: "18:50" },
  k9_010: { id: "uH9Bi4", title: "Apprehension Basics", duration: "25:30" },
};

// Get video for a lesson
export const getLessonVideo = (lessonId) => {
  return LESSON_VIDEOS[lessonId] || null;
};

// Category Images and Styling
export const CATEGORY_VISUALS = {
  obedience: {
    name: "Obedience Training",
    description: "Master essential commands and build a strong foundation",
    image: "https://images.unsplash.com/photo-1760970902911-972461fdecef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxkb2clMjB0cmFpbmluZyUyMG9iZWRpZW5jZSUyMHNpdHRpbmd8ZW58MHx8fHwxNzcxMjg5ODE4fDA&ixlib=rb-4.1.0&q=85&w=800",
    icon: "GraduationCap",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    accentColor: "#3B82F6"
  },
  behavior: {
    name: "Behavior & Socialization",
    description: "Shape positive behaviors and social skills",
    image: "https://images.unsplash.com/photo-1758426156451-0d05400ecd8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwxfHxkb2clMjBzb2NpYWxpemF0aW9uJTIwcGxheWluZyUyMGRvZ3N8ZW58MHx8fHwxNzcxMjg5ODMwfDA&ixlib=rb-4.1.0&q=85&w=800",
    icon: "Heart",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    accentColor: "#EC4899"
  },
  tricks: {
    name: "Fun Tricks",
    description: "Impressive tricks for bonding and mental stimulation",
    image: "https://images.unsplash.com/photo-1741872237189-d72b2afbda6e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxkb2clMjB0cmlja3MlMjBiZWhhdmlvciUyMHRyYWluaW5nfGVufDB8fHx8MTc3MTI4OTgyMXww&ixlib=rb-4.1.0&q=85&w=800",
    icon: "Sparkles",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    accentColor: "#F59E0B"
  },
  agility: {
    name: "Agility Training",
    description: "Athletic challenges and competitive sports",
    image: "https://images.unsplash.com/photo-1544456948-c7ba22fe7111?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHw0fHxkb2clMjBhZ2lsaXR5JTIwdHJhaW5pbmclMjBqdW1wfGVufDB8fHx8MTc3MTI4OTgyMHww&ixlib=rb-4.1.0&q=85&w=800",
    icon: "Zap",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    accentColor: "#10B981"
  },
  health: {
    name: "Health & Care",
    description: "Grooming acceptance and health-related training",
    image: "https://images.unsplash.com/photo-1770836037793-95bdbf190f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxkb2clMjBoZWFsdGglMjB2ZXRlcmluYXJ5JTIwY2hlY2t1cHxlbnwwfHx8fDE3NzEyODk4Mjl8MA&ixlib=rb-4.1.0&q=85&w=800",
    icon: "Heart",
    color: "from-red-500 to-pink-600",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    accentColor: "#EF4444"
  },
  lifestyle: {
    name: "Lifestyle & Travel",
    description: "Real-world skills for everyday life",
    image: "https://images.unsplash.com/photo-1760615302725-4a6f097e56e0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHw0fHxwdXBweSUyMHRyYWluaW5nJTIwbGVhc2glMjB3YWxraW5nfGVufDB8fHx8MTc3MTI4OTgxOXww&ixlib=rb-4.1.0&q=85&w=800",
    icon: "MapPin",
    color: "from-cyan-500 to-teal-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    accentColor: "#06B6D4"
  },
  enrichment: {
    name: "Mental Enrichment",
    description: "Scent work and cognitive challenges",
    image: "https://images.unsplash.com/photo-1669822293673-d321743f7fe8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxkb2clMjB0cmlja3MlMjBiZWhhdmlvciUyMHRyYWluaW5nfGVufDB8fHx8MTc3MTI4OTgyMXww&ixlib=rb-4.1.0&q=85&w=800",
    icon: "Brain",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
    accentColor: "#8B5CF6"
  },
  working: {
    name: "Working Dog Skills",
    description: "Professional-level herding and detection",
    image: "https://images.unsplash.com/photo-1743616288254-be688ab6d2b6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=800",
    icon: "Briefcase",
    color: "from-slate-600 to-gray-700",
    bgColor: "bg-slate-50",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    accentColor: "#475569"
  },
  sport: {
    name: "Dog Sports",
    description: "Competitive sports and athletic activities",
    image: "https://images.unsplash.com/photo-1763989979792-67611852276b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwxfHxkb2clMjBhZ2lsaXR5JTIwdHJhaW5pbmclMjBqdW1wfGVufDB8fHx8MTc3MTI4OTgyMHww&ixlib=rb-4.1.0&q=85&w=800",
    icon: "Trophy",
    color: "from-yellow-500 to-amber-600",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    accentColor: "#EAB308"
  },
  assistance: {
    name: "Assistance & Therapy",
    description: "Service and therapy dog training",
    image: "https://images.unsplash.com/photo-1692906456160-385d805be646?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHw0fHxkb2clMjBoZWFsdGglMjB2ZXRlcmluYXJ5JTIwY2hlY2t1cHxlbnwwfHx8fDE3NzEyODk4Mjl8MA&ixlib=rb-4.1.0&q=85&w=800",
    icon: "HandHeart",
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    accentColor: "#6366F1"
  },
  k9_protection: {
    name: "K9 Security & Protection",
    description: "Professional security and protection training",
    image: "https://images.unsplash.com/photo-1570529987503-72542d17bcb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=800",
    icon: "Shield",
    color: "from-slate-700 to-zinc-800",
    bgColor: "bg-slate-100",
    textColor: "text-slate-800",
    borderColor: "border-slate-300",
    accentColor: "#334155"
  }
};

// Level Images and Styling
export const LEVEL_VISUALS = {
  beginner: {
    name: "Beginner",
    description: "Perfect for puppies and new dog owners",
    image: "https://images.unsplash.com/photo-1620021029770-6fd5abff5197?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxkb2clMjBjcmF0ZSUyMHRyYWluaW5nJTIwcHVwcHl8ZW58MHx8fHwxNzcxMjg5ODMxfDA&ixlib=rb-4.1.0&q=85&w=800",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-300",
    tokenRange: "6-8 tokens",
    badge: "Beginner Learner"
  },
  intermediate: {
    name: "Intermediate",
    description: "Build on basics with more challenging skills",
    image: "https://images.unsplash.com/photo-1760615303236-e5923d66a450?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxwdXBweSUyMHRyYWluaW5nJTIwbGVhc2glMjB3YWxraW5nfGVufDB8fHx8MTc3MTI4OTgxOXww&ixlib=rb-4.1.0&q=85&w=800",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    tokenRange: "9-11 tokens",
    badge: "Skilled Trainer"
  },
  advanced: {
    name: "Advanced",
    description: "Complex skills for experienced trainers",
    image: "https://images.unsplash.com/photo-1771125652776-92069ae133c0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwyfHxkb2clMjBhZ2lsaXR5JTIwdHJhaW5pbmclMjBqdW1wfGVufDB8fHx8MTc3MTI4OTgyMHww&ixlib=rb-4.1.0&q=85&w=800",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    tokenRange: "12-15 tokens",
    badge: "Expert Handler"
  },
  expert: {
    name: "Expert",
    description: "Professional-level competition and working skills",
    image: "https://images.unsplash.com/photo-1544456948-c7ba22fe7111?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHw0fHxkb2clMjBhZ2lsaXR5JTIwdHJhaW5pbmclMjBqdW1wfGVufDB8fHx8MTc3MTI4OTgyMHww&ixlib=rb-4.1.0&q=85&w=800",
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    tokenRange: "14-15 tokens",
    badge: "Master Trainer"
  },
  security: {
    name: "K9 Security",
    description: "Elite protection and security training",
    image: "https://images.unsplash.com/photo-1743616288254-be688ab6d2b6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=800",
    color: "from-slate-700 to-zinc-800",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-400",
    tokenRange: "18-25 tokens",
    badge: "K9 Guardian"
  }
};

// Individual lesson images (mapped by lesson_id patterns)
export const LESSON_IMAGES = {
  // Beginner Obedience
  lesson_001: "https://images.unsplash.com/photo-1620021029770-6fd5abff5197?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxkb2clMjBjcmF0ZSUyMHRyYWluaW5nJTIwcHVwcHl8ZW58MHx8fHwxNzcxMjg5ODMxfDA&ixlib=rb-4.1.0&q=85&w=400",
  lesson_002: "https://images.unsplash.com/photo-1760970902911-972461fdecef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxkb2clMjB0cmFpbmluZyUyMG9iZWRpZW5jZSUyMHNpdHRpbmd8ZW58MHx8fHwxNzcxMjg5ODE4fDA&ixlib=rb-4.1.0&q=85&w=400",
  lesson_003: "https://images.unsplash.com/photo-1760615303236-e5923d66a450?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxwdXBweSUyMHRyYWluaW5nJTIwbGVhc2glMjB3YWxraW5nfGVufDB8fHx8MTc3MTI4OTgxOXww&ixlib=rb-4.1.0&q=85&w=400",
  lesson_004: "https://images.unsplash.com/photo-1758426156451-0d05400ecd8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwxfHxkb2clMjBzb2NpYWxpemF0aW9uJTIwcGxheWluZyUyMGRvZ3N8ZW58MHx8fHwxNzcxMjg5ODMwfDA&ixlib=rb-4.1.0&q=85&w=400",
  lesson_005: "https://images.unsplash.com/photo-1596739280237-f6370fa9850d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxkb2clMjBjcmF0ZSUyMHRyYWluaW5nJTIwcHVwcHl8ZW58MHx8fHwxNzcxMjg5ODMxfDA&ixlib=rb-4.1.0&q=85&w=400",
  lesson_006: "https://images.unsplash.com/photo-1755259779819-e8dc5d900872?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHw0fHxkb2clMjB0cmFpbmluZyUyMG9iZWRpZW5jZSUyMHNpdHRpbmd8ZW58MHx8fHwxNzcxMjg5ODE4fDA&ixlib=rb-4.1.0&q=85&w=400",
  lesson_009: "https://images.unsplash.com/photo-1597595735637-05a49627ee29?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwzfHxkb2clMjByZWNhbGwlMjBjb21lJTIwY29tbWFuZCUyMG91dGRvb3J8ZW58MHx8fHwxNzcxMjg5ODMxfDA&ixlib=rb-4.1.0&q=85&w=400",
  lesson_010: "https://images.unsplash.com/photo-1770836037793-95bdbf190f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxkb2clMjBoZWFsdGglMjB2ZXRlcmluYXJ5JTIwY2hlY2t1cHxlbnwwfHx8fDE3NzEyODk4Mjl8MA&ixlib=rb-4.1.0&q=85&w=400",
  lesson_019: "https://images.unsplash.com/photo-1741872237189-d72b2afbda6e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxkb2clMjB0cmlja3MlMjBiZWhhdmlvciUyMHRyYWluaW5nfGVufDB8fHx8MTc3MTI4OTgyMXww&ixlib=rb-4.1.0&q=85&w=400",
  // Intermediate
  lesson_022: "https://images.unsplash.com/photo-1766771730591-68d95774e239?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxkb2clMjByZWNhbGwlMjBjb21lJTIwY29tbWFuZCUyMG91dGRvb3J8ZW58MHx8fHwxNzcxMjg5ODMxfDA&ixlib=rb-4.1.0&q=85&w=400",
  lesson_023: "https://images.unsplash.com/photo-1760615303229-8b32553033a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxwdXBweSUyMHRyYWluaW5nJTIwbGVhc2glMjB3YWxraW5nfGVufDB8fHx8MTc3MTI4OTgxOXww&ixlib=rb-4.1.0&q=85&w=400",
  lesson_029: "https://images.unsplash.com/photo-1762062313553-03cc927933d4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwzfHxwdXBweSUyMHRyYWluaW5nJTIwbGVhc2glMjB3YWxraW5nfGVufDB8fHx8MTc3MTI4OTgxOXww&ixlib=rb-4.1.0&q=85&w=400",
  lesson_030: "https://images.unsplash.com/photo-1761583780233-a4b373102673?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjB0cmlja3MlMjBiZWhhdmlvciUyMHRyYWluaW5nfGVufDB8fHx8MTc3MTI4OTgyMXww&ixlib=rb-4.1.0&q=85&w=400",
  // Advanced/Agility
  lesson_042: "https://images.unsplash.com/photo-1544456948-c7ba22fe7111?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHw0fHxkb2clMjBhZ2lsaXR5JTIwdHJhaW5pbmclMjBqdW1wfGVufDB8fHx8MTc3MTI4OTgyMHww&ixlib=rb-4.1.0&q=85&w=400",
  lesson_046: "https://images.unsplash.com/photo-1771125652776-92069ae133c0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwyfHxkb2clMjBhZ2lsaXR5JTIwdHJhaW5pbmclMjBqdW1wfGVufDB8fHx8MTc3MTI4OTgyMHww&ixlib=rb-4.1.0&q=85&w=400",
  lesson_048: "https://images.unsplash.com/photo-1669822293673-d321743f7fe8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxkb2clMjB0cmlja3MlMjBiZWhhdmlvciUyMHRyYWluaW5nfGVufDB8fHx8MTc3MTI4OTgyMXww&ixlib=rb-4.1.0&q=85&w=400",
  // K9 Protection
  k9_001: "https://images.unsplash.com/photo-1669822308470-09f3f3e8d4a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=400",
  k9_002: "https://images.unsplash.com/photo-1570529987503-72542d17bcb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=400",
  k9_003: "https://images.unsplash.com/photo-1646589943478-79749a8b97a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHw0fHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=400",
  k9_010: "https://images.unsplash.com/photo-1743616288254-be688ab6d2b6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=400",
};

// Default image for lessons without specific images
export const getDefaultLessonImage = (category, level) => {
  const categoryVisual = CATEGORY_VISUALS[category];
  const levelVisual = LEVEL_VISUALS[level];
  return categoryVisual?.image || levelVisual?.image || CATEGORY_VISUALS.obedience.image;
};

// Get lesson image (specific or fallback to category)
export const getLessonImage = (lessonId, category, level) => {
  return LESSON_IMAGES[lessonId] || getDefaultLessonImage(category, level);
};

// Lesson Questionnaires - Pre-training assessments
export const LESSON_QUESTIONNAIRES = {
  // Beginner questionnaires
  beginner: {
    title: "Pre-Training Assessment",
    description: "Answer these questions to personalize your training experience",
    questions: [
      {
        id: "q1",
        question: "How old is your dog?",
        type: "single",
        options: [
          { value: "puppy", label: "Under 6 months (Puppy)", points: 1 },
          { value: "young", label: "6 months - 2 years (Young)", points: 2 },
          { value: "adult", label: "2-7 years (Adult)", points: 3 },
          { value: "senior", label: "7+ years (Senior)", points: 2 }
        ]
      },
      {
        id: "q2",
        question: "Has your dog had any previous training?",
        type: "single",
        options: [
          { value: "none", label: "No previous training", points: 1 },
          { value: "some", label: "Basic home training", points: 2 },
          { value: "formal", label: "Attended training classes", points: 3 }
        ]
      },
      {
        id: "q3",
        question: "What motivates your dog the most?",
        type: "single",
        options: [
          { value: "food", label: "Food/Treats", points: 3 },
          { value: "toys", label: "Toys/Play", points: 3 },
          { value: "praise", label: "Praise/Attention", points: 2 },
          { value: "mixed", label: "Combination", points: 3 }
        ]
      },
      {
        id: "q4",
        question: "How does your dog react to distractions?",
        type: "single",
        options: [
          { value: "easily", label: "Gets very distracted", points: 1 },
          { value: "moderate", label: "Sometimes distracted", points: 2 },
          { value: "focused", label: "Stays mostly focused", points: 3 }
        ]
      }
    ]
  },
  intermediate: {
    title: "Intermediate Assessment",
    description: "Let's check your dog's current skill level",
    questions: [
      {
        id: "q1",
        question: "Can your dog hold a 'sit' for 30 seconds?",
        type: "single",
        options: [
          { value: "no", label: "Not yet", points: 1 },
          { value: "sometimes", label: "Sometimes", points: 2 },
          { value: "yes", label: "Yes, reliably", points: 3 }
        ]
      },
      {
        id: "q2",
        question: "Does your dog come when called (recall)?",
        type: "single",
        options: [
          { value: "rarely", label: "Rarely or never", points: 1 },
          { value: "indoors", label: "Only indoors", points: 2 },
          { value: "mostly", label: "Most of the time", points: 3 }
        ]
      },
      {
        id: "q3",
        question: "How is your dog's leash manners?",
        type: "single",
        options: [
          { value: "pulls", label: "Pulls constantly", points: 1 },
          { value: "sometimes", label: "Pulls sometimes", points: 2 },
          { value: "good", label: "Walks nicely", points: 3 }
        ]
      },
      {
        id: "q4",
        question: "Can your dog perform basic tricks?",
        type: "multiple",
        options: [
          { value: "shake", label: "Shake/Paw", points: 1 },
          { value: "spin", label: "Spin", points: 1 },
          { value: "down", label: "Down on cue", points: 1 },
          { value: "stay", label: "Stay", points: 1 },
          { value: "none", label: "None yet", points: 0 }
        ]
      }
    ]
  },
  advanced: {
    title: "Advanced Readiness Check",
    description: "Ensure your dog is ready for advanced training",
    questions: [
      {
        id: "q1",
        question: "Can your dog hold position with distractions?",
        type: "single",
        options: [
          { value: "no", label: "Not reliably", points: 1 },
          { value: "mild", label: "With mild distractions", points: 2 },
          { value: "strong", label: "Even with strong distractions", points: 3 }
        ]
      },
      {
        id: "q2",
        question: "How is your dog's off-leash reliability?",
        type: "single",
        options: [
          { value: "none", label: "Never off-leash", points: 1 },
          { value: "fenced", label: "Only in fenced areas", points: 2 },
          { value: "reliable", label: "Reliable in most situations", points: 3 }
        ]
      },
      {
        id: "q3",
        question: "Has your dog competed or participated in any dog sports?",
        type: "single",
        options: [
          { value: "no", label: "Not yet", points: 1 },
          { value: "tried", label: "Tried once or twice", points: 2 },
          { value: "regular", label: "Regularly participates", points: 3 }
        ]
      },
      {
        id: "q4",
        question: "What advanced skills interest you?",
        type: "multiple",
        options: [
          { value: "agility", label: "Agility", points: 1 },
          { value: "scent", label: "Scent Work", points: 1 },
          { value: "tricks", label: "Advanced Tricks", points: 1 },
          { value: "sport", label: "Competitive Sports", points: 1 },
          { value: "working", label: "Working Dog Skills", points: 1 }
        ]
      }
    ]
  },
  security: {
    title: "K9 Protection Readiness",
    description: "Important assessment before starting protection training",
    questions: [
      {
        id: "q1",
        question: "Has your dog completed basic obedience training?",
        type: "single",
        options: [
          { value: "no", label: "Not yet - Complete basics first", points: 0 },
          { value: "some", label: "Partially completed", points: 1 },
          { value: "yes", label: "Yes, fully trained", points: 3 }
        ]
      },
      {
        id: "q2",
        question: "Does your dog have a stable temperament?",
        type: "single",
        options: [
          { value: "nervous", label: "Tends to be nervous/anxious", points: 0 },
          { value: "mixed", label: "Mostly stable with some triggers", points: 1 },
          { value: "stable", label: "Very stable and confident", points: 3 }
        ]
      },
      {
        id: "q3",
        question: "Why are you interested in protection training?",
        type: "single",
        options: [
          { value: "personal", label: "Personal/Family protection", points: 2 },
          { value: "property", label: "Property security", points: 2 },
          { value: "professional", label: "Professional K9 work", points: 3 },
          { value: "sport", label: "Protection sports", points: 2 }
        ]
      },
      {
        id: "q4",
        question: "Do you have access to professional K9 training guidance?",
        type: "single",
        options: [
          { value: "no", label: "No - Highly recommended", points: 0 },
          { value: "researching", label: "Currently researching", points: 1 },
          { value: "yes", label: "Yes, working with a trainer", points: 3 }
        ]
      }
    ]
  }
};

// Get questionnaire by level
export const getQuestionnaire = (level) => {
  return LESSON_QUESTIONNAIRES[level] || LESSON_QUESTIONNAIRES.beginner;
};

// Calculate questionnaire score and recommendation
export const calculateQuestionnaireResult = (answers, questionnaire) => {
  let totalPoints = 0;
  let maxPoints = 0;
  
  questionnaire.questions.forEach(q => {
    const maxOptionPoints = Math.max(...q.options.map(o => o.points));
    maxPoints += q.type === 'multiple' ? q.options.reduce((sum, o) => sum + o.points, 0) : maxOptionPoints;
    
    const answer = answers[q.id];
    if (answer) {
      if (q.type === 'multiple') {
        answer.forEach(val => {
          const opt = q.options.find(o => o.value === val);
          if (opt) totalPoints += opt.points;
        });
      } else {
        const opt = q.options.find(o => o.value === answer);
        if (opt) totalPoints += opt.points;
      }
    }
  });
  
  const percentage = Math.round((totalPoints / maxPoints) * 100);
  
  let recommendation;
  if (percentage >= 80) {
    recommendation = { level: "ready", message: "Excellent! You're ready to start this training.", color: "text-green-600" };
  } else if (percentage >= 50) {
    recommendation = { level: "proceed", message: "Good foundation! You can proceed with some extra attention to basics.", color: "text-blue-600" };
  } else {
    recommendation = { level: "prepare", message: "Consider strengthening basics first for better results.", color: "text-amber-600" };
  }
  
  return { totalPoints, maxPoints, percentage, recommendation };
};
