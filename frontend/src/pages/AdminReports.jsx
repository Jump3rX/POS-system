import React from "react";
import loadingGif from "../assets/loader.gif";
import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

function AdminReports() {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getFirstDayOfMonth = () => {
    const today = new Date();
    const firstDay = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), 1)
    );
    return firstDay.toISOString().split("T")[0];
  };

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productCode, setProductCode] = useState("");
  const [fromDate, setFromDate] = useState(getFirstDayOfMonth());
  const [toDate, setToDate] = useState(getCurrentDate());
  const [emailSettings, setEmailSettings] = useState({
    auto_send: false,
    frequency: "daily",
  });
  const [watchedProduct, setWatchedProduct] = useState({
    product: "",
    threshold: 0,
  });
  let { logoutUser, authTokens } = useContext(AuthContext);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/reports-dashboard", {
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
        setData(data);
        setLoading(false);
        setTopProducts(data?.top_products);
      });
  }, []);

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
        console.log(data);
        setAllProducts(data);
      });
  }, []);

  useEffect(() => {
    autoEmailSettingFunction();
  }, []);

  function autoEmailSettingFunction() {
    fetch("http://127.0.0.1:8000/api/auto-email-settings", {
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
        setEmailSettings(data);
      });
  }
  function downloadInventoryReport(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/inventory-report", {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventory_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  function downloadSalesReport(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/sales-report", {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sales_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  function downloadLowStockReport(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/low-stock-report", {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "low_stock_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  function downloadMonthlySalesReport(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/monthly-sales-report", {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mothly_sales_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  function downloadWeeklySalesReport(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/weekly-sales-report", {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "weekly_sales_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  function downloadDailySalesReport(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/daily-sales-report", {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "daily_sales_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  function downloadSingleProductSalesReport(e) {
    e.preventDefault();

    if (!productCode) {
      alert("Please enter a product code!");
      return;
    }
    const productExists = allProducts.some(
      (product) => product.product_code === parseInt(productCode)
    );
    if (!productExists) {
      alert("This product does not exist, try again!");
      return;
    }
    fetch(
      `http://127.0.0.1:8000/api/single-product-report?product_code=${encodeURIComponent(
        productCode
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
          "Authorization": "Bearer " + String(authTokens.access),
        },
      }
    )
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sinlge_product_sales_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setProductCode("");
      });
  }
  function downloadCustomDateReport(e) {
    e.preventDefault();

    if (!fromDate || !toDate) {
      alert("Please enter both 'from' and 'to' dates.");
      return;
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      alert("Please enter dates in the format YYYY-MM-DD (e.g., 2025-01-01).");
      return;
    }

    // Validate that fromDate is not after toDate
    if (new Date(fromDate) > new Date(toDate)) {
      alert("'From' date must be before or equal to 'To' date.");
      return;
    }

    console.log(fromDate, toDate);

    fetch(
      `http://127.0.0.1:8000/api/custom-dates-report?from=${fromDate}&to=${toDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
          "Authorization": "Bearer " + String(authTokens.access),
        },
      }
    )
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sales_report_${fromDate}_to_${toDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setProductCode("");
      });
  }

  function sendEmail() {
    console.log("working!!");
    fetch(`http://127.0.0.1:8000/api/send-email`, {
      headers: {
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
        //alert(`${data.message}, ${error ? error : ""}`);
        alert(data.message, data.error || "");
      });
  }

  function handleSaveSettings() {
    fetch("http://127.0.0.1:8000/api/auto-email-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(emailSettings),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        alert(data.message, data.error || "");
      });
  }

  function handleSaveWatchedProduct() {
    console.log(watchedProduct);
    fetch("http://127.0.0.1:8000/api/watch-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(watchedProduct),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        alert(data.message, data.error || "");
      });
  }

  function handleSetWatched(code) {
    const matchedProduct = allProducts.find(
      (product) => product.product_code === code
    );
    setWatchedProduct({
      ...watchedProduct,
      product: matchedProduct.id,
    });
  }
  return (
    <>
      {loading ? (
        <img src={loadingGif} alt="" />
      ) : (
        <div className="admin-reports-page-container">
          <div className="report-cards">
            <div className="report-card">
              <h2>Ksh {data?.weekly_sales?.toLocaleString() || 0}</h2>
              <p>Weekly Sales</p>
            </div>
            <div className="report-card">
              <h2>Ksh {data?.monthly_sales?.toLocaleString() || 0}</h2>
              <p>Monthly Sales</p>
            </div>
            <div className="report-card">
              <h2>{data?.weekly_product_sales?.toLocaleString() || 0}</h2>
              <p>Weekly Product Sales</p>
            </div>
            <div className="report-card">
              <h2>{data?.monthly_product_sales?.toLocaleString() || 0}</h2>
              <p>Monthly Product Sales</p>
            </div>
            <div className="report-card">
              <h2>{data?.employee_data || 0}</h2>
              <p>Total Employees</p>
            </div>
          </div>
          <div className="chart-downloads-section">
            <div className="revenue-chart">
              <div className="chart">
                <h2>Most Sold Products</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Product Code</th>
                      <th>Product Name</th>
                      <th>Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts?.length > 0 ? (
                      topProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.product__product_code}</td>
                          <td>{product.product__product_name}</td>
                          <td>{product.total_quantity}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center" }}>
                          No Items to view
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="downloads-section">
              <h2>Downloads</h2>
              <button onClick={(e) => downloadInventoryReport(e)}>
                Inventory Records
              </button>
              <button onClick={(e) => downloadSalesReport(e)}>
                Sales Records
              </button>

              <button onClick={(e) => downloadLowStockReport(e)}>
                Low Stock Report
              </button>

              <button onClick={(e) => downloadMonthlySalesReport(e)}>
                Monthly Sales Report
              </button>

              <button onClick={(e) => downloadWeeklySalesReport(e)}>
                Weekly Sales Report
              </button>

              <button onClick={(e) => downloadDailySalesReport(e)}>
                Daily Sales Report
              </button>
              <hr />
              <button onClick={() => sendEmail()}>Send Email</button>
            </div>
          </div>

          <div className="custom-download-section">
            <h2>Custom Reports</h2>
            <hr />
            <div className="custom-reports-input-container">
              <div>
                <h5>Specific Product Sales Report</h5>
                <input
                  type="text"
                  name="product-code"
                  placeholder="Enter code for specific product"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="single-product-input"
                />
                <button onClick={(e) => downloadSingleProductSalesReport(e)}>
                  Download
                </button>
              </div>

              <div>
                <h5>View Sales For Specific Time</h5>
                <label htmlFor="">From:</label>
                <input
                  type="date"
                  name="from-date"
                  id="from"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />

                <label htmlFor="to">To:</label>
                <input
                  type="date"
                  name="to-date"
                  id="to"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />

                <button onClick={(e) => downloadCustomDateReport(e)}>
                  Download
                </button>
              </div>
            </div>

            <div className="auto-response-container">
              <div>
                <h5>Auto Email Settings</h5>

                <small>
                  Low stock products auto email:{" "}
                  {emailSettings.auto_send === false ? "DISABLED" : "ENABLED"}
                </small>

                <br />
                <label>
                  <input
                    type="checkbox"
                    checked={emailSettings.auto_send}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        auto_send: e.target.checked,
                      })
                    }
                  />
                  Enable Auto-Send
                </label>
                <br />
                <label htmlFor="frequency">Frequency</label>
                <select
                  value={emailSettings.frequency}
                  onChange={(e) =>
                    setEmailSettings({
                      ...emailSettings,
                      frequency: e.target.value,
                    })
                  }
                  disabled={!emailSettings.auto_send}
                  id="frequency"
                >
                  <option value="off">Off</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <button onClick={handleSaveSettings}>Save</button>
              </div>

              <div>
                <h5>Watch Product</h5>
                <p>Specific Product Stock Alert</p>
                <label htmlFor="productCode">Enter Product Code</label>
                <input
                  id="productCode"
                  type="text"
                  value={watchedProduct.product.product_code}
                  onChange={(e) => handleSetWatched(Number(e.target.value))}
                  required
                />

                <label htmlFor="alert-level">
                  (Optional)Alert when stock reaches
                </label>
                <input
                  id="alert-level"
                  type="number"
                  min="0"
                  value={watchedProduct.threshold}
                  onChange={(e) =>
                    setWatchedProduct({
                      ...watchedProduct,
                      threshold: Number(e.target.value),
                    })
                  }
                />
                <br />
                <button onClick={handleSaveWatchedProduct}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminReports;
