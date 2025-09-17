import user from "../models/user.js";
import streamClient from "../lib/stream.js";
import jwt from "jsonwebtoken";
import { transporter } from "../configure/nodemailerConfigure.js";

// Generate and resend OTP for email verification
export const otpgenerate = async (req, res) => {
  const { email } = req.cookies;

  try {
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (existingUser.isVerified) {
      return res.json({ success: false, message: "User is already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "OTP Resent - Email Verification",
      text: `Your new OTP for email verification is: ${otp}. This OTP will expire in 5 minutes.`,
    });

    existingUser.verificationOtp = otp;
    existingUser.verificationOtpExpiresAt = expiresAt;
    await existingUser.save();

    // Store OTP info in session
    req.session.otpData = {
      userId: existingUser._id.toString(),
      email,
      otp,
      expiresAt,
      isSignup: false,
    };

    res.clearCookie(); // Clear previous cookies if any

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Verify OTP and mark user as verified
export const verifyOtp = async (req, res) => {
  try {
    const { dotp } = req.body;

    if (!dotp) {
      return res.json({ success: false, message: "Enter the OTP" });
    }

    const currentUser = await user.findOne({
      verificationOtp: dotp,
      verificationOtpExpiresAt: { $gt: Date.now() }, // Check not expired
    });

    if (!currentUser) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    // Mark user as verified and clear OTP fields
    currentUser.isVerified = true;
    currentUser.verificationOtp = undefined;
    currentUser.verificationOtpExpiresAt = undefined;
    await currentUser.save();

    // Generate JWT for user
    let token;
    try {
      token = jwt.sign(
        { userId: currentUser._id },
        process.env.JWTSECRET,
        { expiresIn: "7d" }
      );
    } catch (err) {
      return res.status(500).json({ success: false, message: "JWT generation failed" });
    }

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    // Upsert user in Stream
    await streamClient.upsertUser({
      id: currentUser._id.toString(),
      name: currentUser.name || "Anonymous",
      email: currentUser.email,
      image: currentUser.avatar || undefined,
    });

    return res.json({
      success: true,
      message: "OTP verified successfully!",
      user: currentUser,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
