import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import { sendOTP } from "../config/nodeMailer.js";

//generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

//register
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, otp, password } = req.body;

    // ✅ 1. Validate fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // ✅ 3. Password strength (basic)
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // ✅ 4. Check if user already exists
    let user = await User.findOne({ email });


    // ❗ IMPORTANT: Check OTP verification
    if (!user || !user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first"
      });
    }

    // ✅ 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ 6. Update verified user with password + name
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = hashedPassword;
    user.role = 'user';

    await user.save();

    // 🔥 create token
    const token = generateToken(user._id, user.role);

    // 🍪 send cookie
    res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "Lax",   // ✅ FIX
  maxAge: 7 * 24 * 60 * 60 * 1000
});


    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

}



export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });

    // ✅ Only block if fully registered (has password)
    if (user && user.password) {
      return res.status(200).json({ success: true, exists: true, message: "User already exists" });
    }

    return res.status(200).json({ success: true, exists: false, message: "Email is available" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 🔥 Generate + send OTP
    const otp = await sendOTP(email);
    // 🔥 Save OTP in DB
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        isVerified: false
      });
    }

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });


    // 👉 store OTP (temporary)
    // you can use Map / DB / variable



  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGIN USER

// 🔹 Login User
export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Verify email first" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Please complete registration first",
      });
    }

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Verify email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    // 🍪 send cookie
   res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "Lax",   // ✅ FIX
  maxAge: 7 * 24 * 60 * 60 * 1000
});

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = (req, res) => {
  res.cookie("token", "", {
       httpOnly: true,
  secure: false,
  sameSite: "Lax",   // ✅ SAME AS LOGIN
  expires: new Date(0),
  });

  res.json({ message: "Logged out successfully" });
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("_id firstName lastName email");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};