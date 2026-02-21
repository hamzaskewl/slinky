import { useState } from "react";
import { useAuth, Role } from "../contexts/AuthContext";
import { navigate } from "../lib/router";
import { Shield, Send, Download } from "lucide-react";
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
      navigate("/send");
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
      navigate("/send");
    } catch (err: any) {
      setError(err.message || "Failed to connect to Canton. Is `daml start` running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate("/")} className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden mb-4 hover:opacity-80 transition-opacity">
            <img src="/logoshush.png" alt="slinky" className="w-full h-full object-cover scale-150" />
          </button>
          <h1 className="text-3xl font-display font-bold">
            <button onClick={() => navigate("/")} className="text-white hover:opacity-80 transition-opacity">slinky</button>
          </h1>
          <p className="text-slate-400 mt-1">Private payment links on Canton Network</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-4 h-4 text-accent" />
          <span className="text-sm text-accent">Privacy enforced at the protocol level</span>
        </div>

        <div className="bg-surface-raised border border-surface-border rounded-2xl shadow-xl p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("demo")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "demo"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              Quick Demo
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "custom"
                  ? "bg-white/10 text-white border border-white/20"
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
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-surface-border bg-surface-hover/50 hover:bg-surface-hover transition-all text-left disabled:opacity-50"
              >
                <div className="p-2 bg-white/10 rounded-lg">
                  <Send className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium text-white">Alice — Sender</div>
                  <div className="text-sm text-slate-400">{DEMO_PARTIES.sender.desc}</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin("claimer")}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-surface-border bg-surface-hover/50 hover:bg-surface-hover transition-all text-left disabled:opacity-50"
              >
                <div className="p-2 bg-white/10 rounded-lg">
                  <Download className="w-5 h-5 text-accent" />
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
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Party ID</label>
                <input
                  type="text"
                  value={customParty}
                  onChange={(e) => setCustomParty(e.target.value)}
                  required
                  placeholder="e.g., charlie"
                  className="w-full px-4 py-3 bg-surface-hover border border-surface-border text-white rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-3 bg-surface-hover border border-surface-border text-white rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomRole("sender")}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      customRole === "sender"
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-surface-hover border-surface-border text-slate-400 hover:border-surface-light hover:text-slate-300"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    Sender
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomRole("claimer")}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      customRole === "claimer"
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-surface-hover border-surface-border text-slate-400 hover:border-surface-light hover:text-slate-300"
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Claimer
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-surface py-3 rounded-xl font-display font-semibold hover:bg-slate-200 transition-all shadow-lg disabled:opacity-50"
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
