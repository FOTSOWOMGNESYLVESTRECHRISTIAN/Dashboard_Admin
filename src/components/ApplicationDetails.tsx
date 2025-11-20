import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ArrowLeft, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Feature {
  id: string;
  name: string;
  description: string;
  key: string;
}

interface PlanFeature {
  featureId: string;
  limit: number | null; // null = illimité
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: PlanFeature[];
}

export interface Application {
  id: string;
  name: string;
  category: string;
  version: string;
  status: "active" | "inactive" | "maintenance";
  subscriptions: number;
  lastUpdate: string;
  description: string;
  plans: Plan[];
  features: Feature[];
}

interface ApplicationDetailsProps {
  application: Application;
  onBack: () => void;
  onUpdate: (app: Application) => void;
}

const statusColors = {
  active: "bg-green-600",
  inactive: "bg-gray-400",
  maintenance: "bg-amber-500",
};

const statusLabels = {
  active: "Actif",
  inactive: "Inactif",
  maintenance: "Maintenance",
};

export function ApplicationDetails({ application, onBack, onUpdate }: ApplicationDetailsProps) {
  const [localApp, setLocalApp] = useState<Application>(application);
  const [isAddFeatureDialogOpen, setIsAddFeatureDialogOpen] = useState(false);
  const [isEditFeatureDialogOpen, setIsEditFeatureDialogOpen] = useState(false);
  const [isDeleteFeatureDialogOpen, setIsDeleteFeatureDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  
  const [isAddPlanDialogOpen, setIsAddPlanDialogOpen] = useState(false);
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  const [isDeletePlanDialogOpen, setIsDeletePlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const [featureForm, setFeatureForm] = useState({
    name: "",
    description: "",
    key: "",
  });

  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "EUR",
    interval: "month" as "month" | "year",
    features: [] as PlanFeature[],
  });

  // Feature handlers
  const resetFeatureForm = () => {
    setFeatureForm({ name: "", description: "", key: "" });
  };

  const handleAddFeature = () => {
    const newFeature: Feature = {
      id: (localApp.features.length + 1).toString(),
      name: featureForm.name,
      description: featureForm.description,
      key: featureForm.key,
    };
    const updatedApp = {
      ...localApp,
      features: [...localApp.features, newFeature],
    };
    setLocalApp(updatedApp);
    onUpdate(updatedApp);
    setIsAddFeatureDialogOpen(false);
    resetFeatureForm();
    toast.success("Fonctionnalité ajoutée avec succès!");
  };

  const handleEditFeature = () => {
    if (!selectedFeature) return;
    const updatedApp = {
      ...localApp,
      features: localApp.features.map((f) =>
        f.id === selectedFeature.id
          ? { ...f, name: featureForm.name, description: featureForm.description, key: featureForm.key }
          : f
      ),
    };
    setLocalApp(updatedApp);
    onUpdate(updatedApp);
    setIsEditFeatureDialogOpen(false);
    setSelectedFeature(null);
    resetFeatureForm();
    toast.success("Fonctionnalité modifiée avec succès!");
  };

  const handleDeleteFeature = () => {
    if (!selectedFeature) return;
    const updatedApp = {
      ...localApp,
      features: localApp.features.filter((f) => f.id !== selectedFeature.id),
      plans: localApp.plans.map((p) => ({
        ...p,
        features: p.features.filter((pf) => pf.featureId !== selectedFeature.id),
      })),
    };
    setLocalApp(updatedApp);
    onUpdate(updatedApp);
    setIsDeleteFeatureDialogOpen(false);
    setSelectedFeature(null);
    toast.success("Fonctionnalité supprimée avec succès!");
  };

  const openEditFeatureDialog = (feature: Feature) => {
    setSelectedFeature(feature);
    setFeatureForm({
      name: feature.name,
      description: feature.description,
      key: feature.key,
    });
    setIsEditFeatureDialogOpen(true);
  };

  const openDeleteFeatureDialog = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsDeleteFeatureDialogOpen(true);
  };

  // Plan handlers
  const resetPlanForm = () => {
    setPlanForm({
      name: "",
      description: "",
      price: 0,
      currency: "EUR",
      interval: "month",
      features: [],
    });
  };

  const handleAddPlan = () => {
    const newPlan: Plan = {
      id: (localApp.plans.length + 1).toString(),
      name: planForm.name,
      description: planForm.description,
      price: planForm.price,
      currency: planForm.currency,
      interval: planForm.interval,
      features: planForm.features,
    };
    const updatedApp = {
      ...localApp,
      plans: [...localApp.plans, newPlan],
    };
    setLocalApp(updatedApp);
    onUpdate(updatedApp);
    setIsAddPlanDialogOpen(false);
    resetPlanForm();
    toast.success("Plan ajouté avec succès!");
  };

  const handleEditPlan = () => {
    if (!selectedPlan) return;
    const updatedApp = {
      ...localApp,
      plans: localApp.plans.map((p) =>
        p.id === selectedPlan.id
          ? {
              ...p,
              name: planForm.name,
              description: planForm.description,
              price: planForm.price,
              currency: planForm.currency,
              interval: planForm.interval,
              features: planForm.features,
            }
          : p
      ),
    };
    setLocalApp(updatedApp);
    onUpdate(updatedApp);
    setIsEditPlanDialogOpen(false);
    setSelectedPlan(null);
    resetPlanForm();
    toast.success("Plan modifié avec succès!");
  };

  const handleDeletePlan = () => {
    if (!selectedPlan) return;
    const updatedApp = {
      ...localApp,
      plans: localApp.plans.filter((p) => p.id !== selectedPlan.id),
    };
    setLocalApp(updatedApp);
    onUpdate(updatedApp);
    setIsDeletePlanDialogOpen(false);
    setSelectedPlan(null);
    toast.success("Plan supprimé avec succès!");
  };

  const openEditPlanDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: [...plan.features],
    });
    setIsEditPlanDialogOpen(true);
  };

  const openDeletePlanDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeletePlanDialogOpen(true);
  };

  const toggleFeatureInPlan = (featureId: string) => {
    const existingFeature = planForm.features.find((f) => f.featureId === featureId);
    if (existingFeature) {
      setPlanForm({
        ...planForm,
        features: planForm.features.filter((f) => f.featureId !== featureId),
      });
    } else {
      setPlanForm({
        ...planForm,
        features: [...planForm.features, { featureId, limit: null }],
      });
    }
  };

  const updateFeatureLimit = (featureId: string, limit: number | null) => {
    setPlanForm({
      ...planForm,
      features: planForm.features.map((f) =>
        f.featureId === featureId ? { ...f, limit } : f
      ),
    });
  };

  const getFeatureName = (featureId: string) => {
    return localApp.features.find((f) => f.id === featureId)?.name || "Inconnue";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h2>{localApp.name}</h2>
          <p className="text-muted-foreground">Gestion complète de l'application</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom de l'application</Label>
                  <div className="mt-2">{localApp.name}</div>
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <div className="mt-2">{localApp.category}</div>
                </div>
                <div>
                  <Label>Version</Label>
                  <div className="mt-2">{localApp.version}</div>
                </div>
                <div>
                  <Label>Statut</Label>
                  <div className="mt-2">
                    <Badge
                      variant="secondary"
                      className={`${statusColors[localApp.status]} text-white`}
                    >
                      {statusLabels[localApp.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Nombre de subscriptions</Label>
                  <div className="mt-2">{localApp.subscriptions.toLocaleString()}</div>
                </div>
                <div>
                  <Label>Dernière mise à jour</Label>
                  <div className="mt-2">
                    {new Date(localApp.lastUpdate).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="mt-2 text-muted-foreground">
                  {localApp.description || "Aucune description"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card className="border-0 shadow-md overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Fonctionnalités</CardTitle>
                  <CardDescription className="text-gray-600">
                    {localApp.features.length} fonctionnalité(s)
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddFeatureDialogOpen(true)} className="bg-[#1e3a5f] hover:bg-[#152d4a] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une fonctionnalité
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {localApp.features.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Aucune fonctionnalité ajoutée
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50">
                      <TableRow className="hover:bg-gray-50 border-b border-gray-200">
                        <TableHead className="text-gray-700">Nom</TableHead>
                        <TableHead className="text-gray-700">Description</TableHead>
                        <TableHead className="text-gray-700">Clé</TableHead>
                        <TableHead className="text-right text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localApp.features.map((feature) => (
                        <TableRow key={feature.id} className="hover:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-gray-900">{feature.name}</TableCell>
                          <TableCell className="text-gray-600">{feature.description}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {feature.key}
                            </code>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditFeatureDialog(feature)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteFeatureDialog(feature)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plans de tarification</CardTitle>
                  <CardDescription>{localApp.plans.length} plan(s)</CardDescription>
                </div>
                <Button onClick={() => setIsAddPlanDialogOpen(true)} className="bg-[#8b68a6] hover:bg-[#6b4685]">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {localApp.plans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun plan ajouté
                </div>
              ) : (
                <div className="grid gap-4">
                  {localApp.plans.map((plan) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditPlanDialog(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDeletePlanDialog(plan)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="text-muted-foreground">Prix</div>
                            <div>
                              {plan.price} {plan.currency} / {plan.interval === "month" ? "mois" : "an"}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-2">
                              Fonctionnalités incluses
                            </div>
                            {plan.features.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                Aucune fonctionnalité
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {plan.features.map((pf) => (
                                  <li key={pf.featureId} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>{getFeatureName(pf.featureId)}</span>
                                    {pf.limit !== null && (
                                      <Badge variant="secondary">
                                        Limite: {pf.limit}
                                      </Badge>
                                    )}
                                    {pf.limit === null && (
                                      <Badge variant="secondary">Illimité</Badge>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Ajouter une fonctionnalité */}
      <Dialog open={isAddFeatureDialogOpen} onOpenChange={setIsAddFeatureDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Ajouter une fonctionnalité</DialogTitle>
            <DialogDescription>
              Créez une nouvelle fonctionnalité pour cette application
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="feature-name">Nom de la fonctionnalité</Label>
              <Input
                id="feature-name"
                value={featureForm.name}
                onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                placeholder="Ex: Export PDF"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feature-description">Description</Label>
              <Textarea
                id="feature-description"
                value={featureForm.description}
                onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                placeholder="Ex: Permet d'exporter les documents en PDF"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feature-key">Clé technique</Label>
              <Input
                id="feature-key"
                value={featureForm.key}
                onChange={(e) => setFeatureForm({ ...featureForm, key: e.target.value })}
                placeholder="Ex: export_pdf"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFeatureDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddFeature}
              className="bg-[#8b68a6] hover:bg-[#6b4685]"
              disabled={!featureForm.name || !featureForm.key}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier une fonctionnalité */}
      <Dialog open={isEditFeatureDialogOpen} onOpenChange={setIsEditFeatureDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifier la fonctionnalité</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la fonctionnalité
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-feature-name">Nom de la fonctionnalité</Label>
              <Input
                id="edit-feature-name"
                value={featureForm.name}
                onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-feature-description">Description</Label>
              <Textarea
                id="edit-feature-description"
                value={featureForm.description}
                onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-feature-key">Clé technique</Label>
              <Input
                id="edit-feature-key"
                value={featureForm.key}
                onChange={(e) => setFeatureForm({ ...featureForm, key: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFeatureDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEditFeature}
              className="bg-[#8b68a6] hover:bg-[#6b4685]"
              disabled={!featureForm.name || !featureForm.key}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Supprimer fonctionnalité */}
      <AlertDialog open={isDeleteFeatureDialogOpen} onOpenChange={setIsDeleteFeatureDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera la fonctionnalité "{selectedFeature?.name}" et la retirera
              de tous les plans qui l'utilisent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFeature}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Ajouter un plan */}
      <Dialog open={isAddPlanDialogOpen} onOpenChange={setIsAddPlanDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un plan</DialogTitle>
            <DialogDescription>
              Créez un nouveau plan de tarification avec ses fonctionnalités
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plan-name">Nom du plan</Label>
              <Input
                id="plan-name"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                placeholder="Ex: Premium"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan-description">Description</Label>
              <Textarea
                id="plan-description"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                placeholder="Ex: Toutes les fonctionnalités avancées"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plan-price">Prix</Label>
                <Input
                  id="plan-price"
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan-currency">Devise</Label>
                <Input
                  id="plan-currency"
                  value={planForm.currency}
                  onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })}
                  placeholder="EUR"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Période de facturation</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={planForm.interval === "month" ? "default" : "outline"}
                  onClick={() => setPlanForm({ ...planForm, interval: "month" })}
                  className={planForm.interval === "month" ? "bg-[#8b68a6] hover:bg-[#6b4685]" : ""}
                >
                  Mensuel
                </Button>
                <Button
                  type="button"
                  variant={planForm.interval === "year" ? "default" : "outline"}
                  onClick={() => setPlanForm({ ...planForm, interval: "year" })}
                  className={planForm.interval === "year" ? "bg-[#8b68a6] hover:bg-[#6b4685]" : ""}
                >
                  Annuel
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Fonctionnalités incluses</Label>
              {localApp.features.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Aucune fonctionnalité disponible. Créez-en d'abord dans l'onglet
                  Fonctionnalités.
                </div>
              ) : (
                <div className="space-y-2 border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {localApp.features.map((feature) => {
                    const planFeature = planForm.features.find(
                      (pf) => pf.featureId === feature.id
                    );
                    const isSelected = !!planFeature;
                    
                    return (
                      <div key={feature.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatureInPlan(feature.id)}
                            className="h-8"
                          >
                            {isSelected ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <span>{feature.name}</span>
                        </div>
                        {isSelected && (
                          <div className="ml-10 flex items-center gap-2">
                            <Label className="text-xs">Limite:</Label>
                            <Input
                              type="number"
                              placeholder="Illimité"
                              value={planFeature.limit ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateFeatureLimit(
                                  feature.id,
                                  value === "" ? null : parseInt(value)
                                );
                              }}
                              className="h-8 w-32"
                            />
                            <span className="text-xs text-muted-foreground">
                              (vide = illimité)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlanDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddPlan}
              className="bg-[#8b68a6] hover:bg-[#6b4685]"
              disabled={!planForm.name}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier un plan */}
      <Dialog open={isEditPlanDialogOpen} onOpenChange={setIsEditPlanDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le plan</DialogTitle>
            <DialogDescription>
              Modifiez les informations du plan de tarification
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-plan-name">Nom du plan</Label>
              <Input
                id="edit-plan-name"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-plan-description">Description</Label>
              <Textarea
                id="edit-plan-description"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-plan-price">Prix</Label>
                <Input
                  id="edit-plan-price"
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-plan-currency">Devise</Label>
                <Input
                  id="edit-plan-currency"
                  value={planForm.currency}
                  onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Période de facturation</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={planForm.interval === "month" ? "default" : "outline"}
                  onClick={() => setPlanForm({ ...planForm, interval: "month" })}
                  className={planForm.interval === "month" ? "bg-[#8b68a6] hover:bg-[#6b4685]" : ""}
                >
                  Mensuel
                </Button>
                <Button
                  type="button"
                  variant={planForm.interval === "year" ? "default" : "outline"}
                  onClick={() => setPlanForm({ ...planForm, interval: "year" })}
                  className={planForm.interval === "year" ? "bg-[#8b68a6] hover:bg-[#6b4685]" : ""}
                >
                  Annuel
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Fonctionnalités incluses</Label>
              {localApp.features.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Aucune fonctionnalité disponible
                </div>
              ) : (
                <div className="space-y-2 border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {localApp.features.map((feature) => {
                    const planFeature = planForm.features.find(
                      (pf) => pf.featureId === feature.id
                    );
                    const isSelected = !!planFeature;
                    
                    return (
                      <div key={feature.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatureInPlan(feature.id)}
                            className="h-8"
                          >
                            {isSelected ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <span>{feature.name}</span>
                        </div>
                        {isSelected && (
                          <div className="ml-10 flex items-center gap-2">
                            <Label className="text-xs">Limite:</Label>
                            <Input
                              type="number"
                              placeholder="Illimité"
                              value={planFeature.limit ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateFeatureLimit(
                                  feature.id,
                                  value === "" ? null : parseInt(value)
                                );
                              }}
                              className="h-8 w-32"
                            />
                            <span className="text-xs text-muted-foreground">
                              (vide = illimité)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPlanDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEditPlan}
              className="bg-[#8b68a6] hover:bg-[#6b4685]"
              disabled={!planForm.name}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Supprimer plan */}
      <AlertDialog open={isDeletePlanDialogOpen} onOpenChange={setIsDeletePlanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera le plan "{selectedPlan?.name}" de manière définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}