import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function PrivateRoute({ children, requiredRole, ...rest }) {
  let { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/" />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return alert("Unauthorized access!");
  }
  return children;
}

export default PrivateRoute;
