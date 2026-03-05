import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { ArrowLeft, MapPin, Phone, CreditCard, Clock, Package, CheckCircle, Truck, FileText } from "lucide-react";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("upi");

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/details/${orderId}`);
      if (res.data.success) setOrder(res.data.order);
    } catch (err) {
      console.error("Error loading order details:", err);
    }
    setLoading(false);
  };

  /* ================= PAY QUOTE ================= */
  const handlePayQuote = async () => {
    if (!selectedPayment) return toast.error("Please select a payment method.");

    try {
      setPaying(true);
      const res = await api.post(`/orders/user/pay-quote/${orderId}`, {
        paymentMethod: selectedPayment
      });

      if (res.data.success) {
        toast.success("Payment successful! Order is now confirmed.");
        loadOrderDetails();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Payment attempt failed.");
    } finally {
      setPaying(false);
    }
  };

  /* ================= STATUS COLOR LOGIC ================= */
  const getStatusInfo = (status) => {
    if (!status) return { color: "bg-gray-100 text-gray-600 border-gray-200", icon: Clock };

    switch (status.toLowerCase()) {
      case "pending":
        return { color: "bg-orange-50 text-orange-600 border-orange-200", icon: Clock };
      case "confirmed":
      case "processing":
        return { color: "bg-blue-50 text-blue-600 border-blue-200", icon: Package };
      case "packed":
      case "shipped":
      case "in transit":
      case "out for delivery":
        return { color: "bg-indigo-50 text-indigo-600 border-indigo-200", icon: Truck };
      case "delivered":
        return { color: "bg-green-50 text-green-600 border-green-200", icon: CheckCircle };
      case "cancelled":
        return { color: "bg-red-50 text-red-600 border-red-200", icon: Clock }; // Replaced X with Clock
      case "pending payment":
        return { color: "bg-amber-50 text-amber-600 border-amber-200", icon: CreditCard };
      default:
        return { color: "bg-gray-100 text-gray-600 border-gray-200", icon: Clock };
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#142C2C] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );

  if (!order)
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
              <Package size={32} />
            </div>
            <h2 className="text-[#142C2C] font-semibold text-xl mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-8">
              We couldn't track this order. Please verify the link or check your order history.
            </p>
            <Link
              to="/user/orders"
              className="inline-flex items-center gap-2 bg-[#142C2C] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#9B804E] transition-all duration-300"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const expectedDate = new Date(order.createdAt);
  expectedDate.setDate(expectedDate.getDate() + 6);

  const statusFlow = [
    "Pending",
    "Confirmed",
    "Processing",
    "Packed",
    "Shipped",
    "In Transit",
    "Out for Delivery",
    "Delivered",
  ];

  const mergedTimeline = statusFlow.map((status) => {
    const match = order.trackingHistory.find((t) => t.status === status);
    return match || { status, date: null, message: "" };
  });

  const currentIndex = mergedTimeline.findLastIndex(
    (s) => s.date !== null
  );

  const currentStatusInfo = getStatusInfo(order.currentStatus);
  const StatusIcon = currentStatusInfo.icon;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-[1200px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <Link to="/user/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#9B804E] transition-colors mb-3 font-medium cursor-pointer">
              <ArrowLeft size={16} /> Back to all orders
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#142C2C] tracking-tight">
              Order Details
            </h1>
            <p className="text-gray-500 text-[15px] mt-1 flex items-center gap-2">
              ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{order._id}</span>
            </p>
          </div>

          <a
            href={`https://sandhya-furnishing-backend.onrender.com/api/orders/invoice/${order._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#142C2C] border border-gray-200 px-6 py-2.5 rounded-xl font-semibold hover:border-[#9B804E] hover:text-[#9B804E] transition-colors shadow-sm whitespace-nowrap"
          >
            <FileText size={18} /> Download Invoice
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ================= LEFT COLUMN - ITEMS & SUMMARY ================= */}
          <div className="lg:col-span-2 space-y-8">

            {/* ITEMS */}
            <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-[#142C2C] flex items-center gap-2">
                  <Package className="text-[#9B804E]" size={22} />
                  Order Items
                </h2>

                <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border inline-flex items-center gap-2 ${currentStatusInfo.color}`}>
                  <StatusIcon size={14} strokeWidth={3} />
                  {order.currentStatus}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => {
                    const imageUrl = item.image?.startsWith("http")
                      ? item.image
                      : `https://sandhya-furnishing-backend.onrender.com${item.image}`;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-center gap-6 py-6 first:pt-0 last:pb-0 group"
                      >
                        <div className="w-full sm:w-28 h-28 bg-gray-50 rounded-2xl flex-shrink-0 p-3 border border-gray-100 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-lg font-semibold text-[#142C2C] mb-1">
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 flex-wrap">
                            <span>Qty: <strong className="text-gray-700">{item.qty}</strong></span>

                            {item.isCustomSize ? (
                              <div className="w-full mt-2 text-left bg-amber-50 border border-amber-100 rounded-lg p-3">
                                <span className="font-semibold text-amber-800 text-xs tracking-wider uppercase mb-1 block">Custom Size Request</span>
                                <span className="text-amber-900/80 text-sm">Dimensions: {item.customDimensions?.width} x {item.customDimensions?.height}</span>
                                {item.customDimensions?.note && (
                                  <span className="block mt-1 text-amber-700/80 text-sm italic">Note: {item.customDimensions.note}</span>
                                )}
                              </div>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></span>
                                <span>₹{item.price.toLocaleString('en-IN')} each</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-center sm:text-right w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0">
                          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Total</p>
                          {item.isCustomSize && (order.currentStatus === "Pending Quote" || (order.currentStatus === "Pending" && order.paymentMethod === "quote_request")) ? (
                            <p className="text-sm font-bold text-[#9B804E] bg-[#9B804E]/10 px-3 py-1.5 rounded-lg inline-block">Pending Quote</p>
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
              </div>
            </div>

            {/* DETAILS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CUSTOMER INFO */}
              <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100">
                <h3 className="text-lg font-bold text-[#142C2C] mb-6 flex items-center gap-2">
                  <span className="w-6 h-px bg-gray-200"></span> Customer Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Name</p>
                    <p className="text-[15px] font-medium text-gray-800">{order.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                    <p className="text-[15px] font-medium text-gray-800 flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" /> {order.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shipping Address</p>
                    <p className="text-[15px] font-medium text-gray-800 flex items-start gap-2 leading-relaxed">
                      <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                      <span>{order.address}, {order.city}, {order.pincode}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* PAYMENT SUMMARY */}
              <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
                <h3 className="text-lg font-bold text-[#142C2C] mb-6 flex items-center gap-2">
                  <span className="w-6 h-px bg-gray-200"></span> Payment Summary
                </h3>

                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center text-[15px] text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">
                      {order.currentStatus === "Pending Quote" || (order.currentStatus === "Pending" && order.paymentMethod === "quote_request") ? "To Be Decided" : `₹${order.grandTotal.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[15px] text-gray-600">
                    <span>Shipping Fees</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>

                  <div className="pt-4 mt-6 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total</span>
                      <span className="text-2xl sm:text-3xl font-bold text-[#142C2C]">
                        {order.currentStatus === "Pending Quote" || (order.currentStatus === "Pending" && order.paymentMethod === "quote_request") ? "To Be Decided" : `₹${order.grandTotal.toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    {order.currentStatus === "Pending Payment" ? (
                      <div className="mt-8 bg-amber-50/50 border border-amber-100 p-5 rounded-2xl">
                        <h4 className="font-bold text-[#142C2C] mb-4 flex items-center gap-2">
                          <CreditCard size={18} className="text-[#9B804E]" />
                          Complete Payment
                        </h4>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          {["upi", "card", "netbanking"].map((method) => (
                            <button
                              key={method}
                              onClick={() => setSelectedPayment(method)}
                              className={`py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${selectedPayment === method
                                ? "bg-[#142C2C] text-white border-[#142C2C] shadow-md"
                                : "bg-white text-gray-500 hover:border-gray-300"
                                }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={handlePayQuote}
                          disabled={paying}
                          className="w-full bg-[#9B804E] text-white font-bold py-3.5 rounded-xl hover:bg-[#8A7143] transition-colors disabled:opacity-50"
                        >
                          {paying ? "Processing..." : `Pay ₹${order.grandTotal.toLocaleString('en-IN')}`}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm mt-3 text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                        <CreditCard size={16} className="text-gray-400" />
                        Paid via <strong className="text-gray-800 capitalize">{order.paymentMethod === 'quote_request' ? "Custom Quote" : order.paymentMethod}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>


          {/* ================= RIGHT COLUMN - TRACKING ================= */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100 p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-[#142C2C] mb-2 flex items-center gap-2">
                Tracking Timeline
              </h2>
              <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
                Estimated Delivery: <strong className="text-gray-800">{expectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</strong>
              </p>

              <div className="relative pl-6 pb-4">
                {/* THE TRACK LINE */}
                <div className="absolute left-1.5 top-3 bottom-0 w-px bg-gray-200"></div>

                <div className="space-y-8 relative">
                  {mergedTimeline.map((track, idx) => {
                    const isPast = idx <= currentIndex && track.date !== null;
                    const isCurrent = idx === currentIndex;
                    const isUpcoming = idx > currentIndex || track.date === null;

                    return (
                      <div key={idx} className={`relative flex gap-4 ${isUpcoming ? 'opacity-40' : 'opacity-100'}`}>
                        {/* STATUS PIN */}
                        <div className="relative z-10 flex-shrink-0 mt-1">
                          <div className={`w-3 h-3 rounded-full outline outline-4 outline-white ${isCurrent
                            ? "bg-[#9B804E] ring-4 ring-[#9B804E]/20"
                            : isPast
                              ? "bg-[#142C2C]"
                              : "bg-gray-300"
                            }`}></div>
                        </div>

                        {/* STATUS CONTENT */}
                        <div className="flex-1">
                          <p className={`font-bold text-[15px] mb-0.5 ${isCurrent ? "text-[#9B804E]" : isPast ? "text-[#142C2C]" : "text-gray-500"
                            }`}>
                            {track.status}
                          </p>

                          {track.date ? (
                            <div>
                              <p className="text-xs text-gray-400 font-medium">
                                {new Date(track.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {track.message && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                                  {track.message}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 font-medium">Pending</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetails;
