// api/auth.js
import axios from "axios";

const API = axios.create({
  baseURL:  `${import.meta.env.VITE_BACKEND_URI}/api/auth`,
  withCredentials: false, // 🔥 REQUIRED for cookies
});

export const loginUser = (data) => API.post("/login", data);
export const registerUser = (data) => API.post("/register", data);
export const logoutUser = () => API.post("/logout");
export const checkEmail = (data) => API.post("/check-email", data);
export const sendOtp = (data) => API.post("/send-otp", data);
export const verifyOtp = (data) => API.post("/verify-otp", data);
// API/User.js
export const getUsers = () => API.get("/users");