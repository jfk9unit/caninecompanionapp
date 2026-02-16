import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dog,
  Plus,
  GraduationCap,
  Heart,
  Calendar,
  Activity,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Flame,
  PawPrint
} from "lucide-react";

export const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [addDogOpen, setAddDogOpen] = useState(false);
  const [newDog, setNewDog] = useState({
    name: '',
    breed: '',
    age_months: '',
    weight_kg: '',
    size: 'medium'
  });

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAddDog = async () => {
    if (!newDog.name || !newDog.breed) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await axios.post(`${API}/dogs`, {
        ...newDog,
        age_months: parseInt(newDog.age_months) || 12,
        weight_kg: parseFloat(newDog.weight_kg) || 10
      }, { withCredentials: true });
      toast.success(`${newDog.name} has been added!`);
      setAddDogOpen(false);
      setNewDog({ name: '', breed: '', age_months: '', weight_kg: '', size: 'medium' });
      fetchStats();
    } catch (error) {
      toast.error('Failed to add dog');
    }
  };

  return (
    <AppLayout user={user}>
      {({ dogs, selectedDog, refreshDogs }) => (
        <div className="space-y-8 animate-fade-in" data-testid="dashboard">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {selectedDog ? `Managing ${selectedDog.name}'s care` : 'Add a dog to get started'}
              </p>
            </div>
            <Dialog open={addDogOpen} onOpenChange={setAddDogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-primary hover:bg-primary-hover" data-testid="add-dog-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Dog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading">Add New Dog</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="dog-name">Name *</Label>
                    <Input
                      id="dog-name"
                      data-testid="dog-name-input"
                      value={newDog.name}
                      onChange={(e) => setNewDog({ ...newDog, name: e.target.value })}
                      placeholder="Enter dog's name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dog-breed">Breed *</Label>
                    <Input
                      id="dog-breed"
                      data-testid="dog-breed-input"
                      value={newDog.breed}
                      onChange={(e) => setNewDog({ ...newDog, breed: e.target.value })}
                      placeholder="e.g., Golden Retriever"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dog-age">Age (months)</Label>
                      <Input
                        id="dog-age"
                        data-testid="dog-age-input"
                        type="number"
                        value={newDog.age_months}
                        onChange={(e) => setNewDog({ ...newDog, age_months: e.target.value })}
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dog-weight">Weight (kg)</Label>
                      <Input
                        id="dog-weight"
                        data-testid="dog-weight-input"
                        type="number"
                        value={newDog.weight_kg}
                        onChange={(e) => setNewDog({ ...newDog, weight_kg: e.target.value })}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Select value={newDog.size} onValueChange={(v) => setNewDog({ ...newDog, size: v })}>
                      <SelectTrigger data-testid="dog-size-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (under 10kg)</SelectItem>
                        <SelectItem value="medium">Medium (10-25kg)</SelectItem>
                        <SelectItem value="large">Large (over 25kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={async () => {
                      await handleAddDog();
                      refreshDogs();
                    }} 
                    className="w-full rounded-full bg-primary hover:bg-primary-hover"
                    data-testid="submit-dog-btn"
                  >
                    Add Dog
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid - Bento Style */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 stagger-children">
              {/* Dogs Count */}
              <Card className="bg-white rounded-2xl shadow-card card-hover animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Dogs</p>
                      <p className="text-3xl font-heading font-bold mt-1">{stats.dogs_count}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Dog className="w-5 h-5 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Tasks */}
              <Card className="bg-white rounded-2xl shadow-card card-hover animate-fade-in md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Tasks</p>
                      <p className="text-3xl font-heading font-bold mt-1">
                        {stats.tasks_completed}/{stats.tasks_total}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <Progress 
                    value={stats.tasks_total > 0 ? (stats.tasks_completed / stats.tasks_total) * 100 : 0} 
                    className="h-3 rounded-full bg-gray-100"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.tasks_total > 0 
                      ? `${Math.round((stats.tasks_completed / stats.tasks_total) * 100)}% completed`
                      : 'No tasks scheduled'
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Training Progress */}
              <Card className="bg-white rounded-2xl shadow-card card-hover animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Training</p>
                      <p className="text-3xl font-heading font-bold mt-1">
                        {stats.training_completed}
                      </p>
                      <p className="text-xs text-muted-foreground">modules completed</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <Progress 
                    value={(stats.training_completed / stats.training_total) * 100} 
                    className="h-2 rounded-full bg-gray-100"
                  />
                </CardContent>
              </Card>

              {/* Behavior Alerts */}
              <Card className={`rounded-2xl shadow-card card-hover animate-fade-in ${
                stats.behavior_alerts > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Behavior Alerts</p>
                      <p className="text-3xl font-heading font-bold mt-1">{stats.behavior_alerts}</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.behavior_alerts > 0 ? 'needs attention' : 'all good!'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      stats.behavior_alerts > 0 ? 'bg-orange-200' : 'bg-green-100'
                    }`}>
                      {stats.behavior_alerts > 0 
                        ? <AlertTriangle className="w-5 h-5 text-orange-600" />
                        : <CheckCircle className="w-5 h-5 text-green-600" />
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dogs List */}
          {dogs.length > 0 ? (
            <div>
              <h2 className="font-heading font-semibold text-xl mb-4">Your Dogs</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dogs.map((dog, index) => (
                  <Card 
                    key={dog.dog_id} 
                    className="bg-white rounded-2xl shadow-card card-hover animate-fade-in overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    data-testid={`dog-card-${dog.dog_id}`}
                  >
                    <div className="h-32 bg-gradient-to-br from-green-100 to-orange-50 flex items-center justify-center">
                      <PawPrint className="w-16 h-16 text-primary/30" />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-heading font-semibold text-lg">{dog.name}</h3>
                      <p className="text-sm text-muted-foreground">{dog.breed}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{Math.floor(dog.age_months / 12)}y {dog.age_months % 12}m</span>
                        <span>{dog.weight_kg}kg</span>
                        <span className="capitalize">{dog.size}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="bg-white rounded-2xl shadow-card p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <Dog className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Add Your First Dog</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your furry companion to track their care.
              </p>
              <Button 
                onClick={() => setAddDogOpen(true)}
                className="rounded-full bg-primary hover:bg-primary-hover"
                data-testid="empty-add-dog-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Dog
              </Button>
            </Card>
          )}

          {/* Quick Actions */}
          {dogs.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-xl mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: GraduationCap, label: 'Start Training', href: '/training', color: 'bg-purple-100 text-purple-600' },
                  { icon: Heart, label: 'Health Check', href: '/health', color: 'bg-red-100 text-red-600' },
                  { icon: Calendar, label: 'Add Task', href: '/activities', color: 'bg-blue-100 text-blue-600' },
                  { icon: Activity, label: 'Log Behavior', href: '/behavior', color: 'bg-orange-100 text-orange-600' },
                ].map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-card card-hover transition-all"
                    data-testid={`quick-action-${action.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className={`p-3 rounded-xl ${action.color}`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-center">{action.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
