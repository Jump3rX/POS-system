import React from "react";
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function EditProductModal({ product, latestBatch, handleSave, closeModal }) {
  let { authTokens, logoutUser } = useContext(AuthContext);

  const [newProduct, setNewProduct] = useState({
    product_code: product.product_code,
    product_name: product.product_name,
    product_category: product.product_category,
    selling_price: product.selling_price,
    cost_price: product.cost_price,
    quantity: product.quantity,
    low_stock_level: product.low_stock_level,
  });
  console.log(latestBatch);

  function saveProduct(e) {
    e.preventDefault();
    fetch(`http://127.0.0.1:8000/api/edit-product/${product.id}`, {
      method: "PATCH",
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

          <label htmlFor="price">Selling Price</label>
          <input
            type="number"
            className="edit-product-form-input"
            placeholder="Price per item"
            value={newProduct.selling_price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, selling_price: e.target.value })
            }
            id="price"
          />

          <label htmlFor="quantity">Cost Price</label>
          <input
            type="text"
            className="edit-product-form-input"
            placeholder="Stock Purchase Price"
            value={newProduct.cost_price}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                cost_price: e.target.value,
              })
            }
            id="quantity"
          />

          <label htmlFor="quantity">Stock Quantity</label>
          <input
            type="text"
            className="edit-product-form-input"
            placeholder="Stock Quantity"
            value={newProduct.quantity}
            onChange={(e) =>
              setNewProduct({ ...newProduct, quantity: e.target.value })
            }
            id="quantity"
          />

          <label htmlFor="low-stock">Low Stock Altert Level</label>
          <input
            type="text"
            className="edit-product-form-input"
            placeholder="Low Stock Alert Level"
            value={newProduct.low_stock_level}
            onChange={(e) =>
              setNewProduct({ ...newProduct, low_stock_level: e.target.value })
            }
            id="low-stock"
          />
          <button type="submit" className="save-btn">
            Save
          </button>
          <button type="button" className="cancel-btn" onClick={closeModal}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
