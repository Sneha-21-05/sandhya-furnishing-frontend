import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
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
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/uploads"))
    return `https://sandhya-furnishing-backend.onrender.com${imageUrl}`;

  return `https://sandhya-furnishing-backend.onrender.com/uploads/${imageUrl}`;
};

const CarpetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  /* INQUIRY MODAL */
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");

  /* USER */
  const user = JSON.parse(localStorage.getItem("user"));
  const displayName =
    user?.fullName ||
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

  /* FETCH RELATED PRODUCTS */
  useEffect(() => {
    if (!product?._id) return;

    api.get("/products/category/Carpet").then((res) => {
      const others = res.data.products?.filter((p) => p._id !== product._id);
      setRelated(others.slice(0, 4));
    });
  }, [product]);

  /* ADD TO CART */
  const handleAddToCart = async () => {
    if (!user?._id) return navigate("/login");

    try {
      const response = await addToCart(user._id, product._id, quantity);
      if (response.success) navigate("/user/cart");
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* BUY NOW */
  const handleOrderNow = async () => {
    if (!user?._id) return navigate("/login");

    try {
      const response = await addToCart(user._id, product._id, quantity);
      if (response.success) navigate("/user/checkout");
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* INQUIRY SUBMIT */
  const submitInquiry = async () => {
    if (!user?._id) return toast.error("Login first!");
    if (!inquiryMessage.trim()) return toast.error("Message required!");

    try {
      await api.post("/inquiry/add", {
        product_id: product._id,
        type: "general",
        name: displayName,
        email: user?.email,
        contact: user?.phone || "N/A",
        message: inquiryMessage,
      });

      toast.success("Inquiry Sent!");
      setInquiryMessage("");
      setShowInquiryModal(false);
    } catch {
      toast.error("Server Error");
    }
  };

  if (loading)
    return <p className="text-center p-10">Loading Carpet...</p>;

  if (!product)
    return <p className="text-center p-10">Product Not Found</p>;

  const dimensionImg =
    product.dimensionImages?.length
      ? getImageUrl(product.dimensionImages[0])
      : null;

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col pt-8">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">

        {/* HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-8 rounded-3xl shadow border">

          {/* IMAGES */}
          <div>
            <ImageGallery images={product.images?.map(getImageUrl) || []} />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col justify-center">

            {/* HOME + BACK */}
            <div className="flex justify-between mb-6">
              <span
                onClick={() => navigate("/user/dashboard")}
                className="text-xs font-bold text-gray-400 hover:text-black cursor-pointer uppercase tracking-widest"
              >
                Home
              </span>

              <span
                onClick={() => navigate(-1)}
                className="text-xs font-bold text-gray-400 hover:text-black cursor-pointer uppercase tracking-widest"
              >
                Back
              </span>
            </div>

            <h1 className="text-4xl font-black mb-5">
              {product.name}
            </h1>

            <p className="text-gray-500 mb-6">{product.description}</p>

            {/* PRICE */}
            <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between items-center">
              <span className="text-4xl font-black text-[#0a2328]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              {/* QTY */}
              <div className="flex items-center bg-gray-50 border rounded-lg p-2 gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 bg-white border rounded-md flex items-center justify-center"
                >
                  <Minus size={14} />
                </button>

                <span className="font-bold">{quantity}</span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 bg-white border rounded-md flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="space-y-3">
              <button
                onClick={handleOrderNow}
                className="w-full py-4 bg-[#0a2328] text-white rounded-xl font-bold"
              >
                Buy Now
              </button>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-white border-2 border-[#0a2328] text-[#0a2328] rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>

              <button
                onClick={() => setShowInquiryModal(true)}
                className="w-full py-4 bg-indigo-50 border border-indigo-200 rounded-xl font-bold text-indigo-900"
              >
                Send Inquiry
              </button>
            </div>

            {/* BADGES */}
            <div className="grid grid-cols-3 gap-4 text-xs mt-6 border-t pt-4">
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
                <Truck className="w-5 h-5 text-[#9b804e]" />
                Free Delivery
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-[#9b804e]" />
                Secure Payment
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
                <RefreshCw className="w-5 h-5 text-[#9b804e]" />
                Easy Returns
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* SPECS */}
          <div className="bg-white rounded-3xl p-10 border relative">
            <div className="absolute left-0 top-0 h-full w-2.5 bg-[#0a2328]" />

            <h2 className="text-2xl font-extrabold text-[#0a2328] mb-10">
              Detailed Specifications
            </h2>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10">

              {product.extraFields?.carpetType && (
                <DetailRow label="Carpet Type" value={product.extraFields.carpetType} />
              )}

              {product.extraFields?.size && (
                <DetailRow label="Size" value={product.extraFields.size} />
              )}

              {product.extraFields?.weight && (
                <DetailRow label="Weight" value={product.extraFields.weight} />
              )}

              {product.extraFields?.material && (
                <DetailRow label="Material" value={product.extraFields.material} />
              )}

              {product.extraFields?.washType && (
                <DetailRow label="Wash Type" value={product.extraFields.washType} />
              )}

              {product.extraFields?.colorOptions && (
                <DetailRow label="Color Options" value={product.extraFields.colorOptions} />
              )}
            </div>
          </div>

          {/* DIMENSION IMAGE */}
          {dimensionImg ? (
            <div className="bg-[#142C2C] text-white rounded-3xl p-10 flex flex-col justify-center shadow-xl">
              <h2 className="text-2xl font-bold mb-8">Measurements</h2>

              <div className="bg-white/10 rounded-2xl p-6 flex justify-center">
                <img
                  src={dimensionImg}
                  alt="Dimension"
                  className="w-full max-h-[320px] object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-3xl flex items-center justify-center min-h-[350px]">
              <RefreshCw size={40} className="text-gray-300" />
            </div>
          )}
        </section>

        {/* RELATED */}
        <section>
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>

          {related.length === 0 ? (
            <div className="p-8 text-center bg-white border rounded-xl text-gray-400">
              No related carpets found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/product/carpet/${item._id}`)}
                  className="bg-white border rounded-2xl p-4 shadow hover:border-[#9B804E]/40 cursor-pointer"
                >
                  <div className="aspect-[4/5] bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h4 className="font-semibold mb-2">{item.name}</h4>

                  <p className="font-bold">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* INQUIRY MODAL */}
        {showInquiryModal && (
          <ModalWrapper onClose={() => setShowInquiryModal(false)}>
            <h3 className="text-2xl font-bold mb-4">General Inquiry</h3>

            <div className="space-y-4">
              <div>
                <label className="font-semibold text-sm">Name</label>
                <input
                  value={displayName}
                  disabled
                  className="w-full border p-3 rounded-xl bg-gray-50"
                />
              </div>

              <div>
                <label className="font-semibold text-sm">Email</label>
                <input
                  value={user?.email || ""}
                  disabled
                  className="w-full border p-3 rounded-xl bg-gray-50"
                />
              </div>

              <div>
                <label className="font-semibold text-sm">Phone</label>
                <input
                  value={user?.phone || ""}
                  disabled
                  className="w-full border p-3 rounded-xl bg-gray-50"
                />
              </div>

              <div>
                <label className="font-semibold text-sm">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full border p-3 rounded-xl min-h-[120px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <ButtonLight onClick={() => setShowInquiryModal(false)}>
                Cancel
              </ButtonLight>
              <ButtonDark onClick={submitInquiry}>Send</ButtonDark>
            </div>
          </ModalWrapper>
        )}

      </main>
    </div>
  );
};

/* REUSABLE COMPONENTS */
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold uppercase text-[#9b804e] tracking-wider mb-1">
      {label}
    </span>
    <span className="font-bold text-[15px] text-[#0a2328]">{value}</span>
  </div>
);

const ModalWrapper = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
    <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
      <button
        onClick={onClose}
        className="absolute right-4 top-3 text-gray-400 hover:text-black text-xl"
      >
        ×
      </button>
      {children}
    </div>
  </div>
);

const ButtonDark = ({ children, ...props }) => (
  <button
    {...props}
    className="px-6 py-2 bg-[#0a2328] text-white rounded-xl font-semibold"
  >
    {children}
  </button>
);

const ButtonLight = ({ children, ...props }) => (
  <button {...props} className="px-6 py-2 border rounded-xl text-gray-600">
    {children}
  </button>
);

export default CarpetDetails;