import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { allocateParty, initializeParties } from "../lib/canton";

export type Role = "sender" | "claimer";

export type UserProfile = {
  partyId: string;       // Full Canton party identifier (e.g. "alice::12206...")
  partyHint: string;     // Short hint (e.g. "alice")
  token: string;         // JWT token for Canton JSON API
  fullName: string;
  role: Role;
  email: string;
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  signIn: (partyHint: string, role: Role) => Promise<void>;
  signUp: (partyHint: string, fullName: string, email: string, role: Role) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function base64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateLocalToken(partyId: string): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    "https://daml.com/ledger-api": {
      ledgerId: "sandbox",
      applicationId: "privypay",
      actAs: [partyId],
      readAs: [partyId],
    },
    exp: Math.floor(Date.now() / 1000) + 86400,
    sub: partyId,
  }));
  return `${header}.${payload}.unsigned`;
}

// Escrow is the shared service party that manages claims
const SHARED_PARTIES = ['escrow1'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("privypay_user");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed.partyId && !parsed.partyId.includes('::')) {
      localStorage.removeItem("privypay_user");
      return null;
    }
    return parsed;
  });
  const [loading, setLoading] = useState(!!localStorage.getItem("privypay_user"));

  // Re-populate party registry when restoring session from localStorage
  useEffect(() => {
    if (user) {
      const hints = [user.partyHint, ...SHARED_PARTIES.filter(p => p !== user.partyHint)];
      initializeParties(hints)
        .catch((err) => console.error("Failed to re-initialize parties:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (partyHint: string, role: Role) => {
    setLoading(true);
    try {
      const allHints = [partyHint, ...SHARED_PARTIES.filter(p => p !== partyHint)];
      await initializeParties(allHints);

      const fullPartyId = await allocateParty(partyHint);
      const token = generateLocalToken(fullPartyId);

      const profile: UserProfile = {
        partyId: fullPartyId,
        partyHint,
        token,
        fullName: partyHint.charAt(0).toUpperCase() + partyHint.slice(1),
        role,
        email: "",
      };
      localStorage.setItem("privypay_user", JSON.stringify(profile));
      setUser(profile);
    } catch (err) {
      console.error("Failed to allocate party:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (partyHint: string, fullName: string, email: string, role: Role) => {
    setLoading(true);
    try {
      const allHints = [partyHint, ...SHARED_PARTIES.filter(p => p !== partyHint)];
      await initializeParties(allHints);

      const fullPartyId = await allocateParty(partyHint);
      const token = generateLocalToken(fullPartyId);

      const profile: UserProfile = {
        partyId: fullPartyId,
        partyHint,
        token,
        fullName: fullName || partyHint,
        role,
        email,
      };
      localStorage.setItem("privypay_user", JSON.stringify(profile));
      setUser(profile);
    } catch (err) {
      console.error("Failed to allocate party:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("privypay_user");
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }), [user, loading, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}