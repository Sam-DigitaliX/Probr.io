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
  char: string;
  rotation: number;
  rotSpeed: number;
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

const CARD_W = 320;
const CARD_H = 180;
const GAP = 260;
const SCROLL_SPEED = 0.6;
const MAX_PARTICLES = 400;
const AMBIENT_COUNT = 70;

/* Particle colour — soft purple-white */
const P_R = 190;
const P_G = 170;
const P_B = 255;

const SCATTER_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$!=+<>{}[]|@&*";
const GRID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$!=+.:·";

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

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

function randomChar(): string {
  return SCATTER_CHARS[Math.floor(Math.random() * SCATTER_CHARS.length)];
}

/* Seeded RNG for deterministic grids per card */
function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface GridCell {
  char: string;
  bold: boolean;
}

function generateGrid(
  seed: number,
  rows: number,
  cols: number,
): GridCell[][] {
  const rng = seededRng(seed + 17);
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      char: GRID_CHARS[Math.floor(rng() * GRID_CHARS.length)],
      bold: rng() < 0.07,
    })),
  );
}

/* Pre-generate 8 unique grids (one per card) */
const GRIDS = CARDS.map((_, i) => generateGrid(i * 137, 17, 28));

/* ═══════════════════════════════════════════════════════════════════
   AsciiReveal — Random character grid (Evervault-style)
   ═══════════════════════════════════════════════════════════════════ */

