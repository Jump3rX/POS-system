import React from "react";
import { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import edt from "../assets/edit.png";
import eye from "../assets/eye.png";

function SalesAdminPage() {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  let { authTokens, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/get-sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update!");
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setSales(data);
      });
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update!");
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setEmployees(data);
      });
  }, []);

  return (
    <>
      <div className="sales-page-container">
        <div className="sales-list-table">
          <h2>Sales Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date</th>
                <th>Employee</th>
                <th>Total(Ksh)</th>
                <th>Amount Tendered</th>
                <th>Change Due</th>
                <th>Payment Method</th>
                <th>Mpesa Code</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{new Date(sale.sale_date).toLocaleString()}</td>
                  <td>
                    {(() => {
                      const employee = employees.find(
                        (i) => i.id === sale.seller_id
                      );
                      return employee
                        ? `${employee.first_name} ${employee.last_name}`
                        : "Unknown";
                    })()}
                  </td>
                  <td>{Number(sale.total)?.toLocaleString() || "0"}</td>
                  <td>{sale.amount_tendered || "NA"}</td>
                  <td>{sale.change || "NA"}</td>
                  <td>{sale.payment_method}</td>
                  <td>N/A</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default SalesAdminPage;
