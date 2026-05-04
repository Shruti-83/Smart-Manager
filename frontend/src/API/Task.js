import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URI}/api/tasks`,
  withCredentials: true, // 🔥 REQUIRED for cookies
});
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export const getComments = (taskId) => API.get(`/${taskId}/comments`);
export const addComment = (taskId, text) => API.post(`/${taskId}/comments`, { text });
export const deleteComment = (taskId, commentId) => API.delete(`/${taskId}/comments/${commentId}`);
export const logTask = () => API.get("/my-tasks");

export const createTask = (data) =>
  API.post("/create-task", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateTaskStatus = (id, status) =>
  API.put(`/update-status/${id}`, { status });