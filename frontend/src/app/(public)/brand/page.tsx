import {
  Shield,
  ArrowRight,
  Activity,
  Bell,
  BarChart3,
  Copy,
} from "lucide-react";

/* ── Color swatches data ──────────────────────────────── */
const brandColors = [
  { name: "Purple", hex: "#833AB4", hsl: "hsl(276 51% 47%)", token: "--color-primary" },
  { name: "Red", hex: "#FD1D1D", hsl: "hsl(0 98% 55%)", token: "--color-accent" },
  { name: "Orange", hex: "#FCB045", hsl: "hsl(35 97% 63%)", token: "--color-secondary" },
];

const surfaceColors = [
  { name: "Background", hsl: "hsl(240 15% 6%)", token: "--color-background", light: false },
  { name: "Foreground", hsl: "hsl(0 0% 95%)", token: "--color-foreground", light: true },
  { name: "Card", hsl: "hsl(0 0% 100% / 0.04)", token: "--color-card", light: false },
  { name: "Muted", hsl: "hsl(240 10% 12%)", token: "--color-muted", light: false },
  { name: "Border", hsl: "hsl(0 0% 100% / 0.08)", token: "--color-border", light: false },
];

const semanticColors = [
  { name: "Success", hsl: "hsl(142 71% 45%)", token: "--color-success" },
  { name: "Warning", hsl: "hsl(38 92% 50%)", token: "--color-warning" },
  { name: "Destructive", hsl: "hsl(0 84.2% 60.2%)", token: "--color-destructive" },
];

/* ── Section wrapper ──────────────────────────────────── */
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-16 border-b border-white/[0.06] last:border-b-0">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-10">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ── Code block ───────────────────────────────────────── */
function Code({ children }: { children: string }) {
  return (
    <code className="inline-block px-2 py-0.5 rounded-md bg-white/[0.06] text-sm font-mono text-foreground/80">
      {children}
    </code>
  );
}

