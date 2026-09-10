"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  clearExpiredLocalSession,
  signInWithIdentifier,
  signOutSession,
} from "../services/auth-service";
import { clearAuthenticatedCache } from "../services/authenticated-cache";
import { signInWithGoogleRedirect } from "../services/google-oauth-service";
import type { AuthActionResult } from "../types";

type AuthContextValue = {
  userId: string | null;
  isReady: boolean;
  isConfigured: boolean;
  signIn: (identifier: string, password: string) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  endExpiredSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getBrowserClient(): SupabaseClient | null {
  try {
    return createClient();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [supabase] = useState(getBrowserClient);
  const [authState, setAuthState] = useState({
    userId: null as string | null,
    isReady: !supabase,
  });
  const currentUserId = useRef<string | null>(null);
  const signInRequest = useRef<Promise<AuthActionResult> | null>(null);
  const googleSignInRequest = useRef<Promise<AuthActionResult> | null>(null);
  const signOutRequest = useRef<Promise<AuthActionResult> | null>(null);

  const changeIdentity = useCallback(
    async (nextUserId: string | null) => {
      const previousUserId = currentUserId.current;

      if (previousUserId && previousUserId !== nextUserId) {
        await clearAuthenticatedCache(queryClient);
      }

      currentUserId.current = nextUserId;
      setAuthState({ userId: nextUserId, isReady: true });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isActive = true;
    let receivedAuthEvent = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      receivedAuthEvent = true;
      if (isActive) {
        void changeIdentity(session?.user.id ?? null);
      }
    });

    void supabase.auth.getClaims().then(({ data, error }) => {
      if (!isActive || receivedAuthEvent) {
        return;
      }

      const subject = data?.claims?.sub;
      void changeIdentity(!error && typeof subject === "string" ? subject : null);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [changeIdentity, supabase]);

  const signIn = useCallback(
    async (identifier: string, password: string) => {
      if (!supabase) {
        return { ok: false, code: "configuration" } as const;
      }

      if (signInRequest.current) {
        return signInRequest.current;
      }

      const request = signInWithIdentifier(supabase, identifier, password);
      signInRequest.current = request;

      try {
        const result = await request;
        if (result.ok && result.userId) {
          await changeIdentity(result.userId);
        }
        return result;
      } finally {
        signInRequest.current = null;
      }
    },
    [changeIdentity, supabase],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      return { ok: false, code: "configuration" } as const;
    }

    if (googleSignInRequest.current) {
      return googleSignInRequest.current;
    }

    const request = signInWithGoogleRedirect(supabase, window.location.origin);
    googleSignInRequest.current = request;

    try {
      return await request;
    } finally {
      googleSignInRequest.current = null;
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return { ok: false, code: "configuration" } as const;
    }

    if (signOutRequest.current) {
      return signOutRequest.current;
    }

    const request = signOutSession(supabase);
    signOutRequest.current = request;

    try {
      const result = await request;
      if (result.ok) {
        await clearAuthenticatedCache(queryClient);
        await changeIdentity(null);
      }
      return result;
    } finally {
      signOutRequest.current = null;
    }
  }, [changeIdentity, queryClient, supabase]);

  const endExpiredSession = useCallback(async () => {
    if (supabase) {
      await clearExpiredLocalSession(supabase);
    }
    await clearAuthenticatedCache(queryClient);
    await changeIdentity(null);
  }, [changeIdentity, queryClient, supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      isConfigured: Boolean(supabase),
      signIn,
      signInWithGoogle,
      signOut,
      endExpiredSession,
    }),
    [authState, endExpiredSession, signIn, signInWithGoogle, signOut, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
