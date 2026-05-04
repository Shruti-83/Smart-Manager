import { useState } from "react";
import { verifyOtp } from "../API/Auth.js";
import toast from "react-hot-toast";

function OtpModal({ onClose, setIsEmailVerified ,email}) {
  const [otp, setOtp] = useState("");

  const handleOtpVerify = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      const { data } = await verifyOtp({email, otp });

      if (data.success) {
        toast.success("Email verified!");
        setIsEmailVerified(true);
        onClose();
      } else {
        toast.error("Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
    <div
      className="bg-white w-[360px] p-6 rounded-2xl shadow-2xl border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
        Verify Your Email
      </h2>

      <p className="text-sm text-gray-500 text-center mb-5">
        Enter the OTP sent to <span className="font-medium text-gray-700">{email}</span>
      </p>

      {/* Input */}
      <input
        type="text"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full px-4 py-2.5 mb-4 rounded-lg border border-gray-300 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
        text-gray-800 placeholder-gray-400 transition"
      />

      {/* Buttons */}
      <div className="flex gap-3">
        {/* Verify */}
        <button
          onClick={handleOtpVerify}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium
          hover:bg-indigo-700 transition-all duration-200 
          hover:shadow-md active:scale-95"
        >
          Verify
        </button>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium
          hover:bg-gray-200 transition-all duration-200 
          active:scale-95"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);
}

export default OtpModal;