export default function BrandPage() {
  return (
    <div className="min-h-screen pt-12 pb-24">
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">

        {/* ── Header ──────────────────────────────────────── */}
        <header className="pt-16 pb-12 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-primary">
                Probr
              </h1>
              <p className="text-sm text-muted-foreground">Brand Kit — Internal</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl leading-relaxed">
            Design system reference for Probr. This page is not indexed or linked.
            Updated with every style change.
          </p>

          {/* TOC */}
          <nav className="flex flex-wrap gap-2 mt-8">
            {["colors", "gradient", "typography", "buttons", "glass", "liseres", "orbs", "tokens"].map((s) => (
              <a
                key={s}
                href={`#${s}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-colors capitalize"
              >
                {s}
              </a>
            ))}
          </nav>
        </header>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ── COLORS ──────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════ */}
        <Section id="colors" title="Brand Colors">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {brandColors.map((c) => (
              <div key={c.name} className="glass-card overflow-hidden">
                <div className="h-28" style={{ background: c.hex }} />
                <div className="p-4">
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{c.hex}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.hsl}</p>
                  <p className="text-xs text-muted-foreground mt-1"><Code>{c.token}</Code></p>
                </div>
              </div>
            ))}
          </div>

          {/* Surfaces */}
          <h3 className="text-lg font-semibold mt-10 mb-4">Surfaces</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {surfaceColors.map((c) => (
              <div key={c.name} className="glass-card p-3">
                <div
                  className="h-14 rounded-lg mb-3 border border-white/[0.06]"
                  style={{ background: c.hsl }}
                />
                <p className="text-xs font-medium">{c.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5 break-all">{c.hsl}</p>
              </div>
            ))}
          </div>

          {/* Semantic */}
          <h3 className="text-lg font-semibold mt-10 mb-4">Semantic</h3>
          <div className="grid grid-cols-3 gap-3">
            {semanticColors.map((c) => (
              <div key={c.name} className="glass-card p-3">
                <div
                  className="h-10 rounded-lg mb-3"
                  style={{ background: c.hsl }}
                />
                <p className="text-xs font-medium">{c.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{c.hsl}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ── GRADIENT ────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════ */}
        <Section id="gradient" title="Brand Gradient">
          {/* Full gradient bar */}
          <div className="rounded-2xl h-20 mb-6" style={{
            background: "linear-gradient(90deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)"
          }} />

          <div className="glass-card p-5 font-mono text-sm leading-relaxed">
            <p className="text-muted-foreground mb-1">/* CSS */</p>
            <p>background: <span className="text-foreground">#833AB4</span>;</p>
            <p>background: linear-gradient(90deg,</p>
            <p className="pl-6"><span style={{ color: "#833AB4" }}>rgba(131, 58, 180, 1)</span> 0%,</p>
            <p className="pl-6"><span style={{ color: "#FD1D1D" }}>rgba(253, 29, 29, 1)</span> 50%,</p>
            <p className="pl-6"><span style={{ color: "#FCB045" }}>rgba(252, 176, 69, 1)</span> 100%);</p>
          </div>

          {/* Gradient directions */}
          <h3 className="text-lg font-semibold mt-10 mb-4">Directions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "90deg (brand)", angle: "90deg" },
              { label: "135deg (primary)", angle: "135deg" },
              { label: "180deg (vertical)", angle: "180deg" },
              { label: "45deg (diagonal)", angle: "45deg" },
            ].map((g) => (
              <div key={g.label} className="text-center">
                <div
                  className="h-20 rounded-xl mb-2"
                  style={{
                    background: `linear-gradient(${g.angle}, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)`,
                  }}
                />
                <p className="text-xs text-muted-foreground">{g.label}</p>
              </div>
            ))}
          </div>

          {/* Text gradient */}
          <h3 className="text-lg font-semibold mt-10 mb-4">Text Gradient</h3>
          <p className="text-4xl md:text-5xl font-bold text-gradient-primary">
            Probr Monitoring
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Class: <Code>.text-gradient-primary</Code>
          </p>
        </Section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ── TYPOGRAPHY ──────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════ */}
        <Section id="typography" title="Typography">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Display font */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Display — Space Grotesk</p>
              <div className="space-y-3">
                <p className="text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  Aa Bb Cc
                </p>
                <p className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  The quick brown fox
                </p>
                <p className="text-xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                </p>
                <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  abcdefghijklmnopqrstuvwxyz 0123456789
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-mono">
                --font-display: &quot;Space Grotesk&quot;
              </p>
            </div>

            {/* Body font */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Body — Inter</p>
              <div className="space-y-3">
                <p className="text-5xl font-bold" style={{ fontFamily: "var(--font-sans)" }}>
                  Aa Bb Cc
                </p>
                <p className="text-3xl font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                  The quick brown fox
                </p>
                <p className="text-xl font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                </p>
                <p className="text-lg" style={{ fontFamily: "var(--font-sans)" }}>
                  abcdefghijklmnopqrstuvwxyz 0123456789
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-mono">
                --font-sans: &quot;Inter&quot;
              </p>
            </div>
          </div>

          {/* Heading scale */}
          <h3 className="text-lg font-semibold mt-12 mb-6">Heading Scale</h3>
          <div className="space-y-6 glass-card p-6">
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-12 shrink-0">H1</span>
              <p className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">Heading One</p>
            </div>
            <div className="border-t border-white/[0.04]" />
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-12 shrink-0">H2</span>
              <p className="text-3xl md:text-4xl font-bold tracking-tight">Heading Two</p>
            </div>
            <div className="border-t border-white/[0.04]" />
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-12 shrink-0">H3</span>
              <p className="text-xl md:text-2xl font-semibold">Heading Three</p>
            </div>
            <div className="border-t border-white/[0.04]" />
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-12 shrink-0">H4</span>
              <p className="text-lg font-semibold">Heading Four</p>
            </div>
            <div className="border-t border-white/[0.04]" />
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-12 shrink-0">Body</span>
              <p className="text-base" style={{ fontFamily: "var(--font-sans)" }}>Body text in Inter — regular 400. Used for paragraphs, descriptions, and general content.</p>
            </div>
            <div className="border-t border-white/[0.04]" />
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-12 shrink-0">Small</span>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>Small muted text — labels, captions, metadata.</p>
            </div>
            <div className="border-t border-white/[0.04]" />
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-12 shrink-0">Mono</span>
              <p className="text-sm font-mono">const probe = await monitor.check()</p>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ── BUTTONS ─────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════ */}
        <Section id="buttons" title="Buttons">
          <div className="space-y-8">
            {/* Row 1 — all variants */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="ev-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold">
                Primary Gradient
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="ev-btn-glass inline-flex items-center gap-2 px-6 py-3 text-sm">
                Glass
              </button>
              <button className="ev-btn-outline inline-flex items-center gap-2 px-6 py-3 text-sm">
                Outline
              </button>
              <button className="ev-btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm">
                Secondary
              </button>
            </div>

            {/* Labels */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Primary Gradient", cls: ".ev-btn-primary", desc: "Main CTA, hero, signup" },
                { name: "Glass", cls: ".ev-btn-glass", desc: "Secondary actions, modals" },
                { name: "Outline", cls: ".ev-btn-outline", desc: "Tertiary, cancel, back" },
                { name: "Secondary", cls: ".ev-btn-secondary", desc: "Dashboard actions" },
              ].map((b) => (
                <div key={b.name} className="glass-card p-4">
                  <p className="text-sm font-semibold mb-1">{b.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{b.desc}</p>
                  <Code>{b.cls}</Code>
                </div>
              ))}
            </div>

            {/* Sizes */}
            <h3 className="text-lg font-semibold mt-4">Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <button className="ev-btn-primary px-4 py-2 text-xs font-semibold rounded-lg">
                Small
              </button>
              <button className="ev-btn-primary px-6 py-3 text-sm font-semibold">
                Default
              </button>
              <button className="ev-btn-primary px-8 py-3.5 text-base font-semibold">
                Large
              </button>
            </div>

            {/* Disabled */}
            <h3 className="text-lg font-semibold mt-4">States</h3>
            <div className="flex flex-wrap items-center gap-4">
              <button className="ev-btn-primary px-6 py-3 text-sm font-semibold opacity-50 cursor-not-allowed" disabled>
                Disabled
              </button>
              <button className="ev-btn-glass px-6 py-3 text-sm opacity-50 cursor-not-allowed" disabled>
                Disabled Glass
              </button>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ── GLASS COMPONENTS ────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════ */}
        <Section id="glass" title="Glass Components">
          {/* Cards row */}
          <h3 className="text-lg font-semibold mb-4">Cards</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Static */}
            <div className="glass-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.06] border border-primary/[0.08] mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Glass Card</h4>
              <p className="text-sm text-muted-foreground">Static card with glass background and subtle highlight overlay.</p>
              <p className="text-xs text-muted-foreground mt-3"><Code>.glass-card</Code></p>
            </div>

            {/* Interactive */}
            <div className="group glass-card-interactive p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.06] border border-primary/[0.08] mb-4 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent group-hover:scale-110">
                <Bell className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h4 className="font-semibold mb-1">Interactive Card</h4>
              <p className="text-sm text-muted-foreground">Hover for lift, glow border, and icon gradient fill.</p>
              <p className="text-xs text-muted-foreground mt-3"><Code>.glass-card-interactive</Code></p>
            </div>

            {/* Animated border */}
            <div className="ev-card p-6">
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.06] border border-primary/[0.08] mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">Ev Card</h4>
                <p className="text-sm text-muted-foreground">Animated conic-gradient spinning border.</p>
                <p className="text-xs text-muted-foreground mt-3"><Code>.ev-card</Code></p>
              </div>
            </div>
          </div>

          {/* Badge */}
          <h3 className="text-lg font-semibold mb-4">Badges</h3>
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <span className="glass-badge px-4 py-1.5">
              <span className="text-gradient-primary">Features</span>
            </span>
            <span className="glass-badge px-4 py-1.5">
              <span className="text-gradient-primary">New</span>
            </span>
            <span className="glass-badge px-4 py-1.5 text-foreground/80">
              Beta
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-10"><Code>.glass-badge</Code> — Pill with glass bg, white/0.15 border, subtle glow</p>

          {/* Input */}
          <h3 className="text-lg font-semibold mb-4">Input</h3>
          <div className="max-w-sm mb-4">
            <input
              type="text"
              placeholder="you@company.com"
              className="ev-input w-full px-4 py-2.5 text-sm"
              readOnly
            />
          </div>
          <p className="text-xs text-muted-foreground"><Code>.ev-input</Code> — Glass bg, blur, focus ring in primary color</p>
        </Section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ── LISERÉS ─────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════ */}
        <Section id="liseres" title="Liserés">
          <p className="text-muted-foreground mb-6">1px gradient lines used as section separators. Tri-color brand gradient with transparent fade on both ends.</p>

          <div className="space-y-8">
            <div>
              <p className="text-xs text-muted-foreground mb-3">Standard liseré</p>
              <div
                className="h-px"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(276 51% 47% / 0.30) 20%, hsl(0 98% 55% / 0.25) 50%, hsl(35 97% 63% / 0.30) 80%, transparent)",
                }}
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-3">Intense liseré</p>
              <div
                className="h-px"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(276 51% 47% / 0.5) 20%, hsl(0 98% 55% / 0.45) 50%, hsl(35 97% 63% / 0.5) 80%, transparent)",
                }}
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-3">2px glow liseré</p>
              <div
                className="h-0.5 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, #833AB4 20%, #FD1D1D 50%, #FCB045 80%, transparent)",
                  boxShadow: "0 0 12px hsl(0 98% 55% / 0.3)",
                }}
              />
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ── ORBS ────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════ */}
        <Section id="orbs" title="Ambient Orbs">
          <p className="text-muted-foreground mb-6">
            5 blurred orbs positioned behind all content at <Code>z-0</Code>.
            They create the ambient glassmorphism atmosphere.
          </p>

          <div className="grid grid-cols-5 gap-4">
            {[
              { name: "Purple", hsl: "hsl(276 51% 47%)", opacity: "18%", pos: "top-left" },
              { name: "Orange", hsl: "hsl(35 97% 63%)", opacity: "16%", pos: "upper-right" },
              { name: "Red", hsl: "hsl(0 98% 55%)", opacity: "14%", pos: "mid-left" },
              { name: "Purple", hsl: "hsl(276 51% 47%)", opacity: "16%", pos: "lower-right" },
              { name: "Orange", hsl: "hsl(35 97% 63%)", opacity: "12%", pos: "bottom-left" },
            ].map((orb, i) => (
              <div key={i} className="text-center">
                <div
                  className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full blur-[8px] mb-3"
                  style={{ background: orb.hsl }}
                />
                <p className="text-xs font-medium">{orb.name}</p>
                <p className="text-[10px] text-muted-foreground">{orb.opacity} · {orb.pos}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Component: <Code>EvervaultGlow</Code> in <Code>components/ui/evervault-glow.tsx</Code>
          </p>
        </Section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ── TOKENS ──────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════ */}
        <Section id="tokens" title="Design Tokens">
          {/* Spacing */}
          <h3 className="text-lg font-semibold mb-4">Radius</h3>
          <div className="flex items-end gap-6 mb-10">
            {[
              { name: "sm", value: "8px", px: 8 },
              { name: "md", value: "10px", px: 10 },
              { name: "lg", value: "12px", px: 12 },
              { name: "xl", value: "16px", px: 16 },
              { name: "2xl", value: "40px", px: 40 },
              { name: "full", value: "9999px", px: 9999 },
            ].map((r) => (
              <div key={r.name} className="text-center">
                <div
                  className="w-16 h-16 bg-white/[0.06] border border-white/[0.10] mb-2"
                  style={{ borderRadius: `${r.px}px` }}
                />
                <p className="text-xs font-medium">{r.name}</p>
                <p className="text-[10px] text-muted-foreground">{r.value}</p>
              </div>
            ))}
          </div>

          {/* Shadows */}
          <h3 className="text-lg font-semibold mb-4">Shadows & Glows</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              { name: "Card", cls: "shadow-card" },
              { name: "Glow Primary", cls: "glow-primary" },
              { name: "Glow Secondary", cls: "glow-secondary" },
              { name: "Glow Static", cls: "glow-static" },
            ].map((s) => (
              <div key={s.name} className="text-center">
                <div className={`w-20 h-20 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] mb-3 ${s.cls}`} />
                <p className="text-xs font-medium">{s.name}</p>
                <p className="text-[10px] text-muted-foreground"><Code>{`.${s.cls}`}</Code></p>
              </div>
            ))}
          </div>

          {/* Z-index */}
          <h3 className="text-lg font-semibold mb-4">Z-Layering</h3>
          <div className="glass-card p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-white/[0.06]">
                  <th className="pb-3 pr-6">Layer</th>
                  <th className="pb-3 pr-6">z-index</th>
                  <th className="pb-3 pr-6">Position</th>
                  <th className="pb-3">Element</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  ["Orbs", "z-0", "fixed", "EvervaultGlow"],
                  ["Content", "z-[1]", "relative", "Page wrapper"],
                  ["Navbar", "z-50", "fixed", "Top navigation"],
                ].map(([layer, z, pos, el]) => (
                  <tr key={layer} className="ev-table-row">
                    <td className="py-3 pr-6 font-medium">{layer}</td>
                    <td className="py-3 pr-6 font-mono text-xs">{z}</td>
                    <td className="py-3 pr-6 text-muted-foreground">{pos}</td>
                    <td className="py-3 text-muted-foreground">{el}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Animations */}
          <h3 className="text-lg font-semibold mt-10 mb-4">Animations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "fade-in-up", dur: "0.8s", cls: "animate-fade-in-up" },
              { name: "scale-in", dur: "0.6s", cls: "animate-scale-in" },
              { name: "float", dur: "6s", cls: "animate-float" },
              { name: "glow-pulse", dur: "6s", cls: "animate-glow-pulse" },
            ].map((a) => (
              <div key={a.name} className="glass-card p-4 text-center">
                <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-primary to-secondary mb-3 ${a.cls}`} />
                <p className="text-xs font-medium">{a.name}</p>
                <p className="text-[10px] text-muted-foreground">{a.dur}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="pt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Probr Design System — Internal reference.
            See <Code>frontend/DESIGN_SYSTEM.md</Code> for full documentation.
          </p>
        </footer>

      </div>
    </div>
  );
}
