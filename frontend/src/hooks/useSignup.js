import { useMutation } from "@tanstack/react-query";
import { signup } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {setAuthUser} from "../../store/slice"
import { useDispatch } from "react-redux";




const useSignup=()=>{
  const dispatch=useDispatch()
    const navigate=useNavigate()
   const mutation= useMutation({
  mutationFn:signup,
  onSuccess:(data)=>{ 
  dispatch(setAuthUser(data.user))
    navigate ("/verify");
},
});
 return mutation
}


export default useSignup


