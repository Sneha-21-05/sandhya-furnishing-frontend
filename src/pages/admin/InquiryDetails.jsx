import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";

const InquiryDetails = () => {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);

  /* LOAD INQUIRY */
  useEffect(() => {
    api.get("/inquiry").then((res) => {
      const found = res.data.inquiries.find((i) => i._id === id);
      setInquiry(found);
    });
  }, [id]);

  /* MARK USER MESSAGES AS SEEN */
  useEffect(() => {
    if (!inquiry) return;

    api.put(`/inquiry/mark-messages-seen/${id}`, {
      role: "admin",
    });

    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [inquiry, id]);

  /* SEND ADMIN REPLY */
  const sendReply = async () => {
    if (!message.trim()) return;

    const res = await api.put(`/inquiry/admin/message/${id}`, {
      message,
    });

    if (res.data.success) {
      setInquiry(res.data.inquiry);
      setMessage("");
    }
  };

  if (!inquiry) {
    return <p className="p-6">Loading inquiry...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#faf7f2] rounded-xl shadow">
      {/* HEADER */}
      <div className="flex gap-4 border-b pb-4 mb-4">
        <img
          src={`http://localhost:5000${inquiry.product_id?.image_url}`}
          className="w-20 h-20 rounded object-cover"
        />
        <div>
          <h2 className="text-2xl font-semibold">
            {inquiry.product_id?.product_name}
          </h2>
          <p className="text-sm text-gray-600">{inquiry.email}</p>
          <p className="text-sm">
            Status: <b>{inquiry.status}</b>
          </p>
        </div>
      </div>

      {/* CHAT */}
      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
        {inquiry.messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[70%] px-4 py-2 rounded-xl text-sm
              ${
                m.sender === "admin"
                  ? "ml-auto bg-[#d4f3dc]"
                  : "mr-auto bg-[#e6d3b1]"
              }`}
          >
            {m.text}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(m.createdAt).toLocaleTimeString()} •{" "}
              {m.sender === "admin"
                ? m.seen
                  ? "✔✔ Seen"
                  : "✔ Sent"
                : ""}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Reply to user..."
          className="flex-1 border rounded-lg px-4 py-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={sendReply}
          className="bg-black text-white px-5 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InquiryDetails;
