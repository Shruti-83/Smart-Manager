import { XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { checkEmail,sendOtp,registerUser } from "../API/Auth.js";
import OtpModal from "./OtpModal.jsx";
import { useNavigate } from "react-router-dom";

function RegisterModal({ onClose, openLogin }) {
   const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [passwordError, setPasswordError] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  
  const navigate = useNavigate();

  const validatePassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    return "Password must be at least 8 characters, include uppercase, lowercase, number and special character";
  }
  return "";
};

const handleRegister = async () => {
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    toast.error("All fields are required");
    return;
  }
  if (passwordError) {
    toast.error("Please enter a strong password");
    return;
  }
  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }
  if (!isEmailVerified) {
    toast.error("Please verify your email first");
    return;
  }
  try {
    const { data } = await registerUser({ firstName, lastName, email, password, confirmPassword });
    localStorage.setItem("user", JSON.stringify(data.user));
    toast.success("Registered successfully!");
    navigate("/dashboard");
    onClose();
  } catch (err) {
    // ✅ was: toast.error(err) — that just prints "[object Object]" and doesn't throw
    toast.error(err.response?.data?.message || "Registration failed");
  }
};

  const handleVerify = async () => {
  if (!email) {
    toast.error("Please enter email first");
    return;
  }
  setIsEmailVerified(false);

  try {
    const { data } = await checkEmail({ email });

    if (data.exists) {
      toast.error("You are already registered. Please login.");
    } else {
      await sendOtp({ email });

      toast.success("OTP sent successfully!");
      setShowOtpModal(true);
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};

  return (
    // 👇 THIS IS THE OUTER BACKDROP (click outside = close)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
  onClick={onClose}
    >
      
      {/* 👇 THIS IS THE MODAL BOX (click inside = don't close) */}
      <div
        className="relative bg-white text-black p-6 rounded-xl w-96 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ❌ CROSS BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost"
        >
          <XIcon className="size-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Register</h2>

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="input input-bordered w-full mb-3"
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="input input-bordered w-full mb-3"
        />
        
        <div className="flex gap-2 mb-3">
  <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="input input-bordered w-full"
/>
 <button
  className=" btn btn-secondary 
    whitespace-nowrap 
    border-none 
    rounded-xl 
    px-6 py-2
    
    transition-all duration-300 ease-in-out
    
    hover:bg-green-400 
    hover:border-green-400 
    hover:scale-105 
    hover:shadow-lg
    
    active:scale-95"
  onClick={handleVerify}
>
  Verify
</button>
</div>
{isEmailVerified && (
  <p className="text-green-600 text-sm">✅ Email verified</p>
)}

 <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>  {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  }}
          className="input input-bordered w-full mb-3"
        />
        {passwordError && (
  <p className="text-red-500 text-sm mx-3 mb-2">{passwordError}</p>
)}
{!passwordError && password && (
  <p className="text-green-600 text-sm mx-3 mb-2">Strong password ✅</p>
)}
         <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input input-bordered w-full mb-3"
        />
        <div className="flex justify-end gap-2 mt-2">
        
          <button
  className=" btn btn-primary 
    whitespace-nowrap 
    border-none 
    rounded-xl 
    px-6 py-2
    
    transition-all duration-300 ease-in-out
    
    hover:bg-blue-400 
    hover:border-blue-400 
    hover:scale-105 
    hover:shadow-lg
    
    active:scale-95"
  onClick={handleRegister}
 
>
  Register
</button>
<div className="text-center mt-2.5 text-sm">
  <span>Already registered? </span>
  <button
    className="text-blue-600 font-semibold hover:underline"
    onClick={() => {
  onClose();     // close register modal
  openLogin();   // open login modal
}}
  >
    Login
  </button>
</div>
        </div>

      </div>
      {showOtpModal &&  <OtpModal
    onClose={() => setShowOtpModal(false)}
    setIsEmailVerified={setIsEmailVerified}
    email={email} // 🔥 IMPORTANT
  />}
    </div>
  );
}

export default RegisterModal;