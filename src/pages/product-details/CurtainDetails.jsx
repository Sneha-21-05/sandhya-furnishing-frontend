import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, ShoppingBag, ShieldCheck, Truck, RefreshCw, Plus, Minus } from "lucide-react";
import api from "../../api";
import ImageGallery from "../../components/product/ImageGallery";
import { addToCart } from "../../api/cartApi";
import toast from "react-hot-toast";

/* IMAGE HELPER */
const getImageUrl = (url) => {
  if (!url) return "";
  return url;
};

const CurtainsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedCurtains, setRelatedCurtains] = useState([]);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  const [customSize, setCustomSize] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [generalMessage, setGeneralMessage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  /* LOCK BODY SCROLL WHEN MODAL OPEN */
  useEffect(() => {
    if (showCustomModal || showInquiryModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showCustomModal, showInquiryModal]);


  const displayName =
    user?.fullname || user?.fullName ||
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
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

  /* FETCH RELATED CURTAINS */
  useEffect(() => {
    if (!product?._id) return;

    api.get("/products/category/curtains").then((res) => {
      const others = (res.data.products || []).filter(
        (p) => p._id !== product._id
      );
      setRelatedCurtains(others.slice(0, 4));
    });
  }, [product]);

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
      const response = await addToCart(user._id, product._id, 1);
      if (response.success) navigate("/user/checkout");
    } catch {
      toast.error("Something went wrong");
    }
  };

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
      // Create a custom dimensions object to pass
      const customDimensions = {
        width: customSize, // Using the single input for now, but label it broadly
        height: "N/A",     // Can update UI later to split WxH if needed, but keeping it simple for now based on existing UI
        note: customNote || "Custom size request",
      };

      const response = await addToCart(user._id, product._id, 1, true, customDimensions);

      if (response.success) {
        toast.success("Custom size item added to cart for Quoting!");
        setShowCustomModal(false);
        setCustomSize("");
        setCustomNote("");

        // Dispatch event so navbar cart updates
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

  if (loading)
    return <p className="p-10 text-center">Loading curtain details...</p>;

  if (!product)
    return <p className="p-10 text-center">Curtain not found</p>;

  const dimensionImages =
    product.dimensionImages?.map(getImageUrl) || [];

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 sm:py-12 w-full space-y-12">

        {/* ================= HERO SECTION ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">

          {/* IMAGE GALLERY */}
          <div className="w-full h-full flex flex-col justify-start">
            <ImageGallery images={product.images?.map(getImageUrl) || []} />
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col justify-center space-y-6">

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-[#f8f5ed] text-[#9b804e] border border-[#e6dbc8] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
                    Premium Quality
                  </span>
                  <span className="bg-white border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] text-gray-600 font-bold tracking-wide shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {product.inStock ? "In Stock & Ready to Ship" : "Made to Order"}
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

              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-5 tracking-tight">
                {product.name}
              </h1>

              <p className="text-[15px] text-gray-500 leading-relaxed font-medium mb-8 pr-4">
                {product.description}
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100 mt-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-400 block mb-1">
                Total Price
              </span>
              <div className="flex items-end justify-between gap-4 mb-1">
                <p className="text-4xl font-black text-[#0a2328] tracking-tight">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
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
              <p className="text-[11px] text-gray-400 font-medium tracking-wide mb-4">
                Inclusive of all taxes
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-[11px] font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  Set of 2 Panels
                </span>
                {product.extraFields?.customSizeAvailable && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                    ★ Customizable Size Available
                  </span>
                )}
              </div>
            </div>


            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleOrderNow}
                className="w-full py-4 bg-[#0a2328] text-white rounded-xl font-bold text-[15px] hover:bg-[#133036] transition-all shadow-md active:scale-[0.99]"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-white text-[#0a2328] border-2 border-[#0a2328] rounded-xl font-bold text-[15px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="py-3.5 bg-white text-[#0a2328] rounded-xl font-bold text-[13px] hover:bg-gray-50 transition-colors border border-gray-200 active:scale-[0.99]"
                >
                  Request Custom Size
                </button>
                <button
                  onClick={() => setShowInquiryModal(true)}
                  className="py-3.5 bg-white text-indigo-900 rounded-xl font-bold text-[13px] hover:bg-indigo-50 transition-colors border border-indigo-200 active:scale-[0.99]"
                >
                  Send Inquiry
                </button>
              </div>
            </div>

            {/* TRUST ROW */}
            <div className="grid grid-cols-3 gap-3 text-xs font-medium text-gray-500 pt-5 mt-2 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-gray-50/80">
                <Truck className="w-5 h-5 text-[#9b804e]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-gray-50/80">
                <ShieldCheck className="w-5 h-5 text-[#9b804e]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-gray-50/80">
                <RefreshCw className="w-5 h-5 text-[#9b804e]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Easy Returns</span>
              </div>
            </div>

            {/* DIMENSION IMAGES GALLERY */}
            {dimensionImages.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a2328]"></div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#0a2328]">Measurements & Dimensions</span>
                </div>
                <div className="bg-white rounded-[1.5rem] border border-gray-100 p-4 shadow-sm">
                  <ImageGallery images={dimensionImages} />
                </div>
              </div>
            )}

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
              {product.extraFields?.fabricType && <DetailRow label="Fabric" value={product.extraFields.fabricType} />}
              {product.extraFields?.transparency && <DetailRow label="Transparency" value={product.extraFields.transparency} />}
              {product.extraFields?.pattern && <DetailRow label="Pattern" value={product.extraFields.pattern} />}
              {product.extraFields?.color && <DetailRow label="Color" value={product.extraFields.color} />}
              {product.extraFields?.lining && <DetailRow label="Lining" value={product.extraFields.lining} />}
              {product.extraFields?.stitchingType && <DetailRow label="Stitching" value={product.extraFields.stitchingType} />}
              {product.extraFields?.defaultSize && <DetailRow label="Size" value={product.extraFields.defaultSize} />}
              {product.extraFields?.installationType && <DetailRow label="Installation" value={product.extraFields.installationType} />}
              {product.extraFields?.installationCharges && <DetailRow label="Install Charge" value={`₹${product.extraFields.installationCharges}`} />}
              {product.extraFields?.careInstructions && <DetailRow label="Care" value={product.extraFields.careInstructions} />}
              {product.extraFields?.customSizeAvailable && <DetailRow label="Custom Size" value="Available" />}
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

          {relatedCurtains.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-400">
              No related products found at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCurtains.map((curtain) => {
                const img = curtain.images?.[0];

                return (
                  <div
                    key={curtain._id}
                    onClick={() => navigate(`/product/curtains/${curtain._id}`)}
                    className="group bg-white rounded-[1.5rem] p-4 border border-gray-100 hover:border-[#9B804E]/30 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[4/5] w-full bg-[#FAFAFA] rounded-2xl overflow-hidden mb-4 p-5 flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                      {img ? (
                        <img
                          src={getImageUrl(img)}
                          alt={curtain.name}
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
                        {curtain.category?.name || "Curtains"}
                      </span>
                      <h4 className="font-semibold text-[#142C2C] text-[15px] group-hover:text-[#9B804E] transition-colors leading-snug line-clamp-2 mb-3">
                        {curtain.name}
                      </h4>
                      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="font-bold text-[#142C2C] text-lg">₹{curtain.price.toLocaleString('en-IN')}</span>
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

        {/* ================= MODALS ================= */}
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-8 rounded-3xl shadow-xl space-y-5 relative">

              <h3 className="text-2xl font-bold text-[#142C2C]">Request Custom Size</h3>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-[13px] text-amber-800 leading-relaxed">
                <strong>Notice:</strong> Custom orders require manual review. Please allow up to 24 hours for confirmation. A quote will be added to your cart upon submission.<br /><br />
                For immediate assistance, contact the admin at <strong className="text-amber-900">+91 8097258677</strong>
              </div>

              <div className="space-y-4">
                {/* Required Size */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-[#142C2C] mb-1.5 uppercase tracking-wide">Required Size <span className="text-red-500">*</span></label>
                  <input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="e.g. 84 inches length, 50 inches width"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all outline-none"
                  />
                </div>

                {/* Additional Note */}
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
                {/* Name */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Name</label>
                  <input
                    value={displayName}
                    disabled
                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-600 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    value={user?.email || ""}
                    disabled
                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-600 focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone</label>
                  <input
                    value={user?.phone || ""}
                    disabled
                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-600 focus:outline-none"
                  />
                </div>

                {/* Your Message */}
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

export default CurtainsDetails;
