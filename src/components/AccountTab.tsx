import { useEffect, useState } from "react";
import { canton, ClaimLink, ClaimReceipt, ClaimNotification, RevokedLink, ContractResult } from "../lib/canton";
import { useAuth } from "../contexts/AuthContext";
import { navigate } from "../lib/router";
import { Shield, RefreshCw, Eye, Lock, Link2, Download, Bell, XCircle, ArrowLeft } from "lucide-react";
import React from "react";

type LedgerContract = {
  contractId: string;
  templateName: string;
  amount: string;
  currency: string;
  memo?: string;
};

export default function AccountTab() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<LedgerContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
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
        ...links.map((c: ContractResult<ClaimLink>) => ({
          contractId: c.contractId, templateName: "ClaimLink",
          amount: c.payload.amount, currency: c.payload.currency, memo: c.payload.memo,
        })),
        ...receipts.map((c: ContractResult<ClaimReceipt>) => ({
          contractId: c.contractId, templateName: "ClaimReceipt",
          amount: c.payload.amount, currency: c.payload.currency, memo: c.payload.memo,
        })),
        ...notifications.map((c: ContractResult<ClaimNotification>) => ({
          contractId: c.contractId, templateName: "ClaimNotification",
          amount: c.payload.amount, currency: c.payload.currency,
        })),
        ...revoked.map((c: ContractResult<RevokedLink>) => ({
          contractId: c.contractId, templateName: "RevokedLink",
          amount: c.payload.amount, currency: c.payload.currency, memo: c.payload.memo,
        })),
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

  const formatAmount = (amount: string) => {
    try { return parseFloat(amount).toFixed(2); } catch { return amount; }
  };

  const truncateId = (id: string) => {
    if (id.length <= 16) return id;
    return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/send")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-8 h-8 text-violet-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Account</h2>
            <p className="text-slate-400">
              <span className="capitalize">{user.role}</span> &middot;{" "}
              <code className="text-violet-400 text-xs" title={user.partyId}>
                {(user.fullName || user.partyHint || user.partyId.split("::")[0])}
              </code>
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-200 hover:border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Party Info — compact */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Party</span>
            <code className="text-sm text-violet-400">{user.partyHint}</code>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Role</span>
            <span className="text-sm text-white capitalize">{user.role}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">ID</span>
            <code className="text-xs text-slate-400 truncate max-w-[200px]" title={user.partyId}>
              {user.partyId}
            </code>
          </div>
        </div>
      </div>

      {/* What You Can See — the key privacy section */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-400" />
          What You Can See
        </h3>
        {user.role === "sender" ? (
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> ClaimLink contracts you created</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> ClaimNotifications when your links are claimed</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> RevokedLink records for links you cancelled</li>
            <li className="flex items-center gap-2"><span className="text-red-400">&#10007;</span> ClaimReceipts — you never see who claimed your link</li>
          </ul>
        ) : (
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> ClaimReceipts for payments you've claimed</li>
            <li className="flex items-center gap-2"><span className="text-red-400">&#10007;</span> ClaimLinks — you never see who created them</li>
            <li className="flex items-center gap-2"><span className="text-red-400">&#10007;</span> ClaimNotifications — only the sender sees these</li>
          </ul>
        )}
      </div>

      {/* Your Contracts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-400" />
            Your Contracts
          </h3>
          <span className="text-sm text-slate-500">
            {contracts.length} visible
          </span>
        </div>

        <div className="flex items-center gap-2 p-3 bg-violet-500/5 border border-violet-500/20 rounded-lg mb-4">
          <Eye className="w-4 h-4 text-violet-400 shrink-0" />
          <p className="text-xs text-violet-300">
            Only contracts where you are a signatory or observer. Other parties see different contracts.
          </p>
        </div>

        {contracts.length === 0 ? (
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-8 text-center">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No contracts yet. Create or claim a payment link to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.contractId}
                className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTemplateColor(contract.templateName)}`}>
                    {contract.templateName}
                  </span>
                  <div>
                    <span className="text-white font-medium">
                      {formatAmount(contract.amount)} {contract.currency}
                    </span>
                    {contract.memo && (
                      <span className="text-slate-500 text-sm ml-2">— {contract.memo}</span>
                    )}
                  </div>
                </div>
                <code className="text-xs text-slate-600" title={contract.contractId}>
                  {truncateId(contract.contractId)}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How Privacy Works — condensed */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">How Canton Privacy Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-400">Sub-transaction privacy</strong> — parties only see contracts where they are signatory or observer</span>
          </div>
          <div className="flex items-start gap-2">
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-400">Sender anonymity</strong> — claimers receive payments without knowing who sent them</span>
          </div>
          <div className="flex items-start gap-2">
            <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-400">Claimer anonymity</strong> — senders know a link was claimed, but never by whom</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-400">Structural privacy</strong> — enforced by the Daml contract model, not filtered in the UI</span>
          </div>
        </div>
      </div>
    </div>
  );
}