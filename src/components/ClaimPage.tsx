import { useEffect, useState } from "react";
import { canton, getPartyId, escrowToken, ClaimReceipt, ContractResult } from "../lib/canton";
import { useAuth } from "../contexts/AuthContext";
import { Download, Lock, Check, RefreshCw, AlertCircle } from "lucide-react";
import React from "react";

export default function ClaimPage({ pendingClaimId }: { pendingClaimId?: string }) {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ContractResult<ClaimReceipt>[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Claim preview state (shown when user arrives via claim link)
  const [preview, setPreview] = useState<{ contractId: string; amount: string; currency: string; memo: string } | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Handle incoming claim link
  useEffect(() => {
    if (pendingClaimId && user) {
      loadClaimPreview(pendingClaimId);
    }
  }, [pendingClaimId, user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const receiptsRes = await canton.getClaimReceipts(user.token).catch(() => []);
      setReceipts(receiptsRes);
    } catch (err: any) {
      setError(err.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  const loadClaimPreview = async (contractId: string) => {
    try {
      // Use escrow token to fetch the ClaimLink (claimer can't see it directly)
      const escrowId = getPartyId("escrow1");
      const eToken = escrowToken(escrowId);
      const link = await canton.fetchClaimLink(contractId, eToken);

      if (link) {
        setPreview({
          contractId,
          amount: link.payload.amount,
          currency: link.payload.currency,
          memo: link.payload.memo,
        });
      } else {
        setError("This link is invalid, already claimed, or has been revoked.");
      }
    } catch {
      setError("Failed to load claim details. The link may be invalid.");
    }
  };

  const handleClaim = async () => {
    if (!user || !preview) return;
    setClaiming(true);
    setError("");
    setSuccess("");

    try {
      const escrowId = getPartyId("escrow1");
      const eToken = escrowToken(escrowId);

      await canton.processClaimLink(
        preview.contractId,
        user.partyId,
        new Date().toISOString(),
        eToken
      );

      setSuccess(`Payment claimed! ${formatAmount(preview.amount)} ${preview.currency}`);
      setPreview(null);
      // Clear the URL hash
      window.location.hash = "";
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to claim. The link may have already been claimed or revoked.");
    } finally {
      setClaiming(false);
    }
  };

  const formatAmount = (amount: string) => {
    try {
      return parseFloat(amount).toFixed(2);
    } catch {
      return amount;
    }
  };

  if (loading && !preview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="w-8 h-8 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Claims</h2>
            <p className="text-sm text-slate-400">Claim payments and view your receipts</p>
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
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Claim Preview — shown when user arrives via claim link */}
      {preview && (
        <div className="bg-slate-900/30 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <Download className="w-8 h-8 text-violet-400" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-1">Payment Available</h3>

          <div className="text-4xl font-bold text-white my-4">
            {formatAmount(preview.amount)} {preview.currency}
          </div>

          {preview.memo && (
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4 inline-block">
              <span className="text-slate-400 text-sm">{preview.memo}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
            <Lock className="w-4 h-4" />
            <span>Sender identity protected</span>
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {claiming ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Claiming...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Claim Payment
              </>
            )}
          </button>
        </div>
      )}

      {/* Receipts */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-400" />
          Your Receipts
        </h3>
        {receipts.length === 0 && !success ? (
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-8 text-center">
            <Download className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              {pendingClaimId ? "Claim the payment above to get your first receipt." : "No receipts yet. Claim a payment link to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.contractId}
                className="bg-slate-900/30 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {formatAmount(receipt.payload.amount)} {receipt.payload.currency}
                      </div>
                      <div className="text-sm text-slate-400">
                        {receipt.payload.memo || "No memo"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Received
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Lock className="w-3 h-3" />
                      Sender hidden
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}