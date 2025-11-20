import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ArrowLeft, Wallet, User, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Wallet as WalletType } from "./Payment";

interface WalletDetailsProps {
  wallet: WalletType;
  onBack: () => void;
}

const statusColors = {
  active: "bg-green-600",
  frozen: "bg-blue-500",
  closed: "bg-red-500",
};

const statusLabels = {
  active: "Actif",
  frozen: "Gelé",
  closed: "Fermé",
};

const transactionTypeLabels = {
  deposit: "Dépôt",
  withdrawal: "Retrait",
  payment: "Paiement",
  refund: "Remboursement",
};

const transactionStatusColors = {
  completed: "bg-green-600",
  pending: "bg-amber-500",
  failed: "bg-red-500",
};

const transactionStatusLabels = {
  completed: "Terminé",
  pending: "En attente",
  failed: "Échoué",
};

export function WalletDetails({ wallet, onBack }: WalletDetailsProps) {
  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const totalDeposits = wallet.transactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = wallet.transactions
    .filter((t) => (t.type === "withdrawal" || t.type === "payment") && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-yellow-500 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h2 className="text-gray-900">Wallet de {wallet.userName}</h2>
            <p className="text-gray-600">Détails du wallet</p>
          </div>
        </div>
      </div>

      {/* Informations générales */}
      <Card className="border-0 shadow-md overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader>
          <CardTitle className="text-gray-900">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Utilisateur
              </Label>
              <div className="mt-1 font-medium">{wallet.userName}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Solde actuel
              </Label>
              <div className="mt-1 text-2xl font-bold text-green-600">
                {formatPrice(wallet.balance, wallet.currency)}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Devise</Label>
              <div className="mt-1">
                <Badge variant="outline">{wallet.currency}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                {wallet.status === "active" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : wallet.status === "frozen" ? (
                  <Clock className="h-4 w-4 text-blue-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                Statut
              </Label>
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className={`${statusColors[wallet.status]} text-white`}
                >
                  {statusLabels[wallet.status]}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Date de création
              </Label>
              <div className="mt-1">
                {new Date(wallet.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md overflow-hidden relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-900">Total dépôts</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(totalDeposits, wallet.currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-900">Total retraits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatPrice(totalWithdrawals, wallet.currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-900">Nombre de transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{wallet.transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="border-0 shadow-md overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader>
          <CardTitle className="text-gray-900">Transactions ({wallet.transactions.length})</CardTitle>
          <CardDescription className="text-gray-600">
            Historique complet des transactions de ce wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wallet.transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune transaction
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-0">
                    <TableRow>
                      <TableHead className="whitespace-nowrap min-w-[100px]">Type</TableHead>
                      <TableHead className="whitespace-nowrap min-w-[150px]">Description</TableHead>
                      <TableHead className="text-right whitespace-nowrap min-w-[100px]">Montant</TableHead>
                      <TableHead className="whitespace-nowrap min-w-[100px]">Statut</TableHead>
                      <TableHead className="whitespace-nowrap min-w-[110px]">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallet.transactions
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={
                                transaction.type === "deposit" || transaction.type === "refund"
                                  ? "text-green-600 border-green-600"
                                  : "text-red-600 border-red-600"
                              }
                            >
                              {transactionTypeLabels[transaction.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell
                            className={`text-right whitespace-nowrap font-semibold ${
                              transaction.amount > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {formatPrice(transaction.amount, transaction.currency)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="secondary"
                              className={`${transactionStatusColors[transaction.status]} text-white`}
                            >
                              {transactionStatusLabels[transaction.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

