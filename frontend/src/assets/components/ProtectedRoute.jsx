import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    alert("Cần đăng nhập để truy cập trang này.");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.Role)) {
    alert("Không có quyền truy cập trang này.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
