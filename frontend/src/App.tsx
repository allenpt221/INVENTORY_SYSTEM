import { Route, Routes, Navigate } from "react-router-dom";
import { Suspense, useEffect, useState, lazy } from "react";

import { authUserStore } from "./Stores/authStore";
import { MainPage } from "./Pages/MainPage";
import { InventoryLog } from "./Common/InventoryLog";
import { Dashboard } from "./Common/Dashboard";
import { Inventory } from "./Common/Inventory";
import { Product } from "./Common/Product";

import { useTheme } from "@/components/ThemProvider";
import { Moon, Sun } from "lucide-react";

// 🔁 Lazy load login/signup pages for better performance
const LogIn = lazy(() => import("./Pages/LogIn"));
const SignUp = lazy(() => import("./Pages/Signup"));

function App() {
  const checkAuth = authUserStore((state) => state.checkAuth);
  const user = authUserStore((state) => state.user);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // ✅ Only runs once on actual reload
  useEffect(() => {
    setMounted(true);

    const init = async () => {
      await checkAuth(); // Make sure this is async if using API
      setHasCheckedAuth(true);
      setShowInitialLoading(false); // Done after auth check
    };

    init();
  }, []);

  // ✅ Only show loading screen during first load
  if (!hasCheckedAuth || showInitialLoading) {
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
      {!user && mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-muted shadow hover:scale-105 transition"
          aria-label="Toggle Dark Mode"
        >
          {theme === "dark" ? (
            <Sun className="h-6 w-6 text-yellow-500" />
          ) : (
            <Moon className="h-6 w-6 text-black" />
          )}
        </button>
      )}

      {/* ✅ Use Suspense to handle lazy-loaded routes */}
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="w-8 h-8 border-4 border-muted border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />

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
      </Suspense>
    </div>
  );
}

export default App;
