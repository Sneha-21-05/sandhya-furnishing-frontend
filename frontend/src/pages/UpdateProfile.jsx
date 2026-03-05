import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Camera, Eye, EyeOff, Save, CheckCircle2 } from "lucide-react";

const BACKEND_URL = "https://sandhya-furnishing-backend.onrender.com";

const UpdateProfile = () => {
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData._id || userData.id;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");

  const [address, setAddress] = useState({
    city: "",
    street: "",
    building: "",
    landmark: "",
    contactNo: "",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    if (userData.fullname) {
      const parts = userData.fullname.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }

    setPhone(userData.phone || "");
    setAddress(userData.address || {});
    setExistingImage(userData.profileImage || "");
  }, [userId]);

  const totalFields = 7;
  const filledFields = [
    firstName,
    lastName,
    phone,
    address?.city,
    address?.street,
    address?.building,
    address?.contactNo,
  ].filter(Boolean).length;

  const completion = Math.round((filledFields / totalFields) * 100);

  const validatePassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pwd);

  const handleUpdate = async () => {
    if (password) {
      if (!validatePassword(password)) {
        setSuccess(false);
        setMessage(
          "Password must be 8+ chars with uppercase, lowercase, number & special char."
        );
        return;
      }

      if (password !== confirmPassword) {
        setSuccess(false);
        setMessage("Passwords do not match.");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("id", userId);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("phone", phone);
      formData.append("address", JSON.stringify(address));

      if (password) formData.append("password", password);
      if (profileImage) formData.append("profileImage", profileImage);

      const res = await api.put("/users/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const updatedUser = {
          ...res.data.user,
          profileImage: res.data.user.profileImage || "",
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user-updated"));

        setSuccess(true);
        setMessage("Profile updated successfully!");

        setTimeout(() => navigate("/user/dashboard"), 1500);
      }
    } catch {
      setSuccess(false);
      setMessage("Update failed. Please try again.");
    }
  };

  /* ================= INPUT STYLE ================= */
  const inputGroupStyle = "flex flex-col gap-1.5";
  const labelStyle = "text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1";
  const inputStyle =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#9B804E]/20 focus:border-[#9B804E] transition-all shadow-sm";

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-10 max-w-[1000px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

        {/* ================= HEADER ================= */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#142C2C] tracking-tight mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-500 text-[15px]">
              Manage your personal information and preferences.
            </p>
          </div>

          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium border border-green-200 animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}
          {!success && message && (
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 animate-in fade-in slide-in-from-right-4">
              {message}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">

          {/* ================= PROFILE HEADER & IMAGE ================= */}
          <div className="bg-gray-50/50 p-8 border-b border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-8">

            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#142C2C] to-[#2A5252] flex items-center justify-center text-white text-4xl font-serif italic shadow-xl border-4 border-white">
                {profileImage ? (
                  <img
                    src={URL.createObjectURL(profileImage)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : existingImage ? (
                  <img
                    src={`${BACKEND_URL}${existingImage}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  firstName.charAt(0).toUpperCase()
                )}
              </div>

              <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center cursor-pointer text-gray-600 hover:text-[#9B804E] transition-colors group-hover:scale-110 duration-300">
                <Camera size={18} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                />
              </label>
            </div>

            <div className="flex-1 w-full text-center sm:text-left pt-2">
              <h2 className="text-xl font-bold text-[#142C2C] mb-1">{firstName} {lastName}</h2>
              <p className="text-sm text-gray-500 mb-6">{userData.email}</p>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                  <span>Profile Completion</span>
                  <span className={completion === 100 ? "text-green-500" : "text-[#9B804E]"}>{completion}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${completion === 100 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-[#9B804E] to-[#CRA873]'}`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-10">

            {/* ================= PERSONAL INFO ================= */}
            <section>
              <h3 className="text-lg font-bold text-[#142C2C] mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-gray-200"></span> Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>First Name</label>
                  <input
                    className={inputStyle}
                    placeholder="e.g. John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>Last Name</label>
                  <input
                    className={inputStyle}
                    placeholder="e.g. Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>Email Address</label>
                  <input
                    className={`${inputStyle} bg-gray-100/50 text-gray-500 cursor-not-allowed`}
                    value={userData.email || ""}
                    disabled
                  />
                </div>
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>Phone Number</label>
                  <input
                    className={inputStyle}
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* ================= ADDRESS ================= */}
            <section>
              <h3 className="text-lg font-bold text-[#142C2C] mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-gray-200"></span> Delivery Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className={`${inputGroupStyle} sm:col-span-2`}>
                  <label className={labelStyle}>Flat, Housing, Building</label>
                  <input
                    className={inputStyle}
                    placeholder="e.g. 402, Skyline Apartments"
                    value={address.building || ""}
                    onChange={(e) => setAddress({ ...address, building: e.target.value })}
                  />
                </div>
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>Street / Area</label>
                  <input
                    className={inputStyle}
                    placeholder="e.g. Main Street"
                    value={address.street || ""}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  />
                </div>
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>Landmark</label>
                  <input
                    className={inputStyle}
                    placeholder="e.g. Near City Mall"
                    value={address.landmark || ""}
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  />
                </div>
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>City</label>
                  <input
                    className={inputStyle}
                    placeholder="e.g. Mumbai"
                    value={address.city || ""}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                </div>
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>Contact for Delivery</label>
                  <input
                    className={inputStyle}
                    placeholder="Alternative Phone No."
                    value={address.contactNo || ""}
                    onChange={(e) => setAddress({ ...address, contactNo: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* ================= SECURITY ================= */}
            <section>
              <h3 className="text-lg font-bold text-[#142C2C] mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-gray-200"></span> Security
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>New Password</label>
                  <PasswordInput
                    placeholder="Leave blank to keep current"
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    setShow={setShowPassword}
                    inputStyle={inputStyle}
                  />
                </div>
                <div className={inputGroupStyle}>
                  <label className={labelStyle}>Confirm Password</label>
                  <PasswordInput
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                    inputStyle={inputStyle}
                  />
                </div>
              </div>
            </section>

            {/* ================= ACTIONS ================= */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 bg-[#142C2C] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#9B804E] transition-all duration-300 shadow-lg shadow-[#142C2C]/20"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* ================= PASSWORD INPUT ================= */
const PasswordInput = ({ placeholder, value, onChange, show, setShow, inputStyle }) => (
  <div className="relative">
    <input
      type={show ? "text" : "password"}
      className={`${inputStyle} pr-12`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />

    <button
      type="button"
      onClick={() => setShow(!show)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#9B804E] transition-colors"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);

export default UpdateProfile;