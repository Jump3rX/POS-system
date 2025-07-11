import React, { useState, useEffect } from "react";

function EditAdjustedPriceModal({ priceChange, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    id: priceChange?.id || "",
    new_selling_rice: priceChange?.new_selling_price || "",
    new_cost_price: priceChange?.new_cost_price || "",
    activation_date: priceChange?.activation_date?.split("T")[0] || "",
    end_date: priceChange?.end_date?.split("T")[0] || "",
  });

  useEffect(() => {
    if (priceChange) {
      setFormData({
        id: priceChange.id,
        new_selling_price: priceChange.new_selling_price,
        new_cost_price: priceChange.new_cost_price,
        activation_date: priceChange.activation_date?.split("T")[0] || "",
        end_date: priceChange.end_date?.split("T")[0] || "",
      });
    }
  }, [priceChange]);

  function handleSubmit(e) {
    e.preventDefault();
    onUpdate(formData);
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="price-form">
          <h2>Edit Price Change</h2>

          <label>New Selling Price:</label>
          <input
            type="number"
            step="0.01"
            value={formData.new_selling_price}
            onChange={(e) =>
              setFormData({ ...formData, new_selling_price: e.target.value })
            }
            required
          />

          <label>New Cost Price:</label>
          <input
            type="number"
            step="0.01"
            value={formData.new_cost_price}
            onChange={(e) =>
              setFormData({ ...formData, new_cost_price: e.target.value })
            }
            required
          />

          <label>Effective From:</label>
          <input
            type="date"
            value={formData.activation_date}
            onChange={(e) =>
              setFormData({ ...formData, activation_date: e.target.value })
            }
          />

          <label>End Date (Optional):</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
          />

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Update
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

export default EditAdjustedPriceModal;
