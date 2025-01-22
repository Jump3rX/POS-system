import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

function LoginPage() {
  let { loginUser } = useContext(AuthContext);

  return (
    <div className="login-page-container">
      <div className="login-page-form">
        <h2>POS Login</h2>
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
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
