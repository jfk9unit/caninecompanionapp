import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Plus,
  Footprints,
  UtensilsCrossed,
  Gamepad2,
  Scissors,
  GraduationCap,
  Pill,
  CheckCircle,
  Circle,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const taskTypeConfig = {
  walk: { icon: Footprints, color: 'bg-blue-100 text-blue-700' },
  feed: { icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-700' },
  play: { icon: Gamepad2, color: 'bg-purple-100 text-purple-700' },
  grooming: { icon: Scissors, color: 'bg-pink-100 text-pink-700' },
  training: { icon: GraduationCap, color: 'bg-green-100 text-green-700' },
  medication: { icon: Pill, color: 'bg-red-100 text-red-700' }
};

// Activities Content Component
const ActivitiesContent = ({ selectedDog }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    task_type: 'walk',
    scheduled_time: '',
    recurring: false,
    recurrence_pattern: 'daily'
  });

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const fetchTasks = async (dogId, date) => {
    try {
      const response = await axios.get(`${API}/tasks/${dogId}?date=${date}`, { withCredentials: true });
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  useEffect(() => {
    if (selectedDog) {
      fetchTasks(selectedDog.dog_id, dateStr);
    }
  }, [selectedDog, dateStr]);

  const handleAddTask = async () => {
    if (!newTask.title) {
      toast.error('Please enter a task title');
      return;
    }
    try {
      await axios.post(`${API}/tasks`, {
        dog_id: selectedDog.dog_id,
        ...newTask,
        date: dateStr
      }, { withCredentials: true });
      toast.success('Task added');
      setAddTaskOpen(false);
      setNewTask({ title: '', task_type: 'walk', scheduled_time: '', recurring: false, recurrence_pattern: 'daily' });
      fetchTasks(selectedDog.dog_id, dateStr);
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await axios.put(`${API}/tasks/${taskId}/complete`, {}, { withCredentials: true });
      toast.success('Task completed!');
      fetchTasks(selectedDog.dog_id, dateStr);
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`, { withCredentials: true });
      toast.success('Task deleted');
      fetchTasks(selectedDog.dog_id, dateStr);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (!selectedDog) {
    return (
      <div className="text-center py-16" data-testid="no-dog-message">
        <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-xl mb-2">No Dog Selected</h2>
        <p className="text-muted-foreground">Please add a dog from the dashboard to schedule activities.</p>
      </div>
    );
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const completedCount = tasks.filter(t => t.is_completed).length;

  return (
    <div className="space-y-8 animate-fade-in" data-testid="daily-activities">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
            Daily Activities
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule and track {selectedDog.name}'s daily routine
          </p>
        </div>
        <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary-hover" data-testid="add-task-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Task Title *</Label>
                <Input
                  data-testid="task-title-input"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Morning walk"
                />
              </div>
              <div>
                <Label>Task Type</Label>
                <Select 
                  value={newTask.task_type} 
                  onValueChange={(v) => setNewTask({ ...newTask, task_type: v })}
                >
                  <SelectTrigger data-testid="task-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk">Walk</SelectItem>
                    <SelectItem value="feed">Feed</SelectItem>
                    <SelectItem value="play">Play</SelectItem>
                    <SelectItem value="grooming">Grooming</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Scheduled Time (optional)</Label>
                <Input
                  data-testid="task-time-input"
                  type="time"
                  value={newTask.scheduled_time}
                  onChange={(e) => setNewTask({ ...newTask, scheduled_time: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="recurring"
                  checked={newTask.recurring}
                  onCheckedChange={(c) => setNewTask({ ...newTask, recurring: c })}
                  data-testid="recurring-checkbox"
                />
                <Label htmlFor="recurring" className="cursor-pointer">Recurring task</Label>
              </div>
              {newTask.recurring && (
                <Select 
                  value={newTask.recurrence_pattern} 
                  onValueChange={(v) => setNewTask({ ...newTask, recurrence_pattern: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button 
                onClick={handleAddTask}
                className="w-full rounded-full bg-primary hover:bg-primary-hover"
                data-testid="submit-task-btn"
              >
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-card p-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => changeDate(-1)}
          data-testid="prev-date-btn"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2" data-testid="date-selector">
              <CalendarIcon className="w-5 h-5" />
              <span className="font-heading font-semibold">
                {isToday ? 'Today' : format(selectedDate, 'EEEE, MMMM d')}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
            />
          </PopoverContent>
        </Popover>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => changeDate(1)}
          data-testid="next-date-btn"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Summary */}
      <Card className="bg-gradient-to-br from-green-50 to-orange-50 border-0 shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Daily Progress</p>
              <p className="text-3xl font-heading font-bold mt-1">
                {completedCount}/{tasks.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">tasks completed</p>
            </div>
            <div className="w-24 h-24 rounded-full border-8 border-white flex items-center justify-center bg-white shadow-card">
              <span className="text-2xl font-heading font-bold text-primary">
                {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {tasks.length > 0 ? (
        <div className="space-y-4 stagger-children">
          {tasks.map((task, index) => {
            const config = taskTypeConfig[task.task_type] || taskTypeConfig.walk;
            const Icon = config.icon;
            return (
              <Card
                key={task.task_id}
                className={`bg-white rounded-2xl shadow-card card-hover animate-fade-in ${
                  task.is_completed ? 'opacity-75' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                data-testid={`task-card-${task.task_id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => !task.is_completed && handleCompleteTask(task.task_id)}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        task.is_completed 
                          ? 'bg-green-100' 
                          : 'border-2 border-gray-200 hover:border-primary'
                      }`}
                      disabled={task.is_completed}
                      data-testid={`complete-task-${task.task_id}`}
                    >
                      {task.is_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    
                    <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                      <Icon className={`w-4 h-4 ${config.color.split(' ')[1]}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${config.color} border-0 capitalize text-xs`}>
                          {task.task_type}
                        </Badge>
                        {task.scheduled_time && (
                          <span className="text-xs text-muted-foreground">{task.scheduled_time}</span>
                        )}
                        {task.recurring && (
                          <Badge variant="outline" className="text-xs">Recurring</Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.task_id)}
                      data-testid={`delete-task-${task.task_id}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white rounded-2xl shadow-card p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">No Tasks for This Day</h3>
          <p className="text-muted-foreground mb-4">
            Add activities to keep {selectedDog.name}'s routine on track.
          </p>
          <Button 
            onClick={() => setAddTaskOpen(true)}
            className="rounded-full bg-primary hover:bg-primary-hover"
            data-testid="empty-add-task-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </Card>
      )}
    </div>
  );
};

export const DailyActivities = ({ user }) => {
  return (
    <AppLayout user={user}>
      {({ selectedDog }) => <ActivitiesContent selectedDog={selectedDog} />}
    </AppLayout>
  );
};

export default DailyActivities;
