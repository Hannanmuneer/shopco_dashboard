import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const Ctx = createContext(null);

const API_URL = import.meta.env.VITE_BACKEND_URI;

export function AuthProvider({ children }) {
  
  const [isAdmin, setIsAdmin] = useState(() => !!sessionStorage.getItem("adminToken"));

  const login = async (email, password) => {
    try {

      const response = await axios.post(`${API_URL}/adminlogin`, {
        email,
        password
      });

      const data = response.data;

      if (data.token) {
       
        sessionStorage.setItem("adminToken", data.token);
        sessionStorage.setItem("isAdmin", "1");
        setIsAdmin(true);
        return { success: true };
      }
    } catch (err) {
      
      const errorMsg = err.response?.data?.error || "Login fail ho gaya!";
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("isAdmin");
    setIsAdmin(false);
  };

  return (
    <Ctx.Provider value={{ isAdmin, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);