import React, { useEffect, useState } from "react";
import api from "../../api";
import AdminLayout from "./AdminLayout";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Edit2, Trash2, LayoutGrid } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

const ManageTypes = () => {
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories/all");
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const loadTypes = async (categoryId) => {
    if (!categoryId) {
      setTypes([]);
      return;
    }

    try {
      const res = await api.get(`/types/category/${categoryId}`);
      if (res.data.success) {
        setTypes(res.data.types);
      } else {
        setTypes([]);
      }
    } catch (err) {
      console.error("Failed to load types", err);
      setTypes([]);
    }
  };

  const openDeleteModal = (id) => {
    setTypeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await api.delete(`/types/delete/${typeToDelete}`);
      if (res.data.success) {
        setTypes((prev) => prev.filter((t) => t._id !== typeToDelete));
        setShowDeleteModal(false);
        setTypeToDelete(null);
      }
    } catch (err) {
      console.error("Failed to delete type", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTypes = types.filter(t =>
    (t.type_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-medium text-slate-800 tracking-wide">
            Manage Types
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-light">
            View, edit, and add product types for each category.
          </p>
        </div>

        {/* FILTERS & ACTIONS */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search types..."
                className="w-full bg-slate-50 border border-gray-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!selectedCategory}
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className="w-full sm:w-auto appearance-none bg-slate-50 border border-gray-200 text-slate-700 pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm cursor-pointer"
                value={selectedCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategory(val);
                  loadTypes(val);
                }}
              >
                <option value="">Select Category First</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 w-full md:w-auto">
            <div className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium shadow-sm cursor-default w-full md:w-auto select-none">
              Total Types: <span className="ml-1.5 font-bold text-slate-900">{types.length}</span>
            </div>
            <button
              onClick={() => navigate("/admin/type/add")}
              className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              Add Type
            </button>
          </div>
        </div>

        {/* GRID LAYOUT */}
        {!selectedCategory ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <LayoutGrid className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-800">No Category Selected</h3>
            <p className="text-slate-500 mt-2">Please select a category above to view its types.</p>
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <LayoutGrid className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-800">No types found</h3>
            <p className="text-slate-500 mt-2">Add your first type for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTypes.map((type) => (
              <div
                key={type._id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* IMAGE AREA */}
                <div className="relative aspect-[4/3] bg-slate-50 border-b border-slate-100 overflow-hidden">
                  {type.image_url ? (
                    <img
                      src={getImageUrl(type.image_url)}
                      alt={type.type_name}
                      className="w-full h-full object-contain p-2 bg-white group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100/50">
                      <LayoutGrid size={32} className="mb-2 opacity-40" />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 text-center px-4">No Image Provided</span>
                    </div>
                  )}

                  {/* ACTION OVERLAY (visible on hover) */}
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                    <button
                      onClick={() => navigate(`/admin/type/edit/${type._id}`)}
                      className="w-10 h-10 bg-white/95 text-blue-600 rounded-full flex items-center justify-center hover:scale-110 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                      title="Edit Type"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(type._id)}
                      className="w-10 h-10 bg-white/95 text-rose-600 rounded-full flex items-center justify-center hover:scale-110 hover:bg-rose-600 hover:text-white transition-all shadow-xl"
                      title="Delete Type"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* DETAILS AREA */}
                <div className="p-5 flex flex-col justify-center items-center text-center bg-white relative">
                  {/* Decorative top border */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-200 rounded-b-full"></div>

                  <h3 className="text-[17px] font-bold text-slate-800 line-clamp-1 mt-1 group-hover:text-purple-600 transition-colors">{type.type_name}</h3>
                  <div className="mt-2.5">
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[11px] font-bold tracking-wider uppercase border border-purple-200/60 shadow-sm">
                      Sub-Type
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Delete Type
              </h2>
              <p className="text-slate-500 text-sm">
                Are you sure you want to delete this type? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageTypes;
