import React from "react";
import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import RestockDeliveryVerificationForm from "../components/RestockDeliveryVerificationForm";

function RestockDelivery() {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [restockProducts, setRestockProducts] = useState([]); //stores all products received from backend
  const [openModal, setOpenModal] = useState(false); //opens and closes single product verification form
  const [productToVerify, setProductToVerify] = useState({}); //used when verifying single product
  const [verifyProducts, setVerifyProducts] = useState([]); //used when verifying multiple products using checkbox

  useEffect(() => {
    fetchRestockProducts();
  }, []);

  function fetchRestockProducts() {
    fetch("http://127.0.0.1:8000/api/restock-delivery", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update!", res);
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setRestockProducts(data);
      });
  }

  function handleSubmit(data) {
    //handles submitting product data from the table and verifyproduct form modal
    console.log(data);
    fetch(`http://127.0.0.1:8000/api/confirm-delivery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(data),
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
      });
  }

  function handleMultiSubmit(data) {
    //handles submitting verified product data from the table
    console.log(data);
    fetch(`http://127.0.0.1:8000/api/multi-confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(data),
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
        // console.log(data);
        alert(`${data.message}`);
        setVerifyProducts([]);
        fetchRestockProducts();
      });
  }
  function handleOpenModal(product) {
    setOpenModal(true);
    setProductToVerify(product);
  }
  function handleCloseModal() {
    setOpenModal(false);
    setProductToVerify({});
    fetchRestockProducts();
  }

  function confirmStatus(p, isChecked) {
    //adds or removes products from products to verify array based on checkbox checked status
    if (isChecked) {
      setVerifyProducts([
        ...verifyProducts,
        {
          restock_order: p.id,
          product_id: p.product_id,
          expected_quantity: p.quantity,
          delivered_quantity: p.quantity,
          delivery_status: "delivered",
        },
      ]);
    } else {
      setVerifyProducts(
        verifyProducts.filter((item) => item.restock_order !== p.id)
      );
    }
  }

  function saveSelected() {
    handleMultiSubmit(verifyProducts);
  }
  return (
    <div>
      <div className="restock-product-delivery-container">
        {openModal && (
          <RestockDeliveryVerificationForm
            handleCloseModal={handleCloseModal}
            product={productToVerify}
            handleSubmit={handleSubmit}
          />
        )}
        <div className="restock-delivery-table-container">
          <h2>Restock Delivery</h2>
          {verifyProducts && verifyProducts.length > 0 && (
            <button onClick={() => saveSelected()}>Save Selected</button>
          )}
          <table>
            <thead>
              <tr>
                <th>Restock ID</th>
                <th>Product ID</th>
                <th>Code</th>
                <th>Product Name</th>
                <th>Restock Quantity</th>
                <th>Quick Confirm</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {restockProducts && restockProducts.length > 0 ? (
                restockProducts.map((restockProduct, id) => (
                  <tr key={id}>
                    <td>{restockProduct.id}</td>
                    <td>{restockProduct.product_id}</td>
                    <td>{restockProduct.product_code}</td>
                    <td>{restockProduct.product_name}</td>
                    <td>{restockProduct.quantity}</td>
                    <td>
                      Complete Delivery
                      <input
                        type="checkbox"
                        name="confirm"
                        id="confirm"
                        onChange={(e) =>
                          confirmStatus(restockProduct, e.target.checked)
                        }
                      />
                    </td>
                    <td>
                      <button onClick={() => handleOpenModal(restockProduct)}>
                        Verify
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    No Items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RestockDelivery;
