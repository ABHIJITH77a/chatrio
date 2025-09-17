import express from "express"
import dotenv from "dotenv"
import authroutes from "./routes/auth.route.js"
import userroutes from "./routes/user.route.js"
import chatroutes from "./routes/chat.route.js"
import cookieparse from "cookie-parser"
import session from "express-session";
import cors from "cors"
import { connectDb } from "./lib/db.js";



dotenv.config();

const app=express()
const port=process.env.PORT
const allowedOrigins = [
  "http://localhost:5173",          // local dev
  "https://chatrio-1.onrender.com"  // deployed frontend on Render
];



app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));






app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // true on Render
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 5 * 60 * 1000 // 5 minutes
  }
}));





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
