import express from "express";
import { auth } from "../middlewares/auth.js";
import { getRecomendusers,getFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest,getFriendRequests,getPendingRequests} from "../controllers/user.controllers.js";

const router=express.Router()


 router.use(auth)
router.get("/",getRecomendusers)
router.get("/friends",getFriends)

router.post("/friendreq/:id",sendFriendRequest)
router.post("/acceptreq/:id",acceptFriendRequest)
router.post("/rejreq/:id",rejectFriendRequest)

router.get("/getreqst",getFriendRequests)
router.get("/pendingreqst",getPendingRequests)


export default router 