import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { Send, MessageSquare, Check, CheckCheck, CircleDashed, ArrowLeft, X } from "lucide-react";

const BACKEND_URL = "https://sandhya-furnishing-backend.onrender.com";

const UserInquiryList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const endRef = useRef();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!email) return;
    api.get(`/inquiry/user/${email}`).then((res) => {
      setInquiries(res.data.inquiries || []);
    });
  }, [email]);

  /* ================= MARK SEEN ================= */
  useEffect(() => {
    if (!selected) return;

    api.put(`/inquiry/mark-seen/${selected._id}`, { role: "user" });

    // Slight delay to ensure render happens before scroll
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [selected, selected?.messages?.length]); // also trigger when new message comes

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || !selected) return;

    const res = await api.put(`/inquiry/user/message/${selected._id}`, {
      message,
    });

    setSelected(res.data.inquiry);
    setInquiries((prev) =>
      prev.map((i) => (i._id === selected._id ? res.data.inquiry : i))
    );
    setMessage("");
  };

  /* ================= GET PRODUCT IMAGE ================= */
  const getImage = (product) => {
    if (!product) return null;

    if (product.image_url) return BACKEND_URL + product.image_url;

    if (product.images?.length > 0)
      return product.images[0].startsWith("http")
        ? product.images[0]
        : BACKEND_URL + product.images[0];

    return "/no-image.png";
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/uploads")) return `${BACKEND_URL}${imageUrl}`;
    return `${BACKEND_URL}/uploads/${imageUrl}`;
  };

  /* ================= PRODUCT DETAILS REDIRECT ================= */

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-[1200px] mx-auto w-full h-[calc(100vh-80px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ================= HEADER ================= */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 gap-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#142C2C] tracking-tight mb-2 flex items-center gap-3">
              <MessageSquare className="text-[#9B804E]" size={32} />
              My Inquiries
            </h1>
            <p className="text-gray-500 text-[15px] max-w-lg">
              Track and manage all your product-related conversations with our support team.
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-0">

          {/* ================= LIST PANEL ================= */}
          <div className="w-full flex flex-col bg-[#FAFAFA] flex-1">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-[#142C2C] flex items-center gap-2">
                Conversations
              </h2>
              <span className="bg-[#142C2C] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {inquiries.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar content-start">
              {inquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                  <CircleDashed size={32} className="text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No ongoing inquiries.</p>
                </div>
              ) : (
                inquiries.map((inq) => {
                  const imageUrl = getImage(inq.product_id);
                  const lastMessage = inq.messages?.[inq.messages.length - 1];
                  const isSelected = selected?._id === inq._id;
                  const hasUnread = !inq.seenByUser;

                  return (
                    <div
                      key={inq._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelected(inq);
                      }}
                      className={`relative z-10 p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-start gap-4 ${isSelected
                        ? "bg-white shadow-md border border-gray-100 ring-1 ring-[#9B804E]"
                        : "hover:bg-white border border-transparent hover:shadow-sm"
                        }`}
                    >
                      <div className="relative flex-shrink-0 w-16 h-16 bg-[#F5F5F5] rounded-xl p-2 overflow-hidden border border-gray-200 items-center justify-center flex">
                        <img
                          src={imageUrl}
                          className="w-full h-full object-contain mix-blend-multiply"
                          alt="Product"
                        />
                        {hasUnread && (
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#9B804E] rounded-full ring-2 ring-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1.5">
                          <p className={`text-[15px] font-bold truncate pr-2 ${hasUnread ? 'text-[#142C2C]' : 'text-gray-900'}`}>
                            {inq.product_id?.product_name || inq.product_id?.name || "Unknown Product"}
                          </p>
                        </div>
                        <p className={`text-sm truncate ${hasUnread ? 'text-[#142C2C] font-semibold' : 'text-gray-700 font-medium'}`}>
                          {lastMessage ? (
                            <>
                              {lastMessage.sender === "user" ? "You: " : ""}
                              {lastMessage.text}
                            </>
                          ) : (
                            "No messages yet"
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>


          {/* ================= INQUIRY MODAL ================= */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#142C2C]/40 backdrop-blur-sm animate-in fade-in duration-300">
              <div
                className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-300 relative border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                {/* MODAL HEADER */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 bg-white sticky top-0 z-10">
                  <div className="w-16 h-16 bg-[#FAFAFA] rounded-xl p-2 flex-shrink-0 border border-gray-200 flex items-center justify-center shadow-sm">
                    <img
                      src={getImage(selected.product_id)}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      alt="Product"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#142C2C] text-xl truncate mb-1">
                      {selected.product_id?.product_name || selected.product_id?.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
                      <span className="text-gray-400">Status:</span>
                      <span className={`${selected.status === 'resolved' ? 'text-green-600' : 'text-[#9B804E]'}`}>
                        {selected.status}
                      </span>
                      {selected.type === "refurbishment" && (
                        <>
                          <span className="text-gray-300 mx-1">|</span>
                          <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            Refurbishment
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelected(null)}
                    className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm ml-auto"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* MODAL MESSAGES */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAFA]/50 custom-scrollbar">

                  {/* REFURBISHMENT DETAILS HEADER */}
                  {selected.type === "refurbishment" && selected.refurbishImages?.length > 0 && (
                    <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-sm mb-6 flex flex-col gap-3">
                      <h4 className="text-[13px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Uploaded Frame Photos
                      </h4>
                      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {selected.refurbishImages.map((img, idx) => (
                          <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                            <img src={getImageUrl(img)} alt="frame" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.messages?.map((m, i) => {
                    const isUser = m.sender === "user";
                    return (
                      <div
                        key={i}
                        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-6 py-3.5 text-[15px] shadow-sm leading-relaxed ${isUser
                              ? "bg-[#142C2C] text-white rounded-t-3xl rounded-bl-3xl"
                              : "bg-white border border-gray-200 shadow-sm text-gray-800 rounded-t-3xl rounded-br-3xl"
                              }`}
                          >
                            {m.text}
                          </div>

                          {isUser && (
                            <div className="flex items-center gap-1 mt-1.5 px-2">
                              <span className="text-[10px] uppercase tracking-widest text-[#9B804E] font-bold">
                                {m.seen ? "Read" : "Sent"}
                              </span>
                              {m.seen ? (
                                <CheckCheck size={12} className="text-[#9B804E]" />
                              ) : (
                                <Check size={12} className="text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} className="h-4" />
                </div>

                {/* MODAL CHAT INPUT */}
                <div className="p-4 sm:p-5 bg-white border-t border-gray-100 rounded-b-[2rem]">
                  <form
                    onSubmit={sendMessage}
                    className="flex items-end gap-3 bg-[#FAFAFA] p-3 rounded-3xl border border-gray-200 focus-within:border-[#9B804E]/30 focus-within:ring-4 focus-within:ring-[#9B804E]/10 transition-all shadow-inner"
                  >
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 bg-transparent border-none resize-none px-4 py-2 sm:py-3 focus:outline-none text-[15px] text-gray-800 min-h-[44px] sm:min-h-[52px] max-h-[120px] custom-scrollbar"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="w-12 h-12 rounded-full bg-[#142C2C] text-white hover:bg-[#9B804E] transition-all duration-300 shadow-md disabled:opacity-50 disabled:hover:bg-[#142C2C] flex items-center justify-center flex-shrink-0"
                    >
                      <Send size={18} className="translate-x-[2px]" />
                    </button>
                  </form>
                  <p className="text-[11px] text-center text-gray-400 mt-3 hidden sm:block">
                    Press <span className="font-bold">Enter</span> to send, <span className="font-bold">Shift+Enter</span> for new line.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserInquiryList;
