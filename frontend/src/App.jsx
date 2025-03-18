import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import AdminHome from "./pages/AdminHome";
import Customers from "./pages/Customers";
import ProductsPage from "./pages/ProductsPage";
import CashierDashboard from "./pages/CashierDashboard";
import CashierSales from "./pages/CashierSales";
import Employees from "./pages/Employees";
import SalesAdminPage from "./pages/SalesAdminPage";
import AdminProfile from "./pages/AdminProfile";
import AdminReports from "./pages/AdminReports";
import CashierProductsPage from "./pages/CashierProductsPage";
import RestockPage from "./pages/RestockPage";
import RestockDelivery from "./pages/RestockDelivery";
import { Layout } from "./Layout";
import { AuthProvider } from "./context/AuthContext";
function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LoginPage />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminHome />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <PrivateRoute requiredRole="admin">
                    <SalesAdminPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Customers />
                  </PrivateRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <PrivateRoute requiredRole="admin">
                    <ProductsPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/restock"
                element={
                  <PrivateRoute requiredRole="admin">
                    <RestockPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/restock-delivery"
                element={
                  <PrivateRoute requiredRole="admin">
                    <RestockDelivery />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Employees />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin-reports"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminReports />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin-profile"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cashier-dashboard"
                element={
                  <PrivateRoute requiredRole="cashier">
                    <CashierDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cashier-sales"
                element={
                  <PrivateRoute requiredRole="cashier">
                    <CashierSales />
                  </PrivateRoute>
                }
              />

              <Route
                path="/all-products"
                element={
                  <PrivateRoute requiredRole="cashier">
                    <CashierProductsPage />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
