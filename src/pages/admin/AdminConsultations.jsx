import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Calendar, User, Mail, Phone, MessageSquare, ChevronDown, CheckCircle, Clock, X, ExternalLink } from "lucide-react";

const AdminConsultations = () => {
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
            const token = localStorage.getItem("adminToken");
            const { data } = await api.get("/consultations", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setConsultations(data.consultations);
            }
        } catch (error) {
            console.error("Error fetching consultations:", error);
            toast.error("Failed to load consultations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem("adminToken");
            const { data } = await api.put(`/consultations/${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success("Status updated successfully");
                setConsultations(consultations.map(c => c._id === id ? { ...c, status: newStatus } : c));
            }
        } catch (error) {
            console.error("Error updating status:", error);
            const backendError = error.response?.data?.message || "Failed to update status";
            toast.error(`Error: ${backendError}`);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock size={12} /> Pending</span>;
            case "contacted":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1"><MessageSquare size={12} /> Contacted</span>;
            case "completed":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle size={12} /> Completed</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Consultations</h1>
                        <p className="text-gray-500 mt-1">Manage user consultation requests and bookings</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-medium">Total Requests:</span>
                        <span className="text-lg font-bold text-gray-900">{consultations.length}</span>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : consultations.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Consultations Yet</h3>
                        <p className="text-gray-500">When users book a consultation, they will appear here.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th className="p-5">Client Info</th>
                                        <th className="p-5">Service & Date</th>
                                        <th className="p-5">Message</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {consultations.map((consultation) => (
                                        <tr key={consultation._id} className="hover:bg-gray-50/50 transition-colors">

                                            {/* Client Info */}
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                                                        <User size={14} className="text-gray-400" /> {consultation.name}
                                                    </span>
                                                    <span className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                                                        <Mail size={14} className="text-gray-400" /> {consultation.email}
                                                    </span>
                                                    <span className="text-sm text-gray-500 flex items-center gap-2">
                                                        <Phone size={14} className="text-gray-400" /> {consultation.phone}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Service & Date */}
                                            <td className="p-5">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block w-fit">
                                                        {consultation.serviceType}
                                                    </span>
                                                    <span className="text-sm text-gray-600 flex items-center gap-1.5 font-medium mt-1">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {format(new Date(consultation.preferredDate), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Message */}
                                            <td className="p-5">
                                                <div className="max-w-xs">
                                                    {consultation.message ? (
                                                        <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100 cursor-help" title={consultation.message}>
                                                            {consultation.message}
                                                        </p>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">No message provided</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="p-5">
                                                {getStatusBadge(consultation.status)}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-5">
                                                <div className="flex flex-col gap-2">
                                                    <div className="relative inline-block w-36">
                                                        <select
                                                            value={consultation.status}
                                                            onChange={(e) => handleStatusChange(consultation._id, e.target.value)}
                                                            className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow cursor-pointer font-medium"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="contacted">Contacted</option>
                                                            <option value="completed">Completed</option>
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                    <button
                                                        onClick={() => openModal(consultation)}
                                                        className="w-36 py-1.5 text-blue-600 bg-blue-50 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-100"
                                                    >
                                                        <MessageSquare size={14} /> View Details
                                                    </button>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Submitted: {format(new Date(consultation.createdAt), 'MMM dd')}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* Modal for Viewing Full Details */}
            {isModalOpen && selectedConsultation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Consultation Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Submitted on {format(new Date(selectedConsultation.createdAt), 'MMMM dd, yyyy h:mm a')}</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Client Details */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4">Client Information</h3>
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
                                                <a href={`mailto:${selectedConsultation.email}`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                                                    {selectedConsultation.email} <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                                <Phone size={16} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                                <a href={`tel:${selectedConsultation.phone}`} className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1">
                                                    {selectedConsultation.phone} <ExternalLink size={12} />
                                                </a>
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
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 mb-3">Client Message</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedConsultation.message || <span className="text-gray-400 italic">No message provided</span>}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer with Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                <select
                                    value={selectedConsultation.status}
                                    onChange={async (e) => {
                                        const newStatus = e.target.value;
                                        await handleStatusChange(selectedConsultation._id, newStatus);
                                        setSelectedConsultation({ ...selectedConsultation, status: newStatus });
                                    }}
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow cursor-pointer font-medium"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={closeModal} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    Close
                                </button>
                                <a href={`mailto:${selectedConsultation.email}?subject=Reply to your Consultation Request at Sandhya Furnishing&body=Hi ${selectedConsultation.name},%0D%0A%0D%0AWe received your consultation request for ${selectedConsultation.serviceType}.%0D%0A%0D%0A---%0D%0A`}
                                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                    <Mail size={16} /> Reply via Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminConsultations;
