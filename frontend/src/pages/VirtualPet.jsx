import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Heart,
  Zap,
  Star,
  Trophy,
  Bone,
  Play,
  GraduationCap,
  Sparkles,
  PawPrint,
  Coins,
  Plus,
  Dumbbell,
  UtensilsCrossed,
  Music,
  Moon,
  Sun,
  Gamepad2,
  TreePine,
  Home,
  Volume2
} from "lucide-react";

// Animated K9 Pet Component
const AnimatedK9Pet = ({ mood, isPlaying, isEating, isExercising, isSleeping, name }) => {
  const [frame, setFrame] = useState(0);
  const [bounce, setBounce] = useState(false);
  const [wagTail, setWagTail] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 4);
      if (isPlaying || mood >= 80) {
        setWagTail(w => !w);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [isPlaying, mood]);

  useEffect(() => {
    if (isPlaying || isEating || isExercising) {
      setBounce(true);
      const timeout = setTimeout(() => setBounce(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, isEating, isExercising]);

  // Get dog expression based on state
  const getExpression = () => {
    if (isSleeping) return "😴";
    if (isEating) return "😋";
    if (isPlaying) return "🤩";
    if (isExercising) return "💪";
    if (mood >= 90) return "🥰";
    if (mood >= 70) return "😊";
    if (mood >= 50) return "🙂";
    if (mood >= 30) return "😐";
    return "😢";
  };

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Background Scene */}
      <div className={`absolute inset-0 rounded-3xl overflow-hidden transition-all duration-500 ${
        isSleeping ? 'bg-gradient-to-b from-indigo-900 to-purple-900' :
        isExercising ? 'bg-gradient-to-b from-green-400 to-emerald-500' :
        'bg-gradient-to-b from-sky-300 to-sky-400'
      }`}>
        {/* Stars for night */}
        {isSleeping && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
            <Moon className="absolute top-4 right-4 w-8 h-8 text-yellow-200" />
          </div>
        )}
        
        {/* Sun for day */}
        {!isSleeping && (
          <Sun className="absolute top-4 right-4 w-10 h-10 text-yellow-300 animate-spin-slow" />
        )}
        
        {/* Trees for exercise */}
        {isExercising && (
          <>
            <TreePine className="absolute bottom-0 left-2 w-12 h-12 text-green-700" />
            <TreePine className="absolute bottom-0 right-4 w-10 h-10 text-green-600" />
          </>
        )}
        
        {/* Ground */}
        <div className={`absolute bottom-0 left-0 right-0 h-20 ${
          isSleeping ? 'bg-indigo-800' :
          isExercising ? 'bg-green-600' :
          'bg-green-500'
        }`}>
          {/* Grass texture */}
          {!isSleeping && (
            <div className="absolute top-0 left-0 right-0 h-4 flex justify-around">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-green-600 rounded-t"
                  style={{ height: `${8 + Math.random() * 8}px` }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Dog house */}
        {isSleeping && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
            <Home className="w-16 h-16 text-amber-600" />
          </div>
        )}
      </div>

      {/* Animated K9 Dog */}
      <div className={`relative z-10 pt-8 pb-4 ${bounce ? 'animate-bounce' : ''}`}>
        <div className="relative mx-auto w-40 h-40">
          {/* Dog Body */}
          <div className={`absolute inset-0 transition-transform duration-300 ${
            isPlaying ? 'animate-wiggle' : 
            isExercising ? 'animate-pulse' : ''
          }`}>
            {/* Main body shape */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Body */}
              <ellipse cx="100" cy="130" rx="50" ry="35" fill="#8B5A2B" />
              
              {/* Head */}
              <circle cx="100" cy="75" r="40" fill="#A0522D" />
              
              {/* Ears */}
              <ellipse 
                cx="60" cy="55" rx="15" ry="25" 
                fill="#5D3A1A" 
                transform={`rotate(${wagTail ? -15 : -10}, 60, 55)`}
              />
              <ellipse 
                cx="140" cy="55" rx="15" ry="25" 
                fill="#5D3A1A"
                transform={`rotate(${wagTail ? 15 : 10}, 140, 55)`}
              />
              
              {/* Snout */}
              <ellipse cx="100" cy="90" rx="20" ry="15" fill="#D2B48C" />
              <ellipse cx="100" cy="85" rx="8" ry="5" fill="#2D1B0E" />
              
              {/* Eyes */}
              <circle cx="80" cy="70" r="8" fill="white" />
              <circle cx="120" cy="70" r="8" fill="white" />
              <circle cx="80" cy="70" r="5" fill="#2D1B0E" />
              <circle cx="120" cy="70" r="5" fill="#2D1B0E" />
              
              {/* Eye shine */}
              <circle cx="82" cy="68" r="2" fill="white" />
              <circle cx="122" cy="68" r="2" fill="white" />
              
              {/* Legs */}
              <rect x="65" y="155" width="15" height="30" rx="5" fill="#8B5A2B" />
              <rect x="120" y="155" width="15" height="30" rx="5" fill="#8B5A2B" />
              
              {/* Tail */}
              <ellipse 
                cx="155" cy="130" rx="8" ry="20" 
                fill="#5D3A1A"
                transform={`rotate(${wagTail ? 30 : -10}, 155, 130)`}
                className="origin-bottom transition-transform"
              />
              
              {/* Collar */}
              <rect x="75" y="105" width="50" height="8" rx="2" fill="#DC2626" />
              <circle cx="100" cy="113" r="4" fill="#FCD34D" />
            </svg>
          </div>
          
          {/* Expression Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
            {isSleeping && <span className="text-5xl">💤</span>}
          </div>
          
          {/* Food bowl when eating */}
          {isEating && (
            <div className="absolute -bottom-2 right-0 text-3xl animate-bounce">
              🍖
            </div>
          )}
          
          {/* Ball when playing */}
          {isPlaying && (
            <div className="absolute -bottom-2 left-0 text-3xl animate-bounce">
              🎾
            </div>
          )}
          
          {/* Dumbbells when exercising */}
          {isExercising && (
            <div className="absolute top-0 right-0 text-2xl animate-pulse">
              💪
            </div>
          )}
        </div>
        
        {/* Pet Name */}
        <div className="text-center mt-2">
          <Badge className="bg-white/90 text-gray-800 rounded-full px-4 py-1 text-lg font-bold shadow-lg">
            {name}
          </Badge>
          <div className="mt-1 text-3xl">{getExpression()}</div>
        </div>
      </div>
    </div>
  );
};

