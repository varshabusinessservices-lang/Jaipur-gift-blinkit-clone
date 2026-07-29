import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useShopStore } from '../store/shopStore';
import { useThemeStore } from '../../theme/store/themeStore';
import { Product, ProductVariation } from '../types';
import { 
  Star, Clock, ShieldCheck, Heart, Zap, CheckCircle2, ArrowLeft, Plus, Sparkles, 
  Share2, Search, ShoppingBag, ChevronDown, ChevronUp, MapPin, Check, Info, ShieldAlert, Copy, RefreshCw 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ui/ProductCard';
import { calculateDeliveryEstimate } from '../utils/deliveryCalculator';
import { OptimizedImage } from '../components/mobile/OptimizedImage';

export const ProductDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { 
    products, addToCart, toggleWishlist, isInWishlist, addProductView, 
    currentLocation, setLocationModalOpen, addToast, cart, wishlist 
  } = useShopStore();
  const { activeTheme, draftTheme, previewMode } = useThemeStore();
  const theme = previewMode ? draftTheme : activeTheme;

  const product = products.find(p => p.slug === slug || p.id === slug);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('description');

  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrl);
      if (product.variations && product.variations.length > 0) {
        setSelectedVariation(product.variations[0]);
      }
      addProductView(product);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (!theme) return <div className="flex justify-center p-12">Loading...</div>;

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/')} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl">
          Return to Home
        </Button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const currentPrice = selectedVariation ? selectedVariation.price : product.price;
  const currentOriginalPrice = selectedVariation ? selectedVariation.originalPrice : product.originalPrice;
  const discountPercent = currentOriginalPrice ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100) : 0;

  const galleryImages = [product.imageUrl, ...(product.galleryImages || [])];

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on Jaipur Gifting Enterprise`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Product link copied to clipboard!', 'success');
    }
  };

  const deliveryEstimate = calculateDeliveryEstimate({
    isCustomizable: product.isPersonalisable,
    customizationCompleted: false,
    pincode: currentLocation.pincode,
    isSameDayEligible: product.isSameDayDelivery ?? true
  });

  const handleAddToCart = () => {
    if (product.productType === 'variation' && !selectedVariation) {
      addToast('Please select a product variant', 'error');
      return;
    }
    addToCart(product, quantity, selectedVariation);
    addToast('Item added to cart successfully!', 'success');
  };

  const handleBuyNow = () => {
    if (product.productType === 'variation' && !selectedVariation) {
      addToast('Please select a product variant', 'error');
      return;
    }
    addToCart(product, quantity, selectedVariation);
    navigate('/checkout');
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const bundleProducts = products.filter(p => product.bundleProductIds?.includes(p.id) && p.id !== product.id).slice(0, 3);
  const youMayAlsoLike = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);

  const renderSection = (section: any) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'ProductGallery':
        return (
          <section key={section.id} className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
              <OptimizedImage src={selectedImage} alt={product.name} priority={true} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isSameDayDelivery && (
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Same-Day Delivery
                  </span>
                )}
                {product.isPersonalisable && (
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Personalised
                  </span>
                )}
              </div>
              <button onClick={handleShare} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-md text-slate-700 dark:text-slate-200 hover:scale-105 transition-transform">
                <Share2 className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all ${selectedImage === img ? 'w-6 bg-indigo-600' : 'w-1.5 bg-white/70'}`} />
                ))}
              </div>
            </div>
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 p-3 overflow-x-auto no-scrollbar">
                {galleryImages.map((img, idx) => (
                  <button key={idx} onClick={() => { setSelectedImage(img); setCurrentImageIndex(idx); }} className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${selectedImage === img ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'}`}>
                    <OptimizedImage src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>
        );

      case 'ProductInfo':
        return (
          <section key={section.id} className="bg-white dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-5 space-y-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{product.category}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-500">SKU: JPR-{product.id}</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{product.name}</h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{product.subtitle}</p>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1 bg-amber-500 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-2xs">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{product.reviewCount} Verified Jaipur Reviews</span>
            </div>
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">₹{currentPrice}</span>
              {currentOriginalPrice && <span className="text-sm sm:text-base text-slate-400 line-through">₹{currentOriginalPrice}</span>}
              {discountPercent > 0 && <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg text-xs font-black">{discountPercent}% OFF</span>}
              <span className="text-[10px] font-bold text-slate-400 ml-auto">Inclusive of all taxes</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>In Stock • Ready for Jaipur Dispatch</span>
            </div>
          </section>
        );

      case 'VariantSelector':
        if (product.productType === 'variation' && product.variations) {
          return (
            <section key={section.id} className="bg-white dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Select Edition / Variant</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {product.variations.map(v => (
                  <button key={v.id} onClick={() => setSelectedVariation(v)} className={`p-3 rounded-2xl border text-left transition-all ${selectedVariation?.id === v.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'}`}>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{v.name}</div>
                    <div className="text-xs font-black text-indigo-600 mt-1">₹{v.price}</div>
                  </button>
                ))}
              </div>
            </section>
          );
        }
        return null;

      case 'DeliveryOptions':
        return (
          <section key={section.id} className="bg-white dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-5 space-y-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-indigo-600" /> Choose Delivery Preference
              </span>
              <button onClick={() => setLocationModalOpen(true)} className="text-xs font-black text-indigo-600 hover:underline">Change Location</button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{currentLocation.address} ({currentLocation.pincode})</span>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">Serviceable</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <p className="font-black text-slate-900 dark:text-white">{deliveryEstimate.title}</p>
                  <p className="text-[11px] text-slate-500">{deliveryEstimate.subtitle}</p>
                </div>
                <span className="font-bold text-indigo-600">{deliveryEstimate.deliveryCharge === 0 ? 'FREE Delivery' : `₹${deliveryEstimate.deliveryCharge}`}</span>
              </div>
            </div>
          </section>
        );
        
      case 'ProductDescription':
        return (
          <section key={section.id} className="bg-white dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-5 space-y-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">About the Product</h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button onClick={() => toggleAccordion('description')} className="w-full p-4 text-left flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/40" aria-expanded={activeAccordion === 'description'}>
                <span>Product Description & Features</span>
                {activeAccordion === 'description' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === 'description' && (
                <div className="p-4 text-xs text-slate-600 dark:text-slate-300 space-y-2 border-t border-slate-200 dark:border-slate-800 leading-relaxed">
                  <p>{product.description || product.subtitle}</p>
                </div>
              )}
            </div>
          </section>
        );

      case 'Reviews':
        return (
          <section key={section.id} className="bg-white dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-5 space-y-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Verified Feedback</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Customer Reviews ({product.reviews.length})</h3>
              </div>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="min-w-[280px] max-w-[300px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.author}</span>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{rev.comment}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'RelatedProducts':
        if (youMayAlsoLike.length === 0) return null;
        return (
          <section key={section.id} className="bg-white dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <div>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Handpicked For You</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">You May Also Like</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {youMayAlsoLike.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-1.5 font-black text-sm tracking-tight text-slate-900 dark:text-white">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">J</span>
            <span className="hidden sm:inline">Jaipur Gifts</span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <button onClick={() => toggleWishlist(product)} className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${inWishlist ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
            <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => navigate('/cart')} className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {totalCartCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {theme.pages?.productStandard?.sections?.sort((a: any, b: any) => a.order - b.order).map((section: any) => renderSection(section))}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 pb-safe shadow-lg">
        {product.isPersonalisable ? (
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">₹{currentPrice}</span>
            </div>
            <Button onClick={() => navigate(`/product/${product.slug}/customize`)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" /> Customize Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleAddToCart} className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors text-xs">
              <ShoppingBag className="h-4 w-4" /> Add To Cart
            </button>
            <button onClick={handleBuyNow} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors text-xs">
              <Zap className="h-4 w-4" /> Buy Now • ₹{currentPrice * quantity}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
