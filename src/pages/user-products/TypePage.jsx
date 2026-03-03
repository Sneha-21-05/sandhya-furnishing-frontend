import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import UserLayout from "../../components/UserLayout";
import { ArrowLeft, LayoutDashboard, Layers } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const TypePage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH TYPES BY CATEGORY ================= */
  useEffect(() => {
    if (!categoryId) return;
    window.scrollTo(0, 0);

    api
      .get(`/types/category/${categoryId}`)
      .then((res) => {
        if (res.data?.success) {
          setTypes(res.data.types || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch types:", err);
        setLoading(false);
      });
  }, [categoryId]);

  return (
    <UserLayout>
      <main className="flex-1 p-6 sm:p-10 max-w-[1400px] w-full mx-auto">

        {/* ================= HEADER ACTIONS ================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#142C2C] tracking-tight mb-2">
              Select Type
            </h1>
            <p className="text-gray-500 text-[15px] max-w-lg">
              Browse through our specialized collections carefully curated for your space.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 py-2.5 px-5 bg-white text-gray-600 hover:text-[#142C2C] hover:bg-gray-50 rounded-xl font-semibold text-sm shadow-sm border border-gray-100 transition-all"
            >
              <ArrowLeft size={18} /> Back
            </button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="bg-gray-100 rounded-2xl aspect-[4/3] w-full"></div>
                <div className="h-5 bg-gray-200 rounded-full w-2/3 mx-auto mt-2 mb-2"></div>
              </div>
            ))}
          </div>
        ) : types.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 w-full text-center px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Layers className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#142C2C] mb-4">No Styles Found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-10 text-[15px] leading-relaxed">
              We couldn't find any specific styles for this category at the moment. Please check back later.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3.5 bg-[#142C2C] text-white font-medium rounded-xl hover:bg-[#9B804E] transition-colors shadow-md"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {types.map((type) => (
              <div
                key={type._id}
                onClick={() => navigate(`/products/${type._id}`)}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#9B804E]/30 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer p-4 text-center"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full bg-[#FAFAFA] rounded-2xl overflow-hidden p-6 flex items-center justify-center mb-5 group-hover:bg-gray-50 transition-colors duration-500">
                  {type.image_url ? (
                    <img
                      src={`${BACKEND_URL}${type.image_url}`}
                      alt={type.type_name}
                      className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply drop-shadow-sm"
                    />
                  ) : (
                    <div className="text-gray-300 font-serif italic text-lg">
                      No Image
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
                </div>

                {/* Type Details */}
                <div className="px-3 pb-3">
                  <h3 className="text-lg font-bold text-[#142C2C] group-hover:text-[#9B804E] transition-colors duration-300">
                    {type.type_name}
                  </h3>
                  <div className="w-8 h-1 bg-[#142C2C]/10 rounded-full mx-auto mt-3 group-hover:bg-[#9B804E] transition-colors duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </UserLayout>
  );
};

export default TypePage;
