import { useState, useEffect, useCallback, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SubscriptionDetails, Subscription } from "./SubscriptionDetails";
import { subscriptionService } from "../services/subscriptionService";
import { toast } from "sonner";

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

// Les données sont maintenant récupérées depuis l'API via subscriptionService

interface SubscriptionsProps {
  onViewDetails?: (subscription: Subscription) => void;
}

export function Subscriptions({ onViewDetails }: SubscriptionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const loadSubscriptions = useCallback(async (pageNum: number = 0) => {
    setIsLoading(true);
    try {
      const result = await subscriptionService.getAllSubscriptions(pageNum, size);
      setSubscriptions(result.content);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (error: any) {
      console.error("[Subscriptions] Error loading subscriptions:", error);
      
      // Message spécifique pour l'erreur 403
      if (error?.code === "FORBIDDEN" || error?.status === 403 || error?.message?.includes("403")) {
        toast.error(
          "Accès refusé. Veuillez vérifier que vous avez les permissions nécessaires pour consulter les souscriptions."
        );
      } else {
        toast.error(error?.message || "Impossible de charger les souscriptions");
      }
    } finally {
      setIsLoading(false);
    }
  }, [size]);

  useEffect(() => {
    loadSubscriptions(page);
  }, [page, loadSubscriptions]);

  // Compter le nombre de personnes par contexte
  const getPeopleCountByContext = useMemo(() => {
    const contextCounts: Record<string, number> = {};
    subscriptions.forEach((sub) => {
      if (!contextCounts[sub.contextName]) {
        contextCounts[sub.contextName] = 0;
      }
      // Pour l'instant, on compte 1 personne par subscription avec le même contexte
      // Cette logique peut être améliorée si l'API fournit le nombre réel de personnes
      contextCounts[sub.contextName] += 1;
    });
    return contextCounts;
  }, [subscriptions]);

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
    // Remplacer EUR par XFA
    const displayCurrency = currency === "EUR" ? "XFA" : currency;
    return `${price.toFixed(2)} ${displayCurrency}`;
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      {/* En-tête */}
      <div className="border-b border-yellow-500 pb-4 flex items-center justify-between flex-shrink-0 min-h-[80px] bg-accent rounded-2xl p-6 hover:bg-accent/50
      transition-colors duration-200 ease-in-out cursor-pointer hover:text-white hover:border-yellow-600 hover:border-2 hover:shadow-lg
      hover:scale-105">
        <div className="flex-1 min-w-0">
          <h2 className="text-gray-900 font-semibold text-3xl">Gestion des Subscriptions</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gérez et suivez toutes les subscriptions avec une vision unifiée des statuts, des plans et des revenus.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-0 flex-shrink-0 ml-4 h-[40px] hover:text-white hover:border-yellow-600 hover:bg-yellow-600
          transition-colors duration-200 ease-in-out hover:border-2 hover:shadow-lg hover:scale-105"
          style={{cursor: 'pointer'}}
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-6 md:grid-cols-3 flex-shrink-0">
        <Card className="border-0 shadow-md overflow-hidden relative h-[140px]">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <CardContent className="pt-6 h-full">
            <div className="space-y-3 h-full flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-gray-900 font-semibold">{filteredSubscriptions.length}</span>
                </div>
                <p className="text-sm text-gray-600">Tous contextes confondus</p>
              </div>
              <p className="text-sm text-gray-700 font-medium flex-shrink-0">Total Subscriptions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden relative h-[140px]">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <CardContent className="pt-6 h-full">
            <div className="space-y-3 h-full flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-gray-900 font-semibold">{activeCount}</span>
                </div>
                <p className="text-sm text-gray-600">Toujours facturées</p>
              </div>
              <p className="text-sm text-gray-700 font-medium flex-shrink-0">Subscriptions Actives</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden relative h-[140px]">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <CardContent className="pt-6 h-full">
            <div className="space-y-3 h-full flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-gray-900 font-semibold">{formatPrice(totalFinalPrice, "XFA")}</span>
                </div>
                <p className="text-sm text-gray-600">{cancelledCount} résiliation(s) détectée(s)</p>
              </div>
              <p className="text-sm text-gray-700 font-medium flex-shrink-0">Revenu total (Actif)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carte principale */}
      <Card className="border-0 shadow-md overflow-hidden relative flex-1 flex flex-col">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader className="flex-shrink-0 min-h-[80px]">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-gray-900 font-semibold text-lg">Liste des Subscriptions</CardTitle>
              <CardDescription className="text-gray-600 text-sm mt-1">
                {totalElements} subscription(s) au total • {filteredSubscriptions.length} affichée(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-wrap gap-4 mb-4 flex-shrink-0 h-[44px]">
            <div className="relative flex-1 min-w-[220px] h-[44px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
              <Input
                placeholder="Rechercher par contexte ou application..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-[44px]"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px] h-[44px]">
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
            <div className="h-full overflow-y-auto overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground min-h-[200px] flex items-center justify-center">
                  Chargement des souscriptions...
                </div>
              ) : filteredSubscriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground min-h-[200px] flex items-center justify-center">
                  Aucune souscription trouvée
                </div>
              ) : (
                <Table className="table-fixed w-full min-w-[1400px]">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="whitespace-nowrap w-[180px]">Contexte</TableHead>
                      <TableHead className="whitespace-nowrap w-[120px]">Personnes</TableHead>
                      <TableHead className="whitespace-nowrap w-[140px]">Application</TableHead>
                      <TableHead className="whitespace-nowrap w-[140px]">Plans</TableHead>
                      <TableHead className="whitespace-nowrap w-[100px]">Statut</TableHead>
                      <TableHead className="whitespace-nowrap w-[120px]">Date début</TableHead>
                      <TableHead className="whitespace-nowrap w-[120px]">Date fin</TableHead>
                      <TableHead className="text-right whitespace-nowrap w-[120px]">Prix original</TableHead>
                      <TableHead className="text-right whitespace-nowrap w-[130px]">Prix promo</TableHead>
                      <TableHead className="text-right whitespace-nowrap w-[120px]">Prix final</TableHead>
                      <TableHead className="text-right whitespace-nowrap w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-semibold text-gray-900 w-[180px] overflow-hidden text-ellipsis">
                        <span className="block truncate">{sub.contextName}</span>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        {(() => {
                          const count = getPeopleCountByContext[sub.contextName] || sub.numberOfPeople || 0;
                          return count > 0 ? (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>{count}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="font-medium w-[140px] overflow-hidden text-ellipsis">
                        <span className="block truncate">{sub.application}</span>
                      </TableCell>
                      <TableCell className="w-[140px]">
                        <div className="flex flex-wrap gap-1 max-w-full">
                          {sub.plans.map((plan, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs truncate max-w-full"
                            >
                              <span className="truncate block">{plan.planName}</span>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="w-[100px]">
                        <Badge
                          variant="secondary"
                          className={`${statusColors[sub.status]} text-white whitespace-nowrap`}
                        >
                          {statusLabels[sub.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[120px] whitespace-nowrap">
                        {new Date(sub.startDate).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="w-[120px] whitespace-nowrap">
                        {new Date(sub.endDate).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground w-[120px] whitespace-nowrap">
                        {formatPrice(sub.originalPrice, sub.currency)}
                      </TableCell>
                      <TableCell className="text-right w-[130px]">
                        {sub.promotionPrice !== null ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-semibold text-orange-600 whitespace-nowrap">
                              {formatPrice(sub.promotionPrice, sub.currency)}
                            </span>
                            {sub.promotionCode && (
                              <Badge variant="default" className="bg-orange-500 text-xs whitespace-nowrap">
                                <Tag className="mr-1 h-3 w-3 inline" />
                                <span className="truncate">{sub.promotionCode}</span>
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold w-[120px] whitespace-nowrap">
                        {formatPrice(sub.finalPrice, sub.currency)}
                      </TableCell>
                      <TableCell className="text-right w-[100px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(sub)}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0 h-[68px]">
            {!isLoading && totalPages > 1 ? (
              <>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  Page {page + 1} sur {totalPages} • {totalElements} souscription(s)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0 || isLoading}
                    className="h-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1 || isLoading}
                    className="h-9"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {totalElements} souscription(s)
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
