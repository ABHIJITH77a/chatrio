import mongoose, { connect } from "mongoose"

export const connectDb=async()=>{
    try{
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MONGODB CONNECTED")
    }
    catch(error){

    }
}
