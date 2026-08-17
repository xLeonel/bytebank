import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/",
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Rede de segurança para o token que vence com o usuário já navegando: o
// AuthGuard só roda na montagem, então sem isto a tela ficaria travada em
// "Não foi possível carregar sua conta". Limpa os dois lugares onde o token
// vive hoje (sessionStorage no axios, localStorage em lib/session).
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      sessionStorage.removeItem("token");
      localStorage.removeItem("bb_session_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default http;