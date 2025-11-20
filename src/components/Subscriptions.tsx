import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Search,
  Download,
  Filter,
  Eye,
  Tag,
  Users,
  Layers,
  CreditCard as CreditCardIcon,
  Activity,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SubscriptionDetails, Subscription } from "./SubscriptionDetails";

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

const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    contextName: "Équipe Marketing TechCorp",
    numberOfPeople: 3,
    people: [
      { id: "p1", name: "Marie Dupont", email: "marie.dupont@techcorp.com" },
      { id: "p2", name: "Jean Martin", email: "jean.martin@techcorp.com" },
      { id: "p3", name: "Sophie Bernard", email: "sophie.bernard@techcorp.com" },
    ],
    application: "TaskMaster Pro",
    applicationId: "1",
    plans: [
      {
        planId: "2",
        planName: "Premium",
        interval: "month",
        price: 19.99,
        currency: "EUR",
        features: [
          { featureId: "1", featureName: "Tâches illimitées", limit: null },
          { featureId: "2", featureName: "Collaboration en temps réel", limit: null },
          { featureId: "3", featureName: "Export PDF", limit: null },
        ],
      },
    ],
    promotionCode: "PREMIUM20",
    promotionPrice: 15.99,
    originalPrice: 19.99,
    finalPrice: 15.99,
    currency: "EUR",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
  },
  {
    id: "2",
    contextName: "Startup Innovante",
    numberOfPeople: 2,
    people: [
      { id: "p4", name: "Alexandre Leroy", email: "alexandre@startup.com" },
      { id: "p5", name: "Camille Petit", email: "camille@startup.com" },
    ],
    application: "SocialHub",
    applicationId: "3",
    plans: [
      {
        planId: "6",
        planName: "Pro",
        interval: "month",
        price: 14.99,
        currency: "EUR",
        features: [
          { featureId: "8", featureName: "Publications illimitées", limit: null },
          { featureId: "9", featureName: "Partage multimédia", limit: null },
        ],
      },
    ],
    promotionCode: null,
    promotionPrice: null,
    originalPrice: 14.99,
    finalPrice: 14.99,
    currency: "EUR",
    status: "active",
    startDate: "2024-06-10",
    endDate: "2024-12-10",
  },
  {
    id: "3",
    contextName: "Studio de Design",
    numberOfPeople: 4,
    people: [
      { id: "p6", name: "Thomas Moreau", email: "thomas@studio-design.com" },
      { id: "p7", name: "Julie Rousseau", email: "julie@studio-design.com" },
      { id: "p8", name: "Lucas Dubois", email: "lucas@studio-design.com" },
      { id: "p9", name: "Emma Laurent", email: "emma@studio-design.com" },
    ],
    application: "GameZone Ultra",
    applicationId: "2",
    plans: [
      {
        planId: "3",
        planName: "Basique",
        interval: "year",
        price: 99.99,
        currency: "EUR",
        features: [
          { featureId: "5", featureName: "Jeux multijoueurs", limit: 5, used: 5 },
          { featureId: "6", featureName: "Chat en direct", limit: null },
        ],
      },
      {
        planId: "4",
        planName: "Ultra",
        interval: "month",
        price: 29.99,
        currency: "EUR",
        features: [
          { featureId: "5", featureName: "Jeux multijoueurs", limit: null },
          { featureId: "7", featureName: "Classements", limit: null },
        ],
      },
    ],
    promotionCode: null,
    promotionPrice: null,
    originalPrice: 129.98,
    finalPrice: 129.98,
    currency: "EUR",
    status: "active",
    startDate: "2024-03-20",
    endDate: "2025-03-20",
  },
  {
    id: "4",
    contextName: "Université Paris Tech",
    numberOfPeople: 1,
    people: [
      { id: "p10", name: "Pierre Garnier", email: "pierre.garnier@univ-paris-tech.fr" },
    ],
    application: "LearnPlus",
    applicationId: "4",
    plans: [
      {
        planId: "1",
        planName: "Gratuit",
        interval: "month",
        price: 0,
        currency: "EUR",
        features: [
          { featureId: "1", featureName: "Tâches illimitées", limit: 10, used: 8 },
        ],
      },
    ],
    promotionCode: null,
    promotionPrice: null,
    originalPrice: 0,
    finalPrice: 0,
    currency: "EUR",
    status: "expired",
    startDate: "2023-09-05",
    endDate: "2024-09-05",
  },
  {
    id: "5",
    contextName: "Gamer Pro",
    numberOfPeople: 1,
    people: [
      { id: "p11", name: "Nicolas Lefebvre", email: "nicolas@gamerpro.com" },
    ],
    application: "GameZone Ultra",
    applicationId: "2",
    plans: [
      {
        planId: "4",
        planName: "Ultra",
        interval: "month",
        price: 29.99,
        currency: "EUR",
        features: [
          { featureId: "5", featureName: "Jeux multijoueurs", limit: null },
          { featureId: "6", featureName: "Chat en direct", limit: null },
          { featureId: "7", featureName: "Classements", limit: null },
        ],
      },
    ],
    promotionCode: null,
    promotionPrice: null,
    originalPrice: 29.99,
    finalPrice: 29.99,
    currency: "EUR",
    status: "cancelled",
    startDate: "2024-02-14",
    endDate: "2024-08-14",
  },
  {
    id: "6",
    contextName: "Famille Dubois",
    numberOfPeople: 4,
    people: [
      { id: "p12", name: "Marc Dubois", email: "marc.dubois@email.com" },
      { id: "p13", name: "Isabelle Dubois", email: "isabelle.dubois@email.com" },
      { id: "p14", name: "Lucas Dubois", email: "lucas.dubois@email.com" },
      { id: "p15", name: "Emma Dubois", email: "emma.dubois@email.com" },
    ],
    application: "TaskMaster Pro",
    applicationId: "1",
    plans: [
      {
        planId: "1",
        planName: "Gratuit",
        interval: "month",
        price: 0,
        currency: "EUR",
        features: [
          { featureId: "1", featureName: "Tâches illimitées", limit: 10, used: 10 },
          { featureId: "2", featureName: "Collaboration en temps réel", limit: null },
        ],
      },
    ],
    promotionCode: null,
    promotionPrice: null,
    originalPrice: 0,
    finalPrice: 0,
    currency: "EUR",
    status: "active",
    startDate: "2024-10-01",
    endDate: "2025-10-01",
  },
  {
    id: "7",
    contextName: "Fitness Enthusiast",
    numberOfPeople: 1,
    people: [
      { id: "p16", name: "Sarah Moreau", email: "sarah@fitness.com" },
    ],
    application: "FitTracker",
    applicationId: "5",
    plans: [
      {
        planId: "2",
        planName: "Premium",
        interval: "year",
        price: 199.99,
        currency: "EUR",
        features: [
          { featureId: "1", featureName: "Tâches illimitées", limit: null },
        ],
      },
    ],
    promotionCode: null,
    promotionPrice: null,
    originalPrice: 199.99,
    finalPrice: 199.99,
    currency: "EUR",
    status: "active",
    startDate: "2024-07-22",
    endDate: "2025-07-22",
  },
  {
    id: "8",
    contextName: "Entreprise TechNova",
    numberOfPeople: 4,
    people: [
      { id: "p17", name: "David Chen", email: "david.chen@technova.com" },
      { id: "p18", name: "Laura Martinez", email: "laura.martinez@technova.com" },
      { id: "p19", name: "Antoine Blanc", email: "antoine.blanc@technova.com" },
      { id: "p20", name: "Clara Simon", email: "clara.simon@technova.com" },
    ],
    application: "SocialHub",
    applicationId: "3",
    plans: [
      {
        planId: "6",
        planName: "Pro",
        interval: "year",
        price: 149.99,
        currency: "EUR",
        features: [
          { featureId: "8", featureName: "Publications illimitées", limit: null },
          { featureId: "9", featureName: "Partage multimédia", limit: null },
          { featureId: "10", featureName: "Statistiques avancées", limit: null },
        ],
      },
    ],
    promotionCode: "SOCIAL15",
    promotionPrice: 127.49,
    originalPrice: 149.99,
    finalPrice: 127.49,
    currency: "EUR",
    status: "active",
    startDate: "2024-04-18",
    endDate: "2025-04-18",
  },
];

