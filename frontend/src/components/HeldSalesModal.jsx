import React from "react";

function HeldSalesModal({
  handleCloseHeldSalesModal,
  heldSales = [],
  getHeldSale,
  deleteHeldSale,
}) {
  return (
    <>
      <div className="modal">
        <div className="modal-content">
          <h2>Sales On Hold</h2>
          <button onClick={() => handleCloseHeldSalesModal()}>Close</button>
          <table>
            <table>
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {heldSales.length > 0 ? (
                  heldSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.id}</td>
                      <td>Ksh {sale.total}</td>
                      <td>{new Date(sale.timestamp).toLocaleString()}</td>
                      <td>
                        <button onClick={() => getHeldSale(sale.id)}>
                          Recover Sale
                        </button>
                        <button onClick={() => deleteHeldSale(sale.id)}>
                          Delete Sale
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      No Sales Held!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </table>
        </div>
      </div>
    </>
  );
}

export default HeldSalesModal;
