// src/components/Payment.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CreditCard, Wallet as WalletIcon, User, AlertCircle } from "lucide-react";
import { PaymentMethods } from './PaymentMethods';
import { Wallets } from './Wallets';
import { Accounts } from './Accounts';
import { PaymentMethod, Wallet, Account } from "../types/payment";

interface PaymentProps {
  onViewPaymentMethodDetails?: (method: PaymentMethod) => void;
  onViewWalletDetails?: (wallet: Wallet) => void;
  onViewAccountDetails?: (account: Account) => void;
}

// Composant principal
export function Payment({ 
  onViewPaymentMethodDetails,
  onViewWalletDetails,
  onViewAccountDetails 
}: PaymentProps) {
  const [activeTab, setActiveTab] = useState<"payment-methods" | "wallets" | "accounts">("wallets");
  const [error, setError] = useState<string | null>(null);

  // Gestion du changement d'onglet
  const handleTabChange = (value: string) => {
    setActiveTab(value as "payment-methods" | "wallets" | "accounts");
  };

  // Gestion des erreurs
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="payment-methods" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Méthodes de paiement
          </TabsTrigger>
          <TabsTrigger value="wallets" className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4" />
            Portefeuilles
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Comptes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods">
          <PaymentMethods onViewDetails={onViewPaymentMethodDetails} />
        </TabsContent>

        <TabsContent value="wallets">
          <Wallets onViewDetails={onViewWalletDetails} />
        </TabsContent>

        <TabsContent value="accounts">
          <Accounts onViewDetails={onViewAccountDetails} />
        </TabsContent>
      </Tabs>
    </div>
  );
}