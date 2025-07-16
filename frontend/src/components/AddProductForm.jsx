import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function AddProductForm({ handleAddNewProduct }) {
  let { authTokens, logoutUser } = useContext(AuthContext);
  const [product, setProduct] = useState({
    product_code: "",
    product_name: "",
    product_category: "",
    selling_price: "",
    cost_price: "",
    quantity: "",
    low_stock_level: "",
    total_quantity: "",
    expiry_date: "",
    batch_number: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (
      product.product_code &&
      product.product_name &&
      product.product_category &&
      product.selling_price &&
      product.cost_price &&
      product.quantity &&
      product.low_stock_level
    ) {
      const finalData = {
        ...product,
        total_quantity: product.quantity || 0,
      };
      fetch("http://127.0.0.1:8000/api/add-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify({ product: finalData }),
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
            seling_price: "",
            cost_price: "",
            quantity: "",
            low_stock_level: "",
            total_quantity: "",
            expiry_date: "",
            batch_number: "",
          });
          alert("Product added successfully!");
        });
    } else {
      alert("Values cannot be empty!");
    }
  }

  return (
    <div className="add-product-form-container">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="product-form-inputs">
          <input
            type="number"
            name="product_code"
            placeholder="Product Code"
            value={product.product_code}
            onChange={(e) =>
              setProduct({ ...product, product_code: e.target.value })
            }
          />
          <input
            type="text"
            name="product_name"
            placeholder="Product Name"
            value={product.product_name}
            onChange={(e) =>
              setProduct({ ...product, product_name: e.target.value })
            }
          />
          <input
            type="text"
            name="product_category"
            placeholder="Product Category"
            value={product.product_category}
            onChange={(e) =>
              setProduct({ ...product, product_category: e.target.value })
            }
          />
          <input
            type="number"
            name="selling_price"
            placeholder="Selling Price"
            value={product.selling_price}
            onChange={(e) =>
              setProduct({ ...product, selling_price: e.target.value })
            }
          />
          <input
            type="number"
            name="cost_price"
            placeholder="Cost Price"
            value={product.cost_price}
            onChange={(e) =>
              setProduct({ ...product, cost_price: e.target.value })
            }
          />

          <input
            type="number"
            name="quantity"
            placeholder="Stock Quantity"
            value={product.quantity}
            onChange={(e) =>
              setProduct({ ...product, quantity: e.target.value })
            }
          />
          <input
            type="number"
            name="low_stock_level"
            placeholder="Low Stock Alert Quantity"
            value={product.low_stock_level}
            onChange={(e) =>
              setProduct({ ...product, low_stock_level: e.target.value })
            }
          />
          <input
            type="date"
            name="expiry_date"
            placeholder="Expiry Date"
            value={product.expiry_date}
            onChange={(e) =>
              setProduct({ ...product, expiry_date: e.target.value })
            }
          />
          <input
            type="text"
            name="batch_number"
            placeholder="Batch Number"
            value={product.batch_number}
            onChange={(e) =>
              setProduct({ ...product, batch_number: e.target.value })
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
