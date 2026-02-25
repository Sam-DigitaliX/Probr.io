"use client";

import { useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   HeartbeatCanvas — ECG-style background animation
   Draws a continuous heartbeat / pulse line that sweeps across
   the hero section, evoking the "pulse of data being monitored".
   ═══════════════════════════════════════════════════════════════════ */

/* ECG waveform sample — normalised to 0..1 Y range, centered at 0.5 */
function ecgWaveform(t: number): number {
  /* t goes from 0 → 1 for one full heartbeat cycle */
  /* Flat → P-wave → flat → QRS complex → flat → T-wave → flat */

  if (t < 0.10) return 0; /* flat baseline */
  if (t < 0.18) {
    /* P-wave — gentle bump */
    const p = (t - 0.10) / 0.08;
    return Math.sin(p * Math.PI) * 0.08;
  }
  if (t < 0.28) return 0; /* PR segment */
  if (t < 0.32) {
    /* Q dip */
    const q = (t - 0.28) / 0.04;
    return -Math.sin(q * Math.PI) * 0.06;
  }
  if (t < 0.38) {
    /* R peak — the main spike */
    const r = (t - 0.32) / 0.06;
    return Math.sin(r * Math.PI) * 0.45;
  }
  if (t < 0.42) {
    /* S dip */
    const s = (t - 0.38) / 0.04;
    return -Math.sin(s * Math.PI) * 0.12;
  }
  if (t < 0.55) return 0; /* ST segment */
  if (t < 0.68) {
    /* T-wave — rounded bump */
    const tw = (t - 0.55) / 0.13;
    return Math.sin(tw * Math.PI) * 0.10;
  }
  return 0; /* flat until next beat */
}

const BEAT_DURATION = 2400; /* ms per heartbeat cycle */
const LINE_OPACITY = 0.12; /* subtle — stays behind content */
const GLOW_OPACITY = 0.06;

export default function HeartbeatCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const parentRef = useRef<HTMLElement | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    /* Size to parent */
    const parent = canvas.parentElement;
    if (!parent) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }
    parentRef.current = parent;

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
    const centerY = h * 0.52; /* slightly below center */
    const amplitude = h * 0.22; /* waveform height */

    /* ── Draw two waveform lines (offset phase for organic feel) ── */

    for (let line = 0; line < 2; line++) {
      const phaseOffset = line * 0.45;
      const yOffset = line === 0 ? 0 : h * 0.06;
      const opacity = line === 0 ? LINE_OPACITY : LINE_OPACITY * 0.4;
      const glowOp = line === 0 ? GLOW_OPACITY : GLOW_OPACITY * 0.3;

      /* Sweep position — the "now" point moving across the screen */
      const sweepT = ((now / BEAT_DURATION + phaseOffset) % 3) / 3;
      const sweepX = sweepT * w * 1.4 - w * 0.2;

      ctx.beginPath();

      const step = 2;
      for (let x = 0; x < w; x += step) {
        /* Map x position to heartbeat phase */
        const distFromSweep = (x - sweepX) / w;
        /* Repeat the waveform across the width */
        const beatPhase =
          ((distFromSweep * 2.5 + phaseOffset + 100) % 1 + 1) % 1;
        const y =
          centerY + yOffset - ecgWaveform(beatPhase) * amplitude;

        /* Fade out far from sweep point */
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      /* Fade trail — stronger near sweep, fading behind */
      const trailGrad = ctx.createLinearGradient(0, 0, w, 0);
      const sweepNorm = Math.max(0, Math.min(1, sweepX / w));

      /* Build gradient stops: faded on left, bright at sweep, fading right */
      trailGrad.addColorStop(
        0,
        `rgba(131,58,180,${opacity * 0.1})`,
      );
      trailGrad.addColorStop(
        Math.max(0, sweepNorm - 0.15),
        `rgba(131,58,180,${opacity * 0.3})`,
      );
      trailGrad.addColorStop(
        Math.max(0, sweepNorm - 0.02),
        `rgba(253,29,29,${opacity})`,
      );
      trailGrad.addColorStop(
        Math.min(1, sweepNorm),
        `rgba(252,176,69,${opacity})`,
      );
      trailGrad.addColorStop(
        Math.min(1, sweepNorm + 0.05),
        `rgba(131,58,180,${opacity * 0.15})`,
      );
      trailGrad.addColorStop(
        1,
        `rgba(131,58,180,${opacity * 0.05})`,
      );

      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = line === 0 ? 1.5 : 1;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      /* Glow effect near sweep point */
      if (line === 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = `rgba(131,58,180,${glowOp})`;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = `rgba(131,58,180,${glowOp})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
