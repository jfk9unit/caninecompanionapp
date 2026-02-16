import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Lightbulb
} from "lucide-react";

const levelColors = {
  beginner: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  intermediate: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  advanced: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
};

const categoryIcons = {
  obedience: GraduationCap,
  behavior: Star,
  tricks: Award,
  agility: Play
};

export const TrainingCenter = ({ user }) => {
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get(`${API}/training/modules`, { withCredentials: true });
        setModules(response.data);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
      }
    };
    fetchModules();
  }, []);

  const fetchProgress = async (dogId) => {
    try {
      const response = await axios.get(`${API}/training/progress/${dogId}`, { withCredentials: true });
      const progressMap = {};
      response.data.forEach(p => {
        progressMap[p.module_id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const handleStepComplete = async (moduleId, stepIndex, dogId) => {
    try {
      await axios.post(`${API}/training/progress`, null, {
        params: { module_id: moduleId, dog_id: dogId, completed_step: stepIndex },
        withCredentials: true
      });
      toast.success('Step completed!');
      fetchProgress(dogId);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const filteredModules = modules.filter(m => m.level === activeLevel);

  const getModuleProgress = (moduleId, totalSteps) => {
    const p = progress[moduleId];
    if (!p) return 0;
    return Math.round((p.completed_steps.length / totalSteps) * 100);
  };

  return (
    <AppLayout user={user}>
      {({ dogs, selectedDog }) => {
        // Move useEffect logic outside render callback
        const TrainingCenterContent = () => {
          useEffect(() => {
            if (selectedDog) {
              fetchProgress(selectedDog.dog_id);
            }
          }, [selectedDog]);

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
            <div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                Training Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Training {selectedDog.name} from basics to advanced skills
              </p>
            </div>

            {/* Level Tabs */}
            <Tabs value={activeLevel} onValueChange={setActiveLevel}>
              <TabsList className="bg-accent p-1 rounded-full">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <TabsTrigger
                    key={level}
                    value={level}
                    className="rounded-full px-6 capitalize data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    data-testid={`tab-${level}`}
                  >
                    {level}
                  </TabsTrigger>
                ))}
              </TabsList>

              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <TabsContent key={level} value={level} className="mt-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                    {modules.filter(m => m.level === level).map((module, index) => {
                      const progressPercent = getModuleProgress(module.module_id, module.steps.length);
                      const CategoryIcon = categoryIcons[module.category] || GraduationCap;
                      const colors = levelColors[level];
                      
                      return (
                        <Card
                          key={module.module_id}
                          className={`bg-white rounded-2xl shadow-card card-hover animate-fade-in cursor-pointer ${
                            progressPercent === 100 ? 'ring-2 ring-green-500' : ''
                          }`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={() => {
                            setSelectedModule(module);
                            setModuleDialogOpen(true);
                          }}
                          data-testid={`module-card-${module.module_id}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className={`p-3 rounded-xl ${colors.bg}`}>
                                <CategoryIcon className={`w-5 h-5 ${colors.text}`} />
                              </div>
                              <Badge className={`${colors.bg} ${colors.text} border-0`}>
                                {module.category}
                              </Badge>
                            </div>
                            
                            <h3 className="font-heading font-semibold text-lg mb-2">{module.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {module.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {module.duration_minutes}min
                              </span>
                              <span>{module.steps.length} steps</span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">{progressPercent}%</span>
                              </div>
                              <Progress value={progressPercent} className="h-2 bg-gray-100" />
                            </div>
                            
                            {progressPercent === 100 && (
                              <div className="flex items-center gap-2 mt-4 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Completed</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Module Detail Dialog */}
            <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {selectedModule && (
                  <>
                    <DialogHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${levelColors[selectedModule.level].bg}`}>
                          <GraduationCap className={`w-6 h-6 ${levelColors[selectedModule.level].text}`} />
                        </div>
                        <div>
                          <DialogTitle className="font-heading text-xl">
                            {selectedModule.title}
                          </DialogTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${levelColors[selectedModule.level].bg} ${levelColors[selectedModule.level].text} border-0 capitalize`}>
                              {selectedModule.level}
                            </Badge>
                            <Badge variant="outline">{selectedModule.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 mt-4">
                      <div className="space-y-6 pr-4">
                        <p className="text-muted-foreground">{selectedModule.description}</p>
                        
                        {/* Steps */}
                        <div>
                          <h4 className="font-heading font-semibold mb-3">Training Steps</h4>
                          <div className="space-y-3">
                            {selectedModule.steps.map((step, index) => {
                              const isCompleted = progress[selectedModule.module_id]?.completed_steps?.includes(index);
                              return (
                                <div
                                  key={index}
                                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                                    isCompleted 
                                      ? 'bg-green-50 border-green-200' 
                                      : 'bg-white border-gray-100 hover:border-primary/30'
                                  }`}
                                >
                                  <Checkbox
                                    checked={isCompleted}
                                    onCheckedChange={() => {
                                      if (!isCompleted) {
                                        handleStepComplete(selectedModule.module_id, index, selectedDog.dog_id);
                                      }
                                    }}
                                    data-testid={`step-checkbox-${index}`}
                                  />
                                  <div className="flex-1">
                                    <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                      {step}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Tips */}
                        <div>
                          <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Pro Tips
                          </h4>
                          <div className="space-y-2">
                            {selectedModule.tips.map((tip, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <span className="text-yellow-500">•</span>
                                {tip}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );
      }}
    </AppLayout>
  );
};

export default TrainingCenter;
