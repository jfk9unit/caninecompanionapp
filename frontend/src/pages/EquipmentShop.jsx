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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import {
  ShoppingBag,
  ShoppingCart,
  Star,
  Shield,
  Scissors,
  Target,
  Circle,
  Home,
  Heart,
  Car,
  Search,
  Package,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Truck,
  Zap,
  Tag,
  X,
  Info
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
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Basket state
  const [basket, setBasket] = useState([]);
  const [showBasket, setShowBasket] = useState(false);
  const [basketCalculation, setBasketCalculation] = useState(null);
  const [deliveryType, setDeliveryType] = useState("standard");
  const [calculatingBasket, setCalculatingBasket] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // Product detail dialog
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showProductDialog, setShowProductDialog] = useState(false);

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
        toast.success("Order confirmed! Check your email for delivery details.");
        window.history.replaceState({}, document.title, window.location.pathname);
        setBasket([]);
        setBasketCalculation(null);
        return;
      }
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

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

  const addToBasket = () => {
    if (!selectedProduct) return;
    
    const existingIndex = basket.findIndex(item => 
      item.product_id === selectedProduct.product_id &&
      item.size === selectedSize &&
      item.color === selectedColor
    );
    
    if (existingIndex >= 0) {
      const newBasket = [...basket];
      newBasket[existingIndex].quantity += quantity;
      setBasket(newBasket);
    } else {
      setBasket([...basket, {
        product_id: selectedProduct.product_id,
        name: selectedProduct.name,
        unit_price: selectedProduct.display_price,
        quantity: quantity,
        size: selectedSize || null,
        color: selectedColor || null,
        image_url: selectedProduct.image_url,
        category: selectedProduct.category
      }]);
    }
    
    toast.success(`${selectedProduct.name} added to basket`);
    setShowProductDialog(false);
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedSize("");
    setSelectedColor("");
  };

  const updateBasketQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      removeFromBasket(index);
      return;
    }
    const newBasket = [...basket];
    newBasket[index].quantity = newQuantity;
    setBasket(newBasket);
    setBasketCalculation(null);
  };

  const removeFromBasket = (index) => {
    setBasket(basket.filter((_, i) => i !== index));
    setBasketCalculation(null);
    toast.info("Item removed from basket");
  };

  const calculateBasket = async () => {
    if (basket.length === 0) return;
    
    setCalculatingBasket(true);
    try {
      const response = await axios.post(`${API}/equipment/calculate-basket`, {
        items: basket.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        delivery_type: deliveryType
      }, { withCredentials: true });
      
      setBasketCalculation(response.data);
    } catch (error) {
      toast.error("Failed to calculate basket");
    } finally {
      setCalculatingBasket(false);
    }
  };

  useEffect(() => {
    if (basket.length > 0 && showBasket) {
      calculateBasket();
    }
  }, [basket, deliveryType, showBasket]);

  const handleCheckout = async () => {
    if (basket.length === 0) return;
    
    setCheckingOut(true);
    try {
      const response = await axios.post(`${API}/equipment/checkout`, {
        items: basket.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        delivery_type: deliveryType,
        origin_url: window.location.origin
      }, { withCredentials: true });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create checkout");
    } finally {
      setCheckingOut(false);
    }
  };

  const getTotalItems = () => basket.reduce((acc, item) => acc + item.quantity, 0);
  const getBasketSubtotal = () => basket.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

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
                  <Truck className="w-4 h-4 mr-1" />
                  UK Delivery
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                  <Tag className="w-4 h-4 mr-1" />
                  Pay Now & Save
                </Badge>
              </div>
            </div>
          </div>

          {/* Search and Basket Button */}
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
            <Button 
              onClick={() => setShowBasket(true)}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 relative"
              data-testid="open-basket-btn"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Basket
              {basket.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center p-0">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
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
                      setShowProductDialog(true);
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
                    setShowProductDialog(true);
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
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full rounded-full"
                      disabled={!product.in_stock}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Basket
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Product Detail Dialog */}
          <Dialog open={showProductDialog} onOpenChange={(open) => {
            setShowProductDialog(open);
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
                    <DialogDescription>Add to your basket</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <img 
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    
                    <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium">{selectedProduct.rating}</span>
                        <span className="text-sm text-muted-foreground">({selectedProduct.reviews} reviews)</span>
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
                        <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                        <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <Card className="bg-slate-50 rounded-xl border-0">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="text-2xl font-bold text-primary">
                            £{(selectedProduct.display_price * quantity).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      onClick={addToBasket}
                      disabled={!selectedProduct.in_stock}
                      className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700"
                      data-testid="add-to-basket-btn"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Basket
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Basket Dialog */}
          <Dialog open={showBasket} onOpenChange={setShowBasket}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  Your Basket ({getTotalItems()} items)
                </DialogTitle>
              </DialogHeader>
              
              {basket.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">Your basket is empty</p>
                  <Button 
                    onClick={() => setShowBasket(false)}
                    className="mt-4 rounded-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {/* Basket Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {basket.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <img 
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && " | "}
                            {item.color && `Color: ${item.color}`}
                          </p>
                          <p className="text-sm font-bold text-emerald-600">£{item.unit_price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateBasketQuantity(index, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateBasketQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => removeFromBasket(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Options */}
                  <div className="space-y-3">
                    <Label>Delivery Option</Label>
                    <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
                      <div className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${deliveryType === 'standard' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                        <label htmlFor="standard" className="flex items-center gap-2 cursor-pointer flex-1">
                          <RadioGroupItem value="standard" id="standard" />
                          <div>
                            <p className="font-medium">Standard Delivery</p>
                            <p className="text-xs text-muted-foreground">3-5 business days</p>
                          </div>
                        </label>
                        <div className="text-right">
                          {getBasketSubtotal() >= 75 ? (
                            <Badge className="bg-green-500 text-white">FREE</Badge>
                          ) : (
                            <span className="font-semibold">from £2.99</span>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${deliveryType === 'express' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                        <label htmlFor="express" className="flex items-center gap-2 cursor-pointer flex-1">
                          <RadioGroupItem value="express" id="express" />
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium flex items-center gap-1">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Express Delivery
                              </p>
                              <p className="text-xs text-muted-foreground">1-2 business days</p>
                            </div>
                          </div>
                        </label>
                        <span className="font-semibold">from £5.99</span>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Free Shipping Notice */}
                  {basketCalculation?.free_shipping && !basketCalculation.free_shipping.eligible && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          Spend <strong>£{basketCalculation.free_shipping.amount_needed.toFixed(2)} more</strong> for free standard delivery!
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Cost Summary */}
                  {basketCalculation && (
                    <Card className="bg-slate-100 rounded-xl border-0">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal ({basketCalculation.summary.total_quantity} items)</span>
                          <span>£{basketCalculation.summary.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{basketCalculation.summary.delivery_note}</span>
                          <span>{basketCalculation.summary.delivery_cost === 0 ? 'FREE' : `£${basketCalculation.summary.delivery_cost.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-300">
                          <span>Order Total</span>
                          <span>£{basketCalculation.summary.order_total.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Pay Now Discount */}
                  {basketCalculation?.pay_now_option && (
                    <Card className="bg-green-50 rounded-xl border-2 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Tag className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-green-800">Pay Now & Save!</p>
                            <p className="text-sm text-green-700">{basketCalculation.pay_now_option.savings_note}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-green-700">Pay Now Price:</span>
                              <span className="text-xl font-bold text-green-700">
                                £{basketCalculation.pay_now_option.pay_now_total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              
              {basket.length > 0 && (
                <DialogFooter className="flex-col gap-2">
                  <Button 
                    onClick={handleCheckout}
                    disabled={checkingOut || calculatingBasket}
                    className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700"
                    data-testid="checkout-btn"
                  >
                    {checkingOut ? "Processing..." : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now - £{basketCalculation?.pay_now_option?.pay_now_total.toFixed(2) || getBasketSubtotal().toFixed(2)}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Secure checkout powered by Stripe
                  </p>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-0">
              <CardContent className="p-6 text-center">
                <Truck className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Free Delivery</h3>
                <p className="text-sm text-muted-foreground">On orders over £75 (standard)</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-0">
              <CardContent className="p-6 text-center">
                <Tag className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Pay Now Discount</h3>
                <p className="text-sm text-muted-foreground">0.05% off when you checkout</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
              <CardContent className="p-6 text-center">
                <Shield className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Quality Guaranteed</h3>
                <p className="text-sm text-muted-foreground">Vetted suppliers only</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default EquipmentShop;
