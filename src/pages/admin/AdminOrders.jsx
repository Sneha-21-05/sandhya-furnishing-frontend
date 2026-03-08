import React, { useEffect, useState } from "react";
import api from "../../api";
import AdminLayout from "./AdminLayout";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const statusOptions = [
  "Pending",
  "Pending Quote",
  "Pending Payment",
  "Confirmed",
  "Processing",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

const statusColors = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "Pending Quote": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Pending Payment": "bg-orange-100 text-orange-700 border-orange-200",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  Processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Packed: "bg-purple-100 text-purple-700 border-purple-200",
  "Out for Delivery": "bg-sky-100 text-sky-700 border-sky-200",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [orders, statusFilter, paymentFilter, searchTerm]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.get("/orders/admin/all", {
        headers: { Authorization: token },
      });

      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (statusFilter) {
      filtered = filtered.filter(
        (o) => o.currentStatus === statusFilter
      );
    }

    if (paymentFilter) {
      filtered = filtered.filter(
        (o) => o.paymentMethod === paymentFilter
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (o) =>
          o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.userId?.name || o.fullName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const getNextStatusOptions = (currentStatus) => {
    const flow = [
      "Pending",
      "Pending Quote",
      "Pending Payment",
      "Confirmed",
      "Processing",
      "Packed",
      "Out for Delivery",
      "Delivered",
    ];

    const currentIndex = flow.indexOf(currentStatus);

    if (
      currentStatus === "Delivered" ||
      currentStatus === "Cancelled" ||
      currentStatus === "Pending Quote" ||
      currentStatus === "Pending Payment"
    ) {
      return [];
    }

    const nextStatus = flow[currentIndex + 1];

    return nextStatus ? [nextStatus, "Cancelled"] : [];
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.patch(
        `/orders/admin/update-status/${orderId}`,
        {
          status: newStatus,
          message: `${newStatus} updated by admin.`,
        },
        { headers: { Authorization: token } }
      );

      if (res.data.success) {
        toast.success("Status updated successfully");

        const updatedOrders = orders.map((o) =>
          o._id === orderId ? { ...o, ...res.data.order, userId: o.userId } : o
        );

        const updatedFiltered = filteredOrders.map((o) =>
          o._id === orderId ? { ...o, ...res.data.order, userId: o.userId } : o
        );
        setOrders(updatedOrders);
        setFilteredOrders(updatedFiltered);


      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");

      if (err.response?.status === 401 || err.response?.data?.message === "Invalid token") {
        localStorage.removeItem("adminToken");
        window.location.href = "/#/admin-login";
      }
    }
  };

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    filteredOrders.length / ordersPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages)
      setCurrentPage(page);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-medium text-slate-800 tracking-wide">
            Manage Orders
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-light">
            View and update customer order statuses.
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search Order ID or Customer..."
              className="w-full bg-slate-50 border border-gray-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className="appearance-none bg-slate-50 border border-gray-200 text-slate-700 pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm cursor-pointer"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="">All Statuses</option>
                {[...statusOptions, "Cancelled"].map(
                  (s) => (
                    <option key={s} value={s}>{s}</option>
                  )
                )}
              </select>
            </div>

            <select
              className="bg-slate-50 border border-gray-200 text-slate-700 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm cursor-pointer"
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value)
              }
            >
              <option value="">All Payments</option>
              <option value="cod">COD</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {currentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-slate-500 font-light"
                    >
                      No orders match your current filters.
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-700">
                        #{order._id.slice(-6)}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-slate-800 font-medium">
                          {order.userId?.name || order.fullName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {order.userId?.phone || order.phone || "N/A"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {order.currentStatus === "Pending Quote" ? "TBD" : `₹${order.grandTotal?.toLocaleString()}`}
                      </td>

                      <td className="px-6 py-4">
                        {order.currentStatus === "Delivered" ||
                          order.currentStatus === "Cancelled" ||
                          order.currentStatus === "Pending Quote" ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.currentStatus]
                              }`}
                          >
                            {order.currentStatus}
                          </span>
                        ) : (
                          <select
                            value={order.currentStatus}
                            onChange={(e) =>
                              handleStatusChange(
                                order._id,
                                e.target.value
                              )
                            }
                            title="Update Status"
                            className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors ${statusColors[order.currentStatus] || "bg-gray-100 text-gray-700"
                              }`}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.2rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                          >
                            <option value={order.currentStatus} disabled className="hidden">
                              {order.currentStatus}
                            </option>

                            {getNextStatusOptions(
                              order.currentStatus
                            ).map((status) => (
                              <option
                                key={status}
                                value={status}
                                className="bg-white text-slate-800"
                              >
                                {status}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="inline-flex items-center justify-center px-4 py-1.5 border border-gray-200 bg-white hover:bg-slate-50 hover:text-blue-600 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                          View
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
            <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{indexOfFirst + 1}</span> to <span className="font-medium text-slate-700">{Math.min(indexOfLast, filteredOrders.length)}</span> of <span className="font-medium text-slate-700">{filteredOrders.length}</span> results
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show current page, first, last, and immediate neighbors
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={index}
                        onClick={() => goToPage(pageNumber)}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageNumber
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={index} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
