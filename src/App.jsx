import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"

// ============== DATA ==============

const PLANS = [
  { id: "starter", name: "Starter", price: 12, blasts: 20, desc: "For solo creators who want to stop copy-pasting", features: ["20 blasts/month", "10 platforms", "Instant generation", "Basic tone selection"], stripePriceId: "" },
  { id: "growth", name: "Growth", price: 39, blasts: 80, desc: "For brands serious about showing up everywhere", features: ["80 blasts/month", "10 platforms", "Custom brand voice", "A/B content variants", "Priority support"], popular: true, stripePriceId: "" },
  { id: "scale", name: "Scale", price: 79, blasts: 9999, desc: "For agencies juggling multiple clients", features: ["Unlimited blasts", "10 platforms", "Custom brand voice", "A/B content variants", "Bulk upload", "Priority support"], stripePriceId: "" },
]

const PLATFORMS = [
  { id: "twitter", name: "Twitter/X", icon: "X", desc: "Punchy thread with hooks" },
  { id: "linkedin", name: "LinkedIn", icon: "in", desc: "Professional thought leadership" },
  { id: "instagram", name: "Instagram", icon: "IG", desc: "Engaging caption + hashtags" },
  { id: "newsletter", name: "Newsletter", icon: "NL", desc: "Email-ready summary" },
  { id: "youtube_short", name: "YT Short Script", icon: "YT", desc: "60-sec video script" },
  { id: "tiktok", name: "TikTok Script", icon: "TT", desc: "Hook-driven short script" },
  { id: "facebook", name: "Facebook", icon: "FB", desc: "Community-style post" },
  { id: "blog_summary", name: "Blog Summary", icon: "BL", desc: "SEO-optimised short post" },
  { id: "reddit", name: "Reddit", icon: "RD", desc: "Discussion-starter post" },
  { id: "threads", name: "Threads", icon: "TH", desc: "Conversational short post" },
]

const TONES = ["Professional", "Casual", "Witty", "Inspirational", "Educational", "Provocative"]

// ============== DESIGN TOKENS ==============

const t = {
  cream: "#FAF7F2", ink: "#1a1a1a", inkLight: "#3d3d3d", inkMuted: "#7a7a7a",
  inkFaint: "#b8b8b8", lineFaint: "#e8e4de", lineMed: "#d4cfc7",
  vermillion: "#E23D28", vermillionDark: "#c4311f", vermillionPale: "#fef0ee",
  paper: "#FFFFFF", moss: "#2d6a4f", slate: "#f3f1ed",
}

const ff = {
  display: "'Sora', 'Outfit', sans-serif",
  body: "'DM Sans', 'Outfit', sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
}

// ============== SHARED COMPONENTS ==============

function Logo({ dark = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
      <div style={{ width: 30, height: 30, borderRadius: 6, background: t.vermillion, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)" }}>
        <span style={{ color: "#fff", fontFamily: ff.display, fontWeight: 800, fontSize: 13 }}>CB</span>
      </div>
      <span style={{ fontFamily: ff.display, fontWeight: 700, fontSize: 18, color: dark ? t.ink : "#fff", letterSpacing: -0.5 }}>ContentBlast</span>
    </div>
  )
}

function Btn({ children, variant = "primary", size = "md", onClick, style = {}, disabled = false, loading = false }) {
  const [h, setH] = useState(false)
  const base = { border: "none", cursor: disabled ? "not-allowed" : "pointer", fontFamily: ff.body, fontWeight: 600, borderRadius: 6, transition: "all 0.15s ease", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: disabled ? 0.5 : 1, fontSize: size === "lg" ? 15 : size === "sm" ? 13 : 14, padding: size === "lg" ? "13px 26px" : size === "sm" ? "7px 14px" : "10px 20px" }
  const v = {
    primary: { background: h ? t.vermillionDark : t.vermillion, color: "#fff", transform: h && !disabled ? "translateY(-1px)" : "none", boxShadow: h ? "0 4px 12px rgba(226,61,40,0.25)" : "none" },
    secondary: { background: h ? t.slate : "transparent", color: t.ink, border: "1.5px solid " + t.lineMed },
    ghost: { background: "transparent", color: h ? t.ink : t.inkMuted },
    dark: { background: h ? t.inkLight : t.ink, color: "#fff", transform: h && !disabled ? "translateY(-1px)" : "none" },
  }
  return (<button onClick={disabled ? undefined : onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ ...base, ...v[variant], ...style }}>{loading && <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>&#8635;</span>}{children}</button>)
}

function Input({ label, type = "text", value, onChange, placeholder, style = {}, rows = 8 }) {
  const [f, setF] = useState(false)
  const s = { width: "100%", padding: "11px 14px", borderRadius: 6, background: t.paper, border: "1.5px solid " + (f ? t.vermillion : t.lineMed), color: t.ink, fontSize: 14, fontFamily: ff.body, outline: "none", transition: "border 0.15s", boxSizing: "border-box" }
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.inkMuted, marginBottom: 5, fontFamily: ff.body, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</label>}
      {type === "textarea" ? <textarea value={value} onChange={onChange} placeholder={placeholder} onFocus={() => setF(true)} onBlur={() => setF(false)} rows={rows} style={{ ...s, resize: "vertical" }} /> : <input type={type} value={value} onChange={onChange} placeholder={placeholder} onFocus={() => setF(true)} onBlur={() => setF(false)} style={s} />}
    </div>
  )
}

