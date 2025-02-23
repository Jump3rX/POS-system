import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import home from "../assets/home.png";
import sales from "../assets/sales.png";
import customers from "../assets/customers.png";
import products from "../assets/products.png";
import employees from "../assets/employees.png";
import reports from "../assets/bar.png";
import profile from "../assets/admin.png";
import logout from "../assets/exit.png";
import reg from "../assets/sales-reg.png";

function Navbar() {
  let { user, logoutUser } = useContext(AuthContext);
  return (
    <div className="navbar">
      {user ? (
        <>
          {user.role === "admin" && (
            <>
              <Link to="/admin" className="navlink">
                Home <img src={home} alt="" className="navlink-icon" />
              </Link>
              <Link to="/sales" className="navlink">
                Sales <img src={sales} alt="" className="navlink-icon" />
              </Link>
              <Link to="/customers" className="navlink">
                Customers{" "}
                <img src={customers} alt="" className="navlink-icon" />
              </Link>
              <Link to="/products" className="navlink">
                Products <img src={products} alt="" className="navlink-icon" />
              </Link>
              <Link to="/employees" className="navlink">
                Employees{" "}
                <img src={employees} alt="" className="navlink-icon" />
              </Link>
              <Link to="/admin-reports" className="navlink">
                Reports <img src={reports} alt="" className="navlink-icon" />
              </Link>
              {/* <Link to="/admin-profile" className="navlink">
                Profile <img src={profile} alt="" className="navlink-icon" />
              </Link> */}
            </>
          )}
          {user.role === "cashier" && (
            <>
              <Link to="/cashier-dashboard" className="navlink">
                Dashboard <img src={home} alt="" className="navlink-icon" />
              </Link>
              <Link to="/cashier-sales" className="navlink">
                Sales <img src={reg} alt="" className="navlink-icon" />
              </Link>

              <Link to="/all-products" className="navlink">
                Products <img src={products} alt="" className="navlink-icon" />
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
            Logout <img src={logout} alt="" className="navlink-icon" />
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
