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




export function AppSidebar({ username, logout, DarkMode, toggleDarkMode, role }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const filteredItems = items.filter(
  (item) => !item.requiresAdmin || role?.toLowerCase() === "superadmin"
);


  return (
    <Sidebar className="flex flex-col h-full">
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
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
              <DropdownMenuContent side="right" className="mb-5">
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
