import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { navigate } from "../lib/router";
import {
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
    <div className="min-h-screen bg-surface">
      {/* Top nav */}
      <nav className="bg-surface-raised border-b border-surface-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src="/logoshush.png" alt="slinky" className="w-12 h-12 rounded-full object-cover scale-150" />
              <div className="text-left px-4 py-1.5 rounded-lg border border-white/10 bg-white/5">
                <h1 className="text-xl font-display font-bold text-white">slinky</h1>
              </div>
            </button>

            {/* Desktop tabs */}
            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl text-base font-medium transition-all ${
                      page === item.id
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-surface-hover"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* User area */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/account")}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  page === "/account"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-surface-hover"
                }`}
                title="Account"
              >
                <UserCircle className="w-6 h-6" />
                <div className="hidden sm:block text-left px-3 py-1 rounded-lg border border-white/10 bg-white/5">
                  <div className="text-base font-medium capitalize">{user.role}</div>
                  <div className="text-sm text-slate-500" title={user.partyId}>
                    {displayName}
                  </div>
                </div>
              </button>

              <button
                onClick={signOut}
                className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
                title="Sign out"
              >
                <LogOut className="w-6 h-6" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-xl text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-border p-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-base font-medium transition-all ${
                    page === item.id
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {item.name}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {renderView()}
      </main>
    </div>
  );
}
