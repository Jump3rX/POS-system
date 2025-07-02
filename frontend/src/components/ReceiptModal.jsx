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
    // Create jsPDF document with 80mm width (~227 points) and variable height
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [227, 842], // 80mm width, A4 height as max (adjusted dynamically)
    });

    // Helper function for safe parsing (unchanged)
    const safeParseFloat = (value) => {
      return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    };

    // Helper function to format date (unchanged)
    const formatDate = (date) => {
      return date
        ? new Date(date).toLocaleDateString("en-KE")
        : new Date().toLocaleDateString("en-KE");
    };

    // Add company header (compact)
    doc.setFontSize(12); // Smaller font for header
    doc.text("POS Supermarket", 113.5, 20, { align: "center" }); // Centered for 227pt width
    doc.setFontSize(10);
    doc.text("SALES RECEIPT", 113.5, 35, { align: "center" });

    // Add receipt info
    const receiptId = receipt.sale_id || `Receipt-${Date.now()}`;
    const seller = receipt.seller || "Cashier";

    doc.setFontSize(8); // Smaller font for details
    doc.text(`Receipt #: ${receiptId}`, 10, 50);
    doc.text(`Date: ${formatDate(receipt.sale_date)}`, 10, 60);
    doc.text(`Served by: ${seller}`, 10, 70);
    doc.text(
      `Payment: ${(receipt.payment_method || "Cash").toUpperCase()}`,
      10,
      80
    );

    // Create items table
    const tableColumn = ["Item", "Qty", "Price", "Subtotal"];
    const tableRows = [];

    // Process items
    (receipt.items || []).forEach((item) => {
      const quantity = safeParseFloat(item.quantity);
      const price = safeParseFloat(item.price);
      const subtotal = quantity * price;

      const itemData = [
        (item.product_name || "Item").substring(0, 15), // Truncate for narrow width
        quantity,
        `Ksh ${price.toFixed(2)}`,
        `Ksh ${subtotal.toFixed(2)}`,
      ];
      tableRows.push(itemData);
    });

    // Add table with compact styling
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 2 }, // Smaller font, tighter padding
      headStyles: { fillColor: [66, 66, 66], fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 90 }, // Item name
        1: { cellWidth: 30 }, // Quantity
        2: { cellWidth: 50 }, // Price
        3: { cellWidth: 50 }, // Subtotal
      },
      margin: { left: 10, right: 10 }, // Fit within 80mm width
    });

    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10;
    const total = safeParseFloat(receipt.total);
    const amountTendered = safeParseFloat(receipt.amount_tendered);
    const change = safeParseFloat(receipt.change);

    doc.setFontSize(8);
    doc.text(`Total: Ksh ${total.toFixed(2)}`, 150, finalY, { align: "right" });
    doc.text(
      `Amount Tendered: Ksh ${amountTendered.toFixed(2)}`,
      150,
      finalY + 10,
      { align: "right" }
    );
    doc.text(`Change: Ksh ${change.toFixed(2)}`, 150, finalY + 20, {
      align: "right",
    });

    // Add footer
    doc.setFontSize(7);
    doc.text("Thank you for shopping with us!", 113.5, finalY + 35, {
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
