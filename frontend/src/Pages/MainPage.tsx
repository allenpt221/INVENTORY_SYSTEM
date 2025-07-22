import { useEffect, useState } from "react";
import { authUserStore } from "@/Stores/authStore";
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
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";

export function MainPage() {
  const user = authUserStore((state) => state.user);
  const logout = authUserStore((state) => state.logout);
  const justLoggedIn = authUserStore((state) => state.justLoggedIn);
  const setJustLoggedIn = authUserStore((state) => state.setJustLoggedIn);
  const [showAlert, setShowAlert] = useState(false);

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
    <div className="flex h-screen relative">
      <SidebarProvider>
        <AppSidebar logout={logout} username={user?.username} />
        <main className="flex-1 p-4">
          <SidebarTrigger />
          {showAlert && (
            <Alert
              variant="default"
              className="absolute w-[40rem] h-[4rem] top-5 right-[35rem]"
            >
              <CheckCircle2Icon className="h-5 w-5 text-green-500 mt-1 shrink-0" />
              <div>
                <AlertTitle>Welcome! {user?.username}</AlertTitle>
                <AlertDescription>
                  You have successfully logged in.
                </AlertDescription>
              </div>
            </Alert>
          )}
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}
