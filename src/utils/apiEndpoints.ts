// src/utils/apiEndpoints.ts

// Configuration de la base URL
const getBaseUrl = (): string => {
  // Support pour Vite (import.meta.env) et Node (process.env).
  // Éviter l'utilisation de `typeof import` qui provoque une erreur de parsing.
  let env: any = undefined;

  if (typeof process !== 'undefined' && (process as any).env) {
    env = (process as any).env;
  } else {
    // import.meta est disponible en ESM via Vite; accéder de manière directe
    env = (import.meta as any)?.env;
  }

  const envBase = env?.VITE_API_BASE_URL || env?.REACT_APP_API_BASE_URL;
  const normalizedBase = envBase?.trim().replace(/\/+$/g, "");
  const DEFAULT_BASE = 'https://api-dev.faroty.com';

  return normalizedBase || DEFAULT_BASE;
};

export const BASE_URL = getBaseUrl();

// Types pour une meilleure typage
export interface Endpoints {
  AUTH: AuthEndpoints;
  USERS: UserEndpoints;
  KYC: KYCEndpoints;
  MEDIA: MediaEndpoints;
  GUEST: GuestEndpoints;
  SUBSCRIPTION: SubscriptionEndpoints;
  PAYMENTS: PaymentEndpoints;
  API_KEYS: ApiKeyEndpoints;
}

export interface AuthEndpoints {
  LOGIN: string;
  VERIFY_OTP: string;
  SESSIONS: string;
  DELETE_SESSION: (id: string) => string;
  REFRESH_TOKEN: string;
  LOGOUT: string;
}

export interface UserEndpoints {
  BASE: string;
  PROFILE: string;
  BY_ID: (id: string) => string;
  CONTACTS: {
    ADD: string;
    VERIFY: string;
  };
  CONTACT_UPDATE: {
    INITIATE: string;
    VALIDATE_OTP: string;
    COMPLETE: string;
    STATUS: (reference: string) => string;
    ACTIVE_REQUESTS: string;
    CAN_INITIATE: string;
    RESEND_OTP: string;
    CANCEL: string;
  };
}

export interface KYCEndpoints {
  BASE: string;
  HAS_VERIFICATION: string;
  IS_VERIFIED: string;
  VERIFY: (id: string) => string;
  SUBMIT: string;
  STATUS: (id: string) => string;
}

export interface MediaEndpoints {
  IMPORT: string;
  TYPES: string;
  UPLOAD: string;
  BY_ID: (id: string) => string;
}

export interface GuestEndpoints {
  STORE: string;
}

export interface SubscriptionEndpoints {
  APPLICATIONS: string;
  FEATURES: string;
  FEATURES_BY_APPLICATION: (appId: string) => string;
  PLANS: string;
  PLANS_BY_APPLICATION: (appId: string) => string;
  PLAN_FEATURES: string;
  PLAN_FEATURES_BY_PLAN: (planId: string) => string;
  SUBSCRIPTIONS: string;
  GET_OR_CREATE_SUBSCRIPTION: (contextId: string, contextType: string) => string;
  QUOTA: {
    CONSUME: string;
    CHECK: string;
    USAGE: (contextId: string, contextType: string) => string;
  };
}

export interface PaymentEndpoints {
  ACCOUNTS: string;
  WALLETS: string;
  PAYMENT_METHODS: string;
  COUNTRIES: string;
  EXCHANGE_RATES: string;
  TRANSACTION_FEES: {
    CALCULATE: string;
    CALCULATE_SIMPLE: string;
  };
  PAYMENT_SESSIONS: string;
  PAYMENTS: {
    INITIALIZE: string;
    VALIDATE: (token: string) => string;
    ORANGE: {
      CREATE: string;
      STATUS: (ref: string) => string;
      AUTHENTICATE: string;
    };
    MOMO: {
      CREATE: string;
      VERIFY_ACCOUNT: (msisdn: string) => string;
    };
  };
  WITHDRAWALS: {
    INITIALIZE: string;
    VALIDATE: string;
    STATUS: (id: string) => string;
  };
  TRANSACTIONS: {
    BASE: string;
    BY_ID: (id: string) => string;
    HISTORY: string;
  };
}

