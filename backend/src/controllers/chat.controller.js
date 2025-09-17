import { generateStreamToken } from "../lib/stream.js"

export const getStreamToken=async(req,res)=>{

     try{
        const token =generateStreamToken(req.user.id)
        res.json({token})
     }catch (error){
        res.json({sucess:false,message:error.message})
     }
}