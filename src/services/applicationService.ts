// src/services/applicationService.ts
import { API_ENDPOINTS } from "../utils/apiEndpoints";
import { apiClient } from "../utils/apiClient";

export interface ApplicationPayload {
  name: string;
  description: string;
  version: string;
  type: string;
  platform: string;
  iconUrl: string;
  websiteUrl: string;
  supportEmail: string;
  documentationUrl: string;
  configuration?: Record<string, unknown> | null;
}

export interface Application extends ApplicationPayload {
  id: string;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface FeaturePayload {
  name: string;
  description: string;
  type: string;
  category: string;
  applicationId: string;
}

export interface PlanPayload {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  priority: number;
  applicationId: string;
}

export interface PlanFeatureAssignmentPayload {
  planId: string;
  featureId: string;
  quotaLimit?: number | null;
  included?: boolean;
}

type ApiEnvelope<T> =
  | T
  | {
      data?: T | { content?: T; items?: T; records?: T };
      content?: T;
      result?: T;
      items?: T;
      records?: T;
    };

const unwrap = <T = any>(payload: ApiEnvelope<T>): T => {
  if (!payload) return payload as T;

  if (Array.isArray(payload)) {
    return payload as T;
  }

  if (typeof payload === "object") {
    const obj = payload as Record<string, any>;
    
    // Structure: { success, message, data: { content: [...] } }
    if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
      const nested = obj.data;
      if (Array.isArray(nested.content)) return nested.content as T;
      if (Array.isArray(nested.items)) return nested.items as T;
      if (Array.isArray(nested.records)) return nested.records as T;
      if (Array.isArray(nested.data)) return nested.data as T;
      // Si data.content n'existe pas mais que data est un objet, on retourne data
      return nested as T;
    }
    
    // Structure: { data: [...] }
    if (Array.isArray(obj.data)) return obj.data as T;
    
    // Structure: { content: [...] }
    if (Array.isArray(obj.content)) return obj.content as T;
    
    // Structure: { items: [...] }
    if (Array.isArray(obj.items)) return obj.items as T;
    
    // Structure: { records: [...] }
    if (Array.isArray(obj.records)) return obj.records as T;
    
    // Structure: { result: [...] } ou { result: {...} }
    if (obj.result && typeof obj.result === "object") {
      return obj.result as T;
    }
  }

  return payload as T;
};

const normalizeApplication = (raw: Record<string, any>): Application => {
  const fallbackId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // Gérer createdAt qui peut être un timestamp numérique (en secondes dans la réponse Postman)
  let createdAt: string | null = null;
  if (raw.createdAt !== undefined && raw.createdAt !== null) {
    if (typeof raw.createdAt === "number") {
      // Le timestamp Postman est en secondes avec décimales (ex: 1763461335.915777000)
      // Si < 1e10, c'est en secondes, on multiplie par 1000 pour avoir des millisecondes
      // Si >= 1e10, c'est déjà en millisecondes
      const timestampMs = raw.createdAt < 1e10 ? raw.createdAt * 1000 : raw.createdAt;
      const date = new Date(timestampMs);
      createdAt = isNaN(date.getTime()) ? null : date.toISOString();
    } else {
      createdAt = raw.createdAt;
    }
  } else {
    createdAt = raw.created_at || raw.createdOn || raw.created_on || raw.creationDate || raw.createdDate || null;
  }

  // Gérer updatedAt qui peut être un timestamp numérique (en secondes dans la réponse Postman)
  let updatedAt: string | null = null;
  if (raw.updatedAt !== undefined && raw.updatedAt !== null) {
    if (typeof raw.updatedAt === "number") {
      // Le timestamp Postman est en secondes avec décimales (ex: 1763461335.915777000)
      // Si < 1e10, c'est en secondes, on multiplie par 1000 pour avoir des millisecondes
      // Si >= 1e10, c'est déjà en millisecondes
      const timestampMs = raw.updatedAt < 1e10 ? raw.updatedAt * 1000 : raw.updatedAt;
      const date = new Date(timestampMs);
      updatedAt = isNaN(date.getTime()) ? null : date.toISOString();
    } else {
      updatedAt = raw.updatedAt;
    }
  } else {
    updatedAt = raw.updated_at || raw.updatedOn || raw.updated_on || raw.updatedDate || null;
  }

  return {
    id:
      raw.id ||
      raw.applicationId ||
      raw.uuid ||
      raw.reference ||
      raw.code ||
      fallbackId,
    name: raw.name ?? raw.applicationName ?? "Sans nom",
    description: raw.description ?? "",
    version: raw.version ?? "",
    type: raw.type ?? raw.applicationType ?? "",
    platform: raw.platform ?? raw.platformType ?? "",
    iconUrl: raw.iconUrl ?? raw.iconURL ?? "",
    websiteUrl: raw.websiteUrl ?? raw.siteUrl ?? "",
    supportEmail: raw.supportEmail ?? raw.support_email ?? "",
    documentationUrl: raw.documentationUrl ?? raw.documentationURL ?? "",
    configuration: raw.configuration ?? null,
    // Gérer isActive qui peut être un booléen dans la réponse API
    status: raw.isActive === true ? "active" : (raw.isActive === false ? "inactive" : (raw.status ?? raw.state ?? null)),
    createdAt,
    updatedAt,
  };
};

