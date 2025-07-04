import React from "react";
import { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function SaleDetailsModal({ close, sale }) {
  let { authTokens, logoutUser } = useContext(AuthContext);
  const [saleDetails, setSaleDetails] = useState([]);
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/sale-details/${sale}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update!");
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setSaleDetails(data);
        console.log(data);
      });
  }, []);
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Sales Details</h2>
        <p>Sale ID:#{saleDetails.id}</p>
        <p>Seller: {saleDetails.seller}</p>
        <p>Total: Ksh {saleDetails.total}</p>
        <p>Payment Method: {saleDetails.payment_method}</p>
        <p>Amount Tendered: {saleDetails.amount_tendered}</p>
        <p>Change: {saleDetails.change}</p>
        <p>Sale Date: {saleDetails.sale_date}</p>
        <h4>Items Sold</h4>
        <table>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {saleDetails.items &&
              saleDetails.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_code}</td>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                  <td>{item.price * item.quantity}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <button onClick={() => close()}>Close</button>
      </div>
    </div>
  );
}

export default SaleDetailsModal;
