"use client";
import { useState } from "react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 299,
    period: "mo",
    color: "#0F6E56",
    queries: 50,
    features: [
      "50 advisor queries/month",
      "Fleet Excel upload & analysis",
      "TCO calculator access",
      "Email support",
      "1 user login",
    ],
    cta: "Start Starter",
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 699,
    period: "mo",
    color: "#0F6E56",
    queries: 300,
    features: [
      "300 advisor queries/month",
      "Fleet Excel upload & analysis",
      "TCO + roadmap generator",
      "Priority email support",
      "5 user logins",
      "PDF report export",
      "Incentives database access",
    ],
    cta: "Start Professional",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 1999,
    period: "mo",
    color: "#0F6E56",
    queries: "Unlimited",
    features: [
      "Unlimited queries",
      "Full fleet analysis suite",
      "Custom AI system prompt",
      "Dedicated account manager",
      "Unlimited user logins",
      "White-label option",
      "API access",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(null);
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(null);
  const [error, setError] = useState("");

  const handleSelect = (planId) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:waheed@fleetaxis.com?subject=Enterprise Plan Enquiry";
      return;
    }
    setShowEmail(planId);
  };

  const handleCheckout = async (planId) => {
    if (!email || !email.includes("@")) { setError("Please enter a valid email."); return; }
    setError("");
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email, username: email.split("@")[0] }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Something went wrong.");
    } catch (err) {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf8; }
        input:focus { outline: none; border-color: #1D9E75 !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fafaf8", fontFamily: "'DM Sans',sans-serif" }}>

        {/* Nav */}
        <div style={{ borderBottom: "1px solid #e8e8e4", padding: "14px 24px", background: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#1D9E75,#0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>FA</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18" }}>FleetAxis Advisory</span>
          <a href="/" style={{ marginLeft: "auto", fontSize: 13, color: "#0F6E56", textDecoration: "none", fontWeight: 500 }}>← Back to advisor</a>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "56px 24px 40px" }}>
          <div style={{ display: "inline-block", background: "#e1f5ee", color: "#0F6E56", fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 99, marginBottom: 16 }}>FleetAxis AI Advisory Plans</div>
          <h1 style={{ fontSize: 36, fontWeight: 600, color: "#1a1a18", marginBottom: 12, lineHeight: 1.2 }}>Choose your plan</h1>
          <p style={{ fontSize: 16, color: "#888780", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Expert EV fleet transition advisory, powered by AI. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, maxWidth: 960, margin: "0 auto", padding: "0 24px 60px" }}>
          {PLANS.map((plan) => (
            <div key={plan.id} style={{
              background: "#fff",
              border: plan.popular ? "2px solid #0F6E56" : "1px solid #e8e8e4",
              borderRadius: 16, padding: "28px 24px",
              position: "relative",
            }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#0F6E56", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 14px", borderRadius: 99, whiteSpace: "nowrap" }}>
                  Most popular
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#888780", marginBottom: 6 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 38, fontWeight: 600, color: "#1a1a18", fontFamily: "'DM Mono',monospace" }}>${plan.price}</span>
                  <span style={{ fontSize: 14, color: "#888780" }}>/{plan.period}</span>
                </div>
                <div style={{ fontSize: 13, color: "#1D9E75", fontWeight: 500, marginTop: 6 }}>
                  {plan.queries === "Unlimited" ? "Unlimited queries" : `${plan.queries} queries/month`}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#3d3d3a", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              {showEmail === plan.id ? (
                <div>
                  <input
                    type="email" placeholder="Your email address" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e8e8e4", fontSize: 13, marginBottom: 8, fontFamily: "'DM Sans',sans-serif", color: "#1a1a18" }}
                  />
                  {error && <div style={{ fontSize: 12, color: "#A32D2D", marginBottom: 8 }}>{error}</div>}
                  <button onClick={() => handleCheckout(plan.id)} disabled={loading === plan.id}
                    style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#0F6E56", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    {loading === plan.id ? "Redirecting to payment…" : "Continue to payment →"}
                  </button>
                  <button onClick={() => setShowEmail(null)} style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 10, background: "none", border: "1px solid #e8e8e4", color: "#888780", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => handleSelect(plan.id)}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, background: plan.popular ? "#0F6E56" : "#fff", border: plan.popular ? "none" : "1px solid #0F6E56", color: plan.popular ? "#fff" : "#0F6E56", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .15s" }}>
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div style={{ borderTop: "1px solid #e8e8e4", padding: "24px", textAlign: "center", background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", fontSize: 13, color: "#888780" }}>
            {["Secure payments via Stripe", "Cancel anytime", "No setup fees", "Powered by Claude AI"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
