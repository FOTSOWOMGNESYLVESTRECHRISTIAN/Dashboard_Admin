// src/services/authService.ts
import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../utils/apiEndpoints';
import { setTempToken } from './tokenStorage';

export interface LoginRequest {
  contact: string;
  deviceInfo: {
    deviceId: string;
    deviceType: 'MOBILE' | 'WEB' | 'DESKTOP';
    deviceModel: string;
    osName: string;
  };
}

export interface VerifyOtpRequest {
  contact: string;
  otpCode: string;
  tempToken: string;
  deviceInfo: {
    deviceId: string;
    deviceType: 'MOBILE' | 'WEB' | 'DESKTOP';
    deviceName: string; // Note: deviceName au lieu de deviceModel pour verify-otp
    osName: string;
  };
}

export interface LoginResponse {
  tempToken: string;
  message?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
  message?: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const maxAttempts = 2; // 1 initial try + 1 retry
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log('[AuthService] Login (direct POST) request:', credentials, 'attempt', attempt);

        // Use the absolute API endpoint directly (do not convert to relative).
        const fetchUrl = API_ENDPOINTS.AUTH.LOGIN;

          const res = await fetch(fetchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(credentials),
          credentials: 'include',
        });

        // Si la réponse HTTP n'est pas ok, tenter de lire le body JSON ou texte
        if (!res.ok) {
          let serverMessage: string | undefined;
          try {
            const text = await res.text();
            // essayer parse JSON
            try {
              const json = JSON.parse(text);
              serverMessage = json?.message || json?.error || JSON.stringify(json?.data) || text;
            } catch {
              serverMessage = text;
            }
          } catch (e) {
            serverMessage = undefined;
          }

          const error: any = new Error(`HTTP ${res.status} ${res.statusText}${serverMessage ? ' - ' + serverMessage : ''}`);
          error.status = res.status;
          error.serverMessage = serverMessage;
          console.error('[AuthService] Server error body:', serverMessage);
          throw error;
        }

        const payload = await (async () => {
          try { return await res.json(); } catch { return {}; }
        })();

        // Le backend renvoie probablement un wrapper { success, message, data }
        const success = payload?.success ?? true;
        const data = payload?.data ?? payload;

        if (!success) {
          const err: any = new Error(payload?.message || 'Login failed');
          err.status = payload?.data?.status || res.status;
          throw err;
        }

        if (!data?.tempToken) {
          throw new Error('No temporary token received');
        }

        // Try to read TTL/expiry from response and store it with the temp token
        let expiresAtMs: number | undefined;
        const maybe = (obj: any, keys: string[]) => {
          for (const k of keys) {
            const v = obj?.[k];
            if (v !== undefined && v !== null) return v;
          }
          return undefined;
        };

        const ttlCandidates = [
          maybe(payload?.data, ['ttl', 'expiresIn', 'expires_in', 'otpTtlSeconds', 'otp_ttl_seconds']),
          maybe(payload, ['ttl', 'expiresIn', 'expires_in']),
        ];

        const absCandidates = [
          maybe(payload?.data, ['expiresAt', 'expires_at', 'expiry', 'expiresAtMs']),
          maybe(payload, ['expiresAt', 'expires_at', 'expiry', 'expiresAtMs']),
        ];

        const pick = (arr: any[]) => arr.find((v) => v !== undefined && v !== null);
        const ttlValue = pick(ttlCandidates);
        const absValue = pick(absCandidates);

        if (absValue !== undefined) {
          const n = Number(absValue);
          if (!Number.isNaN(n)) {
            expiresAtMs = n > 1e12 ? n : n * 1000;
          }
        } else if (ttlValue !== undefined) {
          const n = Number(ttlValue);
          if (!Number.isNaN(n)) {
            expiresAtMs = Date.now() + Math.floor(n) * 1000;
          }
        }

        // If backend did not provide expiry/ttl, default to 10 minutes (600 seconds)
        if (expiresAtMs === undefined || expiresAtMs === null) {
          expiresAtMs = Date.now() + 10 * 60 * 1000; // 10 minutes
        }

        setTempToken(data.tempToken, expiresAtMs);

        return data as LoginResponse;
      } catch (err: any) {
        lastError = err;

        const isRetryable = (err && ((err.status && err.status >= 500) || (err.message && /Failed to fetch|Network error|Unable to connect/i.test(err.message))));
        if (attempt < maxAttempts && isRetryable) {
          console.warn(`[AuthService] login attempt ${attempt} failed, retrying...`, err);
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }

        // no more retries, break and handle error below
        break;
      }
    }

    // If we reach here we failed after retries — handle fallback for development
    const error: any = lastError || new Error('Unknown login error');
    console.error('[AuthService] Login error after retries:', error);

    // Enable a development bypass so we can continue when backend is failing.
    // This is intentionally permissive for DEV only. To force in non-dev,
    // set VITE_FORCE_AUTH_BYPASS=true in env.
    const devBypass = (import.meta as any).env?.DEV || (import.meta as any).env?.VITE_FORCE_AUTH_BYPASS === 'true';

    // If it's a network or 5xx error and bypass is enabled, synthesize a temp token
    const isServerLike = error && (error.status === 0 || (error.status && error.status >= 500));
    if (devBypass && isServerLike) {
      console.warn('[AuthService] Dev bypass enabled — synthesizing temporary token despite server errors.');
      const syntheticTemp = `dev_temp_${Date.now()}`;
      const expiresAtMs = Date.now() + 10 * 60 * 1000; // 10 minutes default
      setTempToken(syntheticTemp, expiresAtMs);
      return { tempToken: syntheticTemp, message: 'DEV_BYPASS_TEMP_TOKEN' } as LoginResponse;
    }

    // Detect network-level errors (no response)
    if (error.message && /Failed to fetch|Network error|Unable to connect/i.test(error.message)) {
      throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet. Si l\'erreur persiste, le serveur peut renvoyer un en-tête CORS invalide ou être indisponible.');
    }

    // If server returned a message, prefer it
    if (error.serverMessage) {
      // For 5xx errors, include status and server message
      if (error.status && error.status >= 500) {
        throw new Error(`Erreur serveur (${error.status}) : ${error.serverMessage}`);
      }
      throw new Error(error.serverMessage);
    }

    // Map common statuses
    if (error.status === 400) {
      throw new Error(error.message || 'Requête invalide. Vérifiez les informations fournies.');
    }
    if (error.status === 401) {
      throw new Error('Email ou téléphone incorrect.');
    }
    if (error.status === 429) {
      throw new Error('Trop de tentatives. Veuillez réessayer plus tard.');
    }
    if (error.status >= 500) {
      throw new Error(error.message || 'Erreur serveur. Veuillez réessayer plus tard.');
    }

    throw new Error(error.message || 'Erreur lors de la connexion');
  },

  async verifyOtp(credentials: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    try {
      console.log('[AuthService] Verify OTP request:', {
        ...credentials,
        tempToken: credentials.tempToken.substring(0, 20) + '...'
      });

      // Some backends validate OTP using server-side session/cookies and may not require a tempToken
      // If tempToken is missing or empty, omit it from the payload to allow such flows.
      const payload: any = { ...credentials };
      if (!payload.tempToken) delete payload.tempToken;

      const response = await apiClient.post<VerifyOtpResponse>(
        API_ENDPOINTS.AUTH.VERIFY_OTP,
        payload
      );

      if (!response.success) {
        throw new Error(response.error || 'OTP verification failed');
      }

      if (!response.data.accessToken) {
        throw new Error('No access token received');
      }

      // Stocker le token d'accès
      apiClient.setAuthToken(response.data.accessToken);
      
      // Stocker également dans localStorage pour compatibilité
      localStorage.setItem('auth_token', response.data.accessToken);
      localStorage.setItem('refresh_token', response.data.refreshToken);

      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Verify OTP error:', error);

      // Dev bypass: if backend fails (5xx) or network and dev bypass enabled, synthesize access token
      const devBypass = (import.meta as any).env?.DEV || (import.meta as any).env?.VITE_FORCE_AUTH_BYPASS === 'true';
      const isServerLike = error && (error.status === 0 || (error.status && error.status >= 500));
      if (devBypass && isServerLike) {
        console.warn('[AuthService] Dev bypass enabled — synthesizing access token for OTP verification.');
        const syntheticAccess = `dev_access_${Date.now()}`;
        const syntheticRefresh = `dev_refresh_${Date.now()}`;
        const user = { id: 'dev_user', contact: credentials.contact, name: 'DEV USER' };

        apiClient.setAuthToken(syntheticAccess);
        localStorage.setItem('auth_token', syntheticAccess);
        localStorage.setItem('refresh_token', syntheticRefresh);

        return {
          accessToken: syntheticAccess,
          refreshToken: syntheticRefresh,
          user,
          message: 'DEV_BYPASS_ACCESS_GRANTED',
        } as VerifyOtpResponse;
      }

      // Gestion d'erreur spécifique pour OTP
      if (error.status === 400) {
        throw new Error('Code OTP incorrect ou expiré.');
      } else if (error.status === 401) {
        throw new Error('Session expirée. Veuillez recommencer.');
      } else if (error.status === 404) {
        throw new Error('Code OTP non trouvé.');
      } else if (error.status >= 500) {
        throw new Error('Erreur serveur lors de la vérification.');
      }

      throw new Error(error.message || 'Erreur lors de la vérification du code');
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
    } finally {
      // Nettoyer les tokens quoi qu'il arrive
      apiClient.removeAuthToken();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('temp_token');
    }
  },
};