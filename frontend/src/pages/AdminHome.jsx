import React from "react";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import LoadingSpinner from "../assets/loader.gif";
import SalesStatisticsChart from "../components/SalesStatisticsChart";

function Home() {
  const [loading, setLoading] = useState(true);
  let { logoutUser, authTokens } = useContext(AuthContext);
  const [chartData, setChartData] = useState([]);
  const [data, setData] = useState({});
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard-data", {
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

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/chart-data", {
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
        setChartData(data);
      });
  }, []);
  return (
    <>
      {loading ? (
        <img src={LoadingSpinner} alt="loading spinner" />
      ) : (
        <div className="admin-page-container">
          <div className="left-section">
            <div className="left-section-cards">
              <div className="left-section-card">
                <h2>Sales Overview</h2>
                <div className="info-sections">
                  <div className="info-section1">
                    <div className="info1">
                      <span className="small-gray">Monthly Sales</span>
                      <p className="bold-black">
                        Ksh {data?.monthly_sales.toLocaleString()}
                      </p>
                    </div>
                    <div className="info2">
                      <span className="small-gray">Monthly Profit</span>
                      <p className="bold-black">Ksh 75,000</p>
                    </div>
                  </div>
                  <div className="info-section2">
                    <div className="info1">
                      <span className="small-gray">Weekly Sales</span>
                      <p className="bold-black">
                        Ksh {data?.weekly_sales.toLocaleString()}
                      </p>
                    </div>
                    <div className="info2">
                      <span className="small-gray">Weekly Profit</span>
                      <p className="bold-black">Ksh 32,000</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="left-section-card">
                <h2>Inventory Overview</h2>
                <div className="info-sections">
                  <div className="info-section1">
                    <div className="info1">
                      <span className="small-gray">Weekly Product Sales</span>
                      <p className="bold-black">
                        {data.weekly_product_sales || 0}
                      </p>
                    </div>
                    <div className="info2">
                      <span className="small-gray">Monthly Product Sales</span>
                      <p className="bold-black">
                        {data.monthly_product_sales || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="info-section2">
                    <div className="info1">
                      <span className="small-gray">Pending Product Orders</span>
                      <p className="bold-black">4</p>
                    </div>
                    <div className="info2">
                      <span className="small-gray">Products Delivered</span>
                      <p className="bold-black">10</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sales-info-section">
              <div className="sales-info-container">
                <h2>Sales Statistics</h2>

                <SalesStatisticsChart chartData={chartData} />
              </div>
            </div>
          </div>

          <div className="right-section">
            <div className="right-section-container">
              <div className="right-section-card">
                <h2>Stock Overview</h2>
                <div className="card-info">
                  <span className="small-gray">Total Stock</span>
                  <p className="bold-black">{data.stock_data}</p>
                </div>
                <div className="card-info">
                  <span className="small-gray">Available Stock</span>
                  <p className="bold-black">{data.stock_data}</p>
                </div>
                <div className="card-info">
                  <span className="small-gray">Out of Stock</span>
                  <p className="bold-black">0</p>
                </div>
              </div>

              <div className="right-section-card">
                <h2>Customer Overview</h2>
                <div className="card-info">
                  <span className="small-gray">Total Customers</span>
                  <p className="bold-black">120</p>
                </div>
                <div className="card-info">
                  <span className="small-gray">New Customers</span>
                  <p className="bold-black">15</p>
                </div>
              </div>

              <div className="right-section-card">
                <h2>Employees Overview</h2>
                <div className="card-info">
                  <span className="small-gray">Total Employees</span>
                  <p className="bold-black">{data.employee_data}</p>
                </div>
                <div className="card-info">
                  <span className="small-gray">Active</span>
                  <p className="bold-black">{data.employee_data}</p>
                </div>
                <div className="card-info">
                  <span className="small-gray">Inactive</span>
                  <p className="bold-black">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
