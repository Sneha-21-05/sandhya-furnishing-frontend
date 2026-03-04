import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Package } from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      const res = await api.get("/products/admin/all", {
        headers: {
          Authorization: localStorage.getItem("adminToken"),
        },
      });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      await api.delete(`/products/admin/delete/${id}`, {
        headers: {
          Authorization: localStorage.getItem("adminToken"),
        },
      });
      loadProducts();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category_id?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">

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
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full md:max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by product name or category..."
              className="w-full bg-slate-50 border border-gray-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate("/admin/product/add")}
            className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm gap-2"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
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
                        {p.image_url ? (
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white">
                            <img
                              src={`http://localhost:5000${p.image_url}`}
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
                        <p className="text-slate-800 font-medium">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p.brand_id?.brand_name ? `Brand: ${p.brand_id.brand_name}` : "Unbranded"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {p.category_id?.name || "-"}
                          </span>
                          {p.type_id?.type_name && (
                            <span className="text-xs text-slate-500 font-medium pl-1">
                              • {p.type_id.type_name}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ₹{p.price?.toLocaleString() || "0"}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/product/edit/${p._id}`)}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-medium transition-colors mr-2"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteProduct(p._id)}
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
    </AdminLayout>
  );
};

export default AdminProducts;
