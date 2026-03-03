import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, ShoppingBag, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import api from "../../api";
import ImageGallery from "../../components/product/ImageGallery";
import { addToCart } from "../../api/cartApi";
import toast from "react-hot-toast";

/* IMAGE HELPER */
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/uploads"))
    return `http://localhost:5000${imageUrl}`;
  return `http://localhost:5000/uploads/${imageUrl}`;
};

const WoodenFlooringDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedFlooring, setRelatedFlooring] = useState([]);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [customSize, setCustomSize] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [generalMessage, setGeneralMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const displayName =
    user?.fullName ||
    (user?.firstName && user?.lastName
      ? user.firstName + " " + user.lastName
      : "");

  /* ================= FETCH MAIN PRODUCT ================= */
  useEffect(() => {
    if (!id) return;

    api
      .get(`/products/${id}`)
      .then((res) => {
        if (res.data?.product) {
          setProduct(res.data.product);
        } else {
          setProduct(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching wooden flooring:", err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= FETCH RELATED FLOORING ================= */
  useEffect(() => {
    if (!product?._id) return;

    api
      .get("/products/category/wooden-flooring")
      .then((res) => {
        const others = (res.data.products || []).filter(
          (p) => p._id !== product._id
        );
        setRelatedFlooring(others.slice(0, 4));
      })
      .catch(() => setRelatedFlooring([]));
  }, [product]);

  const handleCustomSubmit = async () => {
    if (!user?._id) {
      toast.error("Please login first!");
      return;
    }
    if (!customSize.trim()) {
      toast.error("Please enter requirement details");
      return;
    }
    try {
      const customDimensions = {
        width: customSize,
        height: "N/A",
        note: customNote || "Flooring measurement request",
      };
      const response = await addToCart(user._id, product._id, 1, true, customDimensions);
      if (response.success) {
        toast.success("Measurement request added to cart for Quoting!");
        setShowCustomModal(false);
        setCustomSize("");
        setCustomNote("");
        window.dispatchEvent(new Event("cart-updated"));
        navigate("/user/cart");
      } else {
        toast.error("Failed to add custom item to cart.");
      }
    } catch (err) {
      console.log("BACKEND ERROR:", err);
      toast.error("Server error");
    }
  };

  const handleInquirySubmit = async () => {
    if (!user?._id) {
      toast.error("Please login first!");
      return;
    }
    if (!generalMessage.trim()) {
      toast.error("Please describe your issue");
      return;
    }
    try {
      await api.post("/inquiry/add", {
        product_id: product._id,
        type: "general",
        name: displayName,
        email: user?.email || "No Email",
        contact: user?.phone || "N/A",
        message: generalMessage,
      });
      toast.success("Inquiry sent!");
      setShowInquiryModal(false);
      setGeneralMessage("");
    } catch (err) {
      console.log("BACKEND ERROR:", err.response?.data);
      toast.error("Server error");
    }
  };

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!user || !user._id) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    try {
      const response = await addToCart(user._id, product._id, 1);

      if (response.success) {
        toast.success("Added to cart!");

        // ⭐ UPDATE CART COUNT IN LOCAL STORAGE
        const currentCount = Number(localStorage.getItem("cartCount")) || 0;
        localStorage.setItem("cartCount", currentCount + 1);

        navigate("/user/cart"); // redirect to cart
      } else {
        toast.error("Failed to add to cart.");
      }

    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
  };

  if (loading)
    return <p className="p-10 text-center">Loading flooring details...</p>;

  if (!product)
    return <p className="p-10 text-center">Flooring not found</p>;

  /* NORMALIZE IMAGES */
  const images =
    product.images?.map(getImageUrl) ||
    product.colors?.[0]?.images?.map(getImageUrl) ||
    [];

  const extra = product?.extraFields || {};

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 sm:py-12 w-full space-y-12">
        {/* ================= HERO SECTION ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">

          {/* IMAGE GALLERY */}
          <div className="w-full h-full flex flex-col justify-start">
            <ImageGallery images={images} />
          </div>

          {/* SUMMARY */}
          <div className="flex flex-col justify-center space-y-6">

            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="bg-[#f8f5ed] text-[#9b804e] border border-[#e6dbc8] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
                    Premium Selection
                  </span>
                  <span className="bg-white border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] text-gray-600 font-bold tracking-wide shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
                    Available
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    onClick={() => navigate("/user/dashboard")}
                    className="text-[11px] font-bold text-gray-400 hover:text-[#0a2328] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Home
                  </span>
                  <span
                    onClick={() => navigate(-1)}
                    className="text-[11px] font-bold text-gray-400 hover:text-[#0a2328] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Back
                  </span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-5 leading-tight tracking-tight">
                {product.name}
              </h1>

              <p className="text-[15px] sm:text-[15px] text-gray-500 leading-relaxed font-medium max-w-xl pr-4">
                {product.shortDescription || "Premium wooden flooring for elegant interiors, offering durability and timeless appeal."}
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-400 block mb-1">Total Price</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-[#0a2328] tracking-tight">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium tracking-wide">Inclusive of all taxes. Installation extra.</p>
              </div>

              <div className="flex items-center bg-gray-50/80 border border-gray-100 rounded-lg p-2 px-4 gap-4">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Unit</span>
                <span className="text-[13px] font-bold text-[#0a2328]">
                  {product.coverage || "Per sq.ft"}
                </span>
              </div>
            </div>


            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-3">
                <button className="w-full py-4 bg-[#0a2328] text-white rounded-xl font-bold text-[15px] hover:bg-[#133036] transition-all duration-300 shadow-md flex items-center justify-center gap-2 active:scale-[0.99]">
                  Order Now
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-white text-[#0a2328] border-2 border-[#0a2328] rounded-xl font-bold text-[15px] hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <ShoppingBag size={18} className="stroke-[2.5]" /> Add to Cart
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => setShowCustomModal(true)} className="py-3.5 bg-white text-[#0a2328] rounded-xl font-bold text-[13px] hover:bg-gray-50 transition-colors border border-gray-200 active:scale-[0.99] flex items-center justify-center gap-2">
                  Request Measurement
                </button>
                <button onClick={() => setShowInquiryModal(true)} className="py-3.5 bg-white text-indigo-900 rounded-xl font-bold text-[13px] hover:bg-indigo-50 transition-colors border border-indigo-200 active:scale-[0.99] flex items-center justify-center gap-2">
                  Send Inquiry
                </button>
              </div>
            </div>

            {/* TRUST ROW */}
            <div className="grid grid-cols-3 gap-3 text-xs font-medium text-gray-500 pt-5 mt-4 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-gray-50/80">
                <Truck className="w-5 h-5 text-[#9b804e]" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Pan India</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-gray-50/80">
                <ShieldCheck className="w-5 h-5 text-[#9b804e]" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Quality</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-gray-50/80">
                <RefreshCw className="w-5 h-5 text-[#9b804e]" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Guidance</span>
              </div>
            </div>

          </div>
        </section>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ================= FLOORING DETAILS ================= */}
          <section className="relative overflow-hidden lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 p-8 sm:p-10 h-max">
            <div className="absolute top-0 left-0 w-2.5 h-full bg-[#0a2328]" />
            <h2 className="text-2xl font-extrabold text-[#0a2328] mb-10 relative z-10">
              Technical Specifications
            </h2>

            <div className="grid grid-cols-2 gap-y-10 gap-x-6">
              <DetailRow label="Flooring Type" value={product.type?.type_name} />
              <DetailRow label="Wood/Core" value={extra.woodType} />
              <DetailRow label="Dimensions" value={extra.thickness || extra.plankWidth || extra.plankLength ? `${extra.thickness ? extra.thickness + ' Thick, ' : ''}${extra.plankWidth ? extra.plankWidth + 'W x ' : ''}${extra.plankLength ? extra.plankLength + 'L' : ''}` : "Standard"} />
              <DetailRow label="Finish" value={extra.finish} />
              <DetailRow label="Installation" value={extra.installationMethod} />
              <DetailRow label="Durability" value={extra.durabilityUsage} />
              <DetailRow label="Resistance" value={extra.resistance} />
              <DetailRow label="Maintenance" value={extra.care} />
            </div>
          </section>

          {/* ================= DESCRIPTION ================= */}
          <section className="lg:col-span-1 bg-[#142C2C] rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
              <span className="w-8 h-1 bg-[#9B804E] rounded-full"></span> Product Overview
            </h2>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 relative z-10 text-[14px] leading-relaxed font-light text-gray-200">
              {product.description || "Transform your living spaces with our premium wooden flooring collection. Designed for both aesthetic appeal and robust durability, these planks offer timeless elegance that pairs beautifully with modern and classic interiors alike. Contact our experts for sizing and installation assistance."}
            </div>
          </section>
        </div>


        {/* ================= RELATED FLOORING ================= */}
        <section className="pt-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#142C2C]">More from Wooden Flooring</h2>
            <button onClick={() => navigate("/categories")} className="text-sm font-semibold text-[#9B804E] hover:text-[#142C2C] transition-colors flex items-center gap-1">
              View Collection <ChevronRight size={16} />
            </button>
          </div>

          {relatedFlooring.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-400">
              No related products found at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedFlooring.map((floor) => {
                const img = floor.images?.[0] || floor.image_url;

                return (
                  <div
                    key={floor._id}
                    onClick={() => navigate(`/product/wooden-flooring/${floor._id}`)}
                    className="group bg-white rounded-[1.5rem] p-4 border border-gray-100 hover:border-[#9B804E]/30 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[4/5] w-full bg-[#FAFAFA] rounded-2xl overflow-hidden mb-4 p-5 flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                      {img ? (
                        <img
                          src={getImageUrl(img)}
                          alt={floor.name}
                          className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif italic text-2xl">
                          No Image
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
                    </div>

                    <div className="flex flex-col flex-1 px-2 pb-1">
                      <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-gray-400 mb-2">
                        {floor.category?.name || "Wooden Flooring"}
                      </span>
                      <h4 className="font-semibold text-[#142C2C] text-[15px] group-hover:text-[#9B804E] transition-colors leading-snug line-clamp-2 mb-3">
                        {floor.name}
                      </h4>
                      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="font-bold text-[#142C2C] text-lg">₹{floor.price.toLocaleString('en-IN')}</span>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#142C2C] group-hover:text-white transition-colors">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {showCustomModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-8 rounded-3xl shadow-xl space-y-5 relative">
              <h3 className="text-2xl font-bold text-[#142C2C]">Request Measurement & Quote</h3>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-[13px] text-amber-800 leading-relaxed">
                <strong>Notice:</strong> Custom orders require manual review. Please allow up to 24 hours for confirmation. A quote will be added to your cart upon submission.<br /><br />
                For immediate assistance, contact the admin at <strong className="text-amber-900">+91 8097258677</strong>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 uppercase tracking-wide">Approximate Area (sq.ft) <span className="text-red-500">*</span></label>
                  <input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="e.g. 500 sq.ft for living room"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 uppercase tracking-wide">Additional Details / Layout Notes</label>
                  <textarea
                    value={customNote}
                    placeholder="Any specific instructions on room layouts, multiple rooms, or subfloor condition..."
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all outline-none min-h-[100px] resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomSubmit}
                  className="px-6 py-2.5 bg-[#142C2C] text-white font-medium rounded-xl hover:bg-[#9B804E] transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {showInquiryModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-8 rounded-3xl shadow-xl space-y-5 relative">
              <h3 className="text-2xl font-bold text-[#142C2C]">General Inquiry</h3>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Name</label>
                  <input
                    value={displayName}
                    disabled
                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-600 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    value={user?.email || ""}
                    disabled
                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-600 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone</label>
                  <input
                    value={user?.phone || ""}
                    disabled
                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-600 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 uppercase tracking-wide">Your Message <span className="text-red-500">*</span></label>
                  <textarea
                    value={generalMessage}
                    placeholder="How can we help you regarding this product?"
                    onChange={(e) => setGeneralMessage(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all outline-none min-h-[120px] resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInquirySubmit}
                  className="px-6 py-2.5 bg-[#142C2C] text-white font-medium rounded-xl hover:bg-[#9B804E] transition-colors"
                >
                  Submit Inquiry
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

/* Reusable Detail Component */
const DetailRow = ({ label, value }) => {
  if (!value || value === "N/A" || value === "-") return null;
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#a3947b]"></div>
        <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#a3947b]">{label}</span>
      </div>
      <span className="font-bold text-[15px] text-[#0a2328]">{value}</span>
    </div>
  );
};

export default WoodenFlooringDetails;
