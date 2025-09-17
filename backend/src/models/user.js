import mongoose, { now } from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    bio:{
        type:String,
        default:""
    },
    profilPic:{
        type:String,
        default:""
    },
    nativeLanguage:{
        type:String,
        default:""
    },
    learningLanguage:{
        type:String,
        default:""
    },
    isLogged:{
        type:Boolean,
        default:false
    },
    isOnborded:{
        type:Boolean,
        default:false
    },
     isVerified:{
        type:Boolean,
        default:false
    },
    verificationOtp:String,
    verificationOtpExpiresAt:Date,

    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]

},{timestamps:now})

const user=mongoose.model("user",userSchema)
export default user