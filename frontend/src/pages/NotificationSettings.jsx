import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Bell,
  BellRing,
  GraduationCap,
  Lightbulb,
  Trophy,
  Flame,
  Megaphone,
  Smartphone,
  Check,
  X
} from "lucide-react";

const NOTIFICATION_OPTIONS = [
  {
    id: "training_reminders",
    title: "Training Reminders",
    description: "Get reminded to continue your training sessions",
    icon: GraduationCap,
    color: "text-purple-500"
  },
  {
    id: "daily_tips",
    title: "Daily Tips",
    description: "Receive helpful dog training tips every day",
    icon: Lightbulb,
    color: "text-amber-500"
  },
  {
    id: "achievement_alerts",
    title: "Achievement Alerts",
    description: "Be notified when you unlock new achievements",
    icon: Trophy,
    color: "text-green-500"
  },
  {
    id: "tournament_updates",
    title: "Tournament Updates",
    description: "Stay updated on seasonal competitions and rankings",
    icon: Flame,
    color: "text-orange-500"
  },
  {
    id: "marketing",
    title: "Promotional Offers",
    description: "Receive special offers and discounts",
    icon: Megaphone,
    color: "text-pink-500"
  }
];

export const NotificationSettings = ({ user }) => {
  const [settings, setSettings] = useState({
    push_enabled: true,
    training_reminders: true,
    daily_tips: true,
    achievement_alerts: true,
    tournament_updates: true,
    marketing: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkPushSupport();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/notifications/settings`, { withCredentials: true });
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPushSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setPushSupported(supported);
    
    if (supported && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setPushSubscribed(!!subscription);
        });
      });
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    setSaving(true);
    try {
      await axios.put(`${API}/notifications/settings`, newSettings, { withCredentials: true });
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
      setSettings(settings); // Revert
    } finally {
      setSaving(false);
    }
  };

  const togglePushNotifications = async () => {
    if (!pushSupported) {
      toast.error('Push notifications not supported in this browser');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (pushSubscribed) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await axios.delete(`${API}/notifications/unsubscribe`, { withCredentials: true });
          setPushSubscribed(false);
          toast.success('Push notifications disabled');
        }
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Please allow notifications in your browser settings');
          return;
        }

        // In production, you'd use your VAPID public key here
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        });

        await axios.post(`${API}/notifications/subscribe`, {
          subscription: subscription.toJSON()
        }, { withCredentials: true });
        
        setPushSubscribed(true);
        toast.success('Push notifications enabled!');
      }
    } catch (error) {
      console.error('Push notification error:', error);
      toast.error('Failed to toggle push notifications');
    }
  };

  const enableAll = () => {
    const newSettings = {
      ...settings,
      push_enabled: true,
      training_reminders: true,
      daily_tips: true,
      achievement_alerts: true,
      tournament_updates: true,
      marketing: true
    };
    setSettings(newSettings);
    axios.put(`${API}/notifications/settings`, newSettings, { withCredentials: true })
      .then(() => toast.success('All notifications enabled'))
      .catch(() => toast.error('Failed to update'));
  };

  const disableAll = () => {
    const newSettings = {
      ...settings,
      push_enabled: false,
      training_reminders: false,
      daily_tips: false,
      achievement_alerts: false,
      tournament_updates: false,
      marketing: false
    };
    setSettings(newSettings);
    axios.put(`${API}/notifications/settings`, newSettings, { withCredentials: true })
      .then(() => toast.success('All notifications disabled'))
      .catch(() => toast.error('Failed to update'));
  };

  if (loading) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto" data-testid="notification-settings">
          {/* Header */}
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              Notification Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage how and when you receive notifications
            </p>
          </div>

          {/* Push Notification Master Switch */}
          <Card className="bg-gradient-to-r from-primary to-green-600 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    {pushSubscribed ? (
                      <BellRing className="w-6 h-6" />
                    ) : (
                      <Bell className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Push Notifications</h3>
                    <p className="text-white/80 text-sm">
                      {pushSubscribed ? 'Notifications are enabled' : 'Enable to receive alerts'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pushSubscribed}
                  onCheckedChange={togglePushNotifications}
                  className="data-[state=checked]:bg-white data-[state=checked]:text-primary"
                  data-testid="push-toggle"
                />
              </div>
              
              {!pushSupported && (
                <div className="mt-4 bg-white/10 rounded-xl p-3 text-sm">
                  <p>Push notifications are not supported in this browser.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Button 
              onClick={enableAll}
              variant="outline"
              className="flex-1 rounded-full"
            >
              <Check className="w-4 h-4 mr-2" />
              Enable All
            </Button>
            <Button 
              onClick={disableAll}
              variant="outline"
              className="flex-1 rounded-full"
            >
              <X className="w-4 h-4 mr-2" />
              Disable All
            </Button>
          </div>

          {/* Individual Settings */}
          <div className="space-y-4">
            <h2 className="font-heading font-semibold text-lg">Notification Types</h2>
            
            {NOTIFICATION_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <Card key={option.id} className="bg-white rounded-xl shadow-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl bg-gray-100`}>
                        <Icon className={`w-5 h-5 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.title}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <Switch
                        id={option.id}
                        checked={settings[option.id]}
                        onCheckedChange={(value) => updateSetting(option.id, value)}
                        data-testid={`toggle-${option.id}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Device Info */}
          <Card className="bg-gray-50 rounded-xl border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Smartphone className="w-5 h-5" />
                <div className="text-sm">
                  <p>Notifications will be sent to this device.</p>
                  <p className="text-xs mt-1">
                    Make sure notifications are enabled in your device settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default NotificationSettings;
