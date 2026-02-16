import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Skull,
  Home,
  TreePine
} from "lucide-react";

export const TipsResources = ({ user }) => {
  const [tips, setTips] = useState(null);
  const [activeTab, setActiveTab] = useState('dos');

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await axios.get(`${API}/tips/parenting`, { withCredentials: true });
        setTips(response.data);
      } catch (error) {
        console.error('Failed to fetch tips:', error);
      }
    };
    fetchTips();
  }, []);

  if (!tips) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-8 animate-fade-in" data-testid="tips-resources">
          {/* Header */}
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              Tips & Resources
            </h1>
            <p className="text-muted-foreground mt-1">
              Essential guidance for responsible dog parenting
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-accent p-1 rounded-full">
              <TabsTrigger value="dos" className="rounded-full px-6 gap-2" data-testid="tab-dos">
                <ThumbsUp className="w-4 h-4" />
                Do's
              </TabsTrigger>
              <TabsTrigger value="donts" className="rounded-full px-6 gap-2" data-testid="tab-donts">
                <ThumbsDown className="w-4 h-4" />
                Don'ts
              </TabsTrigger>
              <TabsTrigger value="risks" className="rounded-full px-6 gap-2" data-testid="tab-risks">
                <AlertTriangle className="w-4 h-4" />
                Risks
              </TabsTrigger>
            </TabsList>

            {/* Do's Tab */}
            <TabsContent value="dos" className="mt-6">
              <div className="grid sm:grid-cols-2 gap-6 stagger-children">
                {tips.dos.map((tip, index) => (
                  <Card 
                    key={index}
                    className="bg-white rounded-2xl shadow-card card-hover animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 rounded-xl flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold mb-2">{tip.title}</h3>
                          <p className="text-sm text-muted-foreground">{tip.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Don'ts Tab */}
            <TabsContent value="donts" className="mt-6">
              <div className="grid sm:grid-cols-2 gap-6 stagger-children">
                {tips.donts.map((tip, index) => (
                  <Card 
                    key={index}
                    className="bg-white rounded-2xl shadow-card card-hover animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
                          <XCircle className="w-5 h-5 text-red-700" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold mb-2">{tip.title}</h3>
                          <p className="text-sm text-muted-foreground">{tip.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Risks Tab */}
            <TabsContent value="risks" className="mt-6">
              <div className="grid sm:grid-cols-2 gap-6 stagger-children">
                {tips.risks.map((risk, index) => {
                  const icons = {
                    'Toxic Foods': Skull,
                    'Toxic Plants': TreePine,
                    'Household Hazards': Home,
                    'Outdoor Dangers': AlertTriangle
                  };
                  const Icon = icons[risk.title] || AlertTriangle;
                  const colors = {
                    'Toxic Foods': 'bg-red-100 text-red-700',
                    'Toxic Plants': 'bg-green-100 text-green-700',
                    'Household Hazards': 'bg-orange-100 text-orange-700',
                    'Outdoor Dangers': 'bg-yellow-100 text-yellow-700'
                  };
                  const color = colors[risk.title] || 'bg-gray-100 text-gray-700';

                  return (
                    <Card 
                      key={index}
                      className="bg-white rounded-2xl shadow-card card-hover animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-xl ${color.split(' ')[0]}`}>
                            <Icon className={`w-5 h-5 ${color.split(' ')[1]}`} />
                          </div>
                          <h3 className="font-heading font-semibold">{risk.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {risk.items.map((item, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Emergency Notice */}
              <Card className="bg-red-50 border-red-200 rounded-2xl shadow-card mt-6">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-700" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-red-900 mb-2">
                        Emergency: Suspected Poisoning
                      </h3>
                      <p className="text-sm text-red-800 mb-4">
                        If you suspect your dog has ingested something toxic:
                      </p>
                      <ul className="space-y-2 text-sm text-red-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">1.</span>
                          <span>Stay calm and note what was ingested and how much</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">2.</span>
                          <span>Contact your vet or emergency animal hospital immediately</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">3.</span>
                          <span>Do NOT induce vomiting unless instructed by a professional</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">4.</span>
                          <span>ASPCA Animal Poison Control: (888) 426-4435</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Reference Card */}
          <Card className="bg-gradient-to-br from-green-50 to-orange-50 border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold">Quick Reference: Safe Foods</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">Safe for Dogs</p>
                  <div className="flex flex-wrap gap-2">
                    {['Carrots', 'Apples (no seeds)', 'Blueberries', 'Watermelon', 'Cooked chicken', 'Pumpkin', 'Green beans', 'Peanut butter (no xylitol)'].map((food, i) => (
                      <Badge key={i} className="bg-green-100 text-green-700 border-0">{food}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700 mb-2">Avoid</p>
                  <div className="flex flex-wrap gap-2">
                    {['Chocolate', 'Grapes', 'Onions', 'Garlic', 'Avocado', 'Xylitol', 'Alcohol', 'Caffeine'].map((food, i) => (
                      <Badge key={i} className="bg-red-100 text-red-700 border-0">{food}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default TipsResources;
