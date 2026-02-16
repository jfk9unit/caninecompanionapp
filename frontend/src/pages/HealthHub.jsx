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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Heart,
  Plus,
  Stethoscope,
  Syringe,
  Pill,
  AlertCircle,
  FileText,
  Calendar as CalendarIcon,
  Sparkles,
  Send,
  Loader2,
  Trash2,
  X
} from "lucide-react";

const recordTypeConfig = {
  vaccination: { icon: Syringe, color: 'bg-blue-100 text-blue-700' },
  checkup: { icon: Stethoscope, color: 'bg-green-100 text-green-700' },
  medication: { icon: Pill, color: 'bg-purple-100 text-purple-700' },
  illness: { icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  surgery: { icon: FileText, color: 'bg-orange-100 text-orange-700' }
};

export const HealthHub = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('records');
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newRecord, setNewRecord] = useState({
    record_type: 'checkup',
    title: '',
    description: '',
    vet_name: '',
    notes: ''
  });

  // Symptom Analyzer State
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const commonSymptoms = [
    'Loss of appetite', 'Vomiting', 'Diarrhea', 'Lethargy',
    'Excessive scratching', 'Limping', 'Coughing', 'Sneezing',
    'Bad breath', 'Excessive thirst', 'Weight loss', 'Hair loss'
  ];

  const fetchRecords = async (dogId) => {
    try {
      const response = await axios.get(`${API}/health/${dogId}`, { withCredentials: true });
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  const handleAddRecord = async (dogId) => {
    if (!newRecord.title || !newRecord.description) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      await axios.post(`${API}/health`, {
        dog_id: dogId,
        ...newRecord,
        date: selectedDate.toISOString()
      }, { withCredentials: true });
      toast.success('Health record added');
      setAddRecordOpen(false);
      setNewRecord({ record_type: 'checkup', title: '', description: '', vet_name: '', notes: '' });
      fetchRecords(dogId);
    } catch (error) {
      toast.error('Failed to add record');
    }
  };

  const handleDeleteRecord = async (recordId, dogId) => {
    try {
      await axios.delete(`${API}/health/${recordId}`, { withCredentials: true });
      toast.success('Record deleted');
      fetchRecords(dogId);
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const handleAnalyzeSymptoms = async (dogId) => {
    if (symptoms.length === 0) {
      toast.error('Please add at least one symptom');
      return;
    }
    setAnalyzing(true);
    try {
      const response = await axios.post(`${API}/health/analyze`, {
        dog_id: dogId,
        symptoms,
        severity,
        additional_info: additionalInfo
      }, { withCredentials: true });
      setAnalysisResult(response.data.analysis);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze symptoms');
    } finally {
      setAnalyzing(false);
    }
  };

  const addSymptom = (symptom) => {
    if (symptom && !symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
      setCurrentSymptom('');
    }
  };

  return (
    <AppLayout user={user}>
      {({ selectedDog }) => {
        useEffect(() => {
          if (selectedDog) {
            fetchRecords(selectedDog.dog_id);
          }
        }, [selectedDog]);

        if (!selectedDog) {
          return (
            <div className="text-center py-16" data-testid="no-dog-message">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading font-semibold text-xl mb-2">No Dog Selected</h2>
              <p className="text-muted-foreground">Please add a dog from the dashboard to track health.</p>
            </div>
          );
        }

        return (
          <div className="space-y-8 animate-fade-in" data-testid="health-hub">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                  Health Hub
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track {selectedDog.name}'s health records and symptoms
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-accent p-1 rounded-full">
                <TabsTrigger value="records" className="rounded-full px-6" data-testid="tab-records">
                  Health Records
                </TabsTrigger>
                <TabsTrigger value="analyzer" className="rounded-full px-6" data-testid="tab-analyzer">
                  Symptom Analyzer
                </TabsTrigger>
              </TabsList>

              {/* Health Records Tab */}
              <TabsContent value="records" className="mt-6">
                <div className="flex justify-end mb-4">
                  <Dialog open={addRecordOpen} onOpenChange={setAddRecordOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-full bg-primary hover:bg-primary-hover" data-testid="add-record-btn">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-heading">Add Health Record</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Record Type</Label>
                          <Select 
                            value={newRecord.record_type} 
                            onValueChange={(v) => setNewRecord({ ...newRecord, record_type: v })}
                          >
                            <SelectTrigger data-testid="record-type-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vaccination">Vaccination</SelectItem>
                              <SelectItem value="checkup">Checkup</SelectItem>
                              <SelectItem value="medication">Medication</SelectItem>
                              <SelectItem value="illness">Illness</SelectItem>
                              <SelectItem value="surgery">Surgery</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Title *</Label>
                          <Input
                            data-testid="record-title-input"
                            value={newRecord.title}
                            onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                            placeholder="e.g., Annual Rabies Vaccine"
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start" data-testid="date-picker-btn">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {format(selectedDate, 'PPP')}
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
                        </div>
                        <div>
                          <Label>Description *</Label>
                          <Textarea
                            data-testid="record-description-input"
                            value={newRecord.description}
                            onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                            placeholder="Details about the health record..."
                          />
                        </div>
                        <div>
                          <Label>Vet Name</Label>
                          <Input
                            data-testid="record-vet-input"
                            value={newRecord.vet_name}
                            onChange={(e) => setNewRecord({ ...newRecord, vet_name: e.target.value })}
                            placeholder="Dr. Smith"
                          />
                        </div>
                        <Button 
                          onClick={() => handleAddRecord(selectedDog.dog_id)}
                          className="w-full rounded-full bg-primary hover:bg-primary-hover"
                          data-testid="submit-record-btn"
                        >
                          Add Record
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Timeline */}
                {records.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-4">
                      {records.map((record, index) => {
                        const config = recordTypeConfig[record.record_type] || recordTypeConfig.checkup;
                        const Icon = config.icon;
                        return (
                          <div
                            key={record.record_id}
                            className="relative flex gap-4 animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                            data-testid={`health-record-${record.record_id}`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${config.color.split(' ')[0]}`}>
                              <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
                            </div>
                            <Card className="flex-1 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-heading font-semibold">{record.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{record.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                      <span>{format(new Date(record.date), 'MMM d, yyyy')}</span>
                                      {record.vet_name && <span>• {record.vet_name}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${config.color} border-0 capitalize`}>
                                      {record.record_type}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteRecord(record.record_id, selectedDog.dog_id)}
                                      data-testid={`delete-record-${record.record_id}`}
                                    >
                                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Card className="bg-white rounded-2xl shadow-card p-12 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading font-semibold text-lg mb-2">No Health Records</h3>
                    <p className="text-muted-foreground">Start tracking vaccinations, checkups, and more.</p>
                  </Card>
                )}
              </TabsContent>

              {/* Symptom Analyzer Tab */}
              <TabsContent value="analyzer" className="mt-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Input Section */}
                  <Card className="bg-white rounded-2xl shadow-card">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-xl">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold">AI Symptom Analyzer</h3>
                          <p className="text-sm text-muted-foreground">Powered by GPT-5.2</p>
                        </div>
                      </div>

                      {/* Selected Symptoms */}
                      <div>
                        <Label>Selected Symptoms</Label>
                        <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-3 bg-accent rounded-xl">
                          {symptoms.length === 0 ? (
                            <span className="text-sm text-muted-foreground">No symptoms selected</span>
                          ) : (
                            symptoms.map((s, i) => (
                              <Badge key={i} variant="secondary" className="gap-1">
                                {s}
                                <X 
                                  className="w-3 h-3 cursor-pointer" 
                                  onClick={() => setSymptoms(symptoms.filter((_, idx) => idx !== i))}
                                />
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Add Custom Symptom */}
                      <div>
                        <Label>Add Symptom</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            data-testid="symptom-input"
                            value={currentSymptom}
                            onChange={(e) => setCurrentSymptom(e.target.value)}
                            placeholder="Type a symptom..."
                            onKeyPress={(e) => e.key === 'Enter' && addSymptom(currentSymptom)}
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => addSymptom(currentSymptom)}
                            data-testid="add-symptom-btn"
                          >
                            Add
                          </Button>
                        </div>
                      </div>

                      {/* Common Symptoms */}
                      <div>
                        <Label>Common Symptoms</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {commonSymptoms.map((s, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="rounded-full text-xs"
                              onClick={() => addSymptom(s)}
                              disabled={symptoms.includes(s)}
                              data-testid={`common-symptom-${i}`}
                            >
                              {s}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Severity */}
                      <div>
                        <Label>Severity Level</Label>
                        <Select value={severity} onValueChange={setSeverity}>
                          <SelectTrigger data-testid="severity-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild - Just noticed</SelectItem>
                            <SelectItem value="moderate">Moderate - Persistent</SelectItem>
                            <SelectItem value="severe">Severe - Very concerning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Additional Info */}
                      <div>
                        <Label>Additional Information</Label>
                        <Textarea
                          data-testid="additional-info-input"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                          placeholder="Any other relevant details..."
                          className="mt-2"
                        />
                      </div>

                      <Button
                        onClick={() => handleAnalyzeSymptoms(selectedDog.dog_id)}
                        disabled={analyzing || symptoms.length === 0}
                        className="w-full rounded-full bg-primary hover:bg-primary-hover"
                        data-testid="analyze-btn"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Analyze Symptoms
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Results Section */}
                  <Card className="bg-white rounded-2xl shadow-card">
                    <CardContent className="p-6">
                      <h3 className="font-heading font-semibold mb-4">Analysis Results</h3>
                      {analysisResult ? (
                        <ScrollArea className="h-[500px]">
                          <div className="prose prose-sm max-w-none" data-testid="analysis-result">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                              <p className="text-sm text-yellow-800 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                This analysis is for informational purposes only and is not a substitute for professional veterinary care.
                              </p>
                            </div>
                            <div className="whitespace-pre-wrap text-sm">
                              {analysisResult}
                            </div>
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="h-[500px] flex items-center justify-center text-center">
                          <div>
                            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              Add symptoms and click analyze to get AI-powered health insights
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );
      }}
    </AppLayout>
  );
};

export default HealthHub;
