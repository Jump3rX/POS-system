import React from "react";
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function EditProductModal({ product, handleSave, closeModal }) {
  let { authTokens, logoutUser } = useContext(AuthContext);

  const [newProduct, setNewProduct] = useState({
    product_code: product.product_code,
    product_name: product.product_name,
    product_category: product.product_category,
    product_price: product.product_price,
    stock_quantity: product.stock_quantity,
  });

  function saveProduct(e) {
    e.preventDefault();
    fetch(`http://127.0.0.1:8000/api/edit-product/${product.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(newProduct),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to save");
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        } else {
          return res.json();
        }
      })
      .then((updatedProduct) => {
        handleSave(updatedProduct);
      })
      .catch((err) => console.error("ERRO: ", err));
  }
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Product</h2>
        <hr />
        <form onSubmit={saveProduct}>
          <label htmlFor="code">Product Code</label>
          <input
            type="number"
            className="edit-product-form-input"
            placeholder="Product Code"
            value={newProduct.product_code}
            onChange={(e) =>
              setNewProduct({ ...newProduct, product_code: e.target.value })
            }
            id="code"
          />
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            className="edit-product-form-input"
            placeholder="Product Name"
            value={newProduct.product_name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, product_name: e.target.value })
            }
            id="name"
          />
          <label htmlFor="category">Product Category</label>
          <input
            type="text"
            className="edit-product-form-input"
            placeholder="Product Category"
            value={newProduct.product_category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, product_category: e.target.value })
            }
            id="category"
          />

          <label htmlFor="price">Product Price</label>
          <input
            type="number"
            className="edit-product-form-input"
            placeholder="Price per item"
            value={newProduct.product_price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, product_price: e.target.value })
            }
            id="price"
          />
          <label htmlFor="quantity">Product Quantity</label>
          <input
            type="text"
            className="edit-product-form-input"
            placeholder="Stock Quantity"
            value={newProduct.stock_quantity}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock_quantity: e.target.value })
            }
            id="quantity"
          />
          <button type="submit">Save</button>
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
