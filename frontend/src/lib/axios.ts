// *** axios thư viện gọi api dễ và tiện hơn fetch api thông thường
// setup để đơn giản hóa dòng lệnh gọi api bên service
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const api = axios.create({
  // vì đã tạ .env.production và .env.development Vite sẽ tự hiểu mà dùng, nên ko cần dòng này nũa
  // baseURL:import.meta.env.MODE === "development"? "http://localhost:5001/api": "/api",

  baseURL: import.meta.env.VITE_API_URL,

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

// tự động gọi refresh api khi accessToken hết hạn, phòng ngừa đang use mà nó hết hạn gây ảnh hưởng trải nghiệm
api.interceptors.response.use(
  (res) => res, // đúng thì trả về res, sai thì -->
  async (error) => {
    const originalResquest = error.config; // cau hinh cua res vua bi loi
    // nhung api ko can check
    if (
      originalResquest.url.includes("/auth/signin") ||
      originalResquest.url.includes("/auth/signup") ||
      originalResquest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error); // bỏ qua check mà trả về lỗi luôn
    }

    // giới hạn số lần thử, giẩ sử accesstoken hết hạn mà chạy hàm này nhưng ko thành công rồi lại thử lại, gây tình trạng gọi liên tục, nên tạo _retryCount giới hạn số lần thử, quá số lần thì người dùng cần đăng nhập lại thay vì thử nữa
    originalResquest._retryCount = originalResquest._retryCount || 0;

    if (error.response?.status === 403 && originalResquest._retryCount < 4) {
      originalResquest._retryCount += 1;
      console.log("refresh", originalResquest._retryCount);

      try {
        const res = await api.post("/auth/refresh", null, {
          withCredentials: true,
        });
        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        originalResquest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalResquest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }
    // neu loi khong phai 403 --> cu reject loi nhu bth
    return Promise.reject(error);
  },
);

export default api;
