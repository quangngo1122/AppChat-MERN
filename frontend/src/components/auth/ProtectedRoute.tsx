import { useAuthStore } from "@/stores/useAuthStore";
// import React from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { accessToken, user, loading } = useAuthStore();

  if (!accessToken) {
    return (
      <Navigate to="/signin" replace /> // replace là để bản thân thành route hiện tại, tránh tình trạng naviate(-1) về trang trc dù đã đăng xuất
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
