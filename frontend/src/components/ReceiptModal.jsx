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
    const itemCount = (receipt.items || []).length;
    const estimatedHeight = 150 + itemCount * 20 + 100;
    const docHeight = Math.max(estimatedHeight, 300);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [165, docHeight], // 58mm width in points (~2.83 * 58)
    });

    const receiptId = receipt.sale_id || `Receipt-${Date.now()}`;
    const seller = receipt.seller || "Cashier";

    doc.setFontSize(10);
    doc.text("POS SUPERMARKET", 82.5, 20, { align: "center" });
    doc.setFontSize(8);
    doc.text("Sales Receipt", 82.5, 35, { align: "center" });

    doc.setFontSize(7);
    doc.text(`Receipt #: ${receiptId}`, 10, 50);
    doc.text(`Date: ${new Date(receipt.sale_date).toLocaleString()}`, 10, 60);
    doc.text(`Cashier: ${seller}`, 10, 70);
    doc.text(
      `Payment: ${(receipt.payment_method || "Cash").toUpperCase()}`,
      10,
      80
    );

    const tableColumn = ["Item", "Qty", "Ksh", "Sub"];
    const tableRows = [];

    (receipt.items || []).forEach((item) => {
      const quantity = safeParseFloat(item.quantity);
      const price = safeParseFloat(item.price);
      const subtotal = quantity * price;

      tableRows.push([
        item.product_name || "Item",
        quantity.toString(),
        price.toFixed(2),
        subtotal.toFixed(2),
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: "plain",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 70 }, // Item
        1: { cellWidth: 20, halign: "right" }, // Qty
        2: { cellWidth: 30, halign: "right" }, // Price
        3: { cellWidth: 30, halign: "right" }, // Subtotal
      },
      margin: { left: 10, right: 10 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const total = safeParseFloat(receipt.total);
    const amountTendered = safeParseFloat(receipt.amount_tendered);
    const change = safeParseFloat(receipt.change);

    doc.setFontSize(8);
    doc.text(`Total: Ksh ${total.toFixed(2)}`, 155, finalY, { align: "right" });
    doc.text(`Tendered: Ksh ${amountTendered.toFixed(2)}`, 155, finalY + 10, {
      align: "right",
    });
    doc.text(`Change: Ksh ${change.toFixed(2)}`, 155, finalY + 20, {
      align: "right",
    });

    doc.setFontSize(7);
    doc.text("Thank you for shopping!", 82.5, finalY + 40, {
      align: "center",
    });

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
