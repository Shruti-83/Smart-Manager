import axios from "axios";

const API = axios.create({
  baseURL:  `${import.meta.env.VITE_BACKEND_URI}/api/chat`,
  withCredentials: true, // 🔥 REQUIRED for cookies
});

// auto-attach token if present
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const getMessages = (userId) => API.get(`/messages/${userId}`);
export const getChatUsers = () => API.get("/chat-users");
export const sendFileMessage = (formData) => API.post("/send-file", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
