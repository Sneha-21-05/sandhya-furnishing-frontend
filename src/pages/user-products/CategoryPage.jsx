import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import UserLayout from "../../components/UserLayout";
import { ArrowLeft, LayoutDashboard, Grid } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

const CategoryTypes = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    window.scrollTo(0, 0);

    api
      .get(`/types/${categoryId}`)
      .then((res) => {
        setTypes(res.data.types || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch types", err);
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
              Explore our diverse collections to find the perfect style for your space.
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
          <div className="flex flex-wrap gap-8 sm:gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-100"></div>
                <div className="h-4 bg-gray-200 rounded-full w-20"></div>
              </div>
            ))}
          </div>
        ) : types.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 w-full text-center px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Grid className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#142C2C] mb-4">No Types Available</h2>
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
          <div className="flex flex-wrap gap-8 sm:gap-12">
            {types.map((type) => (
              <div
                key={type._id}
                onClick={() => navigate(`/brands/${type._id}`)}
                className="group flex flex-col items-center cursor-pointer space-y-4"
              >
                {/* Circular Image Container */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:border-[#9B804E]/30 transition-all duration-500 transform group-hover:-translate-y-1">
                  {type.image_url ? (
                    <img
                      src={getImageUrl(type.image_url)}
                      alt={type.type_name}
                      className="w-full h-full object-cover filter group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FAFAFA] text-gray-300 text-3xl font-bold group-hover:text-[#9B804E] transition-colors duration-500">
                      {type.type_name.charAt(0)}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>

                {/* Type Name */}
                <div className="text-center">
                  <p className="text-[15px] sm:text-base font-bold text-[#142C2C] group-hover:text-[#9B804E] transition-colors duration-300 max-w-[120px] leading-tight break-words">
                    {type.type_name}
                  </p>
                  <div className="w-6 h-1 bg-[#142C2C]/10 rounded-full mx-auto mt-2 group-hover:bg-[#9B804E] transition-colors duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </UserLayout>
  );
};

export default CategoryTypes;