// ============== LANDING PAGE ==============

function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div style={{ background: t.cream, color: t.ink, fontFamily: ff.body, minHeight: "100vh", overflowX: "hidden" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <Logo />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Btn variant="ghost" onClick={onLogin}>Log in</Btn>
          <Btn variant="dark" onClick={onGetStarted}>Get started</Btn>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "70px 32px 40px", position: "relative" }}>
        <div style={{ position: "absolute", top: 30, right: 60, width: 120, height: 120, borderRadius: "50%", border: "2px solid " + t.lineMed, opacity: 0.5 }} />
        <div style={{ position: "absolute", top: 150, right: 20, width: 60, height: 60, background: t.vermillionPale, borderRadius: "50%" }} />
        <div style={{ maxWidth: 750 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 6px", borderRadius: 4, border: "1.5px solid " + t.lineMed, marginBottom: 24, fontSize: 12, fontWeight: 600, color: t.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>
            <span style={{ background: t.vermillion, color: "#fff", padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700 }}>NEW</span>
            Content repurposing on autopilot
          </div>
          <h1 style={{ fontFamily: ff.display, fontSize: "clamp(40px, 5.5vw, 64px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, color: t.ink, letterSpacing: -1.5 }}>
            Write it once.
            <br />
            <span style={{ color: t.vermillion, position: "relative" }}>
              Publish it everywhere.
              <svg style={{ position: "absolute", bottom: -4, left: 0, width: "100%", height: 10 }} viewBox="0 0 400 10" preserveAspectRatio="none">
                <path d="M0 7 Q100 0 200 5 Q300 10 400 3" stroke={t.vermillion} strokeWidth="2.5" fill="none" opacity="0.35" />
              </svg>
            </span>
          </h1>
          <p style={{ fontSize: 17, color: t.inkMuted, maxWidth: 520, lineHeight: 1.7, marginBottom: 36 }}>
            Drop in a blog post, transcript, or script. Get back platform-ready content for Twitter, LinkedIn, Instagram, TikTok, and six more — in seconds.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Btn size="lg" onClick={onGetStarted}>{"Start for £12/month →"}</Btn>
            <span style={{ fontSize: 13, color: t.inkFaint }}>No credit card for trial</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 48, marginTop: 60, paddingTop: 32, borderTop: "1.5px solid " + t.lineMed, flexWrap: "wrap" }}>
          {[{ val: "10x", label: "more content from one piece" }, { val: "30s", label: "average generation time" }, { val: "10", label: "platforms supported" }].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: ff.display, fontSize: 34, fontWeight: 800, color: t.ink }}>{s.val}</div>
              <div style={{ fontSize: 13, color: t.inkMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform marquee */}
      <section style={{ padding: "36px 0", borderTop: "1px solid " + t.lineFaint, borderBottom: "1px solid " + t.lineFaint, overflow: "hidden", background: t.paper }}>
        <div style={{ display: "flex", gap: 32, alignItems: "center", animation: "marquee 25s linear infinite", width: "max-content" }}>
          {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: t.inkMuted, whiteSpace: "nowrap" }}>
              <span style={{ width: 28, height: 28, borderRadius: 6, background: t.slate, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: t.ink, fontFamily: ff.mono }}>{p.icon}</span>
              {p.name}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 50, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: t.vermillion, marginBottom: 8 }}>How it works</div>
            <h2 style={{ fontFamily: ff.display, fontSize: 34, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.8 }}>Three steps. No learning curve.</h2>
          </div>
          <p style={{ fontSize: 14, color: t.inkMuted, maxWidth: 300, lineHeight: 1.6 }}>Most tools make you learn a whole new workflow. ContentBlast fits into what you already do.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2, background: t.lineMed, borderRadius: 10, overflow: "hidden" }}>
          {[
            { num: "01", title: "Paste your content", desc: "Blog post, podcast transcript, video script, newsletter draft. Anything long-form. Just paste it in.", color: t.cream },
            { num: "02", title: "Pick your platforms", desc: "Select which platforms you want content for. Each output is crafted natively, not just truncated.", color: t.paper },
            { num: "03", title: "Copy and publish", desc: "Get ready-to-go content for every platform in under 30 seconds. Copy it. Post it. Done.", color: t.slate },
          ].map((step, i) => (
            <div key={i} style={{ background: step.color, padding: "36px 28px" }}>
              <div style={{ fontFamily: ff.mono, fontSize: 44, fontWeight: 700, color: t.lineMed, marginBottom: 16, lineHeight: 1 }}>{step.num}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: t.ink }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: t.inkMuted, lineHeight: 1.65 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before/After */}
      <section style={{ background: t.ink, color: "#fff", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: t.vermillion, marginBottom: 8 }}>The difference</div>
            <h2 style={{ fontFamily: ff.display, fontSize: 32, fontWeight: 800, letterSpacing: -0.8 }}>{"What used to take an hour now takes 30 seconds"}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "start", maxWidth: 800, margin: "0 auto" }}>
            <div style={{ padding: 24, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Without ContentBlast</div>
              {["Write blog post", "Manually rewrite for Twitter", "Adapt again for LinkedIn", "Create Instagram caption", "Write newsletter snippet", "Film TikTok script", "Schedule everything separately"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 16, lineHeight: 1 }}>-</span>
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>{s}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "8px 12px", borderRadius: 6, background: "rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: ff.mono }}>{"~ 2-3 hours per piece"}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", paddingTop: 80, fontSize: 24, color: t.vermillion, fontWeight: 700 }}>{"→"}</div>
            <div style={{ padding: 24, borderRadius: 10, background: "rgba(226,61,40,0.08)", border: "1px solid rgba(226,61,40,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: t.vermillion, marginBottom: 16 }}>With ContentBlast</div>
              {["Write blog post", "Paste into ContentBlast", "Get 10 platform-ready posts", "Copy, paste, publish"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: t.vermillion, fontSize: 14, fontWeight: 700 }}>{"✓"}</span>
                  <span style={{ color: "#fff" }}>{s}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "8px 12px", borderRadius: 6, background: "rgba(226,61,40,0.1)", fontSize: 13, color: t.vermillion, fontFamily: ff.mono, fontWeight: 600 }}>{"~ 30 seconds"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: t.vermillion, marginBottom: 8 }}>Pricing</div>
          <h2 style={{ fontFamily: ff.display, fontSize: 34, fontWeight: 800, letterSpacing: -0.8, marginBottom: 8 }}>Cheaper than your coffee habit.</h2>
          <p style={{ fontSize: 15, color: t.inkMuted }}>Cancel whenever. No contracts. No nonsense.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, maxWidth: 900, margin: "0 auto" }}>
          {PLANS.map((plan) => (
            <div key={plan.id} style={{ background: plan.popular ? t.ink : t.paper, color: plan.popular ? "#fff" : t.ink, border: plan.popular ? "none" : "1.5px solid " + t.lineMed, borderRadius: 10, padding: "32px 28px", position: "relative", transform: plan.popular ? "scale(1.03)" : "none", boxShadow: plan.popular ? "0 16px 48px rgba(0,0,0,0.15)" : "none" }}>
              {plan.popular && <div style={{ position: "absolute", top: -10, left: 24, background: t.vermillion, color: "#fff", padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Most popular</div>}
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: plan.popular ? "rgba(255,255,255,0.5)" : t.inkMuted, marginBottom: 12 }}>{plan.name}</div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: ff.display, fontSize: 42, fontWeight: 800 }}>{"£"}{plan.price}</span>
                <span style={{ fontSize: 14, color: plan.popular ? "rgba(255,255,255,0.5)" : t.inkMuted }}>/mo</span>
              </div>
              <p style={{ fontSize: 13, color: plan.popular ? "rgba(255,255,255,0.6)" : t.inkMuted, marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</p>
              <Btn variant={plan.popular ? "primary" : "dark"} style={{ width: "100%", marginBottom: 20 }} onClick={onGetStarted}>Get started</Btn>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: plan.popular ? "rgba(255,255,255,0.7)" : t.inkMuted }}>
                    <span style={{ color: plan.popular ? t.vermillion : t.moss, fontSize: 12, fontWeight: 700 }}>{"✓"}</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "60px 32px 80px", textAlign: "center" }}>
        <div style={{ background: t.paper, borderRadius: 12, padding: "48px 40px", border: "1.5px solid " + t.lineMed, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: t.vermillionPale, zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: ff.display, fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: -0.5 }}>Your content deserves a bigger audience.</h2>
            <p style={{ fontSize: 15, color: t.inkMuted, marginBottom: 28, lineHeight: 1.6 }}>Stop letting great content die on one platform. Start repurposing in 30 seconds.</p>
            <Btn size="lg" onClick={onGetStarted}>{"Try ContentBlast free →"}</Btn>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid " + t.lineFaint, padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1100, margin: "0 auto", flexWrap: "wrap", gap: 12 }}>
        <Logo />
        <div style={{ fontSize: 12, color: t.inkFaint }}>{"© 2026 ContentBlast. All rights reserved."}</div>
      </footer>
    </div>
  )
}