export const applicationService = {
  // Récupérer toutes les applications
  async getAllApplications(): Promise<Application[]> {
    try {
      const payload = await apiClient.get<ApiEnvelope<any>>(API_ENDPOINTS.SUBSCRIPTION.APPLICATIONS);
      const list = unwrap<any[]>(payload) ?? [];
      return (Array.isArray(list) ? list : [list].filter(Boolean)).map(normalizeApplication);
    } catch (error) {
      console.error("[applicationService] Error fetching applications:", error);
      console.warn("[applicationService] Falling back to bundled application catalog");
      return FALLBACK_APPLICATIONS.map(normalizeApplication);
    }
  },

  // Ajouter une application
  async addApplication(data: ApplicationPayload): Promise<Application> {
    try {
      const payload = await apiClient.post<ApiEnvelope<any>>(API_ENDPOINTS.SUBSCRIPTION.APPLICATIONS, data);
      const raw = unwrap<Record<string, any>>(payload);
      return normalizeApplication(raw);
    } catch (error) {
      console.error("[applicationService] Error adding application:", error, data);
      throw error instanceof Error ? error : new Error("Échec de l'ajout de l'application");
    }
  },

  // Modifier une application
  async updateApplication(id: string, data: ApplicationPayload): Promise<Application> {
    try {
      const payload = await apiClient.put<ApiEnvelope<any>>(`${API_ENDPOINTS.SUBSCRIPTION.APPLICATIONS}/${id}`, data);
      const raw = unwrap<Record<string, any>>(payload);
      return normalizeApplication(raw);
    } catch (error) {
      console.error("[applicationService] Error updating application:", error, { id, data });
      throw error instanceof Error ? error : new Error("Échec de la modification de l'application");
    }
  },

  // Supprimer une application
  async deleteApplication(id: string): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.SUBSCRIPTION.APPLICATIONS}/${id}`);
    } catch (error) {
      console.error("[applicationService] Error deleting application:", error, { id });
      throw error instanceof Error ? error : new Error("Échec de la suppression de l'application");
    }
  },

  async getFeaturesByApplication(applicationId: string) {
    try {
      const payload = await apiClient.get<ApiEnvelope<any>>(
        API_ENDPOINTS.SUBSCRIPTION.FEATURES_BY_APPLICATION(applicationId),
      );
      const list = unwrap<any[]>(payload) ?? [];
      return Array.isArray(list) ? list : [list].filter(Boolean);
    } catch (error) {
      console.error("[applicationService] Error fetching features:", error, { applicationId });
      throw error instanceof Error ? error : new Error("Impossible de récupérer les fonctionnalités");
    }
  },

  async getAllPlans() {
    try {
      const payload = await apiClient.get<ApiEnvelope<any>>(API_ENDPOINTS.SUBSCRIPTION.PLANS);
      const raw = unwrap<any>(payload);
      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray(raw.content)) return raw.content;
      if (raw && Array.isArray(raw.data)) return raw.data;
      return [];
    } catch (error) {
      console.error("[applicationService] Error fetching all plans:", error);
      throw error instanceof Error ? error : new Error("Impossible de récupérer les plans");
    }
  },

  async addFeature(data: FeaturePayload) {
    try {
      return await apiClient.post(API_ENDPOINTS.SUBSCRIPTION.FEATURES, data);
    } catch (error) {
      console.error("[applicationService] Error adding feature:", error, data);
      throw error instanceof Error ? error : new Error("Échec de la création de la fonctionnalité");
    }
  },

  async getPlansByApplication(applicationId: string) {
    try {
      const payload = await apiClient.get<ApiEnvelope<any>>(
        API_ENDPOINTS.SUBSCRIPTION.PLANS_BY_APPLICATION(applicationId),
      );
      const list = unwrap<any[]>(payload) ?? [];
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (error) {
      console.warn("[applicationService] Error fetching plans by application, fallback to global list", {
        applicationId,
        error,
      });
    }

    const globalPlans = await applicationService.getAllPlans();
    return globalPlans.filter((plan: any) => plan?.applicationId === applicationId);
  },

  async getPlanFeatures(planId: string) {
    try {
      const payload = await apiClient.get<ApiEnvelope<any>>(
        API_ENDPOINTS.SUBSCRIPTION.PLAN_FEATURES_BY_PLAN(planId),
      );
      const list = unwrap<any[]>(payload) ?? [];
      return Array.isArray(list) ? list : [list].filter(Boolean);
    } catch (error) {
      console.error("[applicationService] Error fetching plan features:", error, { planId });
      throw error instanceof Error ? error : new Error("Impossible de récupérer les fonctionnalités du plan");
    }
  },

  async addPlan(data: PlanPayload) {
    try {
      return await apiClient.post(API_ENDPOINTS.SUBSCRIPTION.PLANS, data);
    } catch (error) {
      console.error("[applicationService] Error adding plan:", error, data);
      throw error instanceof Error ? error : new Error("Échec de la création du plan");
    }
  },

  async assignFeatureToPlan(data: PlanFeatureAssignmentPayload) {
    try {
      return await apiClient.post(API_ENDPOINTS.SUBSCRIPTION.PLAN_FEATURES, {
        planId: data.planId,
        featureId: data.featureId,
        quotaLimit: data.quotaLimit ?? null,
        included: data.included ?? true,
      });
    } catch (error) {
      console.error("[applicationService] Error assigning feature to plan:", error, data);
      throw error instanceof Error ? error : new Error("Échec de l'association fonctionnalité/plan");
    }
  },
};

const FALLBACK_APPLICATIONS: Record<string, any>[] = [
  {
    id: "f31f2f37-df35-4195-a41f-35fc44a6e6db",
    name: "Analytics Platform",
    description: "Plateforme d'analyse de données",
    version: null,
    type: null,
    platform: null,
    iconUrl: null,
    websiteUrl: null,
    supportEmail: null,
    documentationUrl: null,
    isActive: true,
    configuration: null,
    createdAt: 1763461335.915777,
    updatedAt: 1763461335.915777,
    activeSubscriptionsCount: null,
    totalPlansCount: null,
    totalFeaturesCount: null,
  },
  {
    id: "6bd2b34a-5be4-4c24-a395-ce92fe64836c",
    name: "Notification Service",
    description: "Service de notifications push et email",
    version: null,
    type: null,
    platform: null,
    iconUrl: null,
    websiteUrl: null,
    supportEmail: null,
    documentationUrl: null,
    isActive: true,
    configuration: null,
    createdAt: 1763461335.903919,
    updatedAt: 1763461335.903919,
    activeSubscriptionsCount: null,
    totalPlansCount: null,
    totalFeaturesCount: null,
  },
  {
    id: "60cfae3c-f71d-4420-82b4-dcf13e594d66",
    name: "Payment Gateway",
    description: "Passerelle de paiement sécurisée",
    version: null,
    type: null,
    platform: null,
    iconUrl: null,
    websiteUrl: null,
    supportEmail: null,
    documentationUrl: null,
    isActive: true,
    configuration: null,
    createdAt: 1763461335.912187,
    updatedAt: 1763461335.912187,
    activeSubscriptionsCount: null,
    totalPlansCount: null,
    totalFeaturesCount: null,
  },
];
