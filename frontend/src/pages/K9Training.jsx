import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Crown
} from "lucide-react";

const K9_SKILL_TREE = [
  {
    tier: 1,
    name: "Foundation",
    color: "from-slate-500 to-slate-600",
    skills: [
      { id: "k9_001", name: "Alert & Watch", icon: Eye, required: [] },
      { id: "k9_002", name: "Perimeter Patrol", icon: Target, required: [] },
    ]
  },
  {
    tier: 2,
    name: "Intermediate",
    color: "from-blue-500 to-blue-600",
    skills: [
      { id: "k9_003", name: "Controlled Intimidation", icon: AlertTriangle, required: ["k9_001"] },
      { id: "k9_004", name: "Handler Protection", icon: Shield, required: ["k9_001", "k9_002"] },
    ]
  },
  {
    tier: 3,
    name: "Advanced",
    color: "from-purple-500 to-purple-600",
    skills: [
      { id: "k9_005", name: "Threat Assessment", icon: Eye, required: ["k9_003", "k9_004"] },
      { id: "k9_006", name: "Vehicle Security", icon: Shield, required: ["k9_004"] },
      { id: "k9_007", name: "Building Clearing", icon: Target, required: ["k9_005"] },
    ]
  },
  {
    tier: 4,
    name: "Expert",
    color: "from-orange-500 to-red-600",
    skills: [
      { id: "k9_008", name: "Escort & Crowd Control", icon: Shield, required: ["k9_005"] },
      { id: "k9_009", name: "Night Operations", icon: Eye, required: ["k9_007"] },
      { id: "k9_010", name: "Controlled Apprehension", icon: Swords, required: ["k9_005", "k9_008"] },
    ]
  },
  {
    tier: 5,
    name: "Master",
    color: "from-yellow-500 to-amber-600",
    skills: [
      { id: "k9_011", name: "Advanced Bite & Hold", icon: Swords, required: ["k9_010"] },
      { id: "k9_012", name: "Handler Protection Advanced", icon: Shield, required: ["k9_010", "k9_011"] },
      { id: "k9_013", name: "Tactical Operations", icon: Target, required: ["k9_011", "k9_012"] },
      { id: "k9_014", name: "Executive Protection", icon: Crown, required: ["k9_012"] },
      { id: "k9_015", name: "Master Certification", icon: Award, required: ["k9_013", "k9_014"] },
    ]
  }
];

