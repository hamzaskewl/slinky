import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { navigate } from "../lib/router";
import {
  Link2,
  LogOut,
  Send,
  Download,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import SendPage from "./SendPage";
import ClaimPage from "./ClaimPage";
import AccountTab from "./AccountTab";
import React from "react";

type NavItem = { id: string; name: string; icon: any };

const navigation: NavItem[] = [
  { id: "/send", name: "Send", icon: Send },
  { id: "/claim", name: "Claims", icon: Download },
];

export default function Dashboard({ page, claimId }: { page: string; claimId?: string }) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    navigate(id);
    setMobileMenuOpen(false);
  };

  const renderView = () => {
    switch (page) {
      case "/send":
        return <SendPage />;
      case "/claim":
        return <ClaimPage pendingClaimId={claimId} />;
      case "/account":
        return <AccountTab />;
      default:
        return <SendPage />;
    }
  };

  if (!user) return null;

  const raw = user.fullName || user.partyHint || user.partyId.split("::")[0];
  const displayName = raw.charAt(0).toUpperCase() + raw.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top nav */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo — clickable to landing */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold text-white">PrivyPay</h1>
                <p className="text-xs text-slate-500">Canton Network</p>
              </div>
            </button>

            {/* Desktop tabs — Send & Claim only */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      page === item.id
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

            {/* User avatar + sign out */}
            <div className="flex items-center gap-2">
              {/* User avatar — clicks to Account */}
              <button
                onClick={() => navigate("/account")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  page === "/account"
                    ? "bg-violet-500/20 text-violet-300"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title="Account"
              >
                <UserCircle className="w-5 h-5" />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium capitalize">{user.role}</div>
                  <div className="text-xs text-slate-500" title={user.partyId}>
                    {displayName}
                  </div>
                </div>
              </button>

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
                    page === item.id
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
