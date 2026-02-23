"use client";

import { useEffect, useRef, useCallback } from "react";

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
  life: number;
  maxLife: number;
  char: string; // "" = dot particle
  rotation: number;
  rotSpeed: number;
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
   Constants — horizontal cards, 2-3 visible per screen
   ═══════════════════════════════════════════════════════════════════ */

const CARD_W = 320;
const CARD_H = 180;
const GAP = 260;
const SCROLL_SPEED = 0.6;
const MAX_PARTICLES = 400;

/* Single particle colour — soft purple-white */
const P_R = 200;
const P_G = 190;
const P_B = 255;

const SCATTER_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$!+=<>{}[]|@&*";

/* ── Themes ───────────────────────────────────────────── */

const THEMES: Record<string, MetalTheme> = {
  matte: {
    gradient:
      "linear-gradient(145deg, #18182a 0%, #232340 40%, #1a1a2e 100%)",
    border: "rgba(255,255,255,0.06)",
    shadow: "0 4px 24px rgba(0,0,0,0.45)",
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
    shadow: "0 4px 24px rgba(0,0,0,0.30)",
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
    shadow: "0 4px 24px rgba(0,0,0,0.40)",
    textColor: "rgba(255,255,255,0.80)",
    subtitleColor: "rgba(255,255,255,0.40)",
    iconFill: "rgba(255,255,255,0.60)",
    accentGradient:
      "linear-gradient(135deg, rgba(253,29,29,0.10), rgba(252,176,69,0.08))",
  },
  iridescent: {
    gradient:
      "linear-gradient(145deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)",
    border: "rgba(255,255,255,0.18)",
    shadow: "0 4px 24px rgba(131,58,180,0.35)",
    textColor: "rgba(255,255,255,0.95)",
    subtitleColor: "rgba(255,255,255,0.70)",
    iconFill: "rgba(255,255,255,0.90)",
    accentGradient:
      "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
  },
};

const THEME_KEYS = Object.keys(THEMES);

/* ── Cards ────────────────────────────────────────────── */

