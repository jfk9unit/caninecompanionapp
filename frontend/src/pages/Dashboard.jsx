import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dog,
  Plus,
  GraduationCap,
  Heart,
  Calendar,
  Activity,
  CheckCircle,
  TrendingUp,
  Target,
  Flame,
  PawPrint,
  Trophy,
  Coins,
  Share2,
  Gift,
  Sparkles,
  Shield,
  ChevronRight,
  Play,
  Star,
  Zap,
  Users,
  ArrowRight
} from "lucide-react";

// Quick Action Card Component
const QuickActionCard = ({ icon: Icon, title, description, onClick, color, badge }) => (
  <Card 
    className="bg-white rounded-2xl shadow-card cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
    onClick={onClick}
    data-testid={`quick-action-${title.toLowerCase().replace(/\s/g, '-')}`}
  >
    <CardContent className="p-5">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            {badge && (
              <Badge className="bg-red-500 text-white text-xs rounded-full animate-pulse">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </CardContent>
  </Card>
);

// Share Progress Card Component
const ShareProgressCard = ({ stats, user }) => {
  const shareProgress = async () => {
    const text = `🐕 My dog training progress on CanineCompass!\n\n✅ ${stats?.training_completed || 0} lessons completed\n🏆 ${stats?.achievements_count || 0} achievements earned\n🔥 Training streak going!\n\nJoin me: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Dog Training Progress', text });
      } catch (e) {
        if (e.name !== 'AbortError') {
          navigator.clipboard.writeText(text);
          toast.success('Progress copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Progress copied to clipboard!');
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Share Your Progress!</h3>
            <p className="text-white/80 text-sm mt-1">
              Show friends how well you're training your pup
            </p>
          </div>
          <Button 
            onClick={shareProgress}
            className="bg-white text-purple-600 hover:bg-white/90 rounded-full"
            data-testid="share-progress-btn"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Featured Lesson Card
const FeaturedLessonCard = ({ lesson, onStart }) => (
  <Card className="bg-gradient-to-br from-primary to-green-600 rounded-2xl text-white overflow-hidden">
    <CardContent className="p-6">
      <Badge className="bg-white/20 text-white rounded-full mb-3">
        <Star className="w-3 h-3 mr-1" />
        Featured Lesson
      </Badge>
      <h3 className="font-heading font-bold text-xl mb-2">{lesson?.title || 'Basic Sit Command'}</h3>
      <p className="text-white/80 text-sm mb-4">
        {lesson?.description || 'Start with the fundamentals of dog training'}
      </p>
      <div className="flex items-center gap-3">
        <Button 
          onClick={onStart}
          className="bg-white text-primary hover:bg-white/90 rounded-full"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Lesson
        </Button>
        <Badge className="bg-white/20 text-white rounded-full">
          <Coins className="w-3 h-3 mr-1" />
          {lesson?.token_cost || 6} tokens
        </Badge>
      </div>
    </CardContent>
  </Card>
);

// Referral Banner
const ReferralBanner = ({ referralCode, onShare }) => (
  <Card className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl text-white">
    <CardContent className="p-5">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Gift className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Invite Friends, Get 5 Free Tokens!</h3>
          <p className="text-white/80 text-sm">Your code: <code className="bg-white/20 px-2 py-0.5 rounded">{referralCode}</code></p>
        </div>
        <Button 
          onClick={onShare}
          variant="secondary"
          className="bg-white text-orange-600 hover:bg-white/90 rounded-full"
          data-testid="invite-friends-btn"
        >
          <Users className="w-4 h-4 mr-2" />
          Invite
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [featuredLesson, setFeaturedLesson] = useState(null);
  const [addDogOpen, setAddDogOpen] = useState(false);
  const [newDog, setNewDog] = useState({
    name: '',
    breed: '',
    age_months: '',
    weight_kg: '',
    size: 'medium'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, tokensRes, lessonsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { withCredentials: true }),
        axios.get(`${API}/tokens/balance`, { withCredentials: true }),
        axios.get(`${API}/training/lessons?level=beginner`, { withCredentials: true })
      ]);
      setStats(statsRes.data);
      setTokens(tokensRes.data.tokens);
      setReferralCode(tokensRes.data.referral_code);
      if (lessonsRes.data.length > 0) {
        setFeaturedLesson(lessonsRes.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleAddDog = async () => {
    if (!newDog.name || !newDog.breed) {
      toast.error('Please fill in name and breed');
      return;
    }
    try {
      await axios.post(`${API}/dogs`, {
        ...newDog,
        age_months: parseInt(newDog.age_months) || 12,
        weight_kg: parseFloat(newDog.weight_kg) || 10
      }, { withCredentials: true });
      toast.success(`${newDog.name} added to your pack!`);
      setAddDogOpen(false);
      setNewDog({ name: '', breed: '', age_months: '', weight_kg: '', size: 'medium' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add dog');
    }
  };

  const shareReferral = () => {
    const text = `Join CanineCompass with my code ${referralCode} and get 5 free tokens for dog training! 🐕 ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({ title: 'Join CanineCompass', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Referral link copied!');
    }
  };

  return (
    <AppLayout user={user}>
      {({ dogs, selectedDog, refreshDogs }) => (
        <div className="space-y-6 animate-fade-in" data-testid="dashboard">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                {selectedDog ? `Training ${selectedDog.name} today` : 'Ready to train your pup?'}
              </p>
            </div>
            
            {/* Token Balance */}
            <Card className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <Coins className="w-6 h-6 text-white" />
                <div className="text-white">
                  <p className="text-xs opacity-80">Your Tokens</p>
                  <p className="text-2xl font-bold">{tokens}</p>
                </div>
                <Button 
                  onClick={() => navigate('/tokens')}
                  size="sm"
                  className="ml-2 bg-white/20 hover:bg-white/30 text-white rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-white rounded-xl shadow-card">
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.training_completed || 0}</p>
                <p className="text-xs text-muted-foreground">Lessons Done</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl shadow-card">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.achievements_count || 0}</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl shadow-card">
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.streak_days || 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl shadow-card">
              <CardContent className="p-4 text-center">
                <Dog className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{dogs?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Dogs</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Quick Actions
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <QuickActionCard
                  icon={GraduationCap}
                  title="Start Training"
                  description="Continue your training journey"
                  onClick={() => navigate('/training')}
                  color="bg-purple-500"
                  badge={stats?.lessons_in_progress > 0 ? `${stats.lessons_in_progress} active` : null}
                />
                <QuickActionCard
                  icon={Shield}
                  title="K9 Security"
                  description="Advanced protection training"
                  onClick={() => navigate('/k9-training')}
                  color="bg-slate-700"
                />
                <QuickActionCard
                  icon={Sparkles}
                  title="Virtual Pet"
                  description="Play and train your virtual pup"
                  onClick={() => navigate('/pet')}
                  color="bg-pink-500"
                />
                <QuickActionCard
                  icon={Flame}
                  title="Competitions"
                  description="Compete with other trainers"
                  onClick={() => navigate('/leaderboard')}
                  color="bg-orange-500"
                />
              </div>

              {/* Featured Lesson */}
              {featuredLesson && (
                <FeaturedLessonCard 
                  lesson={featuredLesson}
                  onStart={() => navigate('/training')}
                />
              )}

              {/* Share Progress */}
              <ShareProgressCard stats={stats} user={user} />
            </div>

            {/* Right Column - Dogs & Referral */}
            <div className="space-y-4">
              {/* Your Dogs Section */}
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-primary" />
                  Your Dogs
                </h2>
                <Dialog open={addDogOpen} onOpenChange={setAddDogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-full bg-primary hover:bg-primary-hover">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a New Dog</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={newDog.name}
                          onChange={(e) => setNewDog({...newDog, name: e.target.value})}
                          placeholder="e.g., Max"
                          data-testid="dog-name-input"
                        />
                      </div>
                      <div>
                        <Label>Breed *</Label>
                        <Input
                          value={newDog.breed}
                          onChange={(e) => setNewDog({...newDog, breed: e.target.value})}
                          placeholder="e.g., Golden Retriever"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Age (months)</Label>
                          <Input
                            type="number"
                            value={newDog.age_months}
                            onChange={(e) => setNewDog({...newDog, age_months: e.target.value})}
                            placeholder="12"
                          />
                        </div>
                        <div>
                          <Label>Weight (kg)</Label>
                          <Input
                            type="number"
                            value={newDog.weight_kg}
                            onChange={(e) => setNewDog({...newDog, weight_kg: e.target.value})}
                            placeholder="10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Size</Label>
                        <Select value={newDog.size} onValueChange={(v) => setNewDog({...newDog, size: v})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleAddDog}
                        className="w-full rounded-full bg-primary"
                        data-testid="save-dog-btn"
                      >
                        Add Dog
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {dogs?.length === 0 ? (
                <Card className="bg-gray-50 rounded-xl border-dashed border-2 border-gray-200 p-6 text-center">
                  <Dog className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No dogs yet</p>
                  <Button 
                    onClick={() => setAddDogOpen(true)}
                    variant="link"
                    className="mt-2"
                  >
                    Add your first dog
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {dogs?.slice(0, 3).map((dog) => (
                    <Card 
                      key={dog.dog_id}
                      className={`rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        selectedDog?.dog_id === dog.dog_id ? 'ring-2 ring-primary bg-primary/5' : 'bg-white'
                      }`}
                      onClick={() => navigate(`/dog/${dog.dog_id}`)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-xl">
                          🐕
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{dog.name}</h4>
                          <p className="text-xs text-muted-foreground">{dog.breed}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Referral Section */}
              <ReferralBanner 
                referralCode={referralCode} 
                onShare={shareReferral}
              />

              {/* Achievement Teaser */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-0">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-6 h-6 text-purple-500" />
                    <h3 className="font-semibold">Achievements</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    You've earned {stats?.achievements_count || 0} badges. Keep training to unlock more!
                  </p>
                  <Button 
                    onClick={() => navigate('/achievements')}
                    variant="outline"
                    className="w-full rounded-full"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
