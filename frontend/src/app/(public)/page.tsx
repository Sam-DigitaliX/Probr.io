"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
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
  ChevronDown,
  ChevronRight,
  BookOpen,
  ExternalLink,
  Menu,
  X,
  Zap,
  Layers,
  ShieldCheck,
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

const CardBeamSection = dynamic(
  () => import("@/components/CardBeamSection"),
  { ssr: false },
);

const HeartbeatCanvas = dynamic(
  () => import("@/components/HeartbeatCanvas"),
  { ssr: false },
);

const stats = [
  { value: "99.9%", label: "Uptime monitoring", icon: ShieldCheck },
  { value: "<30s", label: "Alert latency", icon: Zap },
  { value: "7", label: "Probe types", icon: Layers },
  { value: "24/7", label: "Automated checks", icon: Activity },
];

/* ──────────────────────── Resources dropdown items ──────────────────────── */

const resourcesItems = [
  {
    icon: BookOpen,
    label: "Documentation",
    description: "Installation & configuration guides for Probr",
    href: "https://docs.probr.io",
    external: true,
  },
];

/* ──────────────────────── MegaLink component ──────────────────────── */

function MegaLink({
  item,
  onClick,
}: {
  item: (typeof resourcesItems)[number];
  onClick?: () => void;
}) {
  const inner = (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors duration-200 group hover:bg-white/[0.04]">
      <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent">
        <item.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
          {item.label}
        </span>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.description}
        </p>
      </div>
      {item.external ? (
        <ExternalLink className="w-4 h-4 text-muted-foreground/50 shrink-0" />
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
      )}
    </div>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onClick}>
      {inner}
    </Link>
  );
}

