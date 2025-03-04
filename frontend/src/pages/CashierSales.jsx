import React from "react";
import { useState, useEffect, useContext, useRef } from "react";
import CashSaleModal from "../components/CashSaleModal";
import AuthContext from "../context/AuthContext";
import del from "../assets/delete.png";
import CashierProductsPage from "./CashierProductsPage";
import HeldSalesModal from "../components/HeldSalesModal";
import ReceiptModal from "../components/ReceiptModal";
import AdminConfirmModal from "../components/AdminConfirmModal";

function CashierSales() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("pos_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [products, setProducts] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [heldSales, setHeldSales] = useState(() => {
    const savedHeldSales = localStorage.getItem("held_sales");
    return savedHeldSales ? JSON.parse(savedHeldSales) : [];
  });
  const [openHeldSalesModal, setOpenHeldSalesModal] = useState(false);
  const [openAdminConfirm, setOpenAdminConfirm] = useState(false);
  const searchInputRef = useRef(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [action, setAction] = useState(null);
  let { authTokens, logoutUser } = useContext(AuthContext);

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

  useEffect(() => {
    let saleTotal = cart
      .reduce((acc, item) => acc + item.product_price * item.quantity, 0)
      .toFixed(2);
    setTotal(saleTotal);
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("pos_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("held_sales", JSON.stringify(heldSales));
  }, [heldSales]);

  useEffect(() => {
    if (searchVal.trim() === "") {
      setFilteredProducts([]);
      setHighlightedIndex(-1);
    } else {
      const filtered = products.filter(
        (product) =>
          product.product_name
            .toLowerCase()
            .includes(searchVal.toLowerCase()) ||
          String(product.product_code).includes(searchVal)
      );
      setFilteredProducts(filtered);
      setHighlightedIndex(filtered.length > 0 ? 0 : -1);
    }
  }, [searchVal]);

  useEffect(() => {
    if (isAdminAuthorized && action) {
      if (action.type === "reduce") {
        console.log(`Reduce ${action.productCode}, change${action.change}`);
        setCart((prevCart) => {
          const currCart = Array.isArray(prevCart) ? prevCart : [];
          return currCart.map((item) => {
            if (item.product_code === action.productCode) {
              const newQuantity = Math.max(1, item.quantity + action.change); // Ensures minimum of 1
              return {
                ...item,
                quantity: newQuantity,
                subtotal: (item.product_price * newQuantity).toFixed(2),
              };
            }
            return item;
          });
        });
      } else if (action.type === "delete") {
        console.log(`delete product ${action.id}`);
        if (
          window.confirm(
            `Are you sure you want to remove this product from cart?`
          )
        ) {
          setCart((prevCart) => {
            const newCart = (Array.isArray(prevCart) ? prevCart : []).filter(
              (item) => item.id !== action.id
            );
            return newCart;
          });
        }
      }
      setIsAdminAuthorized(false);
      setAction(null);
    }
  }, [isAdminAuthorized]);

  function handleSearchChange(e) {
    setSearchVal(e.target.value);
  }

  function handleSelectProduct(product) {
    handleAddToCart(product);
    setSearchVal("");
    setFilteredProducts([]);
    setHighlightedIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      console.warn("Search input ref is not available");
    }
  }

  function handleKeyDown(e) {
    if (filteredProducts.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredProducts.length
        ) {
          handleSelectProduct(filteredProducts[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setFilteredProducts([]);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  }

  function handleAddToCart(product) {
    const inCart = cart.find(
      (item) => item.product_code === product.product_code
    );
    if (inCart) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product_code === product.product_code
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.product_price * (item.quantity + 1)).toFixed(2),
              }
            : item
        )
      );
    } else {
      setCart((prevCart) => [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          subtotal: Number(product.product_price).toFixed(2),
        },
      ]);
    }
  }

  function handleSetConfirm(value) {
    if (value === true) {
      setIsAdminAuthorized(true);
    } else {
      setIsAdminAuthorized(false);
    }
  }

  function handleChangeQuantity(productCode, change) {
    setAction({ type: "reduce", productCode, change });
    setOpenAdminConfirm(true);
  }
  function handleDeleteCartProduct(id) {
    setAction({ type: "delete", id });
    setOpenAdminConfirm(true);
  }

  function holdSale() {
    if (cart.length === 0) {
      alert("No items to hold");
      return;
    }
    const heldSale = {
      id: Date.now(),
      items: [...cart],
      total: total,
      timestamp: new Date().toISOString(),
    };
    setHeldSales((prevHeld) => {
      const currHeldSale = Array.isArray(prevHeld) ? prevHeld : [];
      return [...currHeldSale, heldSale];
    });
    alert("Sale has been put on hold!");
    closeSale();
  }

  function getHeldSale(id) {
    const heldSale = heldSales.find((sale) => sale.id === id);
    if (heldSale) {
      setCart(heldSale.items);
      setTotal(heldSale.total);
      setHeldSales((prevSales) => prevSales.filter((sale) => sale.id !== id));
    }
    setOpenHeldSalesModal(false);
  }
  function deleteHeldSale(id) {
    if (window.confirm("Are you sure you want to delete this held sale?")) {
      setHeldSales((prevSale) => prevSale.filter((sale) => sale.id !== id));
    }
    setOpenHeldSalesModal(false);
  }

  function cancelSale() {
    if (confirm("Are you sure you want to cancel this sale?")) {
      setCart([]);
      setSearchVal("");
      setTotal(0);
      clearCart();
    }
  }
  function handleSubmit(tendered, change) {
    const saleData = {
      total: total,
      payment_method: "cash",
      items: cart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
        price: item.product_price,
      })),
      amount_tendered: tendered,
      change_due: change,
    };

    fetch(`http://127.0.0.1:8000/api/add-sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(saleData),
    })
      .then((res) => {
        if (!res.ok) alert("Saving error");
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setReceiptData(data);
        setShowReceiptModal(true);
        // closeSale();
        closeModal();
      })
      .catch((error) => {
        console.error("Error submitting sale:", error);
        alert("Failed to complete sale: " + error.message);
      });
    clearCart();
    closeModal();
    closeSale();
  }

  function openModal() {
    setIsModalOpen(true);
  }
  function closeModal() {
    setIsModalOpen(false);
  }
  function closeSale() {
    setCart([]);
    setSearchVal("");
    setTotal(0);
    clearCart();
  }

  function clearCart() {
    localStorage.removeItem("pos_cart");
  }
  function handleOpenProductModal() {
    setOpenProductModal(true);
  }
  function handleCloseProductModal() {
    setOpenProductModal(false);
  }

  function handleOpenHelSalesModal() {
    setOpenHeldSalesModal(true);
  }
  function handleCloseHeldSalesModal() {
    setOpenHeldSalesModal(false);
  }

  function closeReceiptModal() {
    setShowReceiptModal(false);
    setReceiptData(null);
    closeSale();
  }
  function handleOpenAdminConfirm() {
    setOpenAdminConfirm(true);
  }
  function handleCloseAdminConfirm() {
    setOpenAdminConfirm(false);
  }
  return (
    <>
      <div className="sales-page-container">
        <div className="sales-list-container">
          <h1>Sales Register</h1>

          <div className="search-product-container">
            <input
              type="text"
              ref={searchInputRef}
              className="search-product-input"
              placeholder="Enter product code or name"
              value={searchVal}
              onChange={(e) => handleSearchChange(e)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={() => handleOpenProductModal()}>
              View Products
            </button>
            <button onClick={() => handleOpenHelSalesModal()}>
              Held Sales
            </button>
          </div>

          {filteredProducts.length > 0 && (
            <ul className="live-search-list">
              {filteredProducts.map((product, index) => (
                <li
                  className="live-search-list-option"
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#f0f0f0")
                  }
                  onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                  style={{
                    backgroundColor:
                      highlightedIndex === index ? "#e0e0e0" : "white",
                  }}
                >
                  Code: {product.product_code} -- Name: {product.product_name}
                </li>
              ))}
            </ul>
          )}
          {openProductModal && (
            <CashierProductsPage closeProductModal={handleCloseProductModal} />
          )}
          {openHeldSalesModal && (
            <HeldSalesModal
              handleCloseHeldSalesModal={handleCloseHeldSalesModal}
              heldSales={heldSales}
              getHeldSale={getHeldSale}
              deleteHeldSale={deleteHeldSale}
            />
          )}
          {showReceiptModal && receiptData && (
            <ReceiptModal
              receipt={receiptData}
              closeReceiptModal={closeReceiptModal}
            />
          )}
          {openAdminConfirm && (
            <AdminConfirmModal
              handleCloseAdminConfirm={handleCloseAdminConfirm}
              handleSetConfirm={handleSetConfirm}
            />
          )}
          <div className="sales-list-table-container">
            <table className="register-sales-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>SubTotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(cart) && cart.length > 0 ? (
                  cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_code}</td>
                      <td>{item.product_name}</td>
                      <td>{item.product_price}</td>
                      <td>
                        <button
                          onClick={() =>
                            handleChangeQuantity(item.product_code, -1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-el">{item.quantity}</span>
                      </td>
                      <td>Ksh {item.subtotal}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteCartProduct(item.id)}
                        >
                          <img src={del} className="delete-btn-img" alt="" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      Add items to cart
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {isModalOpen && (
            <CashSaleModal
              closeModal={closeModal}
              salesTotal={total}
              handleSubmit={handleSubmit}
            />
          )}
        </div>

        <div className="sales-summary-container">
          <h1>Sales Summary</h1>
          <div className="total-container">
            <p>
              Total: <span className="total-el">Ksh {total}</span>
            </p>
          </div>
          <div className="payment-options-container">
            <h3>Payment Options</h3>
            <div className="payment-option-btns">
              <button className="cash-btn" onClick={() => openModal()}>
                Cash
              </button>
              <button className="mpesa-btn">Mpesa</button>
              <button className="card-btn">Card</button>
            </div>
          </div>
          <div className="sale-options-container">
            <h3>Sale Options</h3>
            <div className="sale-option-btns">
              <button className="hold-btn" onClick={() => holdSale()}>
                Hold
              </button>
              <button className="cancel-btn" onClick={() => cancelSale()}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CashierSales;
