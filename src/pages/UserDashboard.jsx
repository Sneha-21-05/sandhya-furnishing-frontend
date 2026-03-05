import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Search, ShoppingBag, ChevronRight } from "lucide-react";
import UserLayout from "../components/UserLayout";
import { getImageUrl } from "../utils/imageUtils";

const UserDashboard = () => {
  const navigate = useNavigate();

  /* ================= USER ================= */
  const [storedUser, setStoredUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const userName = storedUser.fullname || "User";

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    window.scrollTo(0, 0);
    api
      .get("/products/latest")
      .then((res) => {
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api
      .get("/categories/all")
      .then((res) => {
        setCategories(res.data.categories || []);
      })
      .catch(() => { });
  }, []);

  /* ================= SYNC PROFILE ================= */
  useEffect(() => {
    const syncUserFromStorage = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setStoredUser(user);
    };

    window.addEventListener("user-updated", syncUserFromStorage);
    return () => {
      window.removeEventListener("user-updated", syncUserFromStorage);
    };
  }, []);

  /* REMOVE DUPLICATE CATEGORIES */
  const uniqueCategories = Array.from(
    new Map(categories.map((c) => [c.name.toLowerCase(), c])).values()
  );

  return (
    <UserLayout>
      {/* HEADER SEARCH BAR */}
      <div className="bg-white border-b border-gray-50 flex items-center px-6 sm:px-10 h-16 w-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] sticky top-[80px] z-20">
        <div className="hidden md:flex relative group w-full max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#9B804E] transition-colors" />
          <input
            type="text"
            placeholder="Search furniture, decor..."
            className="w-[280px] focus:w-[400px] h-10 pl-10 pr-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#9B804E]/20 focus:bg-white transition-all outline-none"
            value={searchTerm}
            onChange={async (e) => {
              const value = e.target.value.toLowerCase().trim();
              setSearchTerm(value);

              if (value.length === 0) {
                setSearchResults([]);
                return;
              }

              try {
                const res = await api.get(`/products/search?q=${value}`);
                setSearchResults(res.data.products || []);
              } catch (error) {
                console.log(error);
              }
            }}
          />
        </div>
      </div>

      <main className="flex-1 p-6 sm:p-10 w-full mx-auto">
        {/* Mobile Search */}
        <div className="md:hidden relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search furniture, decor..."
            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-[15px] focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all outline-none shadow-sm"
            value={searchTerm}
            onChange={async (e) => {
              const value = e.target.value.toLowerCase().trim();
              setSearchTerm(value);

              if (value.length === 0) {
                setSearchResults([]);
                return;
              }

              try {
                const res = await api.get(`/products/search?q=${value}`);
                setSearchResults(res.data.products || []);
              } catch (error) {
                console.log(error);
              }
            }}
          />
        </div>

        <div className="mb-10 max-w-[1400px] mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#142C2C] tracking-tight mb-2">
            Good to see you, {userName.split(' ')[0]}
          </h1>
          <p className="text-gray-500 text-[15px]">
            Discover our new collections and upgrade your living space.
          </p>
        </div>

        {/* ---------------- SEARCH RESULTS ---------------- */}
        {searchTerm && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#142C2C]">
                Search Results <span className="text-gray-400 font-normal text-lg ml-2">({searchResults.length})</span>
              </h2>
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Search size={24} />
                </div>
                <p className="text-[#142C2C] font-semibold text-lg">No products found</p>
                <p className="text-gray-500 mt-1">We couldn't find anything matching "{searchTerm}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {searchResults.map((p) => (
                  <ProductCard key={p._id} product={p} navigate={navigate} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- HERO BANNER ---------------- */}
        {!searchTerm && (
          <div className="relative rounded-3xl overflow-hidden mb-12 bg-[#142C2C] aspect-[21/9] lg:aspect-[36/10] group shadow-xl max-w-[1400px] mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10"></div>
            <img
              src="/images/UserBanner.png"
              alt="Modern Furnishing Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.style.display = 'none'; // Hide if not available, fallback to pure color gradient
              }}
            />

            {/* Fallback geometric pattern if image fails */}
            <div className="absolute inset-0 opacity-10 flex text-white pointer-events-none">
              <div className="w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            </div>

            <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center p-8 sm:p-12 w-full md:w-2/3 lg:w-1/2">
              <span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-bold tracking-widest uppercase border border-white/20 w-max">
                New Arrival
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-[1.15]">
                Elevate Your <br /><span className="text-[#CRA873] italic font-serif pr-2">Living</span> Space
              </h2>
              <p className="text-white/80 mb-8 max-w-md text-[15px] sm:text-base font-light">
                Discover our exclusive new collection of premium furniture designed for modern homes.
              </p>
              <button
                onClick={() => navigate("/latest-products")}
                className="bg-white text-[#142C2C] px-8 py-3.5 rounded-full font-semibold max-w-max hover:bg-[#CRA873] hover:text-white transition-all duration-300 shadow-lg shadow-black/20"
              >
                Shop Collection
              </button>
            </div>
          </div>
        )}

        {/* ---------------- CATEGORIES ---------------- */}
        {!searchTerm && uniqueCategories.length > 0 && (
          <div className="mb-14 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#142C2C] tracking-tight">Shop by Category</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-[#142C2C] transition-colors disabled:opacity-50">
                  <ChevronRight className="rotate-180 w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#142C2C] hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {uniqueCategories.map((cat) => (
                <div
                  key={cat._id}
                  onClick={() => navigate(`/types/${cat._id}`)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-[2rem] overflow-hidden bg-white shadow-sm border border-gray-100 group-hover:border-[#9B804E]/30 group-hover:shadow-[0_8px_30px_rgba(155,128,78,0.15)] transition-all duration-500 mb-4 p-4 relative">
                    <div className="absolute inset-0 bg-[#9B804E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {cat.image_url ? (
                      <img
                        src={getImageUrl(cat.image_url)}
                        alt={cat.name}
                        className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#142C2C]/20 font-serif italic text-4xl">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-[14px] font-semibold text-[#142C2C] text-center group-hover:text-[#9B804E] transition-colors leading-tight">
                    {cat.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- LATEST PRODUCTS ---------------- */}
        {!searchTerm && (
          <div className="mb-12 max-w-[1400px] mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#142C2C] tracking-tight mb-2">New Arrivals</h2>
                <p className="text-gray-500 text-[15px]">Handpicked additions to elevate your space</p>
              </div>
              <button
                onClick={() => navigate("/latest-products")}
                className="group flex items-center gap-1.5 text-[15px] font-semibold text-[#9B804E] hover:text-[#142C2C] transition-colors pb-1 border-b-2 border-transparent hover:border-[#142C2C]"
              >
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse flex flex-col gap-4">
                    <div className="bg-gray-200 rounded-3xl aspect-[4/5] w-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.slice(0, 8).map((p) => (
                  <ProductCard key={p._id} product={p} navigate={navigate} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </UserLayout>
  );
};

/* =================== PRODUCT CARD COMPONENT =================== */
const ProductCard = ({ product: p, navigate }) => {
  return (
    <div
      onClick={() =>
        navigate(
          `/product/${p.category?.name?.toLowerCase().trim() || 'unknown'}/${p._id}`
        )
      }
      className="group bg-white rounded-[1.5rem] p-3 sm:p-4 border border-gray-100 hover:border-[#9B804E]/20 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[4/5] w-full bg-gray-50 rounded-[1rem] overflow-hidden mb-4 p-4 flex items-center justify-center">
        <img
          src={
            p.images?.[0]
              ? getImageUrl(p.images[0])
              : "/no-image.png"
          }
          alt={p.name}
          className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply"
        />

        {/* Quick Add Button Overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <button className="bg-white/90 backdrop-blur text-[#142C2C] hover:bg-[#142C2C] hover:text-white rounded-full p-2.5 shadow-lg transition-colors border border-white/20">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-1">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-1">
          {p.category?.name || 'Furnishing'}
        </span>
        <h3 className="font-semibold text-[#142C2C] text-[15px] sm:text-[16px] leading-snug mb-2 line-clamp-2">
          {p.name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <p className="font-bold text-[#142C2C] text-lg sm:text-xl">
            ₹{p.price.toLocaleString('en-IN')}
          </p>
          {p.originalPrice && p.originalPrice > p.price && (
            <p className="text-xs text-gray-400 line-through">
              ₹{p.originalPrice.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
