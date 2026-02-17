import { Button } from "@/components/ui/button";
import { 
  Dog, 
  GraduationCap, 
  Heart, 
  Calendar, 
  Activity, 
  Plane, 
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Sparkles
} from "lucide-react";

export const LandingPage = () => {
  // Google OAuth login
  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const features = [
    {
      icon: GraduationCap,
      title: "Training Modules",
      description: "From puppy basics to advanced tricks, guided step-by-step training for all levels."
    },
    {
      icon: Heart,
      title: "Health Tracking",
      description: "AI-powered symptom analysis, vaccination records, and vet visit tracking."
    },
    {
      icon: Calendar,
      title: "Daily Tasks",
      description: "Schedule walks, feeding, grooming, and play sessions with smart reminders."
    },
    {
      icon: Activity,
      title: "Behavior Monitoring",
      description: "Track patterns, identify triggers, and get early warning alerts."
    },
    {
      icon: Plane,
      title: "Travel Planning",
      description: "Comprehensive checklists and essentials for traveling with your dog."
    },
    {
      icon: Dog,
      title: "Breed Database",
      description: "Detailed information on all breeds, care tips, and health considerations."
    }
  ];

  const benefits = [
    "Personalized training paths for your dog's needs",
    "AI-powered health symptom analyzer",
    "Track multiple dogs in one account",
    "Gamified progress with streaks and badges",
    "Expert tips from professional trainers"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen relative overflow-hidden">
        {/* Navigation */}
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2" data-testid="landing-logo">
              <div className="p-2 bg-primary rounded-xl">
                <Dog className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">CanineCompass</span>
            </div>
            <Button 
              onClick={handleLogin}
              className="rounded-full bg-primary hover:bg-primary-hover shadow-primary"
              data-testid="login-btn-nav"
            >
              Get Started
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 mb-6 shadow-card">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-gray-700">AI-Powered Dog Care</span>
              </div>
              
              <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
                Your Complete <span className="text-primary">Canine</span> Companion
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                From puppyhood to senior years, manage training, health, daily activities, 
                and more with our intelligent dog care platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary-hover shadow-primary text-base px-8"
                  data-testid="hero-cta-btn"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="rounded-full text-base px-8"
                  data-testid="learn-more-btn"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
              
              {/* Email Login Option */}
              <div className="mb-12">
                <a 
                  href="/auth" 
                  className="text-sm text-gray-600 hover:text-primary flex items-center justify-center sm:justify-start gap-1"
                  data-testid="email-login-link"
                >
                  Or sign in with email
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <Dog className="w-5 h-5 text-gray-500" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Loved by 10,000+ dog owners</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-3xl overflow-hidden shadow-float">
                <img 
                  src="https://images.unsplash.com/photo-1648304889006-ab61f5e7d124?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
                  alt="Happy dog"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -left-8 top-1/4 bg-white rounded-2xl p-4 shadow-float animate-bounce-soft">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Training Complete</p>
                    <p className="text-xs text-gray-500">Basic Commands</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl p-4 shadow-float animate-bounce-soft" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <Heart className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Health Check</p>
                    <p className="text-xs text-gray-500">All Vitals Normal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Everything Your Dog Needs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed to make dog parenting easier, healthier, and more fun.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  index % 2 === 0 ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    index % 2 === 0 ? 'text-green-700' : 'text-orange-600'
                  }`} />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-accent/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1646640238205-e3c5bb4ba9d9?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
                alt="Dog playing"
                className="rounded-3xl shadow-float w-full h-[400px] object-cover"
              />
            </div>
            <div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-6">
                Why Dog Owners Love CanineCompass
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1 bg-primary rounded-full mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleLogin}
                size="lg"
                className="rounded-full bg-primary hover:bg-primary-hover shadow-primary mt-8"
                data-testid="benefits-cta-btn"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">
            Ready to Be a Better Dog Parent?
          </h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto">
            Join thousands of dog owners who trust CanineCompass for their furry friend's care.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="rounded-full bg-white text-primary hover:bg-gray-100 shadow-lg"
            data-testid="final-cta-btn"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-xl">
                <Dog className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-white">CanineCompass</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CanineCompass. Made with love for dogs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
