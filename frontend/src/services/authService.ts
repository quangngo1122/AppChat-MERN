// call api auth

import api from "@/lib/axios";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => {
    const res = await api.post(
      "/auth/signup",
      {
        username,
        password,
        email,
        firstName,
        lastName,
      }, // call api http://localhost:5001/api/auth/signup (development) hoặc /api/auth/signup
      { withCredentials: true },
    );
    return res.data;
  },
  signIn: async (username: string, password: string) => {
    const res = await api.post(
      "auth/signin",
      {
        username,
        password,
      },
      { withCredentials: true },
    );
    return res.data; // accessToken
  },
  signOut: async () => {
    return api.post("/auth/signout", {}, { withCredentials: true });
  },
  fetchMe: async () => {
    const res = await api.get("/users/me", { withCredentials: true });
    return res.data.user; // trả về thông tin user
  },
};