export default function LandingPage() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* Cleanup timeout on unmount */
  useEffect(() => {
    return () => clearTimeout(closeTimeoutRef.current);
  }, []);

  const openNav = useCallback((id: string) => {
    clearTimeout(closeTimeoutRef.current);
    setOpenDropdown(id);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 250);
  }, []);

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimeoutRef.current);
  }, []);

  const closeDropdown = useCallback(() => setOpenDropdown(null), []);

  const closeMobile = useCallback(() => {
    setIsMobileMenuOpen(false);
    setMobileAccordion(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Navbar ────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/Probr_logo.webp"
              alt="Probr"
              width={160}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* ── Desktop: Nav pill ── */}
          <div className="hidden lg:flex items-center rounded-full border border-white/[0.12] bg-white/[0.07] px-1 py-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              onMouseEnter={() => setOpenDropdown(null)}
            >
              Home
            </Link>
            <Link
              href="#features"
              className="px-4 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              onMouseEnter={() => setOpenDropdown(null)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="px-4 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              onMouseEnter={() => setOpenDropdown(null)}
            >
              How it works
            </Link>

            {/* Resources trigger */}
            <button
              type="button"
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                openDropdown === "ressources"
                  ? "bg-white/[0.08] text-foreground"
                  : "text-foreground/70 hover:text-foreground"
              }`}
              onMouseEnter={() => openNav("ressources")}
              onMouseLeave={scheduleClose}
              onClick={() =>
                openDropdown === "ressources"
                  ? closeDropdown()
                  : openNav("ressources")
              }
            >
              Resources
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === "ressources" ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* ── Desktop: CTA ── */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary via-accent to-secondary px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* ── Mobile: Hamburger ── */}
          <button
            type="button"
            className="lg:hidden text-foreground"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ── Mega Dropdown Panel (desktop) ── */}
        <div
          className={`hidden lg:block absolute left-1/2 -translate-x-1/2 top-16 pt-2 z-50 w-full max-w-[400px] transition-all duration-200 ${
            openDropdown
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {openDropdown === "ressources" && (
              <div className="p-4">
                <p className="px-4 pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Resources
                </p>
                <div className="space-y-0.5">
                  {resourcesItems.map((item) => (
                    <MegaLink
                      key={item.label}
                      item={item}
                      onClick={closeDropdown}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 px-6 border-t border-white/[0.06] bg-white/[0.04] backdrop-blur-2xl">
            <div className="flex flex-col">
              <Link
                href="/"
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={closeMobile}
              >
                Home
              </Link>
              <Link
                href="#features"
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={closeMobile}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={closeMobile}
              >
                How it works
              </Link>

              {/* Resources accordion */}
              <div>
                <button
                  type="button"
                  className="flex items-center justify-between w-full py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() =>
                    setMobileAccordion((prev) =>
                      prev === "ressources" ? null : "ressources"
                    )
                  }
                >
                  Resources
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileAccordion === "ressources" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    mobileAccordion === "ressources"
                      ? "max-h-[400px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pb-2 pl-2 space-y-1">
                    {resourcesItems.map((item) => (
                      <MegaLink
                        key={item.label}
                        item={item}
                        onClick={closeMobile}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA mobile */}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                <Link
                  href="/login"
                  className="py-2.5 text-center text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                  onClick={closeMobile}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="ev-btn-primary inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold w-full"
                  onClick={closeMobile}
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero — Glass Panel Bottom ──────────────────── */}
      <div className="mx-3 md:mx-6">
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden rounded-b-[40px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] border-t-0">
          {/* Internal gradient overlay */}
          <div
            className="absolute inset-0 rounded-b-[40px]"
            style={{
              background:
                "linear-gradient(180deg, hsl(276 51% 47% / 0.12) 0%, hsl(0 98% 55% / 0.05) 40%, transparent 70%)",
            }}
          />

          {/* Heartbeat ECG background — subtle pulse of data monitoring */}
          <HeartbeatCanvas />

          {/* Luminous liseré bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(276 51% 47% / 0.30) 20%, hsl(0 98% 55% / 0.25) 50%, hsl(35 97% 63% / 0.30) 80%, transparent)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Animated badge with pulsing dot */}
            <div className="relative inline-flex mb-8 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-md" />
              <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-primary/30 backdrop-blur-sm">
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
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-6 py-3 text-sm font-semibold text-foreground hover:bg-white/[0.08] transition-all"
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
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Card Beam Carousel ──────────────────────────── */}
      <div className="relative -mt-4 mb-4">
        <div className="text-center pt-16 md:pt-20 pb-2 px-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Full-stack{" "}
            <span className="text-gradient-primary">monitoring coverage</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Every layer of your tracking infrastructure — from uptime probes to
            consent compliance — monitored in real time.
          </p>
        </div>
        <CardBeamSection />
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="relative py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-stat-card group relative p-5 md:p-6 text-center"
              >
                {/* Icon — gradient stroke, inverts to gradient fill on hover */}
                <div className="flex justify-center mb-3">
                  <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/[0.06] border border-primary/[0.08] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent group-hover:scale-110">
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>

                {/* Value */}
                <p className="text-2xl md:text-3xl font-bold text-gradient-primary leading-none">
                  {stat.value}
                </p>

                {/* Label */}
                <p className="mt-2 text-xs md:text-sm text-muted-foreground">
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
          className="relative rounded-t-[40px] pt-16 md:pt-24 px-4 md:px-8 lg:px-20 pb-20 md:pb-28 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] border-b-0"
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
                "linear-gradient(90deg, transparent, hsl(276 51% 47% / 0.3) 20%, hsl(0 98% 55% / 0.35) 50%, hsl(35 97% 63% / 0.3) 80%, transparent)",
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
          <div className="flex items-center">
            <Image
              src="/images/Probr_logo.webp"
              alt="Probr"
              width={90}
              height={30}
              className="h-7 w-auto"
            />
          </div>
          <p className="text-xs text-muted-foreground">Built by DigitaliX</p>
        </div>
      </footer>
    </div>
  );
}
