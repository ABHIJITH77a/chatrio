import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, 
  });
  console.log("ddddddd",data)
  return {
    isLoading,
    isError,
    error,
    user: data?.user || null, 
  };
};

export default useAuthUser;