function AsciiReveal({ gridIndex }: { gridIndex: number }) {
  const grid = GRIDS[gridIndex % GRIDS.length];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#06060f",
        borderRadius: 14,
        overflow: "hidden",
        padding: "8px 6px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {grid.map((row, r) => (
        <div
          key={r}
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            lineHeight: "10.2px",
            letterSpacing: "0.14em",
            whiteSpace: "nowrap",
            color: `rgba(${P_R},${P_G},${P_B},${0.25 + (r % 3) * 0.08})`,
          }}
        >
          {row.map((cell, c) => (
            <span
              key={c}
              style={
                cell.bold
                  ? {
                      fontSize: 14,
                      fontWeight: 700,
                      color: `rgba(255,255,255,0.6)`,
                    }
                  : undefined
              }
            >
              {cell.char}
            </span>
          ))}
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
      {/* Metallic sheen */}
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
  const ambientRef = useRef<AmbientDot[]>([]);
  const beamIntensityRef = useRef(0);

  const metalLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const codeLayerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tripled = [...CARDS, ...CARDS, ...CARDS];
  const singleWidth = CARDS.length * (CARD_W + GAP);

  /* ── Draw everything on canvas ──────────────────────── */

  const drawCanvas = useCallback(
    (beamX: number, sectionW: number, sectionH: number, intensity: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      /* ── 1. Ambient floating particles ─────────────── */

      /* Lazy init */
      if (ambientRef.current.length === 0 && sectionW > 0) {
        ambientRef.current = Array.from({ length: AMBIENT_COUNT }, () => ({
          x: Math.random() * sectionW,
          y: Math.random() * sectionH,
          vx: 0.4 + Math.random() * 1.8,
          vy: (Math.random() - 0.5) * 0.25,
          size: 0.8 + Math.random() * 2.2,
          baseOpacity: 0.12 + Math.random() * 0.28,
          phase: Math.random() * Math.PI * 2,
        }));
      }

      for (const dot of ambientRef.current) {
        dot.x += dot.vx;
        dot.y += dot.vy;

        /* Wrap */
        if (dot.x > sectionW + 30) {
          dot.x = -30;
          dot.y = Math.random() * sectionH;
        }
        if (dot.y < -10) dot.y = sectionH + 10;
        if (dot.y > sectionH + 10) dot.y = -10;

        /* Brighter near beam */
        const distFromBeam = Math.abs(dot.x - beamX);
        const beamProximity = Math.max(0, 1 - distFromBeam / 300);
        const pulse = 0.6 + 0.4 * Math.sin(now / 1800 + dot.phase);
        const alpha = dot.baseOpacity * pulse + beamProximity * 0.15;

        ctx.fillStyle = `rgba(${P_R},${P_G},${P_B},${alpha})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── 2. Beam — Elliptical purple glow ──────────── */

      const idlePulse = 0.5 + 0.5 * Math.sin(now / 2200);

      /* Deep violet radial glow (elliptical, wider in middle) */
      ctx.save();
      ctx.translate(beamX, sectionH / 2);
      /* Scale Y to stretch a circular gradient into a vertical ellipse */
      ctx.scale(1, (sectionH * 0.6) / 100);
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

      /* ── 3. Beam — Core line (tapered opacity) ─────── */

      const coreAlpha = 0.12 + idlePulse * 0.08 + intensity * 0.8;
      const lineGrad = ctx.createLinearGradient(0, 0, 0, sectionH);
      lineGrad.addColorStop(0, "rgba(255,255,255,0)");
      lineGrad.addColorStop(0.15, `rgba(255,255,255,${coreAlpha * 0.4})`);
      lineGrad.addColorStop(0.35, `rgba(255,255,255,${coreAlpha})`);
      lineGrad.addColorStop(0.65, `rgba(255,255,255,${coreAlpha})`);
      lineGrad.addColorStop(0.85, `rgba(255,255,255,${coreAlpha * 0.4})`);
      lineGrad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1.2 + intensity * 0.8;
      ctx.beginPath();
      ctx.moveTo(beamX, 0);
      ctx.lineTo(beamX, sectionH);
      ctx.stroke();

      /* Extra glow line during scanning */
      if (intensity > 0.1) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = `rgba(${P_R},${P_G},${P_B},${intensity * 0.5})`;
        ctx.shadowBlur = 20 + intensity * 30;
        ctx.strokeStyle = `rgba(${P_R},${P_G},${P_B},${intensity * 0.08})`;
        ctx.lineWidth = 8 + intensity * 10;
        ctx.beginPath();
        ctx.moveTo(beamX, 0);
        ctx.lineTo(beamX, sectionH);
        ctx.stroke();
        ctx.restore();
      }

      /* ── 4. Scan particles + char particles ────────── */

      const pool = particlesRef.current;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (p.life <= 0) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.008;
        p.vx *= 0.997;
        p.life -= 1;

        /* Smooth fade in + fade out */
        const t = p.life / p.maxLife;
        p.opacity = t > 0.85 ? (1 - t) / 0.15 : t < 0.25 ? t / 0.25 : 1;
        p.opacity *= 0.65;
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
      for (let i = 0; i < pool.length && emitted < 7; i++) {
        if (pool[i].life > 0) continue;

        const isChar = Math.random() < 0.5;
        const maxLife = 30 + Math.random() * 55;
        pool[i] = {
          x: x + (Math.random() - 0.5) * 6,
          y: yMin + Math.random() * (yMax - yMin),
          vx: -0.5 + Math.random() * 3,
          vy: (Math.random() - 0.5) * 2,
          size: isChar ? 8 + Math.random() * 14 : 1 + Math.random() * 2.5,
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

    trackRef.current.style.transform = `translateX(${-scrollXRef.current}px)`;

    const sectionRect = sectionRef.current.getBoundingClientRect();
    const beamX = sectionRect.width / 2;
    const sectionW = sectionRect.width;
    const sectionH = sectionRect.height;

    /* Canvas resize */
    const canvas = canvasRef.current;
    if (canvas) {
      const w = Math.round(sectionW);
      const h = Math.round(sectionH);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const trackLeft = -scrollXRef.current;
    const cardTop = (sectionH - CARD_H) / 2;
    let isScanning = false;

    /* ── Per-card scan ─────────────────────────────────── */

    for (let i = 0; i < tripled.length; i++) {
      const metalLayer = metalLayerRefs.current[i];
      const codeLayer = codeLayerRefs.current[i];
      if (!metalLayer || !codeLayer) continue;

      const cardLeft = trackLeft + i * (CARD_W + GAP);
      const raw = (beamX - cardLeft) / CARD_W;
      const scanProgress = Math.max(0, Math.min(1, raw));

      /* Fade out decoded cards */
      const cardRight = cardLeft + CARD_W;
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
        emitParticles(beamX, cardTop, cardTop + CARD_H);
      }
    }

    /* Beam intensity lerp */
    const target = isScanning ? 1 : 0;
    const speed = isScanning ? 0.08 : 0.025;
    beamIntensityRef.current +=
      (target - beamIntensityRef.current) * speed;

    drawCanvas(beamX, sectionW, sectionH, beamIntensityRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [singleWidth, tripled.length, drawCanvas, emitParticles]);

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
      char: "",
      rotation: 0,
      rotSpeed: 0,
    }));

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
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
    scrollXRef.current = dragScrollRef.current - (e.clientX - dragStartXRef.current);
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
      className="relative overflow-hidden select-none"
      style={{ height: CARD_H + 120, cursor: "grab" }}
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
        className="absolute inset-y-0 left-0 pointer-events-none"
        style={{
          zIndex: 15,
          width: "22%",
          background:
            "linear-gradient(90deg, hsl(240 15% 6%) 0%, hsl(240 15% 6% / 0.7) 35%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{
          zIndex: 15,
          width: "22%",
          background:
            "linear-gradient(270deg, hsl(240 15% 6%) 0%, hsl(240 15% 6% / 0.7) 35%, transparent 100%)",
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
              style={{ width: CARD_W, height: CARD_H, willChange: "transform" }}
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
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <AsciiReveal gridIndex={i % CARDS.length} />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 1,
                    background: `rgba(${P_R},${P_G},${P_B},0.35)`,
                    boxShadow: `0 0 6px rgba(${P_R},${P_G},${P_B},0.2)`,
                    pointerEvents: "none",
                  }}
                />
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
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
