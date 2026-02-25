import type { User } from "./user";

// cấu trúc dữ liệu cho useAuthStore
export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  setAccessToken: (accessToken: string) => void;
  clearState: () => void; // ko trả về kdl j cả

  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>; // hàm async nên trả về 1 promise (ko kdl), lỗi thì reject
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void; // chuyển qua lại sáng tối
  setTheme: (dark: boolean) => void; // cài theme khi app vừa load
}
