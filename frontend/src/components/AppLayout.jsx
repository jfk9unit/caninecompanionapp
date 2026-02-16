import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dog,
  Home,
  GraduationCap,
  Heart,
  PawPrint,
  Calendar,
  Activity,
  Plane,
  BookOpen,
  LogOut,
  Menu,
  ChevronDown,
  Coins,
  Sparkles,
  Trophy,
  Mic,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/training", label: "Training", icon: GraduationCap },
  { href: "/pet", label: "Pet", icon: Sparkles },
  { href: "/health", label: "Health", icon: Heart },
  { href: "/activities", label: "Activities", icon: Calendar },
  { href: "/voice-log", label: "Voice Log", icon: Mic },
  { href: "/achievements", label: "Awards", icon: Trophy },
  { href: "/tokens", label: "Shop", icon: Coins },
];

export const AppLayout = ({ user, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await axios.get(`${API}/dogs`, { withCredentials: true });
        setDogs(response.data);
        if (response.data.length > 0 && !selectedDog) {
          const storedDogId = localStorage.getItem('selectedDogId');
          const dog = response.data.find(d => d.dog_id === storedDogId) || response.data[0];
          setSelectedDog(dog);
        }
      } catch (error) {
        console.error('Failed to fetch dogs:', error);
      }
    };
    fetchDogs();
  }, []);

  const handleSelectDog = (dog) => {
    setSelectedDog(dog);
    localStorage.setItem('selectedDogId', dog.dog_id);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-accent/30">
      {/* Top Navigation */}
      <nav className="glass-nav sticky top-0 z-50 border-b border-gray-100" data-testid="main-nav">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 group" data-testid="logo-link">
              <div className="p-2 bg-primary rounded-xl group-hover:scale-105 transition-transform">
                <Dog className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground hidden sm:block">
                CanineCompass
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Dog Selector */}
              {dogs.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="hidden sm:flex items-center gap-2 rounded-full"
                      data-testid="dog-selector"
                    >
                      <PawPrint className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">{selectedDog?.name || 'Select Dog'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {dogs.map((dog) => (
                      <DropdownMenuItem
                        key={dog.dog_id}
                        onClick={() => handleSelectDog(dog)}
                        className={selectedDog?.dog_id === dog.dog_id ? 'bg-accent' : ''}
                        data-testid={`dog-option-${dog.dog_id}`}
                      >
                        <PawPrint className="w-4 h-4 mr-2" />
                        {dog.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="add-dog-link">
                      + Add New Dog
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-1" data-testid="user-menu">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" data-testid="mobile-menu-btn">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-2 mt-8">
                    {/* Mobile Dog Selector */}
                    {dogs.length > 0 && (
                      <div className="mb-4 p-3 bg-accent rounded-xl">
                        <p className="text-xs text-muted-foreground mb-2">Selected Dog</p>
                        <select
                          value={selectedDog?.dog_id || ''}
                          onChange={(e) => {
                            const dog = dogs.find(d => d.dog_id === e.target.value);
                            if (dog) handleSelectDog(dog);
                          }}
                          className="w-full bg-white rounded-lg p-2 text-sm"
                        >
                          {dogs.map((dog) => (
                            <option key={dog.dog_id} value={dog.dog_id}>
                              {dog.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive 
                              ? 'bg-primary text-white' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {typeof children === 'function' ? children({ dogs, selectedDog, setSelectedDog: handleSelectDog, refreshDogs: async () => {
          const response = await axios.get(`${API}/dogs`, { withCredentials: true });
          setDogs(response.data);
          if (response.data.length > 0) {
            const storedDogId = localStorage.getItem('selectedDogId');
            const dog = response.data.find(d => d.dog_id === storedDogId) || response.data[0];
            setSelectedDog(dog);
          }
        }}) : children}
      </main>
    </div>
  );
};
