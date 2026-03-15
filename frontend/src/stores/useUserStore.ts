// quản lý toàn bộ data liên quan thông tin người dùng

import { userService } from "@/services/userService";
import type { UserState } from "@/types/store";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";
import { useChatStore } from "./useChatStore";

export const useUserStore = create<UserState>((set, get) => ({
  updateAvatarUrl: async (formData) => {
    try {
      const { user, setUser } = useAuthStore.getState();

      const data = await userService.uploadAvatar(formData);

      if (user) {
        setUser({
          ...user,
          avatarUrl: data.avatarUrl,
        });

        useChatStore.getState().fetchConversation();
      }
    } catch (error) {
      console.error("Lỗi khi updateAvatarUrl", error);
      toast.error("Upload avatar không thành công");
    }
  },

  updatePersonalInfo: async (info) => {
    try {
      const { user, setUser } = useAuthStore.getState();
      const updated = await userService.updateProfile(info);

      if (user) {
        setUser({
          ...user,
          ...updated,
        });

        // cập nhật lại danh sách cuộc trò chuyện để hiển thị tên mới
        useChatStore.getState().fetchConversation();
      }
      toast.success("Cập nhật thông tin cá nhân thành công");
    } catch (error) {
      console.error("Lỗi khi updatePersonalInfo", error);
      // const msg = error?.response?.data?.message || "Cập nhật thông tin thất bại";
      const msg = "Cập nhật thông tin thất bại";

      toast.error(msg);
    }
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    try {
      await userService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );
      toast.success("Đổi mật khẩu thành công");
    } catch (error: any) {
      console.error("Lỗi khi changePassword", error);
      const msg =
        error?.response?.data?.message || error?.message || "Thay đổi thất bại";
      toast.error(msg);
      throw error;
    }
  },
}));
