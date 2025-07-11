import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import SaleDetailsModal from "../components/SaleDetailsModal";

function SalesAdminPage() {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [saleToView, setSaleToView] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // ✅ Search state
  const { authTokens, logoutUser } = useContext(AuthContext);

  // Fetch sales
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/get-sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sales");
        return res.json();
      })
      .then(setSales)
      .catch(console.error);
  }, []);

  // Fetch employees
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch employees");
        return res.json();
      })
      .then(setEmployees)
      .catch(console.error);
  }, []);

  // Open modal with sale ID
  function handleViewSale(saleId) {
    setSaleToView(saleId); // 👈 Keeps saleId only
    setOpenModal(true);
  }

  function closeModalFunction() {
    setOpenModal(false);
    setSaleToView({});
  }

  // 🔍 Filter sales by sale ID
  const filteredSales = sales.filter((sale) =>
    sale.id.toString().includes(searchQuery.trim())
  );

  return (
    <>
      {openModal && (
        <SaleDetailsModal sale={saleToView} close={closeModalFunction} />
      )}

      <div className="sales-page-container">
        <div className="sales-list-table">
          <h2>Sales Transactions</h2>

          {/* 🔍 Search box */}
          <input
            type="text"
            placeholder="Search by Sale ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "6px", marginBottom: "12px" }}
          />

          <table>
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date</th>
                <th>Employee</th>
                <th>Total (Ksh)</th>
                <th>Amount Tendered</th>
                <th>Change</th>
                <th>Payment Method</th>
                <th>Mpesa Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.id}</td>
                    <td>{new Date(sale.sale_date).toLocaleString()}</td>
                    <td>
                      {(() => {
                        const emp = employees.find(
                          (e) => e.id === sale.seller_id
                        );
                        return emp ? `${emp.first_name} ${emp.last_name}` : "-";
                      })()}
                    </td>
                    <td>{Number(sale.total).toLocaleString() || "0"}</td>
                    <td>{sale.amount_tendered || "NA"}</td>
                    <td>{sale.change || "NA"}</td>
                    <td>{sale.payment_method}</td>
                    <td>N/A</td>
                    <td>
                      <button onClick={() => handleViewSale(sale.id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No matching sales found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default SalesAdminPage;
