import user from "../models/user.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import streamClient from "../lib/stream.js"
import cloudinary from "../configure/cloudinary.js"
import {transporter} from "../configure/nodemailerConfigure.js"

/**
 * Handles user signup
 * - Validates input
 * - Generates OTP and stores it in DB
 * - Saves pending email in cookie
 */
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: "Invalid email" });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password too short" });

    const existingUser = await user.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Email Verification - OTP",
      text: `Your OTP is ${otp}. Expires in 5 minutes.`,
    });

    // Create user (unverified)
    const newUser = new user({
      email,
      password: hashedPassword,
      isVerified: false,
      isOnborded: false,
      verificationOtp:otp,
      verificationOtpExpiresAt:expiresAt
    });
    await newUser.save();
    return res.json({ success: true, message: "Signup successful! OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Handles user login
 * - Validates input
 * - Checks user existence
 * - Compares password
 * - Sets JWT cookie
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "All fields are required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: "Invalid email format" });


    const findUser = await user.findOne({ email });
    if (!findUser) return res.status(404).json({ success: false, message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect password" });

    const token = jwt.sign({ userId: findUser._id }, process.env.JWTSECRET, { expiresIn: "7d" });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
 
   findUser.isLogged=true;
   await findUser.save()


    return res.json({
      success: true,
      message: "Login successfully",
      user: { _id: findUser._id, name: findUser.name, email: findUser.email },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Handles user logout
 * - Clears JWT cookie
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.json({ status: true, message: "Logged out" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

/**
 * Handles user onboarding
 * - Updates user profile info
 * - Marks onboarding complete
 * - Upserts user in Stream
 */
export const onboard = async (req, res) => {
  const { name, bio, nativeLanguage, learningLanguage } = req.body;
  try {
   
    if (!name || !bio || !nativeLanguage || !learningLanguage) 
      return res.json({ success: false, message: "Please enter the required fields" });
 
    const currentUser = req.user;
    let avatarUrl=null;

    if(req.file){
      const uploadResponse=await cloudinary.uploader.upload(req.file.path,{
         folder:"profile-pics",
         resource_type:"image",

      });
  
      avatarUrl=uploadResponse.secure_url;
    }

    const updatedUser = await user.findByIdAndUpdate(
      currentUser._id,
      { name, bio, nativeLanguage, learningLanguage,profilPic:avatarUrl, isOnborded: true },
      { new: true }
    );
    await updatedUser.save()

    const upsertStreamUser = async (newUser) => {
      try {
        await streamClient.upsertUser({
          id: newUser.id.toString(),  
          name: newUser.name || "Anonymous",
          email: newUser.email,
          image: newUser.profilPic || undefined,
        });
        console.log(`User streamed for ${newUser.id}`);
      } catch (error) {
        console.error("Error while upserting", error);
      }
    };

    upsertStreamUser(updatedUser);

    res.json({ success: true, message: "Bio updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}
