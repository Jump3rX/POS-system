import React from "react";
import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

function CashierDashboard() {
  let { logoutUser, authTokens } = useContext(AuthContext);
  const [data, setData] = useState({});
  const [sales, setSales] = useState([]);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/cashier-dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else if (res.statusText === "Unauthorized") {
          alert("Session expired. Please log in again.");
          logoutUser();
        }
      })
      .then((data) => {
        console.log(data);
        setData(data);
        setSales(data.sales_today);
      });
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      document.getElementById("current-time").textContent = timeString;
    };

    updateClock(); // initial call
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval); // cleanup
  }, []);

  function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (seconds < 60) return `${seconds} seconds`;
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`;
    if (days === 1) return `yesterday`;
    return `${days} days`;
  }

  return (
    <>
      <div className="cashier-dashboard-container">
        <div className="cashier-header-info">
          <div>
            <h2>
              Welcome, {data?.first_name} {data?.last_name}
            </h2>
          </div>
          <div>
            <p>
              Current Time: <span id="current-time"></span>
            </p>
          </div>
        </div>
        <div className="cashier-dashboard-cards">
          <div className="cashier-card">
            <div className="cashier-card-body">
              <h3>{data.sales_made || 0}</h3>
              <p>Total Sales Today</p>
            </div>
          </div>

          <div className="cashier-card">
            <div className="cashier-card-body">
              <h3>Ksh {(data?.total_revenue ?? 0).toLocaleString()}</h3>
              <p>Sales Revenue Today</p>
            </div>
          </div>

          <div className="cashier-card">
            <div className="cashier-card-body">
              <h3>{data?.top_product || "No Data"}</h3>
              <p>Top product Today</p>
            </div>
          </div>

          <div className="cashier-card">
            <div className="cashier-card-body">
              <h3>{data.last_login ? timeAgo(data.last_login) : "Never"}</h3>
              <p>since login</p>
            </div>
          </div>
        </div>

        <div className="sales-statistics">
          <div className="chart-container">
            <h2>My Sales Today</h2>

            <div className="sales-statistics-table">
              <table>
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length > 0 ? (
                    sales?.map((sale) => (
                      <tr key={sale.id}>
                        <td>#{sale.id}</td>
                        <td>{new Date(sale.sale_date).toLocaleString()}</td>
                        <td>Ksh {sale.total.toLocaleString()}</td>
                        <td>{sale.payment_method}</td>
                      </tr>
                    ))
                  ) : (
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      No sales made today
                    </td>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CashierDashboard;
