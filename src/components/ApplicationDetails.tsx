import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
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
import { ArrowLeft, Plus, Edit, Trash2, Check, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { applicationService, FeaturePayload, PlanPayload, TrialPolicyPayload, TrialPolicy } from "../services/applicationService";
import { promotionService, PromotionPayload, Promotion } from "../services/promotionService";
import { getUserProfile } from "../services/tokenStorage";

interface Feature {
  id: string;
  name: string;
  description: string;
  key: string;
  type?: string;
  category?: string;
  applicationId?: string;
}

interface PlanFeature {
  featureId: string;
  limit: number | null;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: PlanFeature[];
  currency?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  maxUsers?: number;
  maxStorage?: number;
  priority?: number;
}

interface PlanFeatureAssignmentForm {
  featureId: string;
  quotaLimit: string;
  included: boolean;
}

interface ProgramItem {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  stage?: string;
}

type DetailsTab =
  | "overview"
  | "tickets"
  | "promotions"
  | "participants"
  | "analytics"
  | "history";

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

const resolveConnectedUserId = (): string | null => {
  const profile = getUserProfile<any>();
  if (!profile || typeof profile !== "object") {
    return null;
  }
  const candidates = [
    profile.id,
    profile.userId,
    profile.userID,
    profile.uuid,
    profile.reference,
    profile.accountId,
    profile?.user?.id,
  ];
  const matched = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return matched ? String(matched) : null;
};

const formatPromotionDate = (value: Promotion["startDate"]) => {
  let parsed: Date | null = null;
  if (Array.isArray(value) && value.length >= 3) {
    parsed = new Date(Number(value[0]), Number(value[1]) - 1, Number(value[2]));
  } else if (typeof value === "number") {
    parsed = new Date(value < 1e12 ? value * 1000 : value);
  } else if (typeof value === "string" && value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) parsed = date;
  }
  return parsed ? parsed.toLocaleDateString("fr-FR") : "—";
};

const formatPromotionStatus = (promo: Promotion) => {
  if (promo.status) return promo.status.toUpperCase();
  return promo.active === false ? "INACTIVE" : "ACTIVE";
};

const formatPercentage = (value: number | string | undefined | null) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? `${numeric.toFixed(2)} %` : "—";
};

