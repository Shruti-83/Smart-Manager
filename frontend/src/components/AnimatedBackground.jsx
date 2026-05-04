import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useTheme } from "../context/ThemeContext";

gsap.registerPlugin(MotionPathPlugin);

const THEME_CONFIGS = {
  obsidian: {
    particles: { count: 35, colors: ["#7c6ff7", "#a78bfa", "#c4b5fd", "#ffffff"] },
    orbs: { colors: ["rgba(124,111,247,0.15)", "rgba(167,139,250,0.10)", "rgba(124,111,247,0.08)", "rgba(167,139,250,0.06)"] },
    beePath: "rgba(124,111,247,0.5)",
    bg: "radial-gradient(ellipse at 20% 50%, rgba(124,111,247,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.06) 0%, transparent 50%), #0a0a0f",
    grid: "rgba(124,111,247,0.04)",
  },
  aurora: {
    particles: { count: 40, colors: ["#00d2c8", "#67e8f9", "#a5f3fc", "#ffffff"] },
    orbs: { colors: ["rgba(0,210,200,0.12)", "rgba(103,232,249,0.08)", "rgba(0,210,200,0.06)", "rgba(103,232,249,0.04)"] },
    beePath: "rgba(0,210,200,0.5)",
    bg: "radial-gradient(ellipse at 30% 40%, rgba(0,210,200,0.10) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(103,232,249,0.07) 0%, transparent 50%), #050d1a",
    grid: "rgba(0,210,200,0.04)",
  },
  crimson: {
    particles: { count: 30, colors: ["#ef4444", "#fca5a5", "#fee2e2", "#ffffff"] },
    orbs: { colors: ["rgba(239,68,68,0.12)", "rgba(252,165,165,0.08)", "rgba(239,68,68,0.06)", "rgba(252,165,165,0.04)"] },
    beePath: "rgba(239,68,68,0.5)",
    bg: "radial-gradient(ellipse at 20% 60%, rgba(239,68,68,0.10) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(252,165,165,0.06) 0%, transparent 50%), #0f0508",
    grid: "rgba(239,68,68,0.04)",
  },
  forest: {
    particles: { count: 38, colors: ["#10b981", "#6ee7b7", "#a7f3d0", "#ffffff"] },
    orbs: { colors: ["rgba(16,185,129,0.12)", "rgba(110,231,183,0.08)", "rgba(16,185,129,0.06)", "rgba(110,231,183,0.04)"] },
    beePath: "rgba(16,185,129,0.5)",
    bg: "radial-gradient(ellipse at 40% 30%, rgba(16,185,129,0.10) 0%, transparent 60%), radial-gradient(ellipse at 60% 70%, rgba(110,231,183,0.06) 0%, transparent 50%), #060f08",
    grid: "rgba(16,185,129,0.04)",
  },
  gold: {
    particles: { count: 32, colors: ["#f59e0b", "#fcd34d", "#fef3c7", "#ffffff"] },
    orbs: { colors: ["rgba(245,158,11,0.12)", "rgba(252,211,77,0.08)", "rgba(245,158,11,0.06)", "rgba(252,211,77,0.04)"] },
    beePath: "rgba(245,158,11,0.5)",
    bg: "radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.10) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(252,211,77,0.06) 0%, transparent 50%), #0d0a04",
    grid: "rgba(245,158,11,0.04)",
  },
  rose: {
    particles: { count: 36, colors: ["#f472b6", "#fbcfe8", "#fce7f3", "#ffffff"] },
    orbs: { colors: ["rgba(244,114,182,0.12)", "rgba(251,207,232,0.08)", "rgba(244,114,182,0.06)", "rgba(251,207,232,0.04)"] },
    beePath: "rgba(244,114,182,0.5)",
    bg: "radial-gradient(ellipse at 60% 40%, rgba(244,114,182,0.10) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(251,207,232,0.06) 0%, transparent 50%), #0f080c",
    grid: "rgba(244,114,182,0.04)",
  },
  arctic: {
    particles: { count: 30, colors: ["#3b82f6", "#93c5fd", "#bfdbfe", "#1e2a3a"] },
    orbs: { colors: ["rgba(59,130,246,0.10)", "rgba(147,197,253,0.07)", "rgba(59,130,246,0.05)", "rgba(147,197,253,0.04)"] },
    beePath: "rgba(59,130,246,0.4)",
    bg: "radial-gradient(ellipse at 40% 30%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(147,197,253,0.05) 0%, transparent 50%), #f4f7fb",
    grid: "rgba(59,130,246,0.06)",
  },
  slate: {
    particles: { count: 28, colors: ["#94a3b8", "#cbd5e1", "#e2e8f0", "#ffffff"] },
    orbs: { colors: ["rgba(148,163,184,0.10)", "rgba(203,213,225,0.07)", "rgba(148,163,184,0.05)", "rgba(203,213,225,0.04)"] },
    beePath: "rgba(148,163,184,0.4)",
    bg: "radial-gradient(ellipse at 30% 50%, rgba(148,163,184,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(203,213,225,0.05) 0%, transparent 50%), #0e1117",
    grid: "rgba(148,163,184,0.04)",
  },
};

