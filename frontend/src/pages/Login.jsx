import chat from "../assets/chat.png"
import chattrio from "../assets/chat Trio.png"
import { useState } from "react"
import { useMutation ,useQueryClient} from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"


const Login = () => {
  const dispatch=useDispatch()
const navigate=useNavigate()
const[loginData,setLoginData]=useState({
  email:"",
  password:""
})

const queryClient=useQueryClient()
const {mutate,isPending,error}=useMutation({
  mutationFn:async()=>{
    const res= await axiosInstance.post("/auth/login",loginData)
    return res.data;
  },
  onSuccess:(data)=>{ 
     queryClient.invalidateQueries(["authUser"]);
    navigate ("/home")
   
},

  
});




const submit=(e)=>{
     e.preventDefault()
     mutate()
}




  return (
    
     <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 " data-theme="forest">
      
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-8 bg-base-200">
        {/* Logo */}
        <img src={chattrio} alt="Logo" className="w-40 mb-6" />

        {/* Form Box */}
        <div className="w-full max-w-md bg-base-100 shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-center mx-auto">Sign in</h2>
          <p className="text-sm mb-6 text-gray-500 text-center">
            Join Chatrio and explore world languages
          </p>

{/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response?.data?.message||"Something went wrong"}</span>
            </div>
          )}


          <form className="space-y-4" onSubmit={submit}>
    

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <input
                // type="email"
                className="input input-bordered w-full"
                 onChange={(e)=>setLoginData({...loginData,email:e.target.value})}
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input input-bordered w-full"
                 onChange={(e)=>setLoginData({...loginData,password:e.target.value})}
              />
             
            </div>

           

            {/* Button */}
           <button type="submit" disabled={isPending}  className="w-full mt-2 py-2 px-4 rounded-lg text-white 
    bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 
    hover:to-blue-800 transition-all">
  {isPending ? "processing..." : "Login"}
</button>

          </form>

          {/* Login link */}
          <p className="mt-4 text-sm text-center">
            Dont't have an account?{" "}
            <Link to="/signup"  className="link link-primary">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden md:flex justify-center items-center bg-gradient-to-br from-blue via-indigo to-purple-900">
        <img
          src={chat}
          alt="Signup Illustration"
          className="w-4/5 max-w-lg object-contain drop-shadow-[0_0_30px_rgba(64,211,238,0.6)]" 
        />
      </div>
    </div>
  )
}

export default Login
