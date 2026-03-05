import React, { useEffect, useState } from "react";
import api from "../../api";
import AdminLayout from "./AdminLayout";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Filter, Plus, Edit2, Trash2, Package } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  /* ================= DELETE MODAL ================= */

  const openDeleteModal = (id) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      await api.delete(`/products/delete/${productToDelete}`);

      toast.success("Product deleted successfully");

      setShowDeleteModal(false);
      setProductToDelete(null);

      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === "All" ||
      (p.category?.name || p.category || "").toLowerCase().trim() === filterCategory.toLowerCase().trim();

    const matchesSearch = searchTerm === "" ||
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-medium text-slate-800 tracking-wide">
            Manage Products
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-light">
            View, edit, and add products to your catalog.
          </p>
        </div>

        {/* FILTERS & ACTIONS */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products by name..."
                className="w-full bg-slate-50 border border-gray-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className="w-full sm:w-auto appearance-none bg-slate-50 border border-gray-200 text-slate-700 pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm cursor-pointer"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Curtains">Curtains</option>
                <option value="Sofa">Sofa</option>
                <option value="Wooden Flooring">Wooden Flooring</option>
                <option value="Mattress">Mattress</option>
                <option value="Bedding">Bedding</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
            <div className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium shadow-sm cursor-default self-end lg:self-auto select-none">
              Total Products: <span className="ml-1.5 font-bold text-slate-900">{products.length}</span>
            </div>
            <button
              onClick={() => navigate("/admin/products/add")}
              className="w-full lg:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Image</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category & Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-light">
                      No products match your current filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {p.images?.length ? (
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white">
                            <img
                              src={getImageUrl(p.images[0])}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-slate-100 flex flex-col items-center justify-center border border-dashed border-gray-300 text-slate-400">
                            <Package size={16} className="mb-1" opacity={0.5} />
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-slate-800 font-medium whitespace-nowrap lg:whitespace-normal">
                          {p.name || "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {p.category?.name || p.category || "—"}
                          </span>
                          {p.type && (
                            <span className="text-xs text-slate-500 font-medium pl-1">
                              • {p.type?.type_name || p.type}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ₹{p.price?.toLocaleString() || "—"}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-medium transition-colors mr-2"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(p._id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{filteredProducts.length}</span> results
            </span>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Delete Product
              </h2>
              <p className="text-slate-500 text-sm">
                Are you sure you want to delete this product? This action cannot be undone.
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

export default ManageProducts;
