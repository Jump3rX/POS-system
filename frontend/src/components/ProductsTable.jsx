import React from "react";

function ProductsTable({ products = [], handleDelete, handleEdit }) {
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
              <td>{product.stock_quantity}</td>
              <td className="action-btns">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
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
