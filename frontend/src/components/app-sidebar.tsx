import {
  Calendar,
  Home,
  Inbox,
  LogOutIcon,
  Search,
  Settings,
  User2,
  ChevronUp,
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
};

const items = [
  { title: "Home", icon: Home, url: "/home" },
  { title: "Inventory", icon: Inbox, url: "inventory" },
  { title: "Products", icon: Calendar, url: "products" },
  { title: "transaction", icon: Search, url: "transaction" },
  { title: "Settings", icon: Settings, url: "#" },
];

export function AppSidebar({ username, logout }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar className="flex flex-col h-full">
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (!isActive && item.url !== "#") {
                          navigate(item.url);
                        }
                      }}
                      className={`flex items-center gap-2 w-full text-left ${
                        isActive
                          ? "bg-muted text-primary cursor-default"
                          : "hover:bg-accent"
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
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex items-center w-full gap-2">
                  <User2 />
                  <span>{username}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="mb-5">
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
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
