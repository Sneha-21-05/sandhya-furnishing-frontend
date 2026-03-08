import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const navigate = useNavigate();

    // View state: 1 = Enter Email, 2 = Enter OTP + New Password
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter your registered email address.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/users/forgot-password", { email });
            toast.success(res.data.message || "OTP sent to your email!");
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (!otp || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/users/reset-password", {
                email,
                otp,
                newPassword
            });

            toast.success(res.data.message || "Password reset successfully!");
            navigate("/login");
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
                {/* Decorative Background Blobs */}
                <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-40"></div>
                <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] bg-slate-300 rounded-full blur-3xl opacity-40"></div>

                <div className="w-full max-w-lg relative z-10">
                    <div className="bg-white/80 backdrop-blur-xl p-10 py-12 rounded-3xl shadow-2xl shadow-slate-300/40 border border-white/60">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-light text-slate-900 tracking-wide mb-2">
                                {step === 1 ? "Forgot Password" : "Reset Password"}
                            </h2>
                            <p className="text-gray-500 font-light">
                                {step === 1
                                    ? "Enter your email to receive a 6-digit confirmation code."
                                    : `Enter the code sent to ${email} and your new password.`}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
                                {error}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleSendOTP} className="space-y-5">
                                <input
                                    type="email"
                                    placeholder="Registered Email Address"
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    readOnly={loading}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 mt-6 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-70"
                                >
                                    {loading ? "Sending OTP..." : "Get OTP"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <input
                                    type="text"
                                    placeholder="6-Digit OTP Code"
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all text-center tracking-widest font-semibold"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 mt-6 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-70"
                                >
                                    {loading ? "Resetting Password..." : "Confirm Password Reset"}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 text-sm">
                                Remembered your password?{" "}
                                <Link
                                    to="/login"
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

export default ForgotPassword;
