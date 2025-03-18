import React from "react";
import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import RestockDeliveryVerificationForm from "../components/RestockDeliveryVerificationForm";

function RestockDelivery() {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [productToVerify, setProductToVerify] = useState({});

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
          throw new Error("Failed to update!");
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        } else {
          return res.json();
        }
      })
      .then((data) => {
        console.log(data);
        setProducts(data);
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

  return (
    <div>
      <div className="restock-product-delivery-container">
        {openModal && (
          <RestockDeliveryVerificationForm
            handleCloseModal={handleCloseModal}
            product={productToVerify}
          />
        )}
        <div className="restock-delivery-table-container">
          <h2>Restock Delivery</h2>
          <table>
            <thead>
              <tr>
                <th>Restock ID</th>
                <th>Product ID</th>
                <th>Code</th>
                <th>Product Name</th>
                <th>Restock Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, id) => (
                  <tr key={id}>
                    <td>{product.id}</td>
                    <td>{product.product_id}</td>
                    <td>{product.product_code}</td>
                    <td>{product.product_name}</td>
                    <td>{product.quantity}</td>
                    <td>
                      <button onClick={() => handleOpenModal(product)}>
                        Verify
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
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
