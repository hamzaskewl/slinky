import { useState, useEffect } from "react";

export type Route = {
  page: string;    // e.g. "/send", "/claim", "/account", "/login", "/"
  claimId?: string; // set when legacy #claim/[id] or #/claim/[id]
};

function parseHash(): Route {
  const raw = window.location.hash.slice(1); // strip leading #

  // Legacy claim link format: #claim/[contractId]
  if (raw.startsWith("claim/")) {
    return { page: "/claim", claimId: raw.slice("claim/".length) };
  }

  // New format: #/send, #/claim, #/account, #/login
  if (raw.startsWith("/")) {
    return { page: raw, claimId: undefined };
  }

  // Empty hash or just "#" → landing
  return { page: "/", claimId: undefined };
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

export function navigate(path: string) {
  window.location.hash = path;
}
