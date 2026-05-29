"use client";
import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

const PLAN_LIMITS = { trial: 5, starter: 50, professional: 300, enterprise: 999999 };

const STARTERS = [
  "Find nearest EV charging stations to my location",
  "Latest EV incentives available in UAE 2026?",
  "Best electric vans for a 50-vehicle Dubai fleet?",
  "How many chargers do we need for a 40-vehicle depot?",
];

const USERS = [
  { username: "waheed", password: "fleetaxis2024", name: "Waheed Syed", plan: "enterprise" },
  { username: "client1", password: "demo1234", name: "Client Portal", plan: "starter" },
];

const Dots = () => (
  <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
    ))}
  </span>
);

const SearchingIndicator = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "#085041" }}>
    <span style={{ width: 12, height: 12, border: "2px solid #9FE1CB", borderTopColor: "#0F6E56", borderRadius: "50%", display: "inline-block", animation: "spin .8s linear infinite" }} />
    Searching the web for latest information…
  </span>
);

async function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("Geolocation not supported")); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error("Location access denied. Please allow location access or type your city name.")),
      { timeout: 10000, maximumAge: 60000 }
    );
  });
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.suburb || data.display_name?.split(",")[0] || "your location";
  } catch { return "your location"; }
}

function StationCards({ content, locationName }) {
  const lines = content.split("\n").filter(l => l.trim());
  const stations = [];
  let current = null;
  lines.forEach(line => {
    const clean = line.replace(/[*#]/g, "").trim();
    const match = clean.match(/^(\d+)[.)]\s+(.+)/);
    if (match) {
      if (current) stations.push(current);
      current = { name: match[2], distance: null, type: null, operator: null };
    } else if (current) {
      const dist = clean.match(/([\d.]+)\s*(km|mile)/i);
      if (dist) current.distance = dist[1] + " " + dist[2];
      if (clean.toLowerCase().includes("dc fast") || clean.toLowerCase().includes("ccs")) current.type = "DC Fast";
      else if (clean.toLowerCase().includes("type 2") || clean.toLowerCase().includes("ac level")) current.type = "AC Level 2";
      if (clean.toLowerCase().includes("dewa")) current.operator = "DEWA";
      else if (clean.toLowerCase().includes("adnoc")) current.operator = "ADNOC";
      else if (clean.toLowerCase().includes("charge+")) current.operator = "Charge+";
      else if (clean.toLowerCase().includes("tesla")) current.operator = "Tesla";
    }
  });
  if (current) stations.push(current);
  const display = stations.slice(0, 5);

  return (
    <div style={{ background: "#f7fdfb", border: "1px solid #9FE1CB", borderRadius: 12, padding: 14, marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#085041" }}>Nearby EV Charging Stations</div>
            <div style={{ fontSize: 11, color: "#1D9E75" }}>Near {locationName || "your location"}</div>
          </div>
        </div>
        <a href={`https://www.google.com/maps/search/EV+charging+stations+near+${encodeURIComponent(locationName || "me")}`}
          target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#0F6E56", fontWeight: 500, textDecoration: "none", background: "#fff", border: "1px solid #9FE1CB", borderRadius: 99, padding: "3px 10px" }}>
          🗺️ View on map
        </a>
      </div>
      {display.length > 0 ? display.map((st, i) => (
        <div key={i} style={{ background: "#fff", border: "0.5px solid #e8e8e4", borderRadius: 10, padding: "10px 12px", marginBottom: 7 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", lineHeight: 1.3 }}>{st.name}</div>
              {st.operator && <span style={{ fontSize: 10, fontWeight: 500, background: "#e1f5ee", color: "#085041", borderRadius: 99, padding: "1px 7px", marginTop: 3, display: "inline-block" }}>{st.operator}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
              {st.distance && <span style={{ fontSize: 11, fontWeight: 600, color: "#0F6E56" }}>📍 {st.distance}</span>}
              {st.type && <span style={{ fontSize: 10, background: st.type === "DC Fast" ? "#FAEEDA" : "#e1f5ee", color: st.type === "DC Fast" ? "#633806" : "#085041", borderRadius: 99, padding: "1px 7px", fontWeight: 500 }}>⚡ {st.type}</span>}
            </div>
          </div>
        </div>
      )) : (
        <p style={{ fontSize: 12, color: "#888780", textAlign: "center", padding: 8 }}>See full response above for station details</p>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault(); setLoading(true); setError("");
    setTimeout(() => {
      const user = USERS.find((u) => u.username === username.trim().toLowerCase() && u.password === password);
      if (user) { onLogin(user); } else { setError("Incorrect username or password."); }
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf8", fontFamily: "'DM Sans',sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 16, border: "1px solid #e8e8e4", padding: "36px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#1D9E75,#0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>FA</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a18", marginBottom: 4 }}>EV Transition Advisor</h1>
          <p style={{ fontSize: 12, color: "#888780", marginBottom: 10 }}>Waheed Syed · FleetAxis Advisory</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            {["🌐 Live search", "📍 Charging finder", "📊 Fleet analysis"].map((b, i) => (
              <div key={i} style={{ background: "#e1f5ee", border: "1px solid #9FE1CB", borderRadius: 99, padding: "2px 9px", fontSize: 10, color: "#085041", fontWeight: 500 }}>{b}</div>
            ))}
          </div>
        </div>
        <form onSubmit={handleLogin}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#5F5E5A", display: "block", marginBottom: 5 }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e8e8e4", fontSize: 14, color: "#1a1a18", background: "#fafaf8", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}
            onFocus={(e) => e.target.style.borderColor = "#1D9E75"} onBlur={(e) => e.target.style.borderColor = "#e8e8e4"} />
          <label style={{ fontSize: 12, fontWeight: 500, color: "#5F5E5A", display: "block", marginBottom: 5 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e8e8e4", fontSize: 14, color: "#1a1a18", background: "#fafaf8", marginBottom: 18, fontFamily: "'DM Sans',sans-serif" }}
            onFocus={(e) => e.target.style.borderColor = "#1D9E75"} onBlur={(e) => e.target.style.borderColor = "#e8e8e4"} />
          {error && <div style={{ background: "#fcebeb", border: "1px solid #f09595", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#791F1F", marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading || !username || !password}
            style={{ width: "100%", padding: 11, borderRadius: 10, background: !username || !password ? "#d3d1c7" : "#0F6E56", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: !username || !password ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", transition: "background .15s" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: 11, color: "#b4b2a9", marginTop: 16 }}>Access restricted to authorised FleetAxis clients</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [drag, setDrag] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5, plan: "trial" });
  const [locationName, setLocationName] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!user) return <LoginScreen onLogin={(u) => { setUser(u); setUsage({ used: 0, limit: PLAN_LIMITS[u.plan] || 5, plan: u.plan }); }} />;

  const callAPI = async (msgs) => {
    setSearching(true);
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs.map((m) => ({ role: m.role, content: m.content })), username: user?.username, plan: user?.plan || "trial" }),
    });
    setSearching(false);
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "query_limit_reached") throw new Error("LIMIT_REACHED");
      throw new Error(data?.error || `Error ${res.status}`);
    }
    if (data.usage) setUsage(data.usage);
    return data.content || "No response.";
  };

  const handleLocationSearch = async () => {
    setError(null);
    try {
      const loc = await getLocation();
      const city = await reverseGeocode(loc.lat, loc.lng);
      setLocationName(city);
      const userContent = `My current location is: ${city} (coordinates: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})\n\nPlease search for and list the nearest EV charging stations. For each include:\n- Station name and operator (DEWA, ADNOC, Charge+, Tesla, etc.)\n- Approximate distance\n- Charger types (DC Fast / AC Level 2)\n- Operating hours and cost if available\n- Any relevant notes\n\nAlso provide the Google Maps search link for EV chargers near this location.`;
      const displayMsg = `📍 Find EV charging stations near ${city}`;
      const userMsg = { role: "user", content: userContent, display: displayMsg, isLocation: true };
      const newMsgs = [...messages, userMsg];
      setMessages([...newMsgs, { role: "assistant", content: "loading" }]);
      setLoading(true);
      const reply = await callAPI(newMsgs);
      const isStation = reply.toLowerCase().includes("charging") || reply.toLowerCase().includes("charger") || reply.toLowerCase().includes("dewa") || reply.toLowerCase().includes("adnoc");
      setMessages([...newMsgs, { role: "assistant", content: reply, isStationResponse: isStation, locationName: city }]);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); setSearching(false); }
  };

  const parseFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!json.length) { reject(new Error("No data found.")); return; }
        resolve({ headers: Object.keys(json[0]), rows: json, totalRows: json.length, fileName: file.name });
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error("Read failed."));
    reader.readAsArrayBuffer(file);
  });

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) { setError("Please upload .xlsx, .xls, or .csv"); return; }
    setError(null);
    try {
      const parsed = await parseFile(file);
      setFileInfo(parsed);
      const sample = parsed.rows.slice(0, 8).map((r, i) => `Row ${i + 1}: ` + parsed.headers.map((h) => `${h}=${r[h]}`).join(", ")).join("\n");
      const userContent = `Fleet data uploaded: "${file.name}"\n\n${parsed.totalRows} vehicles, columns: ${parsed.headers.join(", ")}\n\nSample:\n${sample}\n\nSearch for current 2026 EV models and analyse:\n1. Best EV transition candidates\n2. Estimated annual fuel cost & CO2\n3. Recommended EV replacements with 2026 pricing\n4. Potential TCO savings`;
      const fileMsg = { role: "user", content: userContent, display: `📊 Fleet file: ${file.name} (${parsed.totalRows} vehicles)`, isFile: true };
      const newMsgs = [...messages, fileMsg];
      setMessages([...newMsgs, { role: "assistant", content: "loading" }]);
      setLoading(true);
      const reply = await callAPI(newMsgs);
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setSearching(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const sendMessage = async (text) => {
    const t = text || input.trim();
    if (!t || loading) return;
    if (t.toLowerCase().includes("nearest") && t.toLowerCase().includes("charging")) { setInput(""); handleLocationSearch(); return; }
    setInput(""); setError(null);
    const userMsg = { role: "user", content: t };
    const newMsgs = [...messages, userMsg];
    setMessages([...newMsgs, { role: "assistant", content: "loading" }]);
    setLoading(true);
    try {
      const reply = await callAPI(newMsgs);
      const isStation = reply.toLowerCase().includes("charging station") || reply.toLowerCase().includes("dewa") || reply.toLowerCase().includes("adnoc");
      setMessages([...newMsgs, { role: "assistant", content: reply, isStationResponse: isStation, locationName }]);
    } catch (err) {
      setMessages(newMsgs);
      setError(err.message === "LIMIT_REACHED" ? "LIMIT_REACHED" : err.message);
    } finally { setLoading(false); setSearching(false); setTimeout(() => inputRef.current?.focus(), 50); }
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif}
        textarea,input{font-family:'DM Sans',sans-serif}
        textarea:focus,input:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#d3d1c7;border-radius:2px}
        .sbtn:hover{background:#e1f5ee!important;border-color:#1D9E75!important;color:#085041!important}
        .sendbtn:hover:not(:disabled){background:#085041!important}
        .sendbtn:disabled{opacity:.4;cursor:not-allowed}
        .upbtn:hover{background:#e1f5ee!important;border-color:#1D9E75!important}
        .locbtn:hover{background:#e1f5ee!important;border-color:#1D9E75!important}
        .dz:hover{background:#e1f5ee!important;border-color:#1D9E75!important}
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: drag ? "#f0fdf8" : "#fafaf8", transition: "background .2s", fontFamily: "'DM Sans',sans-serif" }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}>

        {drag && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(225,245,238,.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, pointerEvents: "none" }}>
            <div style={{ fontSize: 48 }}>📊</div>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#0F6E56" }}>Drop fleet file here</p>
          </div>
        )}

        {/* Header */}
        <div style={{ borderBottom: "1px solid #e8e8e4", padding: "12px 20px", background: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#1D9E75,#0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>FA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", lineHeight: 1.2 }}>EV Transition Advisor</div>
            <div style={{ fontSize: 11, color: "#888780" }}>Waheed Syed · FleetAxis Advisory · Powered by Claude</div>
          </div>
          {["🌐 Live", "📍 GPS"].map((b, i) => (
            <div key={i} style={{ background: "#e1f5ee", borderRadius: 99, padding: "2px 9px", fontSize: 10, color: "#085041", fontWeight: 500 }}>{b}</div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 4 }}>
            <button className="upbtn" onClick={() => fileRef.current?.click()} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: "1px solid #e8e8e4", background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 500, color: "#3d3d3a", transition: "all .15s" }}>
              📎 Upload
            </button>
            {usage.plan !== "enterprise" && <div style={{ fontSize: 11, color: usage.used >= usage.limit * 0.8 ? "#854F0B" : "#888780" }}>{usage.used}/{usage.limit}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#888780" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />{user.name.split(" ")[0]}
            </div>
            <button onClick={() => { setUser(null); setMessages([]); }} style={{ fontSize: 11, color: "#888780", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
          </div>
        </div>

        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>
          {isEmpty ? (
            <div style={{ animation: "fadeUp .4s ease", maxWidth: 560, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 4 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#1D9E75,#0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>FA</div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1a1a18", marginBottom: 6 }}>Welcome, {user.name.split(" ")[0]}</h1>
                <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 10px" }}>EV fleet advisor with live web search and GPS charging station finder.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                  {["🌐 Live 2026 data", "📍 GPS charging finder", "📊 Fleet analysis", "💳 Stripe billing"].map((b, i) => (
                    <div key={i} style={{ background: "#e1f5ee", border: "1px solid #9FE1CB", borderRadius: 99, padding: "3px 10px", fontSize: 10, color: "#085041", fontWeight: 500 }}>{b}</div>
                  ))}
                </div>
              </div>

              {/* Location CTA */}
              <div onClick={handleLocationSearch} style={{ background: "#fff", border: "2px solid #9FE1CB", borderRadius: 14, padding: "18px", textAlign: "center", marginBottom: 12, cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f7fdfb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📍</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F6E56", marginBottom: 3 }}>Find nearest EV charging stations</div>
                <div style={{ fontSize: 12, color: "#888780" }}>Uses your GPS · Click to enable location access</div>
              </div>

              <div className="dz" onClick={() => fileRef.current?.click()}
                style={{ border: "2px dashed #9FE1CB", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "#f7fdfb", transition: "all .2s" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>📊</div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#0F6E56", marginBottom: 2 }}>Upload fleet Excel or CSV</p>
                <p style={{ fontSize: 11, color: "#888780" }}>Drag & drop or click · .xlsx .xls .csv</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                {STARTERS.map((p, i) => (
                  <button key={i} className="sbtn" onClick={() => { if (p.toLowerCase().includes("nearest")) handleLocationSearch(); else sendMessage(p); }}
                    style={{ background: "#fff", border: "1px solid #e8e8e4", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#3d3d3a", textAlign: "left", cursor: "pointer", lineHeight: 1.5, transition: "all .15s" }}>{p}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              {fileInfo && (
                <div style={{ background: "#e1f5ee", border: "1px solid #9FE1CB", borderRadius: 9, padding: "9px 12px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span>📊</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#085041" }}>{fileInfo.fileName}</span>
                    <span style={{ fontSize: 11, color: "#1D9E75" }}>{fileInfo.totalRows} vehicles · {fileInfo.headers.length} cols</span>
                  </div>
                  <button onClick={() => setFileInfo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0F6E56", fontSize: 17 }}>×</button>
                </div>
              )}
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 14, gap: 8, alignItems: "flex-start" }}>
                    {!isUser && (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#1D9E75,#0F6E56)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono',monospace" }}>FA</div>
                    )}
                    <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ background: msg.isLocation ? "#e8f4ff" : msg.isFile ? "#e1f5ee" : isUser ? "#0F6E56" : "#f7f7f5", color: msg.isLocation ? "#0C447C" : msg.isFile ? "#085041" : isUser ? "#fff" : "#1a1a18", border: msg.isLocation ? "1px solid #B5D4F4" : msg.isFile ? "1px solid #9FE1CB" : "none", borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {msg.content === "loading" ? (searching ? <SearchingIndicator /> : <Dots />) :
                          (msg.isFile || msg.isLocation) ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <span>{msg.isLocation ? "📍" : "📊"}</span>
                              <span style={{ fontWeight: 600, fontSize: 12 }}>{msg.display || msg.content}</span>
                            </div>
                          ) : (
                            <>
                              {!isUser && (msg.content.includes("2026") || msg.content.includes("search") || msg.content.toLowerCase().includes("current")) && (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e1f5ee", borderRadius: 99, padding: "2px 7px", fontSize: 10, color: "#0F6E56", fontWeight: 500, marginBottom: 6 }}>🌐 Live data</div>
                              )}
                              {msg.content}
                            </>
                          )
                        }
                      </div>
                      {!isUser && msg.isStationResponse && msg.content !== "loading" && (
                        <StationCards content={msg.content} locationName={msg.locationName} />
                      )}
                    </div>
                    {isUser && (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8e8e4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, fontSize: 9, fontWeight: 600, color: "#5F5E5A", fontFamily: "'DM Mono',monospace" }}>
                        {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {error && (
            <div style={{ maxWidth: 680, margin: "8px auto" }}>
              {error === "LIMIT_REACHED" ? (
                <div style={{ background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#633806" }}>Query limit reached</div>
                    <div style={{ fontSize: 12, color: "#854F0B", marginTop: 2 }}>Upgrade your plan to continue.</div>
                  </div>
                  <a href="/pricing" style={{ padding: "7px 14px", borderRadius: 8, background: "#0F6E56", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Upgrade →</a>
                </div>
              ) : (
                <div style={{ background: "#fcebeb", border: "1px solid #f09595", borderRadius: 9, padding: "9px 13px", fontSize: 12, color: "#791F1F", lineHeight: 1.6 }}>{error}</div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ borderTop: "1px solid #e8e8e4", padding: "12px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 7, alignItems: "flex-end" }}>
            <button className="locbtn" onClick={handleLocationSearch} disabled={loading} title="Find charging stations near me"
              style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, border: "1px solid #e8e8e4", background: "#fafaf8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", fontSize: 17 }}>📍</button>
            <button className="upbtn" onClick={() => fileRef.current?.click()} disabled={loading} title="Upload fleet file"
              style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, border: "1px solid #e8e8e4", background: "#fafaf8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", fontSize: 17 }}>📎</button>
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything · 📍 for charging stations · 📎 for fleet data…"
              rows={1}
              style={{ flex: 1, resize: "none", border: "1px solid #e8e8e4", borderRadius: 10, padding: "10px 13px", fontSize: 13, color: "#1a1a18", background: "#fafaf8", lineHeight: 1.5, maxHeight: 110, overflowY: "auto", transition: "border-color .15s" }}
              onFocus={(e) => e.target.style.borderColor = "#1D9E75"}
              onBlur={(e) => e.target.style.borderColor = "#e8e8e4"}
              onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }} />
            <button className="sendbtn" onClick={() => sendMessage()} disabled={!input.trim() || loading}
              style={{ width: 40, height: 40, borderRadius: 10, background: "#0F6E56", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 10, color: "#b4b2a9", marginTop: 7 }}>FleetAxis Advisory · 📍 GPS Charging Finder · 🌐 Live Web Search · Powered by Claude</p>
        </div>
      </div>
    </>
  );
}
