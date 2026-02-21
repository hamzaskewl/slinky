import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { navigate } from "../lib/router";
import { Send, Download, Shield, Lock, Eye, ArrowRight, Zap } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  const handlePrimary = () => navigate(user ? "/send" : "/login");
  const handleSecondary = () => navigate(user ? "/claim" : "/login");

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden relative">
      {/* Floating background emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <span className="absolute top-[8%] left-[5%] text-5xl opacity-[0.04] animate-float-slow">🤫</span>
        <span className="absolute top-[15%] right-[8%] text-6xl opacity-[0.03] animate-float-reverse">🤫</span>
        <span className="absolute top-[35%] left-[12%] text-4xl opacity-[0.04] animate-float-drift">🤫</span>
        <span className="absolute top-[45%] right-[15%] text-5xl opacity-[0.03] animate-float-slow" style={{ animationDelay: "2s" }}>🤫</span>
        <span className="absolute top-[60%] left-[25%] text-3xl opacity-[0.04] animate-float-reverse" style={{ animationDelay: "4s" }}>🤫</span>
        <span className="absolute top-[70%] right-[5%] text-5xl opacity-[0.03] animate-float-drift" style={{ animationDelay: "1s" }}>🤫</span>
        <span className="absolute top-[80%] left-[8%] text-4xl opacity-[0.04] animate-float-slow" style={{ animationDelay: "3s" }}>🤫</span>
        <span className="absolute top-[25%] left-[50%] text-4xl opacity-[0.03] animate-float-reverse" style={{ animationDelay: "5s" }}>🤫</span>
        <span className="absolute top-[55%] left-[70%] text-5xl opacity-[0.04] animate-float-drift" style={{ animationDelay: "2.5s" }}>🤫</span>
        <span className="absolute top-[90%] left-[45%] text-3xl opacity-[0.03] animate-float-slow" style={{ animationDelay: "6s" }}>🤫</span>
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logoshush.png" alt="slinky" className="w-10 h-10 rounded-full object-cover scale-150" />
          <span className="text-2xl font-display font-bold text-white tracking-tight">slinky</span>
        </div>
        {user ? (
          <button
            onClick={() => navigate("/send")}
            className="px-6 py-2.5 rounded-lg bg-white/10 text-white text-base font-medium border border-white/10 hover:bg-white/15 transition-all"
          >
            Open App
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 rounded-lg bg-white/10 text-white text-base font-medium border border-white/10 hover:bg-white/15 transition-all"
          >
            Sign In
          </button>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-36">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-3xl mx-auto animate-fade-in">
          <div className="mb-8 animate-float flex justify-center">
            <div className="w-32 h-32 rounded-full border-2 border-white/10 bg-white/5 p-1">
              <img src="/logoshush.png" alt="slinky" className="w-full h-full rounded-full object-cover scale-150" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-accent text-base font-medium mb-10 mx-auto">
            <Zap className="w-4 h-4" />
            Private Payments on Canton Network
          </div>

          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
            Shhh...{" "}
            <span className="text-accent">
              Private Payments.
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Send payments through claim links. Sender and recipient never see each other — privacy enforced at the protocol level.
          </p>

          <div className="flex items-center justify-center gap-5 flex-wrap">
            <button
              onClick={handlePrimary}
              className="group flex items-center gap-2 px-10 py-4 bg-white text-surface rounded-xl font-display font-semibold text-xl hover:bg-slate-200 transition-all shadow-lg shadow-white/10"
            >
              {user ? "Send Payment" : "Get Started"}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={handleSecondary}
              className="flex items-center gap-2 px-10 py-4 border border-white/20 text-white rounded-xl font-display font-semibold text-xl hover:bg-white/10 hover:border-white/30 transition-all"
            >
              {user ? "Claim Payment" : "Learn More"}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-5">How It Works</h2>
          <p className="text-slate-400 text-xl">Three steps. No addresses. No traces.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative bg-surface-raised border border-surface-border rounded-2xl p-10 hover:border-accent/30 transition-all group">
            <span className="text-7xl font-extrabold text-surface-light/50 absolute top-6 right-8 group-hover:text-accent/15 transition-colors font-display">01</span>
            <div className="inline-flex p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <Send className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-white mb-3">Create</h3>
            <p className="text-slate-400 text-lg leading-relaxed">Enter an amount and generate a unique claim link. No recipient address needed.</p>
          </div>

          <div className="relative bg-surface-raised border border-surface-border rounded-2xl p-10 hover:border-accent/30 transition-all group">
            <span className="text-7xl font-extrabold text-surface-light/50 absolute top-6 right-8 group-hover:text-accent/15 transition-colors font-display">02</span>
            <div className="inline-flex p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <Shield className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-white mb-3">Share</h3>
            <p className="text-slate-400 text-lg leading-relaxed">Send the link through any channel. It carries no information about you.</p>
          </div>

          <div className="relative bg-surface-raised border border-surface-border rounded-2xl p-10 hover:border-accent/30 transition-all group">
            <span className="text-7xl font-extrabold text-surface-light/50 absolute top-6 right-8 group-hover:text-accent/15 transition-colors font-display">03</span>
            <div className="inline-flex p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <Download className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-white mb-3">Claim</h3>
            <p className="text-slate-400 text-lg leading-relaxed">The recipient opens the link and claims the funds. Both sides stay private.</p>
          </div>
        </div>
      </section>

      {/* Privacy Architecture */}
      <section className="relative z-10 mx-auto px-6 pb-28" style={{ maxWidth: "90rem" }}>
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-5">Privacy Architecture</h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Privacy enforced by the Daml contract model on Canton — structural, not cosmetic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-raised border border-surface-border rounded-2xl p-12">
            <div className="inline-flex p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <Lock className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-white mb-3">Sender Privacy</h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              ClaimReceipt contracts contain no sender field. The claimer's ledger view never includes the sender's party ID — this is enforced at the Daml template level, not filtered in the UI. The data simply doesn't exist on the claimer's participant node.
            </p>
          </div>

          <div className="bg-surface-raised border border-surface-border rounded-2xl p-12">
            <div className="inline-flex p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <Eye className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-white mb-3">Claimer Privacy</h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              ClaimNotification contracts omit the claimer's identity. The sender's participant receives confirmation that a link was claimed, but the notification carries no reference to the claiming party. Mutual anonymity is the default.
            </p>
          </div>

          <div className="bg-surface-raised border border-surface-border rounded-2xl p-12">
            <div className="inline-flex p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <Zap className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-white mb-3">Sub-Transaction Privacy</h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Canton's synchronization domains ensure participants only see sub-views of transactions where they are a stakeholder. Contracts they aren't party to are never synchronized — privacy is structural, not layered on top.
            </p>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {["Canton Network", "Daml", "React", "TypeScript"].map((tech) => (
            <span
              key={tech}
              className="px-5 py-2 rounded-full bg-surface-raised border border-surface-border text-slate-400 text-base font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-base text-slate-600">
          <span>ETHDenver 2026</span>
          <span>Canton Network Privacy Track</span>
        </div>
      </footer>
    </div>
  );
}
