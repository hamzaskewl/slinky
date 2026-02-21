import { useEffect, useState } from "react";
import { canton, ClaimLink, ClaimReceipt, ClaimNotification, RevokedLink, ContractResult } from "../lib/canton";
import { useAuth } from "../contexts/AuthContext";
import { Database, RefreshCw, Shield, Eye } from "lucide-react";
import React from "react";

type LedgerContract = {
  contractId: string;
  templateName: string;
  payload: any;
};

export default function BlockchainView() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<LedgerContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadContracts();
  }, [user]);

  const loadContracts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [links, receipts, notifications, revoked] = await Promise.all([
        canton.getClaimLinks(user.token).catch(() => []),
        canton.getClaimReceipts(user.token).catch(() => []),
        canton.getClaimNotifications(user.token).catch(() => []),
        canton.getRevokedLinks(user.token).catch(() => []),
      ]);

      const all: LedgerContract[] = [
        ...links.map((c: ContractResult<ClaimLink>) => ({ contractId: c.contractId, templateName: "ClaimLink", payload: c.payload })),
        ...receipts.map((c: ContractResult<ClaimReceipt>) => ({ contractId: c.contractId, templateName: "ClaimReceipt", payload: c.payload })),
        ...notifications.map((c: ContractResult<ClaimNotification>) => ({ contractId: c.contractId, templateName: "ClaimNotification", payload: c.payload })),
        ...revoked.map((c: ContractResult<RevokedLink>) => ({ contractId: c.contractId, templateName: "RevokedLink", payload: c.payload })),
      ];

      setContracts(all);
    } catch (error) {
      console.error("Error loading contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateColor = (name: string) => {
    switch (name) {
      case "ClaimLink": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      case "ClaimReceipt": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "ClaimNotification": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "RevokedLink": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const truncateId = (id: string) => {
    if (id.length <= 16) return id;
    return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
  };

  const formatFieldValue = (key: string, value: string) => {
    // Truncate party identifiers
    if (typeof value === "string" && value.includes("::")) {
      return value.split("::")[0];
    }
    // Format amounts
    if (key === "amount") {
      try { return parseFloat(value).toFixed(2); } catch { return value; }
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-violet-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Ledger Explorer</h2>
            <p className="text-slate-400">Live Canton contracts visible to your party</p>
          </div>
        </div>
        <button
          onClick={loadContracts}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-200 hover:border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 p-3 bg-violet-500/5 border border-violet-500/20 rounded-lg">
        <Eye className="w-5 h-5 text-violet-400 shrink-0" />
        <p className="text-sm text-violet-300">
          This shows only contracts where you are a signatory or observer. Other parties see different contracts — that's Canton's sub-transaction privacy.
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Shield className="w-4 h-4" />
        Party: <code className="text-violet-400" title={user?.partyId}>{user?.partyHint || user?.partyId?.split("::")[0]}</code>
        <span className="text-slate-600">|</span>
        {contracts.length} contract{contracts.length !== 1 ? "s" : ""} visible
      </div>

      {contracts.length === 0 ? (
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-12 text-center">
          <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No contracts visible</h3>
          <p className="text-slate-400">
            Create a payment link or claim one to see contracts appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.contractId}
              className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTemplateColor(contract.templateName)}`}>
                    {contract.templateName}
                  </span>
                </div>
                <code className="text-xs text-slate-500" title={contract.contractId}>
                  {truncateId(contract.contractId)}
                </code>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {Object.entries(contract.payload).map(([key, value]) => (
                  <div key={key} className="bg-slate-800/30 rounded-lg p-2">
                    <div className="text-xs text-slate-500">{key}</div>
                    <div className="text-sm text-slate-300 truncate" title={String(value)}>
                      {formatFieldValue(key, String(value))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}