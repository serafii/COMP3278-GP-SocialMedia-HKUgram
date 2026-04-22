import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const ProtectedRoutes: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8000/auth/verify-session",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    verifySession();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
