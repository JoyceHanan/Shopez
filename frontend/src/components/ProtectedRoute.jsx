import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/authStore";

function ProtectedRoute({ adminOnly = false }) {
  const { currentUser, isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    adminOnly &&
    currentUser?.usertype !== "admin"
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;