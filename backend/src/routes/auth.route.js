
import express from "express"
import { signup,login,logout,onboard} from "../controllers/auth.controllers.js"
import { auth } from "../middlewares/auth.js"
import upload from "../middlewares/multer.js"
import { otpgenerate, verifyOtp } from "../controllers/otp.controller.js"

const router=express.Router()

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/onboard",auth,upload.single("avatar"),onboard)
router.put("/onboard",auth,upload.single("avatar"),onboard)
router.post("/otpresend",otpgenerate)
router.post("/verifyotp",verifyOtp)


router.get("/me", auth, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});




export default router