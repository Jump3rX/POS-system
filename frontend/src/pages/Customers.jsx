import React from "react";

function Customers() {
  return (
    <>
      <div className="customers-page-container">
        <div className="customers-list-container">
          <h2>Customers List</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>John Doe</td>
                <td>0752266793</td>
                <td>152</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Jane Doe</td>
                <td>0785266793</td>
                <td>251</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="customer-info-cards">
          <div className="customer-info">
            <h2>Customers Summary</h2>
            <div className="info-container">
              <div className="info-1">
                <span className="small-gray">Total Customer</span>
                <p className="bold-black">20</p>
              </div>
              <div className="info-2">
                <span className="small-gray">New Customers</span>
                <p className="bold-black">10</p>
              </div>
            </div>
          </div>

          <div className="customer-info">
            <h2>Loyalty Points</h2>
            <div className="info-container">
              <div className="info-1">
                <span className="small-gray">Total Points</span>
                <p className="bold-black">2050</p>
              </div>
              <div className="info-2">
                <span className="small-gray">Redeemed Points</span>
                <p className="bold-black">550</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Customers;
