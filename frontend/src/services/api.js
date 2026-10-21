import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attaches JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("acadslot_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercepts response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // expired or invalid token: clear it and send the user back to login
    const isLoginCall = error.config?.url?.includes("/auth/");
    if (error.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem("acadslot_token");
      localStorage.removeItem("acadslot_user");
      if (window.location.pathname !== "/login")
        window.location.assign("/login");
    }
    if (!error.response) {
      console.error(
        "Backend connection failed. Please ensure the AcadSlot backend server is running on port 8081.",
      );
    }
    return Promise.reject(error);
  },
);

export default api;
