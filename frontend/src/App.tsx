import { Route, Routes, Navigate } from "react-router-dom";
import LogIn from "./Pages/LogIn";
import SignUp from "./Pages/Signup";
import { authUserStore } from "./Stores/authStore";
import { useEffect } from "react";
import { MainPage } from "./Pages/MainPage";
import { HomePage } from "./Common/Home";
import { Inventory } from "./Common/Inventory";
import { Products } from "./Common/Products";
import { Transaction } from "./Common/Transaction";

function App() {
  const checkAuth = authUserStore((state) => state.checkAuth);
  const user = authUserStore((state) => state.user);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="relative">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected layout wrapper */}
        {user && (
          <Route path="/" element={<MainPage />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/products" element={<Products />} />
            <Route path="/transaction" element={<Transaction/>} />
          </Route>
        )}
        <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
