import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // don't spam retries on unauthorized
  });
  console.log("ddddddd",data)
  return {
    isLoading,
    isError,
    error,
    user: data?.user || null, // ✅ always either object or null
  };
};

export default useAuthUser;