// ============== AUTH PAGE ==============

function AuthPage({ onAuth, mode: initialMode, onBack }) {
  const [mode, setMode] = useState(initialMode || "signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError("")

    try {
      let result
      if (mode === "signup") {
        result = await supabase.auth.signUp({ email, password })
      } else {
        result = await supabase.auth.signInWithPassword({ email, password })
      }

      if (result.error) {
        setError(result.error.message)
      } else if (result.data?.user) {
        onAuth(result.data.user)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div style={{ background: t.cream, color: t.ink, fontFamily: ff.body, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 28, cursor: "pointer" }} onClick={onBack}><Logo /></div>
        <div style={{ background: t.paper, borderRadius: 10, border: "1.5px solid " + t.lineMed, padding: "32px 28px" }}>
          <h2 style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
          <p style={{ fontSize: 13, color: t.inkMuted, marginBottom: 22 }}>{mode === "signup" ? "Start repurposing content in seconds." : "Log in to continue."}</p>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 6, background: t.vermillionPale, color: t.vermillion, fontSize: 13, marginBottom: 14, fontWeight: 500 }}>{error}</div>
          )}

          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          <Btn style={{ width: "100%" }} onClick={handleSubmit} disabled={!email || !password || loading} loading={loading}>
            {mode === "signup" ? "Create account →" : "Log in →"}
          </Btn>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: t.inkMuted }}>
            {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }} style={{ color: t.vermillion, cursor: "pointer", fontWeight: 600 }}>
              {mode === "signup" ? "Log in" : "Sign up"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============== PAYWALL PAGE ==============

function PaywallPage({ user, onLogout, onPaid }) {
  const [loadingPlan, setLoadingPlan] = useState(null)

  const handleCheckout = async (planId) => {
    setLoadingPlan(planId)
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (await supabase.auth.getSession()).data.session?.access_token,
        },
        body: JSON.stringify({ planId }),
      })
      const data = await response.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      alert("Failed to create checkout session.")
    }
    setLoadingPlan(null)
  }

  return (
    <div style={{ background: t.cream, color: t.ink, fontFamily: ff.body, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <Logo />
        <Btn variant="ghost" onClick={onLogout}>Log out</Btn>
      </nav>

      <div style={{ maxWidth: 900, padding: "60px 32px", textAlign: "center", width: "100%" }}>
        <h1 style={{ fontFamily: ff.display, fontSize: 34, fontWeight: 800, marginBottom: 8, letterSpacing: -0.8 }}>Choose your plan to get started</h1>
        <p style={{ fontSize: 15, color: t.inkMuted, marginBottom: 48 }}>Pick a plan and start repurposing content in seconds. Cancel anytime.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 900, margin: "0 auto" }}>
          {PLANS.map((plan) => (
            <div key={plan.id} style={{ background: plan.popular ? t.ink : t.paper, color: plan.popular ? "#fff" : t.ink, border: plan.popular ? "none" : "1.5px solid " + t.lineMed, borderRadius: 10, padding: "32px 28px", position: "relative", transform: plan.popular ? "scale(1.03)" : "none", boxShadow: plan.popular ? "0 16px 48px rgba(0,0,0,0.15)" : "none" }}>
              {plan.popular && <div style={{ position: "absolute", top: -10, left: 24, background: t.vermillion, color: "#fff", padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Most popular</div>}
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: plan.popular ? "rgba(255,255,255,0.5)" : t.inkMuted, marginBottom: 12 }}>{plan.name}</div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: ff.display, fontSize: 42, fontWeight: 800 }}>{"£"}{plan.price}</span>
                <span style={{ fontSize: 14, color: plan.popular ? "rgba(255,255,255,0.5)" : t.inkMuted }}>/mo</span>
              </div>
              <p style={{ fontSize: 13, color: plan.popular ? "rgba(255,255,255,0.6)" : t.inkMuted, marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</p>
              <Btn variant={plan.popular ? "primary" : "dark"} style={{ width: "100%", marginBottom: 20 }} onClick={() => handleCheckout(plan.id)} loading={loadingPlan === plan.id} disabled={!!loadingPlan}>
                {loadingPlan === plan.id ? "Redirecting..." : "Subscribe →"}
              </Btn>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: plan.popular ? "rgba(255,255,255,0.7)" : t.inkMuted }}>
                    <span style={{ color: plan.popular ? t.vermillion : t.moss, fontSize: 12, fontWeight: 700 }}>{"✓"}</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============== DASHBOARD ==============

function Dashboard({ user, onLogout }) {
  const [view, setView] = useState("new")
  const [content, setContent] = useState("")
  const [contentTitle, setContentTitle] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState(["twitter", "linkedin", "newsletter"])
  const [tone, setTone] = useState("Professional")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(null)
  const [profile, setProfile] = useState(null)
  const [brandVoice, setBrandVoice] = useState("")

  // Load profile and blast history on mount
  useEffect(() => {
    loadProfile()
    loadHistory()
  }, [])

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    if (data) {
      setProfile(data)
      setBrandVoice(data.brand_voice || "")
    }
  }

  const loadHistory = async () => {
    const { data } = await supabase
      .from("blasts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
    if (data) setHistory(data)
  }

  const togglePlatform = (id) => setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleBlast = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) return

    // Check usage limits
    if (profile && profile.blasts_used >= profile.blasts_limit) {
      alert("You've reached your blast limit for this month. Upgrade your plan to continue.")
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/blast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (await supabase.auth.getSession()).data.session?.access_token,
        },
        body: JSON.stringify({
          content,
          title: contentTitle,
          platforms: selectedPlatforms,
          tone,
          brand_voice: brandVoice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Blast failed")
      }

      setResults(data.results)

      // Refresh profile to update usage count
      loadProfile()
      loadHistory()
    } catch (err) {
      setResults([{ platform: "Error", platform_id: "error", content: "Request failed: " + err.message, char_count: 0 }])
    }
    setLoading(false)
  }

  const saveBrandVoice = async () => {
    await supabase
      .from("profiles")
      .update({ brand_voice: brandVoice })
      .eq("id", user.id)
    loadProfile()
    alert("Brand voice saved!")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  const handleCheckout = async (planId) => {
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (await supabase.auth.getSession()).data.session?.access_token,
        },
        body: JSON.stringify({ planId }),
      })
      const data = await response.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      alert("Failed to create checkout session.")
    }
  }

  const blastsUsed = profile?.blasts_used || 0
  const blastsLimit = profile?.blasts_limit || 20
  const planName = profile?.plan || "starter"
  const usagePercent = Math.min((blastsUsed / blastsLimit) * 100, 100)

  return (
    <div style={{ background: t.cream, color: t.ink, fontFamily: ff.body, minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, borderRight: "1.5px solid " + t.lineMed, padding: "20px 14px", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, background: t.paper, zIndex: 10 }}>
        <div style={{ marginBottom: 28, paddingLeft: 4 }}><Logo /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {[{ id: "new", label: "New Blast" }, { id: "history", label: "History" }, { id: "settings", label: "Settings" }].map(item => (
            <div key={item.id} onClick={() => setView(item.id)} style={{ padding: "9px 12px", borderRadius: 6, cursor: "pointer", background: view === item.id ? t.vermillionPale : "transparent", color: view === item.id ? t.vermillion : t.inkMuted, fontWeight: view === item.id ? 600 : 500, fontSize: 14, transition: "all 0.12s" }}>{item.label}</div>
          ))}
        </div>
        <div style={{ padding: 14, borderRadius: 8, background: t.slate, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: t.inkMuted, marginBottom: 3 }}>{"Plan: "}<span style={{ color: t.vermillion, fontWeight: 600, textTransform: "capitalize" }}>{planName}</span></div>
          <div style={{ fontSize: 12, color: t.inkMuted }}>{blastsUsed} / {blastsLimit === 9999 ? "∞" : blastsLimit} blasts</div>
          <div style={{ height: 3, borderRadius: 2, background: t.lineMed, marginTop: 8 }}>
            <div style={{ height: 3, borderRadius: 2, background: usagePercent > 90 ? t.vermillion : t.moss, width: usagePercent + "%", transition: "width 0.3s" }} />
          </div>
        </div>
        <Btn variant="ghost" size="sm" onClick={handleLogout} style={{ justifyContent: "flex-start", color: t.inkFaint }}>Log out</Btn>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: "28px 36px", maxWidth: 820 }}>

        {/* ===== NEW BLAST ===== */}
        {view === "new" && (<>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: ff.display, fontSize: 24, fontWeight: 800, marginBottom: 4 }}>New Blast</h1>
            <p style={{ fontSize: 14, color: t.inkMuted }}>Paste your content and let AI handle the rest.</p>
          </div>
          <div style={{ background: t.paper, borderRadius: 10, border: "1.5px solid " + t.lineMed, padding: 24, marginBottom: 20 }}>
            <Input label="Title (optional)" value={contentTitle} onChange={e => setContentTitle(e.target.value)} placeholder="e.g. My blog post about AI trends" />
            <Input label="Your content" type="textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Paste your blog post, transcript, script, or any long-form content here..." />

            {/* Tone selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.inkMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Tone</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TONES.map(to => (<div key={to} onClick={() => setTone(to)} style={{ padding: "6px 14px", borderRadius: 5, cursor: "pointer", background: tone === to ? t.vermillionPale : t.slate, border: "1.5px solid " + (tone === to ? t.vermillion : "transparent"), color: tone === to ? t.vermillion : t.inkMuted, fontSize: 13, fontWeight: 600, transition: "all 0.12s" }}>{to}</div>))}
              </div>
            </div>

            {/* Platform selector */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.inkMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>{"Platforms · " + selectedPlatforms.length + " selected"}</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6 }}>
                {PLATFORMS.map(p => { const sel = selectedPlatforms.includes(p.id); return (
                  <div key={p.id} onClick={() => togglePlatform(p.id)} style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer", background: sel ? t.vermillionPale : t.slate, border: "1.5px solid " + (sel ? t.vermillion : "transparent"), display: "flex", alignItems: "center", gap: 8, transition: "all 0.12s" }}>
                    <span style={{ width: 24, height: 24, borderRadius: 5, background: sel ? t.vermillion : t.lineMed, color: sel ? "#fff" : t.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, transition: "all 0.12s", fontFamily: ff.mono }}>{p.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: sel ? t.vermillion : t.inkMuted }}>{p.name}</span>
                  </div>
                ); })}
              </div>
            </div>
          </div>

          <Btn size="lg" onClick={handleBlast} disabled={!content.trim() || selectedPlatforms.length === 0 || loading} loading={loading} style={{ width: "100%" }}>
            {loading ? "Generating..." : "Blast to " + selectedPlatforms.length + " platform" + (selectedPlatforms.length !== 1 ? "s" : "") + " →"}
          </Btn>

          {loading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ width: 36, height: 36, border: "2.5px solid " + t.lineMed, borderTop: "2.5px solid " + t.vermillion, borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.7s linear infinite" }} />
              <p style={{ color: t.inkMuted, fontSize: 14 }}>{"Repurposing across " + selectedPlatforms.length + " platforms..."}</p>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div style={{ marginTop: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.moss }} />
                <h2 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 700 }}>Ready to publish</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {results.map((r, i) => {
                  const plat = PLATFORMS.find(p => p.id === r.platform_id) || {}
                  return (
                    <div key={i} style={{ background: t.paper, borderRadius: 8, border: "1.5px solid " + t.lineMed, overflow: "hidden" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid " + t.lineFaint, background: t.slate }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 24, height: 24, borderRadius: 5, background: t.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: ff.mono }}>{plat.icon || "?"}</span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{r.platform}</span>
                        </div>
                        <Btn variant="secondary" size="sm" onClick={() => copyToClipboard(r.content, i)} style={{ borderColor: copied === i ? t.moss : t.lineMed, color: copied === i ? t.moss : t.ink }}>
                          {copied === i ? "Copied!" : "Copy"}
                        </Btn>
                      </div>
                      <div style={{ padding: 16, fontSize: 14, lineHeight: 1.7, color: t.inkLight, whiteSpace: "pre-wrap", maxHeight: 260, overflowY: "auto" }}>{r.content}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>)}

        {/* ===== HISTORY ===== */}
        {view === "history" && (<>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: ff.display, fontSize: 24, fontWeight: 800, marginBottom: 4 }}>History</h1>
            <p style={{ fontSize: 14, color: t.inkMuted }}>Your previous content blasts.</p>
          </div>
          {history.length === 0 ? (
            <div style={{ background: t.paper, borderRadius: 10, border: "1.5px solid " + t.lineMed, padding: "60px 32px", textAlign: "center" }}>
              <p style={{ color: t.inkMuted, marginBottom: 16 }}>No blasts yet.</p>
              <Btn onClick={() => setView("new")}>{"Create your first blast →"}</Btn>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map(entry => (
                <div key={entry.id} style={{ background: t.paper, borderRadius: 8, padding: "14px 18px", border: "1.5px solid " + t.lineMed, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{entry.title}</div>
                    <div style={{ fontSize: 12, color: t.inkMuted }}>{new Date(entry.created_at).toLocaleDateString() + " · " + (entry.platforms?.length || 0) + " platforms"}</div>
                  </div>
                  <Btn variant="secondary" size="sm" onClick={() => { setResults(entry.results); setView("new"); }}>View</Btn>
                </div>
              ))}
            </div>
          )}
        </>)}

        {/* ===== SETTINGS ===== */}
        {view === "settings" && (<>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: ff.display, fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
            <p style={{ fontSize: 14, color: t.inkMuted }}>Manage your account.</p>
          </div>

          {/* Account */}
          <div style={{ background: t.paper, borderRadius: 10, border: "1.5px solid " + t.lineMed, padding: 24, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: t.inkMuted, marginBottom: 14 }}>Account</div>
            <div style={{ fontSize: 14, color: t.inkMuted, marginBottom: 6 }}>{"Email: "}<span style={{ color: t.ink, fontWeight: 500 }}>{user.email}</span></div>
            <div style={{ fontSize: 14, color: t.inkMuted }}>{"Plan: "}<span style={{ color: t.vermillion, fontWeight: 600, textTransform: "capitalize" }}>{planName + " — £" + (PLANS.find(p => p.id === planName)?.price || 12) + "/month"}</span></div>
          </div>

          {/* Brand Voice */}
          <div style={{ background: t.paper, borderRadius: 10, border: "1.5px solid " + t.lineMed, padding: 24, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: t.inkMuted, marginBottom: 14 }}>Brand Voice</div>
            <p style={{ fontSize: 13, color: t.inkMuted, marginBottom: 10, lineHeight: 1.5 }}>Describe your brand's tone so outputs match your voice.</p>
            <Input type="textarea" value={brandVoice} onChange={e => setBrandVoice(e.target.value)} placeholder="e.g. Authoritative but approachable. No jargon. Concrete examples." rows={3} />
            <Btn size="sm" onClick={saveBrandVoice}>Save</Btn>
          </div>

          {/* Upgrade / Billing */}
          <div style={{ background: t.paper, borderRadius: 10, border: "1.5px solid " + t.lineMed, padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: t.inkMuted, marginBottom: 14 }}>Billing</div>
            {profile?.stripe_customer_id ? (
              <Btn variant="secondary" size="sm" onClick={async () => {
                const res = await fetch("/api/billing-portal", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + (await supabase.auth.getSession()).data.session?.access_token,
                  },
                })
                const data = await res.json()
                if (data.url) window.location.href = data.url
              }}>{"Manage billing →"}</Btn>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: t.inkMuted, marginBottom: 12 }}>Choose a plan to unlock more blasts.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {PLANS.map(plan => (
                    <Btn key={plan.id} variant={plan.popular ? "primary" : "secondary"} size="sm" onClick={() => handleCheckout(plan.id)}>
                      {plan.name + " — £" + plan.price + "/mo"}
                    </Btn>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>)}
      </main>
    </div>
  )
}

// ============== APP ROOT ==============

export default function App() {
  const [page, setPage] = useState("loading")
  const [authMode, setAuthMode] = useState("signup")
  const [user, setUser] = useState(null)

  const checkPaidStatus = async (sessionUser) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_subscription_id, plan")
      .eq("id", sessionUser.id)
      .single()

    if (profile?.stripe_subscription_id) {
      setPage("dashboard")
    } else {
      setPage("paywall")
    }
  }

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        checkPaidStatus(session.user)
      } else {
        setPage("landing")
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        checkPaidStatus(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setPage("landing")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Check for successful checkout return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("checkout") === "success" && user) {
      // Give Stripe webhook a moment to process, then re-check
      setTimeout(() => checkPaidStatus(user), 2000)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [user])

  if (page === "loading") {
    return (
      <div style={{ background: t.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff.body }}>
        <div style={{ textAlign: "center" }}>
          <Logo />
          <div style={{ width: 24, height: 24, border: "2px solid " + t.lineMed, borderTop: "2px solid " + t.vermillion, borderRadius: "50%", margin: "20px auto", animation: "spin 0.7s linear infinite" }} />
        </div>
      </div>
    )
  }

  if (page === "landing") {
    return <LandingPage onGetStarted={() => { setAuthMode("signup"); setPage("auth"); }} onLogin={() => { setAuthMode("login"); setPage("auth"); }} />
  }

  if (page === "auth") {
    return <AuthPage onAuth={(u) => { setUser(u); checkPaidStatus(u); }} mode={authMode} onBack={() => setPage("landing")} />
  }

  if (page === "paywall") {
    return <PaywallPage user={user} onLogout={() => { supabase.auth.signOut(); setUser(null); setPage("landing"); }} onPaid={() => setPage("dashboard")} />
  }

  return <Dashboard user={user} onLogout={() => { setUser(null); setPage("landing"); }} />
}
