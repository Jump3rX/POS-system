import React, { useState } from "react";

function PriceAdjustmentModal({ product, onClose, handleSave }) {
  const [formData, setFormData] = useState({
    product_id: product.id,
    newSellingPrice: product.selling_price || "",
    newCostPrice: product.cost_price || "",
    activationDate: "",
    endDate: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    handleSave(formData);
    setFormData({
      product_id: product.id,
      newSellingPrice: product.selling_price || "",
      newCostPrice: product.cost_price || "", 
      activationDate: "",
      endDate: "",
    });
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="price-form">
          <h2>Adjust Price for {product.product_name}</h2>
          <label>
            Current Selling Price: <span>{product.selling_price}</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.newSellingPrice}
            onChange={(e) =>
              setFormData({ ...formData, newSellingPrice: e.target.value })
            }
            placeholder="New Selling Price"
            required
          />

          <label>
            Current Cost Price: <span>{product.cost_price}</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.newCostPrice}
            onChange={(e) =>
              setFormData({ ...formData, newCostPrice: e.target.value })
            }
            placeholder="New Cost Price"
            required
          />

          <label>Effective From (Optional):</label>
          <input
            type="date"
            value={formData.activationDate}
            onChange={(e) =>
              setFormData({ ...formData, activationDate: e.target.value })
            }
          />

          <label>End date (Optional):</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
          />

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Save
            </button>
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PriceAdjustmentModal;
