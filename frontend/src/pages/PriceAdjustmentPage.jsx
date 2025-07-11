import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import PriceAdjustmentModal from "../components/PriceAdjustmentModal";
import EditAdjustedPriceModal from "../components/EditAdjustedPriceModal";

function PriceAdjustmentPage() {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editPriceChange, setEditPriceChange] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getProducts();
    getPrices();
  }, []);

  function getProducts() {
    fetch("http://127.0.0.1:8000/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 401 || res.statusText === "Unauthorized") {
          logoutUser();
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data); // Initialize filtered products
      });
  }

  function getPrices() {
    fetch("http://127.0.0.1:8000/api/get-price-changes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 401 || res.statusText === "Unauthorized") {
          logoutUser();
        }
        return res.json();
      })
      .then((data) => {
        setPrices(data);
        console.log(data);
      });
  }

  function handleSearch(e) {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (p) =>
          p.product_name.toLowerCase().includes(value) ||
          String(p.product_code).includes(value)
      );
      setFilteredProducts(filtered);
    }
  }

  function handleOpenModal(product) {
    setOpenModal(true);
    setSelectedProduct(product);
  }

  function handleCloseModal() {
    setOpenModal(false);
    setSelectedProduct(null);
  }

  function handleSave(data) {
    console.log(data);
    fetch(`http://127.0.0.1:8000/api/price-changes/${data.product_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (res.status === 401 || res.statusText === "Unauthorized") {
          logoutUser();
        }
        return res.json();
      })
      .then((data) => {
        alert(data.message);
        getProducts();
        getPrices();
      });
    handleCloseModal();
  }
  function handleEditPrice(product) {
    console.log(product);
    setEditPriceChange(product);
    setEditModal(true);
  }

  function handleUpdatePrice(data) {
    console.log(data);
    fetch(`http://127.0.0.1:8000/api/price-change-edit/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (res.status === 401 || res.statusText === "Unauthorized") {
          logoutUser();
        }
        return res.json();
      })
      .then((response) => {
        if (response.errors || response.message?.includes("Invalid")) {
          alert(
            "Error: " + JSON.stringify(response.errors || response.message)
          );
        } else {
          alert(response.message);
          setEditModal(false);
          getProducts();
          getPrices();
        }
      })
      .catch((err) => {
        alert("Request failed: " + err.message);
      });
  }
  return (
    <div className="price-adjustment-container">
      <h2>Product Price Adjustment</h2>

      {/* Search Input */}
      <div
        className="product-search-bar-container"
        style={{ marginBottom: "1rem" }}
      >
        <label htmlFor="search">Search Product</label>
        <input
          type="text"
          id="search"
          name="search"
          placeholder="Search by code or name"
          value={searchTerm}
          onChange={handleSearch}
          className="product-search-bar"
        />
      </div>

      {/* Table */}
      <div className="price-adjust-table-container">
        <table className="price-adjustment-table">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Name</th>
              <th>New Selling price</th>
              <th>New Cost Price</th>
              <th>Starting</th>
              <th>Ending</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts?.length > 0 ? (
              filteredProducts.map((product) => {
                const priceChange = prices.find(
                  (p) => p.product === product.id
                );

                return (
                  <tr key={product.id}>
                    <td>{product.product_code}</td>
                    <td>{product.product_name}</td>

                    {priceChange ? (
                      <>
                        <td>{priceChange.new_selling_price}</td>
                        <td>{priceChange.new_cost_price}</td>
                        <td>{priceChange.activation_date || "--"}</td>
                        <td>{priceChange.end_date || "--"}</td>
                      </>
                    ) : (
                      <>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                      </>
                    )}

                    <td>
                      <button onClick={() => handleOpenModal(product)}>
                        Adjust Price
                      </button>
                      {priceChange && (
                        <button onClick={() => handleEditPrice(priceChange)}>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} style={{ textAlign: "center" }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openModal && (
        <PriceAdjustmentModal
          product={selectedProduct}
          onClose={handleCloseModal}
          handleSave={handleSave}
        />
      )}

      {editModal && (
        <EditAdjustedPriceModal
          priceChange={editPriceChange}
          onClose={() => setEditModal(false)}
          onUpdate={handleUpdatePrice}
        />
      )}
    </div>
  );
}

export default PriceAdjustmentPage;
