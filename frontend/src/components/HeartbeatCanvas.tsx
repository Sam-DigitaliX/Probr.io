"use client";

import { useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   HeartbeatCanvas — ECG tracer animation
   A luminous dot travels left → right, drawing the ECG waveform
   behind it. The trail fades with distance from the dot.
   Colour: Probr gradient (#833AB4 → #FD1D1D → #FCB045).
   ═══════════════════════════════════════════════════════════════════ */

/* ECG waveform — returns vertical offset (centered at 0) */
function ecgWaveform(t: number): number {
  if (t < 0.1) return 0;
  if (t < 0.18) {
    const p = (t - 0.1) / 0.08;
    return Math.sin(p * Math.PI) * 0.08;
  }
  if (t < 0.28) return 0;
  if (t < 0.32) {
    const q = (t - 0.28) / 0.04;
    return -Math.sin(q * Math.PI) * 0.06;
  }
  if (t < 0.38) {
    const r = (t - 0.32) / 0.06;
    return Math.sin(r * Math.PI) * 0.45;
  }
  if (t < 0.42) {
    const s = (t - 0.38) / 0.04;
    return -Math.sin(s * Math.PI) * 0.12;
  }
  if (t < 0.55) return 0;
  if (t < 0.68) {
    const tw = (t - 0.55) / 0.13;
    return Math.sin(tw * Math.PI) * 0.1;
  }
  return 0;
}

/* How many heartbeat cycles fit across the screen */
const BEATS_PER_SCREEN = 2.5;
/* Time for the dot to cross the full screen (ms) */
const CYCLE_MS = 4500;
/* Visible trail length as fraction of screen width */
const TRAIL_RATIO = 0.55;

export default function HeartbeatCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }
    const parent = canvas.parentElement;
    if (!parent) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }
    if (!isVisibleRef.current) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    const now = Date.now();
    const centerY = h * 0.52;
    const amplitude = h * 0.22;

    /* Y position for any X on the waveform */
    const getY = (x: number) => {
      const phase = ((((x / w) * BEATS_PER_SCREEN) % 1) + 1) % 1;
      return centerY - ecgWaveform(phase) * amplitude;
    };

    /* Overshoot so the dot enters / exits off-screen */
    const overshoot = w * 0.06;
    const totalTravel = w + overshoot * 2;

    /* Dot position — continuous loop */
    const progress = (now % CYCLE_MS) / CYCLE_MS;
    const dotX = -overshoot + progress * totalTravel;
    const dotY = getY(dotX);

    /* ── Trail ──────────────────────────────────────────── */

    const trailLength = w * TRAIL_RATIO;
    const trailStart = Math.max(0, dotX - trailLength);
    const trailEnd = Math.max(0, Math.min(w, dotX));

    if (trailEnd > trailStart + 2) {
      ctx.beginPath();
      const step = 2;
      let first = true;
      for (let x = trailStart; x <= trailEnd; x += step) {
        const y = getY(x);
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(trailEnd, getY(trailEnd));

      /* Gradient: transparent far → Probr gradient near dot */
      const grad = ctx.createLinearGradient(trailStart, 0, trailEnd, 0);
      grad.addColorStop(0, "rgba(131,58,180,0)");
      grad.addColorStop(0.2, "rgba(131,58,180,0.05)");
      grad.addColorStop(0.45, "rgba(131,58,180,0.12)");
      grad.addColorStop(0.7, "rgba(253,29,29,0.18)");
      grad.addColorStop(0.88, "rgba(252,176,69,0.24)");
      grad.addColorStop(1, "rgba(252,176,69,0.35)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      /* Soft glow on the trail near the dot */
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const glowGrad = ctx.createLinearGradient(trailStart, 0, trailEnd, 0);
      glowGrad.addColorStop(0, "rgba(131,58,180,0)");
      glowGrad.addColorStop(0.7, "rgba(131,58,180,0)");
      glowGrad.addColorStop(0.9, "rgba(253,29,29,0.03)");
      glowGrad.addColorStop(1, "rgba(252,176,69,0.07)");
      ctx.strokeStyle = glowGrad;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }

    /* ── Luminous dot ──────────────────────────────────── */

    if (dotX > -10 && dotX < w + 10) {
      /* Outer halo */
      const outer = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 24);
      outer.addColorStop(0, "rgba(252,176,69,0.35)");
      outer.addColorStop(0.3, "rgba(253,29,29,0.12)");
      outer.addColorStop(0.6, "rgba(131,58,180,0.04)");
      outer.addColorStop(1, "rgba(131,58,180,0)");
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 24, 0, Math.PI * 2);
      ctx.fill();

      /* Inner glow */
      const inner = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 8);
      inner.addColorStop(0, "rgba(255,255,255,0.85)");
      inner.addColorStop(0.4, "rgba(252,176,69,0.45)");
      inner.addColorStop(1, "rgba(253,29,29,0)");
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
      ctx.fill();

      /* Core bright point */
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );
    if (canvasRef.current?.parentElement) {
      observer.observe(canvasRef.current.parentElement);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
