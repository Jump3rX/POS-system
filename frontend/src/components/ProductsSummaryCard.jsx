import React from "react";

function ProductsSummaryCard(props) {
  const { total } = props;
  return (
    <>
      <div className="product-summary-card">
        <h2>All Products</h2>
        <p>
          Total Products: <span>{total}</span>
        </p>
        <p>
          In Stock: <span>{total}</span>
        </p>
        <p>
          Out of Stock: <span>0</span>
        </p>
      </div>
    </>
  );
}

export default ProductsSummaryCard;
