import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  LayoutDashboard,
  Smartphone,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  CreditCard,
  User as UserIcon,
} from "lucide-react";
import { DashboardStats } from "./DashboardStats";
import { Applications } from "./Applications";
import { Subscriptions } from "./Subscriptions";
import { Settings } from "./Settings";
import { ApplicationDetails, Application } from "./ApplicationDetails";
import { SubscriptionDetails, Subscription } from "./SubscriptionDetails";
import { Users, User } from "./Users";
import { UserDetails } from "./UserDetails";
import { Payment, PaymentMethod, Wallet } from "./Payment";
import { PaymentMethodDetails } from "./PaymentMethodDetails";
import { WalletDetails } from "./WalletDetails";
import logo from "figma:asset/64732130af5e1351819c7a94a0f8563f43705c92.png";

interface DashboardProps {
  onLogout: () => void;
}

type Page = "stats" | "applications" | "subscriptions" | "users" | "payment" | "settings";

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>("stats");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const menuItems = [
    {
      id: "stats" as Page,
      label: "Statistiques",
      icon: LayoutDashboard,
    },
    {
      id: "applications" as Page,
      label: "Applications",
      icon: Smartphone,
    },
    {
      id: "subscriptions" as Page,
      label: "Subscriptions",
      icon: UsersIcon,
    },
    {
      id: "users" as Page,
      label: "Utilisateurs",
      icon: UserIcon,
    },
    {
      id: "payment" as Page,
      label: "Paiements",
      icon: CreditCard,
    },
  ];

  const handleViewApplicationDetails = (app: Application) => {
    setSelectedApplication(app);
  };

  const handleBackFromApplicationDetails = () => {
    setSelectedApplication(null);
  };

  const handleUpdateApplication = (updatedApp: Application) => {
    setApplications((prevApps) =>
      prevApps.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );
    setSelectedApplication(updatedApp);
  };

  const handleViewSubscriptionDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  const handleBackFromSubscriptionDetails = () => {
    setSelectedSubscription(null);
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackFromUserDetails = () => {
    setSelectedUser(null);
  };

  const handleViewPaymentMethodDetails = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handleBackFromPaymentMethodDetails = () => {
    setSelectedPaymentMethod(null);
  };

  const handleViewWalletDetails = (wallet: Wallet) => {
    setSelectedWallet(wallet);
  };

  const handleBackFromWalletDetails = () => {
    setSelectedWallet(null);
  };

  const currentHeading =
    (selectedApplication && currentPage === "applications" && selectedApplication.name) ||
    (selectedSubscription && currentPage === "subscriptions" && selectedSubscription.contextName) ||
    (selectedUser && currentPage === "users" && selectedUser.name) ||
    (selectedPaymentMethod && currentPage === "payment" && selectedPaymentMethod.name) ||
    (selectedWallet && currentPage === "payment" && `Wallet de ${selectedWallet.userName}`) ||
    menuItems.find((item) => item.id === currentPage)?.label ||
    (currentPage === "settings" ? "Paramètres" : "Statistiques");

  const renderContent = () => {
    if (selectedApplication && currentPage === "applications") {
      return (
        <ApplicationDetails
          application={selectedApplication}
          onBack={handleBackFromApplicationDetails}
          onUpdate={handleUpdateApplication}
        />
      );
    }

    if (selectedSubscription && currentPage === "subscriptions") {
      return (
        <SubscriptionDetails
          subscription={selectedSubscription}
          onBack={handleBackFromSubscriptionDetails}
        />
      );
    }

    if (selectedUser && currentPage === "users") {
      return (
        <UserDetails
          user={selectedUser}
          onBack={handleBackFromUserDetails}
        />
      );
    }

    if (selectedPaymentMethod && currentPage === "payment") {
      return (
        <PaymentMethodDetails
          paymentMethod={selectedPaymentMethod}
          onBack={handleBackFromPaymentMethodDetails}
        />
      );
    }

    if (selectedWallet && currentPage === "payment") {
      return (
        <WalletDetails
          wallet={selectedWallet}
          onBack={handleBackFromWalletDetails}
        />
      );
    }

    switch (currentPage) {
      case "stats":
        return <DashboardStats />;
      case "applications":
        return <Applications onViewDetails={handleViewApplicationDetails} />;
      case "subscriptions":
        return <Subscriptions onViewDetails={handleViewSubscriptionDetails} />;
      case "users":
        return <Users onViewDetails={handleViewUserDetails} />;
      case "payment":
        return (
          <Payment
            onViewPaymentMethodDetails={handleViewPaymentMethodDetails}
            onViewWalletDetails={handleViewWalletDetails}
          />
        );
      case "settings":
        return <Settings />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 px-2 py-2">
              <img src={logo} alt="Logo" className="w-10 h-10" />
              <div className="flex flex-col">
                <span>Admin Dashboard</span>
                <span className="text-xs text-muted-foreground">
                  Panel de contrôle
                </span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={currentPage === item.id}
                        onClick={() => setCurrentPage(item.id)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={currentPage === "settings"}
                      onClick={() => setCurrentPage("settings")}
                    >
                      <SettingsIcon className="h-4 w-4" />
                      <span>Paramètres</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="" />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col items-start text-left">
                        <span className="text-sm">Admin</span>
                        <span className="text-xs text-muted-foreground">
                          admin@example.com
                        </span>
                      </div>
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]"
                  >
                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentPage("settings")}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-6" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-lg">
                {currentHeading}
              </h1>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
