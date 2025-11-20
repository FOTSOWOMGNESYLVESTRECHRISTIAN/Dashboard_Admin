import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { ArrowLeft, Users, Check, X, AlertCircle, Calendar, Tag } from "lucide-react";

interface SubscriptionPlan {
  planId: string;
  planName: string;
  interval: "month" | "year";
  price: number;
  currency: string;
  features: Array<{
    featureId: string;
    featureName: string;
    limit: number | null;
    used?: number;
  }>;
}

interface Person {
  id: string;
  name: string;
  email: string;
}

export interface Subscription {
  id: string;
  contextName: string;
  numberOfPeople: number;
  people: Person[];
  application: string;
  applicationId: string;
  plans: SubscriptionPlan[];
  promotionCode: string | null;
  promotionPrice: number | null;
  originalPrice: number;
  finalPrice: number;
  currency: string;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
}

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onBack: () => void;
}

const statusColors = {
  active: "bg-green-600",
  expired: "bg-red-500",
  cancelled: "bg-gray-400",
};

const statusLabels = {
  active: "Actif",
  expired: "Expiré",
  cancelled: "Annulé",
};

export function SubscriptionDetails({ subscription, onBack }: SubscriptionDetailsProps) {
  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const isQuotaExhausted = (limit: number | null, used?: number) => {
    if (limit === null) return false;
    if (used === undefined) return false;
    return used >= limit;
  };

  const getQuotaStatus = (limit: number | null, used?: number) => {
    if (limit === null) return { label: "Illimité", exhausted: false };
    if (used === undefined) return { label: `Limite: ${limit}`, exhausted: false };
    const remaining = limit - used;
    return {
      label: `${used} / ${limit} utilisés`,
      remaining,
      exhausted: remaining <= 0,
    };
  };

  const heroStats = [
    {
      label: "Statut",
      value: statusLabels[subscription.status],
      accent: statusColors[subscription.status],
      helper: "État actuel",
    },
    {
      label: "Application",
      value: subscription.application,
      helper: "Produits concernés",
    },
    {
      label: "Début",
      value: new Date(subscription.startDate).toLocaleDateString("fr-FR"),
      helper: "Date effective",
    },
    {
      label: "Fin",
      value: new Date(subscription.endDate).toLocaleDateString("fr-FR"),
      helper: "Renouvellement",
    },
  ];

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
            <h2 className="text-gray-900">{subscription.contextName}</h2>
            <p className="text-gray-600">Détails de la subscription</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {heroStats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md overflow-hidden relative">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.helper}</p>
              </CardContent>
            </Card>
          ))}
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
              <Label className="text-sm text-muted-foreground">Contexte</Label>
              <div className="mt-1 font-medium">{subscription.contextName}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Application</Label>
              <div className="mt-1 font-medium">{subscription.application}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Statut</Label>
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className={`${statusColors[subscription.status]} text-white`}
                >
                  {statusLabels[subscription.status]}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Nombre de personnes</Label>
              <div className="mt-1 flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{subscription.numberOfPeople}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Date de début</Label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(subscription.startDate).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Date de fin</Label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(subscription.endDate).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </div>
          <Separator />
          
          {/* Prix */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Prix original</Label>
              <div className="mt-1 text-lg font-semibold">
                {formatPrice(subscription.originalPrice, subscription.currency)}
              </div>
            </div>
            {subscription.promotionPrice !== null && (
              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  Prix promotion
                  <Badge variant="default" className="bg-orange-500 text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {subscription.promotionCode}
                  </Badge>
                </Label>
                <div className="mt-1 text-lg font-semibold text-orange-600">
                  {formatPrice(subscription.promotionPrice, subscription.currency)}
                </div>
              </div>
            )}
            <div>
              <Label className="text-sm text-muted-foreground">Prix final</Label>
              <div className="mt-1 text-lg font-semibold text-green-600">
                {formatPrice(subscription.finalPrice, subscription.currency)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personnes qui ont souscrit */}
      <Card className="border-0 shadow-md overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader>
          <CardTitle className="text-gray-900">Personnes abonnées</CardTitle>
          <CardDescription className="text-gray-600">
            {subscription.people.length} personne(s) ayant souscrit à cette subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {subscription.people.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{person.name}</div>
                  <div className="text-sm text-muted-foreground">{person.email}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plans souscrits */}
      <Card className="border-0 shadow-md overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader>
          <CardTitle className="text-gray-900">Plans souscrits ({subscription.plans.length})</CardTitle>
          <CardDescription className="text-gray-600">
            Plans et fonctionnalités avec quotas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription.plans.map((plan, planIndex) => (
            <div key={planIndex} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{plan.planName}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    {plan.interval === "month" ? (
                      <>
                        <Calendar className="h-4 w-4" />
                        <span>Facturation mensuelle</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4" />
                        <span>Facturation annuelle</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {formatPrice(plan.price, plan.currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    / {plan.interval === "month" ? "mois" : "an"}
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Fonctionnalités ({plan.features.length})
                </Label>
                <div className="space-y-2">
                  {plan.features.map((feature, featureIndex) => {
                    const quotaStatus = getQuotaStatus(feature.limit, feature.used);
                    const exhausted = isQuotaExhausted(feature.limit, feature.used);
                    
                    return (
                      <div
                        key={featureIndex}
                        className={`flex items-start gap-2 p-3 rounded-lg ${
                          exhausted
                            ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                            : "bg-muted/50"
                        }`}
                      >
                        {exhausted ? (
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {feature.featureName}
                            {exhausted && (
                              <Badge variant="destructive" className="text-xs">
                                Quota épuisé
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {quotaStatus.label}
                            {quotaStatus.remaining !== undefined && quotaStatus.remaining > 0 && (
                              <span className="text-green-600 ml-2">
                                ({quotaStatus.remaining} restant{quotaStatus.remaining > 1 ? "s" : ""})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

