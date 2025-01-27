import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
function Navbar() {
  let { user, logoutUser } = useContext(AuthContext);
  return (
    <div className="navbar">
      {user ? (
        <>
          {user.role === "admin" && (
            <>
              <Link to="/admin" className="navlink">
                Home
              </Link>
              <Link to="/customers" className="navlink">
                Customers
              </Link>
              <Link to="/products" className="navlink">
                Products
              </Link>
              <Link to="/employees" className="navlink">
                Employees
              </Link>
            </>
          )}
          {user.role === "cashier" && (
            <>
              <Link to="/cashier-dashboard" className="navlink">
                Dashboard
              </Link>
              <Link to="/cashier-sales" className="navlink">
                Sales
              </Link>
            </>
          )}

          <Link
            to="/"
            className="navlink"
            onClick={(e) => {
              e.preventDefault(); // Prevent navigation before logout
              logoutUser();
            }}
          >
            Logout
          </Link>
        </>
      ) : (
        <Link to="/" className="navlink">
          Login
        </Link>
      )}
    </div>
  );
}

export default Navbar;
