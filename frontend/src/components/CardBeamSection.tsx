"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface ExpertiseCard {
  title: string;
  subtitle: string;
  viewBox: string;
  iconPath: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  r: number;
  g: number;
  b: number;
  life: number;
}

interface MetalTheme {
  gradient: string;
  border: string;
  shadow: string;
  textColor: string;
  subtitleColor: string;
  iconFill: string;
  accentGradient: string;
}

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */

const CARD_W = 280;
const CARD_H = 380;
const GAP = 28;
const BEAM_STRIP_W = 36; // px — reveal width
const SCROLL_SPEED = 0.45;
const MAX_PARTICLES = 200;

const THEMES: Record<string, MetalTheme> = {
  matte: {
    gradient:
      "linear-gradient(145deg, #18182a 0%, #232340 40%, #1a1a2e 100%)",
    border: "rgba(255,255,255,0.06)",
    shadow: "0 8px 40px rgba(0,0,0,0.45)",
    textColor: "rgba(255,255,255,0.85)",
    subtitleColor: "rgba(255,255,255,0.45)",
    iconFill: "rgba(255,255,255,0.7)",
    accentGradient:
      "linear-gradient(135deg, rgba(131,58,180,0.15), rgba(252,176,69,0.10))",
  },
  platinum: {
    gradient:
      "linear-gradient(145deg, #d4d4e0 0%, #b0b0c0 30%, #e8e8f0 60%, #a0a0b5 100%)",
    border: "rgba(255,255,255,0.35)",
    shadow: "0 8px 40px rgba(0,0,0,0.30)",
    textColor: "rgba(15,15,25,0.85)",
    subtitleColor: "rgba(15,15,25,0.50)",
    iconFill: "rgba(15,15,25,0.65)",
    accentGradient:
      "linear-gradient(135deg, rgba(131,58,180,0.12), rgba(253,29,29,0.08))",
  },
  silver: {
    gradient:
      "linear-gradient(145deg, #2a2a42 0%, #3a3a58 45%, #2a2a42 100%)",
    border: "rgba(255,255,255,0.10)",
    shadow: "0 8px 40px rgba(0,0,0,0.40)",
    textColor: "rgba(255,255,255,0.80)",
    subtitleColor: "rgba(255,255,255,0.40)",
    iconFill: "rgba(255,255,255,0.60)",
    accentGradient:
      "linear-gradient(135deg, rgba(253,29,29,0.10), rgba(252,176,69,0.08))",
  },
  iridescent: {
    gradient: "linear-gradient(145deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)",
    border: "rgba(255,255,255,0.18)",
    shadow: "0 8px 40px rgba(131,58,180,0.35)",
    textColor: "rgba(255,255,255,0.95)",
    subtitleColor: "rgba(255,255,255,0.70)",
    iconFill: "rgba(255,255,255,0.90)",
    accentGradient:
      "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
  },
};

const THEME_KEYS = Object.keys(THEMES);

