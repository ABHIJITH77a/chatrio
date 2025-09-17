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
export const verifyotp = async (req, res) => {
  const userOtp  = req.body.dotp;
  console.log(userOtp)

  try {
    const otpData = req.session.otpData;
    console.log(otpData)
 
    if (!otpData) { 
      return res.json({ success: false, message: "No OTP session found. Please request a new OTP" });
    }

    const { userId, email, otp, expiresAt, isSignup } = otpData;
    console.log(otp)
  
    if (!userOtp) {
      return res.json({ success: false, message: "OTP is required" });
    }

    // Check OTP
    if (userOtp.toString() !== otp.toString()) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    // Check expiry
    if (expiresAt < Date.now()) {
      // Clear expired session
      delete req.session.otpData;
      return res.json({ success: false, message: "OTP expired. Please request a new one" });
    }
    // Find user
    const userDoc = await user.findById(userId);
 
  
    if (!userDoc) {
      return res.json({ success: false, message: "User not found" });
    }

    // Mark user as verified
    userDoc.isVerified = true;
    await userDoc.save();
    
   //Clear OTP session
     req.session.otpData=null;

    req.session.save((err) => {
  if (err) console.error("Error saving session after clearing OTP:", err);
});
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: userDoc._id },
      process.env.JWTSECRET,
      { expiresIn: "7d" }
    );
  
    // Set cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Upsert user in Stream
    try {
      await streamClient.upsertUser({
        id: userDoc._id.toString(),
        name: userDoc.name || "Anonymous",
        email: userDoc.email,
        image: userDoc.avatar || undefined,
      });

      console.log(`User streamed for ${userDoc._id}`);
    } catch (streamError) {
      console.error("Error while upserting to stream:", streamError);
      
    }





    return res.json({ 
      success: true, 
      message: isSignup ? "Account verified successfully! Welcome!" : "Email verified successfully!",
      user: {
        _id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        isVerified: userDoc.isVerified
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};