import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Activity,
  Plus,
  AlertTriangle,
  Frown,
  Zap,
  ThermometerSun,
  HelpCircle,
  Trash2,
  TrendingDown
} from "lucide-react";

const behaviorTypeConfig = {
  aggression: { icon: AlertTriangle, color: 'bg-red-100 text-red-700', label: 'Aggression' },
  anxiety: { icon: Frown, color: 'bg-yellow-100 text-yellow-700', label: 'Anxiety' },
  excitement: { icon: Zap, color: 'bg-green-100 text-green-700', label: 'Excitement' },
  illness_sign: { icon: ThermometerSun, color: 'bg-orange-100 text-orange-700', label: 'Illness Sign' },
  discomfort: { icon: HelpCircle, color: 'bg-purple-100 text-purple-700', label: 'Discomfort' }
};

const severityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700'
};

const commonTriggers = [
  'Strangers', 'Other dogs', 'Loud noises', 'Car rides',
  'Being alone', 'Vet visits', 'Thunderstorms', 'Food',
  'New environments', 'Children', 'Specific person', 'Mail delivery'
];

// Behavior Content Component
const BehaviorContent = ({ selectedDog }) => {
  const [logs, setLogs] = useState([]);
  const [addLogOpen, setAddLogOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    behavior_type: 'anxiety',
    severity: 'low',
    description: '',
    triggers: [],
    notes: ''
  });
  const [selectedTriggers, setSelectedTriggers] = useState([]);

  const fetchLogs = async (dogId) => {
    try {
      const response = await axios.get(`${API}/behavior/${dogId}`, { withCredentials: true });
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  useEffect(() => {
    if (selectedDog) {
      fetchLogs(selectedDog.dog_id);
    }
  }, [selectedDog]);

  const handleAddLog = async () => {
    if (!newLog.description) {
      toast.error('Please describe the behavior');
      return;
    }
    try {
      await axios.post(`${API}/behavior`, {
        dog_id: selectedDog.dog_id,
        ...newLog,
        triggers: selectedTriggers
      }, { withCredentials: true });
      toast.success('Behavior logged');
      setAddLogOpen(false);
      setNewLog({ behavior_type: 'anxiety', severity: 'low', description: '', triggers: [], notes: '' });
      setSelectedTriggers([]);
      fetchLogs(selectedDog.dog_id);
    } catch (error) {
      toast.error('Failed to log behavior');
    }
  };

  const handleDeleteLog = async (logId) => {
    try {
      await axios.delete(`${API}/behavior/${logId}`, { withCredentials: true });
      toast.success('Log deleted');
      fetchLogs(selectedDog.dog_id);
    } catch (error) {
      toast.error('Failed to delete log');
    }
  };

  const toggleTrigger = (trigger) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const getBehaviorStats = () => {
    const last7Days = logs.filter(log => {
      const logDate = new Date(log.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    });
    
    const highSeverity = last7Days.filter(l => l.severity === 'high').length;
    const typeCount = {};
    last7Days.forEach(log => {
      typeCount[log.behavior_type] = (typeCount[log.behavior_type] || 0) + 1;
    });
    
    const mostCommon = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
    
    return { total: last7Days.length, highSeverity, mostCommon };
  };

  if (!selectedDog) {
    return (
      <div className="text-center py-16" data-testid="no-dog-message">
        <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-xl mb-2">No Dog Selected</h2>
        <p className="text-muted-foreground">Please add a dog from the dashboard to track behavior.</p>
      </div>
    );
  }

  const stats = getBehaviorStats();

  return (
    <div className="space-y-8 animate-fade-in" data-testid="behavior-tracker">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
            Behavior Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor {selectedDog.name}'s behavior patterns and alerts
          </p>
        </div>
        <Dialog open={addLogOpen} onOpenChange={setAddLogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary-hover" data-testid="add-log-btn">
              <Plus className="w-4 h-4 mr-2" />
              Log Behavior
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Log Behavior</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Behavior Type</Label>
                <Select 
                  value={newLog.behavior_type} 
                  onValueChange={(v) => setNewLog({ ...newLog, behavior_type: v })}
                >
                  <SelectTrigger data-testid="behavior-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(behaviorTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select 
                  value={newLog.severity} 
                  onValueChange={(v) => setNewLog({ ...newLog, severity: v })}
                >
                  <SelectTrigger data-testid="severity-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor concern</SelectItem>
                    <SelectItem value="medium">Medium - Needs attention</SelectItem>
                    <SelectItem value="high">High - Urgent concern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  data-testid="behavior-description-input"
                  value={newLog.description}
                  onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                  placeholder="Describe what happened..."
                />
              </div>
              <div>
                <Label>Triggers (select any that apply)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonTriggers.map((trigger, i) => (
                    <Button
                      key={i}
                      variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => toggleTrigger(trigger)}
                      data-testid={`trigger-${i}`}
                    >
                      {trigger}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  data-testid="behavior-notes-input"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  placeholder="Any other observations..."
                />
              </div>
              <Button 
                onClick={handleAddLog}
                className="w-full rounded-full bg-primary hover:bg-primary-hover"
                data-testid="submit-log-btn"
              >
                Log Behavior
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-white rounded-2xl shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-3xl font-heading font-bold mt-1">{stats.total}</p>
                <p className="text-xs text-muted-foreground">incidents logged</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Activity className="w-5 h-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`rounded-2xl shadow-card ${stats.highSeverity > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Severity</p>
                <p className="text-3xl font-heading font-bold mt-1">{stats.highSeverity}</p>
                <p className="text-xs text-muted-foreground">needs attention</p>
              </div>
              <div className={`p-3 rounded-xl ${stats.highSeverity > 0 ? 'bg-red-200' : 'bg-green-100'}`}>
                {stats.highSeverity > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-red-700" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-700" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Most Common</p>
                <p className="text-lg font-heading font-semibold mt-1 capitalize">
                  {stats.mostCommon ? behaviorTypeConfig[stats.mostCommon[0]]?.label : 'None'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.mostCommon ? `${stats.mostCommon[1]} occurrences` : 'No data yet'}
                </p>
              </div>
              {stats.mostCommon && (
                <div className={`p-3 rounded-xl ${behaviorTypeConfig[stats.mostCommon[0]]?.color.split(' ')[0]}`}>
                  {(() => {
                    const Icon = behaviorTypeConfig[stats.mostCommon[0]]?.icon || Activity;
                    return <Icon className={`w-5 h-5 ${behaviorTypeConfig[stats.mostCommon[0]]?.color.split(' ')[1]}`} />;
                  })()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Behavior Logs */}
      {logs.length > 0 ? (
        <div className="space-y-4 stagger-children">
          {logs.map((log, index) => {
            const config = behaviorTypeConfig[log.behavior_type] || behaviorTypeConfig.anxiety;
            const Icon = config.icon;
            return (
              <Card
                key={log.log_id}
                className={`bg-white rounded-2xl shadow-card card-hover animate-fade-in ${
                  log.severity === 'high' ? 'border-l-4 border-red-500' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                data-testid={`behavior-log-${log.log_id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${config.color.split(' ')[0]}`}>
                      <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={`${config.color} border-0`}>{config.label}</Badge>
                        <Badge className={`${severityColors[log.severity]} border-0 capitalize`}>
                          {log.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.date), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      
                      <p className="text-sm">{log.description}</p>
                      
                      {log.triggers && log.triggers.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">Triggers:</span>
                          {log.triggers.map((trigger, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {log.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{log.notes}</p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteLog(log.log_id)}
                      data-testid={`delete-log-${log.log_id}`}
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
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">No Behavior Logs</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking {selectedDog.name}'s behavior patterns.
          </p>
          <Button 
            onClick={() => setAddLogOpen(true)}
            className="rounded-full bg-primary hover:bg-primary-hover"
            data-testid="empty-add-log-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Behavior
          </Button>
        </Card>
      )}
    </div>
  );
};

export const BehaviorTracker = ({ user }) => {
  return (
    <AppLayout user={user}>
      {({ selectedDog }) => <BehaviorContent selectedDog={selectedDog} />}
    </AppLayout>
  );
};

export default BehaviorTracker;
