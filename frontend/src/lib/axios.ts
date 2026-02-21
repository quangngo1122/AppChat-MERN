// *** axios thư viện gọi api dễ và tiện hơn fetch api thông thường
// setup để đơn giản hóa dòng lệnh gọi api bên service
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "/api",
  withCredentials: true, //ko có dòng này thì cookie ko gui len server, gây vc logout liên tục
});

// *** tạo một Interceptor gắn accesstoken vào req header
// interceptor (thường dùng với Axios) là các hàm trung gian (middleware) chặn và xử lý HTTP requests/responses trước khi chúng được gửi đi hoặc nhận về --> Chúng cho phép tập trung hóa việc thêm header, xác thực (token), log dữ liệu hoặc xử lý lỗi 401/403 tự động, giúp mã nguồn gọn gàng và dễ bảo trì hơn
// ko làm cách này thì để gọi các api private thì khi gọi từng cái api phải gửi thủ công thêm accesstoken, interceptor giúp tự động gửi thành ra khỏe hơn

api.interceptors.request.use((config) => {
  // mỗi lần có request gửi đi nó sẽ chạy hàm này
  const { accessToken } = useAuthStore.getState(); // getState chỉ lấy giá trị accesstoken lúc dòng code này chạy thôi, chứ ko theo dõi/ cập nhật state thay đổi như khi gọi useAuthStore()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`; // tự động gắn thêm hearder accesstoken vào lời gọi api
  }

  return config;
});

export default api;
