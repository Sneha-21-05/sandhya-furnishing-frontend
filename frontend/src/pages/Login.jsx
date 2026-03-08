import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 This remembers where user came from
  const fromLocation = "/user/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // For Forgot Password Flow
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/users/login", {
        email,
        password,
      });

      if (res.data.token && res.data.user) {
        // ✅ Store token + user
        localStorage.setItem("token", res.data.token);    // ✔ correct key
        localStorage.setItem("user", JSON.stringify(res.data.user));

        console.log("Logged in user:", res.data.user);

        // 🔥 ROLE CHECK
        if (res.data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          // 🔥 Redirect back to where user came from
          window.location.href = "/user/dashboard";
        }

      } else {
        setError("Login failed. Please try again.");
      }

    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/forgot-password", { email });
      setInfo("OTP has been sent to your email.");
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset link. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      await api.post("/users/reset-password", {
        email,
        otp,
        newPassword
      });
      setInfo("Password reset successful. You can log in now.");
      setOtpSent(false);
      setPassword("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 font-sans text-slate-800 relative overflow-hidden">

        <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] bg-slate-300 rounded-full blur-3xl opacity-40"></div>

        <div className="w-full max-w-lg relative z-10">
          <div className="bg-white/80 backdrop-blur-xl p-10 py-12 rounded-3xl shadow-2xl shadow-slate-300/40 border border-white/60">

            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-slate-900 tracking-wide mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-500 font-light">
                Please sign in to continue.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            {info && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
                {info}
              </div>
            )}

            {otpSent ? (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <input
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none text-slate-500"
                  value={email}
                  readOnly
                />
                <input
                  type="text"
                  placeholder="6-Digit OTP"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all tracking-widest text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setNewPassword("");
                      setError("");
                      setInfo("");
                    }}
                    className="w-1/3 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 disabled:opacity-70"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Forgot Password?"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 disabled:opacity-70"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  state={{ from: location.state?.from }}
                  className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;