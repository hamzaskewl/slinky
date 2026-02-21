import { useEffect, useState } from "react";
import { canton } from "../lib/canton";
import { useAuth } from "../contexts/AuthContext";
import { UserCircle, Shield, RefreshCw, Link2, Download, Bell, XCircle } from "lucide-react";
import React from "react";

export default function ProfileTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ links: 0, receipts: 0, notifications: 0, revoked: 0 });

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
        links: links.length,
        receipts: receipts.length,
        notifications: notifications.length,
        revoked: revoked.length,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-8 text-center">
        <UserCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Not connected</h3>
        <p className="text-slate-400 mt-1">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const statItems = [
    { label: "Active Links", value: stats.links, icon: Link2, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { label: "Receipts", value: stats.receipts, icon: Download, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Notifications", value: stats.notifications, icon: Bell, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Revoked", value: stats.revoked, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCircle className="w-8 h-8 text-violet-400" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
          <p className="text-slate-400">
            {user.fullName} &bull; <span className="capitalize">{user.role}</span> &bull;{" "}
            <code className="text-violet-400 text-xs" title={user.partyId}>
              {user.partyHint || user.partyId.split("::")[0]}
            </code>
          </p>
        </div>
        <button
          onClick={loadStats}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-200 hover:border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
        <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-emerald-300">
          This page shows only your own contracts. Other parties cannot see your profile data.
        </p>
      </div>

      {/* Party Info */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Canton Party</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <span className="text-sm text-slate-400">Party Hint</span>
            <code className="text-sm text-violet-400">{user.partyHint}</code>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <span className="text-sm text-slate-400">Full Identifier</span>
            <code className="text-xs text-slate-300 max-w-[250px] truncate" title={user.partyId}>
              {user.partyId}
            </code>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <span className="text-sm text-slate-400">Role</span>
            <span className="text-sm text-white capitalize">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Contract Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`bg-slate-900/30 backdrop-blur-xl border ${item.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 ${item.bg} rounded-lg`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{item.value}</div>
              <div className="text-xs text-slate-400 mt-1">{item.label}</div>
            </div>
          );
        })}
      </div>

      {/* What you can see */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">What You Can See</h3>
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
    </div>
  );
}