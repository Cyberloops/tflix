import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { PlanTier } from '../types';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  code: string | null;
  planTier: PlanTier | null;
  expiresAt: number | null;
  assignedTo?: string;
  error: string | null;
  verifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [code, setCode] = useState<string | null>(storage.getUserCode());
  const [planTier, setPlanTier] = useState<PlanTier | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Validate stored session on app load
  useEffect(() => {
    let isMounted = true;
    async function checkExistingSession() {
      const token = storage.getSessionToken();
      if (!token) {
        if (isMounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
        }
        return;
      }

      try {
        const res = await api.validateSession(token);
        if (isMounted) {
          if (res.valid) {
            setIsAuthenticated(true);
            setPlanTier(res.planTier || 'vip');
            setCode(res.code || storage.getUserCode());
            setExpiresAt(res.expiresAt || null);
            setAssignedTo(res.assignedTo);
          } else {
            // Token expired or invalid
            storage.clearSessionToken();
            setIsAuthenticated(false);
          }
        }
      } catch (e) {
        // Fallback: If network is temporarily offline but user had saved code, grant temporary offline pass
        if (isMounted && storage.getUserCode()) {
          setIsAuthenticated(true);
          setPlanTier('vip');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkExistingSession();
    return () => { isMounted = false; };
  }, []);

  const verifyCode = useCallback(async (entryCode: string) => {
    setError(null);
    const cleaned = (entryCode || '').trim().toUpperCase();
    if (!cleaned) {
      setError('Please enter a valid access code');
      return { success: false, error: 'Please enter a valid access code' };
    }

    try {
      const res = await api.verifyEntryCode(cleaned);
      if (res.success && res.sessionToken) {
        storage.setSessionToken(res.sessionToken);
        storage.setUserCode(res.code || cleaned);
        setIsAuthenticated(true);
        setCode(res.code || cleaned);
        setPlanTier(res.planTier || 'vip');
        setExpiresAt(res.expiresAt || null);
        setAssignedTo(res.assignedTo);
        return { success: true };
      } else {
        const errMsg = res.error || 'Invalid access code';
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (e: any) {
      const errMsg = e.message || 'Verification failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  }, []);

  const logout = useCallback(() => {
    storage.clearSessionToken();
    setIsAuthenticated(false);
    setCode(null);
    setPlanTier(null);
    setExpiresAt(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    code,
    planTier,
    expiresAt,
    assignedTo,
    error,
    verifyCode,
    logout
  };
}
