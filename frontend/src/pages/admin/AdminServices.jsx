import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import AdminLayout from "./AdminLayout";
import { Plus, Edit2, Trash2 } from "lucide-react";

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      const res = await api.get("/services/all", {
        headers: {
          Authorization: localStorage.getItem("adminToken"),
        },
      });

      if (res.data.success) {
        setServices(res.data.services);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/services/delete/${id}`, {
        headers: {
          Authorization: localStorage.getItem("adminToken"),
        },
      });

      // Refresh list after delete
      fetchServices();
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-medium text-slate-800 tracking-wide">
              Manage Services
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-light">
              Create and manage all custom services offered to users.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/service/add")}
            className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors duration-300 font-medium text-sm tracking-wide shadow-md shadow-slate-900/10"
          >
            <Plus size={18} />
            Add Service
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (Starting At)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-light">
                      No services found. Add your first service to get started.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {service.service_name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        ₹{service.price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p className="line-clamp-2 max-w-md" title={service.description}>
                          {service.description || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() =>
                              navigate(`/admin/service/edit/${service._id}`)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Edit Service"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(service._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Delete Service"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
