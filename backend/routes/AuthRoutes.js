import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  sendOtpController,
  verifyOtpController,
  checkEmail,
  getAllUsers
} from "../controllers/Auth.js";
import { authorizeRoles } from "../middlewares/AuthorizeRoles.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// 🔐 Auth Routes
// ✅ Check email
router.post("/check-email", checkEmail);

// ✅ Send OTP (email)
router.post("/send-otp", sendOtpController);

// ✅ Verify OTP
router.post("/verify-otp", verifyOtpController);

// ✅ Register (after OTP verification)
router.post("/register", registerUser);

// ✅ Login
router.post("/login", loginUser);

// ✅ Logout
router.post("/logout", logoutUser);

router.get(
  "/admin-dashboard",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.send("Welcome Admin");
  }
);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
export default router;