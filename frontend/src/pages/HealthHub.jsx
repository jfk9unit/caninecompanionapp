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
import { Progress } from "@/components/ui/progress";
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
  Trash2,
  Activity,
  Weight,
  Ruler,
  Dna,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  ChevronRight,
  Download,
  Share2,
  PawPrint
} from "lucide-react";

const recordTypeConfig = {
  vaccination: { icon: Syringe, color: 'bg-blue-100 text-blue-700', label: 'Vaccination' },
  checkup: { icon: Stethoscope, color: 'bg-green-100 text-green-700', label: 'Checkup' },
  medication: { icon: Pill, color: 'bg-purple-100 text-purple-700', label: 'Medication' },
  illness: { icon: AlertCircle, color: 'bg-red-100 text-red-700', label: 'Illness' },
  surgery: { icon: FileText, color: 'bg-orange-100 text-orange-700', label: 'Surgery' },
  dental: { icon: Sparkles, color: 'bg-cyan-100 text-cyan-700', label: 'Dental' },
  grooming: { icon: PawPrint, color: 'bg-pink-100 text-pink-700', label: 'Grooming' }
};

// Dog Profile Overview Card
const DogProfileCard = ({ dog }) => {
  if (!dog) return null;
  
  const age = dog.age || {};
  const ageText = [
    age.years && `${age.years}y`,
    age.months && `${age.months}m`,
    age.days && `${age.days}d`
  ].filter(Boolean).join(' ') || 'Unknown';
  
  return (
    <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-green-50 to-emerald-50 border-0">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Dog Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
              {dog.name?.charAt(0) || '🐕'}
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg">
              {dog.gender === 'male' ? '♂️' : dog.gender === 'female' ? '♀️' : '🐕'}
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="font-heading font-bold text-2xl text-foreground">{dog.name}</h2>
            <p className="text-muted-foreground">{dog.breed || 'Unknown Breed'}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="bg-white/70 rounded-xl p-3 text-center">
                <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-semibold text-sm">{ageText}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3 text-center">
                <Weight className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-semibold text-sm">{dog.weight ? `${dog.weight} kg` : 'Not set'}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3 text-center">
                <Dna className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                <p className="text-xs text-muted-foreground">Microchip</p>
                <p className="font-semibold text-sm truncate">{dog.microchip_id || 'Not set'}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3 text-center">
                <Activity className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold text-sm text-green-600">Healthy</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Health Stats Summary
const HealthSummary = ({ records }) => {
  const now = new Date();
  const thisYear = records.filter(r => new Date(r.date).getFullYear() === now.getFullYear());
  const vaccinations = records.filter(r => r.record_type === 'vaccination');
  const recentCheckup = records.filter(r => r.record_type === 'checkup').sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  
  // Check if vaccinations are up to date (last one within 1 year)
  const lastVaccination = vaccinations.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const vaccinationsUpToDate = lastVaccination && 
    (now - new Date(lastVaccination.date)) < (365 * 24 * 60 * 60 * 1000);
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Syringe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{vaccinations.length}</p>
              <p className="text-xs text-blue-600">Vaccinations</p>
            </div>
          </div>
          <div className="mt-3">
            {vaccinationsUpToDate ? (
              <Badge className="bg-green-100 text-green-700 rounded-full text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Up to date
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 rounded-full text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Check needed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-xl">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{thisYear.filter(r => r.record_type === 'checkup').length}</p>
              <p className="text-xs text-green-600">Checkups this year</p>
            </div>
          </div>
          {recentCheckup && (
            <p className="text-xs text-green-600 mt-3">
              Last: {format(new Date(recentCheckup.date), 'MMM d, yyyy')}
            </p>
          )}
        </CardContent>
      </Card>
      
      <Card className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-xl">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{records.filter(r => r.record_type === 'medication').length}</p>
              <p className="text-xs text-purple-600">Medications</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{records.length}</p>
              <p className="text-xs text-amber-600">Total records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Health Timeline Record Card
const HealthRecordCard = ({ record, onDelete }) => {
  const config = recordTypeConfig[record.record_type] || recordTypeConfig.checkup;
  const Icon = config.icon;
  
  return (
    <Card className="rounded-xl hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold">{record.title || config.label}</h4>
                <Badge variant="outline" className="rounded-full text-xs mt-1 capitalize">
                  {record.record_type}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-700 rounded-full text-xs">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {format(new Date(record.date), 'MMM d, yyyy')}
                </Badge>
                <Button
                  onClick={() => onDelete(record.record_id)}
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {record.description && (
              <p className="text-sm text-muted-foreground mt-2">{record.description}</p>
            )}
            
            <div className="flex flex-wrap gap-3 mt-3">
              {record.vet_name && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Dr. {record.vet_name}
                </span>
              )}
              {record.clinic_name && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {record.clinic_name}
                </span>
              )}
              {record.next_due && (
                <Badge className="bg-blue-50 text-blue-700 rounded-full text-xs">
                  Next due: {format(new Date(record.next_due), 'MMM d, yyyy')}
                </Badge>
              )}
            </div>
            
            {record.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1">Notes:</p>
                <p className="text-sm">{record.notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Vet Contact Card
const VetContactCard = ({ vet, onEdit }) => {
  return (
    <Card className="rounded-xl hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">Dr. {vet.name}</h4>
                <p className="text-sm text-muted-foreground">{vet.specialty || 'General Veterinarian'}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-3">
              {vet.clinic && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {vet.clinic}
                </span>
              )}
              {vet.phone && (
                <a href={`tel:${vet.phone}`} className="text-sm text-primary flex items-center gap-1 hover:underline">
                  <Phone className="w-4 h-4" />
                  {vet.phone}
                </a>
              )}
            </div>
            
            {vet.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">{vet.notes}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Health Content Component
const HealthContent = ({ user, selectedDog }) => {
  const [records, setRecords] = useState([]);
  const [vets, setVets] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [addVetOpen, setAddVetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState({
    record_type: 'checkup',
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    vet_name: '',
    clinic_name: '',
    notes: '',
    next_due: ''
  });
  const [newVet, setNewVet] = useState({
    name: '',
    clinic: '',
    phone: '',
    specialty: '',
    notes: ''
  });

  useEffect(() => {
    if (selectedDog?.dog_id) {
      fetchRecords(selectedDog.dog_id);
      fetchVets();
    }
  }, [selectedDog]);

  const fetchRecords = async (dogId) => {
    try {
      const response = await axios.get(`${API}/health/${dogId}/records`, { withCredentials: true });
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVets = async () => {
    try {
      const response = await axios.get(`${API}/vets`, { withCredentials: true });
      setVets(response.data || []);
    } catch (error) {
      console.error('Failed to fetch vets:', error);
    }
  };

  const addRecord = async () => {
    if (!selectedDog) return;
    
    try {
      await axios.post(`${API}/health/${selectedDog.dog_id}/records`, {
        ...newRecord,
        date: selectedDate.toISOString().split('T')[0]
      }, { withCredentials: true });
      
      toast.success('Health record added!');
      setAddRecordOpen(false);
      setNewRecord({
        record_type: 'checkup',
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        vet_name: '',
        clinic_name: '',
        notes: '',
        next_due: ''
      });
      fetchRecords(selectedDog.dog_id);
    } catch (error) {
      toast.error('Failed to add record');
    }
  };

  const deleteRecord = async (recordId) => {
    if (!selectedDog) return;
    
    try {
      await axios.delete(`${API}/health/${selectedDog.dog_id}/records/${recordId}`, { withCredentials: true });
      toast.success('Record deleted');
      fetchRecords(selectedDog.dog_id);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const addVet = async () => {
    try {
      await axios.post(`${API}/vets`, newVet, { withCredentials: true });
      toast.success('Vet added!');
      setAddVetOpen(false);
      setNewVet({ name: '', clinic: '', phone: '', specialty: '', notes: '' });
      fetchVets();
    } catch (error) {
      toast.error('Failed to add vet');
    }
  };

  const exportRecords = () => {
    const data = records.map(r => ({
      Type: r.record_type,
      Title: r.title,
      Date: format(new Date(r.date), 'MMM d, yyyy'),
      Description: r.description,
      Vet: r.vet_name,
      Clinic: r.clinic_name,
      Notes: r.notes
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDog?.name || 'dog'}-health-records.csv`;
    link.click();
    
    toast.success('Records exported!');
  };

  if (!selectedDog) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-green-500/20 flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-primary" />
        </div>
        <h2 className="font-heading font-semibold text-xl mb-2">No Dog Selected</h2>
        <p className="text-muted-foreground">Please add a dog from the dashboard to manage health records.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="health-hub">
      {/* Dog Profile Card */}
      <DogProfileCard dog={selectedDog} />
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList className="bg-white rounded-full p-1 shadow-md">
            <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
            <TabsTrigger value="records" className="rounded-full">Records</TabsTrigger>
            <TabsTrigger value="vets" className="rounded-full">Vets</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              onClick={exportRecords}
              variant="outline"
              className="rounded-full"
              disabled={records.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={addRecordOpen} onOpenChange={setAddRecordOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-gradient-to-r from-primary to-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Health Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Record Type</Label>
                    <Select
                      value={newRecord.record_type}
                      onValueChange={(v) => setNewRecord({ ...newRecord, record_type: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(recordTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newRecord.title}
                      onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                      placeholder="e.g., Annual Checkup"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newRecord.description}
                      onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                      placeholder="Details about the visit..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Vet Name</Label>
                      <Input
                        value={newRecord.vet_name}
                        onChange={(e) => setNewRecord({ ...newRecord, vet_name: e.target.value })}
                        placeholder="Dr. Smith"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Clinic</Label>
                      <Input
                        value={newRecord.clinic_name}
                        onChange={(e) => setNewRecord({ ...newRecord, clinic_name: e.target.value })}
                        placeholder="Pet Care Clinic"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                      placeholder="Additional notes..."
                      className="mt-1"
                    />
                  </div>
                  
                  <Button onClick={addRecord} className="w-full rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Record
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <HealthSummary records={records} />
          
          {/* Recent Activity */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Recent Activity</h3>
            {records.length > 0 ? (
              <div className="space-y-3">
                {records.slice(0, 5).map((record) => (
                  <HealthRecordCard key={record.record_id} record={record} onDelete={deleteRecord} />
                ))}
                {records.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full rounded-full"
                    onClick={() => setActiveTab('records')}
                  >
                    View all {records.length} records
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            ) : (
              <Card className="bg-gray-50 rounded-xl border-dashed">
                <CardContent className="p-8 text-center">
                  <Activity className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-muted-foreground">No health records yet</p>
                  <Button
                    onClick={() => setAddRecordOpen(true)}
                    variant="outline"
                    className="mt-4 rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Record
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="records" className="mt-6">
          <div className="space-y-4">
            {/* Filter by type */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(recordTypeConfig).map(([type, config]) => {
                const count = records.filter(r => r.record_type === type).length;
                return (
                  <Badge
                    key={type}
                    variant="outline"
                    className={`rounded-full cursor-pointer hover:bg-gray-100 ${count === 0 ? 'opacity-50' : ''}`}
                  >
                    {config.label} ({count})
                  </Badge>
                );
              })}
            </div>
            
            {/* Records List */}
            {records.length > 0 ? (
              <div className="space-y-3">
                {records.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => (
                  <HealthRecordCard key={record.record_id} record={record} onDelete={deleteRecord} />
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50 rounded-xl border-dashed">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Records Yet</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your dog's health by adding records.</p>
                  <Button onClick={() => setAddRecordOpen(true)} className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Record
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="vets" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-lg">Your Veterinarians</h3>
            <Dialog open={addVetOpen} onOpenChange={setAddVetOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Veterinarian</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newVet.name}
                      onChange={(e) => setNewVet({ ...newVet, name: e.target.value })}
                      placeholder="Dr. Smith"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Clinic</Label>
                    <Input
                      value={newVet.clinic}
                      onChange={(e) => setNewVet({ ...newVet, clinic: e.target.value })}
                      placeholder="Happy Paws Clinic"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={newVet.phone}
                      onChange={(e) => setNewVet({ ...newVet, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Specialty</Label>
                    <Input
                      value={newVet.specialty}
                      onChange={(e) => setNewVet({ ...newVet, specialty: e.target.value })}
                      placeholder="General / Surgery / Dental"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={newVet.notes}
                      onChange={(e) => setNewVet({ ...newVet, notes: e.target.value })}
                      placeholder="Emergency availability, etc."
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={addVet} className="w-full rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {vets.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {vets.map((vet, idx) => (
                <VetContactCard key={idx} vet={vet} onEdit={() => {}} />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50 rounded-xl border-dashed">
              <CardContent className="p-12 text-center">
                <Stethoscope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Vets Added</h3>
                <p className="text-muted-foreground mb-4">Add your veterinarian's contact for quick access.</p>
                <Button onClick={() => setAddVetOpen(true)} className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Vet
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const HealthHub = ({ user }) => {
  return (
    <AppLayout user={user}>
      {({ selectedDog }) => (
        <HealthContent user={user} selectedDog={selectedDog} />
      )}
    </AppLayout>
  );
};

export default HealthHub;
