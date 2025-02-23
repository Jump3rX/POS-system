import React from "react";

function CashierDashboard() {
  return (
    <>
      <div className="cashier-dashboard-container">
        <div className="cashier-dashboard-cards">
          <div className="cashier-card">
            <div className="cashier-card-body">
              <h3>30</h3>
              <p>Total Sales</p>
            </div>
          </div>

          <div className="cashier-card">
            <div className="cashier-card-body">
              <h3>30</h3>
              <p>Total Sales</p>
            </div>
          </div>

          <div className="cashier-card">
            <div className="cashier-card-body">
              <h3>30</h3>
              <p>Total Sales</p>
            </div>
          </div>

          <div className="cashier-card">
            <div className="cashier-card-body">
              <h3>30</h3>
              <p>Total Sales</p>
            </div>
          </div>
        </div>

        <div className="sales-statistics">
          <div className="chart-container">
            <h2>Sales Statistics</h2>

            <div className="sales-statistics-table">
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
                    <td className="completed">Completed</td>
                  </tr>
                  <tr>
                    <td>#1002</td>
                    <td>2025-01-29</td>
                    <td>Jane Mwangi</td>
                    <td>1,500</td>
                    <td>Cash</td>
                    <td className="pending">Pending</td>
                  </tr>
                  <tr>
                    <td>#1003</td>
                    <td>2025-01-29</td>
                    <td>David Kimani</td>
                    <td>4,750</td>
                    <td>Card</td>
                    <td className="completed">Completed</td>
                  </tr>
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
