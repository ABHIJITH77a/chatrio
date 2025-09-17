import jwt from "jsonwebtoken";
import user from "../models/user.js";

export const  auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
  console.log("Cookies received:", req.cookies);
console.log("JWT from cookie:", req.cookies?.jwt);


    if (!token) {
      // Stop execution after sending response
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWTSECRET);
    console.log("ddddddd",decoded)

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

  

    const finduser = await user.findById(decoded.userId);
    const email=decoded.email
    if (!finduser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Attach user to request and proceed
    req.user = finduser;
    console.log("kitty",req.user)
    next();
  } catch (error) {
    // Make sure to stop execution after sending response
    return res.status(500).json({ success: false, message: error.message });
  }
};
