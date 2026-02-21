// Canton JSON API client — Slinky
// Stealth payment links on Canton Network
// Docs: https://docs.daml.com/json-api/

// In dev, Vite proxies /v1/* to localhost:7575 (avoids CORS)
// In production, set VITE_CANTON_API_URL to the actual Canton JSON API endpoint
const CANTON_API = import.meta.env.VITE_CANTON_API_URL || '';
const PACKAGE_ID = import.meta.env.VITE_DAML_PACKAGE_ID || '';
const MODULE_NAME = 'Slinky';

// -- Types matching our Daml templates --

export type ClaimLink = {
  sender: string;
  escrow: string;
  amount: string; // Daml Decimal serializes as string in JSON API
  currency: string;
  memo: string;
  createdAt: string;
};

export type ClaimReceipt = {
  escrow: string;
  claimer: string;
  amount: string;
  currency: string;
  memo: string;
  claimedAt: string;
};

export type ClaimNotification = {
  sender: string;
  escrow: string;
  amount: string;
  currency: string;
  claimedAt: string;
};

export type RevokedLink = {
  sender: string;
  escrow: string;
  amount: string;
  currency: string;
  memo: string;
  revokedAt: string;
};

export type ContractResult<T> = {
  contractId: string;
  templateId: string;
  payload: T;
};

// -- Base64url encoding for JWTs (no padding, URL-safe chars) --

function base64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// -- Helper to build fully qualified template IDs --

function templateId(templateName: string): string {
  if (PACKAGE_ID) {
    return `${PACKAGE_ID}:${MODULE_NAME}:${templateName}`;
  }
  return `${MODULE_NAME}:${templateName}`;
}

// -- Party management --

const partyRegistry: Record<string, string> = {};

export function getPartyId(hint: string): string {
  return partyRegistry[hint] || hint;
}

function adminToken(): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    "https://daml.com/ledger-api": {
      ledgerId: "sandbox",
      applicationId: "slinky",
      admin: true,
    },
    exp: Math.floor(Date.now() / 1000) + 86400,
    sub: "admin",
  }));
  return `${header}.${payload}.unsigned`;
}

export function escrowToken(escrowPartyId: string): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    "https://daml.com/ledger-api": {
      ledgerId: "sandbox",
      applicationId: "slinky",
      actAs: [escrowPartyId],
      readAs: [escrowPartyId],
    },
    exp: Math.floor(Date.now() / 1000) + 86400,
    sub: escrowPartyId,
  }));
  return `${header}.${payload}.unsigned`;
}

export async function allocateParty(hint: string): Promise<string> {
  if (partyRegistry[hint]) return partyRegistry[hint];

  const listRes = await fetch(`${CANTON_API}/v1/parties`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken()}` },
  });
  const listData = await listRes.json();
  const found = listData.result?.find((p: any) => p.displayName === hint || p.identifier.startsWith(hint + '::'));
  if (found) {
    partyRegistry[hint] = found.identifier;
    return found.identifier;
  }

  const res = await fetch(`${CANTON_API}/v1/parties/allocate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken()}`,
    },
    body: JSON.stringify({ identifierHint: hint, displayName: hint }),
  });

  const data = await res.json();
  if (data.status === 200) {
    partyRegistry[hint] = data.result.identifier;
    return data.result.identifier;
  }

  throw new Error(`Failed to allocate party ${hint}: ${JSON.stringify(data)}`);
}

export async function initializeParties(hints: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  for (const hint of hints) {
    results[hint] = await allocateParty(hint);
  }
  return results;
}

// -- Core Canton JSON API calls --

async function apiCall(endpoint: string, body: any, token: string) {
  const res = await fetch(`${CANTON_API}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Canton API error (${res.status}): ${errText}`);
  }

  return res.json();
}

export async function createContract<T>(
  templateName: string,
  payload: T,
  token: string
): Promise<ContractResult<T>> {
  const result = await apiCall('/v1/create', {
    templateId: templateId(templateName),
    payload,
  }, token);
  return result.result;
}

export async function queryContracts<T>(
  templateName: string,
  token: string,
  filter?: Record<string, any>
): Promise<ContractResult<T>[]> {
  const body: any = {
    templateIds: [templateId(templateName)],
  };
  if (filter) {
    body.query = filter;
  }
  const result = await apiCall('/v1/query', body, token);
  return result.result || [];
}

export async function exerciseChoice(
  templateName: string,
  contractId: string,
  choice: string,
  argument: Record<string, any>,
  token: string
): Promise<any> {
  const result = await apiCall('/v1/exercise', {
    templateId: templateId(templateName),
    contractId,
    choice,
    argument,
  }, token);
  return result.result;
}

export async function fetchContract<T>(
  templateName: string,
  contractId: string,
  token: string
): Promise<ContractResult<T> | null> {
  try {
    const result = await apiCall('/v1/fetch', {
      templateId: templateId(templateName),
      contractId,
    }, token);
    return result.result;
  } catch {
    return null;
  }
}

// -- Convenience functions for Slinky templates --

export const canton = {
  createClaimLink: (data: ClaimLink, token: string) =>
    createContract('ClaimLink', data, token),

  getClaimLinks: (token: string) =>
    queryContracts<ClaimLink>('ClaimLink', token),

  fetchClaimLink: (contractId: string, token: string) =>
    fetchContract<ClaimLink>('ClaimLink', contractId, token),

  processClaimLink: (contractId: string, claimer: string, claimedAt: string, token: string) =>
    exerciseChoice('ClaimLink', contractId, 'ProcessClaim', { claimer, claimedAt }, token),

  revokeLink: (contractId: string, revokedAt: string, token: string) =>
    exerciseChoice('ClaimLink', contractId, 'RevokeLink', { revokedAt }, token),

  getClaimReceipts: (token: string) =>
    queryContracts<ClaimReceipt>('ClaimReceipt', token),

  getClaimNotifications: (token: string) =>
    queryContracts<ClaimNotification>('ClaimNotification', token),

  getRevokedLinks: (token: string) =>
    queryContracts<RevokedLink>('RevokedLink', token),
};