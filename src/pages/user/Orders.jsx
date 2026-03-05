import React, { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { Package, Clock, CheckCircle, ExternalLink, ChevronRight, X, CreditCard } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;

      const res = await api.get(`/orders/my-orders?userId=${userId}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
    setLoading(false);
  };

  const getStatusInfo = (status) => {
    if (!status) return { color: "bg-gray-100 text-gray-600 border-gray-200", icon: Clock };

    switch (status.toLowerCase()) {
      case "pending":
        return { color: "bg-orange-50 text-orange-600 border-orange-200", icon: Clock };
      case "confirmed":
      case "processing":
        return { color: "bg-blue-50 text-blue-600 border-blue-200", icon: Package };
      case "packed":
      case "out for delivery":
        return { color: "bg-indigo-50 text-indigo-600 border-indigo-200", icon: Package };
      case "delivered":
        return { color: "bg-green-50 text-green-600 border-green-200", icon: CheckCircle };
      case "cancelled":
        return { color: "bg-red-50 text-red-600 border-red-200", icon: X };
      case "pending payment":
        return { color: "bg-amber-50 text-amber-600 border-amber-200", icon: CreditCard };
      default:
        return { color: "bg-gray-100 text-gray-600 border-gray-200", icon: Clock };
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-10 max-w-[1200px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* PAGE TITLE */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#142C2C] tracking-tight mb-2">
            Order History
          </h1>
          <p className="text-gray-500 text-[15px]">
            Track and manage your recent purchases.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 h-64 animate-pulse flex flex-col justify-between">
                <div className="h-10 bg-gray-100 rounded-xl w-1/3"></div>
                <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Package size={32} />
            </div>
            <h2 className="text-[#142C2C] font-semibold text-xl mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Explore our collection and find something beautiful for your space.
            </p>
            <Link
              to="/latest-products"
              className="inline-flex items-center gap-2 bg-[#142C2C] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#9B804E] transition-all duration-300 shadow-md shadow-[#142C2C]/20"
            >
              Start Shopping <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const orderDate = new Date(order.createdAt);
              const expectedDate = new Date(order.createdAt);
              expectedDate.setDate(orderDate.getDate() + 6);

              const statusInfo = getStatusInfo(order.currentStatus);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                >
                  {/* HEADER */}
                  <div className="bg-gray-50/50 p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-[#142C2C]">
                          Order <span className="text-gray-500 font-medium text-base">#{order._id.substring(order._id.length - 8)}</span>
                        </h3>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusInfo.color}`}>
                          <StatusIcon size={12} strokeWidth={3} />
                          {order.currentStatus}
                        </span>
                      </div>
                      <p className="text-[14px] text-gray-500">
                        Placed on {orderDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <Link
                      to={`/user/order/${order._id}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-[#142C2C] font-semibold text-sm rounded-xl border border-gray-200 hover:border-[#9B804E] hover:text-[#9B804E] transition-colors whitespace-nowrap"
                    >
                      Track Order <ExternalLink size={16} />
                    </Link>
                  </div>

                  {/* ITEM LIST */}
                  <div className="p-6 sm:p-8">
                    <div className="divide-y divide-gray-100">
                      {order.items.map((item, idx) => {
                        const imageUrl = getImageUrl(item.image);

                        return (
                          <Link
                            to={`/user/order/${order._id}`}
                            key={idx}
                            className="group flex flex-col sm:flex-row items-center gap-6 py-6 first:pt-0 last:pb-0 transition-opacity hover:opacity-80"
                          >
                            <div className="w-full sm:w-28 h-28 bg-gray-50 rounded-2xl flex-shrink-0 p-3 border border-gray-100 overflow-hidden relative">
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
                              <p className="text-gray-500 text-sm">
                                Qty: <span className="font-semibold text-gray-700">{item.qty}</span>
                              </p>
                            </div>

                            <div className="text-center sm:text-right w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0 flex flex-row sm:flex-col justify-between items-center sm:items-end">
                              <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Price</p>
                                {item.isCustomSize && (order.currentStatus === "Pending Quote" || (order.currentStatus === "Pending" && order.paymentMethod === "quote_request")) ? (
                                  <p className="text-sm font-bold text-[#9B804E] bg-[#9B804E]/10 px-2 py-0.5 rounded inline-block mt-0.5">TBD</p>
                                ) : (
                                  <p className="text-lg font-bold text-[#142C2C]">
                                    ₹{item.price.toLocaleString('en-IN')}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Expected</p>
                                <p className="font-semibold text-sm text-[#142C2C]">
                                  {expectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="bg-[#142C2C] text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 text-white/80 text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      Paid via <span className="font-bold text-white capitalize tracking-wider">{order.paymentMethod}</span>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-white/60 text-sm font-medium uppercase tracking-widest">Total</span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {order.currentStatus === "Pending Quote" || (order.currentStatus === "Pending" && order.paymentMethod === "quote_request") ? "To Be Decided" : `₹${order.grandTotal.toLocaleString('en-IN')}`}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Orders;
