import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  GraduationCap,
  Clock,
  CheckCircle,
  ChevronRight,
  Play,
  Star,
  Lock,
  Award,
  Lightbulb,
  Coins,
  Zap
} from "lucide-react";

const levelColors = {
  beginner: { bg: 'bg-green-100', text: 'text-green-700', gradient: 'from-green-500 to-emerald-600' },
  intermediate: { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-500 to-indigo-600' },
  advanced: { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-500 to-pink-600' },
  expert: { bg: 'bg-orange-100', text: 'text-orange-700', gradient: 'from-orange-500 to-red-600' },
  security: { bg: 'bg-slate-100', text: 'text-slate-700', gradient: 'from-slate-700 to-zinc-800' }
};

const categoryIcons = {
  obedience: GraduationCap,
  behavior: Star,
  tricks: Award,
  agility: Play,
  health: Lightbulb,
  lifestyle: Clock,
  enrichment: Zap,
  working: GraduationCap,
  sport: Play,
  assistance: Star,
  k9_protection: Award
};

const TrainingContent = ({ user, selectedDog }) => {
  const [lessons, setLessons] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [tokens, setTokens] = useState(0);
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDog]);

  const fetchData = async () => {
    try {
      const [lessonsRes, tokensRes] = await Promise.all([
        axios.get(`${API}/training/lessons`, { withCredentials: true }),
        axios.get(`${API}/tokens/balance`, { withCredentials: true })
      ]);
      setLessons(lessonsRes.data);
      setTokens(tokensRes.data.tokens);
      
      if (selectedDog) {
        const enrollmentsRes = await axios.get(`${API}/training/enrollments/${selectedDog.dog_id}`, { withCredentials: true });
        setEnrollments(enrollmentsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const getEnrollment = (lessonId) => enrollments.find(e => e.lesson_id === lessonId);

  const enrollInLesson = async (lessonId) => {
    if (!selectedDog) {
      toast.error('Please select a dog first');
      return;
    }
    setEnrolling(true);
    try {
      await axios.post(`${API}/training/enroll/${lessonId}?dog_id=${selectedDog.dog_id}`, {}, { withCredentials: true });
      toast.success('Enrolled successfully!');
      fetchData();
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
        toast.success('Lesson completed! Achievement unlocked!');
      } else {
        toast.success('Step completed!');
      }
      fetchData();
      
      // Update selected lesson with new enrollment data
      if (selectedLesson) {
        const updatedEnrollment = await axios.get(`${API}/training/enrollments/${selectedDog.dog_id}`, { withCredentials: true });
        setEnrollments(updatedEnrollment.data);
      }
    } catch (error) {
      toast.error('Failed to complete step');
    } finally {
      setCompleting(false);
    }
  };

  // Filter lessons by level, excluding security (handled in K9Training)
  const filteredLessons = lessons.filter(l => l.level === activeLevel && l.level !== 'security');
  
  // Group by category
  const groupedLessons = filteredLessons.reduce((acc, lesson) => {
    if (!acc[lesson.category]) acc[lesson.category] = [];
    acc[lesson.category].push(lesson);
    return acc;
  }, {});

  // Stats
  const completedCount = enrollments.filter(e => e.status === 'completed').length;
  const inProgressCount = enrollments.filter(e => e.status === 'in_progress').length;
  const levelLessons = lessons.filter(l => l.level !== 'security');

  if (!selectedDog) {
    return (
      <div className="text-center py-16" data-testid="no-dog-message">
        <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-xl mb-2">No Dog Selected</h2>
        <p className="text-muted-foreground">Please add a dog from the dashboard to start training.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" data-testid="training-center">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
            Training Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Training {selectedDog.name} from basics to advanced skills
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-4">
          <Card className="bg-primary/10 border-0 rounded-xl">
            <CardContent className="p-4 text-center">
              <Coins className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{tokens}</p>
              <p className="text-xs text-muted-foreground">Tokens</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-0 rounded-xl">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-0 rounded-xl">
            <CardContent className="p-4 text-center">
              <Play className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Level Tabs */}
      <Tabs value={activeLevel} onValueChange={setActiveLevel} className="w-full">
        <TabsList className="bg-white rounded-full p-1 shadow-card w-full justify-start overflow-x-auto">
          <TabsTrigger value="beginner" className="rounded-full px-6 data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Beginner (6-8 tokens)
          </TabsTrigger>
          <TabsTrigger value="intermediate" className="rounded-full px-6 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Intermediate (9-11 tokens)
          </TabsTrigger>
          <TabsTrigger value="advanced" className="rounded-full px-6 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            Advanced (12-15 tokens)
          </TabsTrigger>
          <TabsTrigger value="expert" className="rounded-full px-6 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Expert (14-15 tokens)
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeLevel} className="mt-6">
          {Object.keys(groupedLessons).length === 0 ? (
            <Card className="bg-white rounded-2xl shadow-card p-8 text-center">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No lessons available for this level.</p>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedLessons).map(([category, categoryLessons]) => {
                const Icon = categoryIcons[category] || GraduationCap;
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`p-2 rounded-xl ${levelColors[activeLevel]?.bg || 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${levelColors[activeLevel]?.text || 'text-gray-600'}`} />
                      </div>
                      <h3 className="font-heading font-semibold text-lg capitalize">{category}</h3>
                      <Badge variant="outline" className="rounded-full ml-2">
                        {categoryLessons.length} lessons
                      </Badge>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryLessons.map((lesson) => {
                        const enrollment = getEnrollment(lesson.lesson_id);
                        const isCompleted = enrollment?.status === 'completed';
                        const isInProgress = enrollment?.status === 'in_progress';
                        const progress = enrollment ? 
                          Math.round((enrollment.completed_steps?.length / lesson.steps.length) * 100) : 0;
                        
                        return (
                          <Card
                            key={lesson.lesson_id}
                            className={`rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                              isCompleted ? 'bg-green-50 border-green-200' :
                              isInProgress ? 'bg-blue-50 border-blue-200' : 'bg-white'
                            }`}
                            onClick={() => setSelectedLesson(lesson)}
                            data-testid={`lesson-${lesson.lesson_id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm pr-2">{lesson.title}</h4>
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : isInProgress ? (
                                  <Play className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                ) : (
                                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {lesson.description}
                              </p>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs rounded-full">
                                  <Coins className="w-3 h-3 mr-1" />
                                  {lesson.token_cost}
                                </Badge>
                                <Badge variant="outline" className="text-xs rounded-full">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {lesson.duration_minutes}m
                                </Badge>
                              </div>
                              
                              {(isInProgress || isCompleted) && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-1.5 rounded-full" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Lesson Detail Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${levelColors[selectedLesson?.level]?.gradient || 'from-gray-500 to-gray-600'}`}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              {selectedLesson?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLesson && (() => {
            const enrollment = getEnrollment(selectedLesson.lesson_id);
            const isCompleted = enrollment?.status === 'completed';
            const isInProgress = enrollment?.status === 'in_progress';
            
            return (
              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground">{selectedLesson.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${levelColors[selectedLesson.level]?.bg} ${levelColors[selectedLesson.level]?.text} rounded-full capitalize`}>
                    {selectedLesson.level}
                  </Badge>
                  <Badge variant="outline" className="rounded-full capitalize">
                    {selectedLesson.category}
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700 rounded-full">
                    <Coins className="w-3 h-3 mr-1" />
                    {selectedLesson.token_cost} tokens
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedLesson.duration_minutes} min
                  </Badge>
                </div>

                {/* Training Steps */}
                <div>
                  <h4 className="font-medium mb-3">Training Steps:</h4>
                  <div className="space-y-2">
                    {selectedLesson.steps?.map((step, i) => {
                      const isStepCompleted = enrollment?.completed_steps?.includes(i);
                      const canComplete = isInProgress && !isStepCompleted && 
                        (i === 0 || enrollment?.completed_steps?.includes(i - 1));
                      
                      return (
                        <div 
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-lg ${
                            isStepCompleted ? 'bg-green-50' : canComplete ? 'bg-blue-50' : 'bg-gray-50'
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
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                              isStepCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isStepCompleted ? '✓' : i + 1}
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
                      Pro Tips
                    </h4>
                    <ul className="space-y-1">
                      {selectedLesson.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                          <span className="text-amber-500">•</span>
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
                      Completed
                    </Button>
                  ) : isInProgress ? (
                    <Button disabled className="flex-1 rounded-full bg-blue-600">
                      <Play className="w-4 h-4 mr-2" />
                      In Progress - Complete steps above
                    </Button>
                  ) : (
                    <Button
                      onClick={() => enrollInLesson(selectedLesson.lesson_id)}
                      disabled={enrolling || tokens < selectedLesson.token_cost}
                      className={`flex-1 rounded-full bg-gradient-to-r ${levelColors[selectedLesson.level]?.gradient || 'from-primary to-green-600'}`}
                    >
                      {enrolling ? (
                        'Enrolling...'
                      ) : tokens < selectedLesson.token_cost ? (
                        'Not enough tokens'
                      ) : (
                        <>
                          <Coins className="w-4 h-4 mr-2" />
                          Enroll ({selectedLesson.token_cost} tokens)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const TrainingCenter = ({ user }) => {
  return (
    <AppLayout user={user}>
      {({ selectedDog }) => (
        <TrainingContent user={user} selectedDog={selectedDog} />
      )}
    </AppLayout>
  );
};

export default TrainingCenter;
