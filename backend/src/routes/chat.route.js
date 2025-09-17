import express from "express"
import { auth } from "../middlewares/auth.js"
import { getStreamToken } from "../controllers/chat.controller.js"

const router=express.Router()


router.get("/token",auth,getStreamToken)


export default router