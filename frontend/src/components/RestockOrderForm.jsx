import React from "react";
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
function RestockOrderForm({ closeModal, product }) {
  const { logoutUser, authTokens } = useContext(AuthContext);
  const [restockProduct, setRestockProduct] = useState({
    product_id: product.id,
    product: product.product_code,
    quantity: product.stock_quantity,
  });
  function handleSubmit(e) {
    e.preventDefault();
    console.log(restockProduct);
    fetch("http://127.0.0.1:8000/api/product-restock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(restockProduct),
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
        alert(`${data.message}`);
        closeModal();
      });
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Restock Product</h2>
        <hr />
        <h5>Current Product</h5>
        <div className="product-details">
          <div>
            <p>Code: {product.product_code}</p>
            <p>Name: {product.product_name}</p>
            <p>Category: {product.product_category}</p>
          </div>
          <hr />
          <div>
            <p>Current Selling Price: Ksh {product.selling_price}</p>
            <p>Current Stock: {product.quantity}</p>
            <p>Low Stock Alert Level: {product.low_stock_level}</p>
          </div>
        </div>
        <hr />
        <form action="" onSubmit={handleSubmit}>
          <label htmlFor="stock-quantity">Restock Quantity</label>
          <input
            type="number"
            value={restockProduct.quantity}
            id="stock-quantity"
            onChange={(e) =>
              setRestockProduct({
                ...restockProduct,
                quantity: e.target.value,
              })
            }
          />
          <button type="submit">Submit</button>
        </form>

        <button onClick={() => closeModal()}>Close</button>
      </div>
    </div>
  );
}

export default RestockOrderForm;
