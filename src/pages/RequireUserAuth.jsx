import { Navigate, useLocation } from "react-router-dom";

const RequireUserAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    if (!token) return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireUserAuth;