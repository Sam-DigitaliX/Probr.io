"use client";

import Link from "next/link";
import {
  Shield,
  Activity,
  Bell,
  Globe,
  BarChart3,
  ArrowRight,
  Server,
  Eye,
  Lock,
  Star,
  BadgeCheck,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Probe Monitoring",
    description:
      "Automated health checks on your sGTM, GTM containers, GA4 properties, and BigQuery pipelines.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Get notified via Slack or email the moment something breaks — before your clients notice.",
  },
  {
    icon: BarChart3,
    title: "Data Volume Anomalies",
    description:
      "Detect unexpected drops or spikes in event volumes across your tracking infrastructure.",
  },
  {
    icon: Server,
    title: "sGTM Infrastructure",
    description:
      "Monitor Stape and Addingwell container health, response times, and availability.",
  },
  {
    icon: Eye,
    title: "Tag Verification",
    description:
      "Headless browser checks to verify tags fire correctly on your client websites.",
  },
  {
    icon: Lock,
    title: "CMP Compliance",
    description:
      "Ensure consent banners load properly and consent signals are correctly propagated.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime monitoring" },
  { value: "<30s", label: "Alert latency" },
  { value: "7", label: "Probe types" },
  { value: "24/7", label: "Automated checks" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ── Navbar ────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient-primary">
              Probr
            </span>
          </Link>

          {/* Nav pill (desktop) */}
          <div className="hidden md:flex items-center rounded-full border border-black/[0.08] bg-black/[0.04] px-1 py-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="px-4 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="px-4 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              How it works
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — Glass Panel Bottom ──────────────────── */}
      <div className="mx-3 md:mx-6">
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden rounded-b-[40px] bg-white/40 backdrop-blur-xl border border-[hsl(262_40%_50%/0.10)] border-t-0 shadow-[0_4px_40px_hsl(262_40%_30%/0.06)]">
          {/* Internal gradient overlay */}
          <div
            className="absolute inset-0 rounded-b-[40px]"
            style={{
              background:
                "linear-gradient(180deg, hsl(262 83% 58% / 0.10) 0%, hsl(262 83% 58% / 0.04) 40%, transparent 70%)",
            }}
          />

          {/* Luminous liseré bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.30) 30%, hsl(188 94% 43% / 0.30) 70%, transparent)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Animated badge with pulsing dot */}
            <div className="relative inline-flex mb-8 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-md" />
              <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-sm border border-primary/20 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-gradient-primary">
                  Monitoring for tracking infrastructure
                </span>
              </div>
            </div>

            {/* Headline with gradient */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up animate-delay-100">
              Never miss a{" "}
              <span className="text-gradient-primary">tracking failure</span>{" "}
              again
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
              Probr monitors your entire tracking stack — sGTM, GTM, GA4,
              BigQuery, CMP — and alerts you instantly when something breaks.
              Built for agencies managing multiple client setups.
            </p>

            <div className="flex items-center justify-center gap-4 mt-10 animate-fade-in-up animate-delay-300">
              <Link
                href="/signup"
                className="ev-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-lg shadow-primary/25"
              >
                Start Monitoring
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/50 transition-all"
              >
                Log in to Dashboard
              </Link>
            </div>

            {/* Social proof — stars + verified badge */}
            <div className="flex items-center justify-center gap-3 mt-8 animate-fade-in-up animate-delay-400">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-foreground">
                  4.75/5
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i <= 4
                          ? "fill-amber-400 text-amber-400"
                          : "fill-amber-400/70 text-amber-400/70"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">–</span>
              <span className="text-sm text-muted-foreground">32 avis</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="relative py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gradient-primary">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <span className="glass-badge px-4 py-1.5">
                <span className="text-gradient-primary">Features</span>
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-gradient-primary">monitor tracking</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From health checks to consent verification, Probr covers
              every layer of your client tracking infrastructure.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group glass-card-interactive p-6 animate-fade-in-up animate-delay-${
                  ((i % 6) + 1) * 100
                }`}
              >
                {/* Icon container — gradient stroke → solid gradient fill on group hover */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.06] border border-primary/[0.08] mb-4 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent group-hover:scale-110">
                  <feature.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <span className="glass-badge px-4 py-1.5">
                <span className="text-gradient-primary">Getting Started</span>
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Up and running in{" "}
              <span className="text-gradient-primary">minutes</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Add your clients",
                description:
                  "Register your client organizations and their websites in the dashboard.",
              },
              {
                step: "2",
                title: "Configure probes",
                description:
                  "Set up monitoring probes for each site — health checks, tag verification, data volumes.",
              },
              {
                step: "3",
                title: "Get alerted",
                description:
                  "Receive instant Slack or email notifications when issues are detected.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`text-center animate-fade-in-up animate-delay-${
                  (i + 1) * 100
                }`}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-lg mb-4 shadow-lg shadow-primary/20">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — Glass Panel Top + Fade-to-Footer ────── */}
      <div className="relative mx-4 md:mx-8 mt-16">
        <div
          className="relative rounded-t-[40px] pt-16 md:pt-24 px-4 md:px-8 lg:px-20 pb-20 md:pb-28 bg-white/40 backdrop-blur-xl border border-[hsl(262_40%_50%/0.10)] border-b-0 shadow-[0_-4px_40px_hsl(262_40%_30%/0.06)]"
          style={{
            maskImage:
              "linear-gradient(to bottom, black calc(100% - 60px), transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black calc(100% - 60px), transparent)",
          }}
        >
          {/* Luminous liseré top */}
          <div
            className="absolute inset-x-0 top-0 h-px rounded-t-[40px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.30) 30%, hsl(262 83% 58% / 0.40) 50%, hsl(262 83% 58% / 0.30) 70%, transparent)",
            }}
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <Globe className="h-10 w-10 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to protect your tracking?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Stop discovering tracking failures from angry clients. Start
              monitoring proactively with Probr.
            </p>
            <Link
              href="/signup"
              className="ev-btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold shadow-lg shadow-primary/25"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer (no top border — receives CTA fade) ── */}
      <footer className="py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-secondary">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gradient-primary">
              Probr
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Built by DigitaliX</p>
        </div>
      </footer>
    </div>
  );
}
