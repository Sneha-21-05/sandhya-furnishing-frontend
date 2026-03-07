import axios from "axios";

const api = axios.create({
  baseURL: "https://sandhya-furnishing-backend.onrender.com/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");  // token saved after login

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// =================== EMAIL VERIFICATION ===================
export const sendEmailOTP = () =>
  api.post("/users/verify-email/send");

export const verifyEmailOTP = (otp) =>
  api.post("/users/verify-email/confirm", { otp });

// =================== ONLINE PAYMENT ===================
export const createPaymentOrder = (payload) =>
  api.post("/payment/create-order", payload);

export const verifyPayment = (data) =>
  api.post("/payment/verify-payment", data);