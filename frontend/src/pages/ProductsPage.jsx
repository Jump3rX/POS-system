import React from "react";
import { useEffect, useState, useContext } from "react";
import ProductsTable from "../components/ProductsTable";
import ProductsSummaryCard from "../components/ProductsSummaryCard";
import AddProductForm from "../components/AddProductForm";
import EditProductModal from "../components/EditProductModal";
import AuthContext from "../context/AuthContext";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
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
  let totalProducts = products.length;

  function handleAddNewProduct(newProducts) {
    setProducts((p) => [...p, newProducts]);
  }

  function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      fetch(`http://127.0.0.1:8000/api/delete-product/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + String(authTokens.access),
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to delete!");
          }
          setProducts((p) => p.filter((product) => product.id !== id));
        })
        .catch((err) => console.error("Error:", err));
    }
  }

  function handleEdit(product) {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  }
  function handleSave(updatedProduct) {
    setProducts((p) =>
      p.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setIsEditModalOpen(false);
    console.log(products);
  }
  return (
    <div className="products-page-container">
      <div className="product-list-container">
        <div className="products-table-container">
          <h1 className="products-page-h1">Product List</h1>
          <ProductsTable
            products={products}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
          {isEditModalOpen && (
            <EditProductModal
              product={productToEdit}
              closeModal={() => setIsEditModalOpen(false)}
              handleSave={handleSave}
            />
          )}
        </div>
        <div className="products-summary-main-container">
          <div className="product-summary-card-container">
            <ProductsSummaryCard total={totalProducts} />
          </div>

          <div className="add-product-form-container">
            <AddProductForm handleAddNewProduct={handleAddNewProduct} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