const CARDS: ExpertiseCard[] = [
  {
    title: "Uptime Probes",
    subtitle: "HTTP · TCP · ICMP",
    viewBox: "0 0 24 24",
    iconPath:
      "M22 12h-4l-3 9L9 3l-3 9H2",
  },
  {
    title: "Smart Alerts",
    subtitle: "Slack · Email · Webhook",
    viewBox: "0 0 24 24",
    iconPath:
      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  },
  {
    title: "SSL Monitoring",
    subtitle: "Certificate & expiry",
    viewBox: "0 0 24 24",
    iconPath:
      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  {
    title: "sGTM Health",
    subtitle: "Stape · Addingwell",
    viewBox: "0 0 24 24",
    iconPath:
      "M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z M8 6v12 M16 6v12 M2 12h20",
  },
  {
    title: "Tag Verification",
    subtitle: "Headless browser checks",
    viewBox: "0 0 24 24",
    iconPath:
      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  },
  {
    title: "Data Volumes",
    subtitle: "Anomaly detection",
    viewBox: "0 0 24 24",
    iconPath: "M18 20V10 M12 20V4 M6 20v-6",
  },
  {
    title: "CMP Compliance",
    subtitle: "Consent verification",
    viewBox: "0 0 24 24",
    iconPath:
      "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  },
  {
    title: "GA4 Pipeline",
    subtitle: "Event flow monitor",
    viewBox: "0 0 24 24",
    iconPath:
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  },
];

/* ── Code snippets for reveal ────────────────────────── */

const CODE_SNIPPETS = [
  'const probe = await monitor.check("api.example.com");',
  'if (res.status !== 200) alert.fire({ level: "critical" });',
  "const ssl = await cert.verify({ domain, threshold: 14 });",
  'await webhook.send({ channel: "slack", payload: incident });',
  "const latency = performance.measure('probe-rtt');",
  "setInterval(() => probe.ping(), 30_000);",
  'const gtm = await headless.verifyTag("GTM-XXXXX");',
  "if (volume.delta > 0.25) anomaly.flag(stream);",
  'const cmp = consent.audit({ gdpr: true, tcf: "2.2" });',
  "await pipeline.validate(ga4.events, bigquery.schema);",
  "for (const site of client.sites) await runProbe(site);",
  'const health = { status: "ok", latency: 42, ts: Date.now() };',
  "export const config = { interval: 60, retries: 3 };",
  "db.alerts.insertOne({ probe, severity, createdAt });",
  'if (!consent.valid) log.warn("CMP banner missing");',
  "const events = await ga4.realtime.query({ property });",
];

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

function generateCodeLines(count: number): string[] {
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    lines.push(CODE_SNIPPETS[i % CODE_SNIPPETS.length]);
  }
  return lines;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function brandColor(): { r: number; g: number; b: number } {
  const pick = Math.random();
  if (pick < 0.33) return { r: 131, g: 58, b: 180 }; // purple
  if (pick < 0.66) return { r: 253, g: 29, b: 29 }; // red
  return { r: 252, g: 176, b: 69 }; // orange
}

/* ═══════════════════════════════════════════════════════════════════
   CodeReveal — The ASCII layer revealed by the beam
   ═══════════════════════════════════════════════════════════════════ */

const codeLines = generateCodeLines(28);

function CodeReveal() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0a0a14",
        borderRadius: 16,
        overflow: "hidden",
        padding: "14px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {codeLines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            lineHeight: "13px",
            color: `hsl(${160 + (i * 7) % 80} 55% ${50 + (i * 3) % 20}%)`,
            whiteSpace: "nowrap",
            opacity: 0.85,
          }}
        >
          <span style={{ color: "rgba(131,58,180,0.5)", marginRight: 6 }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          {line}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MetalCard — Individual card with metallic surface
   ═══════════════════════════════════════════════════════════════════ */

function MetalCard({
  card,
  themeKey,
  index,
}: {
  card: ExpertiseCard;
  themeKey: string;
  index: number;
}) {
  const theme = THEMES[themeKey];
  const cardNum = String(index + 1).padStart(2, "0");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: theme.gradient,
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "28px 24px 20px",
      }}
    >
      {/* Metallic sheen overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.04) 45%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Accent bar top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: 1,
          background: theme.accentGradient,
        }}
      />

      {/* Top — icon + title */}
      <div style={{ position: "relative" }}>
        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <svg
            width={26}
            height={26}
            viewBox={card.viewBox}
            fill="none"
            stroke={theme.iconFill}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={card.iconPath} />
          </svg>
        </div>

        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: theme.textColor,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            fontSize: 12,
            color: theme.subtitleColor,
            margin: "4px 0 0",
            letterSpacing: "0.02em",
          }}
        >
          {card.subtitle}
        </p>
      </div>

      {/* Separator */}
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(131,58,180,0.2) 30%, rgba(253,29,29,0.15) 60%, transparent)",
          margin: "auto 0",
        }}
      />

      {/* Bottom — branding */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              background:
                "linear-gradient(135deg, #833AB4, #FD1D1D, #FCB045)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            PROBR
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: theme.subtitleColor }}>
            #{cardNum}
          </span>
          <span
            style={{
              fontSize: 9,
              color: theme.subtitleColor,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {themeKey}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main — CardBeamSection
   ═══════════════════════════════════════════════════════════════════ */

export default function CardBeamSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollXRef = useRef(0);
  const isVisibleRef = useRef<boolean>(false);
  const rafRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const codeLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [, forceRender] = useState(0);

  /* Triple the cards for seamless loop */
  const tripled = [...CARDS, ...CARDS, ...CARDS];
  const singleWidth = CARDS.length * (CARD_W + GAP);

  /* ── Beam drawing ────────────────────────────────────── */

  const drawBeam = useCallback(
    (beamX: number, sectionH: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Main beam line ---
      const grad = ctx.createLinearGradient(0, 0, 0, sectionH);
      grad.addColorStop(0, "rgba(131,58,180,0)");
      grad.addColorStop(0.15, "rgba(131,58,180,0.6)");
      grad.addColorStop(0.4, "rgba(253,29,29,0.8)");
      grad.addColorStop(0.6, "rgba(253,29,29,0.8)");
      grad.addColorStop(0.85, "rgba(252,176,69,0.6)");
      grad.addColorStop(1, "rgba(252,176,69,0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(beamX, 0);
      ctx.lineTo(beamX, sectionH);
      ctx.stroke();

      // --- Glow ---
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowColor = "rgba(131,58,180,0.5)";
      ctx.shadowBlur = 30;
      ctx.strokeStyle = "rgba(131,58,180,0.15)";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(beamX, 0);
      ctx.lineTo(beamX, sectionH);
      ctx.stroke();
      ctx.restore();

      // --- Particles ---
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.life <= 0) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gravity
        p.life -= 1;
        p.opacity = Math.max(0, p.life / 80);

        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [],
  );

  /* ── Particle emitter ───────────────────────────────── */

  const emitParticles = useCallback((x: number, yMin: number, yMax: number) => {
    const pool = particlesRef.current;
    let emitted = 0;
    for (let i = 0; i < pool.length && emitted < 3; i++) {
      if (pool[i].life <= 0) {
        const c = brandColor();
        pool[i] = {
          x,
          y: lerp(yMin, yMax, Math.random()),
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 1.2 + Math.random() * 2,
          opacity: 1,
          r: c.r,
          g: c.g,
          b: c.b,
          life: 40 + Math.random() * 50,
        };
        emitted++;
      }
    }
  }, []);

  /* ── Animation loop ─────────────────────────────────── */

  const animate = useCallback(() => {
    if (!sectionRef.current || !trackRef.current) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    if (!isVisibleRef.current) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // Auto-scroll
    if (!isDraggingRef.current) {
      scrollXRef.current += SCROLL_SPEED;
    }

    // Loop
    if (scrollXRef.current >= singleWidth) {
      scrollXRef.current -= singleWidth;
    }
    if (scrollXRef.current < 0) {
      scrollXRef.current += singleWidth;
    }

    // Move track
    trackRef.current.style.transform = `translateX(${-scrollXRef.current}px)`;

    // Beam center (fixed at section center)
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const beamX = sectionRect.width / 2;
    const sectionH = sectionRect.height;

    // Resize canvas if needed
    const canvas = canvasRef.current;
    if (canvas) {
      if (
        canvas.width !== sectionRect.width ||
        canvas.height !== sectionRect.height
      ) {
        canvas.width = sectionRect.width;
        canvas.height = sectionRect.height;
      }
    }

    // Track offset in section (track is shifted left by padding)
    const trackLeft = -scrollXRef.current;

    // Card Y offset (cards are vertically centered)
    const cardTopInSection = (sectionH - CARD_H) / 2;

    // Update each card's code reveal
    for (let i = 0; i < tripled.length; i++) {
      const codeLayer = codeLayerRefs.current[i];
      const glowLayer = glowLayerRefs.current[i];
      if (!codeLayer) continue;

      const cardLeft = trackLeft + i * (CARD_W + GAP);
      const cardRight = cardLeft + CARD_W;

      if (beamX >= cardLeft && beamX <= cardRight) {
        const relativeX = beamX - cardLeft;
        const halfStrip = BEAM_STRIP_W / 2;
        const clipLeft = Math.max(0, relativeX - halfStrip);
        const clipRight = Math.min(CARD_W, relativeX + halfStrip);
        const leftPct = (clipLeft / CARD_W) * 100;
        const rightPct = ((CARD_W - clipRight) / CARD_W) * 100;

        codeLayer.style.clipPath = `inset(0 ${rightPct}% 0 ${leftPct}%)`;
        codeLayer.style.opacity = "1";

        if (glowLayer) {
          glowLayer.style.opacity = "1";
          glowLayer.style.left = `${relativeX - 20}px`;
        }

        // Emit particles at intersection
        emitParticles(
          beamX,
          cardTopInSection,
          cardTopInSection + CARD_H,
        );
      } else {
        codeLayer.style.clipPath = "inset(0 50% 0 50%)";
        codeLayer.style.opacity = "0";
        if (glowLayer) {
          glowLayer.style.opacity = "0";
        }
      }
    }

    // Draw beam + particles
    drawBeam(beamX, sectionH);

    rafRef.current = requestAnimationFrame(animate);
  }, [singleWidth, tripled.length, drawBeam, emitParticles]);

  /* ── Lifecycle ──────────────────────────────────────── */

  useEffect(() => {
    // Init particle pool
    particlesRef.current = Array.from({ length: MAX_PARTICLES }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      opacity: 0,
      r: 0,
      g: 0,
      b: 0,
      life: 0,
    }));

    // IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    // Start RAF
    rafRef.current = requestAnimationFrame(animate);

    // Force a render so refs are populated
    forceRender((n) => n + 1);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  /* ── Pointer events for drag ────────────────────────── */

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragScrollRef.current = scrollXRef.current;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    scrollXRef.current = dragScrollRef.current - dx;
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  /* ── Render ─────────────────────────────────────────── */

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden select-none"
      style={{
        height: CARD_H + 80,
        cursor: isDraggingRef.current ? "grabbing" : "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Beam canvas (above everything) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 20 }}
      />

      {/* Edge fades */}
      <div
        className="absolute inset-y-0 left-0 w-32 pointer-events-none"
        style={{
          zIndex: 15,
          background:
            "linear-gradient(90deg, hsl(240 15% 6%) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-32 pointer-events-none"
        style={{
          zIndex: 15,
          background:
            "linear-gradient(270deg, hsl(240 15% 6%) 0%, transparent 100%)",
        }}
      />

      {/* Cards track */}
      <div
        ref={trackRef}
        className="absolute flex"
        style={{
          top: 40,
          left: 0,
          gap: GAP,
          willChange: "transform",
        }}
      >
        {tripled.map((card, i) => {
          const themeKey = THEME_KEYS[i % THEME_KEYS.length];
          return (
            <div
              key={i}
              className="relative shrink-0"
              style={{
                width: CARD_W,
                height: CARD_H,
                willChange: "transform",
              }}
            >
              {/* Code layer (underneath) */}
              <CodeReveal />

              {/* Metal layer */}
              <MetalCard
                card={card}
                themeKey={themeKey}
                index={i % CARDS.length}
              />

              {/* Code reveal layer (on top, clipped to beam strip) */}
              <div
                ref={(el) => {
                  codeLayerRefs.current[i] = el;
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10,
                  clipPath: "inset(0 50% 0 50%)",
                  opacity: 0,
                  transition: "opacity 0.15s ease",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <CodeReveal />
                {/* Scanline edges */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderLeft: "1px solid rgba(131,58,180,0.5)",
                    borderRight: "1px solid rgba(252,176,69,0.5)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Glow when beam intersects */}
              <div
                ref={(el) => {
                  glowLayerRefs.current[i] = el;
                }}
                style={{
                  position: "absolute",
                  top: -10,
                  bottom: -10,
                  width: 40,
                  left: 0,
                  zIndex: 11,
                  opacity: 0,
                  background:
                    "radial-gradient(ellipse at center, rgba(131,58,180,0.15), transparent 70%)",
                  pointerEvents: "none",
                  transition: "opacity 0.15s ease",
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
