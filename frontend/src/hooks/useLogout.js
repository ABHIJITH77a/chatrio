import { useMutation} from "@tanstack/react-query";
import { logout } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {clearAuthUser} from "../../store/slice"
import { useDispatch } from "react-redux";


const useLogout = () => {
 const dispatch=useDispatch()
const navigate=useNavigate()
  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () =>{
      dispatch(clearAuthUser())
      navigate("/login")
    }
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;