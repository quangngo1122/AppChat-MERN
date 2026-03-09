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
};