interface SubscriptionsProps {
  onViewDetails?: (subscription: Subscription) => void;
}

export function Subscriptions({ onViewDetails }: SubscriptionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.contextName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.application.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || sub.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalFinalPrice = filteredSubscriptions.reduce(
    (sum, sub) => sum + (sub.status === "active" ? sub.finalPrice : 0),
    0,
  );

  const activeCount = filteredSubscriptions.filter((sub) => sub.status === "active").length;
  const cancelledCount = filteredSubscriptions.filter((sub) => sub.status === "cancelled").length;

  const handleViewDetails = (subscription: Subscription) => {
    if (onViewDetails) {
      onViewDetails(subscription);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      {/* En-tête */}
      <div className="border-b border-yellow-500 pb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-gray-900">Subscriptions</h2>
          <p className="text-gray-600">
            Gérez et suivez toutes les subscriptions avec une vision unifiée des statuts, des plans et des revenus.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-0"
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-6 md:grid-cols-3 flex-shrink-0">
        <Card className="border-0 shadow-md overflow-hidden relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-gray-900">{filteredSubscriptions.length}</span>
                </div>
                <p className="text-sm text-gray-600">Tous contextes confondus</p>
              </div>
              <p className="text-sm text-gray-700">Total Subscriptions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-gray-900">{activeCount}</span>
                </div>
                <p className="text-sm text-gray-600">Toujours facturées</p>
              </div>
              <p className="text-sm text-gray-700">Subscriptions Actives</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-gray-900">{formatPrice(totalFinalPrice, "EUR")}</span>
                </div>
                <p className="text-sm text-gray-600">{cancelledCount} résiliation(s) détectée(s)</p>
              </div>
              <p className="text-sm text-gray-700">Revenu total (Actif)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carte principale */}
      <Card className="border-0 shadow-md overflow-hidden relative flex-1 flex flex-col">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-gray-900">Liste des Subscriptions</CardTitle>
              <CardDescription className="text-gray-600">
                {filteredSubscriptions.length} subscription(s) trouvée(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-wrap gap-4 mb-4 flex-shrink-0">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par contexte ou application..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-hidden flex-1 min-h-0">
            <div className="h-full overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-0">
                  <TableRow>
                    <TableHead className="whitespace-nowrap min-w-[180px]">Contexte</TableHead>
                    <TableHead className="whitespace-nowrap min-w-[120px]">Personnes</TableHead>
                    <TableHead className="whitespace-nowrap min-w-[140px]">Application</TableHead>
                    <TableHead className="whitespace-nowrap min-w-[140px]">Plans</TableHead>
                    <TableHead className="whitespace-nowrap min-w-[100px]">Statut</TableHead>
                    <TableHead className="whitespace-nowrap min-w-[120px]">Date début</TableHead>
                    <TableHead className="whitespace-nowrap min-w-[120px]">Date fin</TableHead>
                    <TableHead className="text-right whitespace-nowrap min-w-[120px]">Prix original</TableHead>
                    <TableHead className="text-right whitespace-nowrap min-w-[130px]">Prix promo</TableHead>
                    <TableHead className="text-right whitespace-nowrap min-w-[120px]">Prix final</TableHead>
                    <TableHead className="text-right whitespace-nowrap min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-semibold text-gray-900">
                        {sub.contextName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{sub.numberOfPeople}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{sub.application}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sub.plans.map((plan, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {plan.planName}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${statusColors[sub.status]} text-white`}
                        >
                          {statusLabels[sub.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(sub.startDate).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(sub.endDate).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatPrice(sub.originalPrice, sub.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {sub.promotionPrice !== null ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-semibold text-orange-600">
                              {formatPrice(sub.promotionPrice, sub.currency)}
                            </span>
                            {sub.promotionCode && (
                              <Badge variant="default" className="bg-orange-500 text-xs">
                                <Tag className="mr-1 h-3 w-3" />
                                {sub.promotionCode}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(sub.finalPrice, sub.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(sub)}
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
    </div>
  );
}
