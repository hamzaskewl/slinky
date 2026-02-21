import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { navigate } from "../lib/router";
import { Link2, Send, Download, Shield, Lock, Eye, ArrowRight, Zap } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  const handlePrimary = () => navigate(user ? "/send" : "/login");
  const handleSecondary = () => navigate(user ? "/claim" : "/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">PrivyPay</span>
        </div>
        {user ? (
          <button
            onClick={() => navigate("/send")}
            className="px-5 py-2 rounded-lg bg-violet-500/10 text-violet-300 text-sm font-medium border border-violet-500/20 hover:bg-violet-500/20 transition-all"
          >
            Open App
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-lg bg-violet-500/10 text-violet-300 text-sm font-medium border border-violet-500/20 hover:bg-violet-500/20 transition-all"
          >
            Sign In
          </button>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-32 relative">
        {/* Background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
            <Shield className="w-3.5 h-3.5" />
            Built on Canton Network
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Private Payments,{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Zero Friction
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Send payment links where the sender and claimer never learn each other's identity.
            Privacy enforced by the ledger, not the UI.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={handlePrimary}
              className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-violet-600 hover:to-purple-600 transition-all shadow-xl shadow-violet-500/25"
            >
              {user ? "Send Payment" : "Get Started"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={handleSecondary}
              className="flex items-center gap-2 px-8 py-3.5 border border-slate-700 text-slate-300 rounded-xl font-semibold text-lg hover:bg-slate-800/50 hover:border-slate-600 transition-all"
            >
              {user ? "Claim Payment" : "Learn More"}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg">Three steps. Full privacy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all group">
            <span className="text-6xl font-extrabold text-slate-800/50 absolute top-4 right-6 group-hover:text-slate-700/50 transition-colors">01</span>
            <div className="inline-flex p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-5">
              <Send className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Create a Link</h3>
            <p className="text-slate-400 leading-relaxed">Set the amount and get a unique claim URL. Your identity is never attached to the link.</p>
          </div>

          <div className="relative bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all group">
            <span className="text-6xl font-extrabold text-slate-800/50 absolute top-4 right-6 group-hover:text-slate-700/50 transition-colors">02</span>
            <div className="inline-flex p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-5">
              <Link2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Share It</h3>
            <p className="text-slate-400 leading-relaxed">Send the link through any channel — text, email, DM. The link carries no sender info.</p>
          </div>

          <div className="relative bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all group">
            <span className="text-6xl font-extrabold text-slate-800/50 absolute top-4 right-6 group-hover:text-slate-700/50 transition-colors">03</span>
            <div className="inline-flex p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 mb-5">
              <Download className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Recipient Claims</h3>
            <p className="text-slate-400 leading-relaxed">They open the link and claim. The sender never learns who claimed it.</p>
          </div>
        </div>
      </section>

      {/* Privacy Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Structural Privacy</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Not filtered in the UI. Enforced by the Daml contract model on Canton Network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 backdrop-blur border border-violet-500/20 rounded-2xl p-8">
            <div className="inline-flex p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-5">
              <Lock className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sender Anonymity</h3>
            <p className="text-slate-400 leading-relaxed">
              Claimers receive payments without ever seeing who created the link. The receipt contains no sender field.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-emerald-500/20 rounded-2xl p-8">
            <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
              <Eye className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Claimer Anonymity</h3>
            <p className="text-slate-400 leading-relaxed">
              Senders get notified a link was claimed, but the notification contains no claimer identity.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-amber-500/20 rounded-2xl p-8">
            <div className="inline-flex p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sub-Transaction Privacy</h3>
            <p className="text-slate-400 leading-relaxed">
              Each party only sees contracts where they are a signatory or observer. Different parties, different views.
            </p>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {["Canton Network", "Daml", "React", "TypeScript"].map((tech) => (
            <span
              key={tech}
              className="px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-600">
          <span>ETHDenver 2026</span>
          <span>Canton Network Privacy Track</span>
        </div>
      </footer>
    </div>
  );
}
