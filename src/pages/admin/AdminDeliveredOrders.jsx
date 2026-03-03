import React, { useEffect, useState } from "react";
import api from "../../api";
import AdminLayout from "./AdminLayout";
import { Link } from "react-router-dom";
import { Package, Search, Calendar, ChevronLeft, ChevronRight, CheckCircle, ArrowRight } from "lucide-react";

const AdminDeliveredOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    loadDeliveredOrders();
  }, []);

  const loadDeliveredOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.get("/orders/admin/delivered", {
        headers: { Authorization: token },
      });

      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Error fetching delivered orders:", err);
    }
  };

  const applySearch = () => {
    if (!searchTerm.trim()) return orders;
    return orders.filter(o =>
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.userId?.name || o.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.userId?.phone || o.phone || "").includes(searchTerm)
    );
  }

  const filteredOrders = applySearch();
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 font-sans pb-16 max-w-[1400px] mx-auto">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 tracking-tight">
              Delivered Orders
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium max-w-xl">
              A complete history of successfully fulfilled customer orders.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm text-sm">
              <CheckCircle size={16} />
              {orders.length} Deliveries
            </div>
          </div>
        </div>

        {/* MAIN LIST VIEW */}
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col relative">

          {/* SEARCH BAR */}
          <div className="p-5 border-b border-slate-100/80 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="relative group w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by Order ID, Name, or Phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200/80 text-slate-800 pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-medium text-sm placeholder:font-normal placeholder:text-slate-400 shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Payment</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Delivered On</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                          <Package size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No delivered orders found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 align-middle">
                        <span className="text-sm font-bold text-slate-700 font-mono tracking-tight bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/50">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <p className="text-sm font-bold text-slate-800">
                          {order.userId?.name || order.fullName}
                        </p>
                      </td>
                      <td className="px-6 py-4 align-middle text-sm text-slate-600 font-medium whitespace-nowrap">
                        {order.userId?.phone || order.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${order.paymentMethod === 'cod' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-blue-50 text-blue-700 border-blue-200/60'
                          }`}>
                          {order.paymentMethod === 'quote_request' ? "Custom Quote" : order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">
                          ₹{order.grandTotal.toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(order.updatedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-slate-700 text-sm font-bold border border-slate-200/80 shadow-[0_1px_2px_rgb(0,0,0,0.05)] rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 group-hover:border-blue-200 group-hover:text-blue-600"
                        >
                          View <ArrowRight size={14} className="opacity-60 -translate-x-1 group-hover:translate-x-0 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="p-5 border-t border-slate-100/80 bg-slate-50/50 flex justify-between items-center sm:flex-row flex-col gap-4">
              <span className="text-sm font-medium text-slate-500">
                Showing <strong className="text-slate-800">{indexOfFirst + 1}</strong> to <strong className="text-slate-800">{Math.min(indexOfLast, filteredOrders.length)}</strong> of <strong className="text-slate-800">{filteredOrders.length}</strong> entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft size={18} className="text-slate-600" />
                </button>

                <div className="flex gap-1.5">
                  {[...Array(totalPages)].map((_, index) => {
                    if (totalPages > 5) {
                      if (index !== 0 && index !== totalPages - 1 && Math.abs(index + 1 - currentPage) > 1) {
                        if (index + 1 === currentPage - 2 || index + 1 === currentPage + 2) return <span key={index} className="px-2 py-1 text-slate-400">...</span>;
                        return null;
                      }
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => goToPage(index + 1)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${currentPage === index + 1
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                          }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronRight size={18} className="text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDeliveredOrders;