const formatMoney = (value: number | string | undefined | null, currency = "XAF") => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "—";
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${numeric.toFixed(2)} ${currency}`;
  }
};

export function ApplicationDetails({ application, onBack, onUpdate }: ApplicationDetailsProps) {
  const [localApp, setLocalApp] = useState<Application>(application);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isAddFeatureDialogOpen, setIsAddFeatureDialogOpen] = useState(false);
  const [isEditFeatureDialogOpen, setIsEditFeatureDialogOpen] = useState(false);
  const [isDeleteFeatureDialogOpen, setIsDeleteFeatureDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  
  const [isAddPlanDialogOpen, setIsAddPlanDialogOpen] = useState(false);
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  const [isDeletePlanDialogOpen, setIsDeletePlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [promotionPlan, setPromotionPlan] = useState<Plan | null>(null);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  const [promotionsByPlan, setPromotionsByPlan] = useState<Record<string, Promotion[]>>({});
  const [promotionForm, setPromotionForm] = useState({
    code: "",
    discountPercentage: "",
    startDate: "",
    endDate: "",
    maxUsage: "",
    minPurchaseAmount: "",
  });
  
  const [featureForm, setFeatureForm] = useState({
    name: "",
    description: "",
    key: "",
    type: "payment",
    category: "finance",
  });

  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxUsers: 0,
    priority: 1,
    interval: "month" as "month" | "year",
    features: [] as PlanFeature[],
  });
  const [isSavingFeature, setIsSavingFeature] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isAssignFeatureToPlanOpen, setIsAssignFeatureToPlanOpen] = useState(false);
  const [planToAssignFeature, setPlanToAssignFeature] = useState<Plan | null>(null);
  const [planFeatureAssignment, setPlanFeatureAssignment] = useState<PlanFeatureAssignmentForm>({
    featureId: "",
    quotaLimit: "",
    included: true,
  });
  const [isAssigningPlanFeature, setIsAssigningPlanFeature] = useState(false);
  const [trialPolicy, setTrialPolicy] = useState<TrialPolicy | null>(null);
  const [isLoadingTrialPolicy, setIsLoadingTrialPolicy] = useState(false);
  const [trialPolicyForm, setTrialPolicyForm] = useState({
    enabled: true,
    trialPeriodInDays: 90,
    unlimitedAccess: true,
  });
  const [isSavingTrialPolicy, setIsSavingTrialPolicy] = useState(false);

  useEffect(() => {
    setLocalApp(application);
  }, [application]);

  const loadFeatures = useCallback(
    async (appId: string) => {
      setIsLoadingFeatures(true);
      try {
        const remoteFeatures = await applicationService.getFeaturesByApplication(appId);
        const normalized: Feature[] = remoteFeatures.map((feature: any) => {
          const fallbackName = feature?.name || feature?.key || "Fonctionnalité";
          return {
            id: feature?.id || feature?.featureId || `feature-${Date.now()}-${Math.random()}`,
            name: fallbackName,
            description: feature?.description || "",
            key:
              feature?.key ||
              fallbackName
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^\w-]/g, ""),
            type: feature?.type || feature?.featureType || undefined,
            category: feature?.category || feature?.featureCategory || undefined,
            applicationId: feature?.applicationId,
          };
        });
        setLocalApp((prev) => {
          if (!prev || prev.id !== appId) {
            return { ...application, features: normalized };
          }
          return { ...prev, features: normalized };
        });
        return normalized;
      } catch (error: any) {
        console.error(error);
        toast.error(error?.message || "Impossible de charger les fonctionnalités");
        return null;
      } finally {
        setIsLoadingFeatures(false);
      }
    },
    [application],
  );

  const loadPlans = useCallback(
    async (appId: string) => {
      setIsLoadingPlans(true);
      try {
        const remotePlans = await applicationService.getPlansByApplication(appId);
        const normalized: Plan[] = await Promise.all(
          remotePlans.map(async (plan: any) => {
          const baseMonthly = Number(plan?.monthlyPrice ?? plan?.price ?? 0);
          const annualPrice = Number(plan?.yearlyPrice ?? plan?.annualPrice ?? 0);
          const currencyCode =
            (typeof plan?.currency === "string" && plan.currency) ||
            plan?.currency?.code ||
            undefined;
            let planFeaturesRaw: any[] = [];
            if (plan?.id) {
              try {
                planFeaturesRaw = await applicationService.getPlanFeatures(plan.id);
              } catch (planFeatureError) {
                console.warn("[ApplicationDetails] Unable to load plan features", planFeatureError);
              }
            }
            const fallbackFeatures = Array.isArray(plan?.features) ? plan.features : [];
            const sourceFeatures = planFeaturesRaw.length > 0 ? planFeaturesRaw : fallbackFeatures;
            const planFeatures: PlanFeature[] = sourceFeatures
              .map((pf: any) => ({
                featureId: pf?.featureId || pf?.feature?.id || pf?.id || "",
                limit: pf?.quotaLimit ?? pf?.limit ?? pf?.quota ?? null,
              }))
              .filter((pf: PlanFeature) => Boolean(pf.featureId));

            return {
              id: plan?.id || plan?.planId || `plan-${Date.now()}-${Math.random()}`,
              name: plan?.name || "Plan",
              description: plan?.description || "",
              price: baseMonthly,
              currency: currencyCode,
              interval:
                plan?.interval === "year" || plan?.billingCycle === "year" ? "year" : "month",
              features: planFeatures,
              monthlyPrice: baseMonthly,
              yearlyPrice: annualPrice,
              maxUsers: plan?.maxUsers ?? plan?.userLimit ?? undefined,
              maxStorage: plan?.maxStorage ?? plan?.storageLimit ?? undefined,
              priority: plan?.priority ?? undefined,
            };
          }),
        );
        setLocalApp((prev) => {
          if (!prev || prev.id !== appId) {
            return { ...application, plans: normalized };
          }
          return { ...prev, plans: normalized };
        });
        return normalized;
      } catch (error: any) {
        console.error(error);
        toast.error(error?.message || "Impossible de charger les plans");
        return null;
      } finally {
        setIsLoadingPlans(false);
      }
    },
    [application],
  );

  const loadPromotions = useCallback(async () => {
    setIsLoadingPromotions(true);
    try {
      const list = await promotionService.listPromotions();
      const grouped = list.reduce<Record<string, Promotion[]>>((acc, promo) => {
        if (!promo?.planId) return acc;
        if (!acc[promo.planId]) {
          acc[promo.planId] = [];
        }
        acc[promo.planId].push(promo);
        return acc;
      }, {});
      setPromotionsByPlan(grouped);
    } catch (error: any) {
      console.error("[ApplicationDetails] Error loading promotions", error);
      toast.error(error?.message || "Impossible de récupérer les promotions");
    } finally {
      setIsLoadingPromotions(false);
    }
  }, []);

  const loadTrialPolicy = useCallback(
    async (appId: string) => {
      setIsLoadingTrialPolicy(true);
      try {
        const policy = await applicationService.getTrialPolicyByApplication(appId);
        setTrialPolicy(policy);
        if (policy) {
          setTrialPolicyForm({
            enabled: policy.enabled,
            trialPeriodInDays: policy.trialPeriodInDays,
            unlimitedAccess: policy.unlimitedAccess,
          });
        } else {
          // Reset to defaults if no policy exists
          setTrialPolicyForm({
            enabled: true,
            trialPeriodInDays: 90,
            unlimitedAccess: true,
          });
        }
      } catch (error: any) {
        console.error("[ApplicationDetails] Error loading trial policy", error);
        // Don't show error toast if policy doesn't exist (it's optional)
        if (error?.message && !error.message.includes("404")) {
          toast.error(error.message || "Impossible de charger la politique d'essai");
        }
      } finally {
        setIsLoadingTrialPolicy(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!application.id) return;
    loadFeatures(application.id);
    loadPlans(application.id);
    loadPromotions();
    loadTrialPolicy(application.id);
  }, [application.id, loadFeatures, loadPlans, loadPromotions, loadTrialPolicy]);

  // Feature handlers
  const resetFeatureForm = () => {
    setFeatureForm({ name: "", description: "", key: "", type: "payment", category: "finance" });
  };

  const handleAddFeature = async () => {
    if (!featureForm.name || !featureForm.type || !featureForm.category) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    try {
      setIsSavingFeature(true);
      const payload: FeaturePayload = {
        name: featureForm.name,
        description: featureForm.description,
        type: featureForm.type,
        category: featureForm.category,
        applicationId: localApp.id,
      };
      await applicationService.addFeature(payload);
      const updatedFeatures = await loadFeatures(localApp.id);
      if (updatedFeatures) {
        onUpdate({ ...localApp, features: updatedFeatures });
      }
      setIsAddFeatureDialogOpen(false);
      resetFeatureForm();
      toast.success("Fonctionnalité créée via l'API !");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Impossible de créer la fonctionnalité");
    } finally {
      setIsSavingFeature(false);
    }
  };

  const handleEditFeature = () => {
    if (!selectedFeature) return;
    const updatedApp = {
      ...localApp,
      features: localApp.features.map((f) =>
        f.id === selectedFeature.id
          ? {
              ...f,
              name: featureForm.name,
              description: featureForm.description,
              key: featureForm.key,
              type: featureForm.type,
              category: featureForm.category,
            }
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
      type: feature.type || "payment",
      category: feature.category || "finance",
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
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxUsers: 0,
      priority: 1,
      interval: "month",
      features: [],
    });
  };

  const handleAddPlan = async () => {
    const trimmedName = planForm.name.trim();
    if (!trimmedName) {
      toast.error("Le nom du plan est obligatoire");
      return;
    }
    try {
      setIsSavingPlan(true);
      const payload: PlanPayload = {
        name: trimmedName,
        description: planForm.description,
        monthlyPrice: planForm.monthlyPrice,
        yearlyPrice: planForm.yearlyPrice,
        maxUsers: planForm.maxUsers,
        priority: planForm.priority,
        applicationId: localApp.id,
      };
      const created: any = await applicationService.addPlan(payload);
      const createdPlanId =
        created?.id ||
        created?.data?.id ||
        created?.planId ||
        (Array.isArray(created?.data?.content) && created.data.content[0]?.id) ||
        null;

      if (createdPlanId && planForm.features.length > 0) {
        try {
          await Promise.all(
            planForm.features.map((feature) =>
              applicationService.assignFeatureToPlan({
                planId: createdPlanId,
                featureId: feature.featureId,
                quotaLimit: feature.limit ?? null,
                included: true,
              }),
            ),
          );
        } catch (assignError: any) {
          console.error(assignError);
          toast.warning(
            assignError?.message ||
              "Plan créé, mais l'association automatique des fonctionnalités a échoué.",
          );
        }
      }

      const updatedPlans = await loadPlans(localApp.id);
      if (updatedPlans) {
        onUpdate({ ...localApp, plans: updatedPlans });
      }
      setIsAddPlanDialogOpen(false);
      resetPlanForm();
      toast.success("Plan créé via l'API !");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Impossible de créer le plan");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const resetPromotionForm = () => {
    setPromotionForm({
      code: "",
      discountPercentage: "",
      startDate: "",
      endDate: "",
      maxUsage: "",
      minPurchaseAmount: "",
    });
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
              price: planForm.monthlyPrice,
              interval: planForm.interval,
              features: planForm.features,
              monthlyPrice: planForm.monthlyPrice,
              yearlyPrice: planForm.yearlyPrice,
              maxUsers: planForm.maxUsers,
              priority: planForm.priority,
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
      monthlyPrice: plan.monthlyPrice ?? plan.price,
      yearlyPrice: plan.yearlyPrice ?? 0,
      maxUsers: plan.maxUsers ?? 0,
      priority: plan.priority ?? 1,
      interval: plan.interval,
      features: [...plan.features],
    });
    setIsEditPlanDialogOpen(true);
  };

  const openDeletePlanDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeletePlanDialogOpen(true);
  };

  const openPromotionDialog = (plan: Plan) => {
    const normalizedName = plan.name.replace(/\s+/g, "").toUpperCase().slice(0, 16);
    const defaultCode = `${normalizedName || "PROMO"}${new Date().getFullYear()}`;
    setPromotionPlan(plan);
    setPromotionForm({
      code: defaultCode,
      discountPercentage: "",
      startDate: "",
      endDate: "",
      maxUsage: "",
      minPurchaseAmount: "",
    });
    setIsPromotionDialogOpen(true);
  };

  const handlePromotionFieldChange = (field: keyof typeof promotionForm, value: string) => {
    setPromotionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreatePromotion = async () => {
    if (!promotionPlan) {
      toast.error("Veuillez sélectionner un plan");
      return;
    }
    const connectedUserId = resolveConnectedUserId();
    if (!connectedUserId) {
      toast.error("Impossible d'identifier l'utilisateur connecté. Veuillez vous reconnecter.");
      return;
    }
    const trimmedCode = promotionForm.code.trim();
    if (!trimmedCode) {
      toast.error("Le code promotionnel est obligatoire");
      return;
    }
    const discount = parseFloat(promotionForm.discountPercentage);
    if (!Number.isFinite(discount) || discount <= 0) {
      toast.error("Le pourcentage de réduction doit être supérieur à 0");
      return;
    }
    if (!promotionForm.startDate || !promotionForm.endDate) {
      toast.error("Veuillez définir les dates de début et de fin");
      return;
    }
    if (new Date(promotionForm.startDate) > new Date(promotionForm.endDate)) {
      toast.error("La date de fin doit être postérieure à la date de début");
      return;
    }

    const parsedMaxUsage =
      promotionForm.maxUsage.trim() === ""
        ? 0
        : parseInt(promotionForm.maxUsage, 10);
    const parsedMinAmount =
      promotionForm.minPurchaseAmount.trim() === ""
        ? 0
        : parseFloat(promotionForm.minPurchaseAmount);

    const payload: PromotionPayload = {
      code: trimmedCode,
      discountPercentage: discount,
      startDate: promotionForm.startDate,
      endDate: promotionForm.endDate,
      maxUsage: Number.isFinite(parsedMaxUsage) ? parsedMaxUsage : 0,
      minPurchaseAmount: Number.isFinite(parsedMinAmount) ? parsedMinAmount : 0,
      planId: promotionPlan.id,
      createdBy: connectedUserId,
    };

    try {
      setIsCreatingPromotion(true);
      const { response } = await promotionService.createPromotion(payload);
      toast.success(response?.message || "Promotion créée avec succès");
      await loadPromotions();
      setIsPromotionDialogOpen(false);
      setPromotionPlan(null);
      resetPromotionForm();
    } catch (error: any) {
      console.error("[ApplicationDetails] Promotion creation failed", error);
      toast.error(error?.message || "Impossible de créer la promotion");
    } finally {
      setIsCreatingPromotion(false);
    }
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

  const getDefaultAssignableFeatureId = (plan?: Plan) => {
    const available = localApp.features.find(
      (feature) => !plan?.features.some((pf) => pf.featureId === feature.id),
    );
    return available?.id || localApp.features[0]?.id || "";
  };

  const openAssignPlanFeatureDialog = (plan: Plan) => {
    if (localApp.features.length === 0) {
      toast.error("Aucune fonctionnalité disponible. Créez-en d'abord.");
      return;
    }
    setPlanToAssignFeature(plan);
    setPlanFeatureAssignment({
      featureId: getDefaultAssignableFeatureId(plan),
      quotaLimit: "",
      included: true,
    });
    setIsAssignFeatureToPlanOpen(true);
  };

  const handleAssignFeatureToPlan = async () => {
    if (!planToAssignFeature || !planFeatureAssignment.featureId) {
      toast.error("Sélectionnez une fonctionnalité");
      return;
    }
    try {
      setIsAssigningPlanFeature(true);
      const parsedQuota =
        planFeatureAssignment.quotaLimit.trim() === ""
          ? null
          : Number(planFeatureAssignment.quotaLimit);
      const quotaValue = parsedQuota !== null && !Number.isFinite(parsedQuota) ? null : parsedQuota;
      await applicationService.assignFeatureToPlan({
        planId: planToAssignFeature.id,
        featureId: planFeatureAssignment.featureId,
        quotaLimit: quotaValue,
        included: planFeatureAssignment.included,
      });
      toast.success("Fonctionnalité assignée au plan !");
      await loadPlans(localApp.id);
      setIsAssignFeatureToPlanOpen(false);
      setPlanToAssignFeature(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Impossible d'assigner la fonctionnalité");
    } finally {
      setIsAssigningPlanFeature(false);
    }
  };

  const handleSaveTrialPolicy = async () => {
    if (trialPolicyForm.trialPeriodInDays < 1) {
      toast.error("La période d'essai doit être d'au moins 1 jour");
      return;
    }
    try {
      setIsSavingTrialPolicy(true);
      const payload: TrialPolicyPayload = {
        applicationId: localApp.id,
        enabled: trialPolicyForm.enabled,
        trialPeriodInDays: trialPolicyForm.trialPeriodInDays,
        unlimitedAccess: trialPolicyForm.unlimitedAccess,
      };
      // Passer l'ID de la politique existante si elle existe
      const created = await applicationService.createOrUpdateTrialPolicy(
        payload,
        trialPolicy?.id
      );
      setTrialPolicy(created);
      toast.success(
        trialPolicy
          ? "Politique d'essai mise à jour avec succès"
          : "Politique d'essai créée avec succès"
      );
      await loadTrialPolicy(localApp.id);
    } catch (error: any) {
      console.error("[ApplicationDetails] Error saving trial policy", error);
      toast.error(error?.message || "Impossible de sauvegarder la politique d'essai");
    } finally {
      setIsSavingTrialPolicy(false);
    }
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

          <Card>
            <CardHeader>
              <CardTitle>Période d'essai</CardTitle>
              <CardDescription>
                Configurez la période d'essai pour cette application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingTrialPolicy ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chargement de la politique d'essai...
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1 space-y-0.5">
                      <Label htmlFor="trial-enabled">Activer la période d'essai</Label>
                      <p className="text-sm text-muted-foreground">
                        Active ou désactive la période d'essai pour cette application
                      </p>
                    </div>
                    <Switch
                      id="trial-enabled"
                      checked={trialPolicyForm.enabled}
                      onCheckedChange={(checked) =>
                        setTrialPolicyForm({ ...trialPolicyForm, enabled: checked })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="trial-period">Durée de la période d'essai (jours)</Label>
                    <Input
                      id="trial-period"
                      type="number"
                      min={1}
                      value={trialPolicyForm.trialPeriodInDays}
                      onChange={(e) =>
                        setTrialPolicyForm({
                          ...trialPolicyForm,
                          trialPeriodInDays: parseInt(e.target.value) || 1,
                        })
                      }
                      disabled={!trialPolicyForm.enabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Nombre de jours pendant lesquels l'application sera disponible en période d'essai
                    </p>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1 space-y-0.5">
                      <Label htmlFor="trial-unlimited">Accès illimité</Label>
                      <p className="text-sm text-muted-foreground">
                        Permet un accès illimité pendant la période d'essai
                      </p>
                    </div>
                    <Switch
                      id="trial-unlimited"
                      checked={trialPolicyForm.unlimitedAccess}
                      onCheckedChange={(checked) =>
                        setTrialPolicyForm({ ...trialPolicyForm, unlimitedAccess: checked })
                      }
                      disabled={!trialPolicyForm.enabled}
                    />
                  </div>

                  {trialPolicy && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1">
                      <div className="text-sm font-medium text-gray-900">Informations actuelles</div>
                      <div className="text-xs text-muted-foreground">
                        Créée le: {trialPolicy.createdAt 
                          ? new Date(trialPolicy.createdAt < 1e12 ? trialPolicy.createdAt * 1000 : trialPolicy.createdAt).toLocaleDateString("fr-FR")
                          : "—"}
                        {trialPolicy.updatedAt && trialPolicy.updatedAt !== trialPolicy.createdAt && (
                          <> • Modifiée le: {new Date(trialPolicy.updatedAt < 1e12 ? trialPolicy.updatedAt * 1000 : trialPolicy.updatedAt).toLocaleDateString("fr-FR")}</>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveTrialPolicy}
                    disabled={isSavingTrialPolicy || !trialPolicyForm.enabled}
                    className="w-full bg-[#8b68a6] hover:bg-[#6b4685]"
                  >
                    {isSavingTrialPolicy
                      ? "Enregistrement..."
                      : trialPolicy
                      ? "Mettre à jour la politique d'essai"
                      : "Créer la politique d'essai"}
                  </Button>
                </>
              )}
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
              {isLoadingFeatures ? (
                <div className="text-center py-12 text-gray-500">Chargement des fonctionnalités...</div>
              ) : localApp.features.length === 0 ? (
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
              {isLoadingPlans ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chargement des plans...
                </div>
              ) : localApp.plans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun plan ajouté
                </div>
              ) : (
                <div className="grid gap-4">
                  {localApp.plans.map((plan) => {
                    const planPromotions = promotionsByPlan[plan.id] || [];
                    return (
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
                              title="Créer une promotion"
                              onClick={() => openPromotionDialog(plan)}
                              disabled={!plan.id}
                            >
                              <Tag className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Assigner une fonctionnalité"
                              onClick={() => openAssignPlanFeatureDialog(plan)}
                              disabled={localApp.features.length === 0}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-muted-foreground text-sm">Prix mensuel</div>
                              <div className="text-lg font-semibold">
                                {plan.monthlyPrice ?? plan.price} {plan.currency || "XAF"}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-sm">Prix annuel</div>
                              <div className="text-lg font-semibold">
                                {plan.yearlyPrice ?? 0} {plan.currency || "XAF"}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-sm">Utilisateurs max</div>
                              <div>{plan.maxUsers ?? "—"}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-sm">Stockage max (Mo)</div>
                              <div>{plan.maxStorage ?? "—"}</div>
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
                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                              <Tag className="h-4 w-4" />
                              <span>Promotions liées</span>
                              {isLoadingPromotions && (
                                <span className="text-xs text-muted-foreground">Chargement...</span>
                              )}
                            </div>
                            {planPromotions.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                Aucune promotion pour ce plan
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {planPromotions.map((promo) => (
                                  <div
                                    key={promo.id}
                                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-semibold text-gray-900">{promo.code}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {formatPromotionDate(promo.startDate)} →{" "}
                                          {formatPromotionDate(promo.endDate)}
                                        </div>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {formatPromotionStatus(promo)}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <div className="text-muted-foreground">Réduction</div>
                                        <div className="font-medium text-gray-900">
                                          {formatPercentage(promo.discountPercentage)}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground">Montant min.</div>
                                        <div className="font-medium text-gray-900">
                                          {formatMoney(promo.minPurchaseAmount, plan.currency || "XAF")}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground">Quota</div>
                                        <div className="font-medium text-gray-900">
                                          {promo.currentUsage ?? 0} / {promo.maxUsage ?? 0}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground">Auteur</div>
                                        <div className="font-medium text-gray-900 text-xs break-all">
                                          {promo.createdBy || "—"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                  })}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="feature-type">Type</Label>
                <Input
                  id="feature-type"
                  value={featureForm.type}
                  onChange={(e) => setFeatureForm({ ...featureForm, type: e.target.value })}
                  placeholder="payment"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="feature-category">Catégorie</Label>
                <Input
                  id="feature-category"
                  value={featureForm.category}
                  onChange={(e) => setFeatureForm({ ...featureForm, category: e.target.value })}
                  placeholder="finance"
                />
              </div>
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
              disabled={isSavingFeature || !featureForm.name || !featureForm.type || !featureForm.category}
            >
              {isSavingFeature ? "Envoi..." : "Ajouter"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-feature-type">Type</Label>
                <Input
                  id="edit-feature-type"
                  value={featureForm.type}
                  onChange={(e) => setFeatureForm({ ...featureForm, type: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-feature-category">Catégorie</Label>
                <Input
                  id="edit-feature-category"
                  value={featureForm.category}
                  onChange={(e) => setFeatureForm({ ...featureForm, category: e.target.value })}
                />
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plan-monthly-price">Prix mensuel (€)</Label>
                <Input
                  id="plan-monthly-price"
                  type="number"
                  step="0.01"
                  value={planForm.monthlyPrice}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, monthlyPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan-yearly-price">Prix annuel (€)</Label>
                <Input
                  id="plan-yearly-price"
                  type="number"
                  step="0.01"
                  value={planForm.yearlyPrice}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, yearlyPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plan-max-users">Utilisateurs max</Label>
                <Input
                  id="plan-max-users"
                  type="number"
                  value={planForm.maxUsers}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, maxUsers: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan-priority">Priorité</Label>
                <Input
                  id="plan-priority"
                  type="number"
                  value={planForm.priority}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, priority: parseInt(e.target.value) || 1 })
                  }
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
                              value={planFeature?.limit ?? ""}
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
              disabled={isSavingPlan || !planForm.name}
            >
              {isSavingPlan ? "Envoi..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Créer une promotion */}
      <Dialog
        open={isPromotionDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsPromotionDialogOpen(open);
          if (!open) {
            setPromotionPlan(null);
            resetPromotionForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Créer une promotion</DialogTitle>
            <DialogDescription>
              Associez un code promotionnel au plan "{promotionPlan?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1 text-sm text-muted-foreground">
              <span>ID du plan: <strong>{promotionPlan?.id || "—"}</strong></span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="promotion-code">Code</Label>
              <Input
                id="promotion-code"
                value={promotionForm.code}
                onChange={(e) => handlePromotionFieldChange("code", e.target.value)}
                placeholder="SUMMER2024"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="promotion-discount">Réduction (%)</Label>
                <Input
                  id="promotion-discount"
                  type="number"
                  step="0.01"
                  min={0}
                  value={promotionForm.discountPercentage}
                  onChange={(e) => handlePromotionFieldChange("discountPercentage", e.target.value)}
                  placeholder="25"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promotion-max-usage">Utilisations max</Label>
                <Input
                  id="promotion-max-usage"
                  type="number"
                  min={0}
                  value={promotionForm.maxUsage}
                  onChange={(e) => handlePromotionFieldChange("maxUsage", e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="promotion-start">Date de début</Label>
                <Input
                  id="promotion-start"
                  type="date"
                  value={promotionForm.startDate}
                  onChange={(e) => handlePromotionFieldChange("startDate", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promotion-end">Date de fin</Label>
                <Input
                  id="promotion-end"
                  type="date"
                  value={promotionForm.endDate}
                  onChange={(e) => handlePromotionFieldChange("endDate", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="promotion-min-amount">Montant minimum d'achat</Label>
              <Input
                id="promotion-min-amount"
                type="number"
                step="0.01"
                min={0}
                value={promotionForm.minPurchaseAmount}
                onChange={(e) =>
                  handlePromotionFieldChange("minPurchaseAmount", e.target.value)
                }
                placeholder="50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromotionDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePromotion} disabled={isCreatingPromotion}>
              {isCreatingPromotion ? "Création..." : "Créer la promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog assigner une fonctionnalité à un plan */}
      <Dialog
        open={isAssignFeatureToPlanOpen}
        onOpenChange={(open: boolean) => {
          setIsAssignFeatureToPlanOpen(open);
          if (!open) {
            setPlanToAssignFeature(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assigner une fonctionnalité</DialogTitle>
            <DialogDescription>
              Ajoutez une fonctionnalité existante au plan "{planToAssignFeature?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Fonctionnalité</Label>
              <Select
                value={planFeatureAssignment.featureId}
                onValueChange={(value: string) =>
                  setPlanFeatureAssignment((prev) => ({ ...prev, featureId: value }))
                }
                disabled={localApp.features.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une fonctionnalité" />
                </SelectTrigger>
                <SelectContent>
                  {localApp.features.map((feature) => (
                    <SelectItem key={feature.id} value={feature.id}>
                      {feature.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan-feature-quota">Quota (optionnel)</Label>
              <Input
                id="plan-feature-quota"
                type="number"
                min={0}
                placeholder="Illimité"
                value={planFeatureAssignment.quotaLimit}
                onChange={(e) =>
                  setPlanFeatureAssignment((prev) => ({
                    ...prev,
                    quotaLimit: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="plan-feature-included"
                checked={planFeatureAssignment.included}
                onCheckedChange={(checked: boolean) =>
                  setPlanFeatureAssignment((prev) => ({ ...prev, included: checked }))
                }
              />
              <Label htmlFor="plan-feature-included" className="text-sm">
                Inclure dans le plan (actif par défaut)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignFeatureToPlanOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssignFeatureToPlan} disabled={isAssigningPlanFeature}>
              {isAssigningPlanFeature ? "Association..." : "Assigner"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-plan-monthly-price">Prix mensuel (€)</Label>
                <Input
                  id="edit-plan-monthly-price"
                  type="number"
                  step="0.01"
                  value={planForm.monthlyPrice}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, monthlyPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-plan-yearly-price">Prix annuel (€)</Label>
                <Input
                  id="edit-plan-yearly-price"
                  type="number"
                  step="0.01"
                  value={planForm.yearlyPrice}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, yearlyPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-plan-max-users">Utilisateurs max</Label>
                <Input
                  id="edit-plan-max-users"
                  type="number"
                  value={planForm.maxUsers}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, maxUsers: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-plan-priority">Priorité</Label>
                <Input
                  id="edit-plan-priority"
                  type="number"
                  value={planForm.priority}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, priority: parseInt(e.target.value) || 1 })
                  }
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
                              value={planFeature?.limit ?? ""}
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