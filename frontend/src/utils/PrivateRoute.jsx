import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function PrivateRoute({ children, ...rest }) {
  let { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/" />;
}

export default PrivateRoute;
