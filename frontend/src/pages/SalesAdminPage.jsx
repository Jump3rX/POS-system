import React from "react";
import AuthContext from "../context/AuthContext";

function SalesAdminPage() {
  return (
    <>
      <div className="sales-page-container">
        <div className="sales-list-table">
          <h2>Sales Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date</th>
                <th>Employee</th>
                <th>Total(Ksh)</th>
                <th>Amount Tendered</th>
                <th>Change Due</th>
                <th>Payment Method</th>
                <th>Mpesa Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#2668</td>
                <td>12-2-2025 11:27</td>
                <td>Sam maina</td>
                <td>2,500</td>
                <td>3,000</td>
                <td>500</td>
                <td>Cash</td>
                <td>N/A</td>
                <td>
                  <button>View</button>
                  <button>Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default SalesAdminPage;
