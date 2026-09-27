import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type RoleRouteProps = {
  role: "ADMIN" | "CASHIER" | "CUSTOMER";
  children: React.ReactNode;
};

function RoleRoute({
  role,
  children,
}: RoleRouteProps) {
  const { user, token } = useAuth();

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (user.role !== role) {
    if (user.role === "ADMIN") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }

    if (user.role === "CASHIER") {
      return (
        <Navigate
          to="/cashier/dashboard"
          replace
        />
      );
    }

    if (user.role === "CUSTOMER") {
      return (
        <Navigate
          to="/menu/today"
          replace
        />
      );
    }

    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default RoleRoute;