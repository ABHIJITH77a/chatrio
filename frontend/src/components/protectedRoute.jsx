
import { Navigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";

export default function ProtectedRoute({ children }) {
  const { user, isLoading, isError } = useAuthUser();

  // 1️⃣ Wait for auth check
  if (isLoading) return <div>Loading...</div>;

  // 2️⃣ If request failed AND no user → redirect
  if (isError || !user) return <Navigate to="/" replace />;

  // 3️⃣ Otherwise → show protected page
  return children;
}
