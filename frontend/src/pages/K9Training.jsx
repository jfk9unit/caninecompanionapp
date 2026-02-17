import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Shield,
  Lock,
  Unlock,
  Star,
  Coins,
  Award,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Eye,
  Swords,
  Crown,
  Clock,
  Lightbulb,
  GraduationCap
} from "lucide-react";
import { LESSON_IMAGES, CATEGORY_VISUALS } from "@/data/trainingVisuals";
import { AudioTrainingGuide } from "@/components/AudioTrainingGuide";

// K9 Lesson Images
const K9_IMAGES = {
  k9_001: "https://images.unsplash.com/photo-1669822308470-09f3f3e8d4a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=400",
  k9_002: "https://images.unsplash.com/photo-1570529987503-72542d17bcb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=400",
  k9_003: "https://images.unsplash.com/photo-1646589943478-79749a8b97a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHw0fHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=400",
  k9_010: "https://images.unsplash.com/photo-1743616288254-be688ab6d2b6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=400",
  default: "https://images.unsplash.com/photo-1570529987503-72542d17bcb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=400"
};

const getK9Image = (lessonId) => K9_IMAGES[lessonId] || K9_IMAGES.default;

const K9_SKILL_TREE = [
  {
    tier: 1,
    name: "Foundation",
    description: "Essential security awareness skills",
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-300",
    image: "https://images.unsplash.com/photo-1669822308470-09f3f3e8d4a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=800",
    skills: [
      { id: "k9_001", name: "Alert & Watch", icon: Eye, required: [], description: "Teach alertness to unusual activity" },
      { id: "k9_002", name: "Perimeter Patrol", icon: Target, required: [], description: "Systematic boundary security" },
    ]
  },
  {
    tier: 2,
    name: "Intermediate",
    description: "Build on foundation with tactical skills",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    image: "https://images.unsplash.com/photo-1570529987503-72542d17bcb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=800",
    skills: [
      { id: "k9_003", name: "Controlled Intimidation", icon: AlertTriangle, required: ["k9_001"], description: "Defensive display without aggression" },
      { id: "k9_004", name: "Handler Protection", icon: Shield, required: ["k9_001", "k9_002"], description: "Position for handler defense" },
    ]
  },
  {
    tier: 3,
    name: "Advanced",
    description: "Complex tactical and assessment skills",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    image: "https://images.unsplash.com/photo-1646589943478-79749a8b97a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHw0fHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=800",
    skills: [
      { id: "k9_005", name: "Threat Assessment", icon: Eye, required: ["k9_003", "k9_004"], description: "Differentiate friend from foe" },
      { id: "k9_006", name: "Vehicle Security", icon: Shield, required: ["k9_004"], description: "Guard and secure vehicles" },
      { id: "k9_007", name: "Building Clearing", icon: Target, required: ["k9_005"], description: "Systematic room search" },
    ]
  },
  {
    tier: 4,
    name: "Expert",
    description: "High-level security operations",
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    image: "https://images.unsplash.com/photo-1743616288254-be688ab6d2b6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=800",
    skills: [
      { id: "k9_008", name: "Escort & Crowd Control", icon: Shield, required: ["k9_005"], description: "Navigate through crowds" },
      { id: "k9_009", name: "Night Operations", icon: Eye, required: ["k9_007"], description: "Low-light security work" },
      { id: "k9_010", name: "Controlled Apprehension", icon: Swords, required: ["k9_005", "k9_008"], description: "Controlled bite work basics" },
    ]
  },
  {
    tier: 5,
    name: "Master",
    description: "Elite protection certification",
    color: "from-yellow-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    image: "https://images.unsplash.com/photo-1570529987503-72542d17bcb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=800",
    skills: [
      { id: "k9_011", name: "Advanced Bite & Hold", icon: Swords, required: ["k9_010"], description: "Multiple grip positions" },
      { id: "k9_012", name: "Handler Protection Advanced", icon: Shield, required: ["k9_010", "k9_011"], description: "Multi-threat response" },
      { id: "k9_013", name: "Tactical Operations", icon: Target, required: ["k9_011", "k9_012"], description: "Team coordination skills" },
      { id: "k9_014", name: "Executive Protection", icon: Crown, required: ["k9_012"], description: "VIP and family protection" },
      { id: "k9_015", name: "Master Certification", icon: Award, required: ["k9_013", "k9_014"], description: "Full K9 protection certification" },
    ]
  }
];

