import { useState } from "react";
import React from "react";

function CashSaleModal({ closeModal, salesTotal, handleSubmit }) {
  const [tendered, setTendered] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);

  function findChange(value) {
    setTendered(value);
    let change = value - salesTotal;
    setChangeAmount(change);
  }
  return (
    <div className="modal">
      <div className="modal-content">
        <h1 className="change-display">TOTAL: Ksh {salesTotal}</h1>
        <form>
          <label htmlFor="cash">Amount Tendered</label>
          <input
            type="text"
            className="tendered-input"
            id="cash"
            onChange={(e) => findChange(e.target.value)}
          />

          <label htmlFor="change">Change Due</label>
          <input
            type="text"
            className="change-input"
            id="change"
            disabled
            value={changeAmount}
          />

          <button
            className="complete-btn"
            onClick={() => handleSubmit(tendered, changeAmount)}
          >
            Complete Sale
          </button>
          <button className="cancel-btn" onClick={() => closeModal()}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
}

export default CashSaleModal;