function AnimatedBackground() {
  const { themeId } = useTheme();
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const beeRef = useRef(null);
  const bgRef = useRef(null);
  const gridRef = useRef(null);
  const grid3dRef = useRef(null);

  // stable refs that survive re-renders
  const stateRef = useRef({
    animFrame: null,
    tweens: [],
    particles: [],
    orbs: [],
    lastPoint: null,
    killed: false,
    tick: 0,
  });

  useEffect(() => {
    const s = stateRef.current;
    const cfg = THEME_CONFIGS[themeId] || THEME_CONFIGS.obsidian;

    // ── 1. kill everything from previous theme ──
    s.killed = true;
    cancelAnimationFrame(s.animFrame);
    s.tweens.forEach(t => { try { t.kill(); } catch {} });
    s.tweens = [];
    s.lastPoint = null;
    s.tick = 0;

    // clear svg trails
    const svg = svgRef.current;
    if (svg) while (svg.firstChild) svg.removeChild(svg.firstChild);

    // ── 2. update DOM backgrounds immediately ──
    if (bgRef.current) bgRef.current.style.background = cfg.bg;
    if (gridRef.current) {
      gridRef.current.style.backgroundImage = `
        linear-gradient(${cfg.grid} 1px, transparent 1px),
        linear-gradient(90deg, ${cfg.grid} 1px, transparent 1px)
      `;
    }
    if (grid3dRef.current) {
      grid3dRef.current.style.backgroundImage = `
        linear-gradient(${cfg.grid} 1px, transparent 1px),
        linear-gradient(90deg, ${cfg.grid} 1px, transparent 1px)
      `;
    }
    if (beeRef.current) {
      beeRef.current.style.filter = `drop-shadow(0 0 8px ${cfg.beePath})`;
    }

    // ── 3. reinit canvas ──
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    s.particles = Array.from({ length: cfg.particles.count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 3 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.5 + 0.5,
      color: cfg.particles.colors[Math.floor(Math.random() * cfg.particles.colors.length)],
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      glowing: Math.random() > 0.7,
    }));

    s.orbs = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 120 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      color: cfg.orbs.colors[i % cfg.orbs.colors.length],
      phase: Math.random() * Math.PI * 2,
    }));

    // ── 4. start canvas draw loop ──
    s.killed = false;

    const draw = () => {
      if (s.killed) return;
      s.animFrame = requestAnimationFrame(draw);
      s.tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // orbs
      s.orbs.forEach(orb => {
        orb.x += orb.vx; orb.y += orb.vy; orb.phase += 0.003;
        if (orb.x < -orb.r) orb.x = canvas.width + orb.r;
        if (orb.x > canvas.width + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = canvas.height + orb.r;
        if (orb.y > canvas.height + orb.r) orb.y = -orb.r;
        const scale = 1 + Math.sin(orb.phase) * 0.15;
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * scale);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // particles
      s.particles.forEach(p => {
        p.x += p.vx * p.z * 0.4; p.y += p.vy * p.z * 0.4; p.pulse += 0.02;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const pulsedSize = p.size * p.z * (1 + Math.sin(p.pulse) * 0.3);
        const alpha = p.opacity * (0.4 + (p.z / 3.5) * 0.6);
        ctx.save();
        ctx.globalAlpha = alpha;
        if (p.glowing) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsedSize * 4);
          glow.addColorStop(0, p.color);
          glow.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulsedSize * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow; ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulsedSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.restore();
      });

      // connecting lines every other frame
      if (s.tick % 2 === 0) {
        const pts = s.particles;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              const alpha = (1 - dist / 100) * 0.12 * Math.min(pts[i].z, pts[j].z) / 3.5;
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.strokeStyle = cfg.particles.colors[0];
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }
    };

    draw();

    // ── 5. reinit bee ──
    const bee = beeRef.current;
    if (!bee) return;

    gsap.set(bee, { x: window.innerWidth / 2, y: window.innerHeight / 2 });

   const createTrail = () => {
  const svgEl = svgRef.current;
  const beeEl = beeRef.current;

  if (s.killed || !beeEl || !svgEl) return;
  if (!beeEl.isConnected || !svgEl.isConnected) return;

  let rect;
  try {
    rect = beeEl.getBoundingClientRect();
  } catch {
    return;
  }

  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const prev = s.lastPoint || [x, y];

  const segment = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );

  const d = `M ${prev[0]} ${prev[1]} Q ${(prev[0] + x) / 2} ${(prev[1] + y) / 2 - 20}, ${x} ${y}`;

  segment.setAttribute("d", d);
  segment.setAttribute("stroke", cfg.beePath);
  segment.setAttribute("stroke-width", "1.5");
  segment.setAttribute("fill", "none");
  segment.setAttribute("stroke-dasharray", "3 8");
  segment.setAttribute("stroke-linecap", "round");

  try {
    svgEl.appendChild(segment); // ✅ safe now
  } catch {
    return;
  }

  s.lastPoint = [x, y];

  const t = gsap.to(segment, {
    opacity: 0,
    duration: 8,
    ease: "power1.out",
    onComplete: () => {
      try {
        segment.remove();
      } catch {}
    },
  });

  s.tweens.push(t);
};

    const moveBee = () => {
      if (s.killed || !beeRef.current) return;
      const endX = 60 + Math.random() * (window.innerWidth - 120);
      const endY = 60 + Math.random() * (window.innerHeight - 120);
      const t = gsap.to(bee, {
        x: endX, y: endY,
        duration: 8 + Math.random() * 6,
        ease: "power1.inOut",
        onUpdate: createTrail,
        onComplete: moveBee,
      });
      s.tweens.push(t);
    };

    moveBee();

    // ── 6. resize handler ──
    const onResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      s.killed = true;
      cancelAnimationFrame(s.animFrame);
      s.tweens.forEach(t => { try { t.kill(); } catch {} });
      s.tweens = [];
      window.removeEventListener("resize", onResize);
    };
  }, [themeId]); // ← only themeId, no useCallback wrapping

  const cfg = THEME_CONFIGS[themeId] || THEME_CONFIGS.obsidian;

  return (
    <div
      ref={bgRef}
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: cfg.bg, transition: "background 600ms ease" }}
    >
      <div
        ref={gridRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${cfg.grid} 1px, transparent 1px),
            linear-gradient(90deg, ${cfg.grid} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          transition: "background-image 600ms ease",
        }}
      />

      <div
        ref={grid3dRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${cfg.grid} 1px, transparent 1px),
            linear-gradient(90deg, ${cfg.grid} 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          transform: "perspective(600px) rotateX(25deg) scaleY(1.4) translateY(-10%)",
          transformOrigin: "bottom center",
          opacity: 0.6,
          maskImage: "linear-gradient(to bottom, transparent 0%, black 40%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 40%, transparent 90%)",
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ position: "fixed" }} />

      <img
        ref={beeRef}
        src="/bee.png"
        alt=""
        className="absolute w-14 pointer-events-none"
        style={{
          top: 0, left: 0,
          filter: `drop-shadow(0 0 8px ${cfg.beePath})`,
          transition: "filter 600ms ease",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }}
      />
    </div>
  );
}

export default AnimatedBackground;