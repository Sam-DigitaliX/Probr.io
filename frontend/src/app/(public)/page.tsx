"use client";

import Link from "next/link";
import {
  Shield,
  Activity,
  Bell,
  Globe,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Server,
  Eye,
  Lock,
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
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient-primary">
              TrackGuard
            </span>
          </Link>
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

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 right-1/4 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8 animate-fade-in-up">
            <Zap className="h-3.5 w-3.5" />
            Monitoring for tracking infrastructure
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] animate-fade-in-up animate-delay-100">
            Never miss a{" "}
            <span className="text-gradient-primary">tracking failure</span>{" "}
            again
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
            TrackGuard monitors your entire tracking stack — sGTM, GTM, GA4,
            BigQuery, CMP — and alerts you instantly when something breaks.
            Built for agencies managing multiple client setups.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10 animate-fade-in-up animate-delay-300">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Start Monitoring
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/50 transition-all"
            >
              Log in to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-4xl px-6 py-12">
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
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-gradient-primary">monitor tracking</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From health checks to consent verification, TrackGuard covers
              every layer of your client tracking infrastructure.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`glass-card p-6 transition-all duration-300 animate-fade-in-up animate-delay-${((i % 6) + 1) * 100}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <feature.icon className="h-5.5 w-5.5 text-primary" />
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
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
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
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
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

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-12">
            <Globe className="h-10 w-10 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to protect your tracking?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Stop discovering tracking failures from angry clients. Start
              monitoring proactively with TrackGuard.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-secondary">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gradient-primary">
              TrackGuard
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built by DigitaliX
          </p>
        </div>
      </footer>
    </div>
  );
}
