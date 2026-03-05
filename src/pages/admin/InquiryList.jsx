import React, { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtils";

const InquiryList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = () => {
    api.get("/inquiry").then((res) => {
      if (res.data?.success) {
        setInquiries(res.data.inquiries);
      }
    });
  };

  const total = inquiries.length;
  const pending = inquiries.filter((i) => i.status === "pending").length;
  const completed = inquiries.filter((i) => i.status === "completed").length;

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(search.toLowerCase()) ||
      inq.email.toLowerCase().includes(search.toLowerCase()) ||
      inq.product_id?.product_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ? true : inq.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 bg-[#faf7f2] min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Customer Inquiries</h1>

      {/* SUMMARY BAR */}
      <div className="flex gap-6 mb-6 text-sm">
        <div className="bg-white px-4 py-2 rounded-lg shadow">
          Total: <span className="font-semibold">{total}</span>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow">
          Pending: <span className="font-semibold text-amber-600">{pending}</span>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow">
          Completed: <span className="font-semibold text-green-600">{completed}</span>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email or product..."
          className="px-4 py-2 border rounded-lg w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded-lg"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* INQUIRY LIST */}
      <div className="bg-white rounded-xl shadow divide-y">
        {filteredInquiries.map((inq) => (
          <div
            key={inq._id}
            className="grid grid-cols-[90px_1fr_auto] gap-4 items-center p-4
              transition hover:bg-[#fffaf0] hover:shadow-sm"
          >
            {/* PRODUCT IMAGE */}
            <div className="relative group">
              <img
                src={getImageUrl(inq.product_id?.image_url)}
                alt={inq.product_id?.product_name}
                className="w-16 h-16 rounded-lg object-cover border
                  transition-transform duration-300 group-hover:scale-105"
              />
              {!inq.seen && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
              )}
            </div>

            {/* DETAILS */}
            <div>
              <p className="font-medium">{inq.name}</p>
              <p className="text-xs text-gray-500">{inq.email}</p>

              <p className="text-sm mt-1">
                <span className="text-gray-500">Product:</span>{" "}
                {inq.product_id?.product_name}
              </p>

              <span
                className={`inline-block mt-2 text-xs px-3 py-1 rounded-full
                  ${inq.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
                  }`}
              >
                {inq.status}
              </span>
            </div>

            {/* VIEW */}
            <Link
              to={`/admin/inquiries/${inq._id}`}
              className="text-blue-600 font-medium whitespace-nowrap hover:underline"
            >
              View →
            </Link>
          </div>
        ))}

        {filteredInquiries.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No inquiries found.
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryList;
