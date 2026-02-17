import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ShoppingBag,
  Star,
  Shield,
  Scissors,
  Target,
  Circle,
  Home,
  Heart,
  Car,
  Search,
  Filter,
  ChevronRight,
  Package,
  CheckCircle,
  Plus,
  Minus,
  Mail,
  Clock
} from "lucide-react";

const categoryIcons = {
  "harnesses": Shield,
  "grooming": Scissors,
  "training": Target,
  "bowls": Circle,
  "beds": Home,
  "toys": Star,
  "health": Heart,
  "travel": Car
};

export const EquipmentShop = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEnquiryDialog, setShowEnquiryDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes, featuredRes] = await Promise.all([
        axios.get(`${API}/equipment/categories`, { withCredentials: true }),
        axios.get(`${API}/equipment/products`, { withCredentials: true }),
        axios.get(`${API}/equipment/featured`, { withCredentials: true })
      ]);
      setCategories(categoriesRes.data.categories || []);
      setProducts(productsRes.data.products || []);
      setFeaturedProducts(featuredRes.data.products || []);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      toast.error("Failed to load equipment catalog");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEnquiry = async () => {
    if (!selectedProduct) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/equipment/enquiry`, {
        product_id: selectedProduct.product_id,
        quantity,
        size: selectedSize || null,
        color: selectedColor || null
      }, { withCredentials: true });
      
      toast.success(response.data.message);
      setShowEnquiryDialog(false);
      setSelectedProduct(null);
      setQuantity(1);
      setSelectedSize("");
      setSelectedColor("");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const CategoryIcon = ({ category }) => {
    const Icon = categoryIcons[category] || Package;
    return <Icon className="w-5 h-5" />;
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
        <div className="space-y-8 animate-fade-in" data-testid="equipment-shop">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200')] bg-cover bg-center opacity-20"></div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-4 py-1">
                  K9 Equipment
                </Badge>
              </div>
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                Professional Dog
                <span className="block text-emerald-300">Equipment Shop</span>
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mb-6">
                Premium equipment for working dogs, security K9s, and beloved pets. 
                Quality harnesses, grooming supplies, training gear, and more.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Vetted Suppliers
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                  <Package className="w-4 h-4 mr-1" />
                  UK Delivery
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1">
                  <Clock className="w-4 h-4 mr-1" />
                  Enquiry Based
                </Badge>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-white rounded-full p-1 shadow-sm flex flex-wrap gap-1 h-auto">
              <TabsTrigger 
                value="all" 
                className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Package className="w-4 h-4 mr-2" />
                All Products
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat.id}
                  value={cat.id} 
                  className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  <CategoryIcon category={cat.id} />
                  <span className="ml-2 hidden sm:inline">{cat.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Featured Products */}
          {activeCategory === "all" && featuredProducts.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-xl mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Featured Products
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 4).map((product) => (
                  <Card 
                    key={product.product_id}
                    className="rounded-2xl overflow-hidden shadow-card card-hover cursor-pointer ring-2 ring-amber-200"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowEnquiryDialog(true);
                    }}
                    data-testid={`featured-product-${product.product_id}`}
                  >
                    <div className="h-40 relative">
                      <img 
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 right-3 bg-amber-500 text-black">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-primary">£{product.display_price.toFixed(2)}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {product.rating}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-xl">
                {activeCategory === "all" ? "All Products" : categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <Badge variant="outline">{filteredProducts.length} items</Badge>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <Card 
                  key={product.product_id}
                  className="rounded-2xl overflow-hidden shadow-card card-hover animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowEnquiryDialog(true);
                  }}
                  data-testid={`product-card-${product.product_id}`}
                >
                  <div className="h-48 relative">
                    <img 
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge className="bg-red-500 text-white">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        £{product.display_price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full rounded-full"
                      disabled={!product.in_stock}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enquire Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Product Enquiry Dialog */}
          <Dialog open={showEnquiryDialog} onOpenChange={(open) => {
            setShowEnquiryDialog(open);
            if (!open) {
              setSelectedProduct(null);
              setQuantity(1);
              setSelectedSize("");
              setSelectedColor("");
            }
          }}>
            <DialogContent className="max-w-lg">
              {selectedProduct && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedProduct.name}</DialogTitle>
                    <DialogDescription>
                      Submit an enquiry to purchase this product
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <img 
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium">{selectedProduct.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({selectedProduct.reviews} reviews)
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        £{selectedProduct.display_price.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Size Selector */}
                    {selectedProduct.sizes && (
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Select value={selectedSize} onValueChange={setSelectedSize}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedProduct.sizes.map((size) => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Color Selector */}
                    {selectedProduct.colors && (
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <Select value={selectedColor} onValueChange={setSelectedColor}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedProduct.colors.map((color) => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <Card className="bg-slate-50 rounded-xl border-0">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total</span>
                          <span className="text-2xl font-bold text-primary">
                            £{(selectedProduct.display_price * quantity).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Notice */}
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-semibold">Enquiry Based Orders</p>
                          <p>Our team will contact you to confirm availability and arrange payment.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      onClick={handleEnquiry}
                      disabled={submitting || !selectedProduct.in_stock}
                      className="w-full rounded-full"
                      data-testid="submit-enquiry-btn"
                    >
                      {submitting ? "Submitting..." : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Submit Enquiry
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border-0 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-emerald-500/20 rounded-xl">
                  <Package className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-semibold text-lg mb-1">How It Works</h3>
                  <p className="text-slate-300 text-sm">
                    Browse our curated selection of professional K9 equipment. Submit an enquiry for products you're interested in, 
                    and our team will contact you within 24 hours to confirm availability, arrange delivery, and process payment securely.
                  </p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2">
                  UK Delivery
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default EquipmentShop;
