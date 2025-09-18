import { axiosInstance } from "./axios";



export const verify = async (otp) => {
  const res = await axiosInstance.post("/auth/verifyotp",{dotp:otp});

  const data = res.data;
  if (!data.success) {
    throw new Error(data.message || "OTP verification failed");
  }

  return data;
};



   export const signup= async(signupData)=>{
        const res= await axiosInstance.post("/auth/signup",signupData)
        return res.data;
      }


      
   export const otpresend= async()=>{
    console.log("send")
        const res= await axiosInstance.post("/auth/otpresend")
        return res.data;
      }


      export const onboard=async (formData) => {
      const res = await axiosInstance.post("/auth/onboard", formData)
      return res.data
    }

    export const updateProfile=async (formData) => {
      const res = await axiosInstance.put("/auth/onboard", formData)
      return res.data
    }


export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me")
    console.log("hiiiiiiii",res.data)
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};


export const getFriends=async()=>{
  try{
    const res =await axiosInstance.get("/user/friends");
    return res.data;
  
  }
  catch(error){
    return res.error
  }
}


export const getRecommendedUsers=async()=>{
  try{
  const res = await axiosInstance.get("/user");
  console.log(res.data)
  return res.data;
  }
  catch(error){
    return res.error
  }
}



export const sendreq=async(id)=>{
  try{
  const res = await axiosInstance.post(`/user/friendreq/${id}`);
 
  return res.data;
  }
  catch(error){
    return error.response
  }
}

export const getreq=async()=>{
  try{
  const res = await axiosInstance.get("/user/getreqst");

  return res.data;
  }
  catch(error){
    return error.response
  }
}


export const acceptreq = async (id) => {
  try {
    console.log("Accepting request for user:", id);
    const res = await axiosInstance.post(`/user/acceptreq/${id}`);
    return res.data;
  } catch (error) {
    console.error("Accept request error:", error);
    throw new Error(error.response?.data?.message || "Failed to accept request");
  }
};

export const rejectreq = async (id) => {
  try {
    console.log("Rejecting request for user:", id);
    const res = await axiosInstance.post(`/user/rejreq/${id}`);
    return res.data;
  } catch (error) {
    console.error("Reject request error:", error);
    throw new Error(error.response?.data?.message || "Failed to reject request");
  }
};


export const getStreamToken=async()=>{
  try{
  const res = await axiosInstance.get("/chat/token");
   console.log("pppppppppppppppppppppppppppppppppppp",res.data)
  return res.data;
  }
  catch(error){
    return error.response
  }
}