"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PLAN_DETAILS = {
  trial: { name: "Free Trial", limit: 5, color: "#888780", price: "$0" },
  starter: { name: "Starter", limit: 50, color: "#1D9E75", price: "$299/mo" },
  professional: { name: "Professional", limit: 300, color: "#0F6E56", price: "$699/mo" },
  enterprise: { name: "Enterprise", limit: 999999, color: "#3C3489", price: "$1,999/mo" },
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "trial";
  const sessionId = searchParams.get("session_id");
  const planDetails = PLAN_DETAILS[plan] || PLAN_DETAILS.trial;
  const [portalLoading, setPortalLoading] = useState(false);
  const queriesUsed = 12; // In production pull from DB
  const pct = planDetails.limit === 999999 ? 10 : Math.round((queriesUsed / planDetails.limit) * 100);

  const openPortal = async () => {
    setPortalLoading(true);
    alert("In production, this opens the Stripe billing portal where clients can update payment, download invoices, or cancel.");
    setPortalLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf8; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fafaf8", fontFamily: "'DM Sans',sans-serif" }}>

        {/* Nav */}
        <div style={{ borderBottom: "1px solid #e8e8e4", padding: "14px 24px", background: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#1D9E75,#0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>FA</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18" }}>FleetAxis Advisory</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <a href="/" style={{ fontSize: 13, color: "#0F6E56", textDecoration: "none", fontWeight: 500, padding: "7px 14px", border: "1px solid #0F6E56", borderRadius: 8 }}>Open Advisor →</a>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

          {sessionId && (
            <div style={{ background: "#e1f5ee", border: "1px solid #9FE1CB", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#085041" }}>Payment successful — welcome to {planDetails.name}!</div>
                <div style={{ fontSize: 12, color: "#1D9E75", marginTop: 2 }}>Your subscription is now active. Open the advisor to get started.</div>
              </div>
            </div>
          )}

          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#1a1a18", marginBottom: 4 }}>Your dashboard</h1>
          <p style={{ fontSize: 14, color: "#888780", marginBottom: 28 }}>Manage your FleetAxis subscription and usage</p>

          {/* Plan card */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e4", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#888780", fontWeight: 500, marginBottom: 4 }}>Current plan</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: "#1a1a18" }}>{planDetails.name}</span>
                  <span style={{ background: "#e1f5ee", color: "#0F6E56", fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 99 }}>Active</span>
                </div>
                <div style={{ fontSize: 13, color: "#888780", marginTop: 4 }}>{planDetails.price}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href="/pricing" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e8e8e4", background: "#fff", fontSize: 13, color: "#3d3d3a", textDecoration: "none", fontWeight: 500 }}>Upgrade plan</a>
                <button onClick={openPortal} disabled={portalLoading}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #0F6E56", background: "#fff", fontSize: 13, color: "#0F6E56", cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>
                  {portalLoading ? "Loading…" : "Manage billing"}
                </button>
              </div>
            </div>

            {/* Usage bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#3d3d3a" }}>Queries used this month</span>
                <span style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: "#1a1a18" }}>
                  {queriesUsed} / {planDetails.limit === 999999 ? "∞" : planDetails.limit}
                </span>
              </div>
              <div style={{ background: "#f0f0ec", borderRadius: 99, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: pct > 80 ? "#E24B4A" : "#1D9E75", borderRadius: 99, transition: "width .4s" }} />
              </div>
              <div style={{ fontSize: 12, color: "#888780", marginTop: 6 }}>
                {planDetails.limit === 999999 ? "Unlimited queries included" : `${planDetails.limit - queriesUsed} queries remaining · resets on the 1st`}
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { icon: "ti-message-chatbot", label: "Advisor queries", value: planDetails.limit === 999999 ? "Unlimited" : `${planDetails.limit}/mo` },
              { icon: "ti-file-spreadsheet", label: "Fleet uploads", value: "Unlimited" },
              { icon: "ti-users", label: "User logins", value: plan === "starter" ? "1 user" : plan === "professional" ? "5 users" : "Unlimited" },
              { icon: "ti-headset", label: "Support", value: plan === "enterprise" ? "Dedicated manager" : "Email support" },
            ].map((item, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e8e8e4", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e1f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: "#0F6E56" }} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#888780" }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18" }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: "14px 18px", background: "#fff", border: "1px solid #e8e8e4", borderRadius: 12, fontSize: 13, color: "#888780", lineHeight: 1.7 }}>
            <strong style={{ color: "#1a1a18" }}>Need help?</strong> Contact Waheed Syed at <a href="mailto:waheed@fleetaxis.com" style={{ color: "#0F6E56" }}>waheed@fleetaxis.com</a> or visit the <a href="/pricing" style={{ color: "#0F6E56" }}>pricing page</a> to upgrade your plan.
          </div>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div style={{ padding: 40, fontFamily: "sans-serif", color: "#888" }}>Loading dashboard…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
