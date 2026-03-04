import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // your axios instance

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/admin/login", {
        username,
        password,
      });

      if (res.data.success === true) {
        // Save token
        localStorage.setItem("adminToken", res.data.token);

        // Redirect to dashboard
        navigate("/admin");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#0b1220]">
      <div className="bg-[#101829] p-10 rounded-xl shadow-xl w-full max-w-md border border-gray-700">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">
          Admin Login
        </h1>

        {error && (
          <p className="bg-red-600 text-white p-2 rounded mb-4 text-center">
            {error}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 bg-[#0d1423] text-white border border-gray-600 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-[#0d1423] text-white border border-gray-600 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-green-600 py-3 text-white rounded hover:bg-green-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
