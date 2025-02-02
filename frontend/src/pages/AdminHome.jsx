import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <div className="admin-page-container">
        <div className="left-section">
          <div className="left-section-cards">
            <div className="left-section-card">
              <h2>Sales Overview</h2>
              <div className="info-sections">
                <div className="info-section1">
                  <div className="info1">
                    <span className="small-gray">Monthly Sales</span>
                    <p className="bold-black">Ksh 150,000</p>
                  </div>
                  <div className="info2">
                    <span className="small-gray">Monthly Profit</span>
                    <p className="bold-black">Ksh 75,000</p>
                  </div>
                </div>
                <div className="info-section2">
                  <div className="info1">
                    <span className="small-gray">Weekly Sales</span>
                    <p className="bold-black">Ksh 45,000</p>
                  </div>
                  <div className="info2">
                    <span className="small-gray">Weekly Profit</span>
                    <p className="bold-black">Ksh 32,000</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="left-section-card">
              <h2>Orders Overview</h2>
              <div className="info-sections">
                <div className="info-section1">
                  <div className="info1">
                    <span className="small-gray">N.O Orders</span>
                    <p className="bold-black">80</p>
                  </div>
                  <div className="info2">
                    <span className="small-gray">Orders Canceled</span>
                    <p className="bold-black">13</p>
                  </div>
                </div>
                <div className="info-section2">
                  <div className="info1">
                    <span className="small-gray">Orders Amount</span>
                    <p className="bold-black">Ksh 57,340</p>
                  </div>
                  <div className="info2">
                    <span className="small-gray">Order Returns</span>
                    <p className="bold-black">5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sales-info-section">
            <div className="sales-info-container">
              <h2>Sales Statistics</h2>
              <table>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Amount (Ksh)</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#1001</td>
                    <td>2025-01-29</td>
                    <td>John Doe</td>
                    <td>3,200</td>
                    <td>Mpesa</td>
                    <td class="completed">Completed</td>
                  </tr>
                  <tr>
                    <td>#1002</td>
                    <td>2025-01-29</td>
                    <td>Jane Mwangi</td>
                    <td>1,500</td>
                    <td>Cash</td>
                    <td class="pending">Pending</td>
                  </tr>
                  <tr>
                    <td>#1003</td>
                    <td>2025-01-29</td>
                    <td>David Kimani</td>
                    <td>4,750</td>
                    <td>Card</td>
                    <td class="completed">Completed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="right-section-container">
            <div className="right-section-card">
              <h2>Stock Overview</h2>
              <div className="card-info">
                <span className="small-gray">Total Stock</span>
                <p className="bold-black">7</p>
              </div>
              <div className="card-info">
                <span className="small-gray">Available Stock</span>
                <p className="bold-black">7</p>
              </div>
              <div className="card-info">
                <span className="small-gray">Out of Stock</span>
                <p className="bold-black">3</p>
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
                <p className="bold-black">2</p>
              </div>
              <div className="card-info">
                <span className="small-gray">Active</span>
                <p className="bold-black">2</p>
              </div>
              <div className="card-info">
                <span className="small-gray">Inactive</span>
                <p className="bold-black">2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
