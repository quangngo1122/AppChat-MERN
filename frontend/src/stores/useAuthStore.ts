// như một store toàn cục, có thể từ bất cứ đâu truy cập giá trị/hàm đc lưu trong này, thay cho việc truyền một prop qua qáu nhiều tần trung gian (prop drilling) ko cần thiết
// store tap trung vào quản lý state --- còn như việc gọi api, gửi req lên server nên tách ra layer khác như service
import { create } from "zustand"; // zustand, redux
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";

// ko dùng persist
// export const useAuthStore = create<AuthState>((set,get)=>({...}))

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null, // Thông tin người dùng
      loading: false, // theo dõi trạng thái khi gọi api

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        localStorage.clear();
        useChatStore.getState().reset(); // reset state
      }, // hàm reset giá trị có thể tái sử dụng vd dùng trong logout

      signUp: async (username, password, email, firstName, lastName) => {
        try {
          set({ loading: true });
          // goi api
          await authService.signUp(
            username,
            password,
            email,
            firstName,
            lastName,
          );

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

          localStorage.clear();
          useChatStore.getState().reset(); // reset state

          const { accessToken } = await authService.signIn(username, password);

          // set({ accessToken }); // = set({ accessToken: accessToken })
          get().setAccessToken(accessToken);

          await get().fetchMe(); // đăng nhập xong app lấy thông tin người dùng lưu vào store (user)
          useChatStore.getState().fetchConversation();

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
          toast.success("Đăng xuất thành công");
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
      refresh: async () => {
        try {
          set({ loading: true });
          const { user, fetchMe, setAccessToken } = get(); // lấy user, func fetchMe trong tất cả trường lấy đc từ get()
          const accessToken = await authService.refresh(); // return res.data.accessToken
          // set({ accessToken: accessToken });
          setAccessToken(accessToken);
          if (!user) {
            await fetchMe();
          }
        } catch (error) {
          console.error(error);
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          get().clearState();
        } finally {
          set({ loading: false });
        }
      }, // gọi hàm ở protectedroute --> vì nơi này kiểm tra accesstoken có tồn tại ko, nên nếu ko thì gọi hàm này để xử lý
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }), // cho phép chọn phần nào trong state sẽ đc lưu, ta chỉ lưu user, các cái như accestoken, loading sẽ ko đc lưu trong localS
    },
  ),
);