// Interactive Progress Bar Component
const InteractiveProgressBar = ({ value, max, icon: Icon, color, label, onIncrease }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          {label}
        </span>
        <span className="text-sm font-bold">{Math.round(percentage)}%</span>
      </div>
      
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        {/* Animated fill */}
        <div 
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
            percentage >= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' :
            percentage >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
            'bg-gradient-to-r from-red-400 to-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
        
        {/* Markers */}
        <div className="absolute inset-0 flex justify-around items-center px-2">
          {[25, 50, 75].map((mark) => (
            <div 
              key={mark}
              className={`w-0.5 h-3 rounded ${percentage >= mark ? 'bg-white/50' : 'bg-gray-400/30'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Low warning */}
      {percentage < 30 && (
        <p className="text-xs text-red-500 mt-1 animate-pulse">Low! Time to {label.toLowerCase()}!</p>
      )}
    </div>
  );
};

// Activity Button Component
const ActivityButton = ({ icon: Icon, label, sublabel, color, onClick, disabled, loading }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative w-full h-20 rounded-2xl ${color} hover:scale-[1.02] transition-all duration-200 overflow-hidden group`}
      data-testid={`${label.toLowerCase().replace(' ', '-')}-btn`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,white,transparent_70%)]" />
      </div>
      
      <div className="relative flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-white/20 group-hover:scale-110 transition-transform ${loading ? 'animate-spin' : ''}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <p className="font-bold text-white">{label}</p>
          <p className="text-xs text-white/80">{sublabel}</p>
        </div>
      </div>
      
      {/* Sparkle effect on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-5 h-5 text-white/60 animate-pulse" />
      </div>
    </Button>
  );
};

const SKILLS = [
  { id: "sit", name: "Sit", icon: "🐕", description: "Basic obedience command" },
  { id: "stay", name: "Stay", icon: "🦮", description: "Hold position until released" },
  { id: "fetch", name: "Fetch", icon: "🎾", description: "Retrieve thrown objects" },
  { id: "roll", name: "Roll Over", icon: "🔄", description: "Fun trick to impress" },
  { id: "shake", name: "Shake Hands", icon: "🤝", description: "Polite greeting" },
  { id: "speak", name: "Speak", icon: "🗣️", description: "Bark on command" },
  { id: "heel", name: "Heel", icon: "👟", description: "Walk beside handler" },
  { id: "down", name: "Down", icon: "⬇️", description: "Lie down on command" },
  { id: "jump", name: "Jump", icon: "🦘", description: "Athletic agility skill" },
  { id: "crawl", name: "Crawl", icon: "🐛", description: "Army crawl trick" },
  { id: "spin", name: "Spin", icon: "🌀", description: "Spin in a circle" },
  { id: "highfive", name: "High Five", icon: "✋", description: "Elevated paw touch" },
];

const EXERCISES = [
  { id: "walk", name: "Go for Walk", icon: TreePine, xp: 10, energy: -15, happiness: 20, duration: "15 min", color: "bg-green-500" },
  { id: "run", name: "Run & Play", icon: Zap, xp: 20, energy: -25, happiness: 30, duration: "20 min", color: "bg-orange-500" },
  { id: "swim", name: "Swimming", icon: Sparkles, xp: 25, energy: -20, happiness: 35, duration: "25 min", color: "bg-blue-500" },
  { id: "agility", name: "Agility Course", icon: Dumbbell, xp: 30, energy: -30, happiness: 40, duration: "30 min", color: "bg-purple-500" },
];

export const VirtualPet = ({ user }) => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [tokens, setTokens] = useState(user?.tokens || 0);
  const [activeTab, setActiveTab] = useState("care");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    fetchPet();
    fetchTokens();
  }, []);

  // Simulate natural stat decay over time
  useEffect(() => {
    if (!pet) return;
    
    const decayInterval = setInterval(() => {
      // Stats naturally decrease over time (for demo purposes)
      // In real app, this would be calculated server-side
    }, 60000); // Every minute
    
    return () => clearInterval(decayInterval);
  }, [pet]);

  const fetchPet = async () => {
    try {
      const response = await axios.get(`${API}/virtual-pet`, { withCredentials: true });
      setPet(response.data);
    } catch (error) {
      console.error('Failed to fetch pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await axios.get(`${API}/tokens/balance`, { withCredentials: true });
      setTokens(response.data.tokens);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    }
  };

  const createPet = async () => {
    if (!newPetName.trim()) {
      toast.error('Please enter a name for your pet');
      return;
    }
    try {
      const response = await axios.post(`${API}/virtual-pet`, {
        name: newPetName
      }, { withCredentials: true });
      setPet(response.data);
      setCreateOpen(false);
      toast.success(`${newPetName} is ready to play! 🎉`);
    } catch (error) {
      toast.error('Failed to create pet');
    }
  };

  const feedPet = async () => {
    setActionLoading('feed');
    setIsEating(true);
    try {
      const response = await axios.post(`${API}/virtual-pet/feed`, {}, { withCredentials: true });
      toast.success(`${pet.name} loved the meal! 🍖`);
      await fetchPet();
      setTimeout(() => setIsEating(false), 2000);
    } catch (error) {
      toast.error('Failed to feed pet');
      setIsEating(false);
    } finally {
      setActionLoading(null);
    }
  };

  const playWithPet = async () => {
    setActionLoading('play');
    setIsPlaying(true);
    try {
      const response = await axios.post(`${API}/virtual-pet/play`, {}, { withCredentials: true });
      toast.success(`${pet.name} had a blast! +${response.data.xp_gained} XP 🎾`);
      await fetchPet();
      setTimeout(() => setIsPlaying(false), 3000);
    } catch (error) {
      toast.error('Failed to play with pet');
      setIsPlaying(false);
    } finally {
      setActionLoading(null);
    }
  };

  const exercisePet = async (exercise) => {
    setActionLoading(exercise.id);
    setIsExercising(true);
    try {
      // Call play endpoint (can be enhanced with specific exercise endpoint)
      const response = await axios.post(`${API}/virtual-pet/play`, {}, { withCredentials: true });
      toast.success(`${pet.name} completed ${exercise.name}! +${response.data.xp_gained} XP 💪`);
      await fetchPet();
      setTimeout(() => setIsExercising(false), 2000);
    } catch (error) {
      toast.error('Exercise failed - pet needs more energy!');
      setIsExercising(false);
    } finally {
      setActionLoading(null);
    }
  };

  const putPetToSleep = () => {
    setIsSleeping(true);
    toast.success(`${pet.name} is taking a nap... 💤`);
    setTimeout(() => {
      setIsSleeping(false);
      // Simulate energy recovery
      toast.success(`${pet.name} woke up refreshed! ☀️`);
    }, 5000);
  };

  const trainSkill = async (skillId) => {
    setActionLoading(skillId);
    try {
      const response = await axios.post(`${API}/virtual-pet/train`, {
        skill: skillId
      }, { withCredentials: true });
      toast.success(`${pet.name} learned a new skill! 🎓`);
      fetchPet();
      fetchTokens();
    } catch (error) {
      if (error.response?.data?.detail?.includes('tokens')) {
        toast.error('Not enough tokens! Visit the Token Shop.');
      } else {
        toast.error('Training failed');
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      {({ dogs }) => (
        <div className="space-y-6 animate-fade-in" data-testid="virtual-pet">
          {!pet ? (
            /* Create Pet */
            <div className="max-w-lg mx-auto text-center py-12">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center mx-auto mb-6 animate-bounce-slow shadow-xl">
                <PawPrint className="w-16 h-16 text-amber-700" />
              </div>
              <h1 className="font-heading font-bold text-3xl mb-3">Create Your Virtual K9</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Adopt your own virtual German Shepherd! Train skills, exercise together, and watch your bond grow. It's completely FREE to play!
              </p>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-8 py-6 text-lg" data-testid="create-pet-btn">
                    <Plus className="w-5 h-5 mr-2" />
                    Adopt Your K9
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <PawPrint className="w-5 h-5 text-amber-500" />
                      Name Your K9 Companion
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Pet Name</Label>
                      <Input
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        placeholder="e.g., Rex, Max, Luna"
                        className="mt-1"
                        data-testid="pet-name-input"
                      />
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-green-700 font-medium">🎮 100% Free to Play!</p>
                      <p className="text-xs text-green-600 mt-1">All activities are free. Only skill training uses tokens.</p>
                    </div>
                    <Button onClick={createPet} className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600" data-testid="confirm-create-pet">
                      <PawPrint className="w-4 h-4 mr-2" />
                      Create My K9
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            /* Pet Dashboard */
            <>
              {/* Animated Pet Display */}
              <div className="relative">
                <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
                  <div className="h-80 sm:h-96">
                    <AnimatedK9Pet 
                      mood={pet.happiness}
                      isPlaying={isPlaying}
                      isEating={isEating}
                      isExercising={isExercising}
                      isSleeping={isSleeping}
                      name={pet.name}
                    />
                  </div>
                </Card>
                
                {/* Quick Stats Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-around">
                  <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full px-4 py-2 shadow-lg">
                    <Star className="w-4 h-4 mr-1 text-purple-500" />
                    Level {pet.training_level}
                  </Badge>
                  <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full px-4 py-2 shadow-lg">
                    <Trophy className="w-4 h-4 mr-1 text-amber-500" />
                    {pet.experience_points} XP
                  </Badge>
                  <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full px-4 py-2 shadow-lg">
                    <GraduationCap className="w-4 h-4 mr-1 text-blue-500" />
                    {pet.skills_unlocked?.length || 0} Skills
                  </Badge>
                </div>
              </div>

              {/* Interactive Stats */}
              <Card className="rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <InteractiveProgressBar 
                    value={pet.happiness} 
                    max={100} 
                    icon={Heart}
                    color="text-pink-500"
                    label="Happiness"
                  />
                  <InteractiveProgressBar 
                    value={pet.energy} 
                    max={100} 
                    icon={Zap}
                    color="text-yellow-500"
                    label="Energy"
                  />
                  
                  {/* XP Progress */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Level {pet.training_level} Progress
                      </span>
                      <span className="text-sm">{pet.experience_points % 100}/100 XP</span>
                    </div>
                    <Progress value={pet.experience_points % 100} className="h-4 rounded-full bg-purple-100" />
                  </div>
                </CardContent>
              </Card>

              {/* Activity Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 bg-white rounded-2xl p-1 shadow-md">
                  <TabsTrigger value="care" className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                    <Heart className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Care</span>
                  </TabsTrigger>
                  <TabsTrigger value="play" className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    <Gamepad2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Play</span>
                  </TabsTrigger>
                  <TabsTrigger value="exercise" className="rounded-xl data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    <Dumbbell className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Exercise</span>
                  </TabsTrigger>
                  <TabsTrigger value="train" className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    <GraduationCap className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Train</span>
                  </TabsTrigger>
                </TabsList>

                {/* Care Tab */}
                <TabsContent value="care" className="mt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ActivityButton
                      icon={Bone}
                      label="Feed"
                      sublabel="+20 Happiness (FREE)"
                      color="bg-gradient-to-r from-pink-500 to-rose-500"
                      onClick={feedPet}
                      disabled={isEating || isSleeping}
                      loading={actionLoading === 'feed'}
                    />
                    <ActivityButton
                      icon={Moon}
                      label="Rest"
                      sublabel="Recover Energy (FREE)"
                      color="bg-gradient-to-r from-indigo-500 to-purple-500"
                      onClick={putPetToSleep}
                      disabled={isSleeping}
                      loading={false}
                    />
                    <ActivityButton
                      icon={UtensilsCrossed}
                      label="Treat"
                      sublabel="+10 Happiness (FREE)"
                      color="bg-gradient-to-r from-amber-500 to-orange-500"
                      onClick={feedPet}
                      disabled={isEating || isSleeping}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Music}
                      label="Calm Music"
                      sublabel="+5 Happiness (FREE)"
                      color="bg-gradient-to-r from-cyan-500 to-teal-500"
                      onClick={() => toast.success(`${pet.name} enjoys the music! 🎵`)}
                      disabled={isSleeping}
                      loading={false}
                    />
                  </div>
                </TabsContent>

                {/* Play Tab */}
                <TabsContent value="play" className="mt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ActivityButton
                      icon={Play}
                      label="Play Fetch"
                      sublabel="+15 XP, +25 Happiness (FREE)"
                      color="bg-gradient-to-r from-blue-500 to-cyan-500"
                      onClick={playWithPet}
                      disabled={isPlaying || isSleeping || pet.energy < 10}
                      loading={actionLoading === 'play'}
                    />
                    <ActivityButton
                      icon={Gamepad2}
                      label="Tug of War"
                      sublabel="+20 XP, +30 Happiness (FREE)"
                      color="bg-gradient-to-r from-purple-500 to-pink-500"
                      onClick={playWithPet}
                      disabled={isPlaying || isSleeping || pet.energy < 15}
                      loading={false}
                    />
                    <ActivityButton
                      icon={PawPrint}
                      label="Chase"
                      sublabel="+25 XP, +35 Happiness (FREE)"
                      color="bg-gradient-to-r from-orange-500 to-red-500"
                      onClick={playWithPet}
                      disabled={isPlaying || isSleeping || pet.energy < 20}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Sparkles}
                      label="Belly Rubs"
                      sublabel="+5 XP, +15 Happiness (FREE)"
                      color="bg-gradient-to-r from-rose-400 to-pink-400"
                      onClick={() => {
                        toast.success(`${pet.name} loves belly rubs! 🥰`);
                        fetchPet();
                      }}
                      disabled={isSleeping}
                      loading={false}
                    />
                  </div>
                </TabsContent>

                {/* Exercise Tab */}
                <TabsContent value="exercise" className="mt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {EXERCISES.map((exercise) => (
                      <ActivityButton
                        key={exercise.id}
                        icon={exercise.icon}
                        label={exercise.name}
                        sublabel={`+${exercise.xp} XP, ${exercise.duration} (FREE)`}
                        color={exercise.color}
                        onClick={() => exercisePet(exercise)}
                        disabled={isExercising || isSleeping || pet.energy < Math.abs(exercise.energy)}
                        loading={actionLoading === exercise.id}
                      />
                    ))}
                  </div>
                  {pet.energy < 30 && (
                    <Card className="mt-4 bg-amber-50 border-amber-200">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <p className="text-sm text-amber-700">
                          Low energy! Let {pet.name} rest before more exercise.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Train Tab */}
                <TabsContent value="train" className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold">Learn New Skills</h3>
                    <Badge variant="outline" className="rounded-full">
                      <Coins className="w-3 h-3 mr-1 text-amber-500" />
                      {tokens} Tokens | 1 per skill
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {SKILLS.map((skill) => {
                      const isUnlocked = pet.skills_unlocked?.includes(skill.id);
                      return (
                        <Card 
                          key={skill.id}
                          className={`rounded-xl transition-all ${
                            isUnlocked 
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                              : 'bg-white hover:shadow-md hover:scale-[1.02] cursor-pointer'
                          }`}
                          data-testid={`skill-${skill.id}`}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl mb-2">{skill.icon}</div>
                            <h4 className="font-medium text-sm">{skill.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                            {isUnlocked ? (
                              <Badge className="mt-2 bg-green-100 text-green-700 rounded-full text-xs">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                Mastered!
                              </Badge>
                            ) : (
                              <Button
                                onClick={() => trainSkill(skill.id)}
                                disabled={actionLoading === skill.id || tokens < 1 || isSleeping}
                                variant="outline"
                                size="sm"
                                className="mt-2 rounded-full text-xs w-full"
                                data-testid={`train-${skill.id}-btn`}
                              >
                                <Coins className="w-3 h-3 mr-1 text-amber-500" />
                                Train (1 Token)
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Level Progress Card */}
              <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-2xl overflow-hidden">
                <CardContent className="p-6 relative">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <span className="font-semibold">Level {pet.training_level} Progress</span>
                      </div>
                      <span className="text-white/80">
                        {pet.experience_points % 100}/100 XP
                      </span>
                    </div>
                    <Progress value={pet.experience_points % 100} className="h-4 rounded-full bg-white/20" />
                    <p className="text-sm text-white/80 mt-2">
                      🎯 {100 - (pet.experience_points % 100)} XP until Level {pet.training_level + 1}!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default VirtualPet;
