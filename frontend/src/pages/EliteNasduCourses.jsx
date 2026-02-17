import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Shield,
  Award,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  FileCheck,
  Briefcase,
  PoundSterling,
  Users,
  AlertTriangle,
  BookOpen,
  CreditCard
} from "lucide-react";

export const EliteNasduCourses = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Check for payment success/cancel
    if (searchParams.get('success') === 'true') {
      toast.success("Course enrollment successful! Check your email for confirmation.");
    } else if (searchParams.get('cancelled') === 'true') {
      toast.info("Payment cancelled");
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const coursesRes = await axios.get(`${API}/nasdu/courses`, { withCredentials: true });
      setCourses(coursesRes.data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(true);
    try {
      const response = await axios.post(`${API}/nasdu/course/checkout`, {
        course_id: courseId,
        success_url: `${window.location.origin}/elite-courses?success=true`,
        cancel_url: `${window.location.origin}/elite-courses?cancelled=true`
      }, { withCredentials: true });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to start checkout");
    } finally {
      setEnrolling(false);
    }
  };

  const filteredCourses = activeCategory === "all" 
    ? courses 
    : courses.filter(c => c.category === activeCategory);

  const categories = [
    { id: "all", label: "All Courses", icon: BookOpen },
    { id: "patrol", label: "Patrol", icon: Shield },
    { id: "general_purpose", label: "General Purpose", icon: Users },
    { id: "detection", label: "Detection", icon: FileCheck },
    { id: "tracking", label: "Tracking", icon: MapPin },
    { id: "refresher", label: "Refresher", icon: Award }
  ];

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
        <div className="space-y-8 animate-fade-in" data-testid="elite-nasdu-courses">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582243310179-c628e101c0e3?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85')] bg-cover bg-center opacity-20"></div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl backdrop-blur-sm">
                  <Shield className="w-8 h-8 text-amber-400" />
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-4 py-1">
                  SIA Approved
                </Badge>
              </div>
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                Elite NASDU K9 Handler
                <span className="block text-amber-400">Accreditation Courses</span>
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl mb-6">
                UK's premier professional security dog handler qualifications. 
                HABC/Highfield endorsed certifications meeting BS 8517 standards.
              </p>
              
              {/* Pre-Test Coming Soon Notice */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2 text-base">
                  <Clock className="w-4 h-4 mr-2" />
                  Pre-Assessment Test - Coming Soon
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 text-base">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Book Courses Now - Pay with Stripe
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Certified Graduates", value: "2,500+", icon: GraduationCap },
              { label: "Partner Training Centres", value: "45", icon: MapPin },
              { label: "Industry Recognition", value: "100%", icon: Award },
              { label: "Job Placement Rate", value: "94%", icon: Briefcase }
            ].map((stat, index) => (
              <Card key={index} className="bg-white rounded-2xl border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-white rounded-full p-1 shadow-sm flex flex-wrap gap-1 h-auto">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat.id}
                  value={cat.id} 
                  className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  <cat.icon className="w-4 h-4 mr-2" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Course Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <Card 
                key={course.course_id}
                className={`rounded-2xl overflow-hidden shadow-card card-hover animate-fade-in relative ${
                  course.featured ? 'ring-2 ring-amber-400' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`course-card-${course.course_id}`}
              >
                {course.featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-amber-500 text-black font-semibold">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
                
                <div className="h-48 relative">
                  <img 
                    src={course.image_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 mb-2">
                      Level {course.level}
                    </Badge>
                    <h3 className="font-semibold text-white text-lg line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                </div>
                
                <CardContent className="p-5 space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration_days} Days
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {course.location}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        £{course.commission_price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.hourly_rate_after} after certification
                      </p>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setSelectedCourse(course)}
                          data-testid={`view-course-${course.course_id}`}
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-amber-500" />
                            {course.title}
                          </DialogTitle>
                          <DialogDescription>
                            {course.certification_body} Endorsed | SIA Recognised
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                          <img 
                            src={course.image_url}
                            alt={course.title}
                            className="w-full h-48 object-cover rounded-xl"
                          />
                          
                          <p className="text-muted-foreground">{course.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <Clock className="w-5 h-5 text-primary mb-2" />
                              <p className="font-semibold">{course.duration_hours} Hours</p>
                              <p className="text-sm text-muted-foreground">{course.duration_days} Days Intensive</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <PoundSterling className="w-5 h-5 text-primary mb-2" />
                              <p className="font-semibold">£{course.commission_price.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">All inclusive</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Course Units
                            </h4>
                            <ul className="space-y-2">
                              {course.units.map((unit, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {unit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              Skills You'll Learn
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {course.skills_learned.map((skill, i) => (
                                <Badge key={i} variant="outline" className="rounded-full">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Prerequisites
                            </h4>
                            <ul className="space-y-1">
                              {course.prerequisites.map((prereq, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                  {prereq}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              Career Paths
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {course.career_paths.map((path, i) => (
                                <Badge key={i} className="bg-primary/10 text-primary rounded-full">
                                  {path}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            onClick={() => handleEnroll(course.course_id)}
                            disabled={enrolling || !pretestStatus?.has_passed}
                            className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                            data-testid={`enroll-course-${course.course_id}`}
                          >
                            {!pretestStatus?.has_passed ? (
                              <>
                                <FileCheck className="w-4 h-4 mr-2" />
                                Pass Pre-Test to Enroll
                              </>
                            ) : enrolling ? (
                              "Processing..."
                            ) : (
                              <>
                                <GraduationCap className="w-4 h-4 mr-2" />
                                Enroll Now - £{course.commission_price.toLocaleString()}
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Commission Notice */}
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border-0 text-white">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-amber-500/20 rounded-xl">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-semibold text-lg mb-1">Official NASDU Partner</h3>
                <p className="text-slate-300 text-sm">
                  As an authorised third-party provider, we facilitate course bookings with NASDU-approved training centres across the UK. 
                  All prices include our 12% service fee which covers course allocation, booking management, and ongoing support.
                </p>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-4 py-2">
                UK Only
              </Badge>
            </CardContent>
          </Card>

          {/* Certification Path */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-6">Your Path to Certification</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: 1, title: "Pass Pre-Test", desc: "Complete 50-question assessment (£19.99)", icon: FileCheck },
                { step: 2, title: "Choose Course", desc: "Select from our NASDU catalogue", icon: BookOpen },
                { step: 3, title: "Complete Training", desc: "Attend practical sessions", icon: GraduationCap },
                { step: 4, title: "Get Certified", desc: "Receive HABC certification", icon: Award }
              ].map((item, index) => (
                <Card key={index} className="bg-white rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-5 text-center relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                    <item.icon className="w-8 h-8 text-primary mx-auto mb-3 mt-2" />
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default EliteNasduCourses;
