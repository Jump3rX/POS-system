import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import home from "../assets/home.png";
import sales from "../assets/sales.png";
import customers from "../assets/customers.png";
import productsIcon from "../assets/products.png";
import employeesIcon from "../assets/employees.png";
import reports from "../assets/bar.png";
import logout from "../assets/exit.png";
import price from "../assets/price.png";
import restock from "../assets/restock.png";
import delivery from "../assets/delivery.png";

function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  return (
    <div className="navbar">
      {user ? (
        <>
          {user.role === "manager" && (
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

              {/* Products & Price Management Dropdown */}
              <div
                className="dropdown"
                onMouseEnter={() => toggleDropdown("products")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="navlink" id="button-dropdown">
                  Products & Pricing{" "}
                  <img src={productsIcon} alt="" className="navlink-icon" />
                </button>
                {openDropdown === "products" && (
                  <div className="dropdown-content">
                    <NavLink to="/products" className="navlink">
                      Products
                    </NavLink>
                    <NavLink to="/price-adjustment" className="navlink">
                      Price Management
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Restock & Delivery Dropdown */}
              <div
                className="dropdown"
                onMouseEnter={() => toggleDropdown("restock")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="navlink" id="button-dropdown">
                  Restock <img src={restock} alt="" className="navlink-icon" />
                </button>
                {openDropdown === "restock" && (
                  <div className="dropdown-content">
                    <NavLink to="/restock" className="navlink">
                      Restock
                    </NavLink>
                    <NavLink to="/restock-delivery" className="navlink">
                      Restock Delivery
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Employees & Roles Dropdown */}
              <div
                className="dropdown"
                onMouseEnter={() => toggleDropdown("employees")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="navlink" id="button-dropdown">
                  Users{" "}
                  <img src={employeesIcon} alt="" className="navlink-icon" />
                </button>
                {openDropdown === "employees" && (
                  <div className="dropdown-content">
                    <NavLink to="/employees" className="navlink">
                      Employees
                    </NavLink>
                    <NavLink to="/roles" className="navlink">
                      Roles
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/admin-reports"
                className={({ isActive }) =>
                  "navlink" + (isActive ? " active" : "")
                }
              >
                Reports <img src={reports} alt="" className="navlink-icon" />
              </NavLink>
            </>
          )}

          {/* Cashier Links */}
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
                Sales <img src={sales} alt="" className="navlink-icon" />
              </NavLink>
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
