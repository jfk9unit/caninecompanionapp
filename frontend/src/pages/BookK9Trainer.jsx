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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import {
  User,
  Users,
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
  AlertTriangle,
  ChevronRight,
  Shield,
  Wrench,
  Heart,
  CreditCard,
  Mail,
  Plus,
  Minus,
  Trash2,
  Info
} from "lucide-react";

export const BookK9Trainer = ({ user }) => {
  const [searchParams] = useSearchParams();
  const [ourTeam, setOurTeam] = useState([]);
  const [approvedTrainers, setApprovedTrainers] = useState([]);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Multi-trainer selection state
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [sessionType, setSessionType] = useState("in_person");
  const [fromPostcode, setFromPostcode] = useState("");
  const [toPostcode, setToPostcode] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [includeRiskFee, setIncludeRiskFee] = useState(false);
  
  // Calculator state
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showCalculatorDialog, setShowCalculatorDialog] = useState(false);
  const [paymentType, setPaymentType] = useState("deposit");

  useEffect(() => {
    fetchData();
    
    const sessionId = searchParams.get('session_id');
    if (searchParams.get('success') === 'true' && sessionId) {
      pollPaymentStatus(sessionId);
    } else if (searchParams.get('cancelled') === 'true') {
      toast.info("Payment cancelled");
    }
  }, [searchParams]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    if (attempts >= maxAttempts) {
      toast.success("Payment processing. Check your email for confirmation.");
      return;
    }
    try {
      const response = await axios.get(`${API}/payments/checkout/status/${sessionId}`, { withCredentials: true });
      if (response.data.payment_status === 'paid') {
        toast.success("Booking confirmed! Check your email for appointment details.");
        window.history.replaceState({}, document.title, window.location.pathname);
        setSelectedTrainers([]);
        setSelectedDate("");
        setSelectedTime("");
        setNotes("");
        setCostBreakdown(null);
        return;
      }
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [trainersRes, pricingRes] = await Promise.all([
        axios.get(`${API}/trainers`, { withCredentials: true }),
        axios.get(`${API}/trainers/pricing/info`, { withCredentials: true })
      ]);
      setOurTeam(trainersRes.data.our_team || []);
      setApprovedTrainers(trainersRes.data.approved_contractors || []);
      setPricingInfo(pricingRes.data);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTrainer = (trainer) => {
    if (selectedTrainers.find(t => t.trainer_id === trainer.trainer_id)) {
      toast.info("Trainer already added");
      return;
    }
    setSelectedTrainers([...selectedTrainers, { ...trainer, hours: 1 }]);
    toast.success(`${trainer.name} added to booking`);
  };

  const removeTrainer = (trainerId) => {
    setSelectedTrainers(selectedTrainers.filter(t => t.trainer_id !== trainerId));
  };

  const updateTrainerHours = (trainerId, hours) => {
    setSelectedTrainers(selectedTrainers.map(t => 
      t.trainer_id === trainerId ? { ...t, hours: Math.max(1, Math.min(12, hours)) } : t
    ));
  };

  const calculateCost = async () => {
    if (selectedTrainers.length === 0) {
      toast.error("Please select at least one trainer");
      return;
    }
    
    setCalculating(true);
    try {
      const response = await axios.post(`${API}/trainers/calculate-multi`, {
        trainers: selectedTrainers.map(t => ({ trainer_id: t.trainer_id, hours: t.hours })),
        session_type: sessionType,
        date: selectedDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: selectedTime || "10:00",
        from_postcode: fromPostcode,
        to_postcode: toPostcode,
        include_k9_risk_fee: includeRiskFee
      }, { withCredentials: true });
      
      if (response.data.error) {
        toast.error(response.data.message);
        return;
      }
      
      setCostBreakdown(response.data);
      setShowCalculatorDialog(true);
    } catch (error) {
      toast.error("Failed to calculate cost");
    } finally {
      setCalculating(false);
    }
  };

  const handleMultiBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and time");
      return;
    }
    
    setBooking(true);
    try {
      const response = await axios.post(`${API}/trainers/multi-checkout`, {
        trainers: selectedTrainers.map(t => ({ trainer_id: t.trainer_id, hours: t.hours })),
        session_type: sessionType,
        date: selectedDate,
        time: selectedTime,
        from_postcode: sessionType === "in_person" ? fromPostcode : null,
        to_postcode: sessionType === "in_person" ? toPostcode : null,
        notes: notes,
        include_k9_risk_fee: includeRiskFee,
        origin_url: window.location.origin,
        payment_type: paymentType
      }, { withCredentials: true });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create booking");
    } finally {
      setBooking(false);
    }
  };

  // Get minimum date (7 days from now)
  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

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
                <span className="block text-purple-300">K9 Training Team</span>
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mb-6">
                Select multiple trainers for comprehensive training sessions. 
                50% non-refundable deposit secures your booking.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  AI Verified
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Book 7-10 Days Ahead
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                  <CreditCard className="w-4 h-4 mr-1" />
                  50% Deposit
                </Badge>
              </div>
            </div>
          </div>

          {/* Booking Terms Notice */}
          <Card className="bg-amber-50 border-amber-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Info className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">Important Booking Terms</h3>
                  <ul className="mt-2 space-y-1 text-sm text-amber-800">
                    <li>• <strong>50% non-refundable deposit</strong> is required to secure your booking</li>
                    <li>• Please book <strong>7-10 days in advance</strong> to ensure availability</li>
                    <li>• <strong>Full payment</strong> must be made before our team is deployed</li>
                    <li>• Rescheduling incurs a <strong>£30 admin fee</strong></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Trainers & Calculator */}
          {selectedTrainers.length > 0 && (
            <Card className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-600" />
                    Your Booking ({selectedTrainers.length} Trainer{selectedTrainers.length > 1 ? 's' : ''})
                  </span>
                  <Badge className="bg-indigo-600 text-white">
                    {selectedTrainers.reduce((acc, t) => acc + t.hours, 0)} Total Hours
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Trainers List */}
                <div className="space-y-3">
                  {selectedTrainers.map((trainer) => (
                    <div key={trainer.trainer_id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <img 
                          src={trainer.image_url} 
                          alt={trainer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold">{trainer.name}</h4>
                          <p className="text-xs text-muted-foreground">{trainer.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateTrainerHours(trainer.trainer_id, trainer.hours - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-16 text-center font-semibold">{trainer.hours} hr{trainer.hours > 1 ? 's' : ''}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateTrainerHours(trainer.trainer_id, trainer.hours + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeTrainer(trainer.trainer_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Session Type */}
                <div className="space-y-2">
                  <Label>Session Type</Label>
                  <Tabs value={sessionType} onValueChange={setSessionType}>
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="virtual">
                        <Video className="w-4 h-4 mr-2" />
                        Virtual
                      </TabsTrigger>
                      <TabsTrigger value="in_person">
                        <Car className="w-4 h-4 mr-2" />
                        Home Visit
                      </TabsTrigger>
                      <TabsTrigger value="emergency" className="text-red-600 data-[state=active]:text-red-600">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        24/7 Emergency
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
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

                {/* K9 Risk Fee Checkbox */}
                {sessionType === "in_person" && (
                  <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-xl">
                    <Checkbox 
                      id="risk-fee" 
                      checked={includeRiskFee}
                      onCheckedChange={setIncludeRiskFee}
                    />
                    <label htmlFor="risk-fee" className="text-sm">
                      <span className="font-medium">Include K9 Risk & Equipment Fee</span>
                      <span className="text-muted-foreground"> (£10.79 per trainer for dangerous dogs)</span>
                    </label>
                  </div>
                )}

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date (7-10 days ahead)</Label>
                    <Input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((time) => (
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
                    rows={2}
                  />
                </div>

                {/* Calculate Button */}
                <Button 
                  onClick={calculateCost}
                  disabled={calculating}
                  className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700"
                  data-testid="calculate-cost-btn"
                >
                  {calculating ? "Calculating..." : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate Total Cost
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Cost Calculator Dialog */}
          <Dialog open={showCalculatorDialog} onOpenChange={setShowCalculatorDialog}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600" />
                  Cost Breakdown
                </DialogTitle>
                <DialogDescription>
                  Review your booking costs before proceeding to payment
                </DialogDescription>
              </DialogHeader>
              
              {costBreakdown && (
                <div className="space-y-4 py-4">
                  {/* Trainer Breakdowns */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Per Trainer Costs</h4>
                    {costBreakdown.trainer_breakdowns.map((tb, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{tb.trainer_name}</span>
                          <span className="font-bold text-indigo-600">£{tb.trainer_total.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {tb.hours} hour{tb.hours > 1 ? 's' : ''} × £{tb.hourly_rate.toFixed(2)}/hr
                          {tb.k9_risk_fee > 0 && ` + £${tb.k9_risk_fee.toFixed(2)} risk fee`}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <Card className="bg-slate-100 rounded-xl border-0">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Session Costs ({costBreakdown.summary.total_trainers} trainer{costBreakdown.summary.total_trainers > 1 ? 's' : ''}, {costBreakdown.summary.total_hours} hrs)</span>
                        <span>£{costBreakdown.summary.session_costs_subtotal.toFixed(2)}</span>
                      </div>
                      {costBreakdown.summary.k9_risk_fees_total > 0 && (
                        <div className="flex justify-between text-sm text-amber-700">
                          <span>K9 Risk & Equipment Fees</span>
                          <span>£{costBreakdown.summary.k9_risk_fees_total.toFixed(2)}</span>
                        </div>
                      )}
                      {costBreakdown.summary.call_out_fee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Call-out Fee</span>
                          <span>£{costBreakdown.summary.call_out_fee.toFixed(2)}</span>
                        </div>
                      )}
                      {costBreakdown.summary.travel_cost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Travel ({costBreakdown.summary.estimated_miles} miles)</span>
                          <span>£{costBreakdown.summary.travel_cost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-300">
                        <span>Grand Total</span>
                        <span className="text-indigo-600">£{costBreakdown.summary.grand_total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Options */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Payment Option</h4>
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentType === 'deposit' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}
                      onClick={() => setPaymentType('deposit')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">50% Deposit (Recommended)</p>
                          <p className="text-xs text-muted-foreground">Pay remaining balance before deployment</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-indigo-600">£{costBreakdown.payment_terms.deposit_amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Due now</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentType === 'full' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}
                      onClick={() => setPaymentType('full')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Full Payment</p>
                          <p className="text-xs text-muted-foreground">Pay everything upfront</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-indigo-600">£{costBreakdown.summary.grand_total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Due now</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remaining Balance Notice */}
                  {paymentType === 'deposit' && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p><strong>Remaining Balance: £{costBreakdown.payment_terms.remaining_balance.toFixed(2)}</strong></p>
                          <p>Must be paid before our team is deployed to your location.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Policies */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700">
                        <p className="font-semibold">Important:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>50% deposit is non-refundable</li>
                          <li>Rescheduling fee: £{costBreakdown.policies.rescheduling_fee.toFixed(2)}</li>
                          <li>Please book 7-10 days in advance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex-col gap-2">
                <Button 
                  onClick={handleMultiBooking}
                  disabled={booking || !selectedDate || !selectedTime}
                  className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700"
                  data-testid="proceed-payment-btn"
                >
                  {booking ? "Processing..." : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {paymentType === 'deposit' 
                        ? `Pay Deposit - £${costBreakdown?.payment_terms.deposit_amount.toFixed(2)}`
                        : `Pay Full Amount - £${costBreakdown?.summary.grand_total.toFixed(2)}`
                      }
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  <Mail className="w-3 h-3 inline mr-1" />
                  Confirmation email will be sent after payment
                </p>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pricing Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  Virtual Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span>Per Hour</span>
                  <span className="font-bold text-blue-600">£81.00</span>
                </div>
                <p className="text-xs text-muted-foreground">Prices include all fees</p>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-600" />
                  Home Visit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span>Per Hour</span>
                  <span className="font-bold text-amber-600">£180.00</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  + £30 call-out fee + £1.02/mile travel
                </p>
                <p className="text-sm text-amber-700 font-medium">
                  + £10.79 K9 risk fee (dangerous dogs)
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border-0 ring-2 ring-red-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Emergency 24/7
                  </CardTitle>
                  <Badge className="bg-red-500 text-white">URGENT</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-3xl font-bold text-red-600">£1,619.99</p>
                  <p className="text-sm text-muted-foreground">24-48hr by your side</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Our K9 Team */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-semibold text-xl flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Our K9 Team
              </h2>
              <Badge className="bg-green-500 text-white">Available Now</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ourTeam.map((trainer, index) => {
                const isSelected = selectedTrainers.find(t => t.trainer_id === trainer.trainer_id);
                return (
                  <Card 
                    key={trainer.trainer_id}
                    className={`rounded-2xl overflow-hidden shadow-card card-hover animate-fade-in ${isSelected ? 'ring-2 ring-indigo-500' : 'ring-2 ring-green-200'}`}
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
                      {isSelected ? (
                        <Badge className="absolute top-4 right-4 bg-indigo-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      ) : (
                        <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Our Team
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
                      
                      <Button 
                        className={`w-full rounded-full ${isSelected ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'}`}
                        onClick={() => isSelected ? removeTrainer(trainer.trainer_id) : addTrainer(trainer)}
                        data-testid={`select-trainer-${trainer.trainer_id}`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Selected - Click to Remove
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Booking
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Approved 3rd Party Trainers - Coming Soon */}
          {approvedTrainers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Approved 3rd Party Trainers
                </h2>
                <Badge className="bg-purple-500 text-white">Coming Soon</Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedTrainers.map((trainer, index) => (
                  <Card 
                    key={trainer.trainer_id}
                    className="rounded-2xl overflow-hidden shadow-card animate-fade-in opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    data-testid={`approved-trainer-${trainer.trainer_id}`}
                  >
                    <div className="h-48 relative">
                      <img 
                        src={trainer.image_url}
                        alt={trainer.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <Badge className="absolute top-4 right-4 bg-purple-500 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        Coming Soon
                      </Badge>
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
                      
                      <Button 
                        disabled
                        className="w-full rounded-full bg-slate-400 cursor-not-allowed"
                        data-testid={`approved-trainer-btn-${trainer.trainer_id}`}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Equipment & Issues Section */}
          {pricingInfo && (
            <div className="grid md:grid-cols-2 gap-6">
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
                  <strong>50% non-refundable deposit</strong> required to secure booking
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Please book <strong>7-10 days in advance</strong> to ensure availability
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <strong>Full payment</strong> must be made before our team is deployed
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Rescheduling incurs a £30 admin fee
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
