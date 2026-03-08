import React, { useEffect, useState } from "react";
import api from "../../api";
import AdminLayout from "./AdminLayout";
import { useNavigate } from "react-router-dom";
import { Users, LayoutList, ShoppingBag, IndianRupee } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConsultations: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchStatusCounts();

    const interval = setInterval(() => {
      fetchAnalytics();
      fetchStatusCounts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  // ================= FETCH ANALYTICS =================
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.get(`/orders/admin/analytics?t=${new Date().getTime()}`, {
        headers: { Authorization: token },
      });

      if (res.data.success) {
        const data = res.data.stats;

        setStats({
          totalUsers: data.totalUsers,
          totalConsultations: data.totalConsultations,
          totalOrders: data.totalOrders,
          totalRevenue: data.totalRevenue,
        });

        setRevenueData(data.revenueData || []);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (err) {
      console.log("Analytics error:", err);
    }
  };

  // ================= FETCH STATUS COUNTS =================
  const fetchStatusCounts = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.get(`/orders/admin/status-count?t=${new Date().getTime()}`, {
        headers: { Authorization: token },
      });

      if (res.data.success) {
        setStatusData(res.data.data);
      }
    } catch (err) {
      console.log("Status count error:", err);
    }
  };

  // ================= FORMAT REVENUE =================
  const monthNames = [
    "",
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const formattedRevenueData =
    revenueData.length > 0
      ? revenueData.map((item) => ({
        month: monthNames[item._id],
        revenue: item.revenue,
      }))
      : [{ month: "No Data", revenue: 0 }];

  // ================= FORMAT STATUS =================
  const formattedStatusData = Object.entries(statusData || {})
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      status: key,
      count: value,
    }));

  return (
    <AdminLayout>
      <div className="space-y-10">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-light text-slate-900 tracking-wide">
            Overview
          </h1>
          <p className="text-slate-500 mt-2 font-light">
            Welcome back. Here is your store's recent activity and analytics.
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => navigate("/admin/users")}
            className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
              <h3 className="text-3xl font-semibold text-slate-800">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Users size={24} strokeWidth={1.5} />
            </div>
          </div>

          <div
            onClick={() => navigate("/admin/consultations")}
            className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Consultations</p>
              <h3 className="text-3xl font-semibold text-slate-800">{stats.totalConsultations || 0}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <LayoutList size={24} strokeWidth={1.5} />
            </div>
          </div>

          <div
            onClick={() => navigate("/admin/orders")}
            className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
              <h3 className="text-3xl font-semibold text-slate-800">{stats.totalOrders}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} strokeWidth={1.5} />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-semibold text-slate-800">
                <span className="text-xl font-medium text-slate-400 mr-1">₹</span>
                {stats.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <IndianRupee size={24} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* MONTHLY REVENUE (AREA CHART) */}
          <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-8 border-b border-gray-50 pb-4">
              Monthly Revenue Performance
            </h2>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                <AreaChart data={formattedRevenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 13 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 13 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ORDERS BY STATUS (PIE CHART) */}
          <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-8 border-b border-gray-50 pb-4">
              Current Order Distribution
            </h2>

            <div className="h-[320px] flex items-center justify-center">
              {formattedStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                  <PieChart>
                    <Pie
                      data={formattedStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {formattedStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.status === "Cancelled"
                              ? "#ef4444"
                              : entry.status === "Delivered"
                                ? "#10b981"
                                : entry.status === "Pending"
                                  ? "#f59e0b"
                                  : entry.status === "Processing"
                                    ? "#8b5cf6"
                                    : entry.status === "Packed"
                                      ? "#ec4899"
                                      : entry.status === "Out for Delivery"
                                        ? "#06b6d4"
                                        : "#3b82f6"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 500 }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-slate-600 font-medium ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <LayoutList size={40} className="mb-3 opacity-20" />
                  <p>No order status data available</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-50">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Recent Orders</h2>
              <p className="text-sm font-light text-slate-500 mt-1">
                The latest 5 orders placed on your store.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50 text-[13px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-50">
                  <th className="py-4 px-6 md:px-8">Order ID</th>
                  <th className="py-4 px-6 md:px-8">Customer</th>
                  <th className="py-4 px-6 md:px-8">Date</th>
                  <th className="py-4 px-6 md:px-8">Amount</th>
                  <th className="py-4 px-6 md:px-8">Status</th>
                </tr>
              </thead>
              <tbody className="text-[15px] font-medium text-slate-700 divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 font-normal">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 md:px-8 font-mono text-xs text-slate-500">
                        {order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-4 px-6 md:px-8 text-slate-800">
                        <div className="flex flex-col">
                          <span>{order.fullName}</span>
                          {order.userId?.email && <span className="font-normal text-[13px] text-slate-500 mt-0.5">{order.userId.email}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 md:px-8 font-normal text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 md:px-8">
                        ₹{order.grandTotal?.toLocaleString() || "0"}
                      </td>
                      <td className="py-4 px-6 md:px-8">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full tracking-wide ${order.currentStatus === "Delivered" ? "bg-emerald-100 text-emerald-700" :
                            order.currentStatus === "Cancelled" ? "bg-rose-100 text-rose-700" :
                              order.currentStatus === "Pending" ? "bg-amber-100 text-amber-700" :
                                "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {order.currentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
