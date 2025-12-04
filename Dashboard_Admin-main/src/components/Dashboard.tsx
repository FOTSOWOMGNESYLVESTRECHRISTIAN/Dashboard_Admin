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
  Users as UsersIcon, 
  CreditCard, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  AppWindow, 
  ListOrdered, 
  Wallet as WalletIcon, 
  Landmark, 
  FileText, 
  Clock, 
  Shield, 
  Smartphone, 
  LogOut, 
  ChevronDown, 
  User as UserIcon, 
  Receipt 
} from "lucide-react";
import { DashboardStats } from "./DashboardStats";
import { Applications } from "./Applications";
import { Subscriptions } from "./Subscriptions";
import { Settings } from "./Settings";
import { ApplicationDetails, Application } from "./ApplicationDetails";
import { SubscriptionDetails, Subscription } from "./SubscriptionDetails";
import { Users as UsersComponent } from "./Users";
import type { User } from "./Users";
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

type Page = "stats" | "applications" | "subscriptions" | "users" | "payment" | "settings" | "trialPolicies" | "transactions" | "wallets" | "accounts" | "payment-methods";

// Mapping entre les pages et les noms d'URL
const pageToRoute: Record<Page, string> = {
  stats: "statistiques",
  applications: "applications",
  subscriptions: "subscriptions",
  users: "utilisateurs",
  payment: "paiements",
  settings: "parametres",
  trialPolicies: "periodes-essai",
  transactions: "transactions",
  wallets: "portefeuilles",
  accounts: "comptes",
  "payment-methods": "methodes-paiement",
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

interface MenuItemType {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size: number }>;
  hasDropdown?: boolean;
  dropdownItems?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ size: number }>;
  }>;
}

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
  const [currentHeading, setCurrentHeading] = useState<string>('Tableau de bord');
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  
  // Fonction pour charger les détails d'une application
  const loadApplicationDetails = async (appId: string) => {
    try {
      setIsLoading(true);
      // Implémentez la logique de chargement des détails de l'application ici
      console.log(`Chargement des détails de l'application avec l'ID: ${appId}`);
      // Exemple de chargement simulé
      // const appDetails = await fetchApplicationDetails(appId);
      // setSelectedApplication(appDetails);
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
      // Implémentez la logique de chargement des détails de l'utilisateur ici
      console.log(`Chargement des détails de l'utilisateur avec l'ID: ${userId}`);
      // Exemple de chargement simulé
      // const userDetails = await fetchUserDetails(userId);
      // setSelectedUser(userDetails);
    } catch (error) {
      console.error('Erreur lors du chargement des détails de l\'utilisateur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire pour afficher les détails d'une méthode de paiement
  const handleViewPaymentMethodDetails = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setCurrentPage('payment-methods');
    updateUrl('payment-methods');
  };

  // Gestionnaire pour afficher les détails d'un portefeuille
  const handleViewWalletDetails = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setCurrentPage('wallets');
    updateUrl('wallets');
  };

  // Gestionnaire pour afficher les détails d'un compte
  const handleViewAccountDetails = (account: Account) => {
    setSelectedAccount(account);
    setCurrentPage('accounts');
    updateUrl('accounts');
  };

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

  // Suppression des fonctions en double

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

  const menuItems: MenuItemType[] = [
    {
      id: "stats",
      label: "Statistiques",
      icon: LayoutDashboard,
    },
    {
      id: "applications",
      label: "Applications",
      icon: Smartphone,
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: UsersIcon,
    },
    {
      id: "payment",
      label: "Paiements",
      icon: CreditCard,
      hasDropdown: true,
      dropdownItems: [
        { id: "transactions", label: "Transactions", icon: Receipt },
        { id: "wallets", label: "Portefeuilles", icon: WalletIcon },
        { id: "accounts", label: "Comptes", icon: Landmark },
        { id: "payment-methods", label: "Méthodes de paiement", icon: FileText },
      ],
    },
    {
      id: "trialPolicies",
      label: "Périodes d'essai",
      icon: Clock,
    },
    {
      id: "administration",
      label: "Administration",
      icon: Shield,
      hasDropdown: true,
      dropdownItems: [
        { id: "users", label: "Utilisateurs", icon: UserIcon },
        { id: "settings", label: "Paramètres", icon: SettingsIcon },
      ],
    },
  ];

  // Déterminer l'onglet actif pour le composant Payment
  const activeTab = currentPage === "payment" ? "transactions" : currentPage;

  // Rendu du contenu en fonction de la page courante
  const renderContent = () => {
    switch (currentPage) {
      case "payment":
        return (
          <Payment
            activeTab={activeTab}
            onViewPaymentMethodDetails={handleViewPaymentMethodDetails}
            onViewWalletDetails={handleViewWalletDetails}
            onViewAccountDetails={handleViewAccountDetails}
          />
        );
      case "trialPolicies":
        return <TrialPolicies />;
      case "settings":
        return <Settings />;
      case "users":
        return <UsersComponent />;
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
  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev: Record<string, boolean>) => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handlePageChange = (pageId: string) => {
    // Mettre à jour la page courante
    setCurrentPage(pageId as Page);
    updateUrl(pageId as Page);
    
    // Réinitialiser les sélections de détails quand on change de page
    if (!["transactions", "wallets", "accounts", "payment-methods"].includes(pageId)) {
      setSelectedPaymentMethod(null);
      setSelectedWallet(null);
      setSelectedAccount(null);
    }
  };

  const displayName = user
    ? user.name || [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.username || "Admin"
    : "Admin";
  const displayEmail = user ? user.email || user.contact || "admin@example.com" : "admin@example.com";
  const avatarFallback =
    displayName
      .split(" ")
      .map((part: string) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
  <SidebarProvider>
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar className="border-r">
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
        
        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wider">
              Menu Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => {
                  const dropdownItems = item.dropdownItems || [];
                  const hasSubItems = item.hasDropdown && dropdownItems.length > 0;
                  const isOpen = openMenus[item.id] || false;
                  const isActive = currentPage === item.id || 
                    (dropdownItems.some((sub: any) => sub.id === currentPage) ?? false);
                  
                  return (
                    <SidebarMenuItem key={item.id} className="relative">
                      <div className="w-full">
                        <SidebarMenuButton
                          onClick={() => hasSubItems ? toggleMenu(item.id) : handlePageChange(item.id)}
                          className={`w-full justify-between px-2 py-2 rounded-md transition-all duration-200 cursor-pointer ${
                            isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 hover:cursor-pointer'
                          }`} style={{cursor:'pointer'}}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon size={16} />}
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          {hasSubItems && (
                            <ChevronDown 
                              className={`h-3 w-3 transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`} 
                            />
                          )}
                        </SidebarMenuButton>
                        
                        {/* Sous-menus alignés à gauche sous l'item parent */}
                        {hasSubItems && isOpen && (
                          <div className="mt-1 ml-4 space-y-0.5">
                            {item.dropdownItems?.map((subItem) => {
                              const isSubActive = currentPage === subItem.id;
                              
                              return (
                                <SidebarMenuButton
                                  key={subItem.id}
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handlePageChange(subItem.id);
                                  }}
                                  className={`w-full justify-start px-4 py-1.5 text-xs rounded-md transition-colors duration-150 cursor-pointer ${
                                    isSubActive 
                                      ? 'bg-gray-200 text-gray-600 font-medium' 
                                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/30 hover:cursor-pointer hover:text-gray-600 hover:bg-gray-600'
                                  }`} style={{cursor:'pointer'}}
                                >
                                  <div className="flex items-center gap-2">
                                    {subItem.icon && <subItem.icon size={12} />}
                                    <span>{subItem.label}</span>
                                  </div>
                                </SidebarMenuButton>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
          
          <SidebarFooter>
            <div className="p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={displayName} />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{displayEmail}</p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
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
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col overflow-hidden">
          <header className="sticky top-0 z-50 flex h-16 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-lg">{currentHeading}</h1>
              
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