import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import PublicShop from "./pages/PublicShop";
import ProtectedRoute from "./auth/ProtectedRoute";
import VerifyEmail from "./pages/VerifyEmail";
import Checkout from "./pages/Checkout";



export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/shop/demo" replace />} />
      <Route path="/shop/:shopId" element={<PublicShop />} />
      <Route path="/shop/:shopId/checkout" element={<Checkout />} />


      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<VerifyEmail />} />
      
      {/* Owner (Protected) */}
        <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<p style={{ padding: 16 }}>Not found</p>} />
    </Routes>
  );
}
