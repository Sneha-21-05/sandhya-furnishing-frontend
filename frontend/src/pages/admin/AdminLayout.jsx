import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  Package,
  Layers,
  List,
  ShoppingCart,
  CheckCircle,
  MessageSquare,
  LogOut,
  Calendar
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    JSON.parse(localStorage.getItem("adminSidebarCollapsed") || "false")
  );

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const linkClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 font-medium tracking-wide text-[13px]";

  return (
    <div className="flex h-screen bg-[#faf7f2] font-sans text-slate-800">

      {/* ================= SIDEBAR ================= */}
      <div
        className={`${collapsed ? "w-20" : "w-64"
          } bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-300 shadow-xl z-20`}
      >

        {/* TOP SECTION */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50 h-20">
          {!collapsed && (
            <h1 className="text-xl font-medium text-white tracking-widest uppercase">
              Sandhya<span className="text-blue-500">.</span>
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-slate-400 hover:text-white transition ${collapsed ? "mx-auto" : ""}`}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${linkClass} ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={18} className={collapsed ? "mx-auto" : ""} strokeWidth={1.5} />
            {!collapsed && "Dashboard"}
          </NavLink>

          <div className="pt-3 pb-1.5 px-3">
            {!collapsed && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalog</p>}
          </div>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `${linkClass} ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Package size={18} className={collapsed ? "mx-auto" : ""} strokeWidth={1.5} />
            {!collapsed && "Products"}
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `${linkClass} ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Layers size={18} className={collapsed ? "mx-auto" : ""} strokeWidth={1.5} />
            {!collapsed && "Categories"}
          </NavLink>

          <NavLink
            to="/admin/types"
            className={({ isActive }) =>
              `${linkClass} ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <List size={18} className={collapsed ? "mx-auto" : ""} strokeWidth={1.5} />
            {!collapsed && "Types"}
          </NavLink>

          <div className="pt-3 pb-1.5 px-3">
            {!collapsed && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sales</p>}
          </div>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `${linkClass} ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <ShoppingCart size={18} className={collapsed ? "mx-auto" : ""} strokeWidth={1.5} />
            {!collapsed && "Orders"}
          </NavLink>

          <NavLink
            to="/admin/delivered"
            className={({ isActive }) =>
              `${linkClass} ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <CheckCircle size={18} className={collapsed ? "mx-auto" : ""} strokeWidth={1.5} />
            {!collapsed && "Delivered"}
          </NavLink>

          <div className="pt-3 pb-1.5 px-3">
            {!collapsed && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Support</p>}
          </div>

          <NavLink
            to="/admin/inquiries"
            className={({ isActive }) =>
              `${linkClass} ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <MessageSquare size={18} className={collapsed ? "mx-auto" : ""} strokeWidth={1.5} />
            {!collapsed && "Inquiries"}
          </NavLink>

          <NavLink
            to="/admin/consultations"
            className={({ isActive }) =>
              `${linkClass} ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Calendar size={18} className={collapsed ? "mx-auto" : ""} strokeWidth={1.5} />
            {!collapsed && "Consultations"}
          </NavLink>

        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
          <button
            onClick={logout}
            className={`w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 py-3 rounded-lg transition duration-300 ${collapsed ? "px-2" : "px-4"
              }`}
            title="Logout"
          >
            <LogOut size={18} strokeWidth={1.5} />
            {!collapsed && <span className="text-sm font-medium tracking-wide">Logout</span>}
          </button>
        </div>

      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 overflow-y-auto bg-slate-50 relative">
        <div className="p-8 md:p-12 max-w-[1600px] mx-auto min-h-full">
          {children}
        </div>
      </div>

    </div>
  );
};

export default AdminLayout;

