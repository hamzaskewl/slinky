import { useEffect, useState } from "react";
import { canton } from "../lib/canton";
import { useAuth } from "../contexts/AuthContext";
import { Link2, CheckCircle, Database, Shield, Lock, Eye, TrendingUp, Download } from "lucide-react";
import React from "react";

type Stats = {
  activeLinks: number;
  claimedLinks: number;
  claimReceipts: number;
  revokedLinks: number;
  totalContracts: number;
};

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    activeLinks: 0,
    claimedLinks: 0,
    claimReceipts: 0,
    revokedLinks: 0,
    totalContracts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [links, receipts, notifications, revoked] = await Promise.all([
        canton.getClaimLinks(user.token).catch(() => []),
        canton.getClaimReceipts(user.token).catch(() => []),
        canton.getClaimNotifications(user.token).catch(() => []),
        canton.getRevokedLinks(user.token).catch(() => []),
      ]);
      setStats({
        activeLinks: links.length,
        claimedLinks: notifications.length,
        claimReceipts: receipts.length,
        revokedLinks: revoked.length,
        totalContracts: links.length + receipts.length + notifications.length + revoked.length,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Active Links", value: stats.activeLinks, icon: Link2, gradient: "from-violet-500 to-purple-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { title: "Links Claimed", value: stats.claimedLinks, icon: CheckCircle, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { title: "Receipts", value: stats.claimReceipts, icon: Download, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { title: "Total Contracts", value: stats.totalContracts, icon: Database, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-violet-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Overview</h2>
          <p className="text-slate-400">
            These numbers reflect only contracts visible to your party.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-slate-900/30 backdrop-blur-xl border ${card.border} rounded-xl p-5`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${card.bg} rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{card.value}</div>
              <div className="text-sm text-slate-400 mt-1">{card.title}</div>
            </div>
          );
        })}
      </div>

      {/* Privacy Model */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Canton Privacy Model
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
            <Lock className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-white text-sm">Sub-Transaction Privacy</div>
              <div className="text-xs text-slate-400 mt-1">
                Parties only see contracts where they are signatory or observer. No global visibility.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
            <Eye className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-white text-sm">Sender Anonymity</div>
              <div className="text-xs text-slate-400 mt-1">
                Claimers receive payments without ever knowing who sent them.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
            <Eye className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-white text-sm">Claimer Anonymity</div>
              <div className="text-xs text-slate-400 mt-1">
                Senders know their link was claimed, but never by whom.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
            <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-white text-sm">Structural Privacy</div>
              <div className="text-xs text-slate-400 mt-1">
                Privacy is enforced by the Daml contract model — not filtered in the UI.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">About PrivyPay</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          PrivyPay is a privacy-preserving payment link system built on Canton Network.
          Create a payment link, share it with anyone — the recipient claims the payment
          without either party revealing their identity to the other. Built with Daml smart
          contracts that enforce privacy at the protocol level.
        </p>
        <div className="flex gap-4 mt-4">
          <div className="bg-slate-900/50 rounded-lg p-3 flex-1 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalContracts}</div>
            <div className="text-xs text-slate-400">Your Contracts</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 flex-1 text-center">
            <div className="text-2xl font-bold text-white">4</div>
            <div className="text-xs text-slate-400">Daml Templates</div>
          </div>
        </div>
      </div>
    </div>
  );
}