import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function AddProductForm({ handleAddNewProduct }) {
  let { authTokens, logoutUser } = useContext(AuthContext);
  const [product, setProduct] = useState({
    product_code: "",
    product_name: "",
    product_category: "",
    product_price: "",
    stock_quantity: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (
      product.product_code &&
      product.product_name &&
      product.product_category &&
      product.product_price &&
      product.stock_quantity
    ) {
      fetch("http://127.0.0.1:8000/api/add-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify(product),
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
        .then((newProducts) => {
          handleAddNewProduct(newProducts);
          setProduct({
            product_code: "",
            product_name: "",
            product_category: "",
            product_price: "",
            stock_quantity: "",
          });
          alert("Product added successfullt!");
        });
    } else {
      alert("Values cannot be empty!");
    }
    console.log(product);
  }

  return (
    <div className="add-product-form-container">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="product-form-inputs">
          <input
            type="number"
            name="product_code"
            className="product-code-input"
            placeholder="Product Code"
            value={product.product_code}
            onChange={(e) =>
              setProduct({ ...product, product_code: e.target.value })
            }
          />
          <input
            type="text"
            name="product_name"
            className="product-name-input"
            placeholder="Product Name"
            value={product.product_name}
            onChange={(e) =>
              setProduct({ ...product, product_name: e.target.value })
            }
          />
          <input
            type="text"
            name="product_category"
            className="product-category-input"
            placeholder="Product Category"
            value={product.product_category}
            onChange={(e) =>
              setProduct({ ...product, product_category: e.target.value })
            }
          />
          <input
            type="number"
            name="product_price"
            className="product-price-input"
            placeholder="Price per item"
            value={product.product_price}
            onChange={(e) =>
              setProduct({ ...product, product_price: e.target.value })
            }
          />
          <input
            type="text"
            name="stock_quantity"
            className="product-stock-input"
            placeholder="Stock Quantity"
            value={product.stock_quantity}
            onChange={(e) =>
              setProduct({ ...product, stock_quantity: e.target.value })
            }
          />
        </div>

        <button type="submit" className="save-btn">
          Save Product
        </button>
      </form>
    </div>
  );
}

export default AddProductForm;
