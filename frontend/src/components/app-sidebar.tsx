import {
  Calendar,
  Inbox,
  LogOutIcon,
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
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

type AppSidebarProps = {
  email?: string;
  logout: () => void;
  createstaff: () => void;
  DarkMode: Boolean;
  toggleDarkMode: () => void;
  role?: string;
  profile?: string;
  account: () => void;
};

const items = [
  { title: "Products", icon: Calendar, url: "/" },
  { title: "Inventory", icon: Inbox, url: "/inventory" },
  { title: "Inventory Log", icon: ArrowRightLeft, url: "/inventorylog" },
  { title: "dashboard", icon: LayoutDashboard, url: "/dashboard", requiresAdmin: true },
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

export function AppSidebar({
  email,
  logout,
  DarkMode,
  toggleDarkMode,
  role,
  createstaff,
  profile,
  account
}: AppSidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const filteredItems = items.filter(
    (item) => !item.requiresAdmin || role?.toLowerCase() === "manager"
  );

  return (
    <Sidebar className="flex flex-col h-full">
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between mb-3">
            <img
              src="https://images.unsplash.com/photo-1637144113512-0fb2b860c10f?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt=""
              className="w-5 h-5 rounded-full"
            />
            <p>StockHub</p>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const isActive =
                item.url === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-2 w-full px-2 py-2 rounded text-sm ${
                        isActive
                          ? "text-primary bg-muted cursor-default"
                          : "hover:bg-accent text-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <div className="flex items-center w-full gap-2 px-1 py-2 rounded hover:bg-accent cursor-pointer">
                  <img src={profile} alt="error load image" className="w-5 h-full rounded-full" /> 
                  <span className="text-sm">{email}</span>
                  <ChevronUp className="ml-auto" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                className={`mb-2 sm:mb-5 ${
                  isMobile ? "w-[15rem] max-w-xs" : "w-auto"
                }`}
              >
                <DropdownMenuItem className="cursor-pointer" onClick={account}>
                  Account
                  </DropdownMenuItem>
                {role === "manager" && (
                  <DropdownMenuItem className="cursor-pointer"
                  onClick={createstaff}>Register Staff</DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer" onClick={toggleDarkMode}>
                  {DarkMode ? (
                    <span className="flex gap-2 items-center">
                      <Moon /> Dark Mode
                    </span>
                  ) : (
                    <span className="flex gap-2 items-center">
                      <Sun /> Light Mode
                    </span>
                  )}
                </DropdownMenuItem>
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
