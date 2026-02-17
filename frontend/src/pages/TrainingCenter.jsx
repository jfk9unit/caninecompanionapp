import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  Zap,
  Share2,
  Gift,
  Trophy,
  Sparkles,
  Heart,
  Brain,
  MapPin,
  Briefcase,
  Shield,
  ArrowRight,
  ClipboardList,
  Image as ImageIcon,
  Video,
  PlayCircle
} from "lucide-react";
import { InteractiveStep, LessonCompletionModal, ProgressShareCard, celebrate } from "@/components/InteractiveTraining";
import { 
  CATEGORY_VISUALS, 
  LEVEL_VISUALS, 
  getLessonImage,
  getQuestionnaire,
  calculateQuestionnaireResult,
  getLessonVideo
} from "@/data/trainingVisuals";
import { AudioTrainingGuide } from "@/components/AudioTrainingGuide";

const levelColors = {
  beginner: { bg: 'bg-green-100', text: 'text-green-700', gradient: 'from-green-500 to-emerald-600' },
  intermediate: { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-500 to-indigo-600' },
  advanced: { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-500 to-pink-600' },
  expert: { bg: 'bg-orange-100', text: 'text-orange-700', gradient: 'from-orange-500 to-red-600' },
  security: { bg: 'bg-slate-100', text: 'text-slate-700', gradient: 'from-slate-700 to-zinc-800' }
};

// Icon mapping
const iconMap = {
  GraduationCap, Heart, Sparkles, Zap, Brain, MapPin, Briefcase, Trophy, Shield, Star, Award
};

const getCategoryIcon = (category) => {
  const visual = CATEGORY_VISUALS[category];
  if (visual?.icon && iconMap[visual.icon]) {
    return iconMap[visual.icon];
  }
  return GraduationCap;
};

// Level Header Card Component
const LevelHeaderCard = ({ level, stats }) => {
  const levelVisual = LEVEL_VISUALS[level];
  if (!levelVisual) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={levelVisual.image} 
          alt={levelVisual.name}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${levelVisual.color} opacity-85`} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 text-white">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <Badge className="bg-white/20 text-white border-0 mb-2 rounded-full">
              {levelVisual.tokenRange}
            </Badge>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl">{levelVisual.name} Level</h2>
            <p className="text-white/80 mt-1">{levelVisual.description}</p>
          </div>
          
          <div className="flex gap-3">
            <Card className="bg-white/15 border-0 backdrop-blur-sm rounded-xl">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-white/90" />
                <p className="text-xl font-bold">{stats.completed}</p>
                <p className="text-xs text-white/70">Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 border-0 backdrop-blur-sm rounded-xl">
              <CardContent className="p-4 text-center">
                <Play className="w-5 h-5 mx-auto mb-1 text-white/90" />
                <p className="text-xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-white/70">In Progress</p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 border-0 backdrop-blur-sm rounded-xl">
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-5 h-5 mx-auto mb-1 text-white/90" />
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-white/70">Total</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, lessons, onSelectCategory }) => {
  const visual = CATEGORY_VISUALS[category] || CATEGORY_VISUALS.obedience;
  const Icon = getCategoryIcon(category);
  
  return (
    <Card 
      className={`group overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${visual.borderColor} border-2`}
      onClick={() => onSelectCategory(category)}
      data-testid={`category-${category}`}
    >
      <div className="relative h-32 overflow-hidden">
        <img 
          src={visual.image} 
          alt={visual.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${visual.color} opacity-70`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`p-3 rounded-full bg-white/20 backdrop-blur-sm`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
        <Badge className="absolute top-2 right-2 bg-white/90 text-gray-800 rounded-full">
          {lessons.length} lessons
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className={`font-heading font-semibold ${visual.textColor}`}>{visual.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{visual.description}</p>
        <div className="flex items-center mt-3 text-sm text-muted-foreground">
          <span>View lessons</span>
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
};

// Lesson Card with Image
const LessonCard = ({ lesson, enrollment, onClick, categoryVisual }) => {
  const isCompleted = enrollment?.status === 'completed';
  const isInProgress = enrollment?.status === 'in_progress';
  const progress = enrollment ? Math.round((enrollment.completed_steps?.length / lesson.steps.length) * 100) : 0;
  const lessonImage = getLessonImage(lesson.lesson_id, lesson.category, lesson.level);
  
  return (
    <Card
      className={`group overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
        isCompleted ? 'ring-2 ring-green-400 bg-green-50/50' :
        isInProgress ? 'ring-2 ring-blue-400 bg-blue-50/50' : 'bg-white'
      }`}
      onClick={onClick}
      data-testid={`lesson-${lesson.lesson_id}`}
    >
      {/* Lesson Image */}
      <div className="relative h-36 overflow-hidden">
        <img 
          src={lessonImage} 
          alt={lesson.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent`} />
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {isCompleted ? (
            <Badge className="bg-green-500 text-white rounded-full gap-1">
              <CheckCircle className="w-3 h-3" />
              Completed
            </Badge>
          ) : isInProgress ? (
            <Badge className="bg-blue-500 text-white rounded-full gap-1">
              <Play className="w-3 h-3" />
              In Progress
            </Badge>
          ) : (
            <Badge className="bg-white/90 text-gray-700 rounded-full gap-1">
              <Lock className="w-3 h-3" />
              Locked
            </Badge>
          )}
        </div>
        
        {/* Token & Duration */}
        <div className="absolute bottom-2 left-2 flex gap-2">
          <Badge className="bg-amber-500 text-white rounded-full text-xs">
            <Coins className="w-3 h-3 mr-1" />
            {lesson.token_cost}
          </Badge>
          <Badge className="bg-white/90 text-gray-700 rounded-full text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {lesson.duration_minutes}m
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-medium text-sm line-clamp-1">{lesson.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{lesson.description}</p>
        
        {/* Progress Bar */}
        {(isInProgress || isCompleted) && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className={isCompleted ? 'text-green-600 font-medium' : 'text-blue-600'}>{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className={`h-2 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}
            />
          </div>
        )}
        
        {/* Difficulty Indicator */}
        <div className="flex items-center gap-1 mt-3">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full ${
                i < Math.ceil(lesson.difficulty / 2) 
                  ? `bg-gradient-to-r ${categoryVisual?.color || 'from-gray-400 to-gray-500'}` 
                  : 'bg-gray-200'
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">Difficulty</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Questionnaire Modal Component
const QuestionnaireModal = ({ isOpen, onClose, level, onComplete }) => {
  const questionnaire = getQuestionnaire(level);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleAnswer = (questionId, value, isMultiple) => {
    if (isMultiple) {
      const current = answers[questionId] || [];
      if (current.includes(value)) {
        setAnswers({ ...answers, [questionId]: current.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [questionId]: [...current, value] });
      }
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };
  
  const handleNext = () => {
    if (currentQuestion < questionnaire.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate result
      const calcResult = calculateQuestionnaireResult(answers, questionnaire);
      setResult(calcResult);
      setShowResult(true);
    }
  };
  
  const handleComplete = () => {
    onComplete(result);
    onClose();
    setAnswers({});
    setCurrentQuestion(0);
    setShowResult(false);
    setResult(null);
  };
  
  const currentQ = questionnaire.questions[currentQuestion];
  const isAnswered = currentQ?.type === 'multiple' 
    ? (answers[currentQ.id]?.length > 0) 
    : !!answers[currentQ?.id];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {questionnaire.title}
          </DialogTitle>
          <DialogDescription>{questionnaire.description}</DialogDescription>
        </DialogHeader>
        
        {!showResult ? (
          <div className="py-4">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Question {currentQuestion + 1} of {questionnaire.questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questionnaire.questions.length) * 100)}%</span>
              </div>
              <Progress value={((currentQuestion + 1) / questionnaire.questions.length) * 100} className="h-2" />
            </div>
            
            {/* Question */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">{currentQ.question}</h3>
              
              {currentQ.type === 'single' ? (
                <RadioGroup
                  value={answers[currentQ.id] || ''}
                  onValueChange={(value) => handleAnswer(currentQ.id, value, false)}
                  className="space-y-3"
                >
                  {currentQ.options.map((option) => (
                    <div 
                      key={option.value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        answers[currentQ.id] === option.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAnswer(currentQ.id, option.value, false)}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {currentQ.options.map((option) => {
                    const isSelected = (answers[currentQ.id] || []).includes(option.value);
                    return (
                      <div 
                        key={option.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAnswer(currentQ.id, option.value, true)}
                      >
                        <Checkbox checked={isSelected} />
                        <Label className="flex-1 cursor-pointer">{option.label}</Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!isAnswered}
                className="rounded-full"
              >
                {currentQuestion === questionnaire.questions.length - 1 ? 'See Results' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            {/* Result Display */}
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              result.percentage >= 80 ? 'bg-green-100' : 
              result.percentage >= 50 ? 'bg-blue-100' : 'bg-amber-100'
            }`}>
              <span className={`text-2xl font-bold ${
                result.percentage >= 80 ? 'text-green-600' : 
                result.percentage >= 50 ? 'text-blue-600' : 'text-amber-600'
              }`}>{result.percentage}%</span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">Assessment Complete!</h3>
            <p className={`${result.recommendation.color} font-medium mb-4`}>
              {result.recommendation.message}
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Score: <span className="font-medium text-foreground">{result.totalPoints}</span> / {result.maxPoints} points
              </p>
            </div>
            
            <Button onClick={handleComplete} className="rounded-full">
              Start Training
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const TrainingContent = ({ user, selectedDog }) => {
  const [lessons, setLessons] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [tokens, setTokens] = useState(0);
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedLesson, setCompletedLesson] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [viewMode, setViewMode] = useState('categories'); // 'categories' or 'lessons'

  useEffect(() => {
    fetchData();
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
        celebrate();
        setCompletedLesson(selectedLesson);
        setShowCompletion(true);
        setSelectedLesson(null);
      } else {
        toast.success('Great job! Step completed!');
      }
      fetchData();
      
      if (selectedDog) {
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
  
  // Get lessons for selected category
  const categoryLessons = selectedCategory ? groupedLessons[selectedCategory] || [] : [];
  
  // Stats
  const levelEnrollments = enrollments.filter(e => {
    const lesson = lessons.find(l => l.lesson_id === e.lesson_id);
    return lesson?.level === activeLevel;
  });
  const levelStats = {
    completed: levelEnrollments.filter(e => e.status === 'completed').length,
    inProgress: levelEnrollments.filter(e => e.status === 'in_progress').length,
    total: filteredLessons.length
  };

  if (!selectedDog) {
    return (
      <div className="text-center py-16" data-testid="no-dog-message">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-green-500/20 flex items-center justify-center mb-6">
          <GraduationCap className="w-12 h-12 text-primary" />
        </div>
        <h2 className="font-heading font-semibold text-xl mb-2">No Dog Selected</h2>
        <p className="text-muted-foreground">Please add a dog from the dashboard to start training.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="training-center">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
            Training Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Training {selectedDog.name} from basics to advanced skills
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-3">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-xl">
            <CardContent className="p-3 text-center">
              <Coins className="w-5 h-5 mx-auto mb-1 text-amber-600" />
              <p className="text-xl font-bold text-amber-700">{tokens}</p>
              <p className="text-xs text-amber-600/80">Tokens</p>
            </CardContent>
          </Card>
          
          <Button
            variant="outline"
            className="rounded-xl h-auto py-3 px-4"
            onClick={() => setShowQuestionnaire(true)}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Take Assessment
          </Button>
        </div>
      </div>

      {/* Level Tabs */}
      <Tabs value={activeLevel} onValueChange={(val) => { setActiveLevel(val); setSelectedCategory(null); setViewMode('categories'); }} className="w-full">
        <TabsList className="bg-white rounded-full p-1.5 shadow-md w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger 
            value="beginner" 
            className="rounded-full px-4 sm:px-6 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            <span className="hidden sm:inline">Beginner</span>
            <span className="sm:hidden">Begin</span>
          </TabsTrigger>
          <TabsTrigger 
            value="intermediate" 
            className="rounded-full px-4 sm:px-6 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <span className="hidden sm:inline">Intermediate</span>
            <span className="sm:hidden">Inter</span>
          </TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            className="rounded-full px-4 sm:px-6 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <span className="hidden sm:inline">Advanced</span>
            <span className="sm:hidden">Adv</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expert" 
            className="rounded-full px-4 sm:px-6 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
          >
            Expert
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeLevel} className="mt-6">
          {/* Level Header with Image */}
          <LevelHeaderCard level={activeLevel} stats={levelStats} />
          
          {/* View Toggle & Breadcrumb */}
          {selectedCategory && (
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSelectedCategory(null); setViewMode('categories'); }}
                className="text-muted-foreground"
              >
                <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                All Categories
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{CATEGORY_VISUALS[selectedCategory]?.name || selectedCategory}</span>
            </div>
          )}
          
          {!selectedCategory ? (
            /* Categories Grid View */
            Object.keys(groupedLessons).length === 0 ? (
              <Card className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground">No lessons available for this level.</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedLessons).map(([category, catLessons]) => (
                  <CategoryCard 
                    key={category}
                    category={category}
                    lessons={catLessons}
                    onSelectCategory={(cat) => { setSelectedCategory(cat); setViewMode('lessons'); }}
                  />
                ))}
              </div>
            )
          ) : (
            /* Lessons Grid View */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryLessons.map((lesson) => (
                <LessonCard
                  key={lesson.lesson_id}
                  lesson={lesson}
                  enrollment={getEnrollment(lesson.lesson_id)}
                  onClick={() => setSelectedLesson(lesson)}
                  categoryVisual={CATEGORY_VISUALS[lesson.category]}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Lesson Detail Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedLesson && (() => {
            const enrollment = getEnrollment(selectedLesson.lesson_id);
            const isCompleted = enrollment?.status === 'completed';
            const isInProgress = enrollment?.status === 'in_progress';
            const categoryVisual = CATEGORY_VISUALS[selectedLesson.category];
            const lessonImage = getLessonImage(selectedLesson.lesson_id, selectedLesson.category, selectedLesson.level);
            
            return (
              <>
                {/* Lesson Image Header */}
                <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={lessonImage}
                    alt={selectedLesson.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${categoryVisual?.color || 'from-gray-500 to-gray-600'} opacity-70`} />
                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <Badge className="bg-white/20 text-white border-0 mb-2 rounded-full capitalize">
                      {selectedLesson.category}
                    </Badge>
                    <h2 className="font-heading font-bold text-xl">{selectedLesson.title}</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">{selectedLesson.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${levelColors[selectedLesson.level]?.bg} ${levelColors[selectedLesson.level]?.text} rounded-full capitalize`}>
                      {selectedLesson.level}
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

                  {/* Audio Training Guide */}
                  <AudioTrainingGuide 
                    lessonId={selectedLesson.lesson_id}
                    lessonTitle={selectedLesson.title}
                  />

                  {/* Training Steps */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
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
                                isStepCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
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
                        Pro Tips
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

                  {/* Recommendations */}
                  {(selectedLesson.toy_recommendations?.length > 0 || selectedLesson.treat_recommendations?.length > 0) && (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedLesson.toy_recommendations?.length > 0 && (
                        <div className="bg-purple-50 rounded-xl p-3">
                          <h5 className="text-xs font-medium text-purple-700 mb-2">Recommended Toys</h5>
                          <ul className="space-y-1">
                            {selectedLesson.toy_recommendations.map((toy, i) => (
                              <li key={i} className="text-xs text-purple-600">{toy}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedLesson.treat_recommendations?.length > 0 && (
                        <div className="bg-green-50 rounded-xl p-3">
                          <h5 className="text-xs font-medium text-green-700 mb-2">Recommended Treats</h5>
                          <ul className="space-y-1">
                            {selectedLesson.treat_recommendations.map((treat, i) => (
                              <li key={i} className="text-xs text-green-600">{treat}</li>
                            ))}
                          </ul>
                        </div>
                      )}
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

                  {/* Share Progress Card */}
                  {isInProgress && enrollment && (
                    <ProgressShareCard
                      completed={enrollment.completed_steps?.length || 0}
                      total={selectedLesson.steps?.length || 1}
                      lessonTitle={selectedLesson.title}
                    />
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        level={activeLevel}
        onComplete={(result) => {
          toast.success(`Assessment complete! You scored ${result.percentage}%`);
        }}
      />

      {/* Lesson Completion Modal */}
      <LessonCompletionModal
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
        lessonTitle={completedLesson?.title}
        tokensEarned={0}
        xpEarned={completedLesson?.token_cost * 10 || 50}
        badgeEarned={completedLesson?.badge_reward}
      />
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
