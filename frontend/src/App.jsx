import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./utils/PriVateRoute";
import LoginPage from "./pages/LoginPage";
import AdminHome from "./pages/AdminHome";
import Customers from "./pages/Customers";
import ProductsPage from "./pages/ProductsPage";
import Home from "./pages/Home";
import Employees from "./pages/Employees";
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
                  <PrivateRoute>
                    <AdminHome />
                  </PrivateRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <PrivateRoute>
                    <Customers />
                  </PrivateRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <PrivateRoute>
                    <ProductsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <PrivateRoute>
                    <Employees />
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
