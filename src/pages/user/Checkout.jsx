import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { MapPin, Receipt, CreditCard, CheckCircle2, ChevronRight, ArrowLeft, Package, Truck, Banknote, Building, Smartphone } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

const Checkout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [openStep, setOpenStep] = useState(1);

  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address1: "",
    landmark: "",
    city: "",
    state: "",
    zip: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("");

  // ===== EMAIL VERIFICATION STATES =====
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    message: "",
  });

  /* ================= AUTO FILL NAME ================= */
  useEffect(() => {
    if (user?.fullname) {
      const parts = user.fullname.trim().split(" ");
      setShipping((prev) => ({
        ...prev,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
      }));
    }
  }, []);

  /* ================= FETCH CART ================= */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get(`/cart/${user._id}`);
        if (res.data.success) setCart(res.data.cart);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  /* ================= FETCH EMAIL VERIFIED STATUS ================= */
  useEffect(() => {
    api.get("/users/me").then((res) => {
      if (res.data.success) {
        setIsEmailVerified(res.data.user.isEmailVerified);
      }
    });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#142C2C] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!cart || cart.items.length === 0)
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 max-w-[1200px] mx-auto w-full animate-in fade-in py-12">
          <div className="bg-white rounded-[2rem] p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-100 max-w-xl mx-auto">
            <Package size={48} className="mx-auto mb-6 text-gray-300" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold text-[#142C2C] mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">You need items in your cart to checkout.</p>
            <Link
              to="/latest-products"
              className="inline-flex items-center gap-2 bg-[#142C2C] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#9B804E] transition-all duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );

  /* ================= CART DATA ================= */
  const items = cart.items.map((item) => ({
    id: item.productId._id,
    name: item.productId.name,
    price: item.productId.price,
    qty: item.quantity,
    image: item.productId.images?.[0] || item.productId.image_url,
    isCustomSize: item.isCustomSize,
    customDimensions: item.customDimensions,
  }));

  const hasCustomSize = items.some(item => item.isCustomSize);

  const subtotal = items
    .reduce((sum, item) => sum + (item.isCustomSize ? 0 : item.price * item.qty), 0)
    .toFixed(2);

  const platformFee = 7;
  const codFee = openStep === 3 && paymentMethod === "cod" ? 100 : 0;

  const total = (
    parseFloat(subtotal) +
    platformFee +
    codFee
  ).toFixed(2);

  const displayTotal = hasCustomSize ? "To Be Decided" : `₹${total}`;

  /* ================= STEP 1 VALIDATION ================= */
  const handleShippingSubmit = () => {
    const phoneRegex = /^[6-9]\d{9}$/;

    if (
      !shipping.firstName ||
      !shipping.lastName ||
      !shipping.phone ||
      !shipping.address1 ||
      !shipping.city ||
      !shipping.state ||
      !shipping.zip
    ) {
      return setPopup({
        show: true,
        message: "Please fill all required fields.",
      });
    }

    if (!phoneRegex.test(shipping.phone)) {
      return setPopup({
        show: true,
        message: "Enter a valid 10-digit mobile number.",
      });
    }

    // Adjusted for 6 digit indian pincodes by default
    if (!/^\d{6}$/.test(shipping.zip)) {
      return setPopup({
        show: true,
        message: "Enter a valid 6-digit pincode.",
      });
    }

    setOpenStep(2);
  };

  /* ================= SEND OTP ================= */
  const handleSendOTP = async () => {
    try {
      await api.post("/users/verify-email/send");
      setOtpSent(true);
      setPopup({ show: true, message: "OTP sent to your email!" });
    } catch {
      setPopup({ show: true, message: "Error sending OTP" });
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOTP = async () => {
    try {
      const res = await api.post("/users/verify-email/confirm", { otp });
      if (res.data.success) {
        setIsEmailVerified(true);
        setOtpSent(false);
        setPopup({ show: true, message: "Email Verified Successfully!" });
      }
    } catch {
      setPopup({ show: true, message: "Invalid OTP" });
    }
  };

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    if (!paymentMethod)
      return setPopup({ show: true, message: "Select a payment method" });

    if (paymentMethod !== "quote_request" && !isEmailVerified) {
      return setPopup({ show: true, message: "Verify email to place order." });
    }

    // QUOTE REQUEST → existing flow
    if (paymentMethod === "quote_request") {
      return submitQuoteRequest();
    }

    // COD → existing flow
    if (paymentMethod === "cod") {
      return placeCODOrder();
    }

    return handleOnlinePayment();
  };

  /* ================= SUBMIT QUOTE REQUEST ================= */
  const submitQuoteRequest = async () => {
    setPlacingOrder(true);
    try {
      const res = await api.post("/orders/create-quote", {
        userId: user._id,
        items,
        fullName: `${shipping.firstName} ${shipping.lastName}`,
        phone: shipping.phone,
        address: `${shipping.address1}, ${shipping.city}, ${shipping.state} - ${shipping.zip}`,
        paymentMethod: "quote_request",
        subtotal: parseFloat(subtotal),
        platformFee,
        grandTotal: "To Be Decided",
      });

      if (res.data.success) navigate("/user/order-success");
    } catch (e) {
      console.error(e);
      setPopup({ show: true, message: "Failed to submit quote request" });
    }
    setPlacingOrder(false);
  };

  /* ================= PLACE COD ORDER ================= */
  const placeCODOrder = async () => {
    setPlacingOrder(true);
    try {
      const res = await api.post("/orders/create-cod", {
        userId: user._id,
        items,
        fullName: `${shipping.firstName} ${shipping.lastName}`,
        phone: shipping.phone,
        address: `${shipping.address1}, ${shipping.city}, ${shipping.state} - ${shipping.zip}`,
        paymentMethod: "cod",
        subtotal: parseFloat(subtotal),
        platformFee,
        grandTotal: parseFloat(total),
      });

      if (res.data.success) navigate("/user/order-success");
    } catch (err) {
      console.error(err);
      setPopup({ show: true, message: "COD order failed" });
    }
    setPlacingOrder(false);
  };

  /* ================= RAZORPAY ONLINE PAYMENT ================= */
  const handleOnlinePayment = async () => {
    try {
      // 1️⃣ Create Razorpay order
      const res = await api.post("/payment/create-order", {
        amount: parseFloat(total),
      });

      // FIXED 🔥
      const { id, amount } = res.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        order_id: id,
        name: "Sandhya Furnishing",
        handler: async (response) => {
          const verifyRes = await api.post("/payment/verify-payment", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderData: {
              userId: user._id,
              items,
              fullName: `${shipping.firstName} ${shipping.lastName}`,
              phone: shipping.phone,
              address: `${shipping.address1}, ${shipping.city}, ${shipping.state} - ${shipping.zip}`,
              paymentMethod: "online",
              subtotal: parseFloat(subtotal),
              platformFee,
              grandTotal: parseFloat(total),
            },
          });

          if (verifyRes.data.success) navigate("/user/order-success");
        },
      };
      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err) {
      console.error(err);
      setPopup({ show: true, message: "Payment Failed" });
    }
  };


  const steps = [
    { num: 1, label: "Shipping", icon: MapPin },
    { num: 2, label: "Summary", icon: Receipt },
    { num: 3, label: "Payment", icon: CreditCard },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-[1000px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 relative">

        {/* POPUP NOTIFICATION */}
        {popup.show && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#142C2C] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            {popup.message.includes("🎉") ? <CheckCircle2 size={20} className="text-green-400" /> : <span className="w-2 h-2 bg-red-400 rounded-full"></span>}
            <span className="font-medium text-sm">{popup.message}</span>
            <button onClick={() => setPopup({ show: false, message: "" })} className="ml-2 text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#142C2C] tracking-tight mb-2">Checkout</h1>
          <p className="text-gray-500">Complete your order securely</p>
        </div>

        {/* ================= STEP PROGRESS ================= */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 rounded-full hidden sm:block"></div>

          <div
            className="absolute top-1/2 left-0 h-1 bg-[#142C2C] -translate-y-1/2 rounded-full transition-all duration-500 hidden sm:block"
            style={{ width: openStep === 1 ? "15%" : openStep === 2 ? "50%" : "85%" }}
          ></div>

          <div className="relative z-10 flex justify-between sm:justify-around max-w-2xl mx-auto px-4 sm:px-0">
            {steps.map(({ num, label, icon: Icon }) => {
              const isActive = openStep === num;
              const isCompleted = openStep > num;

              return (
                <div key={num} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-sm
                    ${isActive
                        ? "bg-[#142C2C] text-white shadow-lg shadow-[#142C2C]/20 scale-110"
                        : isCompleted
                          ? "bg-[#9B804E] text-white"
                          : "bg-white text-gray-400 border border-gray-200"
                      }`}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                  </div>
                  <span className={`mt-3 text-xs sm:text-sm font-bold uppercase tracking-widest ${isActive ? 'text-[#142C2C]' : isCompleted ? 'text-[#9B804E]' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">

          {/* ================= STEP 1: ADDRESS ================= */}
          {openStep === 1 && (
            <div className="p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <MapPin className="text-[#9B804E]" size={24} />
                <h2 className="text-xl sm:text-2xl font-bold text-[#142C2C]">Shipping Address</h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">First Name *</label>
                    <input
                      placeholder="John"
                      className="w-full bg-gray-50 border border-gray-200 text-[#142C2C] rounded-xl px-4 py-3.5 outline-none focus:border-[#9B804E] focus:bg-white transition-all"
                      value={shipping.firstName}
                      onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Last Name *</label>
                    <input
                      placeholder="Doe"
                      className="w-full bg-gray-50 border border-gray-200 text-[#142C2C] rounded-xl px-4 py-3.5 outline-none focus:border-[#9B804E] focus:bg-white transition-all"
                      value={shipping.lastName}
                      onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number *</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      className="w-full bg-gray-50 border border-gray-200 text-[#142C2C] rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#9B804E] focus:bg-white transition-all"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Address Line 1 *</label>
                  <input
                    placeholder="Flat No, Building Name, Street Area"
                    className="w-full bg-gray-50 border border-gray-200 text-[#142C2C] rounded-xl px-4 py-3.5 outline-none focus:border-[#9B804E] focus:bg-white transition-all"
                    value={shipping.address1}
                    onChange={(e) => setShipping({ ...shipping, address1: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Landmark (Optional)</label>
                  <input
                    placeholder="Near Metro Station"
                    className="w-full bg-gray-50 border border-gray-200 text-[#142C2C] rounded-xl px-4 py-3.5 outline-none focus:border-[#9B804E] focus:bg-white transition-all"
                    value={shipping.landmark}
                    onChange={(e) => setShipping({ ...shipping, landmark: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">City *</label>
                    <input
                      placeholder="Mumbai"
                      className="w-full bg-gray-50 border border-gray-200 text-[#142C2C] rounded-xl px-4 py-3.5 outline-none focus:border-[#9B804E] focus:bg-white transition-all"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">State *</label>
                    <input
                      placeholder="Maharashtra"
                      className="w-full bg-gray-50 border border-gray-200 text-[#142C2C] rounded-xl px-4 py-3.5 outline-none focus:border-[#9B804E] focus:bg-white transition-all"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Pincode *</label>
                    <input
                      placeholder="400001"
                      maxLength={6}
                      className="w-full bg-gray-50 border border-gray-200 text-[#142C2C] rounded-xl px-4 py-3.5 outline-none focus:border-[#9B804E] focus:bg-white transition-all"
                      value={shipping.zip}
                      onChange={(e) => setShipping({ ...shipping, zip: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleShippingSubmit}
                    className="bg-[#142C2C] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#9B804E] transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-[#142C2C]/10 w-full sm:w-auto justify-center"
                  >
                    Continue to Summary <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: SUMMARY ================= */}
          {openStep === 2 && (
            <div className="p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <Receipt className="text-[#9B804E]" size={24} />
                <h2 className="text-xl sm:text-2xl font-bold text-[#142C2C]">Order Review</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* ITEMS LIST */}
                <div className="lg:col-span-3 space-y-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Items ({items.length})</h3>
                  <div className="space-y-4">
                    {items.map((item, idx) => {
                      const imageUrl = getImageUrl(item.image);

                      return (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50/50">
                          <div className="w-20 h-20 bg-white rounded-xl p-2 flex-shrink-0 border border-gray-100">
                            <img src={imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-bold text-[#142C2C] line-clamp-1">{item.name}</h4>
                            <div className="text-sm text-gray-500 mt-0.5">
                              Qty: {item.qty}
                              {item.isCustomSize ? (
                                <div className="mt-1 space-y-0.5 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                  <span className="font-semibold block text-amber-800">Custom Size Request</span>
                                  <span>Dimensions: {item.customDimensions?.width} x {item.customDimensions?.height}</span>
                                  {item.customDimensions?.note && <span> • {item.customDimensions.note}</span>}
                                </div>
                              ) : (
                                <span> × ₹{item.price.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-center sm:text-right mt-2 sm:mt-0">
                            {item.isCustomSize ? (
                              <p className="font-bold tracking-tight text-[#9B804E] text-xs uppercase bg-[#9B804E]/10 px-2 py-1 rounded">Pending Quote</p>
                            ) : (
                              <p className="font-bold text-[#142C2C]">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm flex gap-3 border border-emerald-100">
                    <Truck className="flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <span className="font-bold block mb-0.5">Expected Delivery within 5-7 business days</span>
                      Ships to: {shipping.firstName} {shipping.lastName}, {shipping.city} - {shipping.zip}
                    </div>
                  </div>
                </div>

                {/* COST BREAKDOWN */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 sticky top-24">
                    <h3 className="text-lg font-bold text-[#142C2C] mb-6 border-b border-gray-200 pb-4">Bill Details</h3>

                    <div className="space-y-4 text-sm text-gray-600 mb-6">
                      <div className="flex justify-between items-center">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-800">₹{parseFloat(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Platform Fee</span>
                        <span className="font-medium text-gray-800">₹{platformFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Delivery Fee</span>
                        <span className="font-semibold text-green-600">FREE</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 border-dashed flex justify-between items-end mb-8">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">To Pay</span>
                      </div>
                      <span className="text-2xl font-bold text-[#142C2C]">
                        {displayTotal}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setOpenStep(3)}
                        className="w-full bg-[#142C2C] text-white py-3.5 rounded-xl font-bold hover:bg-[#9B804E] transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-[#142C2C]/10"
                      >
                        Proceed to Payment <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={() => setOpenStep(1)}
                        className="w-full bg-white border border-gray-200 text-gray-600 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:text-[#142C2C] transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={16} /> Update Address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PAYMENT ================= */}
          {openStep === 3 && (
            <div className="p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">

                {/* EMAIL VERIFICATION BOX */}
                {!isEmailVerified && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-8">
                    <h3 className="font-bold text-amber-800 mb-2">Email Verification Required</h3>

                    {!otpSent ? (
                      <button
                        onClick={handleSendOTP}
                        className="bg-[#142C2C] text-white px-4 py-2 rounded-lg"
                      >
                        Send OTP to Email
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={otp}
                          maxLength={6}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter OTP"
                          className="border px-3 py-2 rounded-lg w-32"
                        />
                        <button
                          onClick={handleVerifyOTP}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                          Verify
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-amber-700 mt-2">
                      Online payments will unlock after verification.
                    </p>
                  </div>
                )}

                <CreditCard className="text-[#9B804E]" size={24} />
                <h2 className="text-xl sm:text-2xl font-bold text-[#142C2C]">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                {/* PAYMENT OPTIONS */}
                <div className="lg:col-span-3 space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2">Select Option</h3>

                  {hasCustomSize ? (
                    <label
                      key="quote_request"
                      className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'quote_request'
                        ? 'border-[#9B804E] bg-[#9B804E]/5 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                    >
                      <div className="mt-1 relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="payment"
                          value="quote_request"
                          checked={paymentMethod === "quote_request"}
                          onChange={() => setPaymentMethod("quote_request")}
                          className="peer sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${paymentMethod === 'quote_request' ? 'border-[#9B804E] border-4' : 'border-gray-300'
                          }`}></div>
                      </div>

                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'quote_request' ? 'bg-[#9B804E] text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                          <Receipt size={20} />
                        </div>
                        <div>
                          <span className={`block font-bold transition-colors ${paymentMethod === 'quote_request' ? 'text-[#142C2C]' : 'text-gray-700'}`}>
                            Request Quote
                          </span>
                          <span className="block text-xs text-amber-600 mt-1">
                            Submit your order to our team. We'll examine your custom dimensions and provide a final price.
                          </span>
                        </div>
                      </div>
                    </label>
                  ) : (
                    [
                      { id: 'upi', title: 'UPI (GPay, PhonePe, Paytm)', icon: Smartphone, desc: 'Pay instantly via UPI apps' },
                      { id: 'card', title: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                      { id: 'netbanking', title: 'Net Banking', icon: Building, desc: 'All major banks supported' },
                      { id: 'cod', title: 'Cash on Delivery', icon: Banknote, desc: 'Pay when your order arrives (+₹100 fee)' },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${!isEmailVerified ? 'opacity-50 cursor-not-allowed bg-gray-50' : paymentMethod === opt.id
                          ? 'border-[#9B804E] bg-[#9B804E]/5 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                          }`}
                        onClick={(e) => {
                          if (!isEmailVerified) e.preventDefault();
                        }}
                      >
                        <div className="mt-1 relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="payment"
                            value={opt.id}
                            disabled={!isEmailVerified}
                            checked={paymentMethod === opt.id}
                            onChange={() => setPaymentMethod(opt.id)}
                            className="peer sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all ${paymentMethod === opt.id ? 'border-[#9B804E] border-4' : 'border-gray-300'
                            }`}></div>
                        </div>

                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${paymentMethod === opt.id ? 'bg-[#9B804E] text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                            <opt.icon size={20} />
                          </div>
                          <div>
                            <span className={`block font-bold transition-colors ${paymentMethod === opt.id ? 'text-[#142C2C]' : 'text-gray-700'}`}>
                              {opt.title}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">{opt.desc}</span>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {/* FINAL REVIEW & PAY */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 sticky top-24">
                    <h3 className="text-lg font-bold text-[#142C2C] mb-6 border-b border-gray-200 pb-4">Final Review</h3>

                    <div className="space-y-4 text-sm text-gray-600 mb-6">
                      <div className="flex justify-between items-center">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-800">₹{parseFloat(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Platform Fee</span>
                        <span className="font-medium text-gray-800">₹{platformFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>

                      {paymentMethod === "cod" && (
                        <div className="flex justify-between items-center text-orange-600 bg-orange-50 p-2 -mx-2 rounded-lg">
                          <span className="flex items-center gap-1.5"><Banknote size={14} /> COD Fee</span>
                          <span className="font-bold">+ ₹100.00</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200 border-dashed flex justify-between items-end mb-8">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Total to Pay</span>
                      </div>
                      <span className="text-3xl font-bold text-[#142C2C]">
                        {displayTotal}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                        className="w-full bg-gradient-to-r from-[#142C2C] relative to-[#1f5c5c] text-white py-4 rounded-xl font-bold text-sm sm:text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
                      >
                        <span className={`absolute inset-0 bg-[#9B804E] translate-y-full transition-transform duration-300 group-hover:translate-y-0 ${placingOrder ? '!translate-y-full' : ''}`}></span>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {placingOrder ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                          ) : (
                            <>{hasCustomSize ? "Submit Quote Request" : "Place Order Securely"} <CheckCircle2 size={20} /></>
                          )}
                        </span>
                      </button>

                      <button
                        onClick={() => setOpenStep(2)}
                        disabled={placingOrder}
                        className="w-full bg-transparent text-gray-500 py-3 rounded-xl font-semibold hover:text-[#142C2C] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <ArrowLeft size={16} /> Back to Summary
                      </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4 px-4 leading-relaxed">
                      By placing your order, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Checkout;
