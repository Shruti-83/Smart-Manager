// socket.js
import { io } from "socket.io-client";

console.log("Backend URL:", import.meta.env.VITE_BACKEND_URI); // check this

export const socket = io(import.meta.env.VITE_BACKEND_URI, {
  withCredentials: true
});