import React from "react";

function CashierSales() {
  return (
    <>
      <div className="sales-page-container">
        <div className="sales-list-container">
          <h1>Sales List</h1>
          <div className="search-product-container">
            <input
              type="text"
              className="search-product-input"
              placeholder="Enter product code or name"
            />
          </div>

          <div className="sales-list-table-container">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>SubTotal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>910284</td>
                  <td>Fluffy Carpet Cleaner 1L</td>
                  <td>450</td>
                  <td>1</td>
                  <td>450</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="sales-summary-container">
          <h1>Sales Summary</h1>
          <div className="total-container">
            <p>
              Total: <span>Ksh 450.00</span>
            </p>
          </div>
          <div className="payment-options-container">
            <h3>Payment Options</h3>
            <div className="payment-option-btns">
              <button>Cash</button>
              <button>Mpesa</button>
              <button>Card</button>
            </div>
          </div>
          <div className="sale-options-container">
            <h3>Sale Options</h3>
            <button>Hold</button>
            <button>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CashierSales;
