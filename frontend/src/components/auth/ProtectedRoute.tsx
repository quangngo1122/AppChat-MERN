import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
// import React from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();

  // xác định app đang khởi động hay đã khởi động xong, ngăn tình trạng khi load lại trang refresh, fetchMe chưa kịp chạy đã kiểm tra !accessToken rồi trả về trang đăng nhập
  const [starting, setStarting] = useState(true);

  // hàm chạy lúc component render lần đầu, load trang
  const init = async () => {
    if (!accessToken) {
      await refresh();
    }
    if (accessToken && !user) {
      await fetchMe();
    }
    setStarting(false);
  };
  useEffect(() => {
    init();
  }, []);

  if (loading || starting) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang ...
      </div>
    );
  }

  if (!accessToken) {
    return (
      <Navigate to="/signin" replace /> // replace là để bản thân thành route hiện tại, tránh tình trạng naviate(-1) về trang trc dù đã đăng xuất
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
