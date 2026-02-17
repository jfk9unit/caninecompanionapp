import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Globe,
  Calendar,
  Award,
  Users,
  MapPin,
  Bell,
  ChevronRight,
  Sparkles,
  Clock,
  Target
} from "lucide-react";

export const ComingSoon = ({ user }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNotify = () => {
    if (email) {
      setSubscribed(true);
      toast.success("You'll be notified when new features launch!");
    }
  };

  const upcomingFeatures = [
    {
      title: "EU Expansion",
      description: "K9 training courses and trainer bookings across Europe",
      eta: "Q2 2025",
      icon: Globe,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "USA Launch",
      description: "Bringing professional K9 training to North America",
      eta: "Q3 2025",
      icon: MapPin,
      color: "from-red-500 to-pink-600"
    },
    {
      title: "Advanced Certifications",
      description: "New specialist courses for cadaver detection and search & rescue",
      eta: "Q1 2025",
      icon: Award,
      color: "from-amber-500 to-orange-600"
    },
    {
      title: "Community Events",
      description: "Live training workshops and networking events",
      eta: "Coming Soon",
      icon: Users,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "AI Training Assistant",
      description: "Personalized AI-powered training recommendations",
      eta: "Q1 2025",
      icon: Sparkles,
      color: "from-purple-500 to-violet-600"
    },
    {
      title: "Mobile App",
      description: "Native iOS and Android apps for on-the-go training",
      eta: "Q2 2025",
      icon: Target,
      color: "from-cyan-500 to-teal-600"
    }
  ];

  const upcomingEvents = [
    {
      title: "NASDU Level 2 Workshop",
      date: "March 15, 2025",
      location: "London",
      spots: "12 spots left"
    },
    {
      title: "Detection Dog Seminar",
      date: "April 2, 2025",
      location: "Manchester",
      spots: "8 spots left"
    },
    {
      title: "K9 Handler Networking",
      date: "April 20, 2025",
      location: "Birmingham",
      spots: "20 spots left"
    }
  ];

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-8 animate-fade-in" data-testid="coming-soon-page">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]"></div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16 text-center">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-1 mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Coming Soon
              </Badge>
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                Exciting New Features
                <span className="block text-purple-300">On The Horizon</span>
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
                We're constantly working to bring you the best K9 training experience. 
                Here's a sneak peek at what's coming next.
              </p>
              
              {/* Notification Signup */}
              {!subscribed ? (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input 
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <Button 
                    onClick={handleNotify}
                    className="bg-white text-purple-900 hover:bg-white/90 rounded-full px-6"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Me
                  </Button>
                </div>
              ) : (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-6 py-2 text-base">
                  <Bell className="w-4 h-4 mr-2" />
                  You're on the list!
                </Badge>
              )}
            </div>
          </div>

          {/* Upcoming Features Grid */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-6">Upcoming Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingFeatures.map((feature, index) => (
                <Card 
                  key={index}
                  className="rounded-2xl overflow-hidden shadow-card card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
                    <Badge variant="outline" className="rounded-full">
                      <Clock className="w-3 h-3 mr-1" />
                      {feature.eta}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-xl flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Events & Courses
                </h2>
                <Badge variant="outline" className="rounded-full">UK Recognised Trainers</Badge>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                        {event.spots}
                      </Badge>
                      <Button variant="outline" className="rounded-full" size="sm">
                        Learn More
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* UK Recognised Trainers Info */}
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border-0 text-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-amber-500/20 rounded-xl">
                  <Award className="w-10 h-10 text-amber-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-semibold text-xl mb-2">UK Recognised Trainers Network</h3>
                  <p className="text-slate-300">
                    We're building a network of the UK's finest K9 trainers, offering qualifications, 
                    events, and courses recognised by NASDU, SIA, and leading industry bodies. 
                    Stay tuned for new partnerships and opportunities.
                  </p>
                </div>
                <Badge className="bg-amber-500 text-black font-semibold px-4 py-2">
                  Expanding Soon
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Future Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
              <CardContent className="p-6 text-center">
                <Globe className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">EU Expansion</h3>
                <p className="text-sm text-muted-foreground">
                  Training courses and certified trainers across Germany, France, Spain, and more.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 border-0">
              <CardContent className="p-6 text-center">
                <MapPin className="w-10 h-10 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">USA Launch</h3>
                <p className="text-sm text-muted-foreground">
                  Bringing professional K9 training standards to North American handlers.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-0">
              <CardContent className="p-6 text-center">
                <Users className="w-10 h-10 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community Hub</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow handlers, share experiences, and grow together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ComingSoon;
