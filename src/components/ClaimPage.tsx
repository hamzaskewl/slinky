import { useEffect, useState } from "react";
import { canton, getPartyId, escrowToken, ClaimReceipt, ContractResult } from "../lib/canton";
import { useAuth } from "../contexts/AuthContext";
import { Download, Lock, Check, RefreshCw, AlertCircle, Shield } from "lucide-react";
import React from "react";

type ClaimConfirmation = {
  amount: string;
  currency: string;
  memo: string;
};

export default function ClaimPage({ pendingClaimId }: { pendingClaimId?: string }) {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ContractResult<ClaimReceipt>[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmation, setConfirmation] = useState<ClaimConfirmation | null>(null);

  const [preview, setPreview] = useState<{ contractId: string; amount: string; currency: string; memo: string } | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

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

      setConfirmation({ amount: preview.amount, currency: preview.currency, memo: preview.memo });
      setPreview(null);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-300"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="w-8 h-8 text-accent" />
          <div>
            <h2 className="text-2xl font-bold text-white">Claims</h2>
            <p className="text-sm text-slate-400">Claim payments and view your receipts</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-lg border border-surface-border text-slate-400 hover:text-white hover:border-surface-light transition-all"
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
        <div className="bg-white/5 border border-white/10 text-slate-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Claim Confirmation */}
      {confirmation && (
        <div className="bg-surface-raised border border-surface-border rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 mb-5">
            <Check className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">Payment Claimed</h3>

          <div className="text-4xl font-bold text-white my-4">
            {formatAmount(confirmation.amount)} {confirmation.currency}
          </div>

          {confirmation.memo && (
            <div className="bg-surface-hover rounded-lg p-3 mb-4 inline-block">
              <span className="text-slate-400 text-sm">{confirmation.memo}</span>
            </div>
          )}

          <div className="mt-4 space-y-3 max-w-sm mx-auto">
            <div className="flex items-center gap-3 text-sm text-slate-400 bg-surface-hover rounded-lg p-3">
              <Shield className="w-5 h-5 text-accent shrink-0" />
              <span className="text-left">Sender identity is not recorded on your ledger view. This is enforced by Canton's sub-transaction privacy.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400 bg-surface-hover rounded-lg p-3">
              <Lock className="w-5 h-5 text-accent shrink-0" />
              <span className="text-left">Your identity is not visible to the sender. They only receive a confirmation that the link was claimed.</span>
            </div>
          </div>

          <button
            onClick={() => { setConfirmation(null); window.location.hash = ""; }}
            className="mt-6 px-6 py-3 bg-white text-surface rounded-xl font-semibold hover:bg-slate-200 transition-all shadow-lg shadow-white/10"
          >
            Done
          </button>
        </div>
      )}

      {/* Claim Preview */}
      {preview && !confirmation && (
        <div className="bg-surface-raised border border-surface-border rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
            <Download className="w-8 h-8 text-accent" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-1">Payment Available</h3>

          <div className="text-4xl font-bold text-white my-4">
            {formatAmount(preview.amount)} {preview.currency}
          </div>

          {preview.memo && (
            <div className="bg-surface-hover rounded-lg p-3 mb-4 inline-block">
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
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-surface rounded-xl font-semibold hover:bg-slate-200 transition-all shadow-lg shadow-white/10 disabled:opacity-50"
          >
            {claiming ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-surface"></div>
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
          <Check className="w-5 h-5 text-slate-300" />
          Your Receipts
        </h3>
        {receipts.length === 0 && !success ? (
          <div className="bg-surface-raised border border-surface-border rounded-xl p-8 text-center">
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
                className="bg-surface-raised border border-surface-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <Check className="w-5 h-5 text-slate-300" />
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
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-white/5 text-slate-300 border-surface-border">
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
