import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, ShoppingBag, ShieldCheck, Truck, RefreshCw, Minus, Plus, Check } from "lucide-react";
import api from "../../api";
import ImageGallery from "../../components/product/ImageGallery";
import { addToCart } from "../../api/cartApi";
import toast from "react-hot-toast";

/* IMAGE HELPER */
const getImageUrl = (url) => {
  if (!url) return "";
  return url;
};

const SofaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedSofas, setRelatedSofas] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showRefurbishModal, setShowRefurbishModal] = useState(false);

  const [customSize, setCustomSize] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [generalMessage, setGeneralMessage] = useState("");

  // Refurbish State
  const [refurbishServices, setRefurbishServices] = useState([]);
  const [refurbishDimensions, setRefurbishDimensions] = useState("");
  const [refurbishFabric, setRefurbishFabric] = useState("");
  const [refurbishNotes, setRefurbishNotes] = useState("");
  const [refurbishImages, setRefurbishImages] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const displayName =
    user?.fullname || user?.fullName ||
    (user?.firstName && user?.lastName
      ? user.firstName + " " + user.lastName
      : "");

  /* FETCH PRODUCT */
  useEffect(() => {
    if (!id) return;

    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data?.product || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  /* FETCH RELATED */
  useEffect(() => {
    if (!product?._id) return;

    api.get("/products/category/sofa").then((res) => {
      const others = (res.data.products || []).filter(
        (p) => p._id !== product._id
      );
      setRelatedSofas(others.slice(0, 4));
    });
  }, [product]);

  const handleCustomSubmit = async () => {
    if (!user?._id) {
      toast.error("Please login first!");
      return;
    }
    if (!customSize.trim()) {
      toast.error("Please enter required size");
      return;
    }
    try {
      const customDimensions = {
        width: customSize,
        height: "N/A",
        note: customNote || "Custom size request",
      };
      const response = await addToCart(user._id, product._id, quantity, true, customDimensions);
      if (response.success) {
        toast.success("Custom size item added to cart for Quoting!");
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

  const toggleRefurbishService = (service) => {
    setRefurbishServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleRefurbishImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (refurbishImages.length + files.length > 3) {
      toast.error("You can only upload up to 3 images");
      return;
    }
    setRefurbishImages([...refurbishImages, ...files]);
  };

  const removeRefurbishImage = (index) => {
    setRefurbishImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRefurbishSubmit = async () => {
    if (!user?._id) {
      toast.error("Please login first!");
      return;
    }
    if (refurbishServices.length === 0) {
      toast.error("Please select at least one service needed");
      return;
    }
    if (refurbishImages.length === 0) {
      toast.error("Please upload at least one photo of your existing frame");
      return;
    }
    if (!refurbishDimensions.trim()) {
      toast.error("Please provide approximate dimensions or seating capacity");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("product_id", product._id);
      formData.append("name", displayName);
      formData.append("email", user?.email || "No Email");
      formData.append("contact", user?.phone || "N/A");
      formData.append("refurbishServices", JSON.stringify(refurbishServices));
      formData.append("frameDimensions", refurbishDimensions);
      formData.append("fabricPreference", refurbishFabric);
      formData.append("additionalNotes", refurbishNotes);

      refurbishImages.forEach(img => {
        formData.append("images", img);
      });

      const res = await api.post("/inquiry/refurbish", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        toast.success("Refurbishment request sent successfully!");
        setShowRefurbishModal(false);
        setRefurbishServices([]);
        setRefurbishDimensions("");
        setRefurbishFabric("");
        setRefurbishNotes("");
        setRefurbishImages([]);
      }
    } catch (err) {
      console.log("BACKEND ERROR:", err.response?.data);
      toast.error("Failed to send request");
    }
  };

  const handleAddToCart = async () => {
    if (!user?._id) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    try {
      const response = await addToCart(user._id, product._id, quantity);
      if (response.success) navigate("/user/cart");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleOrderNow = async () => {
    if (!user?._id) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    try {
      const response = await addToCart(user._id, product._id, quantity);
      if (response.success) navigate("/user/checkout");
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (loading)
    return <p className="p-10 text-center">Loading sofa details...</p>;

  if (!product)
    return <p className="p-10 text-center">Sofa not found</p>;

  const dimensionImages = product.dimensionImages?.map(getImageUrl) || [];

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col pt-8">
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 sm:py-12 w-full space-y-12">

        {/* ================= HERO SECTION ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-5 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">

          {/* IMAGE GALLERY */}
          <div className="w-full h-full flex flex-col justify-start">
            <ImageGallery images={[...(product.images || []), ...(product.dimensionImages || [])]} />
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col justify-center">

            {/* BADGES & TITLE */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-[#f8f5ed] text-[#9b804e] border border-[#e6dbc8] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
                    Premium Quality
                  </span>
                  <span className="bg-white border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] text-gray-600 font-bold tracking-wide shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${product.inStock ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    {product.inStock ? "In Stock & Ready to Ship" : "Made to Order (2-3 weeks)"}
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
                {product.description}
              </p>
            </div>

            {/* PRICE & QUANTITY */}
            <div className="pt-6 border-t border-gray-100 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-400 block mb-1">Total Price</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-[#0a2328] tracking-tight">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium tracking-wide">Inclusive of all taxes</p>
              </div>

              {/* QUANTITY SELECTOR */}
              <div className="flex items-center bg-gray-50/80 border border-gray-100 rounded-lg p-1.5 px-4 gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty</span>
                <div className="flex items-center gap-3 font-semibold text-[#0a2328]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#0a2328] hover:bg-white rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent bg-white border border-gray-100 shadow-sm"
                    disabled={quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-bold text-[#0a2328] text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#0a2328] bg-white border border-gray-100 rounded-md transition-all shadow-sm hover:shadow"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleOrderNow}
                  className="w-full py-4 bg-[#0a2328] text-white rounded-xl font-bold text-[15px] hover:bg-[#133036] transition-all duration-300 shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  Buy Now
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
                  Request Custom Size
                </button>
                <button onClick={() => setShowInquiryModal(true)} className="col-span-1 py-3.5 bg-white text-indigo-900 rounded-xl font-bold text-[13px] hover:bg-indigo-50 transition-colors border border-indigo-200 active:scale-[0.99] flex items-center justify-center gap-2">
                  Send Inquiry
                </button>
              </div>

              <button
                onClick={() => setShowRefurbishModal(true)}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 rounded-xl font-bold text-[13px] hover:from-amber-100 hover:to-orange-100 transition-colors border border-amber-200/60 active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm"
              >
                🛠️ Have an existing frame? Get it Refurbished
              </button>
            </div>

            {/* TRUST ROW */}
            <div className="grid grid-cols-3 gap-3 text-xs font-medium text-gray-500 pt-5 mt-4 border-t border-gray-100">
              <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50/80 hover:bg-white hover:shadow-sm transition-all duration-300">
                <Truck className="w-5 h-5 text-[#9b804e]" />
                <span className="text-[10px] text-center font-bold uppercase tracking-wider">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50/80 hover:bg-white hover:shadow-sm transition-all duration-300">
                <ShieldCheck className="w-5 h-5 text-[#9b804e]" />
                <span className="text-[10px] text-center font-bold uppercase tracking-wider">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50/80 hover:bg-white hover:shadow-sm transition-all duration-300">
                <RefreshCw className="w-5 h-5 text-[#9b804e]" />
                <span className="text-[10px] text-center font-bold uppercase tracking-wider">Easy Returns</span>
              </div>
            </div>

          </div>
        </section>

        {/* ================= DETAILS + DIMENSIONS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* PRODUCT DETAILS */}
          <div className="relative overflow-hidden bg-white rounded-[2rem] border border-gray-100 p-8 sm:p-10 h-max">
            <div className="absolute top-0 left-0 w-2.5 h-full bg-[#0a2328]" />
            <h2 className="text-2xl font-extrabold text-[#0a2328] mb-10 relative z-10">
              Detailed Specifications
            </h2>

            <div className="grid grid-cols-2 gap-y-10 gap-x-6">

              {product.extraFields?.size && <DetailRow label="Size" value={product.extraFields.size} />}
              {product.extraFields?.color && <DetailRow label="Color" value={product.extraFields.color} />}
              {product.extraFields?.fabric && <DetailRow label="Fabric" value={product.extraFields.fabric} />}
              {product.extraFields?.warranty && <DetailRow label="Warranty" value={product.extraFields.warranty} />}

            </div>

            {product.extraFields?.extraNote && (
              <div className="mt-10 pt-10 border-t border-gray-50">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a2328]"></div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#0a2328]">ADDITIONAL FEATURES</span>
                </div>
                <div className="bg-[#fafafa] border border-gray-100 rounded-2xl p-6 text-[14px] text-gray-600 leading-relaxed font-medium">
                  {product.extraFields.extraNote}
                </div>
              </div>
            )}
          </div>

        </section>

        {/* ================= RELATED ================= */}
        <section className="pt-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#142C2C]">You May Also Like</h2>
            <button onClick={() => navigate("/categories")} className="text-sm font-semibold text-[#9B804E] hover:text-[#142C2C] transition-colors flex items-center gap-1">
              View Collection <ChevronRight size={16} />
            </button>
          </div>

          {relatedSofas.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-400">
              No related products found at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedSofas.map((sofa) => {
                const img = sofa.images?.[0];

                return (
                  <div
                    key={sofa._id}
                    onClick={() => navigate(`/product/sofa/${sofa._id}`)}
                    className="group bg-white rounded-[1.5rem] p-4 border border-gray-100 hover:border-[#9B804E]/30 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[4/5] w-full bg-[#FAFAFA] rounded-2xl overflow-hidden mb-4 p-5 flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                      {img ? (
                        <img
                          src={getImageUrl(img)}
                          alt={sofa.name}
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
                        {sofa.category?.name || "Sofa"}
                      </span>
                      <h4 className="font-semibold text-[#142C2C] text-[15px] group-hover:text-[#9B804E] transition-colors leading-snug line-clamp-2 mb-3">
                        {sofa.name}
                      </h4>
                      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="font-bold text-[#142C2C] text-lg">₹{sofa.price.toLocaleString('en-IN')}</span>
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
              <h3 className="text-2xl font-bold text-[#142C2C]">Request Custom Size</h3>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-[13px] text-amber-800 leading-relaxed">
                <strong>Notice:</strong> Custom orders require manual review. Please allow up to 24 hours for confirmation. A quote will be added to your cart upon submission.<br /><br />
                For immediate assistance, contact the admin at <strong className="text-amber-900">+91 8097258677</strong>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 uppercase tracking-wide">Required Size <span className="text-red-500">*</span></label>
                  <input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="e.g. 84 inches length, 50 inches width"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 uppercase tracking-wide">Additional Note</label>
                  <textarea
                    value={customNote}
                    placeholder="Any specific instructions or variations from standard..."
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

        {/* REFURBISH MODAL */}
        {showRefurbishModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 animate-in fade-in duration-200 py-10">
            <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 rounded-3xl shadow-xl space-y-6 relative custom-scrollbar my-auto">
              <div>
                <h3 className="text-2xl font-bold text-[#142C2C]">Refurbish Your Frame</h3>
                <p className="text-sm text-gray-500 mt-1">Send us details and photos of your existing frame, and we'll provide a custom quote to make it look brand new.</p>
              </div>

              <div className="space-y-6">

                {/* Services */}
                <div>
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-2.5 block uppercase tracking-wide">Services Required <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {["New Cushions", "New Fabric", "Frame Repair", "Foam Replacement", "Other"].map(svc => (
                      <div
                        key={svc}
                        onClick={() => toggleRefurbishService(svc)}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${refurbishServices.includes(svc) ? 'border-[#9B804E] bg-[#9B804E]/5' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${refurbishServices.includes(svc) ? 'bg-[#9B804E] border-[#9B804E]' : 'border-gray-300'}`}>
                          {refurbishServices.includes(svc) && <Check size={12} className="text-white" />}
                        </div>
                        <span className={`text-[13px] font-medium ${refurbishServices.includes(svc) ? 'text-[#9B804E]' : 'text-gray-700'}`}>{svc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dimensions */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 uppercase tracking-wide">Approx Dimensions or Seating <span className="text-red-500">*</span></label>
                  <input
                    value={refurbishDimensions}
                    onChange={(e) => setRefurbishDimensions(e.target.value)}
                    placeholder="e.g., 3-seater, 84 inches length"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all outline-none"
                  />
                </div>

                {/* Fabric */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 uppercase tracking-wide">Fabric Preference</label>
                  <input
                    value={refurbishFabric}
                    onChange={(e) => setRefurbishFabric(e.target.value)}
                    placeholder="e.g., Velvet, Leather, Same as this product"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all outline-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 block uppercase tracking-wide">Photos of Existing Frame <span className="text-red-500">*</span></label>
                  <p className="text-[11px] text-gray-500 mb-3">Upload up to 3 clear photos of your current sofa.</p>

                  <div className="flex flex-wrap gap-4">
                    {refurbishImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="upload preview" />
                        <button
                          onClick={() => removeRefurbishImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          &times;
                        </button>
                      </div>
                    ))}

                    {refurbishImages.length < 3 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#9B804E] hover:bg-gray-50 transition-colors">
                        <Plus size={20} className="text-gray-400" />
                        <span className="text-[10px] font-medium text-gray-500 mt-1">Add Photo</span>
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleRefurbishImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 uppercase tracking-wide">Additional Notes</label>
                  <textarea
                    value={refurbishNotes}
                    placeholder="Any specific structural damages or requests..."
                    onChange={(e) => setRefurbishNotes(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all outline-none min-h-[100px] resize-none"
                  />
                </div>

              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowRefurbishModal(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefurbishSubmit}
                  className="px-6 py-2.5 bg-[#142C2C] text-white font-medium rounded-xl hover:bg-[#9B804E] transition-colors shadow-sm"
                >
                  Request Quote
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div >
  );
};

/* Reusable Detail Row */
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-[#a3947b]"></div>
      <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#a3947b]">{label}</span>
    </div>
    <span className="font-bold text-[15px] text-[#0a2328]">{value}</span>
  </div>
);

export default SofaDetails;
