// src/components/WalletDetails.tsx
import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, AlertCircle, Loader2, Wallet as WalletIcon, CreditCard, RefreshCw } from "lucide-react";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from 'sonner';
import { Wallet } from './Payment';

interface WalletDetailsProps {
  wallet: Wallet;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export function WalletDetails({ wallet: initialWallet, onBack, onRefresh }: WalletDetailsProps) {
  const [wallet, setWallet] = useState<Wallet>(initialWallet);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWallet = async () => {
    try {
      setIsLoading(true);
      await onRefresh();
      // Mettre à jour le portefeuille avec les dernières données
      const response = await fetch(`${API_BASE_URL}/wallets/${wallet.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des détails du portefeuille');
      }
      
      const data = await response.json();
      setWallet(data.data);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError('Impossible de rafraîchir les données du portefeuille');
      toast.error('Erreur lors du rafraîchissement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={onBack} className="mb-4" style={{cursor: 'pointer'}}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la liste
      </Button>

      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{wallet.account.accountName}</CardTitle>
              <CardDescription>{wallet.account.accountSubName}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={refreshWallet} disabled={isLoading} style={{cursor: 'pointer'}}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Badge variant={wallet.frozen ? "destructive" : "outline"}>
                {wallet.frozen ? "Gelé" : "Actif"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <div className="flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations générales</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type de portefeuille:</span>
                  <span className="text-sm font-medium">
                    {wallet.walletType === 'PERSONAL' ? 'Personnel' : 'Entreprise'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Devise:</span>
                  <span className="text-sm font-medium">
                    {wallet.currency.nameFr} ({wallet.currency.code})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date de création:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(wallet.createdAt), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dernière mise à jour:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(wallet.updatedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Soldes</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Solde disponible:</span>
                  <span className="text-sm font-medium">
                    {wallet.balance.balance.toLocaleString()} {wallet.currency.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Solde gelé:</span>
                  <span className="text-sm font-medium">
                    {wallet.balance.frozenBalance.toLocaleString()} {wallet.currency.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transactions en attente:</span>
                  <span className="text-sm font-medium">
                    {wallet.balance.pendingBalance.toLocaleString()} {wallet.currency.symbol}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t font-medium">
                  <span>Solde total:</span>
                  <span>
                    {wallet.balance.totalBalance.toLocaleString()} {wallet.currency.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Frais et limites</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Frais</h4>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dépôt:</span>
                  <span className="text-sm font-medium">{wallet.depositFeeRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Retrait:</span>
                  <span className="text-sm font-medium">{wallet.withdrawalFeeRate}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Limites</h4>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction max:</span>
                  <span className="text-sm font-medium">
                    {wallet.maxTransactionAmount.toLocaleString()} {wallet.currency.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Activité récente</h3>
            <div className="text-sm text-muted-foreground">
              <p>Nombre total de transactions: {wallet.transactionsCount}</p>
              <p className="mt-2">
                Dernière activité: {wallet.updatedAt ? format(new Date(wallet.updatedAt), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'Aucune activité récente'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}