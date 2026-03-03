import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ChevronRight } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const Cart = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    if (!user?._id) {
      navigate("/login");
      return;
    }

    try {
      const res = await api.get(`/cart/${user._id}`);
      if (res.data.success) {
        setCart(res.data.cart);

        const totalItems = res.data.cart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        localStorage.setItem("cartCount", totalItems);
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= UPDATE QTY ================= */
  const updateQuantity = async (productId, newQty, oldQty, isCustomSize, customDimensions) => {
    if (newQty < 1) return;

    try {
      await api.post("/cart/add", {
        userId: user._id,
        productId,
        quantity: newQty - oldQty,
        isCustomSize,
        customDimensions,
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (productId, isCustomSize, customDimensions) => {
    try {
      await api.post("/cart/remove", {
        userId: user._id,
        productId,
        isCustomSize,
        customDimensions,
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#142C2C] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  /* ================= EMPTY CART ================= */
  if (!cart || cart.items.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 max-w-[1200px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 py-12">
          <div className="bg-white rounded-[2rem] p-12 sm:p-20 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-100 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-400">
              <ShoppingCart size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#142C2C] mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
              Looks like you haven't added anything to your cart yet. Explore our premium collection and find something you love.
            </p>
            <Link
              to="/latest-products"
              className="inline-flex items-center gap-2 bg-[#142C2C] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#9B804E] transition-all duration-300 shadow-xl shadow-[#142C2C]/20"
            >
              Continue Shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ================= FORMAT ITEMS ================= */
  const items = cart.items.map((item) => ({
    id: item.productId._id,
    name: item.productId.name,
    price: item.productId.price,
    qty: item.quantity,
    image: item.productId.images?.[0] || item.productId.image_url,
    isCustomSize: item.isCustomSize,
    customDimensions: item.customDimensions,
  }));

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.isCustomSize ? 0 : item.price * item.qty),
    0
  );

  const platformFee = 7;
  const grandTotal = totalAmount + platformFee;

  /* ================= MAIN ================= */
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-[1200px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

        {/* PAGE TITLE */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-[#142C2C]">
            <ShoppingCart size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#142C2C] tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ================= CART ITEMS ================= */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const imageUrl = item.image?.startsWith("http")
                    ? item.image
                    : `${BACKEND_URL}${item.image}`;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-center gap-6 py-6 first:pt-0 last:pb-0 group"
                    >
                      {/* ITEM IMAGE */}
                      <Link to={`/product/sofa/${item.id}`} className="w-full sm:w-32 h-32 bg-gray-50 rounded-2xl flex-shrink-0 p-3 border border-gray-100 overflow-hidden relative block">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = "/no-image.png";
                            e.target.onerror = null;
                          }}
                        />
                      </Link>

                      {/* ITEM DETAILS */}
                      <div className="flex-1 text-center sm:text-left w-full">
                        <Link to={`/product/sofa/${item.id}`} className="inline-block hover:text-[#9B804E] transition-colors">
                          <h3 className="text-lg font-bold text-[#142C2C] mb-1 line-clamp-1">
                            {item.name}
                          </h3>
                        </Link>

                        {item.isCustomSize ? (
                          <div className="mb-4 mt-1 space-y-0.5 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 inline-block text-left">
                            <span className="font-semibold block text-amber-800">Custom Size Request</span>
                            <span>Dimensions: {item.customDimensions?.width} x {item.customDimensions?.height}</span>
                            {item.customDimensions?.note && <span className="block mt-0.5 max-w-[200px] truncate">Note: {item.customDimensions.note}</span>}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm mb-4">
                            <span className="font-semibold text-gray-800 tracking-wide">₹{item.price.toLocaleString('en-IN')}</span> each
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">

                          {/* QTY CONTROLS */}
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.qty - 1, item.qty, item.isCustomSize, item.customDimensions)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#142C2C] hover:bg-white rounded-md transition-all disabled:opacity-50"
                              disabled={item.qty <= 1}
                            >
                              <Minus size={16} strokeWidth={2.5} />
                            </button>
                            <span className="w-10 text-center font-bold text-[#142C2C] text-sm">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.qty + 1, item.qty, item.isCustomSize, item.customDimensions)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#142C2C] hover:bg-white rounded-md transition-all"
                            >
                              <Plus size={16} strokeWidth={2.5} />
                            </button>
                          </div>

                          {/* REMOVE ITEM */}
                          <button
                            onClick={() => removeItem(item.id, item.isCustomSize, item.customDimensions)}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={16} /> <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* ITEM TOTAL */}
                      <div className="text-center sm:text-right w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0 border-dashed">
                        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">Total</p>
                        {item.isCustomSize ? (
                          <p className="font-bold tracking-tight text-[#9B804E] text-sm uppercase bg-[#9B804E]/10 px-3 py-1.5 rounded-lg inline-flex items-center">
                            Pending Quote
                          </p>
                        ) : (
                          <p className="text-xl font-bold text-[#142C2C]">
                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM BAR OF CART LIST */}
              <div className="bg-gray-50/80 p-6 border-t border-gray-100 flex items-start sm:items-center gap-3 text-sm text-gray-500">
                <ShieldCheck size={20} className="text-green-500 flex-shrink-0" />
                <p>Safe and secure checkout. Easy returns within 7 days of delivery.</p>
              </div>
            </div>
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8 sticky top-24">

              <h2 className="text-lg font-bold text-[#142C2C] mb-6 flex items-center gap-2">
                Order Summary
              </h2>

              <div className="space-y-4 text-[15px] text-gray-600 mb-6">
                <div className="flex justify-between items-center">
                  <span>Total Items ({items.length})</span>
                  <span className="font-medium text-gray-800">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Platform Fee</span>
                  <span className="font-medium text-gray-800">
                    ₹{platformFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Delivery Fees</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200 border-dashed flex justify-between items-end mb-8">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Grand Total</span>
                  <span className="text-xs text-gray-500 block">Includes all taxes</span>
                </div>
                <span className="text-3xl font-bold text-[#142C2C]">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={() => navigate("/user/checkout")}
                className="w-full bg-[#142C2C] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#9B804E] transition-all duration-300 shadow-xl shadow-[#142C2C]/20 flex items-center justify-center gap-2 group"
              >
                Checkout Securely
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Tag size={12} /> Use promo codes on the next step
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Cart;