export const K9Training = ({ user }) => {
  const [lessons, setLessons] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedDog, setSelectedDog] = useState(null);

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
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const completedCount = enrollments.filter(e => e.status === 'completed' && e.lesson_id?.startsWith('k9_')).length;
  const totalK9Lessons = lessons.length;
  const progressPercent = totalK9Lessons > 0 ? (completedCount / totalK9Lessons) * 100 : 0;

  // Get current tier based on completed lessons
  const getCurrentTier = () => {
    if (completedCount >= 15) return 5;
    if (completedCount >= 10) return 4;
    if (completedCount >= 6) return 3;
    if (completedCount >= 3) return 2;
    if (completedCount >= 1) return 1;
    return 0;
  };

  const tierNames = ["Recruit", "Guardian Initiate", "Shield Bearer", "Threat Analyst", "Elite Protector", "K9 Master"];

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
        <div className="space-y-8 animate-fade-in" data-testid="k9-training-page">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-white">
                    <h1 className="font-heading font-bold text-2xl sm:text-3xl">K9 Protection Training</h1>
                    <p className="text-white/60 mt-1">Master security and protection skills</p>
                  </div>
                </div>
                
                <div className="lg:ml-auto flex items-center gap-4">
                  <Card className="bg-white/10 border-0 rounded-xl">
                    <CardContent className="p-4 text-white text-center">
                      <Coins className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                      <p className="text-2xl font-bold">{tokens}</p>
                      <p className="text-xs text-white/60">Tokens</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 border-0 rounded-xl">
                    <CardContent className="p-4 text-white text-center">
                      <Award className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                      <p className="text-2xl font-bold">{completedCount}/{totalK9Lessons}</p>
                      <p className="text-xs text-white/60">Completed</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Rank Progress */}
              <div className="mt-6 bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500 text-white rounded-full px-3">
                      <Star className="w-3 h-3 mr-1" />
                      {tierNames[getCurrentTier()]}
                    </Badge>
                  </div>
                  <span className="text-white/60 text-sm">
                    {getCurrentTier() < 5 ? `Next: ${tierNames[getCurrentTier() + 1]}` : 'Max Rank Achieved!'}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <Card className="bg-amber-50 border-amber-200 rounded-xl">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Professional Training Recommended</p>
                <p className="text-sm text-amber-700">
                  K9 protection training involves advanced techniques. We recommend working with a certified professional trainer for hands-on guidance, especially for bite work and tactical operations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skill Tree */}
          <div className="space-y-6">
            <h2 className="font-heading font-semibold text-xl">Skill Tree</h2>
            
            {K9_SKILL_TREE.map((tier, tierIndex) => (
              <div key={tier.tier} className="relative">
                {/* Tier Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${tier.color} text-white font-semibold text-sm`}>
                    Tier {tier.tier}: {tier.name}
                  </div>
                  {tierIndex > 0 && (
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent" />
                  )}
                </div>

                {/* Skills Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                  {tier.skills.map((skill) => {
                    const status = getSkillStatus(skill.id);
                    const canUnlock = canUnlockSkill(skill);
                    const lesson = getLesson(skill.id);
                    const Icon = skill.icon;

                    return (
                      <Card
                        key={skill.id}
                        className={`rounded-xl transition-all cursor-pointer ${
                          status === 'completed'
                            ? 'bg-green-50 border-green-300 shadow-green-100'
                            : status === 'in_progress'
                            ? 'bg-blue-50 border-blue-300 shadow-blue-100'
                            : canUnlock
                            ? 'bg-white hover:shadow-lg hover:scale-[1.02] border-gray-200'
                            : 'bg-gray-100 border-gray-200 opacity-60'
                        }`}
                        onClick={() => lesson && (canUnlock || status !== 'locked') && setSelectedLesson(lesson)}
                        data-testid={`skill-${skill.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl ${
                              status === 'completed'
                                ? 'bg-green-200'
                                : status === 'in_progress'
                                ? 'bg-blue-200'
                                : canUnlock
                                ? `bg-gradient-to-br ${tier.color}`
                                : 'bg-gray-300'
                            }`}>
                              {status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-700" />
                              ) : status === 'in_progress' ? (
                                <Zap className="w-5 h-5 text-blue-700" />
                              ) : canUnlock ? (
                                <Icon className="w-5 h-5 text-white" />
                              ) : (
                                <Lock className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{skill.name}</h4>
                              {lesson && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs rounded-full">
                                    <Coins className="w-3 h-3 mr-1" />
                                    {lesson.token_cost}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs rounded-full">
                                    {lesson.duration_minutes}m
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {(canUnlock || status !== 'locked') && (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          
                          {/* Prerequisites */}
                          {skill.required.length > 0 && status === 'locked' && !canUnlock && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                Requires: {skill.required.map(r => {
                                  const reqSkill = K9_SKILL_TREE.flatMap(t => t.skills).find(s => s.id === r);
                                  return reqSkill?.name;
                                }).join(', ')}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Lesson Detail Dialog */}
          <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-slate-700 to-zinc-800 rounded-xl">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  {selectedLesson?.title}
                </DialogTitle>
              </DialogHeader>
              
              {selectedLesson && (
                <div className="space-y-4 mt-4">
                  <p className="text-muted-foreground">{selectedLesson.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-amber-100 text-amber-700 rounded-full">
                      <Coins className="w-3 h-3 mr-1" />
                      {selectedLesson.token_cost} tokens
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {selectedLesson.duration_minutes} minutes
                    </Badge>
                    <Badge variant="outline" className="rounded-full capitalize">
                      Difficulty: {selectedLesson.difficulty}/10
                    </Badge>
                  </div>

                  {selectedLesson.badge_reward && (
                    <Card className="bg-purple-50 border-purple-200 rounded-xl">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Award className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-purple-800">Badge Reward</p>
                          <p className="text-xs text-purple-600">{selectedLesson.badge_reward}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Training Steps:</h4>
                    <ol className="space-y-2">
                      {selectedLesson.steps?.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {getSkillStatus(selectedLesson.lesson_id) === 'completed' ? (
                      <Button disabled className="flex-1 rounded-full bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </Button>
                    ) : getSkillStatus(selectedLesson.lesson_id) === 'in_progress' ? (
                      <Button 
                        onClick={() => window.location.href = '/training'}
                        className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Continue Training
                      </Button>
                    ) : (
                      <Button
                        onClick={() => enrollInLesson(selectedLesson.lesson_id)}
                        disabled={enrolling || tokens < selectedLesson.token_cost}
                        className="flex-1 rounded-full bg-gradient-to-r from-slate-700 to-zinc-800 hover:from-slate-600 hover:to-zinc-700"
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
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </AppLayout>
  );
};

export default K9Training;
