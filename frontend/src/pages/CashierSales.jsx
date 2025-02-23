import React from "react";
import { useState, useEffect, useContext } from "react";
import CashSaleModal from "../components/CashSaleModal";
import AuthContext from "../context/AuthContext";
import { useAsyncError } from "react-router-dom";
function CashierSales() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("pos_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [products, setProducts] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [total, setTotal] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  function handleSetSearchVal(value) {
    setSearchVal(value);
    if (value.length === 6) {
      let pCode = parseInt(value, 10);
      let found = products.find((p) => p.product_code === pCode);
      if (found) {
        handleAddToCart(found);
      } else {
        alert("Product not found!");
        setSearchVal("");
      }
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
    // setCart((c) => (c.length == 0 ? [product] : [...c, product]));
    setSearchVal("");
  }

  function handleChangeQuantity(productCode, newQuantity) {
    // let tempCart = [...cart];
    // let quantity = newQuantity;
    // if (isNaN(quantity) || quantity < 1) {
    //   quantity = 1;
    // }
    // tempCart = tempCart.map((item) => {
    //   item.product_code === productCode
    //     ? {
    //         ...item,
    //         quantity,
    //         subtotal: (item.product_price * quantity).toFixed(2),
    //       }
    //     : item;
    // });
    // setCart(tempCart);
  }
  function cancelSale() {
    if (confirm("Are you sure you want to cancel this sale?")) {
      setCart([]);
      setSearchVal("");
      setTotal();
      clearCart();
    }
  }
  function holdSale() {
    console.log("HOLD!!!");
  }

  function closeSale() {
    setCart([]);
    setSearchVal("");
    setTotal();
    clearCart();
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
      .then((res) => res.json())
      .then((data) => console.log(data));
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

  function clearCart() {
    localStorage.removeItem("pos_cart");
  }
  return (
    <>
      <div className="sales-page-container">
        <div className="sales-list-container">
          <h1>Sales List</h1>
          <form>
            <div className="search-product-container">
              <input
                type="number"
                className="search-product-input"
                placeholder="Enter product code or name"
                value={searchVal}
                onChange={(e) => handleSetSearchVal(e.target.value)}
              />
            </div>
          </form>

          <div className="sales-list-table-container">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>SubTotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_code}</td>
                      <td>{item.product_name}</td>
                      <td>{item.product_price}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleChangeQuantity(
                              item.product_code,
                              parseInt(e.target.value, 10)
                            )
                          }
                        />
                      </td>
                      <td>Ksh {item.product_price * item.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
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
