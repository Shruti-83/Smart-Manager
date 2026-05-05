import { useState } from "react";
import { loginUser } from "../API/Auth.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";



export default function LoginModal({ onClose, openRegister ,onLoginSuccess}) {
   const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

 const handleLogin = async () => {
  if (loading) return;

  if (!email || !password) {
    toast.error("All fields are required");
    return;
  }

  try {
    setLoading(true);
    console.log("Login API called");

    const { data } = await loginUser({ email, password });

    localStorage.setItem("user", JSON.stringify(data)); // data already has token at top level

    toast.dismiss();
    toast.success("Login successful!");

    onLoginSuccess(data); // ✅// 🔥 pass user
    onClose();

  } catch (err) {
    toast.dismiss();
    toast.error(err.response?.data?.message || "Invalid credentials");
  } finally {
    setLoading(false);
  }
};
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white text-black p-6 rounded-xl w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>

       <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="input input-bordered w-full mb-3"
/>


       <input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="input input-bordered w-full mb-3"
/>

  <div className="flex justify-center mt-4">
  <button
    className="btn btn-primary
      whitespace-nowrap 
      border-none 
      rounded-xl 
      px-6 py-2
      w-50
      transition-all duration-300 ease-in-out
      
      hover:bg-blue-400 
      hover:border-blue-400 
      hover:scale-105 
      hover:shadow-lg
      
      active:scale-95"
       type="button"
    onClick={handleLogin}
    disabled={loading}
  >
   {loading ? "Logging in..." : "Login"}
  </button>
</div>

        <div className="text-center text-sm">
          <span>Don't have an account? </span>
          <button
            className="text-blue-600 font-semibold hover:underline"
            onClick={() => {
  onClose();        // close login
  openRegister();   // open register
}}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}