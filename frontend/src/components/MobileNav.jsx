import { useLocation, Link } from "react-router-dom";
import {
  Home,
  GraduationCap,
  Shield,
  Sparkles,
  Flame,
  Trophy,
  Coins,
  MoreHorizontal,
  Bell,
  Award,
  BookOpen,
  User,
  Clock
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const mainNavItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/training", label: "Train", icon: GraduationCap },
  { href: "/k9-training", label: "K9", icon: Shield },
  { href: "/pet", label: "Pet", icon: Sparkles },
  { href: "/leaderboard", label: "Compete", icon: Flame },
];

const moreNavItems = [
  { href: "/achievements", label: "Awards", icon: Trophy },
  { href: "/k9-credentials", label: "K9 Credentials", icon: Award },
  { href: "/tokens", label: "Token Shop", icon: Coins },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/health", label: "Health Hub", icon: Home },
  { href: "/admin", label: "Admin", icon: Shield },
];

export const MobileNav = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[60px] ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* More Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button 
              className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-700 min-w-[60px]"
              data-testid="mobile-nav-more"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader className="text-left">
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-4 py-6">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs text-center font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Safe area spacer for iOS */}
      <div className="h-safe-area-bottom bg-white" />
    </nav>
  );
};

export default MobileNav;
