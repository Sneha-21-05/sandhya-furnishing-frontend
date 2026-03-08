import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocation = location.state?.from;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempUserId, setTempUserId] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword
    ) {
      setMessage("Please fill all fields.");
      setMessageType("error");
      return;
    }

    if (!passwordRegex.test(form.password)) {
      setMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      setMessageType("error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/users/send-signup-otp", {
        fullname: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      if (res.data.success) {
        setTempUserId(res.data.tempUserId);
        setShowOTP(true);
        setMessage(res.data.message || "OTP sent to your email.");
        setMessageType("success");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed. Please try again.";

      setMessage(msg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!otp || otp.length < 6) {
      setMessage("Please enter a valid 6-digit OTP.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/users/verify-signup-otp", {
        tempUserId,
        otp,
      });

      setMessage("Account verified! Redirecting to login...");
      setMessageType("success");

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setOtp("");
      setShowOTP(false);

      setTimeout(() => {
        navigate("/login", { state: { from: fromLocation } });
      }, 1500);

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", { state: { from: fromLocation } });
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed. Please try again.";

      setMessage(msg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 font-sans text-slate-800 relative overflow-hidden">

        {/* Decorative Background Glow */}
        <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] bg-slate-300 rounded-full blur-3xl opacity-40"></div>

        {/* Signup Card */}
        <div className="w-full max-w-lg relative z-10">
          <div className="bg-white/80 backdrop-blur-xl p-10 py-12 rounded-3xl shadow-2xl shadow-slate-300/40 border border-white/60">

            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-slate-900 tracking-wide mb-2">
                Create Account
              </h2>
              <p className="text-gray-500 font-light">
                Join the Sandhya Furnishing family.
              </p>
            </div>

            {message && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm border ${messageType === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-600 border-red-100"
                  }`}
              >
                {message}
              </div>
            )}

            {!showOTP ? (
              <form onSubmit={handleSignup} className="space-y-5">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 disabled:opacity-70"
                >
                  {loading ? "Sending OTP..." : "Get OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center mb-4">
                  <p className="text-sm font-semibold text-slate-600">
                    We sent a 6-digit code to <span className="text-blue-600 font-bold">{form.email}</span>
                  </p>
                </div>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-Digit Verification Code"
                  className="w-full text-center tracking-widest text-2xl font-bold bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={{ from: fromLocation }}
                  className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default Signup;