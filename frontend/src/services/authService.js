import api from "./api";

const authService = {
  async login(email, password, expectedRole = null) {
    const payload = { email, password };
    if (expectedRole) {
      payload.expectedRole = expectedRole;
    }

    const response = await api.post("/auth/login", payload);
    const result = response.data;

    if (result.success === false) {
      throw new Error(result.message || "Login failed.");
    }

    const user = result.data;
    if (!user?.token || !user?.role) {
      throw new Error("Invalid login response from server.");
    }

    localStorage.setItem("acadslot_token", user.token);
    localStorage.setItem(
      "acadslot_user",
      JSON.stringify({
        userId: user.userId,
        name: user.name || "",
        role: user.role.toUpperCase(),
        email: user.email || email,
        department: user.department || "",
        subject: user.subject || "",
        defaultVenue: user.defaultVenue || "",
      }),
    );

    return user;
  },

  async googleLogin(email, name, googleToken = "mock_google_token") {
    const response = await api.post("/auth/google-login", {
      email,
      name,
      googleToken,
    });

    const result = response.data;
    if (result.success === false) {
      throw new Error(result.message || "Google authentication failed.");
    }

    const user = result.data;
    if (!user?.token || !user?.role) {
      throw new Error("Invalid response from server.");
    }

    localStorage.setItem("acadslot_token", user.token);
    localStorage.setItem(
      "acadslot_user",
      JSON.stringify({
        userId: user.userId,
        name: user.name || "",
        role: user.role.toUpperCase(),
        email: user.email || email,
        department: user.department || "",
        subject: user.subject || "",
        defaultVenue: user.defaultVenue || "",
      }),
    );

    return user;
  },

  logout() {
    localStorage.removeItem("acadslot_token");
    localStorage.removeItem("acadslot_user");
  },

  getCurrentUser() {
    const user = localStorage.getItem("acadslot_user");
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return Boolean(localStorage.getItem("acadslot_token"));
  },
};

export default authService;
