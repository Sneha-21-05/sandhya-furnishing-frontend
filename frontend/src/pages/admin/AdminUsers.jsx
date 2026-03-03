import React, { useEffect, useState } from "react";
import api from "../../api";
import AdminLayout from "./AdminLayout";
import { Users } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.get("/users/admin/all", {
        headers: { Authorization: token },
      });

      if (res.data.success) {
        setUsers(res.data.users);
        setCount(res.data.count);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-medium text-slate-800 tracking-wide">All Users</h1>
            <p className="text-slate-500 text-sm mt-1 font-light">View and manage all registered customers.</p>
          </div>

          <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-lg border border-blue-100 shadow-sm font-medium">
            <Users size={18} />
            Total Users: {count}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">

              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-light">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-medium">
                            {user.firstName ? user.firstName[0].toUpperCase() : (user.fullname ? user.fullname[0].toUpperCase() : 'U')}
                          </div>
                          <span className="font-medium text-slate-800">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.fullname || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-slate-600">{user.phone || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
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

export default AdminUsers;
