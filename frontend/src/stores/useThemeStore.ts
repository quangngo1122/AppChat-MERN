import type { ThemeState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware"; // giúp lưu state xuống local storage, giúp reload/ đóng tab theme vẫn giữ nguyên

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // mặc định theme sáng
      isDark: false,
      // hàm chuyển đổi qua lại 2 theme
      toggleTheme: () => {
        const newValue = !get().isDark; // lấy gt hiện tại isdark đảo ngược lại
        set({ isDark: newValue });
        if (newValue) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
      // hàm set theme theo giá trị truyền vào
      setTheme: (dark: boolean) => {
        set({ isDark: dark });
        if (dark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }),
    {
      name: "theme-storage", // key lưu trong local storage
    },
  ),
);
