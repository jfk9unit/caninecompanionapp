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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plane,
  Plus,
  MapPin,
  Calendar,
  CheckSquare,
  Trash2,
  Luggage,
  FileCheck
} from "lucide-react";

export const TravelPlanner = ({ user }) => {
  const [checklists, setChecklists] = useState([]);
  const [defaultItems, setDefaultItems] = useState([]);
  const [addChecklistOpen, setAddChecklistOpen] = useState(false);
  const [newChecklist, setNewChecklist] = useState({
    title: '',
    destination: '',
    travel_date: '',
    notes: ''
  });
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const response = await axios.get(`${API}/travel/defaults/items`, { withCredentials: true });
        setDefaultItems(response.data);
        setSelectedItems(response.data.map(item => ({ ...item, checked: false })));
      } catch (error) {
        console.error('Failed to fetch defaults:', error);
      }
    };
    fetchDefaults();
  }, []);

  const fetchChecklists = async (dogId) => {
    try {
      const response = await axios.get(`${API}/travel/${dogId}`, { withCredentials: true });
      setChecklists(response.data);
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
    }
  };

  const handleAddChecklist = async (dogId) => {
    if (!newChecklist.title || !newChecklist.destination) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      await axios.post(`${API}/travel`, {
        dog_id: dogId,
        ...newChecklist,
        items: selectedItems
      }, { withCredentials: true });
      toast.success('Travel checklist created');
      setAddChecklistOpen(false);
      setNewChecklist({ title: '', destination: '', travel_date: '', notes: '' });
      setSelectedItems(defaultItems.map(item => ({ ...item, checked: false })));
      fetchChecklists(dogId);
    } catch (error) {
      toast.error('Failed to create checklist');
    }
  };

  const handleToggleItem = async (checklistId, itemIndex, checked, dogId) => {
    try {
      await axios.put(`${API}/travel/${checklistId}/item?item_index=${itemIndex}&checked=${checked}`, {}, { withCredentials: true });
      fetchChecklists(dogId);
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDeleteChecklist = async (checklistId, dogId) => {
    try {
      await axios.delete(`${API}/travel/${checklistId}`, { withCredentials: true });
      toast.success('Checklist deleted');
      fetchChecklists(dogId);
    } catch (error) {
      toast.error('Failed to delete checklist');
    }
  };

  const toggleNewItem = (index) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    ));
  };

  const addCustomItem = (itemName) => {
    if (itemName.trim()) {
      setSelectedItems(prev => [...prev, { item: itemName.trim(), checked: false }]);
    }
  };

  return (
    <AppLayout user={user}>
      {({ selectedDog }) => {
        useEffect(() => {
          if (selectedDog) {
            fetchChecklists(selectedDog.dog_id);
          }
        }, [selectedDog]);

        if (!selectedDog) {
          return (
            <div className="text-center py-16" data-testid="no-dog-message">
              <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading font-semibold text-xl mb-2">No Dog Selected</h2>
              <p className="text-muted-foreground">Please add a dog from the dashboard to plan travel.</p>
            </div>
          );
        }

        return (
          <div className="space-y-8 animate-fade-in" data-testid="travel-planner">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                  Travel Planner
                </h1>
                <p className="text-muted-foreground mt-1">
                  Plan trips with {selectedDog.name} and never forget essentials
                </p>
              </div>
              <Dialog open={addChecklistOpen} onOpenChange={setAddChecklistOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-primary hover:bg-primary-hover" data-testid="add-checklist-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    New Trip
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Plan New Trip</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Trip Name *</Label>
                      <Input
                        data-testid="trip-title-input"
                        value={newChecklist.title}
                        onChange={(e) => setNewChecklist({ ...newChecklist, title: e.target.value })}
                        placeholder="e.g., Beach Vacation"
                      />
                    </div>
                    <div>
                      <Label>Destination *</Label>
                      <Input
                        data-testid="trip-destination-input"
                        value={newChecklist.destination}
                        onChange={(e) => setNewChecklist({ ...newChecklist, destination: e.target.value })}
                        placeholder="e.g., Malibu, CA"
                      />
                    </div>
                    <div>
                      <Label>Travel Date</Label>
                      <Input
                        data-testid="trip-date-input"
                        type="date"
                        value={newChecklist.travel_date}
                        onChange={(e) => setNewChecklist({ ...newChecklist, travel_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Packing Checklist</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto bg-accent rounded-xl p-3">
                        {selectedItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={() => toggleNewItem(index)}
                              data-testid={`checklist-item-${index}`}
                            />
                            <span className={`text-sm ${item.checked ? '' : 'text-muted-foreground'}`}>
                              {item.item}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add custom item..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addCustomItem(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        data-testid="trip-notes-input"
                        value={newChecklist.notes}
                        onChange={(e) => setNewChecklist({ ...newChecklist, notes: e.target.value })}
                        placeholder="Any special notes for this trip..."
                      />
                    </div>
                    <Button 
                      onClick={() => handleAddChecklist(selectedDog.dog_id)}
                      className="w-full rounded-full bg-primary hover:bg-primary-hover"
                      data-testid="submit-checklist-btn"
                    >
                      Create Trip
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Hero Image */}
            <div className="relative h-48 rounded-2xl overflow-hidden shadow-card">
              <img
                src="https://images.unsplash.com/photo-1668522907255-62950845ff46?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
                alt="Travel with dog"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                <div className="p-8 text-white">
                  <h2 className="font-heading font-bold text-2xl">Travel with Confidence</h2>
                  <p className="text-white/80 mt-1">Never forget essential items for your furry friend</p>
                </div>
              </div>
            </div>

            {/* Checklists */}
            {checklists.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 stagger-children">
                {checklists.map((checklist, index) => {
                  const checkedCount = checklist.items.filter(i => i.checked).length;
                  const progress = (checkedCount / checklist.items.length) * 100;
                  const isComplete = progress === 100;
                  
                  return (
                    <Card
                      key={checklist.checklist_id}
                      className={`bg-white rounded-2xl shadow-card card-hover animate-fade-in ${
                        isComplete ? 'ring-2 ring-green-500' : ''
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      data-testid={`checklist-card-${checklist.checklist_id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-heading font-semibold text-lg">{checklist.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {checklist.destination}
                              </span>
                              {checklist.travel_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(checklist.travel_date), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteChecklist(checklist.checklist_id, selectedDog.dog_id)}
                            data-testid={`delete-checklist-${checklist.checklist_id}`}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Packing Progress</span>
                            <span className="font-medium">{checkedCount}/{checklist.items.length}</span>
                          </div>
                          <Progress value={progress} className="h-2 bg-gray-100" />
                        </div>

                        {/* Items */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {checklist.items.map((item, itemIndex) => (
                            <div 
                              key={itemIndex}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                            >
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={(checked) => 
                                  handleToggleItem(checklist.checklist_id, itemIndex, checked, selectedDog.dog_id)
                                }
                                data-testid={`item-${checklist.checklist_id}-${itemIndex}`}
                              />
                              <span className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                                {item.item}
                              </span>
                            </div>
                          ))}
                        </div>

                        {checklist.notes && (
                          <div className="mt-4 p-3 bg-accent rounded-xl">
                            <p className="text-xs text-muted-foreground">{checklist.notes}</p>
                          </div>
                        )}

                        {isComplete && (
                          <div className="flex items-center gap-2 mt-4 text-green-600">
                            <FileCheck className="w-4 h-4" />
                            <span className="text-sm font-medium">Ready to go!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-white rounded-2xl shadow-card p-12 text-center">
                <Luggage className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">No Trips Planned</h3>
                <p className="text-muted-foreground mb-4">
                  Create a checklist for your next adventure with {selectedDog.name}.
                </p>
                <Button 
                  onClick={() => setAddChecklistOpen(true)}
                  className="rounded-full bg-primary hover:bg-primary-hover"
                  data-testid="empty-add-checklist-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Plan Trip
                </Button>
              </Card>
            )}

            {/* Travel Tips */}
            <Card className="bg-gradient-to-br from-green-50 to-orange-50 border-0 shadow-card">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Travel Tips</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Visit the Vet', desc: 'Get a health check and update vaccinations before travel.' },
                    { title: 'ID Tags & Microchip', desc: 'Ensure contact info is current on tags and microchip.' },
                    { title: 'Car Safety', desc: 'Use a secured crate or dog seatbelt for car travel.' },
                    { title: 'Research Pet Policies', desc: 'Confirm pet-friendly accommodations and attractions.' },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tip.title}</p>
                        <p className="text-xs text-muted-foreground">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </AppLayout>
  );
};

export default TravelPlanner;