export interface ApiKeyEndpoints {
  CLIENTS: string;
  API_KEYS: string;
  VALIDATE: (key: string) => string;
  REGENERATE: (id: string) => string;
}

// Implémentation des endpoints
export const API_ENDPOINTS: Endpoints = {
  // Authentication
  AUTH: {
    LOGIN: `${BASE_URL}/auth/api/auth/login`,
    VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp`,
    SESSIONS: `${BASE_URL}/api/sessions/my-sessions`,
    DELETE_SESSION: (id: string) => `${BASE_URL}/api/sessions/${id}`,
    REFRESH_TOKEN: `${BASE_URL}/api/auth/refresh-token`,
    LOGOUT: `${BASE_URL}/api/auth/logout`,
  },
  
  // Users Management
  USERS: {
    BASE: `${BASE_URL}/api/users`,
    PROFILE: `${BASE_URL}/api/users/profile`,
    BY_ID: (id: string) => `${BASE_URL}/api/users/${id}`,
    CONTACTS: {
      ADD: `${BASE_URL}/api/contacts/add`,
      VERIFY: `${BASE_URL}/api/contacts/verify`,
    },
    CONTACT_UPDATE: {
      INITIATE: `${BASE_URL}/api/contact-update/initiate`,
      VALIDATE_OTP: `${BASE_URL}/api/contact-update/validate-otp`,
      COMPLETE: `${BASE_URL}/api/contact-update/complete`,
      STATUS: (reference: string) => `${BASE_URL}/api/contact-update/status/${reference}`,
      ACTIVE_REQUESTS: `${BASE_URL}/api/contact-update/active-requests`,
      CAN_INITIATE: `${BASE_URL}/api/contact-update/can-initiate`,
      RESEND_OTP: `${BASE_URL}/api/contact-update/resend-otp`,
      CANCEL: `${BASE_URL}/api/contact-update/cancel`,
    },
  },
  
  // KYC Management
  KYC: {
    BASE: `${BASE_URL}/api/kyc`,
    HAS_VERIFICATION: `${BASE_URL}/api/kyc/has-verification`,
    IS_VERIFIED: `${BASE_URL}/api/kyc/is-verified`,
    VERIFY: (id: string) => `${BASE_URL}/api/kyc/${id}/verify`,
    SUBMIT: `${BASE_URL}/api/kyc/submit`,
    STATUS: (id: string) => `${BASE_URL}/api/kyc/${id}/status`,
  },
  
  // Media Management
  MEDIA: {
    IMPORT: `${BASE_URL}/api/media/import`,
    TYPES: `${BASE_URL}/api/media/types`,
    UPLOAD: `${BASE_URL}/api/media/upload`,
    BY_ID: (id: string) => `${BASE_URL}/api/media/${id}`,
  },
  
  // Guest
  GUEST: {
    STORE: `${BASE_URL}/api/guest/store`,
  },
  
  // Subscription Services
  SUBSCRIPTION: {
    APPLICATIONS: `${BASE_URL}/souscription/api/v1/applications`,
    FEATURES: `${BASE_URL}/souscription/api/v1/features`,
    FEATURES_BY_APPLICATION: (appId: string) => `${BASE_URL}/souscription/api/v1/features/application/${appId}`,
    PLANS: `${BASE_URL}/souscription/api/v1/plans`,
    PLANS_BY_APPLICATION: (appId: string) => `${BASE_URL}/souscription/api/v1/plans/application/${appId}`,
    PLAN_FEATURES: `${BASE_URL}/souscription/api/v1/plan-features`,
    PLAN_FEATURES_BY_PLAN: (planId: string) => `${BASE_URL}/souscription/api/v1/plan-features/plan/${planId}`,
    SUBSCRIPTIONS: `${BASE_URL}/souscription/api/v1/subscriptions`,
    GET_OR_CREATE_SUBSCRIPTION: (contextId: string, contextType: string) => 
      `${BASE_URL}/souscription/api/v1/subscriptions/context/${contextId}/${contextType}/get-or-create`,
    QUOTA: {
      CONSUME: `${BASE_URL}/souscription/api/v1/quota/consume`,
      CHECK: `${BASE_URL}/souscription/api/v1/quota/check`,
      USAGE: (contextId: string, contextType: string) => 
        `${BASE_URL}/souscription/api/v1/quota/usage/${contextId}/${contextType}`,
    },
  },
  
  // Payment Services
  PAYMENTS: {
    ACCOUNTS: `${BASE_URL}/payments/api/v1/accounts`,
    WALLETS: `${BASE_URL}/payments/api/v1/wallets`,
    PAYMENT_METHODS: `${BASE_URL}/payments/api/v1/payment-methods`,
    COUNTRIES: `${BASE_URL}/payments/api/v1/countries`,
    EXCHANGE_RATES: `${BASE_URL}/payments/api/v1/exchange-rates`,
    TRANSACTION_FEES: {
      CALCULATE: `${BASE_URL}/payments/api/v1/transaction-fees/calculate`,
      CALCULATE_SIMPLE: `${BASE_URL}/payments/api/v1/transaction-fees/calculate-simple`,
    },
    PAYMENT_SESSIONS: `${BASE_URL}/payments/api/v1/payment-sessions`,
    PAYMENTS: {
      INITIALIZE: `${BASE_URL}/payments/api/v1/payments/initialization/initialize`,
      VALIDATE: (token: string) => `${BASE_URL}/payments/api/v1/payments/initialization/validate/${token}`,
      ORANGE: {
        CREATE: `${BASE_URL}/payments/api/v1/payments/orange/create`,
        STATUS: (ref: string) => `${BASE_URL}/payments/api/v1/payments/orange/status/${ref}`,
        AUTHENTICATE: `${BASE_URL}/payments/api/v1/payments/orange/authenticate`,
      },
      MOMO: {
        CREATE: `${BASE_URL}/payments/api/v1/payments/momo/create`,
        VERIFY_ACCOUNT: (msisdn: string) => `${BASE_URL}/payments/api/v1/payments/momo/verify-account/msisdn/${msisdn}`,
      },
    },
    WITHDRAWALS: {
      INITIALIZE: `${BASE_URL}/payments/api/v1/withdrawals/initialize`,
      VALIDATE: `${BASE_URL}/payments/api/v1/withdrawals/validate`,
      STATUS: (id: string) => `${BASE_URL}/payments/api/v1/withdrawals/${id}/status`,
    },
    TRANSACTIONS: {
      BASE: `${BASE_URL}/payments/api/v1/transactions`,
      BY_ID: (id: string) => `${BASE_URL}/payments/api/v1/transactions/${id}`,
      HISTORY: `${BASE_URL}/payments/api/v1/transactions/history`,
    },
  },
  
  // API Keys Management
  API_KEYS: {
    CLIENTS: `${BASE_URL}/api/v1/clients`,
    API_KEYS: `${BASE_URL}/api/v1/apikeys`,
    VALIDATE: (key: string) => `${BASE_URL}/api/v1/apikeys/validate/${key}`,
    REGENERATE: (id: string) => `${BASE_URL}/api/v1/apikeys/${id}/regenerate`,
  },
};

// Export par défaut pour la compatibilité
export default API_ENDPOINTS;

// Helper pour construire des URLs avec query params
export const buildUrl = (baseUrl: string, params?: Record<string, any>): string => {
  if (!params) return baseUrl;
  
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
};