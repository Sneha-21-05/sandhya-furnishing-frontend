import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api";

import {
  FiHome,
  FiLayers,
  FiTag,
  FiPackage,
  FiUsers,
  FiMail,
  FiCalendar,
} from "react-icons/fi";

const AdminSidebar = ({ collapsed }) => {
  const [inquiryCount, setInquiryCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    loadCount();

    // Auto-refresh every 10 sec
    const interval = setInterval(loadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadCount = () => {
    api.get("/inquiry").then((res) => {
      if (res.data?.inquiries) {
        const pending = res.data.inquiries.filter((i) => i.status === "pending").length;
        setInquiryCount(pending);
      }
    });
  };

  const menu = [
    { name: "Dashboard", icon: <FiHome />, path: "/admin/dashboard" },
    { name: "Services", icon: <FiLayers />, path: "/admin/services" },
    { name: "Categories", icon: <FiLayers />, path: "/admin/category/add" },
    { name: "Types", icon: <FiTag />, path: "/admin/type/add" },
    { name: "Products", icon: <FiPackage />, path: "/admin/products/add" },
    { name: "Users", icon: <FiUsers />, path: "/admin/users" },

    { name: "Orders", icon: <FiPackage />, path: "/admin/orders" },

    { name: "Consultations", icon: <FiCalendar />, path: "/admin/consultations" },

    // INQUIRIES with count badge
    {
      name: `Inquiries`,
      icon: <FiMail />,
      path: "/admin/inquiries",
      badge: inquiryCount,
    },
  ];

  return (
    <div
      className={`${collapsed ? "w-20" : "w-64"
        } bg-white shadow-md h-screen sticky top-0 transition-all duration-300`}
    >
      <div className="p-6">
        {!collapsed ? (
          <h1 className="text-2xl font-bold text-green-600">Admin Panel</h1>
        ) : (
          <h1 className="text-2xl font-bold text-green-600 text-center">A</h1>
        )}
      </div>

      <div className="mt-6">
        {menu.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-green-100 transition cursor-pointer
              ${location.pathname === item.path ? "bg-green-50 font-semibold" : ""}
            `}
          >
            <span className="text-xl">{item.icon}</span>

            {!collapsed && (
              <span className="ml-4 flex items-center gap-2">
                {item.name}

                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
