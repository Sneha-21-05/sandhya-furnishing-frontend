import React, { useEffect, useState, useRef } from "react";
import api from "../../api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Send, Clock, CheckCircle, Mail, MessageSquare, Maximize, Phone, User, MoreVertical, Archive, ArrowLeft } from "lucide-react";

const BACKEND_URL = "https://sandhya-furnishing-backend.onrender.com";

const AdminInquiryPremium = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inquiries, setInquiries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);

  const chatRef = useRef(null);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/uploads")) return `${BACKEND_URL}${imageUrl}`;
    return `${BACKEND_URL}/uploads/${imageUrl}`;
  };

  const loadInquiries = async () => {
    try {
      const res = await api.get("/inquiry");
      if (res.data.success) {
        setInquiries(res.data.inquiries || []);
      }
    } catch {
      console.error("Failed to load inquiries");
    }
  };

  useEffect(() => {
    loadInquiries();
    const interval = setInterval(() => {
      loadInquiries();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (id && inquiries.length > 0) {
      const found = inquiries.find((inq) => inq._id === id);
      if (found) {
        setSelected(found);
        setShowMobileList(false); // Hide list on mobile when a chat is selected
      }
    } else if (!id) {
      setSelected(null);
      setShowMobileList(true);
    }
  }, [id, inquiries]);

  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 100);
    }
  }, [selected, replyMessage]);

  const markSeen = async (inqId) => {
    try {
      await api.put(`/inquiry/mark-seen/${inqId}`, { role: "admin" });
      loadInquiries();
    } catch { }
  };

  const handleSelect = (inq) => {
    navigate(`/admin/inquiries/${inq._id}`);
    setSelected(inq);
    setShowMobileList(false);
    markSeen(inq._id);
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selected) return;

    try {
      const res = await api.put(`/inquiry/admin/message/${selected._id}`, {
        message: replyMessage,
      });

      if (res.data.success) {
        setReplyMessage("");
        setSelected(res.data.inquiry); // The backend returns the updated inquiry object
        loadInquiries(); // Fetch fresh data to guarantee sync
        toast.success("Reply sent successfully");
      }
    } catch (err) {
      console.error("ADMIN REPLY ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to send reply");
    }
  };

  const total = inquiries.length;
  const pending = inquiries.filter((i) => i.status === "pending").length;
  const completed = inquiries.filter((i) => i.status === "completed").length;
  const unread = inquiries.filter((i) => !i.seenByAdmin).length;
  const generalCount = inquiries.filter((i) => i.type === "general").length;
  const customCount = inquiries.filter((i) => i.type === "custom_size").length;

  const filteredInquiries = inquiries.filter((inq) => {
    const name = inq.name?.toLowerCase() || "";
    const email = inq.email?.toLowerCase() || "";
    const phone = inq.phone?.toLowerCase() || "";

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      phone.includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "all") return true;
    if (filter === "pending") return inq.status === "pending";
    if (filter === "completed") return inq.status === "completed";
    if (filter === "unread") return !inq.seenByAdmin;
    if (filter === "general") return inq.type === "general";
    if (filter === "custom") return inq.type === "custom_size";
    if (filter === "refurbishment") return inq.type === "refurbishment";

    return true;
  });

  const productImage =
    selected?.product_id?.images?.length > 0
      ? getImageUrl(selected.product_id.images[0])
      : null;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500 font-sans pb-10">

        {/* HEADER SECTION - Beautiful Gradient Text and Soft Shadows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 tracking-tight">
              Customer Inquiries
            </h1>
            <p className="text-slate-500 text-base mt-2 font-medium max-w-xl">
              Manage incoming customer messages, follow up on custom size requests, and provide exceptional support.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm shadow-sm hover:shadow">
              <Archive size={16} className="text-slate-400" />
              View Archived
            </button>
          </div>
        </div>

        {/* STATS ROW - Glassy cards with vibrant accents */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
          <StatCard title="Total Inquiries" value={total} active={filter === "all"} onClick={() => setFilter("all")} color="default" />
          <StatCard title="Pending" value={pending} active={filter === "pending"} onClick={() => setFilter("pending")} color="amber" icon={<Clock size={16} />} />
          <StatCard title="Resolved" value={completed} active={filter === "completed"} onClick={() => setFilter("completed")} color="emerald" icon={<CheckCircle size={16} />} />
          <StatCard title="Unread" value={unread} active={filter === "unread"} onClick={() => setFilter("unread")} color="red" icon={<Mail size={16} />} />
          <StatCard title="General" value={generalCount} active={filter === "general"} onClick={() => setFilter("general")} color="blue" icon={<MessageSquare size={16} />} />
          <StatCard title="Custom Size" value={customCount} active={filter === "custom"} onClick={() => setFilter("custom")} color="purple" icon={<Maximize size={16} />} />

          <StatCard
            title="Refurbish"
            value={inquiries.filter(i => i.type === "refurbishment").length}
            active={filter === "refurbishment"}
            onClick={() => setFilter("refurbishment")}
            color="rose"
            icon={<span className="text-xl leading-none">🛠️</span>}
          />
        </div>

        {/* MAIN LIST VIEW - Full Width */}
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col relative min-h-[60vh] max-h-[80vh]">

          {/* Search Bar */}
          <div className="p-5 border-b border-slate-100/80 bg-white/60 backdrop-blur-md sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative group w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                placeholder="Search name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100/50 border border-slate-200/60 text-slate-800 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all text-sm font-medium placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* List Wrapper - Grid layout for larger screens */}
          <div className="flex-1 overflow-y-auto stylish-scrollbar p-6 bg-slate-50/30">
            {filteredInquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center text-slate-400 h-full">
                <div className="bg-white shadow-sm p-4 rounded-full mb-3 border border-slate-100">
                  <MessageSquare size={24} className="text-slate-300" />
                </div>
                <p className="font-medium text-slate-600">No inquiries found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredInquiries.map((inq) => {
                  const leftImage =
                    inq.product_id?.images?.length > 0
                      ? getImageUrl(inq.product_id.images[0])
                      : null;

                  const isUnread = !inq.seenByAdmin;

                  return (
                    <div
                      key={inq._id}
                      onClick={() => handleSelect(inq)}
                      className="p-5 rounded-2xl cursor-pointer transition-all duration-300 relative border group bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      {isUnread && (
                        <span className="absolute top-5 right-5 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></span>
                      )}
                      <div className="flex gap-4 items-start">
                        <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm ${leftImage ? 'border border-slate-100' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400'}`}>
                          {leftImage ? (
                            <img src={leftImage} alt="product" className="w-full h-full object-cover" />
                          ) : (
                            <MessageSquare size={24} className="opacity-60" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-4 mt-0.5">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-base truncate tracking-tight ${isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                              {inq.name}
                            </p>
                          </div>

                          <p className="text-[13px] text-slate-500 truncate mb-1.5 flex items-center gap-1.5">
                            <Mail size={12} className="opacity-60" /> {inq.email}
                          </p>
                          {inq.phone && (
                            <p className="text-[13px] text-slate-500 truncate mb-2.5 flex items-center gap-1.5">
                              <Phone size={12} className="opacity-60" /> {inq.phone}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {inq.status === "pending" ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200/50 px-2 py-0.5 rounded-md uppercase tracking-wider">Pending</span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200/50 px-2 py-0.5 rounded-md uppercase tracking-wider">Resolved</span>
                            )}
                            {inq.type === "custom_size" && (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200/50 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                <Maximize size={10} /> Custom
                              </span>
                            )}
                            {inq.type === "refurbishment" && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200/50 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                🛠️ Refurbish
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-auto bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              {new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* MODAL POPUP FOR CHAT */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => {
                setSelected(null);
                navigate('/admin/inquiries');
              }}
            ></div>

            {/* Modal Content */}
            <div className="bg-[#f8fafc] w-full max-w-4xl h-[90vh] md:h-[85vh] md:rounded-[2rem] shadow-2xl flex flex-col relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-200/60">
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelected(null);
                  navigate('/admin/inquiries');
                }}
                className="absolute top-4 right-4 z-30 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              {/* INQUIRY CONTEXT HEADER */}
              <div className="px-6 md:px-8 py-5 border-b border-slate-200/80 bg-white shadow-sm z-20 pr-16 shrink-0 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-200/50 shadow-sm shrink-0">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-2xl text-slate-900 tracking-tight">
                        {selected.name}
                      </h2>
                      {selected.status === 'completed' && <CheckCircle size={18} className="text-emerald-500" />}
                    </div>
                    <div className="flex gap-4 mt-1.5 flex-wrap">
                      <p className="text-[13px] text-slate-500 flex items-center gap-1.5 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        <Mail size={14} className="text-slate-400" /> {selected.email}
                      </p>
                      {selected.phone && (
                        <p className="text-[13px] text-slate-500 flex items-center gap-1.5 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <Phone size={14} className="text-slate-400" /> {selected.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions / Product Preview */}
                {selected.product_id && (
                  <div className="self-start sm:self-center shrink-0">
                    <div
                      onClick={() => {
                        const slug = selected.product_id.category?.slug?.trim() ||
                          selected.product_id.category?.name?.trim().toLowerCase().replace(/\s+/g, "-") ||
                          selected.product_id.categoryName?.trim().toLowerCase().replace(/\s+/g, "-") ||
                          "sofa";
                        navigate(`/product/${slug}/${selected.product_id._id}`);
                      }}
                      className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-400 hover:ring-4 hover:ring-blue-50 transition-all sm:w-64 shadow-sm group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 relative group-hover:shadow-md transition-shadow">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt="product"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <MessageSquare size={16} />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {selected.product_id.name}
                        </p>
                        {selected.product_id.price !== undefined && (
                          <p className="text-[13px] text-slate-500 font-semibold mt-0.5">
                            ₹{selected.product_id.price.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ALERT BANNER for Custom Size */}
              {selected.type === "custom_size" && selected.customSize && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 md:px-8 py-3 text-[13px] border-b border-purple-200 flex items-center justify-between text-purple-900 shadow-inner z-10 shrink-0">
                  <div className="flex gap-2 items-center">
                    <div className="bg-purple-200/50 p-1.5 rounded-md shadow-sm">
                      <Maximize size={16} className="text-purple-700" />
                    </div>
                    <span className="font-medium">Customer requested custom dimensions:</span>
                    <span className="font-bold bg-white px-3 py-1 rounded-md border border-purple-200 shadow-sm text-[14px]">{selected.customSize}</span>
                  </div>
                </div>
              )}

              {/* REFURBISHMENT DETAILS PANEL */}
              {selected.type === "refurbishment" && (
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 px-6 md:px-8 py-4 border-b border-rose-200 shadow-inner z-10 shrink-0 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm tracking-wide">
                    🛠️ REFURBISHMENT REQUEST DETAILS
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Services Requested */}
                    {selected.refurbishServices?.length > 0 && (
                      <div className="bg-white/60 p-3 rounded-xl border border-rose-100 shadow-sm">
                        <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wider mb-1.5">Services Needed</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.refurbishServices.map((service, idx) => (
                            <span key={idx} className="bg-rose-100 text-rose-800 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-rose-200/50">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dimensions & Fabric */}
                    <div className="bg-white/60 p-3 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-center gap-2">
                      {selected.frameDimensions && (
                        <div>
                          <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wider mb-0.5">Approx. Dimensions</p>
                          <p className="text-sm text-slate-800 font-medium">{selected.frameDimensions}</p>
                        </div>
                      )}
                      {selected.fabricPreference && (
                        <div>
                          <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wider mb-0.5">Fabric Preference</p>
                          <p className="text-sm text-slate-800 font-medium">{selected.fabricPreference}</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Notes */}
                    {selected.additionalNotes && (
                      <div className="bg-white/60 p-3 rounded-xl border border-rose-100 shadow-sm sm:col-span-2 md:col-span-1">
                        <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wider mb-1">Additional Notes</p>
                        <p className="text-[13px] text-slate-700 leading-relaxed italic border-l-2 border-rose-300 pl-2">
                          "{selected.additionalNotes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Images */}
                  {selected.refurbishImages?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wider mb-2">Customer's Existing Frame Photos</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {selected.refurbishImages.map((img, idx) => (
                          <div key={idx} className="w-28 h-28 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(getImageUrl(img), '_blank')}>
                            <img src={getImageUrl(img)} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CHAT MESSAGES */}
              <div
                ref={chatRef}
                className="flex-1 overflow-y-auto px-4 md:px-8 py-4 pb-32 space-y-3 stylish-scrollbar scroll-smooth relative bg-slate-50/50"
                style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}
              >
                {/* Date Badge */}
                <div className="flex justify-center my-6 opacity-0 animate-in fade-in duration-700 fill-mode-forwards">
                  <span className="bg-white/80 border border-slate-200/80 text-slate-500 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm">
                    {new Date(selected.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {selected.messages?.map((msg, i) => {
                  const isAdmin = msg.sender === "admin";
                  const isFirstInGroup = i === 0 || selected.messages[i - 1].sender !== msg.sender;

                  return (
                    <div
                      key={i}
                      className={`flex flex-col animate-in slide-in-from-bottom-2 fade-in duration-300 ${isAdmin ? "items-end" : "items-start"} ${!isFirstInGroup ? "mt-1.5" : "mt-6"}`}
                    >
                      {isFirstInGroup && (
                        <span className="text-[11px] font-bold text-slate-400 mb-1.5 px-2 flex items-center gap-1.5 tracking-wide">
                          {isAdmin ? "You" : selected.name.split(' ')[0]}
                        </span>
                      )}
                      <div
                        className={`max-w-[88%] lg:max-w-[75%] px-5 py-3.5 text-[15px] shadow-sm relative group ${isAdmin
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-[1.25rem] rounded-tr-sm shadow-blue-500/20"
                          : "bg-white text-slate-800 border border-slate-200/60 rounded-[1.25rem] rounded-tl-sm shadow-slate-200/50"
                          }`}
                      >
                        {/* Triangle beak for first message in group */}
                        {isFirstInGroup && (
                          <div className={`absolute top-0 w-3 h-3 ${isAdmin ? "-right-1.5 bg-indigo-600 clip-triangle-right" : "-left-1.5 bg-white border-l border-t border-slate-200/60 clip-triangle-left"}`}></div>
                        )}

                        <p className="whitespace-pre-wrap leading-relaxed relative z-10">{msg.text}</p>

                        <div className={`text-[10px] mt-2 font-medium flex items-center justify-end gap-1 ${isAdmin ? "text-blue-200" : "text-slate-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isAdmin && <CheckCircle size={10} className="ml-1" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* REPLY INPUT ZONE - Floating modern design inside modal */}
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-12 rounded-b-[2rem] border-t border-slate-100 z-30">
                <div className="flex gap-3 max-w-4xl mx-auto bg-white p-2 mb-4 mx-4 md:mx-8 rounded-2xl md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/80 items-end transition-all focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-300 relative bg-white/90 backdrop-blur-xl">
                  <button className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors shrink-0 mb-1 ml-1 cursor-pointer">
                    <MoreVertical size={22} />
                  </button>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    placeholder="Type your reply to the customer..."
                    className="flex-1 max-h-32 min-h-[50px] bg-transparent border-0 text-slate-800 px-2 py-3.5 focus:outline-none resize-none font-medium placeholder:font-normal placeholder:text-slate-400 stylish-scrollbar text-[15px]"
                    rows={1}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-3.5 rounded-xl md:rounded-2xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center shrink-0 mb-1 mr-1"
                  >
                    <Send size={20} className={replyMessage.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL STYLES ADDED HERE FOR CONVENIENCE (Ideally in index.css) */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .stylish-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .stylish-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .stylish-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 20px;
        }
        .clip-triangle-right {
            clip-path: polygon(0 0, 0 100%, 100% 0);
        }
        .clip-triangle-left {
            clip-path: polygon(100% 0, 0 0, 100% 100%);
        }
      `}} />
    </AdminLayout >
  );
};

// HELPER FOR UNIFIED STATS - Refined for premium look
const StatCard = ({ title, value, active, onClick, color, icon }) => {
  const colorMap = {
    amber: { bg: "from-amber-50 to-orange-50/30", text: "text-amber-600", border: "border-amber-200/60", iconBg: "bg-amber-100", shadow: "shadow-amber-500/20" },
    emerald: { bg: "from-emerald-50 to-green-50/30", text: "text-emerald-600", border: "border-emerald-200/60", iconBg: "bg-emerald-100", shadow: "shadow-emerald-500/20" },
    red: { bg: "from-rose-50 to-red-50/30", text: "text-rose-600", border: "border-rose-200/60", iconBg: "bg-rose-100", shadow: "shadow-rose-500/20" },
    blue: { bg: "from-blue-50 to-indigo-50/30", text: "text-blue-600", border: "border-blue-200/60", iconBg: "bg-blue-100", shadow: "shadow-blue-500/20" },
    purple: { bg: "from-purple-50 to-fuchsia-50/30", text: "text-purple-600", border: "border-purple-200/60", iconBg: "bg-purple-100", shadow: "shadow-purple-500/20" },
    default: { bg: "from-white to-slate-50", text: "text-slate-700", border: "border-slate-200", iconBg: "bg-slate-100", shadow: "shadow-slate-500/10" },
  };

  const clr = colorMap[color] || colorMap.default;

  const selectedClasses = active
    ? `bg-gradient-to-br ${clr.bg} border-${color === 'default' ? 'slate-400' : typeof clr.text === 'string' && clr.text.split('-')[1] + '-400'} shadow-md ${clr.shadow} ring-1 ring-${color === 'default' ? 'slate-200' : typeof clr.text === 'string' && clr.text.split('-')[1] + '-200'} transform scale-[1.02] z-10`
    : `bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/50`;

  // Provide a default icon if none provided
  const displayIcon = icon || <Archive size={16} />;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-5 rounded-[1.25rem] border transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden group ${selectedClasses}`}
    >
      {/* Decorative background glow for active state */}
      {active && color !== 'default' && (
        <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20 blur-xl ${clr.iconBg}`}></div>
      )}

      <div className="flex items-center justify-between mb-3 relative z-10">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${active ? 'text-slate-800' : 'text-slate-500'}`}>{title}</p>
        <div className={`p-1.5 rounded-lg transition-colors ${active ? clr.iconBg : 'bg-slate-100 group-hover:bg-slate-200'} ${clr.text}`}>
          {displayIcon}
        </div>
      </div>
      <p className={`text-3xl font-extrabold tracking-tight relative z-10 ${active && color !== 'default' ? clr.text : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
};

export default AdminInquiryPremium;
