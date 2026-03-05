import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";

const DashboardHeader = ({
  userName,
  userInitial,
  profileImage,
  toggleSidebar,
}) => {
  const navigate = useNavigate();

  // ✅ Automatically fix backend image path
  const getProfileImageUrl = () => {
    if (!profileImage) return null;
    return getImageUrl(profileImage);
  };

  return (
    <header
      className="h-[80px] flex items-center justify-between px-8
      bg-gradient-to-r from-[#0e2f2f] to-[#1f5c5c]
      text-white shadow-lg"
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-2xl text-white hover:opacity-80 transition"
        >
          ☰
        </button>

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/user/dashboard")}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="w-9 h-9 rounded-full object-cover"
          />
          <h2 className="text-lg font-semibold text-white">
            Sandhya Furnishing
          </h2>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => navigate("/user/cart")}
          className="cursor-pointer text-xl text-white hover:scale-110 transition"
        >
          🛒
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white font-semibold">
            {getProfileImageUrl() ? (
              <img
                src={getProfileImageUrl()}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              userInitial
            )}
          </div>

          <span className="text-sm font-medium text-white">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
