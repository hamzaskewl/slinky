import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Link2,
  LogOut,
  TrendingUp,
  Send,
  Download,
  Database,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import Overview from "./Overview";
import SendPage from "./SendPage";
import ClaimPage from "./ClaimPage";
import BlockchainView from "./BlockchainView";
import ProfileTab from "./Profile";
import React from "react";

type View = "overview" | "send" | "claim" | "blockchain" | "profile";

const navigation: { id: View; name: string; icon: any }[] = [
  { id: "overview", name: "Overview", icon: TrendingUp },
  { id: "send", name: "Send", icon: Send },
  { id: "claim", name: "Claim", icon: Download },
  { id: "blockchain", name: "Ledger", icon: Database },
  { id: "profile", name: "Profile", icon: UserCircle },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeView, setActiveView] = useState<View>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingClaimId, setPendingClaimId] = useState<string | undefined>();

  // Check URL hash for incoming claim links
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#claim/")) {
        const contractId = hash.slice("#claim/".length);
        if (contractId) {
          setPendingClaimId(contractId);
          setActiveView("claim");
        }
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <Overview />;
      case "send":
        return <SendPage />;
      case "claim":
        return <ClaimPage pendingClaimId={pendingClaimId} />;
      case "blockchain":
        return <BlockchainView />;
      case "profile":
        return <ProfileTab />;
      default:
        return <Overview />;
    }
  };

  const handleNavClick = (view: View) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    if (view !== "claim") {
      setPendingClaimId(undefined);
    }
  };

  if (!user) return null;

  const displayName = user.partyHint || user.partyId.split("::")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top nav */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">PrivyPay</h1>
                <p className="text-xs text-slate-500">Canton Network</p>
              </div>
            </div>

            {/* Desktop tabs */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeView === item.id
                        ? "bg-violet-500/20 text-violet-300"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* User + sign out */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm text-white capitalize">{user.role}</div>
                <div
                  className="text-xs text-slate-400"
                  title={user.partyId}
                >
                  {displayName}
                </div>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 p-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeView === item.id
                      ? "bg-violet-500/20 text-violet-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}