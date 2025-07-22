import React from "react";
import { useState, useEffect } from "react";
import delt from "../assets/delete.png";
import edt from "../assets/edit.png";
function ProductsTable({ products = [], handleDelete, handleEdit }) {
  const [productList, setProductList] = useState([]);
  useEffect(() => {
    if (products.length > 0) {
      setProductList(products);
    }
  }, [products]);

  function getStockQuantityClassName(quantity, low_stock_level) {
    if (quantity < low_stock_level) {
      return "#ff0000";
    } else if (quantity - low_stock_level <= 5) {
      return "yellow";
    } else {
      return "#00df00";
    }
  }

  function handleSearch(value) {
    if (value === "") {
      setProductList(products);
    } else {
      const searchTerm = value.toLowerCase();

      const filteredProducts = products.filter((product) => {
        const code = String(product.product_code); // convert number to string
        const name = product.product_name.toLowerCase();

        return code.includes(searchTerm) || name.includes(searchTerm);
      });

      setProductList(filteredProducts);
      console.log(filteredProducts);
    }
  }
  function handleSort() {
    const sortSelect = document.getElementById("sort");
    const sortValue = sortSelect.value;

    const sortedProducts = [...productList].sort((a, b) => {
      if (sortValue === "code") {
        return a.product_code - b.product_code;
      } else if (sortValue === "name") {
        return a.product_name.localeCompare(b.product_name);
      } else if (sortValue === "category") {
        return a.product_category.localeCompare(b.product_category);
      } else if (sortValue === "price") {
        return a.selling_price - b.selling_price;
      } else if (sortValue === "stock") {
        return a.quantity - b.quantity;
      }
      return 0;
    });

    setProductList(sortedProducts);
  }
  function handleReset() {
    setProductList(products);
    document.getElementById("search").value = "";
    document.getElementById("sort").selectedIndex = 0;
  }

  return (
    <>
      <div className="search-sort-container">
        <div className="product-search-bar-container">
          <label htmlFor="search">Search Product</label>
          <input
            name="search"
            type="text"
            placeholder="Search by code or name"
            className="product-search-bar"
            id="search"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="sorting-container">
          <label htmlFor="sort">Sort By</label>
          <select id="sort" name="sort" className="sorting-select">
            <option value="" selected disabled>
              --Select Sort Option--
            </option>
            <option value="code">Product Code</option>
            <option value="name">Product Name</option>
            <option value="category">Category</option>
            <option value="price">Price</option>
            <option value="stock">Stock Quantity</option>
          </select>

          <button className="sort-btn" onClick={() => handleSort()}>
            Sort
          </button>
          <button className="reset-btn" onClick={() => handleReset()}>
            Reset
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>Batch No.</th>
            <th>Selling Price</th>
            <th>Cost Price</th>
            <th>Stock Quantity</th>
            <th>Low Stock Level</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {productList.map((product) => (
            <tr key={product.id}>
              <td>{product.product_code}</td>
              <td>{product.product_name}</td>
              <td>{product.product_category}</td>
              <td>{product.batch_number || "-"}</td>
              <td>{product.selling_price}</td>
              <td>{product.cost_price}</td>
              <td>
                <span
                  className="stock-quantity-color"
                  style={{
                    backgroundColor: `${getStockQuantityClassName(
                      product.quantity,
                      product.low_stock_level
                    )}`,
                  }}
                >
                  {product.quantity}
                </span>
              </td>
              <td>
                {product.low_stock_level} (
                {product.quantity - product.low_stock_level})
              </td>
              <td className="action-btns">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(product)}
                >
                  <img src={edt} alt="" className="edit-btn-img" />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  <img src={delt} alt="" className="delete-btn-img" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default ProductsTable;
