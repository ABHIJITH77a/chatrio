import dotenv from "dotenv"
dotenv.config()

import pkg from "stream-chat";
const { StreamChat } = pkg;


const apikey=process.env.STREAM_API_KEY
const apisecret=process.env.STREAM_API_SECRET



const streamClient=StreamChat.getInstance(apikey,apisecret)

export default streamClient;

export const generateStreamToken=(userId)=>{
    try{
        const userIdStr=userId.toString();
        return streamClient.createToken(userIdStr)

    }
    catch(error){
    console.log(error.message)
    }
    
}

