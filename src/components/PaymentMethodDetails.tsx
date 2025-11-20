import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Clock, DollarSign, Coins } from "lucide-react";
import { PaymentMethod } from "./Payment";

interface PaymentMethodDetailsProps {
  paymentMethod: PaymentMethod;
  onBack: () => void;
}

const statusColors = {
  active: "bg-green-600",
  inactive: "bg-gray-400",
  pending: "bg-amber-500",
};

const statusLabels = {
  active: "Actif",
  inactive: "Inactif",
  pending: "En attente",
};

const typeLabels = {
  card: "Carte",
  bank: "Banque",
  paypal: "PayPal",
  crypto: "Crypto",
  other: "Autre",
};

export function PaymentMethodDetails({
  paymentMethod,
  onBack,
}: PaymentMethodDetailsProps) {
  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

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
            <h2 className="text-gray-900">{paymentMethod.name}</h2>
            <p className="text-gray-600">Détails de la méthode de paiement</p>
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
                <CreditCard className="h-4 w-4" />
                Nom
              </Label>
              <div className="mt-1 font-medium">{paymentMethod.name}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Type</Label>
              <div className="mt-1">
                <Badge variant="outline">{typeLabels[paymentMethod.type]}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                {paymentMethod.status === "active" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : paymentMethod.status === "pending" ? (
                  <Clock className="h-4 w-4 text-amber-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                Statut
              </Label>
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className={`${statusColors[paymentMethod.status]} text-white`}
                >
                  {statusLabels[paymentMethod.status]}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Dernière utilisation
              </Label>
              <div className="mt-1">
                {paymentMethod.lastUsed
                  ? new Date(paymentMethod.lastUsed).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Jamais utilisée"}
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <Label className="text-sm text-muted-foreground">Description</Label>
            <div className="mt-1 text-muted-foreground">{paymentMethod.description}</div>
          </div>
        </CardContent>
      </Card>

      {/* Frais */}
      <Card className="border-0 shadow-md overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader>
          <CardTitle className="text-gray-900">Frais de transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Frais en pourcentage
              </Label>
              <div className="mt-1 text-lg font-semibold">
                {paymentMethod.fees.percentage}%
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Frais fixes
              </Label>
              <div className="mt-1 text-lg font-semibold">
                {paymentMethod.fees.fixed > 0
                  ? formatPrice(paymentMethod.fees.fixed, paymentMethod.fees.currency)
                  : "Aucun"}
              </div>
            </div>
          </div>
          {paymentMethod.fees.percentage === 0 && paymentMethod.fees.fixed === 0 && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                Cette méthode de paiement est gratuite (aucun frais)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Devises supportées */}
      <Card className="border-0 shadow-md overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader>
          <CardTitle className="text-gray-900">Devises supportées</CardTitle>
          <CardDescription className="text-gray-600">
            {paymentMethod.supportedCurrencies.length} devise(s) disponible(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {paymentMethod.supportedCurrencies.map((currency, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {currency}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

