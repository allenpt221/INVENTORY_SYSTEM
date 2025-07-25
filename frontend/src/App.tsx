import { Route, Routes, Navigate } from "react-router-dom";
import LogIn from "./Pages/LogIn";
import SignUp from "./Pages/Signup";
import { authUserStore } from "./Stores/authStore";
import { useEffect } from "react";
import { MainPage } from "./Pages/MainPage";
import { HomePage } from "./Common/Home";
import { Transaction } from "./Common/Transaction";
import { Dashboard } from "./Common/Dashboard";
import { productStore } from "./Stores/productStore";
import { Inventory } from './Common/Inventory'
import { Product } from './Common/Product'


function App() {
  const checkAuth = authUserStore((state) => state.checkAuth);
  const user = authUserStore((state) => state.user);

  const getProducts = productStore((state) => state.getProducts);
  const checkingAuth = authUserStore((state) => state.checkingAuth);

  

  useEffect(() => {
    getProducts();
  }, [getProducts]);


  useEffect(() => {
    checkAuth();
  }, [checkAuth]);



  if (checkingAuth) {
    // Optional: render a spinner/loading indicator
    return  (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center justify-center h-screen  gap-4">
          <div className="w-12 h-12 border-4 border-black dark:border-white dark:border-t-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-black-600 text-lg font-medium ">Loading...</p>
        </div>
      </div>
    )
  }




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
            <Route path="/products" element={<Product />} />
            <Route path="/transaction" element={<Transaction/>} />
            <Route path="/dashboard" element={user?.role === "superAdmin" && <Dashboard/>} />

          </Route>
        )}
        <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
