import React from "react";
import { useState, useEffect, useContext } from "react";
import RestockOrderForm from "../components/RestockOrderForm";
import AuthContext from "../context/AuthContext";

function RestockPage() {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [stockData, setStockData] = useState({});
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [productToRestock, setProductToRestock] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  function fetchProducts() {
    fetch("http://127.0.0.1:8000/api/stock-data", {
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
        setStockData(data);
        setLowStockProducts(data.low_stock_products);
      });
  }
  function openRestockModal(product) {
    setProductToRestock(product);
    setOpenModal(true);
  }
  function closeRestockModal() {
    setProductToRestock({});
    setOpenModal(false);
    fetchProducts();
  }
  return (
    <div>
      <div className="restock-page-container">
        <div className="left-main">
          <div className="top-section">
            <div className="card">
              <div className="card-body">
                <p className="bold-black">{stockData.total_stock}</p>
                <p className="small-gray">Total products</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="bold-black">{stockData.low_stock}</p>
                <p className="small-gray">Low Stock Products</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="bold-black">0</p>
                <p className="small-gray">Out of Stock</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="bold-black">{stockData.pending_restock}</p>
                <p className="small-gray">Pending Restock</p>
              </div>
            </div>
          </div>
          <div className="main-section">
            <h2>Low Stock Products</h2>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price (Ksh)</th>
                  <th>Stock</th>
                  <th>Low Stock Alert</th>
                  <th>Restock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.product_code}</td>
                      <td>{product.product_name}</td>
                      <td>{product.product_category}</td>
                      <td>{product.product_price}</td>
                      <td>{product.stock_quantity}</td>
                      <td>{product.low_stock_level}</td>
                      <td>
                        <button onClick={() => openRestockModal(product)}>
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      No products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {openModal && (
            <RestockOrderForm
              closeModal={closeRestockModal}
              product={productToRestock}
            />
          )}
        </div>

        <div className="side-panel">
          <h2>Restock Requests</h2>
          <div className="restock-request-list">
            <ul className="restock-list">
              <li>
                Restock request <button>View</button>
              </li>
              <li>
                Restock request <button>View</button>
              </li>
              <li>
                Restock request <button>View</button>
              </li>
              <li>
                Restock request <button>View</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestockPage;
