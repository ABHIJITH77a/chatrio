import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import chatrio from "../assets/chat Trio.png"
import { verify ,otpresend} from "../lib/api.js";
import { toast } from "react-hot-toast";





export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const mail=document.cookie

  const { mutate, isPending, error } = useMutation({
    mutationFn:verify,
    onSuccess: () => {
      navigate("/onboard"); // redirect after success
    },
  });


  const { mutate:otpmutate, isPending:otppending, error:otperror } = useMutation({
    mutationFn:otpresend,
    onSuccess: () => {
      toast.success("otp sendsucessfully")
     setTimeout(()=>{navigate("/verify"); },2000) 
    },
  });


  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(otp);
  };
  const otpSubmit = (e) => {
    e.preventDefault();
    otpmutate(mail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 
    hover:to-blue-800 transition-all">
      <div className=" shadow-lg rounded-2xl p-8 w-full max-w-md" data-theme="forest" >
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={chatrio}
            alt="Logo"
            className="h-32"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white-800 mb-4">
          Verify OTP
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter the 6-digit code sent to your email
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg"
            placeholder="Enter OTP"
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error.message}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full  bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 
    hover:to-blue-800  text-white py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            {isPending ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend option */}
        <p className="text-sm text-center text-gray-600 mt-4">
          Didn’t receive the code?{" "}
          <button onClick={otpSubmit } className="text-blue-600 hover:underline font-medium">
            Resend OTP
          </button>
        </p>
      </div>
      
    </div>
  );
}
