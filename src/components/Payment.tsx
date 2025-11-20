import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, CreditCard, Wallet, Eye } from "lucide-react";
import { PaymentMethodDetails } from "./PaymentMethodDetails";
import { WalletDetails } from "./WalletDetails";

export interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "bank" | "paypal" | "crypto" | "other";
  status: "active" | "inactive" | "pending";
  description: string;
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
  supportedCurrencies: string[];
  createdAt: string;
  lastUsed: string | null;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: "deposit" | "withdrawal" | "payment" | "refund";
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  description: string;
  paymentMethodId: string | null;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  userName: string;
  balance: number;
  currency: string;
  status: "active" | "frozen" | "closed";
  createdAt: string;
  transactions: Transaction[];
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    name: "Carte Bancaire",
    type: "card",
    status: "active",
    description: "Paiement par carte bancaire (Visa, Mastercard, Amex)",
    fees: { percentage: 2.5, fixed: 0.3, currency: "EUR" },
    supportedCurrencies: ["EUR", "USD", "GBP"],
    createdAt: "2024-01-15",
    lastUsed: "2024-11-15",
  },
  {
    id: "2",
    name: "Virement Bancaire",
    type: "bank",
    status: "active",
    description: "Virement bancaire SEPA",
    fees: { percentage: 0, fixed: 0, currency: "EUR" },
    supportedCurrencies: ["EUR"],
    createdAt: "2024-02-20",
    lastUsed: "2024-11-14",
  },
  {
    id: "3",
    name: "PayPal",
    type: "paypal",
    status: "active",
    description: "Paiement via PayPal",
    fees: { percentage: 3.4, fixed: 0.35, currency: "EUR" },
    supportedCurrencies: ["EUR", "USD"],
    createdAt: "2024-03-10",
    lastUsed: "2024-11-12",
  },
  {
    id: "4",
    name: "Bitcoin",
    type: "crypto",
    status: "pending",
    description: "Paiement en Bitcoin",
    fees: { percentage: 1, fixed: 0, currency: "EUR" },
    supportedCurrencies: ["BTC", "EUR"],
    createdAt: "2024-11-01",
    lastUsed: null,
  },
];

const mockWallets: Wallet[] = [
  {
    id: "1",
    userId: "1",
    userName: "Marie Dupont",
    balance: 1250.50,
    currency: "EUR",
    status: "active",
    createdAt: "2024-01-15",
    transactions: [
      {
        id: "t1",
        walletId: "1",
        type: "deposit",
        amount: 500,
        currency: "EUR",
        status: "completed",
        description: "Dépôt initial",
        paymentMethodId: "1",
        createdAt: "2024-01-15",
      },
      {
        id: "t2",
        walletId: "1",
        type: "payment",
        amount: -29.99,
        currency: "EUR",
        status: "completed",
        description: "Paiement subscription Premium",
        paymentMethodId: "1",
        createdAt: "2024-02-01",
      },
      {
        id: "t3",
        walletId: "1",
        type: "deposit",
        amount: 800,
        currency: "EUR",
        status: "completed",
        description: "Recharge compte",
        paymentMethodId: "2",
        createdAt: "2024-03-15",
      },
    ],
  },
  {
    id: "2",
    userId: "2",
    userName: "Jean Martin",
    balance: 45.20,
    currency: "EUR",
    status: "active",
    createdAt: "2024-02-20",
    transactions: [
      {
        id: "t4",
        walletId: "2",
        type: "deposit",
        amount: 50,
        currency: "EUR",
        status: "completed",
        description: "Dépôt initial",
        paymentMethodId: "3",
        createdAt: "2024-02-20",
      },
      {
        id: "t5",
        walletId: "2",
        type: "payment",
        amount: -4.80,
        currency: "EUR",
        status: "completed",
        description: "Paiement subscription Gratuit",
        paymentMethodId: "3",
        createdAt: "2024-03-01",
      },
    ],
  },
  {
    id: "3",
    userId: "3",
    userName: "Sophie Bernard",
    balance: 0,
    currency: "EUR",
    status: "frozen",
    createdAt: "2024-03-10",
    transactions: [],
  },
];

const statusColors = {
  active: "bg-green-600",
  inactive: "bg-gray-400",
  pending: "bg-amber-500",
  frozen: "bg-blue-500",
  closed: "bg-red-500",
};

const statusLabels = {
  active: "Actif",
  inactive: "Inactif",
  pending: "En attente",
  frozen: "Gelé",
  closed: "Fermé",
};

const typeLabels = {
  card: "Carte",
  bank: "Banque",
  paypal: "PayPal",
  crypto: "Crypto",
  other: "Autre",
};

interface PaymentProps {
  onViewPaymentMethodDetails?: (method: PaymentMethod) => void;
  onViewWalletDetails?: (wallet: Wallet) => void;
}

