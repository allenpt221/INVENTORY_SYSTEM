import {
  Calendar,
  Home,
  Inbox,
  LogOutIcon,
  User2,
  ChevronUp,
  Sun,
  Moon,
  LayoutDashboard,
  ArrowRightLeft,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

type AppSidebarProps = {
  username?: string;
  logout: () => void;
  DarkMode: Boolean;
  toggleDarkMode: () => void;
  role?: string;
};

const items = [
  { title: "Home", icon: Home, url: "/home" },
  { title: "Inventory", icon: Inbox, url: "/inventory" },
  { title: "Products", icon: Calendar, url: "/products" },
  { title: "transaction", icon: ArrowRightLeft, url: "/transaction" },
  { title: "dashboard", icon: LayoutDashboard , url: "/dashboard", requiresAdmin: true },
];

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}




export function AppSidebar({ username, logout, DarkMode, toggleDarkMode, role }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const filteredItems = items.filter(
  (item) => !item.requiresAdmin || role?.toLowerCase() === "superadmin"
);
  
  const isMobile = useIsMobile();

  return (
    <Sidebar className="flex flex-col h-full">
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between mb-3">
            <img src="https://images.unsplash.com/photo-1637144113512-0fb2b860c10f?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt=""
            className="w-5 h-5 rounded-full" />
            <p>StockHub</p>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const isActive = location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (!isActive) {
                          navigate(item.url);
                        }
                      }}
                      className={`flex items-center gap-2 w-full text-left ${
                        isActive
                            ? "text-primary cursor-default"
                          : "hover:bg-accent cursor-pointer"
                      }`}
                      disabled={isActive}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu >
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <SidebarMenuButton className="flex items-center w-full gap-2">
                  <User2 />
                  <span>{username}</span>
                  <ChevronUp className="ml-auto " />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side={isMobile ? "bottom" : "right"} className={`mb-2 sm:mb-5 ${isMobile ? "w-[15rem] max-w-xs" : "w-auto"}`}>
                <DropdownMenuItem className="cursor-pointer">Account</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Billing</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={toggleDarkMode}>{DarkMode ?  <span className="flex gap-2 items-center"><Moon /> Dark Mode</span> : <span className="flex gap-2 items-center"><Sun /> Light Mode</span> }</DropdownMenuItem>

                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOutIcon className="mr-2 w-4 h-4" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
