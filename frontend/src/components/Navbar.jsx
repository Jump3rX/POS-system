import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
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
import delivery from "../assets/delivery.png";
import restock from "../assets/restock.png";

function Navbar() {
  let { user, logoutUser } = useContext(AuthContext);

  return (
    <div className="navbar">
      {user ? (
        <>
          {user.role === "admin" && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Home <img src={home} alt="" className="navlink-icon" />
              </NavLink>
              <NavLink
                to="/sales"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Sales <img src={sales} alt="" className="navlink-icon" />
              </NavLink>
              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Customers{" "}
                <img src={customers} alt="" className="navlink-icon" />
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Products <img src={products} alt="" className="navlink-icon" />
              </NavLink>
              <NavLink
                to="/restock"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Restock <img src={restock} alt="" className="navlink-icon" />
              </NavLink>
              <NavLink
                to="/restock-delivery"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Restock Delivery{" "}
                <img src={delivery} alt="" className="navlink-icon" />
              </NavLink>
              <NavLink
                to="/employees"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Employees{" "}
                <img src={employees} alt="" className="navlink-icon" />
              </NavLink>
              <NavLink
                to="/admin-reports"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Reports <img src={reports} alt="" className="navlink-icon" />
              </NavLink>
              {/* <NavLink
                to="/admin-profile"
                className={({ isActive }) => "navlink" + (isActive ? " active" : "")}
              >
                Profile <img src={profile} alt="" className="navlink-icon" />
              </NavLink> */}
            </>
          )}
          {user.role === "cashier" && (
            <>
              <NavLink
                to="/cashier-dashboard"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Dashboard <img src={home} alt="" className="navlink-icon" />
              </NavLink>
              <NavLink
                to="/cashier-sales"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Sales <img src={reg} alt="" className="navlink-icon" />
              </NavLink>
              {/* <NavLink
                to="/all-products"
                className={({ isActive }) => "navlink" + (isActive ? " active" : "")}
              >
                Products <img src={products} alt="" className="navlink-icon" />
              </NavLink> */}
            </>
          )}

          <NavLink
            to="/"
            className={({ isActive }) =>
              "navlink" + (isActive ? " active" : "")
            }
            onClick={(e) => {
              e.preventDefault();
              logoutUser();
            }}
          >
            Logout <img src={logout} alt="" className="navlink-icon" />
          </NavLink>
        </>
      ) : (
        <NavLink
          to="/"
          className={({ isActive }) => "navlink" + (isActive ? " active" : "")}
        >
          Login
        </NavLink>
      )}
    </div>
  );
}

export default Navbar;
