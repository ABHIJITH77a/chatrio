import user from "../models/user.js";
import streamClient from "../lib/stream.js";
import jwt from "jsonwebtoken"
import { transporter } from "../configure/nodemailerConfigure.js";

export const otpgenerate = async (req, res) => {
  const { email } = req.session.otpData;
  console.log("loiuy",email)
  
  try {
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // Check if user exists
    const existingUser = await user.findOne({ email });
    
    if (!existingUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check if user is already verified
    if (existingUser.isVerified) {
      return res.json({ success: false, message: "User is already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const mail = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "OTP Resent - Email Verification",
      text: `Your new OTP for email verification is: ${otp}. This OTP will expire in 5 minutes.`
    };

    await transporter.sendMail(mail);
    console.log("send")

    // Store in session
    req.session.otpData = {
      userId: existingUser._id.toString(),
      email,
      otp,
      expiresAt,
      isSignup: false // Flag to identify this is for resend
    };
    
    return res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ============ OTP VERIFICATION ============
export const verifyOtp = async (req, res) => {
  try {
    const { dotp } = req.body;

    if (!req.cookies.otpData)
      return res.json({ success: false, message: "OTP cookie not found. Please signup again." });

    const otpData = JSON.parse(req.cookies.otpData);
    const { email, otp, expiresAt, userId } = otpData;

    if (!dotp) return res.json({ success: false, message: "OTP is required" });

    if (dotp.toString() !== otp.toString())
      return res.json({ success: false, message: "Invalid OTP" });

    if (expiresAt < Date.now())
      return res.json({ success: false, message: "OTP expired. Please request a new one." });

    // Mark user as verified
    const userDoc = await user.findById(userId);
    if (!userDoc) return res.json({ success: false, message: "User not found" });

    userDoc.isVerified = true;
    await userDoc.save();

    // Clear cookie
    res.clearCookie("otpData");

    // Generate JWT
    const token = jwt.sign({ userId: userDoc._id }, process.env.JWTSECRET, { expiresIn: "7d" });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ success: true, message: "Account verified!", user: userDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
