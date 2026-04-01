import api from "@/lib/axios";

export const userService = {
  // formdata --> kdl tiue6 chuẩn khi upload form
  uploadAvatar: async (formData: FormData) => {
    const res = await api.post("/users/uploadAvatar", formData, {
      headers: { "Content-Type": "multipart/form-data" }, // để backend biết đang uploadfile
    });

    if (res.status === 400) {
      throw new Error(res.data.message);
    }
    return res.data;
  },

  // Cập nhật thông tin người dùng hiện tại.
  updateProfile: async (data: Record<string, any>) => {
    // note: record< KDL key, value> --> mô tả "object" có các key và value theo kiểu xác định
    const res = await api.patch("/users/me", data);
    if (res.status >= 400) {
      throw new Error(res.data.message || "Cập nhật thất bại");
    }
    return res.data.user;
  },

  getUserById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    if (res.status >= 400) {
      throw new Error(res.data.message || "Không thể lấy thông tin người dùng");
    }
    return res.data.user;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    const res = await api.patch("/users/me/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (res.status >= 400) {
      throw new Error(res.data.message || "Thay đổi mật khẩu thất bại");
    }
    return res.data;
  },

  deleteAccount: async () => {
    const res = await api.delete("/users/me");
    if (res.status >= 400) {
      throw new Error(res.data.message || "Xóa tài khoản thất bại");
    }
    return res.data;
  },
};
