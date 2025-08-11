import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { authUserStore } from "./Stores/authStore";
import { MainPage } from "./Pages/MainPage";
import { InventoryLog } from "./Common/InventoryLog";
import { Dashboard } from "./Common/Dashboard";
import { Inventory } from "./Common/Inventory";
import { Product } from "./Common/Product";

import { useTheme } from "@/components/ThemProvider";
import { Moon, Sun } from "lucide-react";
import { ForgotPasswordPage } from "./Pages/ForgotPasswordPage";
import LogIn from "./Pages/LogIn";
import SignUp from "./Pages/Signup";
import ResetPassword from "./Pages/ResetPassword";


function App() {
  const checkAuth = authUserStore((state) => state.checkAuth);
  const user = authUserStore((state) => state.user);

  const { theme, setTheme } = useTheme();
  const [showInitialLoading, setShowInitialLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  //  Only show loading screen during first load
  if (showInitialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black dark:border-white dark:border-t-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-black-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-background text-foreground h-screen">
      {/* 🌙 Dark/Light Mode Toggle */}
      {!user && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-muted shadow hover:scale-105 transition"
          aria-label="Toggle Dark Mode"
        >
          {theme === "dark" ? (
            <Sun className="h-6 w-6 text-yellow-500" />
          ) : (
            <Moon className="h-6 w-6 text-black/50" />
          )}
        </button>
      )}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />


          {/* Protected Routes (nested inside MainPage layout) */}
          {user && (
            <Route path="/" element={<MainPage />}>
              <Route index element={<Product />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventorylog" element={<InventoryLog />} />
              <Route
                path="/dashboard"
                element={
                  user?.role === "manager" ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
            </Route>
          )}

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to={user ? "/" : "/"} replace />} />
        </Routes>
    </div>
  );
}

export default App;
