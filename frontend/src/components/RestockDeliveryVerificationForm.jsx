import React from "react";
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
function RestockDeliveryVerificationForm({ handleCloseModal, product }) {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [deliveryInfo, setDeliveryInfo] = useState({
    restock_order: product.id,
    product_id: product.product_id,
    expected_quantity: product.quantity,
    quantity_delivered: "",
    delivery_status: "",
  });

  function closeDelivery() {
    setDeliveryInfo({
      restock_order: product.id,
      expected_quantity: product.quantity,
      quantity_delivered: "",
      delivery_status: "",
    });
    handleCloseModal();
  }
  function handleSubmit(e) {
    e.preventDefault();
    console.log(deliveryInfo);
    fetch(`http://127.0.0.1:8000/api/confirm-delivery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(deliveryInfo),
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
        console.log(data);
        closeDelivery();
      });
  }
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Delivery Verification</h2>
        <hr />
        <p>Code: {product.product_code}</p>
        <p>Name: {product.product_name}</p>
        <p>Expected quantity: {product.quantity}</p>
        <hr />
        <h5>Confirm Delivery</h5>
        <form action="" onSubmit={handleSubmit}>
          <label htmlFor="">Delivered Quantity</label>
          <input
            type="number"
            name="delivered_quantity"
            value={deliveryInfo.quantity_delivered}
            onChange={(e) =>
              setDeliveryInfo({
                ...deliveryInfo,
                quantity_delivered: e.target.value,
              })
            }
            required
          />

          <label htmlFor="">Delivery Status</label>
          <select
            name="delivery_status"
            required
            id=""
            value={deliveryInfo.delivery_status}
            onChange={(e) =>
              setDeliveryInfo({
                ...deliveryInfo,
                delivery_status: e.target.value,
              })
            }
          >
            <option value="" disabled>
              Select Option
            </option>
            <option key="delivered" value="delivered">
              Delivered
            </option>
            <option key="partiallY_delivered" value="partially_delivered">
              Partially Delivered
            </option>
            <option key="rejected" value="rejected">
              Rejected
            </option>
          </select>
          <button type="submit">Confirm Delivery</button>
        </form>
        <button onClick={() => handleCloseModal()}>Close</button>
        <hr />
      </div>
    </div>
  );
}

export default RestockDeliveryVerificationForm;
