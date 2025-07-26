import { Route, Routes, Navigate } from "react-router-dom";
import LogIn from "./Pages/LogIn";
import SignUp from "./Pages/Signup";
import { authUserStore } from "./Stores/authStore";
import { useEffect, useState } from "react";
import { MainPage } from "./Pages/MainPage";
import { HomePage } from "./Common/Home";
import { Transaction } from "./Common/Transaction";
import { Dashboard } from "./Common/Dashboard";
import { productStore } from "./Stores/productStore";
import { Inventory } from './Common/Inventory';
import { Product } from './Common/Product';
import { useTheme } from "@/components/ThemProvider";
import { Moon, Sun } from "lucide-react";

function App() {
  const checkAuth = authUserStore((state) => state.checkAuth);
  const user = authUserStore((state) => state.user);
  // const getProducts = productStore((state) => state.getProducts);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showInitialLoading, setShowInitialLoading] = useState<boolean>(true); // Only for reload

  // ✅ Only on first load (real page reload)
  useEffect(() => {
    setMounted(true);
    checkAuth();
    // getProducts()
    const timeout = setTimeout(() => {
      setShowInitialLoading(false); // remove loading after 500ms
    }, 500); // optional delay for smoother UX

    return () => clearTimeout(timeout);
  }, []);

  // Show loading only once, not on route changes
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
    <div className="relative min-h-screen bg-background text-foreground">
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

      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />

        {user && (
          <Route path="/" element={<MainPage />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/products" element={<Product />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route
              path="/dashboard"
              element={user?.role === "superAdmin" ? <Dashboard /> : <Navigate to="/home" />}
            />
          </Route>
        )}

        <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
