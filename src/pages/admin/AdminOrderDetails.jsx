import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import { ArrowLeft, Package, User, MapPin, Phone, Mail, CreditCard, Calendar, CheckCircle, Truck, Clock, XCircle, Info, ChevronRight, ShieldAlert } from "lucide-react";

const AdminOrderDetails = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [quotePrice, setQuotePrice] = useState("");

  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    loadOrder();
  }, []);

  // ================= LOAD ORDER =================
  const loadOrder = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.get(
        `/orders/details/${orderId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (res.data.success) {
        setOrder(res.data.order);
        setStatus(res.data.order.currentStatus);
      }
    } catch (err) {
      console.error(err);
    }
  };



  // ================= STRICT FLOW =================
  const getNextStatusOptions = (currentStatus) => {
    const flow = [
      "Pending",
      "Confirmed",
      "Processing",
      "Packed",
      "Out for Delivery",
      "Delivered",
    ];

    const currentIndex = flow.indexOf(currentStatus);

    if (
      currentStatus === "Delivered" ||
      currentStatus === "Cancelled"
    ) {
      return [];
    }

    const nextStatus = flow[currentIndex + 1];

    return nextStatus ? [nextStatus] : [];
  };

  // ================= UPDATE STATUS =================
  const updateStatus = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.patch(
        `/orders/admin/update-status/${orderId}`,
        {
          status,
          message: newMessage || `${status} updated.`,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (res.data.success) {
        toast.success("Order status updated!");
        setNewMessage("");
        loadOrder();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // ================= UPDATE QUOTE =================
  const handleUpdateQuote = async () => {
    if (!quotePrice || isNaN(quotePrice) || quotePrice <= 0) {
      return toast.error("Please enter a valid price");
    }

    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.patch(
        `/orders/admin/update-quote/${orderId}`,
        {
          customUnitPrice: Number(quotePrice),
          message: newMessage,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (res.data.success) {
        toast.success("Quote finalized!");
        setNewMessage("");
        loadOrder();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quote");
    }
  };


  // ================= CANCEL ORDER =================
  const handleAdminCancel = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.post(
        `/orders/admin/cancel/${order._id}`,
        { reason: cancelReason },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (res.data.success) {
        toast.success("Order cancelled successfully!");
        setCancelReason("");
        setShowCancelPopup(false);
        loadOrder();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order");
    }
  };


  // STATUS HELPER
  const getStatusInfo = (status) => {
    switch (status) {
      case "Pending": return { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };
      case "Pending Quote": return { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock };
      case "Pending Payment": return { color: "bg-orange-50 text-orange-700 border-orange-200", icon: CreditCard };
      case "Confirmed": return { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle };
      case "Processing": return { color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Package };
      case "Packed": return { color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package };
      case "Out for Delivery": return { color: "bg-sky-50 text-sky-700 border-sky-200", icon: Truck };
      case "Delivered": return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle };
      case "Cancelled": return { color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle };
      default: return { color: "bg-slate-50 text-slate-700 border-slate-200", icon: Info };
    }
  };

  if (!order) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const statusConfig = getStatusInfo(order.currentStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto font-sans animate-in fade-in duration-500 pb-16">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3 font-medium">
              <ArrowLeft size={16} /> Back to Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 tracking-tight">
                Order <span className="text-slate-400 font-medium">#{order._id.slice(-6).toUpperCase()}</span>
              </h1>
              <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${statusConfig.color}`}>
                <StatusIcon size={14} />
                {order.currentStatus}
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-2 font-medium flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" /> Placed on {orderDate}
            </p>
          </div>

          <div className="flex gap-3">
            {/* Delete/Cancel action moved up to hero bar */}
            {!["Delivered", "Cancelled"].includes(order.currentStatus) && (
              <button
                onClick={() => setShowCancelPopup(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all font-medium text-sm shadow-sm"
              >
                <XCircle size={16} />
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* LEFT SECTION - OVERVIEW & CUSTOMER */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* ITEMS LIST */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="p-6 border-b border-slate-100/80 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Package className="text-blue-500" size={20} /> Order Items
                </h2>
                <span className="text-slate-400 font-medium text-sm">{order.items.length} items</span>
              </div>
              <div className="p-6">
                <div className="divide-y divide-slate-100/80">
                  {order.items.map((item, idx) => {
                    const imgUrl = item.image?.startsWith("http")
                      ? item.image
                      : `https://sandhya-furnishing-backend.onrender.com${item.image}`;

                    return (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 py-5 border-b border-slate-100/80 last:border-0 first:pt-0 last:pb-0 group">
                        <div className="w-20 h-20 bg-slate-50 rounded-xl flex-shrink-0 p-2 border border-slate-100 overflow-hidden relative">
                          <img
                            src={imgUrl}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                            alt=""
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-base mb-1 truncate">{item.name}</p>
                          <p className="text-sm text-slate-500 font-medium">Qty: <span className="text-slate-700">{item.qty}</span></p>

                          {item.isCustomSize && (
                            <div className="mt-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100/60 rounded-xl p-3 shadow-sm inline-block w-full sm:w-auto">
                              <p className="text-purple-700 font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Info size={12} /> Custom Size Request
                              </p>
                              <p className="text-slate-700 text-[13px] font-medium">Dimensions: {item.customDimensions?.width} x {item.customDimensions?.height}</p>
                              {item.customDimensions?.note && (
                                <p className="text-slate-500 text-xs mt-1.5 italic border-t border-purple-100/50 pt-1.5">"{item.customDimensions.note}"</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-left sm:text-right mt-2 sm:mt-0 w-full sm:w-auto">
                          {item.isCustomSize ? (
                            order.currentStatus !== "Pending Quote" && !(order.currentStatus === "Pending" && order.paymentMethod === "quote_request") ? (
                              <div className="flex flex-col sm:items-end">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Quoted Price</span>
                                <p className="font-extrabold text-lg text-slate-800">
                                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">₹{item.price.toLocaleString('en-IN')} / unit</p>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm">
                                Awaiting Quote
                              </span>
                            )
                          ) : (
                            <div className="flex flex-col sm:items-end">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Total</span>
                              <p className="font-extrabold text-lg text-slate-800">
                                ₹{(item.price * item.qty).toLocaleString('en-IN')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CUSTOMER INFO CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col hover:border-blue-200 transition-colors">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User size={14} /> Customer Profile
                </h3>
                <div className="space-y-3 flex-1">
                  <p className="text-[15px] font-bold text-slate-800">{order.userId?.name || order.fullName}</p>
                  {order.userId?.email && (
                    <p className="text-[13px] text-slate-500 flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" /> {order.userId.email}
                    </p>
                  )}
                  <p className="text-[13px] text-slate-500 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" /> {order.userId?.phone || order.phone}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col hover:border-blue-200 transition-colors">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin size={14} /> Shipping Info
                </h3>
                <div className="space-y-3 flex-1">
                  <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                    {order.address}<br />
                    Pincode: {order.pincode}
                  </p>
                  <div className="mt-auto pt-3 flex gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {order.shippingMethod} delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION - STATUS & PAYMENT */}
          <div className="space-y-6 sm:space-y-8">

            {/* PAYMENT SUMMARY CARD */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-6 sm:p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
              {/* Decorative background vectors */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full pointer-events-none"></div>

              <h2 className="text-slate-300 font-medium text-sm mb-6 flex items-center gap-2 relative z-10">
                <CreditCard size={18} className="text-slate-400" /> Payment Summary
              </h2>

              <div className="space-y-3 mb-6 relative z-10">
                <div className="flex justify-between items-center text-[13px] text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-300 font-medium">
                    {order.currentStatus === "Pending Quote" || (order.currentStatus === "Pending" && order.paymentMethod === "quote_request") ? "TBD" : `₹${(order.subtotal || order.grandTotal).toLocaleString('en-IN')}`}
                  </span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between items-center text-[13px] text-slate-400">
                    <span>Shipping Fee</span>
                    <span className="text-slate-300 font-medium">₹{order.deliveryFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-700/60 pt-6 relative z-10">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Grand Total</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {order.currentStatus === "Pending Quote" || (order.currentStatus === "Pending" && order.paymentMethod === "quote_request")
                    ? "To Be Decided"
                    : `₹${order.grandTotal.toLocaleString('en-IN')}`
                  }
                </p>

                <div className="mt-4 inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span className="text-xs text-slate-300 font-medium tracking-wide">
                    {order.paymentMethod === 'quote_request' ? "Awaiting Quote Finalization" : `Paid via ${order.paymentMethod.toUpperCase()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION CENTER */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                Update Status
              </h2>

              <div className="space-y-5">
                {/* STATUS SPECIFIC CONTROLS */}
                {["Delivered", "Cancelled"].includes(order.currentStatus) ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <span className="text-slate-500 text-sm font-medium">Order is <strong>{order.currentStatus}</strong> and locked.</span>
                  </div>
                ) : order.currentStatus === "Pending Quote" || (order.currentStatus === "Pending" && order.paymentMethod === "quote_request") ? (
                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-5 space-y-4">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded mb-2 border border-amber-200">Action Required</span>
                      <p className="text-sm text-amber-900/80 font-medium">Please provide the price per unit for the requested custom item(s) to finalize the quote.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                        <input
                          type="number"
                          value={quotePrice}
                          onChange={(e) => setQuotePrice(e.target.value)}
                          placeholder="Price/Unit"
                          className="w-full bg-white border border-amber-200/50 text-slate-800 pl-8 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 font-semibold shadow-sm text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleUpdateQuote}
                      className="w-full py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20 active:scale-[0.98]"
                    >
                      Issue Final Quote
                    </button>
                  </div>
                ) : order.currentStatus === "Pending Payment" ? (
                  <div className="bg-orange-50 border border-orange-200/60 rounded-xl p-5 space-y-2">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded mb-1 border border-orange-200">Awaiting User</span>
                    <p className="text-sm text-orange-900/80 font-medium leading-relaxed">The quote has been issued. Waiting for the customer to complete payment before the order is automatically confirmed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-sm cursor-pointer shadow-sm"
                      >
                        <option value={order.currentStatus}>
                          Current: {order.currentStatus}
                        </option>

                        {getNextStatusOptions(order.currentStatus).map((s) => (
                          <option key={s} value={s}>
                            Advance to: {s}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={16} />
                    </div>

                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Add an optional tracking note for the customer..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none h-24 shadow-sm"
                    />

                    <button
                      onClick={updateStatus}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                    >
                      Apply Status Update
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* TRACKING TIMELINE */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Truck size={18} className="text-slate-400" /> Tracking History
              </h3>

              {order.trackingHistory.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <p className="text-slate-400 text-sm font-medium">No tracking updates yet.</p>
                </div>
              ) : (
                <div className="space-y-6 relative ml-3 mt-4">
                  {/* Vertical Line */}
                  <div className="absolute left-[3px] top-2 bottom-4 w-0.5 bg-slate-100"></div>

                  {order.trackingHistory
                    .slice()
                    .reverse()
                    .map((t, index) => (
                      <div key={index} className="relative pl-6">
                        {/* Dot */}
                        <div className={`absolute -left-[5px] top-1 w-3.5 h-3.5 rounded-full outline outline-[6px] outline-white ${index === 0 ? 'bg-blue-500 ring-2 ring-blue-500/20' : 'bg-slate-300'}`}></div>

                        <div>
                          <p className={`text-[15px] mb-0.5 ${index === 0 ? 'font-bold text-slate-800' : 'font-semibold text-slate-600'}`}>
                            {t.status}
                          </p>
                          <p className="text-[12px] font-medium text-slate-400 mb-2">
                            {new Date(t.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {t.message && (
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[13px] text-slate-600 leading-relaxed shadow-sm inline-block">
                              {t.message}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* CANCEL POPUP */}
        {showCancelPopup && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] w-[90%] max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Cancel Complete Order
              </h2>
              <p className="text-slate-500 text-sm mb-5">
                This will halt all processing and refund any required amounts to the user. This action cannot be undone.
              </p>

              <div className="space-y-1 mb-6">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Reason for Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Out of stock, User requested..."
                  className="bg-slate-50 border border-slate-200 w-full p-3.5 rounded-xl text-sm text-slate-800 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 transition-all resize-none h-24"
                />
              </div>

              <div className="flex justify-end gap-3 w-full">
                <button
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex-1"
                  onClick={() => setShowCancelPopup(false)}
                >
                  Keep Order
                </button>
                <button
                  className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-500/20 active:scale-95 transition-all flex-1"
                  onClick={handleAdminCancel}
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetails;
