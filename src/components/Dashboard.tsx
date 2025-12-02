import React, { useState, useEffect } from "react";
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
  Clock,
} from "lucide-react";
import { DashboardStats } from "./DashboardStats";
import { Applications } from "./Applications";
import { Subscriptions } from "./Subscriptions";
import { Settings } from "./Settings";
import { ApplicationDetails, Application } from "./ApplicationDetails";
import { SubscriptionDetails, Subscription } from "./SubscriptionDetails";
import { Users, User } from "./Users";
import { UserDetails } from "./UserDetails";
import { Payment } from "./Payment";
import { PaymentMethodDetails } from "./PaymentMethodDetails";
import { WalletDetails } from "./WalletDetails";
import { AccountDetails } from "./AccountDetails";
import { PaymentMethod, Wallet, Account } from "../types/payment";
import { getAccountById } from "../services/paymentService";
import { TrialPolicies } from "./TrialPolicies";
import logo from "@/assets/1200x630wa-removebg-preview.png";
import type { Application as ApiApplication } from "../services/applicationService";
import { PAGE_LABELS } from "../utils/apiEndpoints";

interface DashboardProps {
  onLogout: () => void;
  user?: Record<string, any> | null;
}

type Page = "stats" | "applications" | "subscriptions" | "users" | "payment" | "settings" | "trialPolicies";

// Mapping entre les pages et les noms d'URL
const pageToRoute: Record<Page, string> = {
  stats: "statistiques",
  applications: "applications",
  subscriptions: "subscriptions",
  users: "utilisateurs",
  payment: "paiements",
  settings: "parametres",
  trialPolicies: "periodes-essai",
};

// Mapping inverse pour récupérer la page depuis l'URL
const routeToPage: Record<string, Page> = Object.entries(pageToRoute).reduce(
  (acc, [page, route]) => {
    acc[route] = page as Page;
    return acc;
  },
  {} as Record<string, Page>
);

