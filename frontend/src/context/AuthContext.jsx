import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  let [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  let [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwtDecode(localStorage.getItem("authTokens"))
      : null
  );
  let [loading, setLoading] = useState(true);
  let navigate = useNavigate();

  let loginUser = async (e) => {
    e.preventDefault();

    let resp = await fetch(`http://127.0.0.1:8000/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "username": e.target.username.value,
        "password": e.target.password.value,
      }),
    });
    let data = await resp.json();
    if (resp.status === 200) {
      setAuthTokens(data);
      let decodeToken = jwtDecode(data.access);
      setUser(decodeToken);
      localStorage.setItem("authTokens", JSON.stringify(data));

      if (decodeToken.role === "admin") {
        navigate("/admin");
      } else if (decodeToken.role === "cashier") {
        navigate("/cashier-dashboard");
      } else {
        navigate("/");
      }
    } else {
      alert("Invalid credentials, try again!");
    }
  };
  let updateToken = async () => {
    let resp = await fetch(`http://127.0.0.1:8000/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "refresh": authTokens?.refresh,
      }),
    });
    let data = await resp.json();
    if (resp.status === 200) {
      setAuthTokens(data);
      setUser(jwtDecode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
    } else {
      logoutUser();
    }
    if (loading) {
      setLoading(false);
    }
  };
  let logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    navigate("/");
  };
  let contextData = {
    authTokens: authTokens,
    logoutUser: logoutUser,
    user: user,
    loginUser: loginUser,
  };

  useEffect(() => {
    if (loading) {
      updateToken();
    }
    const four = 1000 * 60 * 4;
    let interval = setInterval(() => {
      if (authTokens) {
        updateToken();
      }
    }, four);
    return () => clearInterval(interval);
  }, [authTokens, loading]);
  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
