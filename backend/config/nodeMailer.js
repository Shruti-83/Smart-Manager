import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first"); // ← forces IPv4 for all DNS lookups

export const sendOTP = async (email) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   // ← use explicit host instead of service:"gmail"
    port: 587,                 // ← 587 (TLS) instead of 465 (SSL)
    secure: false,             // ← false for port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP",
    text: `Your OTP is: ${otp}\n\nValid for 5 minutes. Do not share it.`
  });

  return otp;
};