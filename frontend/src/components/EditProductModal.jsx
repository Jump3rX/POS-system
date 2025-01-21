import React from "react";
import { useState } from "react";
function EditProductModal({ product, handleSave, closeModal }) {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
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
        <form onSubmit={saveProduct}>
          <input
            type="number"
            className="product-code-input"
            placeholder="Product Code"
            value={newProduct.product_code}
            onChange={(e) =>
              setNewProduct({ ...newProduct, product_code: e.target.value })
            }
          />
          <input
            type="text"
            className="product-name-input"
            placeholder="Product Name"
            value={newProduct.product_name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, product_name: e.target.value })
            }
          />
          <input
            type="text"
            className="product-category-input"
            placeholder="Product Category"
            value={newProduct.product_category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, product_category: e.target.value })
            }
          />
          <input
            type="number"
            className="product-price-input"
            placeholder="Price per item"
            value={newProduct.product_price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, product_price: e.target.value })
            }
          />
          <input
            type="text"
            className="product-stock-input"
            placeholder="Stock Quantity"
            value={newProduct.stock_quantity}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock_quantity: e.target.value })
            }
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
