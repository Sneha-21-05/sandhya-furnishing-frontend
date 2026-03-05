import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import UserLayout from "../../components/UserLayout";
import { ArrowLeft, LayoutDashboard, ShoppingBag, ArrowRight, ShoppingCart, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { addToCart } from "../../api/cartApi";

/* ================= IMAGE URL HELPER ================= */
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads")) {
    return `https://sandhya-furnishing-backend.onrender.com${imageUrl}`;
  }
  return `https://sandhya-furnishing-backend.onrender.com/uploads/${imageUrl}`;
};

/* ================= CATEGORY SLUG RESOLVER ================= */
const resolveCategorySlug = (product) => {
  if (product.category?.slug) {
    return product.category.slug.trim();
  }
  if (product.category?.name) {
    return product.category.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }
  if (product.categoryName) {
    return product.categoryName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }
  return "sofa"; // fallback
};

const UserProducts = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  /* ================= FETCH PRODUCTS BY TYPE ================= */
  useEffect(() => {
    if (!typeId) return;
    window.scrollTo(0, 0);

    api
      .get(`/products/type/${typeId}`)
      .then((res) => {
        setProducts(res.data?.products || []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [typeId]);

  return (
    <UserLayout>
      <main className="flex-1 p-6 sm:p-10 max-w-[1600px] w-full mx-auto">

        {/* ================= HEADER ACTIONS ================= */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#142C2C] tracking-tight mb-2">
              Available Products
            </h1>
            <p className="text-gray-500 text-[15px] max-w-lg">
              Explore our premium selection specifically curated for your chosen style.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 py-2.5 px-5 bg-white text-gray-600 hover:text-[#142C2C] hover:bg-gray-50 rounded-xl font-semibold text-sm shadow-sm border border-gray-100 transition-all"
            >
              <ArrowLeft size={22} /> Back
            </button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
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
            <h2 className="text-2xl sm:text-3xl font-bold text-[#142C2C] mb-4">No Products Found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-10 text-[15px] leading-relaxed">
              We currently don't have any products available in this specific style. Please try a different category.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3.5 bg-[#142C2C] hover:bg-[#9B804E] text-white rounded-full transition-all duration-300 shadow-md font-medium px-10 border border-transparent hover:border-[#9B804E]"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 w-full">
            {products.map((p) => {
              const imageUrl = getImageUrl(p.images?.[0]);
              const categorySlug = resolveCategorySlug(p);

              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${categorySlug}/${p._id}`)}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#9B804E]/30 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer relative"
                >
                  {/* Image Container */}
                  <div className="relative w-full h-48 bg-[#FAFAFA] flex items-center justify-center p-4">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={p.name}
                        className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply drop-shadow-sm"
                      />
                    ) : (
                      <div className="text-gray-300 font-serif italic text-sm">
                        No Image
                      </div>
                    )}

                    {/* Quick View Overlay effect */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col flex-1 p-4 bg-white z-10">
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-[#142C2C] group-hover:text-[#9B804E] transition-colors duration-300 mb-2 line-clamp-2 leading-snug">
                      {p.name}
                    </h3>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        {p.originalPrice && p.originalPrice > p.price ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 line-through">₹{Number(p.originalPrice).toLocaleString('en-IN')}</span>
                            <span className="text-base font-bold text-[#142C2C]">₹{Number(p.price).toLocaleString('en-IN')}</span>
                          </div>
                        ) : (
                          <span className="text-base font-bold text-[#142C2C]">₹{Number(p.price).toLocaleString('en-IN')}</span>
                        )}
                      </div>

                      {/* Product Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleAddToCart(e, p._id)}
                          className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#142C2C] hover:text-white transition-colors border border-gray-100 shadow-sm"
                          title="Add to Cart"
                        >
                          <ShoppingCart size={22} />
                        </button>
                        <button
                          onClick={(e) => handleOrderNow(e, p._id, categorySlug)}
                          className="w-10 h-10 rounded-full bg-[#9B804E]/10 text-[#9B804E] flex items-center justify-center hover:bg-[#9B804E] hover:text-white transition-colors border border-[#9B804E]/20 shadow-sm"
                          title="Order Now"
                        >
                          <ShoppingBag size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </UserLayout>
  );
};

export default UserProducts;
