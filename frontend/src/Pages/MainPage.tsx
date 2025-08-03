import { useEffect, useState } from "react";
import { authUserStore } from "@/Stores/authStore";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";
import { useTheme } from "@/components/ThemProvider";
import { CreateStaff } from "@/Modal/CreateStaff";
import { productStore } from "@/Stores/productStore";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Account } from "@/Modal/Account";




export function MainPage() {
  const user = authUserStore((state) => state.user);
  const logout = authUserStore((state) => state.logout);
  const getStaff = authUserStore((state) => state.getStaff);

  const getProducts = productStore((state) => state.getProducts);
  const getProductLog = productStore((state) => state.getProductLog);
  const disposeProducts = productStore((state) => state.disposeProducts);


  

  const justLoggedIn = authUserStore((state) => state.justLoggedIn);
  const setJustLoggedIn = authUserStore((state) => state.setJustLoggedIn);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [openSignup, setOpenSignup] = useState<boolean>(false);
  const [openAccount, setOpenAcount] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const [Istheme, setIsTheme] = useState<boolean>(false);



  const toggleDarkMode = () => {
    if (theme === "dark") {
      setTheme("light")
      setIsTheme(true)
    } else {
      setTheme("dark")
      setIsTheme(false)
    }
  };

  useEffect(() => {
    getProducts();
    getProductLog();
    disposeProducts();
    getStaff();
  }, []);

  useEffect(() => {
    if (justLoggedIn && user) {
      setShowAlert(true);
      const timeout = setTimeout(() => {
        setShowAlert(false);
        setJustLoggedIn(false); // reset after showing
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [justLoggedIn, user]);

  


  return (
    <div className="flex">
      <SidebarProvider>
        <AppSidebar 
        account={() => setOpenAcount(true)}
        createstaff={() => setOpenSignup(true)} 
        role={user?.role} 
        DarkMode={Istheme} 
        toggleDarkMode={toggleDarkMode} 
        logout={logout} 
        email={user?.email} 
        profile={user?.image}
        />
        <main className="flex-1 p-4 w-full overflow-hidden">
          <SidebarTrigger />
          {showAlert && (
            <Alert
              variant="default"
              className="fixed top-5 left-1/2 transform -translate-x-1/2 z-10 sm:w-full w-[18rem] max-w-md md:max-w-xl px-4"
            >
              <CheckCircle2Icon className="h-5 w-5 text-green-500 mt-1 shrink-0" />
              <div>
                <AlertTitle>Welcome! {user?.email}</AlertTitle>
                <AlertDescription>
                  You have successfully logged in.
                </AlertDescription>
              </div>
            </Alert>
          )}
          <Outlet />
        </main>
      </SidebarProvider>


      {openAccount && (
        <Account 
          isOpen={true}
          isClose={() => setOpenAcount(false)}
          userData={user}
        />
      )}

      {openSignup && (
        <CreateStaff 
        isOpen={true}
        isClose={() => setOpenSignup(false)}/>
      )}
    </div>
  );
}