const CARDS: ExpertiseCard[] = [
  {
    title: "Uptime Probes",
    subtitle: "HTTP · TCP · ICMP health checks running 24/7",
    viewBox: "0 0 24 24",
    iconPath: "M22 12h-4l-3 9L9 3l-3 9H2",
  },
  {
    title: "Smart Alerts",
    subtitle: "Slack, email & webhook notifications in <30s",
    viewBox: "0 0 24 24",
    iconPath:
      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  },
  {
    title: "SSL Monitoring",
    subtitle: "Certificate expiry & chain validation",
    viewBox: "0 0 24 24",
    iconPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  {
    title: "sGTM Health",
    subtitle: "Stape & Addingwell container monitoring",
    viewBox: "0 0 24 24",
    iconPath:
      "M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z M8 6v12 M16 6v12 M2 12h20",
  },
  {
    title: "Tag Verification",
    subtitle: "Headless browser checks on live pages",
    viewBox: "0 0 24 24",
    iconPath:
      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  },
  {
    title: "Data Volumes",
    subtitle: "Anomaly detection on event streams",
    viewBox: "0 0 24 24",
    iconPath: "M18 20V10 M12 20V4 M6 20v-6",
  },
  {
    title: "CMP Compliance",
    subtitle: "Consent banner & signal propagation audit",
    viewBox: "0 0 24 24",
    iconPath:
      "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  },
  {
    title: "GA4 Pipeline",
    subtitle: "Real-time event flow & BigQuery sync",
    viewBox: "0 0 24 24",
    iconPath:
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  },
];

/* ── Code snippets for reveal ─────────────────────────── */

const CODE_SNIPPETS = [
  'const probe = await monitor.check("api");',
  'if (res.status !== 200) alert.fire();',
  "const ssl = cert.verify({ domain });",
  'await webhook.send({ ch: "slack" });',
  "const rtt = perf.measure('probe');",
  "setInterval(() => ping(), 30_000);",
  'const gtm = headless.verify("GTM");',
  "if (delta > 0.25) anomaly.flag();",
  'const cmp = consent.audit({ gdpr });',
  "await pipeline.validate(events);",
  "for (const s of sites) runProbe(s);",
  'const h = { status: "ok", ms: 42 };',
  "export const cfg = { interval: 60 };",
  "db.alerts.insertOne({ severity });",
  'if (!consent) log.warn("missing");',
  "const ev = ga4.realtime.query();",
];

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

function randomChar(): string {
  return SCATTER_CHARS[Math.floor(Math.random() * SCATTER_CHARS.length)];
}

function generateCodeLines(count: number): string[] {
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    lines.push(CODE_SNIPPETS[i % CODE_SNIPPETS.length]);
  }
  return lines;
}

/* ═══════════════════════════════════════════════════════════════════
   CodeReveal — Horizontal layout of dense code
   ═══════════════════════════════════════════════════════════════════ */

const codeLines = generateCodeLines(16);

function CodeReveal() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#08081a",
        borderRadius: 14,
        overflow: "hidden",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {codeLines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            lineHeight: "10.5px",
            color: `hsl(${160 + ((i * 7) % 80)} 55% ${50 + ((i * 3) % 20)}%)`,
            whiteSpace: "nowrap",
            opacity: 0.8,
          }}
        >
          <span style={{ color: "rgba(200,190,255,0.35)", marginRight: 6 }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          {line}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MetalCard — Horizontal metallic surface
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
        borderRadius: 14,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "0 24px",
        gap: 20,
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
          left: "10%",
          right: "10%",
          height: 1,
          background: theme.accentGradient,
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg
          width={24}
          height={24}
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

      {/* Text */}
      <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: theme.textColor,
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            fontSize: 11,
            color: theme.subtitleColor,
            margin: "3px 0 0",
            letterSpacing: "0.01em",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {card.subtitle}
        </p>
      </div>

      {/* Badge */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: 11,
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
        <span
          style={{
            fontSize: 8,
            color: theme.subtitleColor,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          #{cardNum} · {themeKey}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main — CardBeamSection

   Behaviour:
   - Horizontal cards scroll left. Large gaps = 2-3 cards on screen.
   - Beam breathes: idle = very subtle, scanning = intensifies.
   - Cards disintegrate permanently when crossing the beam.
   - Decoded cards fade out with edge blur as they scroll further left.
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

  /* Beam breathing intensity: 0 = idle, 1 = actively scanning */
  const beamIntensityRef = useRef(0);

  /* DOM refs per card layer */
  const metalLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const codeLayerRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Triple cards for seamless loop */
  const tripled = [...CARDS, ...CARDS, ...CARDS];
  const singleWidth = CARDS.length * (CARD_W + GAP);

  /* ── Draw beam + particles on canvas ────────────────── */

  const drawCanvas = useCallback(
    (beamX: number, sectionH: number, intensity: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* ─ Idle breathing base (always visible, very subtle) ─ */
      const idleAlpha = 0.06 + 0.04 * Math.sin(Date.now() / 2000);

      /* ─ Active alpha ramps with intensity ─ */
      const coreAlpha = idleAlpha + intensity * 0.85;
      const glowAlpha = 0.02 + intensity * 0.12;

      /* ─ Beam core line ─ */
      const grad = ctx.createLinearGradient(0, 0, 0, sectionH);
      grad.addColorStop(0, `rgba(${P_R},${P_G},${P_B},0)`);
      grad.addColorStop(0.2, `rgba(${P_R},${P_G},${P_B},${coreAlpha * 0.6})`);
      grad.addColorStop(0.4, `rgba(255,255,255,${coreAlpha})`);
      grad.addColorStop(0.6, `rgba(255,255,255,${coreAlpha})`);
      grad.addColorStop(0.8, `rgba(${P_R},${P_G},${P_B},${coreAlpha * 0.6})`);
      grad.addColorStop(1, `rgba(${P_R},${P_G},${P_B},0)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 + intensity * 1;
      ctx.beginPath();
      ctx.moveTo(beamX, 0);
      ctx.lineTo(beamX, sectionH);
      ctx.stroke();

      /* ─ Glow (only when scanning) ─ */
      if (intensity > 0.05) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = `rgba(${P_R},${P_G},${P_B},${intensity * 0.7})`;
        ctx.shadowBlur = 30 + intensity * 40;
        ctx.strokeStyle = `rgba(${P_R},${P_G},${P_B},${glowAlpha})`;
        ctx.lineWidth = 10 + intensity * 14;
        ctx.beginPath();
        ctx.moveTo(beamX, 0);
        ctx.lineTo(beamX, sectionH);
        ctx.stroke();
        ctx.restore();
      }

      /* ─ Particles ─ */
      const pool = particlesRef.current;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (p.life <= 0) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01;
        p.vx *= 0.995; // slight drag
        p.life -= 1;
        /* Smooth fade in + fade out */
        const t = p.life / p.maxLife;
        p.opacity = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
        p.opacity *= 0.7;
        p.rotation += p.rotSpeed;

        if (p.char) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.font = `${p.size}px monospace`;
          ctx.fillStyle = `rgba(${P_R},${P_G},${P_B},${p.opacity})`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.char, 0, 0);
          ctx.restore();
        } else {
          ctx.fillStyle = `rgba(${P_R},${P_G},${P_B},${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    [],
  );

  /* ── Emit particles at scan edge ────────────────────── */

  const emitParticles = useCallback(
    (x: number, yMin: number, yMax: number) => {
      const pool = particlesRef.current;
      let emitted = 0;
      for (let i = 0; i < pool.length && emitted < 6; i++) {
        if (pool[i].life > 0) continue;

        const isChar = Math.random() < 0.5;
        const maxLife = 35 + Math.random() * 55;
        pool[i] = {
          x: x + (Math.random() - 0.5) * 6,
          y: yMin + Math.random() * (yMax - yMin),
          vx: -0.5 + Math.random() * 3, // mostly drift right
          vy: (Math.random() - 0.5) * 2,
          size: isChar ? 8 + Math.random() * 12 : 1 + Math.random() * 2,
          opacity: 0,
          life: maxLife,
          maxLife,
          char: isChar ? randomChar() : "",
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.06,
        };
        emitted++;
      }
    },
    [],
  );

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

    /* Auto-scroll */
    if (!isDraggingRef.current) {
      scrollXRef.current += SCROLL_SPEED;
    }

    /* Infinite loop */
    if (scrollXRef.current >= singleWidth) scrollXRef.current -= singleWidth;
    if (scrollXRef.current < 0) scrollXRef.current += singleWidth;

    /* Move track */
    trackRef.current.style.transform = `translateX(${-scrollXRef.current}px)`;

    /* Section metrics */
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const beamX = sectionRect.width / 2;
    const sectionH = sectionRect.height;

    /* Canvas size */
    const canvas = canvasRef.current;
    if (canvas) {
      const w = Math.round(sectionRect.width);
      const h = Math.round(sectionRect.height);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const trackLeft = -scrollXRef.current;
    const cardTop = (sectionH - CARD_H) / 2;

    /* Track whether any card is actively being scanned */
    let isScanning = false;

    /* ── Per-card scan progress ─────────────────────────── */

    for (let i = 0; i < tripled.length; i++) {
      const metalLayer = metalLayerRefs.current[i];
      const codeLayer = codeLayerRefs.current[i];
      if (!metalLayer || !codeLayer) continue;

      const cardLeft = trackLeft + i * (CARD_W + GAP);

      /* scanProgress: 0 = unscanned, 0-1 = scanning, 1 = decoded */
      const raw = (beamX - cardLeft) / CARD_W;
      const scanProgress = Math.max(0, Math.min(1, raw));

      /*
       * Fade factor: once decoded, card fades as it moves further left.
       * distancePastBeam = how far the card's right edge is past beam (in px)
       */
      const cardRight = cardLeft + CARD_W;
      const distancePastBeam = beamX - cardRight; // positive when card is fully left of beam
      const FADE_START = 80; // px past beam before fade starts
      const FADE_DIST = 350; // px over which to fully fade
      let fadeFactor = 1;
      if (distancePastBeam > FADE_START) {
        fadeFactor = Math.max(
          0,
          1 - (distancePastBeam - FADE_START) / FADE_DIST,
        );
      }

      if (scanProgress <= 0) {
        /* Not yet scanned — full metal */
        metalLayer.style.clipPath = "none";
        metalLayer.style.opacity = "1";
        codeLayer.style.clipPath = "inset(0 100% 0 0)";
        codeLayer.style.opacity = "0";
      } else if (scanProgress >= 1) {
        /* Fully decoded — code only, fading out over distance */
        metalLayer.style.clipPath = "inset(0 0 0 100%)";
        metalLayer.style.opacity = "0";
        codeLayer.style.clipPath = "none";
        codeLayer.style.opacity = String(fadeFactor);
      } else {
        /* Actively scanning — progressive reveal */
        isScanning = true;
        const pct = scanProgress * 100;
        metalLayer.style.clipPath = `inset(0 0 0 ${pct}%)`;
        metalLayer.style.opacity = "1";
        codeLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        codeLayer.style.opacity = "1";

        /* Emit particles at scan edge */
        emitParticles(beamX, cardTop, cardTop + CARD_H);
      }
    }

    /* ── Beam breathing ─────────────────────────────────── */
    const target = isScanning ? 1 : 0;
    const speed = isScanning ? 0.08 : 0.03; // quick ramp up, slow fade down
    beamIntensityRef.current += (target - beamIntensityRef.current) * speed;

    /* Draw beam + particles */
    drawCanvas(beamX, sectionH, beamIntensityRef.current);

    rafRef.current = requestAnimationFrame(animate);
  }, [singleWidth, tripled.length, drawCanvas, emitParticles]);

  /* ── Lifecycle ──────────────────────────────────────── */

  useEffect(() => {
    /* Init particle pool */
    particlesRef.current = Array.from({ length: MAX_PARTICLES }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      opacity: 0,
      life: 0,
      maxLife: 1,
      char: "",
      rotation: 0,
      rotSpeed: 0,
    }));

    /* IntersectionObserver */
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    /* Start RAF */
    rafRef.current = requestAnimationFrame(animate);

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
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    scrollXRef.current = dragScrollRef.current - dx;
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════ */

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden select-none"
      style={{ height: CARD_H + 120, cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Canvas — beam + particles (topmost) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 20 }}
      />

      {/* Edge fades — wide, so decoded cards dissolve into bg */}
      <div
        className="absolute inset-y-0 left-0 pointer-events-none"
        style={{
          zIndex: 15,
          width: "20%",
          background:
            "linear-gradient(90deg, hsl(240 15% 6%) 0%, hsl(240 15% 6% / 0.6) 40%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{
          zIndex: 15,
          width: "20%",
          background:
            "linear-gradient(270deg, hsl(240 15% 6%) 0%, hsl(240 15% 6% / 0.6) 40%, transparent 100%)",
        }}
      />

      {/* Cards track */}
      <div
        ref={trackRef}
        className="absolute flex"
        style={{ top: 60, left: 0, gap: GAP, willChange: "transform" }}
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
              {/* Layer 1 — Code (underneath, revealed by scan) */}
              <div
                ref={(el) => {
                  codeLayerRefs.current[i] = el;
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  clipPath: "inset(0 100% 0 0)",
                  opacity: 0,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <CodeReveal />
                {/* Scan-edge line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 1,
                    background: `rgba(${P_R},${P_G},${P_B},0.4)`,
                    boxShadow: `0 0 8px rgba(${P_R},${P_G},${P_B},0.2)`,
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Layer 2 — Metal (on top, clipped away by scan) */}
              <div
                ref={(el) => {
                  metalLayerRefs.current[i] = el;
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 2,
                }}
              >
                <MetalCard
                  card={card}
                  themeKey={themeKey}
                  index={i % CARDS.length}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
