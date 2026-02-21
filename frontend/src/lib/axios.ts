// axios thư viện gọi api dễ và tiện hơn fetch api thông thường
// setup để đơn giản hóa dòng lệnh gọi api bên service
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "/api",
  withCredentials: true, //ko có dòng này thì cookie ko gui len server, gây vc logout liên tục
});

export default api;