export function Payment({
  onViewPaymentMethodDetails,
  onViewWalletDetails,
}: PaymentProps) {
  const [searchTermMethods, setSearchTermMethods] = useState("");
  const [searchTermWallets, setSearchTermWallets] = useState("");
  const [activeTab, setActiveTab] = useState<"methods" | "wallets">("methods");

  const filteredPaymentMethods = mockPaymentMethods.filter((method) =>
    method.name.toLowerCase().includes(searchTermMethods.toLowerCase()) ||
    method.description.toLowerCase().includes(searchTermMethods.toLowerCase())
  );

  const filteredWallets = mockWallets.filter((wallet) =>
    wallet.userName.toLowerCase().includes(searchTermWallets.toLowerCase())
  );

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const handleViewPaymentMethod = (method: PaymentMethod) => {
    if (onViewPaymentMethodDetails) {
      onViewPaymentMethodDetails(method);
    }
  };

  const handleViewWallet = (wallet: Wallet) => {
    if (onViewWalletDetails) {
      onViewWalletDetails(wallet);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      {/* En-tête */}
      <div className="border-b border-yellow-500 pb-4 flex-shrink-0">
        <h2 className="text-gray-900">Paiements</h2>
        <p className="text-gray-600">
          Gérez les méthodes de paiement et les wallets
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "methods" | "wallets")} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="flex-shrink-0">
          <TabsTrigger value="methods">
            <CreditCard className="mr-2 h-4 w-4" />
            Méthodes de paiement
          </TabsTrigger>
          <TabsTrigger value="wallets">
            <Wallet className="mr-2 h-4 w-4" />
            Wallets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="flex-1 flex flex-col overflow-hidden space-y-6">
          <Card className="border-0 shadow-md overflow-hidden relative flex-1 flex flex-col">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-gray-900">Méthodes de paiement</CardTitle>
              <CardDescription className="text-gray-600">
                {filteredPaymentMethods.length} méthode(s) disponible(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="mb-4 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une méthode de paiement..."
                    value={searchTermMethods}
                    onChange={(e) => setSearchTermMethods(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border overflow-hidden flex-1 min-h-0">
                <div className="h-full overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-0">
                      <TableRow>
                        <TableHead className="whitespace-nowrap min-w-[150px]">Nom</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[100px]">Type</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[200px]">Description</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[120px]">Frais</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[150px]">Devises</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[100px]">Statut</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[110px]">Dernière utilisation</TableHead>
                        <TableHead className="text-right whitespace-nowrap min-w-[70px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPaymentMethods.map((method) => (
                        <TableRow key={method.id}>
                          <TableCell className="whitespace-nowrap font-medium">
                            {method.name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline">
                              {typeLabels[method.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>{method.description}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {method.fees.percentage > 0 && (
                              <div>{method.fees.percentage}%</div>
                            )}
                            {method.fees.fixed > 0 && (
                              <div className="text-muted-foreground">
                                +{formatPrice(method.fees.fixed, method.fees.currency)}
                              </div>
                            )}
                            {method.fees.percentage === 0 && method.fees.fixed === 0 && (
                              <span className="text-green-600">Gratuit</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {method.supportedCurrencies.map((curr, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {curr}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="secondary"
                              className={`${statusColors[method.status]} text-white`}
                            >
                              {statusLabels[method.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {method.lastUsed
                              ? new Date(method.lastUsed).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "Jamais"}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPaymentMethod(method)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets" className="flex-1 flex flex-col overflow-hidden space-y-6">
          <Card className="border-0 shadow-md overflow-hidden relative flex-1 flex flex-col">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-gray-900">Wallets</CardTitle>
              <CardDescription className="text-gray-600">
                {filteredWallets.length} wallet(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="mb-4 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un wallet..."
                    value={searchTermWallets}
                    onChange={(e) => setSearchTermWallets(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border overflow-hidden flex-1 min-h-0">
                <div className="h-full overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-0">
                      <TableRow>
                        <TableHead className="whitespace-nowrap min-w-[150px]">Utilisateur</TableHead>
                        <TableHead className="text-right whitespace-nowrap min-w-[120px]">Solde</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[80px]">Devise</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[100px]">Statut</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[100px]">Transactions</TableHead>
                        <TableHead className="whitespace-nowrap min-w-[110px]">Date création</TableHead>
                        <TableHead className="text-right whitespace-nowrap min-w-[70px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWallets.map((wallet) => (
                        <TableRow key={wallet.id}>
                          <TableCell className="whitespace-nowrap font-medium">
                            {wallet.userName}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap font-semibold">
                            {formatPrice(wallet.balance, wallet.currency)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline">
                              {wallet.currency}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="secondary"
                              className={`${statusColors[wallet.status]} text-white`}
                            >
                              {statusLabels[wallet.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {wallet.transactions.length}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(wallet.createdAt).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewWallet(wallet)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

