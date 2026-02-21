import { useState } from "react";
import { useAuth, Role } from "../contexts/AuthContext";
import { Link2, Shield, Send, Download } from "lucide-react";
import React from "react";

const DEMO_PARTIES: Record<Role, { partyId: string; label: string; desc: string }> = {
  sender: {
    partyId: "alice",
    label: "Alice",
    desc: "Creates payment links. Never sees who claims them.",
  },
  claimer: {
    partyId: "bob",
    label: "Bob",
    desc: "Claims payments via link. Never sees who sent them.",
  },
};

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"demo" | "custom">("demo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customParty, setCustomParty] = useState("");
  const [customName, setCustomName] = useState("");
  const [customRole, setCustomRole] = useState<Role>("sender");

  const handleQuickLogin = async (role: Role) => {
    setLoading(true);
    setError("");
    try {
      const party = DEMO_PARTIES[role];
      await signIn(party.partyId, role);
    } catch (err: any) {
      setError(err.message || "Failed to connect to Canton. Is `daml start` running?");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customParty.trim()) return;
    setLoading(true);
    setError("");
    try {
      await signUp(customParty.trim(), customName.trim(), "", customRole);
    } catch (err: any) {
      setError(err.message || "Failed to connect to Canton. Is `daml start` running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mb-4">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">PrivyPay</h1>
          <p className="text-slate-400 mt-1">Private payment links on Canton Network</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">Sub-transaction privacy powered by Daml</span>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("demo")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "demo"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              Quick Demo
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "custom"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              Custom Party
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {mode === "demo" ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-400 mb-4">
                Pick a demo party. Each sees different data on the ledger — that's Canton privacy.
              </p>

              <button
                onClick={() => handleQuickLogin("sender")}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-all text-left disabled:opacity-50"
              >
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Send className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Alice — Sender</div>
                  <div className="text-sm text-slate-400">{DEMO_PARTIES.sender.desc}</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin("claimer")}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-left disabled:opacity-50"
              >
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Download className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Bob — Claimer</div>
                  <div className="text-sm text-slate-400">{DEMO_PARTIES.claimer.desc}</div>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Party ID</label>
                <input
                  type="text"
                  value={customParty}
                  onChange={(e) => setCustomParty(e.target.value)}
                  required
                  placeholder="e.g., charlie"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value as Role)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                >
                  <option value="sender">Sender</option>
                  <option value="claimer">Claimer</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect"}
              </button>
            </form>
          )}

          {loading && (
            <div className="mt-4 text-center text-sm text-slate-400">
              Allocating Canton party...
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          ETHDenver 2026 — Canton Network Privacy Track
        </p>
      </div>
    </div>
  );
}