import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Minus,
  Plus,
} from "lucide-react";
import api from "../../api";
import ImageGallery from "../../components/product/ImageGallery";
import { addToCart } from "../../api/cartApi";
import toast from "react-hot-toast";

/* IMAGE HELPER */
const getImageUrl = (url) => {
  if (!url) return "";
  return url;
};

const PillowsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  const [customSize, setCustomSize] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [generalMessage, setGeneralMessage] = useState("");

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

  /* FETCH RELATED PILLOWS */
  useEffect(() => {
    if (!product?._id) return;

    api.get("/products/category/Pillows").then((res) => {
      const others = (res.data.products || []).filter(
        (p) => p._id !== product._id
      );
      setRelated(others.slice(0, 4));
    });
  }, [product]);

  /* ADD TO CART */
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

  /* BUY NOW */
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

  /* SUBMIT CUSTOM SIZE */
  const handleCustomSubmit = async () => {
    if (!user?._id) {
      toast.error("Please login first!");
      return;
    }

    if (!customSize.trim()) {
      toast.error("Please enter required pillow size");
      return;
    }

    try {
      const customDimensions = {
        dimensions: customSize,
        note: customNote || "Custom pillow size request",
      };

      const response = await addToCart(
        user._id,
        product._id,
        quantity,
        true,
        customDimensions
      );

      if (response.success) {
        toast.success("Custom size request added to cart for review!");
        setShowCustomModal(false);
        setCustomSize("");
        setCustomNote("");
        navigate("/user/cart");
      }
    } catch {
      toast.error("Server error");
    }
  };

  /* SUBMIT GENERAL INQUIRY */
  const handleInquirySubmit = async () => {
    if (!user?._id) {
      toast.error("Please login first!");
      return;
    }
    if (!generalMessage.trim()) {
      toast.error("Please describe your inquiry");
      return;
    }

    try {
      await api.post("/inquiry/add", {
        product_id: product._id,
        type: "general",
        name: displayName,
        email: user?.email,
        contact: user?.phone || "N/A",
        message: generalMessage,
      });

      toast.success("Inquiry sent successfully!");
      setShowInquiryModal(false);
      setGeneralMessage("");
    } catch {
      toast.error("Server error");
    }
  };

  if (loading)
    return <p className="p-10 text-center">Loading pillow details...</p>;

  if (!product)
    return <p className="p-10 text-center">Pillow not found</p>;

  const dimensionImages = product.dimensionImages?.map(getImageUrl) || [];

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col pt-8">
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 sm:py-12 w-full space-y-12">

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">

          {/* IMAGES */}
          <div className="w-full">
            <ImageGallery images={product.images?.map(getImageUrl) || []} />
          </div>

          {/* INFO */}
          <div className="flex flex-col justify-center">

            <div className="mb-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex gap-3">
                  <span className="bg-[#f8f5ed] text-[#9b804e] border border-[#e6dbc8] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
                    Premium Quality
                  </span>

                  <span className="bg-white border border-gray-100 px-3 py-1.5 rounded-full text-[11px] text-gray-600 font-bold shadow-sm flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                    ></span>
                    {product.inStock ? "In Stock" : "Made to Order"}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    onClick={() => navigate("/user/dashboard")}
                    className="text-[11px] font-bold text-gray-400 hover:text-[#0a2328] uppercase tracking-wider cursor-pointer"
                  >
                    Home
                  </span>

                  <span
                    onClick={() => navigate(-1)}
                    className="text-[11px] font-bold text-gray-400 hover:text-[#0a2328] uppercase tracking-wider cursor-pointer"
                  >
                    Back
                  </span>
                </div>
              </div>

              <h1 className="text-4xl font-black text-gray-900 mb-5 tracking-tight">
                {product.name}
              </h1>

              <p className="text-gray-500 max-w-xl">
                {product.description}
              </p>
            </div>

            {/* PRICE & QTY */}
            <div className="pt-6 border-t border-gray-100 mt-2 flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Price
                </p>
                <span className="text-4xl font-black text-[#0a2328]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <p className="text-[11px] text-gray-400">Incl. all taxes</p>
              </div>

              {/* QTY */}
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-2 px-4 gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Qty
                </span>

                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 bg-white border border-gray-200 rounded-md flex items-center justify-center"
                >
                  <Minus size={14} />
                </button>

                <span className="w-6 text-center font-bold">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 bg-white border border-gray-200 rounded-md flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleOrderNow}
                className="w-full py-4 bg-[#0a2328] text-white rounded-xl font-bold text-[15px] hover:bg-[#133036] transition"
              >
                Buy Now
              </button>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-white text-[#0a2328] border-2 border-[#0a2328] rounded-xl font-bold text-[15px] hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} className="stroke-[2.5]" />
                Add to Cart
              </button>

              <button
                onClick={() => setShowInquiryModal(true)}
                className="w-full py-4 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl font-bold text-[13px] hover:bg-indigo-100 transition"
              >
                Send Inquiry
              </button>
            </div>

            {/* TRUST ICONS */}
            <div className="grid grid-cols-3 gap-3 text-xs text-gray-500 pt-5 mt-4 border-t border-gray-100">
              <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Truck className="w-5 h-5 text-[#9b804e]" />
                Free Delivery
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-[#9b804e]" />
                Secure Payment
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <RefreshCw className="w-5 h-5 text-[#9b804e]" />
                Easy Returns
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* SPECS */}
          <div className="relative bg-white rounded-[2rem] border border-gray-100 p-10 h-max">
            <div className="absolute left-0 top-0 w-2.5 h-full bg-[#0a2328]" />

            <h2 className="text-2xl font-extrabold text-[#0a2328] mb-10">
              Detailed Specifications
            </h2>

            <div className="grid grid-cols-2 gap-y-10 gap-x-6">

              {product.extraFields?.pillowType && (
                <DetailRow label="Pillow Type" value={product.extraFields.pillowType} />
              )}

              {product.extraFields?.size && (
                <DetailRow label="Size" value={product.extraFields.size} />
              )}

              {product.extraFields?.weight && (
                <DetailRow label="Weight" value={product.extraFields.weight} />
              )}

              {product.extraFields?.fabricMaterial && (
                <DetailRow label="Fabric Material" value={product.extraFields.fabricMaterial} />
              )}

              {product.extraFields?.fillingMaterial && (
                <DetailRow label="Filling Material" value={product.extraFields.fillingMaterial} />
              )}

              {product.extraFields?.dimensions && (
                <DetailRow label="Dimensions (L × W × H)" value={product.extraFields.dimensions} />
              )}
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

        </section>

        {/* RELATED PRODUCTS */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#142C2C]">You May Also Like</h2>
          </div>

          {related.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-400">
              No related pillows found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => {
                const img = item.images?.[0];

                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/product/pillows/${item._id}`)}
                    className="group bg-white rounded-[1.5rem] p-4 border border-gray-100 hover:border-[#9B804E]/40 shadow-sm"
                  >
                    <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden p-4 mb-4 flex items-center justify-center">
                      <img
                        src={getImageUrl(img)}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition"
                      />
                    </div>

                    <h4 className="font-semibold text-[#142C2C] text-[15px] mb-2 line-clamp-2 group-hover:text-[#9B804E]">
                      {item.name}
                    </h4>

                    <p className="font-bold text-[#142C2C] text-lg">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CUSTOM SIZE MODAL */}
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl space-y-5">
              <h3 className="text-2xl font-bold text-[#142C2C]">Request Custom Size</h3>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-[#142C2C]">
                    Dimensions (L × W × H) <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="e.g. 24 × 16 × 6 inches"
                    className="border border-gray-300 p-3 rounded-xl"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-[#142C2C]">
                    Additional Note
                  </label>
                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Any specific instructions..."
                    className="border border-gray-300 p-3 rounded-xl min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-6 py-2 border rounded-xl text-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCustomSubmit}
                  className="px-6 py-2 bg-[#142C2C] text-white rounded-xl"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INQUIRY MODAL */}
        {showInquiryModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl space-y-5">
              <h3 className="text-2xl font-bold text-[#142C2C]">General Inquiry</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">Name</label>
                  <input
                    value={displayName}
                    disabled
                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">Email</label>
                  <input
                    value={user?.email || ""}
                    disabled
                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">Phone</label>
                  <input
                    value={user?.phone || ""}
                    disabled
                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#142C2C] mb-1 block">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={generalMessage}
                    onChange={(e) => setGeneralMessage(e.target.value)}
                    placeholder="Write your message..."
                    required
                    className="w-full border border-gray-300 p-3 rounded-xl min-h-[120px] resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="px-6 py-2 border rounded-xl text-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={handleInquirySubmit}
                  className="px-6 py-2 bg-[#142C2C] text-white rounded-xl"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-[#9b804e]"></div>
      <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#9b804e]">
        {label}
      </span>
    </div>
    <span className="font-bold text-[15px] text-[#0a2328]">{value}</span>
  </div>
);

export default PillowsDetails;