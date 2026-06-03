import mongoose from "mongoose";

let isConnected = false; // ✅ track connection

export const connectDB = async () => {
  if (isConnected) return; // reuse existing connection
  
  const db = await mongoose.connect(process.env.MONGO_URI);
  isConnected = db.connections[0].readyState === 1;
  console.log('DB connected');
};

