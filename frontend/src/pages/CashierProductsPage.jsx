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
    <>
      <div className="modal">
        <div className="modal-content">
          <div className="cashier-products-container">
            <div className="table-container">
              <h2>Current Products List</h2>
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
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
                      <td>{Number(p.product_price).toLocaleString() || "0"}</td>
                      <td>{p.stock_quantity}</td>
                      <td>{p.low_stock_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button onClick={() => closeProductModal()}>Close</button>
        </div>
      </div>
    </>
  );
}

export default CashierProductsPage;
