import { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AdminHome from "./pages/AdminHome";
import Customers from "./pages/Customers";
import ProductsPage from "./pages/ProductsPage";
import Home from "./pages/Home";
import Employees from "./pages/Employees";
import { Layout } from "./Layout";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<AdminHome />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/employees" element={<Employees />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
