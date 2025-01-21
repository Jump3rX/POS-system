import React from "react";
import { Link } from "react-router-dom";
function Navbar() {
  return (
    <div className="navbar">
      <Link to="/" className="navlink">
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
    </div>
  );
}

export default Navbar;
