
import { Navigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";


export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthUser();

  // while loading, show nothing or a loader
  if (isLoading) return <div>Loading...</div>;

  // if no user after loading, redirect
  if (!user) return <Navigate to="/" replace />;

  // otherwise render protected content
  return children;
}
