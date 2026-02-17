import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User,
  Star,
  MapPin,
  Clock,
  Video,
  Car,
  Calculator,
  Calendar,
  CheckCircle,
  Award,
  MessageSquare,
  PoundSterling,
  AlertTriangle,
  ChevronRight,
  Shield,
  Target,
  Wrench,
  Heart
} from "lucide-react";

export const BookK9Trainer = ({ user }) => {
  const [trainers, setTrainers] = useState([]);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [sessionType, setSessionType] = useState("virtual");
  const [duration, setDuration] = useState("60min");
  const [fromPostcode, setFromPostcode] = useState("");
  const [toPostcode, setToPostcode] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trainersRes, pricingRes] = await Promise.all([
        axios.get(`${API}/trainers`, { withCredentials: true }),
        axios.get(`${API}/trainers/pricing/info`, { withCredentials: true })
      ]);
      setTrainers(trainersRes.data.trainers);
      setPricingInfo(pricingRes.data);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = async () => {
    setCalculating(true);
    try {
      const response = await axios.post(`${API}/trainers/calculate-cost`, {
        session_type: sessionType,
        duration: duration,
        from_postcode: fromPostcode,
        to_postcode: toPostcode
      }, { withCredentials: true });
      setCostBreakdown(response.data);
    } catch (error) {
      toast.error("Failed to calculate cost");
    } finally {
      setCalculating(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedTrainer || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setBooking(true);
    try {
      const response = await axios.post(`${API}/trainers/book`, {
        trainer_id: selectedTrainer.trainer_id,
        session_type: sessionType,
        duration: duration,
        date: selectedDate,
        time: selectedTime,
        from_postcode: sessionType === "in_person" ? fromPostcode : null,
        to_postcode: sessionType === "in_person" ? toPostcode : null,
        notes: notes
      }, { withCredentials: true });
      
      toast.success("Booking created successfully!");
      setShowBookingDialog(false);
      // Reset form
      setSelectedTrainer(null);
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
      setCostBreakdown(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create booking");
    } finally {
      setBooking(false);
    }
  };

  useEffect(() => {
    if (sessionType === "in_person" && fromPostcode && toPostcode) {
      const timer = setTimeout(() => calculateCost(), 500);
      return () => clearTimeout(timer);
    } else if (sessionType === "virtual") {
      calculateCost();
    }
  }, [sessionType, duration, fromPostcode, toPostcode]);

  if (loading) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-8 animate-fade-in" data-testid="book-k9-trainer">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633969995096-457343d5d1ef?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85')] bg-cover bg-center opacity-20"></div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <User className="w-8 h-8 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-1">
                  UK Only
                </Badge>
              </div>
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                Book Your Personal
                <span className="block text-purple-300">K9 Trainer</span>
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mb-6">
                Expert trainers verified by AI, specialising in behaviour modification, 
                protection training, and professional K9 development.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  AI Verified
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                  <Video className="w-4 h-4 mr-1" />
                  Virtual Sessions
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1">
                  <Car className="w-4 h-4 mr-1" />
                  Home Visits
                </Badge>
              </div>
            </div>
          </div>

          {/* Pricing Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  Virtual Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span>30 Minutes</span>
                  <span className="font-bold text-blue-600">£29.99</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span>1 Hour</span>
                  <span className="font-bold text-blue-600">£45.00</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-600" />
                  In-Person (Home Visit)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span>1 Hour</span>
                  <span className="font-bold text-amber-600">£179.99</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span>2 Hours</span>
                  <span className="font-bold text-amber-600">£320.00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span>3 Hours Intensive</span>
                  <span className="font-bold text-amber-600">£420.00</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  + £25 call-out fee + £0.85/mile travel
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trainers Grid */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-6">Our Approved Trainers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer, index) => (
                <Card 
                  key={trainer.trainer_id}
                  className="rounded-2xl overflow-hidden shadow-card card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`trainer-card-${trainer.trainer_id}`}
                >
                  <div className="h-48 relative">
                    <img 
                      src={trainer.image_url}
                      alt={trainer.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    {trainer.verified && (
                      <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        AI Verified
                      </Badge>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-semibold text-white text-lg">{trainer.name}</h3>
                      <p className="text-white/80 text-sm">{trainer.title}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold">{trainer.rating}</span>
                        <span className="text-muted-foreground text-sm">({trainer.reviews} reviews)</span>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        <MapPin className="w-3 h-3 mr-1" />
                        {trainer.location}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {trainer.bio}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {trainer.specializations.slice(0, 3).map((spec, i) => (
                        <Badge key={i} variant="outline" className="rounded-full text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4" />
                      {trainer.experience_years} years experience
                    </div>
                    
                    <Dialog open={showBookingDialog && selectedTrainer?.trainer_id === trainer.trainer_id} onOpenChange={(open) => {
                      setShowBookingDialog(open);
                      if (open) setSelectedTrainer(trainer);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full rounded-full"
                          onClick={() => setSelectedTrainer(trainer)}
                          data-testid={`book-trainer-${trainer.trainer_id}`}
                        >
                          Book Session
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Book {trainer.name}</DialogTitle>
                          <DialogDescription>
                            {trainer.title} - {trainer.location}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                          {/* Session Type */}
                          <div className="space-y-2">
                            <Label>Session Type</Label>
                            <Tabs value={sessionType} onValueChange={setSessionType}>
                              <TabsList className="w-full">
                                <TabsTrigger value="virtual" className="flex-1">
                                  <Video className="w-4 h-4 mr-2" />
                                  Virtual
                                </TabsTrigger>
                                <TabsTrigger value="in_person" className="flex-1">
                                  <Car className="w-4 h-4 mr-2" />
                                  In-Person
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                          </div>
                          
                          {/* Duration */}
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Select value={duration} onValueChange={setDuration}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sessionType === "virtual" ? (
                                  <>
                                    <SelectItem value="30min">30 Minutes - £29.99</SelectItem>
                                    <SelectItem value="60min">1 Hour - £45.00</SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="60min">1 Hour - £179.99</SelectItem>
                                    <SelectItem value="120min">2 Hours - £320.00</SelectItem>
                                    <SelectItem value="180min">3 Hours Intensive - £420.00</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Postcodes for in-person */}
                          {sessionType === "in_person" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Trainer's Postcode</Label>
                                <Input 
                                  placeholder="e.g., SW1A 1AA"
                                  value={fromPostcode}
                                  onChange={(e) => setFromPostcode(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Your Postcode</Label>
                                <Input 
                                  placeholder="e.g., EC1A 1BB"
                                  value={toPostcode}
                                  onChange={(e) => setToPostcode(e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Date and Time */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Date</Label>
                              <Input 
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <Select value={selectedTime} onValueChange={setSelectedTime}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          {/* Notes */}
                          <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Textarea 
                              placeholder="Describe your training goals or any behavioural issues..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          {/* Cost Breakdown */}
                          {costBreakdown && (
                            <Card className="bg-slate-50 rounded-xl border-0">
                              <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Session Cost</span>
                                  <span>£{costBreakdown.session_cost.toFixed(2)}</span>
                                </div>
                                {costBreakdown.call_out_fee > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span>Call-out Fee</span>
                                    <span>£{costBreakdown.call_out_fee.toFixed(2)}</span>
                                  </div>
                                )}
                                {costBreakdown.travel_cost > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span>Travel ({costBreakdown.estimated_miles} miles)</span>
                                    <span>£{costBreakdown.travel_cost.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                  <span>Total</span>
                                  <span className="text-primary">£{costBreakdown.total.toFixed(2)}</span>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          
                          {/* Important Notice */}
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm text-amber-700">
                                <p className="font-semibold">Important:</p>
                                <p>£25 admin fee applies for rescheduling. All fees are non-refundable.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            onClick={handleBooking}
                            disabled={booking || !selectedDate || !selectedTime}
                            className="w-full rounded-full"
                            data-testid="confirm-booking-btn"
                          >
                            {booking ? "Booking..." : (
                              <>
                                <Calendar className="w-4 h-4 mr-2" />
                                Confirm Booking - £{costBreakdown?.total.toFixed(2) || '...'}
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Equipment & Issues Section */}
          {pricingInfo && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Equipment Used */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      Training Equipment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pricingInfo.equipment.map((item, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* Behavioural Issues */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Issues We Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pricingInfo.behavioural_issues.slice(0, 5).map((issue, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-sm">{issue.issue}</p>
                          <Badge variant="outline" className="text-xs">{issue.typical_sessions}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{issue.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Terms Notice */}
          <Card className="bg-slate-900 text-white rounded-2xl border-0">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Terms & Conditions
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  All trainers are AI-verified and approved by our team
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Rescheduling incurs a £25 admin fee - please ensure your calendar fits the trainer's schedule
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  All fees are non-refundable once booking is confirmed
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Travel costs vary based on distance and may include hotel stays for remote locations
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Currently available for UK customers only - EU and USA expansion coming soon
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default BookK9Trainer;
