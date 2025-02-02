import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";
import logo from "../assets/logo.png";

function LoginPage() {
  let { loginUser } = useContext(AuthContext);

  return (
    <div className="login-page-container">
      <div className="login-page-form">
        <h2>POS Login</h2>
        <div className="logo-container">
          <img src={logo} alt="logo" />
        </div>
        <form action="" onSubmit={loginUser} className="login-form">
          <input
            type="text"
            name="username"
            placeholder="Your Username"
            className="login-form-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Your password"
            className="login-form-input"
          />
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
