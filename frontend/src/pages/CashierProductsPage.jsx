import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";

function CashierProductsPage({ closeProductModal }) {
  let { authTokens, logoutUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        setProducts(data);
      });
  }, []);
  return (
    <div className="cashier-products-modal">
      <div className="cashier-products-modal-content">
        <h2>Current Products List</h2>
        <div className="cashier-products-table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Low Stock Level</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.product_code}</td>
                  <td>{p.product_name}</td>
                  <td>{p.product_category}</td>
                  <td>Ksh {Number(p.selling_price).toLocaleString() || "0"}</td>
                  <td>{p.quantity}</td>
                  <td>{p.low_stock_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => closeProductModal()}>Close</button>
      </div>
    </div>
  );
}

export default CashierProductsPage;