// Tier Card Component with Image
const TierCard = ({ tier, isActive, onClick }) => {
  return (
    <Card 
      className={`group overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isActive ? `ring-2 ring-offset-2 ${tier.borderColor}` : ''
      }`}
      onClick={onClick}
      data-testid={`tier-${tier.tier}`}
    >
      <div className="relative h-28 overflow-hidden">
        <img 
          src={tier.image} 
          alt={tier.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${tier.color} opacity-80`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Badge className="bg-white/20 text-white border-0 mb-1 rounded-full text-xs">
              Tier {tier.tier}
            </Badge>
            <h3 className="font-heading font-bold text-lg">{tier.name}</h3>
          </div>
        </div>
      </div>
      <CardContent className="p-3 bg-white">
        <p className="text-xs text-muted-foreground line-clamp-2">{tier.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-medium">{tier.skills.length} skills</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

// Skill Card with Image
const SkillCard = ({ skill, tier, status, canUnlock, lesson, onClick }) => {
  const Icon = skill.icon;
  const skillImage = getK9Image(skill.id);
  
  return (
    <Card
      className={`group overflow-hidden rounded-xl transition-all cursor-pointer ${
        status === 'completed'
          ? 'ring-2 ring-green-400 bg-green-50/50'
          : status === 'in_progress'
          ? 'ring-2 ring-blue-400 bg-blue-50/50'
          : canUnlock
          ? 'hover:shadow-lg hover:scale-[1.02]'
          : 'opacity-60'
      }`}
      onClick={() => lesson && (canUnlock || status !== 'locked') && onClick()}
      data-testid={`skill-${skill.id}`}
    >
      {/* Skill Image */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={skillImage} 
          alt={skill.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            canUnlock || status !== 'locked' ? 'group-hover:scale-105' : 'grayscale'
          }`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${tier.color} ${
          status === 'locked' && !canUnlock ? 'opacity-90' : 'opacity-60'
        }`} />
        
        {/* Status Icon */}
        <div className="absolute top-2 right-2">
          {status === 'completed' ? (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          ) : status === 'in_progress' ? (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          ) : canUnlock ? (
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Unlock className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`p-3 rounded-full ${
            status === 'locked' && !canUnlock 
              ? 'bg-black/30' 
              : 'bg-white/20 backdrop-blur-sm'
          }`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-3">
        <h4 className="font-medium text-sm">{skill.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{skill.description}</p>
        
        {lesson && (
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-amber-100 text-amber-700 rounded-full text-xs">
              <Coins className="w-3 h-3 mr-1" />
              {lesson.token_cost}
            </Badge>
            <Badge variant="outline" className="rounded-full text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {lesson.duration_minutes}m
            </Badge>
          </div>
        )}
        
        {/* Prerequisites */}
        {skill.required.length > 0 && status === 'locked' && !canUnlock && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-red-500 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Complete prerequisites first
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const K9Training = ({ user }) => {
  const [lessons, setLessons] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [selectedDog, setSelectedDog] = useState(null);
  const [activeTier, setActiveTier] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lessonsRes, enrollmentsRes, tokensRes, dogsRes] = await Promise.all([
        axios.get(`${API}/training/lessons?level=security`, { withCredentials: true }),
        axios.get(`${API}/training/enrollments/${localStorage.getItem('selectedDogId') || ''}`, { withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/tokens/balance`, { withCredentials: true }),
        axios.get(`${API}/dogs`, { withCredentials: true })
      ]);
      setLessons(lessonsRes.data);
      setEnrollments(enrollmentsRes.data);
      setTokens(tokensRes.data.tokens);
      if (dogsRes.data.length > 0) {
        const dogId = localStorage.getItem('selectedDogId') || dogsRes.data[0].dog_id;
        setSelectedDog(dogsRes.data.find(d => d.dog_id === dogId) || dogsRes.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch K9 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillStatus = (skillId) => {
    const enrollment = enrollments.find(e => e.lesson_id === skillId);
    if (enrollment?.status === 'completed') return 'completed';
    if (enrollment) return 'in_progress';
    return 'locked';
  };

  const canUnlockSkill = (skill) => {
    if (skill.required.length === 0) return true;
    return skill.required.every(reqId => getSkillStatus(reqId) === 'completed');
  };

  const getLesson = (skillId) => lessons.find(l => l.lesson_id === skillId);
  const getEnrollment = (skillId) => enrollments.find(e => e.lesson_id === skillId);

  const enrollInLesson = async (lessonId) => {
    if (!selectedDog) {
      toast.error('Please add a dog first');
      return;
    }
    
    setEnrolling(true);
    try {
      await axios.post(`${API}/training/enroll/${lessonId}?dog_id=${selectedDog.dog_id}`, {}, { withCredentials: true });
      toast.success('Enrolled in K9 training!');
      fetchData();
      setSelectedLesson(null);
      setSelectedSkill(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const completeStep = async (enrollmentId, stepIndex) => {
    setCompleting(true);
    try {
      const response = await axios.post(`${API}/training/complete-step`, {
        enrollment_id: enrollmentId,
        step_index: stepIndex
      }, { withCredentials: true });
      
      if (response.data.completed) {
        toast.success('Skill mastered! Great work!');
      } else {
        toast.success('Step completed!');
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to complete step');
    } finally {
      setCompleting(false);
    }
  };

  const completedCount = enrollments.filter(e => e.status === 'completed' && e.lesson_id?.startsWith('k9_')).length;
  const totalK9Lessons = lessons.length;
  const progressPercent = totalK9Lessons > 0 ? (completedCount / totalK9Lessons) * 100 : 0;

  const getCurrentTier = () => {
    if (completedCount >= 15) return 5;
    if (completedCount >= 10) return 4;
    if (completedCount >= 6) return 3;
    if (completedCount >= 3) return 2;
    if (completedCount >= 1) return 1;
    return 0;
  };

  const tierNames = ["Recruit", "Guardian Initiate", "Shield Bearer", "Threat Analyst", "Elite Protector", "K9 Master"];
  const activeTierData = K9_SKILL_TREE.find(t => t.tier === activeTier);

  if (loading) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-6 animate-fade-in" data-testid="k9-training-page">
          {/* Hero Header with Image */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1743616288254-be688ab6d2b6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHxwcm90ZWN0aW9uJTIwZG9nJTIwc2VjdXJpdHklMjBLOXxlbnwwfHx8fDE3NzEyODk4MjJ8MA&ixlib=rb-4.1.0&q=85&w=1200"
                alt="K9 Protection Training"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/80" />
            </div>
            
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-white">
                    <h1 className="font-heading font-bold text-2xl sm:text-3xl">K9 Protection Training</h1>
                    <p className="text-white/60 mt-1">Master elite security and protection skills</p>
                  </div>
                </div>
                
                <div className="lg:ml-auto flex flex-wrap items-center gap-3">
                  <Card className="bg-white/10 border-0 backdrop-blur-sm rounded-xl">
                    <CardContent className="p-3 text-white text-center">
                      <Coins className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                      <p className="text-xl font-bold">{tokens}</p>
                      <p className="text-xs text-white/60">Tokens</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 border-0 backdrop-blur-sm rounded-xl">
                    <CardContent className="p-3 text-white text-center">
                      <Award className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                      <p className="text-xl font-bold">{completedCount}/{totalK9Lessons}</p>
                      <p className="text-xs text-white/60">Completed</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 border-0 backdrop-blur-sm rounded-xl">
                    <CardContent className="p-3 text-white text-center">
                      <Star className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                      <p className="text-xl font-bold">Tier {getCurrentTier() || 0}</p>
                      <p className="text-xs text-white/60">Current</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Rank Progress */}
              <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full px-3">
                    <Crown className="w-3 h-3 mr-1" />
                    {tierNames[getCurrentTier()]}
                  </Badge>
                  <span className="text-white/60 text-sm">
                    {getCurrentTier() < 5 ? `Next: ${tierNames[getCurrentTier() + 1]}` : 'Max Rank!'}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 rounded-xl">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-800">Professional Training Recommended</p>
                <p className="text-sm text-amber-700 mt-1">
                  K9 protection training involves advanced techniques. Work with a certified professional trainer for hands-on guidance, especially for bite work and tactical operations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tier Selection */}
          <div>
            <h2 className="font-heading font-semibold text-lg mb-4">Select Training Tier</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {K9_SKILL_TREE.map((tier) => (
                <TierCard 
                  key={tier.tier}
                  tier={tier}
                  isActive={activeTier === tier.tier}
                  onClick={() => setActiveTier(tier.tier)}
                />
              ))}
            </div>
          </div>

          {/* Active Tier Skills */}
          {activeTierData && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${activeTierData.color} text-white font-semibold`}>
                  Tier {activeTierData.tier}: {activeTierData.name}
                </div>
                <Badge variant="outline" className="rounded-full">
                  {activeTierData.skills.length} skills
                </Badge>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTierData.skills.map((skill) => {
                  const status = getSkillStatus(skill.id);
                  const canUnlock = canUnlockSkill(skill);
                  const lesson = getLesson(skill.id);
                  
                  return (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      tier={activeTierData}
                      status={status}
                      canUnlock={canUnlock}
                      lesson={lesson}
                      onClick={() => {
                        setSelectedSkill(skill);
                        setSelectedLesson(lesson);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Lesson Detail Dialog */}
          <Dialog open={!!selectedLesson} onOpenChange={() => { setSelectedLesson(null); setSelectedSkill(null); }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              {selectedLesson && selectedSkill && (() => {
                const enrollment = getEnrollment(selectedLesson.lesson_id);
                const isCompleted = enrollment?.status === 'completed';
                const isInProgress = enrollment?.status === 'in_progress';
                const skillImage = getK9Image(selectedSkill.id);
                const tier = K9_SKILL_TREE.find(t => t.skills.some(s => s.id === selectedSkill.id));
                
                return (
                  <>
                    {/* Skill Image Header */}
                    <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={skillImage}
                        alt={selectedLesson.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${tier?.color || 'from-slate-700 to-zinc-800'} opacity-75`} />
                      <div className="absolute bottom-4 left-6 right-6 text-white">
                        <Badge className="bg-white/20 text-white border-0 mb-2 rounded-full">
                          Tier {tier?.tier}: {tier?.name}
                        </Badge>
                        <h2 className="font-heading font-bold text-xl">{selectedLesson.title}</h2>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-muted-foreground">{selectedLesson.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-amber-100 text-amber-700 rounded-full">
                          <Coins className="w-3 h-3 mr-1" />
                          {selectedLesson.token_cost} tokens
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          <Clock className="w-3 h-3 mr-1" />
                          {selectedLesson.duration_minutes} minutes
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          Difficulty: {selectedLesson.difficulty}/10
                        </Badge>
                      </div>

                      {selectedLesson.badge_reward && (
                        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 rounded-xl">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-full bg-purple-100">
                              <Award className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-purple-800">Badge Reward</p>
                              <p className="text-xs text-purple-600">{selectedLesson.badge_reward}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Video Tutorial Section - K9 Training */}
                      <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200 rounded-xl overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-full bg-red-100">
                              <Video className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-red-800">K9 Training Video</h4>
                              <p className="text-xs text-red-600">{selectedLesson.title} • Expert Demo</p>
                            </div>
                          </div>
                          <MiniVideoPlayer
                            videoUrl={getVideoUrl(selectedLesson.lesson_id)}
                            title={selectedLesson.title}
                            thumbnail={skillImage}
                          />
                          <p className="text-xs text-red-600 mt-2">Professional K9 training demonstration. Always work with a certified trainer!</p>
                        </CardContent>
                      </Card>

                      {/* Training Steps */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-slate-600" />
                          Training Steps
                        </h4>
                        <div className="space-y-2">
                          {selectedLesson.steps?.map((step, i) => {
                            const isStepCompleted = enrollment?.completed_steps?.includes(i);
                            const canComplete = isInProgress && !isStepCompleted && 
                              (i === 0 || enrollment?.completed_steps?.includes(i - 1));
                            
                            return (
                              <div 
                                key={i}
                                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                  isStepCompleted ? 'bg-green-100' : canComplete ? 'bg-blue-100' : 'bg-white'
                                }`}
                              >
                                {isInProgress && !isCompleted ? (
                                  <Checkbox
                                    checked={isStepCompleted}
                                    disabled={!canComplete || completing}
                                    onCheckedChange={() => completeStep(enrollment.enrollment_id, i)}
                                    className="mt-0.5"
                                  />
                                ) : (
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                                    isStepCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {isStepCompleted ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                  </span>
                                )}
                                <span className={`text-sm ${isStepCompleted ? 'text-green-700' : ''}`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tips */}
                      {selectedLesson.tips?.length > 0 && (
                        <div className="bg-amber-50 rounded-xl p-4">
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            Expert Tips
                          </h4>
                          <ul className="space-y-1">
                            {selectedLesson.tips.map((tip, i) => (
                              <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                                <Star className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        {isCompleted ? (
                          <Button disabled className="flex-1 rounded-full bg-green-600">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Skill Mastered
                          </Button>
                        ) : isInProgress ? (
                          <Button disabled className="flex-1 rounded-full bg-blue-600">
                            <Zap className="w-4 h-4 mr-2" />
                            In Progress
                          </Button>
                        ) : (
                          <Button
                            onClick={() => enrollInLesson(selectedLesson.lesson_id)}
                            disabled={enrolling || tokens < selectedLesson.token_cost}
                            className={`flex-1 rounded-full bg-gradient-to-r ${tier?.color || 'from-slate-700 to-zinc-800'}`}
                          >
                            {enrolling ? (
                              'Enrolling...'
                            ) : tokens < selectedLesson.token_cost ? (
                              'Not enough tokens'
                            ) : (
                              <>
                                <Unlock className="w-4 h-4 mr-2" />
                                Unlock ({selectedLesson.token_cost} tokens)
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </AppLayout>
  );
};

export default K9Training;