// Fonction pour obtenir la route depuis l'URL
const getPageFromUrl = (): Page => {
  const path = window.location.pathname.replace(/^\//, "");
  const route = path.split("/")[0] || "statistiques";
  return routeToPage[route] || "stats";
};

// Fonction pour obtenir les paramètres de détail depuis l'URL
const getDetailFromUrl = (): { page: Page; detailId?: string; detailName?: string } | null => {
  const path = window.location.pathname.replace(/^\//, "");
  const parts = path.split("/").filter(Boolean);
  
  if (parts.length < 2) return null;
  
  const route = parts[0];
  const page = routeToPage[route];
  if (!page) return null;
  
  return {
    page,
    detailName: parts[1],
  };
};

// Fonction pour mettre à jour l'URL
const updateUrl = (page: Page, detailId?: string) => {
  let newUrl = `/${pageToRoute[page]}`;
  if (detailId) {
    newUrl += `/${detailId}`;
  }
  if (window.location.pathname !== newUrl) {
    window.history.pushState({ page, detailId }, "", newUrl);
  }
};

export function Dashboard({ onLogout, user }: DashboardProps) {
  // Initialiser la page depuis l'URL
  const [currentPage, setCurrentPage] = useState<Page>(() => getPageFromUrl());
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Effet pour gérer le chargement initial et les changements d'URL
  useEffect(() => {
    const handlePopState = async () => {
      const detailInfo = getDetailFromUrl();
      const page = getPageFromUrl();
      
      setCurrentPage(page);
      
      // Réinitialiser les détails sélectionnés
      setSelectedApplication(null);
      setSelectedSubscription(null);
      setSelectedUser(null);
      setSelectedPaymentMethod(null);
      setSelectedWallet(null);
      setSelectedAccount(null);
      
      // Charger les détails si nécessaire
      if (detailInfo) {
        if (detailInfo.page === 'applications' && detailInfo.detailName) {
          loadApplicationDetails(detailInfo.detailName);
        } else if (detailInfo.page === 'users' && detailInfo.detailName) {
          loadUserDetails(detailInfo.detailName);
        } else if (detailInfo.page === 'payment' && detailInfo.detailName) {
          if (detailInfo.detailName.startsWith('account-')) {
            const accountId = detailInfo.detailName.replace('account-', '');
            // Charger les détails du compte
            try {
              const account = await getAccountById(accountId);
              setSelectedAccount(account);
            } catch (err) {
              console.error('Erreur lors du chargement du compte:', err);
              // Gérer l'erreur (par exemple, afficher un message à l'utilisateur)
            }
          }
        }
      }
    };

    // Gestion initiale
    handlePopState();
    
    // Écouter les changements d'URL (navigation avant/arrière)
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fonction pour charger les détails d'une application
  const loadApplicationDetails = async (appId: string) => {
    try {
      setIsLoading(true);
      // Ici, vous devriez appeler votre service pour récupérer les détails de l'application
      // Par exemple : const app = await applicationService.getApplicationById(appId);
      // setSelectedApplication(adaptApplicationForDetails(app));
      
      // Pour l'instant, on simule le chargement
      const app = applications.find(a => a.id === appId);
      if (app) {
        setSelectedApplication(app);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails de l\'application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger les détails d'un utilisateur
  const loadUserDetails = async (userId: string) => {
    try {
      setIsLoading(true);
      // Ici, vous devriez appeler votre service pour récupérer les détails de l'utilisateur
      // Par exemple : const user = await userService.getUserById(userId);
      // setSelectedUser(user);
      
      // Pour l'instant, on simule le chargement
      const user = users.find((u: User) => u.id === userId);
      if (user) {
        setSelectedUser(user);
      } else {
        // Si l'utilisateur n'est pas trouvé dans la liste, on pourrait le charger depuis l'API
        // const userFromApi = await userService.getUserById(userId);
        // setSelectedUser(userFromApi);
        console.warn(`Utilisateur avec l'ID ${userId} non trouvé dans la liste`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails de l\'utilisateur:', error);
    } finally {
      setIsLoading(false);
    }
  };

const adaptApplicationForDetails = (app: ApiApplication): Application => {
  const allowedStatuses: Application["status"][] = ["active", "inactive", "maintenance"];
  const normalizedStatus = (app.status ?? "").toLowerCase() as Application["status"];

  return {
    id: app.id,
    name: app.name,
    category: app.type || "Application",
    version: app.version || "1.0.0",
    status: allowedStatuses.includes(normalizedStatus) ? normalizedStatus : "active",
    subscriptions: 0,
    lastUpdate: app.updatedAt || app.createdAt || new Date().toISOString(),
    description: app.description || "",
    plans: [],
    features: [],
  };
};

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
    {
      id: "trialPolicies" as Page,
      label: "Périodes d'essai",
      icon: Clock,
    },
  ];

  const handleViewApplicationDetails = (app: ApiApplication) => {
    const adaptedApp = adaptApplicationForDetails(app);
    setSelectedApplication(adaptedApp);
    updateUrl("applications", adaptedApp.id);
  };

  const handleBackFromApplicationDetails = () => {
    setSelectedApplication(null);
    updateUrl("applications");
  };

  const handleUpdateApplication = (updatedApp: Application) => {
    setApplications((prevApps) =>
      prevApps.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );
    setSelectedApplication(updatedApp);
  };

  const handleViewSubscriptionDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    updateUrl("subscriptions");
    const contextSlug = subscription.contextName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    window.history.pushState({ page: "subscriptions", detail: subscription.id }, "", `/subscriptions/${contextSlug}`);
  };

  const handleBackFromSubscriptionDetails = () => {
    setSelectedSubscription(null);
    updateUrl("subscriptions");
    window.history.pushState({ page: "subscriptions" }, "", "/subscriptions");
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    updateUrl("users", user.id);
  };

  const handleBackFromUserDetails = () => {
    setSelectedUser(null);
    updateUrl("users");
  };

  const handleViewPaymentMethodDetails = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handleBackFromPaymentMethodDetails = () => {
    setSelectedPaymentMethod(null);
  };

  const loadWalletDetails = async (walletId: string) => {
    try {
      // Implémentez la logique de rafraîchissement du portefeuille ici
      // Par exemple : const wallet = await getWalletById(walletId);
      // setSelectedWallet(wallet);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du portefeuille:', error);
    }
  };

  const handleViewWalletDetails = (wallet: Wallet) => {
    setSelectedWallet(wallet);
  };

  const handleBackFromWalletDetails = () => {
    setSelectedWallet(null);
  };

  const handleViewAccountDetails = (account: Account) => {
    setSelectedAccount(account);
    updateUrl('payment', `account-${account.id}`);
  };

  const handleBackFromAccountDetails = () => {
    setSelectedAccount(null);
    updateUrl('payment');
  };

  const currentHeading =
    (selectedApplication && currentPage === "applications" && selectedApplication.name) ||
    (selectedSubscription && currentPage === "subscriptions" && selectedSubscription.contextName) ||
    (selectedUser && currentPage === "users" && selectedUser.name) ||
    (selectedPaymentMethod && currentPage === "payment" && selectedPaymentMethod.name) ||
    (selectedWallet && currentPage === "payment" && `Portefeuille de ${selectedWallet.account.accountName}`) ||
    (selectedAccount && currentPage === "payment" && `Compte ${selectedAccount.accountName}`) ||
    menuItems.find((item) => item.id === currentPage)?.label ||
    (currentPage === "settings" ? "Paramètres" : "Statistiques");

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      );
    }

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
          method={selectedPaymentMethod}
          onBack={handleBackFromPaymentMethodDetails}
        />
      );
    }

    if (selectedWallet && currentPage === "payment") {
      return (
<WalletDetails
          wallet={selectedWallet}
          onBack={handleBackFromWalletDetails}
          onRefresh={() => loadWalletDetails(selectedWallet.id)}
        />
      );
    }

    if (selectedAccount && currentPage === "payment") {
      return (
        <AccountDetails
          accountId={selectedAccount.id}
          onBack={handleBackFromAccountDetails}
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
            onViewAccountDetails={handleViewAccountDetails}
          />
        );
      case "trialPolicies":
        return <TrialPolicies />;
      case "settings":
        return <Settings />;
      default:
        return <DashboardStats />;
    }
  };

  // Gestion des changements d'URL et chargement des détails
  useEffect(() => {
    const handlePopState = () => {
      const detailInfo = getDetailFromUrl();
      const page = getPageFromUrl();
      
      setCurrentPage(page);
      
      // Réinitialiser les détails sélectionnés
      setSelectedApplication(null);
      setSelectedSubscription(null);
      setSelectedUser(null);
      setSelectedPaymentMethod(null);
      setSelectedWallet(null);
      
      // Charger les détails si nécessaire
      if (detailInfo) {
        if (detailInfo.page === 'applications' && detailInfo.detailName) {
          loadApplicationDetails(detailInfo.detailName);
        } else if (detailInfo.page === 'subscriptions' && detailInfo.detailName) {
          // Implémenter le chargement des détails d'abonnement si nécessaire
        } else if (detailInfo.page === 'users' && detailInfo.detailName) {
          // Implémenter le chargement des détails utilisateur si nécessaire
        }
      }
    };

    // Gestion initiale
    handlePopState();
    
    // Écouter les changements d'URL (navigation avant/arrière)
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fonction pour changer de page et mettre à jour l'URL
  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    updateUrl(page);
  };

  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    "Admin";
  const displayEmail = user?.email || user?.contact || "admin@example.com";
  const avatarFallback =
    (displayName || "")
      .split(" ")
      .map((part: string) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-4 px-2 py-3">
              <img src={logo} alt="Logo" className="w-16 h-12 object-contain" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold">FAROTY</span>
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
                        onClick={() => handlePageChange(item.id)}
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
                      onClick={() => handlePageChange("settings")}
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
                        <AvatarImage src={user?.avatarUrl || ""} />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col items-start text-left">
                        <span className="text-sm truncate max-w-[120px]">{displayName}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {displayEmail}
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
                    <DropdownMenuItem onClick={() => handlePageChange("settings")}>
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

        <SidebarInset className="flex flex-col overflow-hidden">
          <header className="sticky top-0 z-50 flex h-16 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            
            {/* Conteneur principal qui prend tout l'espace restant */}
            <div className="flex flex-1 items-center justify-between">
              {/* Titre à gauche */}
              <h1 className="text-lg">{currentHeading}</h1>
              
              {/* Bouton déconnexion à droite */}
              <Button variant="outline" size="sm" onClick={onLogout} className="w-fit text-xs text-muted-foreground bg-red-500 hover:bg-red-600 px-3 py-1 text-white hover:text-white">
                <LogOut className="mr-1 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-6 overflow-y-auto overflow-x-hidden min-h-0">
            {renderContent()}
          </main>
        </SidebarInset>

      </div>
    </SidebarProvider>
  );
}

