import otpGenerator from "otp-generator";
import { Resend } from "resend";

export const sendOTP = async (email) => {
  const resend = new Resend(process.env.RESEND_API_KEY); // ← inside function

  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Your OTP",
    text: `Your OTP is: ${otp}\n\nValid for 5 minutes. Do not share it.`
  });

  return otp;
};