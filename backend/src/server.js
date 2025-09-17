import express from "express"
import dotenv from "dotenv"
import authroutes from "./routes/auth.route.js"
import userroutes from "./routes/user.route.js"
import chatroutes from "./routes/chat.route.js"
import cookieparse from "cookie-parser"
import session from "express-session";
import cors from "cors"
import { connectDb } from "./lib/db.js";
import MongoStore from "connect-mongo"


dotenv.config();

const app=express()
const port=process.env.PORT



app.use(
  session({
    secret: process.env.SESSION_SECRET, // keep in .env
    resave: false, // don’t force resaving if nothing changed
    saveUninitialized: false, // don’t save empty sessions
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // your DB connection
      collectionName: "sessions",      // sessions collection
      ttl: 14 * 24 * 60 * 60           // session TTL (14 days)
    }),
  })
);





app.use(cors({
     origin: "https://chatrio-qshq.onrender.com",
   credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparse());
app.use("/api/auth",authroutes)
app.use("/api/user",userroutes)
app.use("/api/chat",chatroutes)







app.listen(port,()=>{
     console.log("server is running")
     connectDb()
})