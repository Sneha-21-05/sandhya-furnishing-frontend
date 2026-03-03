import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import {
    Menu, Search, ShoppingBag, ShoppingCart,
    MessageSquare, LogOut, User as UserIcon, LayoutDashboard, ChevronRight, Calendar
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const getProfileImageUrl = (img) => {
    if (!img) return "";
    return `${BACKEND_URL}${img}?v=${Date.now()}`;
};

const UserLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    /* ================= USER ================= */
    const [storedUser, setStoredUser] = useState(
        JSON.parse(localStorage.getItem("user") || "{}")
    );

    const userName = storedUser.fullname || "User";
    const userInitial = userName.charAt(0).toUpperCase();

    /* ================= STATE ================= */
    const [collapsed, setCollapsed] = useState(
        JSON.parse(localStorage.getItem("sidebarCollapsed") || "false")
    );
    const [unreadCount, setUnreadCount] = useState(0);
    const [cartCount, setCartCount] = useState(
        Number(localStorage.getItem("cartCount")) || 0
    );

    /* ================= PERSIST SIDEBAR ================= */
    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    }, [collapsed]);

    /* ================= SYNC ALL ================= */
    useEffect(() => {
        const syncUserFromStorage = () => {
            setStoredUser(JSON.parse(localStorage.getItem("user") || "{}"));
        };
        const syncCartCount = () => {
            setCartCount(Number(localStorage.getItem("cartCount")) || 0);
        };

        window.addEventListener("user-updated", syncUserFromStorage);
        window.addEventListener("cart-updated", syncCartCount);

        return () => {
            window.removeEventListener("user-updated", syncUserFromStorage);
            window.removeEventListener("cart-updated", syncCartCount);
        };
    }, []);

    /* ================= FETCH UNREAD COUNT ================= */
    useEffect(() => {
        if (storedUser?.email) {
            api
                .get(`/inquiry/unread-count/${storedUser.email}`)
                .then((res) => {
                    if (res.data?.success) setUnreadCount(res.data.count);
                })
                .catch(() => setUnreadCount(0));
        }
    }, [storedUser?.email, location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`fixed top-0 left-0 h-full ${collapsed ? "w-[90px]" : "w-[280px]"} bg-white border-r border-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col z-40`}
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white flex items-center justify-center">
                            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        {!collapsed && (
                            <div>
                                <h2 className="text-[18px] font-bold text-[#142C2C] leading-none">Sandhya</h2>
                                <span className="text-[11px] font-semibold tracking-[0.3em] text-[#9B804E] uppercase">Furnishing</span>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-600">
                        <ChevronRight size={20} className={`transition-transform ${collapsed ? "" : "rotate-180"}`} />
                    </button>
                </div>

                {!collapsed && (
                    <div className="p-6 pb-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Menu</p>
                    </div>
                )}

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto w-full">
                    <SidebarItem icon={LayoutDashboard} text="Dashboard" path="/user/dashboard" collapsed={collapsed} />
                    <SidebarItem icon={UserIcon} text="Update Profile" path="/user/update-profile" collapsed={collapsed} />
                    <SidebarItem icon={ShoppingBag} text="Orders" path="/user/orders" collapsed={collapsed} />
                    <SidebarItem icon={ShoppingCart} text="Cart" badge={cartCount} path="/user/cart" collapsed={collapsed} />
                    <SidebarItem icon={MessageSquare} text="Inquiries" badge={unreadCount} path="/user/inquiries" collapsed={collapsed} />
                    <SidebarItem icon={Calendar} text="Consultations" path="/user/consultations" collapsed={collapsed} />
                </nav>

                <div className="p-4 border-t border-gray-50 w-full">
                    <SidebarItem
                        icon={LogOut} text="Logout" isLogout collapsed={collapsed}
                        onClick={() => { localStorage.clear(); navigate("/login"); }}
                    />
                </div>
            </aside>

            {/* ================= MAIN CONTENT ================= */}
            <div className={`flex-1 ${collapsed ? "lg:ml-[90px]" : "lg:ml-[280px]"} flex flex-col min-h-screen transition-all duration-300 w-full`}>

                {/* ================= HEADER ================= */}
                <header className="h-[80px] bg-white sticky top-0 z-30 px-6 sm:px-10 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-gray-50 w-full">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden md:block"></div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <button onClick={() => navigate("/user/cart")} className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                            <ShoppingCart size={22} className="stroke-[1.5]" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-[#9B804E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white ring-1 ring-[#9B804E]">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
                        <button onClick={() => navigate("/user/update-profile")} className="flex items-center gap-3 py-1 px-1.5 rounded-full hover:bg-gray-50 transition-colors">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-[#142C2C] leading-snug">{userName}</p>
                                <p className="text-[11px] text-gray-500 font-medium">Customer</p>
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#142C2C] to-[#2A5252] flex items-center justify-center border-2 border-white shadow-sm">
                                {storedUser.profileImage ? (
                                    <img src={getProfileImageUrl(storedUser.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white text-sm font-bold">{userInitial}</span>
                                )}
                            </div>
                        </button>
                    </div>
                </header>

                {/* Dynamic Page Content Rendered Here */}
                {children}

            </div>
        </div>
    );
};

/* =================== SIDEBAR ITEM COMPONENT =================== */
const SidebarItem = ({ icon: Icon, text, isLogout, onClick, badge, path, collapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const active = location.pathname === path;

    const handleClick = () => {
        if (onClick) return onClick();
        if (path) navigate(path);
    };

    return (
        <div
            onClick={handleClick}
            className={`relative group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 w-full mb-1 text-left
        ${isLogout
                    ? "text-red-500 hover:bg-red-50 font-medium"
                    : active
                        ? "bg-[#142C2C] text-white shadow-md shadow-[#142C2C]/20"
                        : "text-gray-600 hover:bg-[#9B804E]/10 hover:text-[#9B804E] font-medium"
                }`}
        >
            <div className="flex items-center gap-3.5 relative z-10 w-full">
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span className="text-[15px] whitespace-nowrap overflow-hidden text-ellipsis">{text}</span>}
            </div>

            {badge > 0 && (
                <span className={`relative z-10 text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0
            ${active ? "bg-white text-[#142C2C]" : "bg-[#9B804E] text-white shadow-sm"}`}
                >
                    {badge}
                </span>
            )}

            {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#9B804E] rounded-r-full"></div>
            )}
        </div>
    );
};

export default UserLayout;
