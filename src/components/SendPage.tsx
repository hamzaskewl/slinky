import { useEffect, useState } from "react";
import { canton, getPartyId, ClaimLink, ClaimNotification, RevokedLink, ContractResult } from "../lib/canton";
import { useAuth } from "../contexts/AuthContext";
import { Send, Plus, Copy, Check, Link2, XCircle, RefreshCw, Clock, Shield, Lock, Eye, ChevronDown, ChevronUp } from "lucide-react";
import React from "react";

export default function SendPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState<ContractResult<ClaimLink>[]>([]);
  const [notifications, setNotifications] = useState<ContractResult<ClaimNotification>[]>([]);
  const [revoked, setRevoked] = useState<ContractResult<RevokedLink>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline create form state
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [memo, setMemo] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [linksRes, notifRes, revokedRes] = await Promise.all([
        canton.getClaimLinks(user.token).catch(() => []),
        canton.getClaimNotifications(user.token).catch(() => []),
        canton.getRevokedLinks(user.token).catch(() => []),
      ]);
      setLinks(linksRes);
      setNotifications(notifRes);
      setRevoked(revokedRes);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || parseFloat(amount) <= 0) return;
    setCreating(true);
    setError("");

    try {
      const escrowId = getPartyId("escrow1");
      const result = await canton.createClaimLink(
        {
          sender: user.partyId,
          escrow: escrowId,
          amount: parseFloat(amount).toFixed(10),
          currency,
          memo,
          createdAt: new Date().toISOString(),
        },
        user.token
      );

      const url = `${window.location.origin}${window.location.pathname}#claim/${result.contractId}`;
      setCreatedUrl(url);
      setAmount("");
      setMemo("");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create link");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (contractId: string) => {
    if (!user) return;
    try {
      await canton.revokeLink(contractId, new Date().toISOString(), user.token);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to revoke link");
    }
  };

  const formatAmount = (a: string) => {
    try { return parseFloat(a).toFixed(2); } catch { return a; }
  };

  const [urlCopied, setUrlCopied] = useState(false);
  const handleCopyCreated = () => {
    navigator.clipboard.writeText(createdUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const historyCount = notifications.length + revoked.length;

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Send className="w-8 h-8 text-violet-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Send</h2>
            <p className="text-sm text-slate-400">Create private payment links</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ── Create Link — hero section ── */}
      {createdUrl ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Check className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Link Created!</h3>
          <p className="text-sm text-slate-400 mb-5">
            Share this link. Anyone with it can claim the payment. They'll never know it came from you.
          </p>

          <div className="bg-slate-800 border border-violet-500/30 rounded-xl p-4 mb-5 max-w-lg mx-auto">
            <code className="text-sm text-violet-300 break-all">{createdUrl}</code>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleCopyCreated}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/20"
            >
              {urlCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {urlCopied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={() => setCreatedUrl("")}
              className="px-6 py-3 border border-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
              <Plus className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Create Payment Link</h3>
              <p className="text-sm text-slate-400">The recipient will never know who sent this payment.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="50.00"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none placeholder:text-slate-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Currency</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "USD", symbol: "$" },
                    { value: "EUR", symbol: "\u20AC" },
                    { value: "USDC", symbol: "\u25CE" },
                    { value: "ETH", symbol: "\u039E" },
                    { value: "GBP", symbol: "\u00A3" },
                    { value: "CC", symbol: "C" },
                  ].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCurrency(c.value)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        currency === c.value
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-500/10"
                          : "bg-slate-800/80 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                      }`}
                    >
                      <span className="opacity-50">{c.symbol}</span>
                      {c.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Memo (optional)</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="lunch money, rent, etc."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={creating || !amount}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Create Payment Link
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── Active Links ── */}
      {links.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-violet-400" />
            Active Links
            <span className="text-sm text-slate-500 font-normal ml-1">({links.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => (
              <LinkCard
                key={link.contractId}
                link={link}
                onRevoke={() => handleRevoke(link.contractId)}
                formatAmount={formatAmount}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── History — Claimed + Revoked ── */}
      {historyCount > 0 && (
        <HistorySection
          notifications={notifications}
          revoked={revoked}
          formatAmount={formatAmount}
        />
      )}

      {/* Empty state */}
      {links.length === 0 && historyCount === 0 && !createdUrl && (
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-8 text-center">
          <Link2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No links yet. Create your first payment link above.</p>
        </div>
      )}
    </div>
  );
}

/* ── History Section (claimed + revoked, expandable) ── */
function HistorySection({
  notifications,
  revoked,
  formatAmount,
}: {
  notifications: ContractResult<ClaimNotification>[];
  revoked: ContractResult<RevokedLink>[];
  formatAmount: (a: string) => string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-slate-400" />
        History
        <span className="text-sm text-slate-500 font-normal ml-1">
          ({notifications.length + revoked.length})
        </span>
      </h3>

      <div className="space-y-3">
        {/* Claimed */}
        {notifications.map((notif) => {
          const isExpanded = expandedId === notif.contractId;
          return (
            <div key={notif.contractId} className="bg-slate-900/30 backdrop-blur-xl border border-emerald-500/20 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(notif.contractId)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">
                      {formatAmount(notif.payload.amount)} {notif.payload.currency}
                    </div>
                    <div className="text-sm text-slate-400">Claimed</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Claimed
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-slate-400">
                      <span className="text-emerald-300 font-medium">Claimer identity protected.</span>{" "}
                      You received a ClaimNotification confirming the payment was claimed, but the Daml contract
                      contains no field identifying the claimer. This is structural — the data was never written, not filtered out.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Lock className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <div className="text-slate-400">
                      The claimer received a ClaimReceipt with no sender field — they don't know it came from you either.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Eye className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-slate-400">
                      Canton's sub-transaction privacy ensures each party only sees contracts where they are a signatory or observer.
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Revoked */}
        {revoked.map((r) => {
          const isExpanded = expandedId === r.contractId;
          return (
            <div key={r.contractId} className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden opacity-70">
              <button
                onClick={() => toggle(r.contractId)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">
                      {formatAmount(r.payload.amount)} {r.payload.currency}
                    </div>
                    <div className="text-sm text-slate-400">{r.payload.memo || "No memo"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                    Revoked
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-slate-400">
                      <span className="text-red-300 font-medium">Link cancelled.</span>{" "}
                      The ClaimLink contract was archived and a RevokedLink record was created.
                      No one can claim this link anymore.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Lock className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <div className="text-slate-400">
                      The revocation is only visible to you and the escrow party. No external observer can see that this link ever existed.
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Link Card (active links) ── */
function LinkCard({
  link,
  onRevoke,
  formatAmount,
}: {
  link: ContractResult<ClaimLink>;
  onRevoke: () => void;
  formatAmount: (a: string) => string;
}) {
  const [copied, setCopied] = useState(false);

  const claimUrl = `${window.location.origin}${window.location.pathname}#claim/${link.contractId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/30 backdrop-blur-xl border border-violet-500/20 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-2xl font-bold text-white">
            {formatAmount(link.payload.amount)} {link.payload.currency}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            {link.payload.memo || "No memo"}
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-violet-500/10 text-violet-400 border-violet-500/20">
          Active
        </span>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
        <div className="text-xs text-slate-500 mb-1">Claim Link</div>
        <div className="flex items-center gap-2">
          <code className="text-xs text-violet-300 flex-1 truncate">{claimUrl}</code>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      <button
        onClick={onRevoke}
        className="w-full px-4 py-2 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
      >
        Revoke Link
      </button>
    </div>
  );
}
