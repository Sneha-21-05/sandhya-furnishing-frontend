import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  ShoppingCart,
  MessageSquare,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  ChevronLeft,
  Calendar
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const getProfileImageUrl = (img) => {
  if (!img) return "";
  return `${BACKEND_URL}${img}?v=${Date.now()}`;
};

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [storedUser, setStoredUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  const [cartCount, setCartCount] = useState(
    Number(localStorage.getItem("cartCount")) || 0
  );

  const userName = storedUser?.fullname || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  /* ================= EFFECTS ================= */

  useEffect(() => {
    const syncUserFromStorage = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setStoredUser(user);
    };

    window.addEventListener("user-updated", syncUserFromStorage);
    return () => {
      window.removeEventListener("user-updated", syncUserFromStorage);
    };
  }, []);

  useEffect(() => {
    const syncCartCount = () => {
      setCartCount(Number(localStorage.getItem("cartCount")) || 0);
    };

    window.addEventListener("cart-updated", syncCartCount);
    return () => {
      window.removeEventListener("cart-updated", syncCartCount);
    };
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.email) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/inquiry/unread-count/${user.email}`
        );
        const data = await res.json();
        if (data?.success) {
          setUnreadCount(data.count);
        }
      } catch (err) {
        console.log("Unread fetch error:", err);
      }
    };

    fetchUnread();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 h-full
          ${collapsed ? "w-[90px]" : "w-[280px]"}
          bg-white border-r border-gray-100
          shadow-[0_0_20px_rgba(0,0,0,0.05)]
          transition-all duration-300
          flex flex-col z-50
        `}
      >
        {/* ===== LOGO ===== */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/user/dashboard")}
          >
            {/* Logo */}
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white flex items-center justify-center">
              <img
                src="/images/logo.png"
                alt="Sandhya Furnishing Logo"
                className="w-full h-full object-cover"
              />
            </div>

            {!collapsed && (
              <div>
                <h2 className="text-[18px] font-bold text-[#142C2C] leading-none">
                  Sandhya
                </h2>
                <span className="text-[11px] font-semibold tracking-[0.3em] text-[#9B804E] uppercase">
                  Furnishing
                </span>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform ${collapsed ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>

        {/* ===== MENU TITLE ===== */}
        {!collapsed && (
          <div className="p-6 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Menu
            </p>
          </div>
        )}

        {/* ===== NAVIGATION ===== */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <SidebarItem
            icon={LayoutDashboard}
            text="Dashboard"
            path="/user/dashboard"
            active={currentPath === "/user/dashboard"}
            collapsed={collapsed}
          />

          <SidebarItem
            icon={UserIcon}
            text="Update Profile"
            path="/user/update-profile"
            active={currentPath.includes("/update-profile")}
            collapsed={collapsed}
          />

          <SidebarItem
            icon={ShoppingBag}
            text="Orders"
            path="/user/orders"
            active={currentPath.includes("/orders")}
            collapsed={collapsed}
          />

          <SidebarItem
            icon={ShoppingCart}
            text="Cart"
            path="/user/cart"
            badge={cartCount}
            active={currentPath.includes("/cart")}
            collapsed={collapsed}
          />

          <SidebarItem
            icon={MessageSquare}
            text="Inquiries"
            path="/user/inquiries"
            badge={unreadCount}
            active={currentPath.includes("/inquiries")}
            collapsed={collapsed}
          />

          <SidebarItem
            icon={Calendar} /* We will need to import Calendar from lucide-react */
            text="Consultations"
            path="/user/consultations"
            active={currentPath.includes("/consultations")}
            collapsed={collapsed}
          />
        </nav>

        {/* ===== LOGOUT ===== */}
        <div className="p-4 border-t border-gray-50">
          <SidebarItem
            icon={LogOut}
            text="Logout"
            isLogout
            collapsed={collapsed}
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          />
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div
        className={`flex-1 ${collapsed ? "lg:ml-[90px]" : "lg:ml-[280px]"
          } flex flex-col min-h-screen transition-all duration-300`}
      >
        {/* HEADER */}
        <header className="h-[80px] bg-white sticky top-0 z-30 px-6 sm:px-10 flex items-center justify-end shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <button
            onClick={() => navigate("/user/update-profile")}
            className="flex items-center gap-3 py-1 px-1.5 rounded-full hover:bg-gray-50 transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-[#142C2C]">
                {userName}
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                Customer
              </p>
            </div>

            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#142C2C] to-[#2A5252] flex items-center justify-center text-white font-bold">
              {storedUser.profileImage ? (
                <img
                  src={getProfileImageUrl(storedUser.profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitial
              )}
            </div>
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 bg-gray-50 p-6 sm:p-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

/* ================= SIDEBAR ITEM ================= */
const SidebarItem = ({
  icon: Icon,
  text,
  isLogout,
  onClick,
  badge,
  path,
  active,
  collapsed
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick();
    if (path) navigate(path);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300
        ${isLogout
          ? "text-red-500 hover:bg-red-50 font-medium"
          : active
            ? "bg-[#142C2C] text-white shadow-md shadow-[#142C2C]/20"
            : "text-gray-600 hover:bg-[#9B804E]/10 hover:text-[#9B804E] font-medium"
        }`}
    >
      <div className="flex items-center gap-3.5 relative z-10">
        <Icon size={20} />
        {!collapsed && <span className="text-[15px]">{text}</span>}
      </div>

      {badge > 0 && (
        <span
          className={`
            absolute top-2 right-3
            text-[10px] font-bold w-5 h-5
            flex items-center justify-center rounded-full
            ${active ? "bg-[#caa873] text-[#142C2C]" : "bg-[#9B804E] text-white"}
          `}
        >
          {badge}
        </span>
      )}
    </div>
  );
};

export default DashboardLayout;