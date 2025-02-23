import React from "react";
import loadingGif from "../assets/loader.gif";
import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  let { logoutUser, authTokens } = useContext(AuthContext);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/reports-dashboard", {
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
          logoutUser();
        }
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  function downloadInventoryReport(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/inventory-report", {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventory_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  function downloadSalesReport(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/sales-report", {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sales_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  return (
    <>
      {loading ? (
        <img src={loadingGif} alt="" />
      ) : (
        <div className="admin-reports-page-container">
          <div className="report-cards">
            <div className="report-card">
              <h2>Ksh {data.weekly_sales.toLocaleString()}</h2>
              <p>Weekly Sales</p>
            </div>
            <div className="report-card">
              <h2>Ksh {data.monthly_sales.toLocaleString()}</h2>
              <p>Monthly Sales</p>
            </div>
            <div className="report-card">
              <h2>{data.weekly_product_sales.toLocaleString()}</h2>
              <p>Weekly Product Sales</p>
            </div>
            <div className="report-card">
              <h2>{data.monthly_product_sales.toLocaleString()}</h2>
              <p>Monthly Product Sales</p>
            </div>
            <div className="report-card">
              <h2>{data.employee_data}</h2>
              <p>Total Employees</p>
            </div>
          </div>
          <div className="chart-downloads-section">
            <div className="revenue-chart">
              <div className="chart">
                <h2>Revenue Summary</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Total Sales (KES)</th>
                      <th>Expenses (KES)</th>
                      <th>Net Revenue (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2025-02-10</td>
                      <td>50,000</td>
                      <td>20,000</td>
                      <td>30,000</td>
                    </tr>
                    <tr>
                      <td>2025-02-09</td>
                      <td>45,000</td>
                      <td>15,000</td>
                      <td>30,000</td>
                    </tr>
                    <tr>
                      <td>2025-02-08</td>
                      <td>60,000</td>
                      <td>25,000</td>
                      <td>35,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="downloads-section">
              <h2>Downloads</h2>
              <button onClick={(e) => downloadInventoryReport(e)}>
                Inventory Records
              </button>
              <button onClick={(e) => downloadSalesReport(e)}>
                Sales Records
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminReports;
