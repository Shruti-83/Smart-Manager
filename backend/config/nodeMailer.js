import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";

export const sendOTP = async (email) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    specialChars: false
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    to: email,
    subject: "Your OTP",
    text: `Your OTP for email verification is: ${otp}

This OTP is valid for 5 minutes.

Please do not share this OTP with anyone.

If you did not request this, please ignore this email.
`
  });

  return otp;
};