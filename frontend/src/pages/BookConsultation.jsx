import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Calendar, User, Mail, Phone, MessageSquare, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";

const BookConsultation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const storedUserStr = localStorage.getItem("user");
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};

    const [formData, setFormData] = useState({
        name: storedUser.fullname || storedUser.name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        serviceType: "General Consultation",
        preferredDate: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.message.trim()) {
            toast.error("Please enter additional details.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("userToken");

            const { data } = await api.post(
                "/consultations",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                toast.success(data.message || "Consultation booked successfully!");

                setFormData({
                    ...formData,
                    preferredDate: "",
                    message: "",
                });

                    setTimeout(() => navigate("/user/dashboard"), 2000);
            }

        } catch (error) {
            console.error("Booking error:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to book consultation. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#faf7f2] font-sans pb-24 pt-12 md:pt-20">
                <div className="max-w-4xl mx-auto px-6">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-light text-[#142C2C] tracking-wide mb-4">
                            Book a Consultation
                        </h1>
                        <p className="text-gray-600 font-light text-lg max-w-2xl mx-auto">
                            Schedule a personalized session with our design experts to bring your vision to life.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">

                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#142C2C] uppercase tracking-wider">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            readOnly
                                            value={formData.name}
                                            className="w-full bg-gray-50 border border-gray-200 text-black font-medium text-[15px] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#142C2C] uppercase tracking-wider">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            readOnly
                                            value={formData.email}
                                            className="w-full bg-gray-50 border border-gray-200 text-black font-medium text-[15px] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#142C2C] uppercase tracking-wider">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            readOnly
                                            value={formData.phone}
                                            className="w-full bg-gray-50 border border-gray-200 text-black font-medium text-[15px] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Service Type */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#142C2C] uppercase tracking-wider">
                                        Service of Interest <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="serviceType"
                                            value={formData.serviceType}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 text-black font-medium text-[15px] rounded-xl pl-4 pr-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#9B804E]/30 focus:border-[#9B804E]/50 appearance-none cursor-pointer"
                                        >
                                            <option value="General Consultation">General Consultation</option>
                                            <option value="Curtains & Drapes">Curtains & Drapes</option>
                                            <option value="Sofa Customization">Sofa Customization</option>
                                            <option value="Mattress & Bedding">Mattress & Bedding</option>
                                            <option value="Wooden Flooring">Wooden Flooring</option>
                                            <option value="Full Home Interior">Full Home Interior</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Preferred Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#142C2C] uppercase tracking-wider">
                                    Preferred Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="preferredDate"
                                        required
                                        value={formData.preferredDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="w-full bg-gray-50 border border-gray-200 text-black font-medium text-[15px] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#9B804E]/30 focus:border-[#9B804E]/50"
                                    />
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#142C2C] uppercase tracking-wider">
                                    Additional Details <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        required
                                        placeholder="Tell us a bit about your project..."
                                        className="w-full bg-gray-50 border border-gray-200 text-black font-medium text-[15px] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#9B804E]/30 focus:border-[#9B804E]/50 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 bg-[#142C2C] hover:bg-[#9B804E] text-white text-[15px] font-semibold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-lg shadow-[#142C2C]/20 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Booking..." : "Confirm Consultation Booking"}
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookConsultation;