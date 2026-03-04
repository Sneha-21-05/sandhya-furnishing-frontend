import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Calendar, Phone, CheckCircle, Clock, MessageSquare, X, User, Mail, ExternalLink } from "lucide-react";

const UserConsultations = () => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (consultation) => {
        setSelectedConsultation(consultation);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedConsultation(null);
        setIsModalOpen(false);
    };

    const fetchConsultations = async () => {
        try {
            const token = localStorage.getItem("userToken");
            const { data } = await api.get("/consultations/user", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setConsultations(data.consultations);
            }
        } catch (error) {
            console.error("Error fetching consultations:", error);
            toast.error("Failed to load your consultations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center w-fit gap-1"><Clock size={12} /> Pending</span>;
            case "contacted":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center w-fit gap-1"><MessageSquare size={12} /> Contacted</span>;
            case "completed":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center w-fit gap-1"><CheckCircle size={12} /> Completed</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 flex items-center w-fit gap-1">{status}</span>;
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#142C2C]"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="animate-in fade-in duration-500">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Consultations</h1>
                    <p className="text-gray-500 mt-2">Track your consultation requests and their statuses.</p>
                </div>

                {consultations.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Consultations Yet</h3>
                        <p className="text-gray-500 mb-6">
                            You haven't requested any consultations. Book a consultation for expert advice tailored to your needs.
                        </p>
                        <a href="/book-consultation" className="inline-block bg-[#142C2C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1f4242] transition-colors">
                            Book a Consultation
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {consultations.map((consultation) => (
                            <div key={consultation._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                                {/* Decorative Accent */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#142C2C] to-[#9B804E] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-sm font-semibold text-[#142C2C] bg-[#142C2C]/5 px-3 py-1 rounded-md">
                                        {consultation.serviceType}
                                    </span>
                                    {getStatusBadge(consultation.status)}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-1" title={consultation.name}>
                                    For: {consultation.name}
                                </h3>

                                <div className="space-y-3 mb-6 flex-1">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Calendar size={16} className="text-[#9B804E]" />
                                        <span>Preferred: <span className="font-medium text-gray-900">{format(new Date(consultation.preferredDate), 'MMM dd, yyyy')}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone size={16} className="text-[#9B804E]" />
                                        <span>Contact: <span className="font-medium text-gray-900">{consultation.phone}</span></span>
                                    </div>

                                    {consultation.message && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic line-clamp-3">
                                            "{consultation.message}"
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                                    <span className="text-xs text-gray-400">
                                        Requested on {format(new Date(consultation.createdAt), 'MMM dd, yyyy')}
                                    </span>
                                    <button
                                        onClick={() => openModal(consultation)}
                                        className="text-[#142C2C] bg-[#142C2C]/5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#142C2C]/10 transition-colors flex items-center gap-1.5 border border-[#142C2C]/10"
                                    >
                                        <MessageSquare size={12} /> View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Viewing Full Details */}
            {isModalOpen && selectedConsultation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Consultation Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Submitted on {format(new Date(selectedConsultation.createdAt), 'MMMM dd, yyyy h:mm a')}</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="hidden sm:flex flex-col items-end text-sm">
                                    <span className="text-gray-500 font-medium whitespace-nowrap">Need help? Contact Admin</span>
                                    <div className="text-[#142C2C] font-semibold flex items-center gap-1 mt-0.5">
                                        <Phone size={12} /> +91 8097258655
                                    </div>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full shrink-0">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Client Details */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4">Your Contact Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <User size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Full Name</p>
                                                <p className="text-sm font-medium text-gray-900">{selectedConsultation.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                                <Mail size={16} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Email Address</p>
                                                <p className="text-sm font-medium text-gray-900">{selectedConsultation.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                                <Phone size={16} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                                <p className="text-sm font-medium text-gray-900">{selectedConsultation.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Request Details */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4">Request Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                                <MessageSquare size={16} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Service Type</p>
                                                <p className="text-sm font-medium text-gray-900">{selectedConsultation.serviceType}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                                <Calendar size={16} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Preferred Date</p>
                                                <p className="text-sm font-medium text-gray-900">{format(new Date(selectedConsultation.preferredDate), 'MMMM dd, yyyy')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                <Clock size={16} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Current Status</p>
                                                <div className="mt-1">
                                                    {getStatusBadge(selectedConsultation.status)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message Block */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 mb-3">Your Message</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedConsultation.message || <span className="text-gray-400 italic">No message provided</span>}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer with Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex sm:hidden justify-between items-center">
                            <div className="flex flex-col text-xs">
                                <span className="text-gray-500 font-medium">Need help?</span>
                                <div className="text-[#142C2C] font-semibold">
                                    +91 98765 43210
                                </div>
                            </div>
                            <button onClick={closeModal} className="px-5 py-2 text-sm font-medium text-white bg-[#142C2C] rounded-lg hover:bg-[#1f4242] transition-colors">
                                Close Details
                            </button>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 hidden sm:flex justify-end">
                            <button onClick={closeModal} className="px-5 py-2 text-sm font-medium text-white bg-[#142C2C] rounded-lg hover:bg-[#1f4242] transition-colors">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default UserConsultations;
