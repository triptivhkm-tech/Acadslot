import { createContext, useContext, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  function login(userData) {
    const savedUser = {
      userId: userData.userId || userData.id,
      name: userData.name || "",
      role: (userData.role || "").toUpperCase(),
      email: userData.email || "",
      department: userData.department || "",
      subject: userData.subject || "",
      defaultVenue: userData.defaultVenue || "",
    };

    localStorage.setItem("acadslot_user", JSON.stringify(savedUser));
    setUser(savedUser);
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: Boolean(user && authService.isLoggedIn()),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
