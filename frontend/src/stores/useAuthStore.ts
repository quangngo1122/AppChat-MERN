// như một store toàn cục, có thể từ bất cứ đâu truy cập giá trị/hàm đc lưu trong này, thay cho việc truyền một prop qua qáu nhiều tần trung gian (prop drilling) ko cần thiết
// store tap trung vào quản lý state --- còn như việc gọi api, gửi req lên server nên tách ra layer khác như service
import { create } from "zustand"; // zustand, redux
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null, // thong tin nguoi dung
  loading: false, // theo doi trang thai khi goi api

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  }, // hàm reset giá trị có thể tái sử dụng vd dùng trong logout

  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true });
      // goi api
      await authService.signUp(username, password, email, firstName, lastName);

      toast.success(
        "Đăng ký thành công, bạn sẽ đc chuyển sang trang đăng nhập!",
      );
    } catch (error) {
      console.error(error);
      toast.error("Đăng ký không thành công");
    } finally {
      set({ loading: false });
    }
  },
  signIn: async (username, password) => {
    try {
      set({ loading: true });

      const { accessToken } = await authService.signIn(username, password);

      set({ accessToken }); // = set({ accessToken: accessToken })

      await get().fetchMe(); // đăng nhập xong app lấy thông tin người dùng lưu vào store (user)

      toast.success("Chào mừng bạn quay trở lại 🎉");
    } catch (error) {
      console.error(error);
      toast.error("Đăng nhập không thành công!");
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      get().clearState();
      await authService.signOut();
      toast.success("Đăng xuất thành côgn");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xãy ra khi đăng xuất! Hãy thử lại!");
    }
  },
  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();
      set({ user }); // set({user:user})
    } catch (error) {
      console.error(error);
      set({ user: null, accessToken: null });
      toast.error("Lỗi xãy ra khi lấy dư liệu người dùng. Hãy thử lại!");
    } finally {
      set({ loading: false });
    }
  },
}));
