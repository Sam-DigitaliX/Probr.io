"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
}

interface AmbientDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  phase: number;
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

const MAX_PARTICLES = 50;
const AMBIENT_COUNT = 12;

interface Dims {
  cardW: number;
  cardH: number;
  gap: number;
  speed: number;
}

/* ── Horizontal landscape cards ──────────────────────── */

const DESKTOP: Dims = { cardW: 380, cardH: 210, gap: 60, speed: 0.6 };
const TABLET: Dims = { cardW: 320, cardH: 180, gap: 45, speed: 0.5 };
const MOBILE: Dims = { cardW: 260, cardH: 150, gap: 30, speed: 0.4 };

function getDims(w: number): Dims {
  if (w < 640) return MOBILE;
  if (w < 1024) return TABLET;
  return DESKTOP;
}

/* Particle colour — soft purple-white */
const P_R = 190;
const P_G = 170;
const P_B = 255;

const GRID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$!=+.:·<>{}[]|/\\";

/* ── Themes ───────────────────────────────────────────── */

const THEMES: Record<string, MetalTheme> = {
  matte: {
    gradient:
      "linear-gradient(165deg, #18182a 0%, #232340 40%, #1a1a2e 100%)",
    border: "rgba(255,255,255,0.06)",
    shadow: "0 8px 32px rgba(0,0,0,0.50)",
    textColor: "rgba(255,255,255,0.88)",
    subtitleColor: "rgba(255,255,255,0.45)",
    iconFill: "rgba(255,255,255,0.7)",
    accentGradient:
      "linear-gradient(135deg, rgba(131,58,180,0.18), rgba(252,176,69,0.12))",
  },
  platinum: {
    gradient:
      "linear-gradient(165deg, #d4d4e0 0%, #b0b0c0 30%, #e8e8f0 60%, #a0a0b5 100%)",
    border: "rgba(255,255,255,0.35)",
    shadow: "0 8px 32px rgba(0,0,0,0.30)",
    textColor: "rgba(15,15,25,0.88)",
    subtitleColor: "rgba(15,15,25,0.50)",
    iconFill: "rgba(15,15,25,0.65)",
    accentGradient:
      "linear-gradient(135deg, rgba(131,58,180,0.12), rgba(253,29,29,0.08))",
  },
  silver: {
    gradient:
      "linear-gradient(165deg, #2a2a42 0%, #3a3a58 45%, #2a2a42 100%)",
    border: "rgba(255,255,255,0.10)",
    shadow: "0 8px 32px rgba(0,0,0,0.45)",
    textColor: "rgba(255,255,255,0.82)",
    subtitleColor: "rgba(255,255,255,0.42)",
    iconFill: "rgba(255,255,255,0.60)",
    accentGradient:
      "linear-gradient(135deg, rgba(253,29,29,0.10), rgba(252,176,69,0.08))",
  },
  iridescent: {
    gradient:
      "linear-gradient(165deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)",
    border: "rgba(255,255,255,0.18)",
    shadow: "0 8px 32px rgba(131,58,180,0.35)",
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

/* Doubled for infinite scroll (16 cards instead of 24) */
const DOUBLED = [...CARDS, ...CARDS];

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* Pre-generate ASCII text — single string per card for perf */
function generateGridText(
  seed: number,
  rows: number,
  cols: number,
): string {
  const rng = seededRng(seed + 17);
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      line += GRID_CHARS[Math.floor(rng() * GRID_CHARS.length)];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

/* 8 unique text grids — wider for landscape cards */
const GRIDS = CARDS.map((_, i) => generateGridText(i * 137, 22, 60));

/* ═══════════════════════════════════════════════════════════════════
   AsciiReveal — single <pre> element (replaces ~1400 spans per card)
   ═══════════════════════════════════════════════════════════════════ */

function AsciiReveal({ gridIndex }: { gridIndex: number }) {
  const text = GRIDS[gridIndex % GRIDS.length];

  return (
    <pre
      style={{
        position: "absolute",
        inset: 0,
        margin: 0,
        padding: "6px 8px",
        overflow: "hidden",
        fontFamily:
          "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
        fontSize: 9,
        lineHeight: "1.15",
        letterSpacing: "0.06em",
        color: `rgba(${P_R},${P_G},${P_B},0.22)`,
        whiteSpace: "pre",
      }}
    >
      {text}
    </pre>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MetalCard — Horizontal landscape layout
   ═══════════════════════════════════════════════════════════════════ */

function MetalCard({
  card,
  themeKey,
  index,
  compact,
}: {
  card: ExpertiseCard;
  themeKey: string;
  index: number;
  compact?: boolean;
}) {
  const theme = THEMES[themeKey];
  const cardNum = String(index + 1).padStart(2, "0");

  const iconBox = compact ? 40 : 48;
  const svgSize = compact ? 20 : 24;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: theme.gradient,
        borderRadius: compact ? 14 : 18,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: compact ? "16px 20px" : "24px 28px",
        gap: compact ? 16 : 24,
      }}
    >
      {/* Metallic sheen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(145deg, transparent 25%, rgba(255,255,255,0.05) 45%, transparent 60%)",
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

      {/* Icon */}
      <div
        style={{
          width: iconBox,
          height: iconBox,
          minWidth: iconBox,
          borderRadius: compact ? 12 : 14,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={card.viewBox}
          fill="none"
          stroke={theme.iconFill}
          strokeWidth={1.6}
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
            fontSize: compact ? 14 : 16,
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
            fontSize: compact ? 10 : 11,
            color: theme.subtitleColor,
            margin: "6px 0 0",
            letterSpacing: "0.01em",
            lineHeight: 1.5,
          }}
        >
          {card.subtitle}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: compact ? 8 : 12,
          }}
        >
          <span
            style={{
              fontSize: compact ? 8 : 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
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
              fontSize: compact ? 7 : 8,
              color: theme.subtitleColor,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            #{cardNum} · {themeKey}
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
  const [dims, setDims] = useState<Dims>(DESKTOP);
  const [sectionH, setSectionH] = useState(600);
  const dimsRef = useRef<Dims>(DESKTOP);

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
  const ambientRef = useRef<AmbientDot[]>([]);
  const beamIntensityRef = useRef(0);

  /* Cached section dimensions — updated via ResizeObserver */
  const cachedSizeRef = useRef({ w: 0, h: 0 });

  const metalLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const codeLayerRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Responsive dimensions ──────────────────────────── */

  useEffect(() => {
    const update = () => {
      const next = getDims(window.innerWidth);
      dimsRef.current = next;
      setDims((prev) => (prev === next ? prev : next));
      setSectionH(Math.max(next.cardH + 160, window.innerHeight * 0.7));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ── Draw everything on canvas ──────────────────────── */

  const drawCanvas = useCallback(
    (
      beamX: number,
      sW: number,
      sH: number,
      intensity: number,
      cardTop: number,
      cardBottom: number,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      /* ── 1. Ambient floating particles ─────────────── */

      if (ambientRef.current.length === 0 && sW > 0) {
        ambientRef.current = Array.from({ length: AMBIENT_COUNT }, () => ({
          x: Math.random() * sW,
          y: Math.random() * sH,
          vx: 0.5 + Math.random() * 2.0,
          vy: (Math.random() - 0.5) * 0.3,
          size: 0.6 + Math.random() * 1.8,
          baseOpacity: 0.1 + Math.random() * 0.22,
          phase: Math.random() * Math.PI * 2,
        }));
      }

      for (let i = 0; i < ambientRef.current.length; i++) {
        const dot = ambientRef.current[i];
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x > sW + 30) {
          dot.x = -30;
          dot.y = Math.random() * sH;
        }
        if (dot.y < -10) dot.y = sH + 10;
        if (dot.y > sH + 10) dot.y = -10;

        const distFromBeam = Math.abs(dot.x - beamX);
        const beamProximity = Math.max(0, 1 - distFromBeam / 250);
        const pulse = 0.6 + 0.4 * Math.sin(now / 2000 + dot.phase);
        const alpha = dot.baseOpacity * pulse + beamProximity * 0.12;

        ctx.fillStyle = `rgba(${P_R},${P_G},${P_B},${alpha})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── 2. Beam — constrained to card region ──────── */

      const beamMidY = (cardTop + cardBottom) / 2;
      const beamH = cardBottom - cardTop;
      /* Small taper margin above/below the card */
      const taper = beamH * 0.15;
      const beamYMin = cardTop - taper;
      const beamYMax = cardBottom + taper;

      const idlePulse = 0.5 + 0.5 * Math.sin(now / 2200);

      /* Elliptical glow — sized to card height */
      ctx.save();
      ctx.translate(beamX, beamMidY);
      ctx.scale(1, (beamH * 0.65) / 100);
      const glowR = 60 + intensity * 50;
      const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
      const glowBase = 0.04 + idlePulse * 0.02;
      glowGrad.addColorStop(
        0,
        `rgba(100,50,220,${glowBase + intensity * 0.30})`,
      );
      glowGrad.addColorStop(
        0.35,
        `rgba(80,30,200,${glowBase * 0.6 + intensity * 0.15})`,
      );
      glowGrad.addColorStop(
        0.7,
        `rgba(60,20,180,${glowBase * 0.2 + intensity * 0.06})`,
      );
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(-glowR, -glowR, glowR * 2, glowR * 2);
      ctx.restore();

      /* ── 3. Beam — Core line (card-height, tapered) ── */

      const coreAlpha = 0.12 + idlePulse * 0.08 + intensity * 0.8;
      const lineGrad = ctx.createLinearGradient(0, beamYMin, 0, beamYMax);
      lineGrad.addColorStop(0, "rgba(255,255,255,0)");
      lineGrad.addColorStop(0.12, `rgba(255,255,255,${coreAlpha * 0.3})`);
      lineGrad.addColorStop(0.3, `rgba(255,255,255,${coreAlpha})`);
      lineGrad.addColorStop(0.7, `rgba(255,255,255,${coreAlpha})`);
      lineGrad.addColorStop(0.88, `rgba(255,255,255,${coreAlpha * 0.3})`);
      lineGrad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1.2 + intensity * 0.8;
      ctx.beginPath();
      ctx.moveTo(beamX, beamYMin);
      ctx.lineTo(beamX, beamYMax);
      ctx.stroke();

      /* Soft extra glow during scanning — NO shadowBlur for perf */
      if (intensity > 0.15) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(${P_R},${P_G},${P_B},${intensity * 0.08})`;
        ctx.lineWidth = 6 + intensity * 6;
        ctx.beginPath();
        ctx.moveTo(beamX, beamYMin);
        ctx.lineTo(beamX, beamYMax);
        ctx.stroke();
        /* Wider soft pass */
        ctx.strokeStyle = `rgba(${P_R},${P_G},${P_B},${intensity * 0.03})`;
        ctx.lineWidth = 16 + intensity * 10;
        ctx.beginPath();
        ctx.moveTo(beamX, beamYMin);
        ctx.lineTo(beamX, beamYMax);
        ctx.stroke();
        ctx.restore();
      }

      /* ── 4. Scan particles — luminous dots ─────────── */

      const pool = particlesRef.current;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (p.life <= 0) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.006;
        p.vx *= 0.998;
        p.life -= 1;

        const t = p.life / p.maxLife;
        p.opacity = t > 0.85 ? (1 - t) / 0.15 : t < 0.3 ? t / 0.3 : 1;
        p.opacity *= 0.7;

        ctx.fillStyle = `rgba(${P_R},${P_G},${P_B},${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [],
  );

  /* ── Emit particles at scan edge ─────────────────────── */

  const emitParticles = useCallback(
    (x: number, yMin: number, yMax: number) => {
      const pool = particlesRef.current;
      let emitted = 0;
      for (let i = 0; i < pool.length && emitted < 2; i++) {
        if (pool[i].life > 0) continue;

        const maxLife = 20 + Math.random() * 30;
        pool[i] = {
          x: x + (Math.random() - 0.5) * 4,
          y: yMin + Math.random() * (yMax - yMin),
          vx: -0.3 + Math.random() * 2.5,
          vy: (Math.random() - 0.5) * 1.8,
          size: 0.4 + Math.random() * 1.6,
          opacity: 0,
          life: maxLife,
          maxLife,
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

    const { cardW, cardH, gap, speed } = dimsRef.current;
    const singleWidth = CARDS.length * (cardW + gap);

    /* Auto-scroll */
    if (!isDraggingRef.current) {
      scrollXRef.current += speed;
    }

    /* Infinite loop */
    if (scrollXRef.current >= singleWidth) scrollXRef.current -= singleWidth;
    if (scrollXRef.current < 0) scrollXRef.current += singleWidth;

    trackRef.current.style.transform = `translateX(${-scrollXRef.current}px)`;

    /* Use cached dimensions (updated by ResizeObserver) */
    const sW = cachedSizeRef.current.w;
    const sH = cachedSizeRef.current.h;
    if (sW === 0 || sH === 0) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    const beamX = sW / 2;

    /* Canvas resize — only when dimensions change */
    const canvas = canvasRef.current;
    if (canvas && (canvas.width !== sW || canvas.height !== sH)) {
      canvas.width = sW;
      canvas.height = sH;
    }

    const trackLeft = -scrollXRef.current;
    const cardTop = (sH - cardH) / 2;
    const cardBottom = cardTop + cardH;
    let isScanning = false;

    /* ── Per-card scan ─────────────────────────────────── */

    for (let i = 0; i < DOUBLED.length; i++) {
      const metalLayer = metalLayerRefs.current[i];
      const codeLayer = codeLayerRefs.current[i];
      if (!metalLayer || !codeLayer) continue;

      const cardLeft = trackLeft + i * (cardW + gap);
      const raw = (beamX - cardLeft) / cardW;
      const scanProgress = Math.max(0, Math.min(1, raw));

      /* Fade out decoded cards */
      const cardRight = cardLeft + cardW;
      const pastBeam = beamX - cardRight;
      const FADE_START = 60;
      const FADE_DIST = 300;
      let fade = 1;
      if (pastBeam > FADE_START) {
        fade = Math.max(0, 1 - (pastBeam - FADE_START) / FADE_DIST);
      }

      if (scanProgress <= 0) {
        metalLayer.style.clipPath = "none";
        metalLayer.style.opacity = "1";
        codeLayer.style.clipPath = "inset(0 100% 0 0)";
        codeLayer.style.opacity = "0";
      } else if (scanProgress >= 1) {
        metalLayer.style.clipPath = "inset(0 0 0 100%)";
        metalLayer.style.opacity = "0";
        codeLayer.style.clipPath = "none";
        codeLayer.style.opacity = String(fade);
      } else {
        isScanning = true;
        const pct = scanProgress * 100;
        metalLayer.style.clipPath = `inset(0 0 0 ${pct}%)`;
        metalLayer.style.opacity = "1";
        codeLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        codeLayer.style.opacity = "1";
        emitParticles(beamX, cardTop, cardBottom);
      }
    }

    /* Beam intensity lerp */
    const target = isScanning ? 1 : 0;
    const lerpRate = isScanning ? 0.08 : 0.025;
    beamIntensityRef.current +=
      (target - beamIntensityRef.current) * lerpRate;

    drawCanvas(beamX, sW, sH, beamIntensityRef.current, cardTop, cardBottom);
    rafRef.current = requestAnimationFrame(animate);
  }, [drawCanvas, emitParticles]);

  /* ── Lifecycle ──────────────────────────────────────── */

  useEffect(() => {
    particlesRef.current = Array.from({ length: MAX_PARTICLES }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      opacity: 0,
      life: 0,
      maxLife: 1,
    }));

    const ioObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );

    /* Cache dimensions via ResizeObserver to avoid layout thrashing */
    const roObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      cachedSizeRef.current = {
        w: Math.round(width),
        h: Math.round(height),
      };
    });

    if (sectionRef.current) {
      ioObserver.observe(sectionRef.current);
      roObserver.observe(sectionRef.current);
      /* Seed initial size */
      cachedSizeRef.current = {
        w: Math.round(sectionRef.current.offsetWidth),
        h: Math.round(sectionRef.current.offsetHeight),
      };
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      ioObserver.disconnect();
      roObserver.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  /* ── Pointer drag ───────────────────────────────────── */

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragScrollRef.current = scrollXRef.current;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    scrollXRef.current =
      dragScrollRef.current - (e.clientX - dragStartXRef.current);
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  /* ═══════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════ */

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden select-none touch-pan-y"
      style={{ height: sectionH, cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Canvas — beam + all particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 20 }}
      />

      {/* Edge fades */}
      <div
        className="absolute inset-y-0 left-0 pointer-events-none w-[8%] md:w-[18%]"
        style={{
          zIndex: 15,
          background:
            "linear-gradient(90deg, hsl(240 15% 6%) 0%, hsl(240 15% 6% / 0.8) 30%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 pointer-events-none w-[8%] md:w-[18%]"
        style={{
          zIndex: 15,
          background:
            "linear-gradient(270deg, hsl(240 15% 6%) 0%, hsl(240 15% 6% / 0.8) 30%, transparent 100%)",
        }}
      />

      {/* Cards track */}
      <div
        ref={trackRef}
        className="absolute flex"
        style={{
          top: (sectionH - dims.cardH) / 2,
          left: 0,
          gap: dims.gap,
          willChange: "transform",
        }}
      >
        {DOUBLED.map((card, i) => {
          const themeKey = THEME_KEYS[i % THEME_KEYS.length];
          return (
            <div
              key={i}
              className="relative shrink-0"
              style={{ width: dims.cardW, height: dims.cardH }}
            >
              {/* Code layer */}
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
                }}
              >
                <AsciiReveal gridIndex={i % CARDS.length} />
              </div>

              {/* Metal layer */}
              <div
                ref={(el) => {
                  metalLayerRefs.current[i] = el;
                }}
                style={{ position: "absolute", inset: 0, zIndex: 2 }}
              >
                <MetalCard
                  card={card}
                  themeKey={themeKey}
                  index={i % CARDS.length}
                  compact={dims.cardW < 300}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
