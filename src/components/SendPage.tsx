import { useEffect, useState } from "react";
import { canton, getPartyId, ClaimLink, ClaimNotification, RevokedLink, ContractResult } from "../lib/canton";
import { useAuth } from "../contexts/AuthContext";
import { Send, Plus, Copy, Check, Shield, Link2, Bell, XCircle, RefreshCw } from "lucide-react";
import React from "react";

export default function SendPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState<ContractResult<ClaimLink>[]>([]);
  const [notifications, setNotifications] = useState<ContractResult<ClaimNotification>[]>([]);
  const [revoked, setRevoked] = useState<ContractResult<RevokedLink>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");

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

  const handleRevoke = async (contractId: string) => {
    if (!user) return;
    try {
      await canton.revokeLink(contractId, new Date().toISOString(), user.token);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to revoke link");
    }
  };

  const formatAmount = (amount: string) => {
    try {
      return parseFloat(amount).toFixed(2);
    } catch {
      return amount;
    }
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
          <Send className="w-8 h-8 text-violet-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Send</h2>
            <p className="text-slate-400">Create payment links and track their status</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-5 h-5" />
            Create Link
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
        <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-emerald-300">
          You can see your active links and claim notifications — but you will never see who claimed them.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Active Links */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-violet-400" />
          Active Links
        </h3>
        {links.length === 0 ? (
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-8 text-center">
            <Link2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No active links. Create one to get started.</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Claim Notifications */}
      {notifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Claimed
          </h3>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.contractId}
                className="bg-slate-900/30 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {formatAmount(notif.payload.amount)} {notif.payload.currency}
                    </div>
                    <div className="text-sm text-slate-400">
                      Claimed — claimer identity protected
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Claimed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revoked Links */}
      {revoked.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            Revoked
          </h3>
          <div className="space-y-3">
            {revoked.map((r) => (
              <div
                key={r.contractId}
                className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-4 flex items-center justify-between opacity-60"
              >
                <div>
                  <div className="font-medium text-white">
                    {formatAmount(r.payload.amount)} {r.payload.currency}
                  </div>
                  <div className="text-sm text-slate-400">{r.payload.memo || "No memo"}</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                  Revoked
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreateModal && user && (
        <CreateLinkModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

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

function CreateLinkModal({
  user,
  onClose,
  onSuccess,
}: {
  user: { partyId: string; token: string };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
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
    } catch (err: any) {
      setError(err.message || "Failed to create link");
    } finally {
      setLoading(false);
    }
  };

  const [urlCopied, setUrlCopied] = useState(false);
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(createdUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        {createdUrl ? (
          <>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Link Created!</h3>
              <p className="text-sm text-slate-400 mt-1">
                Share this link. Anyone with it can claim the payment.
              </p>
            </div>

            <div className="bg-slate-800 border border-violet-500/30 rounded-xl p-4 mb-4">
              <code className="text-sm text-violet-300 break-all">{createdUrl}</code>
            </div>

            <button
              onClick={handleCopyUrl}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/20 mb-3"
            >
              {urlCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {urlCopied ? "Copied!" : "Copy Link"}
            </button>

            <button
              onClick={onSuccess}
              className="w-full px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white mb-2">Create Payment Link</h3>
            <p className="text-sm text-slate-400 mb-4">
              The recipient will never know who sent this payment.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="50.00"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="CC">Canton Coin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Memo (optional)</label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="lunch money, rent, etc."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Link"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}