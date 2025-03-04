import React, { useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ReceiptModal({ receipt, closeReceiptModal }) {
  const receiptRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleString();
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper function to safely parse numbers
  const safeParseFloat = (value) => {
    if (value === undefined || value === null) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add company logo or header
    doc.setFontSize(20);
    doc.text("SALES RECEIPT", 105, 15, { align: "center" });

    // Add receipt info - use fallbacks for missing data
    const receiptId = receipt.sale_id || `Receipt-${Date.now()}`;
    const seller = receipt.seller || "Cashier";

    doc.setFontSize(12);
    doc.text(`Receipt #: ${receiptId}`, 14, 30);
    doc.text(`Date: ${formatDate(receipt.sale_date)}`, 14, 37);
    doc.text(
      `Payment Method: ${(receipt.payment_method || "Cash").toUpperCase()}`,
      14,
      51
    );

    // Create items table
    const tableColumn = ["Item", "Qty", "Price", "Subtotal"];
    const tableRows = [];

    // Process items safely with fallbacks
    (receipt.items || []).forEach((item) => {
      // Ensure all values are properly parsed as numbers
      const quantity = safeParseFloat(item.quantity);
      const price = safeParseFloat(item.price);
      // Calculate subtotal here instead of relying on the provided value
      const subtotal = quantity * price;

      const itemData = [
        item.product_name || "Item",
        quantity,
        `Ksh ${price.toFixed(2)}`,
        `Ksh ${subtotal.toFixed(2)}`,
      ];
      tableRows.push(itemData);
    });

    // Use the imported autoTable function
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    // Add totals below the table with safe parsing
    const finalY = doc.lastAutoTable.finalY + 10;
    const total = safeParseFloat(receipt.total);
    const amountTendered = safeParseFloat(receipt.amount_tendered);
    const change = safeParseFloat(receipt.change);

    doc.text(`Total: Ksh ${total.toFixed(2)}`, 130, finalY);
    doc.text(
      `Amount Tendered: Ksh ${amountTendered.toFixed(2)}`,
      130,
      finalY + 7
    );
    doc.text(`Change: Ksh ${change.toFixed(2)}`, 130, finalY + 14);

    // Add footer
    doc.setFontSize(10);
    doc.text(`You were served by: ${seller}`, 14, 44);
    doc.text("Thank you for your business!", 105, finalY + 30, {
      align: "center",
    });

    // Save the PDF
    doc.save(`${receiptId}.pdf`);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-overlay">
          <div className="receipt-modal">
            <div className="receipt-content" ref={receiptRef}>
              <div className="receipt-header">
                <h2>Sales Receipt</h2>
                <p>Receipt #: {receipt.sale_id || "New Receipt"}</p>
                <p>Date: {formatDate(receipt.sale_date)}</p>
              </div>

              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(receipt.items || []).map((item, index) => {
                    // Safely parse values and calculate subtotal
                    const quantity = safeParseFloat(item.quantity);
                    const price = safeParseFloat(item.price);
                    const subtotal = quantity * price;

                    return (
                      <tr key={index}>
                        <td>{item.product_name || "Item"}</td>
                        <td>{quantity}</td>
                        <td>Ksh {price.toFixed(2)}</td>
                        <td>Ksh {subtotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="receipt-summary">
                <p>
                  <strong>Total:</strong> Ksh{" "}
                  {safeParseFloat(receipt.total).toFixed(2)}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {receipt.payment_method || "Cash"}
                </p>
                <p>
                  <strong>Amount Tendered:</strong> Ksh{" "}
                  {safeParseFloat(receipt.amount_tendered).toFixed(2)}
                </p>
                <p>
                  <strong>Change:</strong> Ksh{" "}
                  {safeParseFloat(receipt.change).toFixed(2)}
                </p>
              </div>

              <div className="receipt-footer">
                <p>You were served by: {receipt.seller || "Cashier"}</p>
                <p>Thank you for your business!</p>
              </div>
            </div>

            <div className="receipt-actions">
              <button onClick={generatePDF}>Download PDF</button>
              <button onClick={closeReceiptModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;
