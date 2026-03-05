import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { addToCart } from "../api/cartApi";
import UserLayout from "../components/UserLayout";
import { getImageUrl } from "../utils/imageUtils";

const LatestProductsPage = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed") || "false")
  );

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(
    Number(localStorage.getItem("cartCount")) || 0
  );
  const user = JSON.parse(localStorage.getItem("user"));

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    if (!user?._id) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    try {
      const response = await addToCart(user._id, productId, 1);
      if (response.success) toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleOrderNow = async (e, productId, categorySlug) => {
    e.stopPropagation();
    if (!user?._id) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    try {
      const response = await addToCart(user._id, productId, 1);
      if (response.success) navigate("/user/checkout");
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    window.scrollTo(0, 0);
    api.get("/products/latest")
      .then((res) => {
        setProducts(res.data.products || []);
      })
      .catch((err) => {
        console.error("Failed to fetch latest products:", err);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  return (
    <UserLayout>

      {/* ================= MAIN CONTENT ================= */}

      {/* ================= PAGE CONTENT ================= */}
      <main className="flex-1 p-6 sm:p-10 max-w-[1600px] w-full mx-auto">
        {/* Enhanced Professional Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#142C2C] tracking-tight mb-2">
              Latest Collection
            </h1>
            <p className="text-gray-500 text-[15px] max-w-lg">
              Explore our newest, handpicked designs crafted to elevate your living spaces with premium elegance.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-bold tracking-[0.2em] text-[#9B804E] uppercase border border-[#9B804E]/30 px-3 py-1.5 rounded-full bg-[#9B804E]/5">
              New Arrivals
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse flex flex-col gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="bg-gray-100 rounded-2xl aspect-[4/5] w-full"></div>
                <div className="space-y-3 px-2 pb-2">
                  <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 w-full text-center px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#142C2C] mb-4">No New Arrivals Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-10 text-[15px] leading-relaxed">
              We are currently curating our next premium collection. Please check back later for exciting new additions.
            </p>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="px-8 py-3.5 bg-[#142C2C] hover:bg-[#9B804E] text-white rounded-full transition-all duration-300 shadow-md font-medium px-10 border border-transparent hover:border-[#9B804E]"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 w-full">
            {products.map((p) => {
              const categorySlug = p.category?.name?.toLowerCase().trim() || 'home';
              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${categorySlug}/${p._id}`)}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#9B804E]/30 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer relative"
                >
                  {/* Premium Image Container */}
                  <div className="relative aspect-[4/5] w-full bg-[#FAFAFA] flex items-center justify-center p-4">
                    <img
                      src={getImageUrl(p.images?.[0])}
                      alt={p.name}
                      className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply drop-shadow-sm"
                    />

                    {/* Sophisticated New Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-gray-100 z-20">
                      <span className="text-[10px] font-bold text-[#142C2C] tracking-[0.15em] uppercase">New</span>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-[#142C2C]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-10">
                      {/* Add to Cart Icon Button */}
                      <div className="relative group/btn">
                        <button
                          onClick={(e) => handleAddToCart(e, p._id)}
                          className="bg-white text-[#142C2C] hover:bg-[#142C2C] hover:text-white w-12 h-12 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex justify-center items-center"
                        >
                          <ShoppingCart size={20} />
                        </button>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#142C2C] text-white text-[10px] font-bold tracking-wider px-2.5 py-1.5 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          ADD TO CART
                        </span>
                      </div>

                      {/* Order Now Icon Button */}
                      <div className="relative group/btn">
                        <button
                          onClick={(e) => handleOrderNow(e, p._id, categorySlug)}
                          className="bg-[#9B804E] text-white hover:bg-[#8A7145] w-12 h-12 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 flex justify-center items-center"
                        >
                          <ShoppingBag size={20} />
                        </button>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#142C2C] text-white text-[10px] font-bold tracking-wider px-2.5 py-1.5 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          ORDER NOW
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Refined Product Details */}
                  <div className="flex flex-col flex-1 p-4 bg-white z-10">
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-[#142C2C] group-hover:text-[#9B804E] transition-colors duration-300 mb-2 line-clamp-2 leading-snug">
                      {p.name}
                    </h3>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        {p.originalPrice && p.originalPrice > p.price ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 line-through">₹{p.originalPrice.toLocaleString('en-IN')}</span>
                            <span className="text-base font-bold text-[#142C2C]">₹{p.price.toLocaleString('en-IN')}</span>
                          </div>
                        ) : (
                          <span className="text-base font-bold text-[#142C2C]">₹{p.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </UserLayout>
  );
};

export default LatestProductsPage;