import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PawPrint,
  Search,
  Heart,
  Dumbbell,
  Scissors,
  Baby,
  Users,
  GraduationCap,
  AlertTriangle,
  Scale,
  Clock
} from "lucide-react";

const sizeColors = {
  small: 'bg-green-100 text-green-700',
  medium: 'bg-blue-100 text-blue-700',
  large: 'bg-purple-100 text-purple-700'
};

const exerciseColors = {
  'Low': 'bg-green-500',
  'Moderate': 'bg-yellow-500',
  'High': 'bg-orange-500',
  'Very High': 'bg-red-500'
};

const exercisePercent = {
  'Low': 25,
  'Moderate': 50,
  'High': 75,
  'Very High': 100
};

export const BreedExplorer = ({ user }) => {
  const [breeds, setBreeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSize, setActiveSize] = useState('all');
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await axios.get(`${API}/breeds`, { withCredentials: true });
        setBreeds(response.data);
      } catch (error) {
        console.error('Failed to fetch breeds:', error);
      }
    };
    fetchBreeds();
  }, []);

  const filteredBreeds = breeds.filter(breed => {
    const matchesSearch = breed.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSize = activeSize === 'all' || breed.size === activeSize;
    return matchesSearch && matchesSize;
  });

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-8 animate-fade-in" data-testid="breed-explorer">
          {/* Header */}
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              Breed Explorer
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover detailed information about dog breeds
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                data-testid="breed-search"
                placeholder="Search breeds..."
                className="pl-10 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={activeSize} onValueChange={setActiveSize}>
              <TabsList className="bg-accent p-1 rounded-full">
                <TabsTrigger value="all" className="rounded-full px-4" data-testid="filter-all">All</TabsTrigger>
                <TabsTrigger value="small" className="rounded-full px-4" data-testid="filter-small">Small</TabsTrigger>
                <TabsTrigger value="medium" className="rounded-full px-4" data-testid="filter-medium">Medium</TabsTrigger>
                <TabsTrigger value="large" className="rounded-full px-4" data-testid="filter-large">Large</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Breeds Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
            {filteredBreeds.map((breed, index) => (
              <Card
                key={breed.breed_id}
                className="bg-white rounded-2xl shadow-card card-hover animate-fade-in overflow-hidden cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => {
                  setSelectedBreed(breed);
                  setDialogOpen(true);
                }}
                data-testid={`breed-card-${breed.breed_id}`}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={breed.image_url}
                    alt={breed.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading font-semibold">{breed.name}</h3>
                    <Badge className={`${sizeColors[breed.size]} border-0 capitalize`}>
                      {breed.size}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {breed.temperament.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-xs text-muted-foreground">
                        {t}{i < Math.min(breed.temperament.length, 3) - 1 ? ' •' : ''}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      {breed.weight_range}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {breed.life_expectancy}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBreeds.length === 0 && (
            <div className="text-center py-16">
              <PawPrint className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No breeds found matching your search.</p>
            </div>
          )}

          {/* Breed Detail Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {selectedBreed && (
                <>
                  <DialogHeader className="space-y-4">
                    <div className="h-48 rounded-xl overflow-hidden -mx-6 -mt-6">
                      <img
                        src={selectedBreed.image_url}
                        alt={selectedBreed.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-start justify-between pt-4">
                      <div>
                        <DialogTitle className="font-heading text-2xl">{selectedBreed.name}</DialogTitle>
                        <p className="text-muted-foreground mt-1">{selectedBreed.description}</p>
                      </div>
                      <Badge className={`${sizeColors[selectedBreed.size]} border-0 capitalize`}>
                        {selectedBreed.size}
                      </Badge>
                    </div>
                  </DialogHeader>

                  <ScrollArea className="flex-1 mt-6">
                    <div className="space-y-6 pr-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-accent rounded-xl">
                          <p className="text-sm text-muted-foreground">Weight Range</p>
                          <p className="font-semibold">{selectedBreed.weight_range}</p>
                        </div>
                        <div className="p-4 bg-accent rounded-xl">
                          <p className="text-sm text-muted-foreground">Life Expectancy</p>
                          <p className="font-semibold">{selectedBreed.life_expectancy}</p>
                        </div>
                      </div>

                      {/* Temperament */}
                      <div>
                        <h4 className="font-heading font-semibold mb-2">Temperament</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedBreed.temperament.map((t, i) => (
                            <Badge key={i} variant="outline" className="rounded-full">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Care Requirements */}
                      <div>
                        <h4 className="font-heading font-semibold mb-4">Care Requirements</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-2 text-sm">
                                <Dumbbell className="w-4 h-4" />
                                Exercise Needs
                              </span>
                              <span className="text-sm font-medium">{selectedBreed.exercise_needs}</span>
                            </div>
                            <Progress 
                              value={exercisePercent[selectedBreed.exercise_needs] || 50} 
                              className={`h-2 bg-gray-100 [&>div]:${exerciseColors[selectedBreed.exercise_needs]}`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-2 text-sm">
                                <Scissors className="w-4 h-4" />
                                Grooming Needs
                              </span>
                              <span className="text-sm font-medium">{selectedBreed.grooming_needs}</span>
                            </div>
                            <Progress 
                              value={selectedBreed.grooming_needs === 'Low' ? 25 : selectedBreed.grooming_needs === 'High' ? 100 : 50} 
                              className="h-2 bg-gray-100"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-2 text-sm">
                                <GraduationCap className="w-4 h-4" />
                                Trainability
                              </span>
                              <span className="text-sm font-medium">{selectedBreed.trainability}</span>
                            </div>
                            <Progress 
                              value={selectedBreed.trainability === 'Excellent' ? 100 : selectedBreed.trainability === 'High' ? 75 : 50} 
                              className="h-2 bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Compatibility */}
                      <div>
                        <h4 className="font-heading font-semibold mb-3">Compatibility</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 p-3 bg-accent rounded-xl">
                            <Baby className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Good with Kids</p>
                              <p className="text-sm font-medium">{selectedBreed.good_with_kids}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-accent rounded-xl">
                            <Users className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Good with Pets</p>
                              <p className="text-sm font-medium">{selectedBreed.good_with_pets}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Health Concerns */}
                      <div>
                        <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          Common Health Concerns
                        </h4>
                        <div className="bg-orange-50 rounded-xl p-4">
                          <ul className="space-y-2">
                            {selectedBreed.health_concerns.map((concern, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </AppLayout>
  );
};

export default BreedExplorer;
