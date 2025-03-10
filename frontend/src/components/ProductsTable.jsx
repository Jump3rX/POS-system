import React from "react";
import delt from "../assets/delete.png";
import edt from "../assets/edit.png";
function ProductsTable({ products = [], handleDelete, handleEdit }) {
  function getStockQuantityClassName(stock_quantity, low_stock_level) {
    if (stock_quantity < low_stock_level) {
      return "#ff0000";
    } else if (stock_quantity - low_stock_level <= 5) {
      return "yellow";
    } else {
      return "#00df00";
    }
  }
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>Unit Price</th>
            <th>Stock Quantity</th>
            <th>Low Stock Level</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.product_code}</td>
              <td>{product.product_name}</td>
              <td>{product.product_category}</td>
              <td>{product.product_price}</td>
              <td>
                <span
                  className="stock-quantity-color"
                  style={{
                    backgroundColor: `${getStockQuantityClassName(
                      product.stock_quantity,
                      product.low_stock_level
                    )}`,
                  }}
                >
                  {product.stock_quantity}
                </span>
              </td>
              <td>
                {product.low_stock_level} (
                {product.stock_quantity - product.low_stock_level})
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
