import { useEffect, useRef, useState } from "react";
import GetMotivation from "./GetMotivation";
import { updateTaskStatus } from "../API/Task";
import gsap from "gsap";
import { useTheme } from "../context/ThemeContext";

const PRIORITY_CONFIG = {
  high:   { color: "#f43f5e", bg: "rgba(244,63,94,0.12)",   gradient: "from-rose-600 via-red-500 to-orange-500",   ring: "#f43f5e" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  gradient: "from-amber-500 via-orange-400 to-yellow-400", ring: "#f59e0b" },
  low:    { color: "#10b981", bg: "rgba(16,185,129,0.12)",  gradient: "from-emerald-500 via-teal-400 to-cyan-400",  ring: "#10b981" },
};

function Particle({ x, y, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 50 + Math.random() * 80;
    gsap.fromTo(ref.current,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
        opacity: 0, scale: 0,
        duration: 0.6 + Math.random() * 0.5, ease: "power2.out" }
    );
  }, []);
  return (
    <div ref={ref} style={{
      position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999,
      width: 7, height: 7, borderRadius: "50%", background: color,
    }} />
  );
}

function FlipCard({ task, onUpdateTask }) {
  const { theme } = useTheme();
  const wrapRef  = useRef(null);
  const cardRef  = useRef(null);
  const glowRef  = useRef(null);
  const frontRef = useRef(null);
  const backRef  = useRef(null);

  const [flipped,   setFlipped]   = useState(false);
  const [motivation, setMotivation] = useState("");
  const [particles,  setParticles]  = useState([]);
  const [busy,       setBusy]       = useState(false);

  const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;

  // ── entrance + auto-flip ─────────────────────────────────
  useEffect(() => {
    setMotivation(GetMotivation(task.priority));
    gsap.fromTo(wrapRef.current,
      { opacity: 0, y: 50, rotateX: -20, scale: 0.9 },
      { opacity: 1, y: 0,  rotateX: 0,   scale: 1,
        duration: 0.6, ease: "back.out(1.5)" }
    );
    const t = setTimeout(() => doFlip(true), 180);
    return () => clearTimeout(t);
  }, []);

  const doFlip = (toBack) => {
    gsap.to(cardRef.current, {
      rotateY: toBack ? 180 : 0,
      duration: 0.65, ease: "power3.inOut",
    });
    setFlipped(toBack);
  };

  const handleMouseMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    gsap.to(wrapRef.current, { rotateY: dx * 12, rotateX: -dy * 12, duration: 0.3, ease: "power2.out" });
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: (dx + 1) / 2 * rect.width,
        y: (dy + 1) / 2 * rect.height,
        duration: 0.3,
      });
    }
  };

  const handleMouseLeave = () => {
    gsap.to(wrapRef.current, {
      rotateY: flipped ? 180 : 0, rotateX: 0,
      duration: 0.7, ease: "elastic.out(1, 0.5)",
    });
  };

  const burst = (e, color, count = 12) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const id = Date.now();
    setParticles(p => [...p, ...Array.from({ length: count }, (_, i) => ({ id: id + i, x: cx, y: cy, color }))]);
    setTimeout(() => setParticles(p => p.filter(pt => pt.id < id || pt.id >= id + count)), 1400);
  };

  const handleAction = async (e, status) => {
    if (busy) return;
    burst(e, status === "completed" ? "var(--success)" : "var(--danger)");
    setBusy(true);
    try {
      await updateTaskStatus(task._id, status);
      gsap.to(wrapRef.current, {
        scale: 1.06, duration: 0.18, yoyo: true, repeat: 1,
        onComplete: () => onUpdateTask(task._id, status),
      });
    } catch (err) {
      console.error(err);
      setBusy(false);
    }
  };

  return (
    <>
      {particles.map(p => <Particle key={p.id} x={p.x} y={p.y} color={p.color} />)}

      <div style={{ perspective: "1000px", width: "min(92vw, 460px)" }}
        onClick={e => e.stopPropagation()}>

        <div
          ref={wrapRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transformStyle: "preserve-3d", position: "relative" }}
        >
          <div
            ref={cardRef}
            style={{ transformStyle: "preserve-3d", position: "relative", minHeight: 360 }}
          >
            {/* ── FRONT ── */}
            <div
              ref={frontRef}
              style={{
                backfaceVisibility: "hidden",
                position: "absolute", inset: 0,
                borderRadius: 24, overflow: "hidden",
                background: "var(--bg-panel)",
                border: `1px solid var(--border)`,
                boxShadow: `var(--shadow-card), 0 0 0 1px ${cfg.color}22`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "40px 32px", textAlign: "center", gap: 20,
              }}
            >
              {/* gradient blob using accent */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.12,
                background: `radial-gradient(ellipse at 50% 60%, var(--accent), transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* priority ring */}
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                border: `2px solid ${cfg.color}`,
                background: cfg.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
                boxShadow: `0 0 20px ${cfg.color}44`,
              }}>
                {task.priority === "high" ? "🔥" : task.priority === "medium" ? "⚡" : "🌿"}
              </div>

              <p style={{
                color: "var(--text-primary)", fontWeight: 600, fontSize: 15,
                lineHeight: 1.65, maxWidth: 320, position: "relative",
              }}>
                "{motivation}"
              </p>

              <p style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
                TAP TO SEE DETAILS →
              </p>

              <button onClick={() => doFlip(true)} style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                background: "none", border: "none", cursor: "pointer",
              }} />
            </div>

            {/* ── BACK ── */}
            <div
              ref={backRef}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                borderRadius: 24, overflow: "hidden",
                background: "var(--bg-secondary)",
                border: `1px solid var(--border)`,
                boxShadow: `var(--shadow-card), 0 0 0 1px ${cfg.color}22`,
                padding: "24px 24px 20px",
                display: "flex", flexDirection: "column", gap: 14,
                maxHeight: "80vh", overflowY: "auto",
              }}
            >
              {/* cursor glow */}
              <div ref={glowRef} style={{
                position: "absolute", width: 180, height: 180, borderRadius: "50%",
                background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`,
                transform: "translate(-50%,-50%)", top: 0, left: 0,
                pointerEvents: "none",
              }} />

              {/* back header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <span style={{
                    fontSize: 10, letterSpacing: "0.14em", fontWeight: 700,
                    color: cfg.color, display: "block", marginBottom: 4,
                  }}>
                    {task.priority?.toUpperCase()} PRIORITY
                  </span>
                  <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 17, margin: 0, lineHeight: 1.3 }}>
                    {task.title}
                  </h2>
                </div>
                <button
                  onClick={() => doFlip(false)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: "var(--bg-panel)", border: `1px solid var(--border)`,
                    color: "var(--text-secondary)", cursor: "pointer", fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "var(--accent-subtle)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--bg-panel)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  ←
                </button>
              </div>

              {/* description */}
              <div>
                <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-muted)", fontWeight: 600 }}>
                  DESCRIPTION
                </span>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.65, margin: "4px 0 0" }}>
                  {task.description || "No description provided."}
                </p>
              </div>

              {/* meta grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["STATUS",   task.status],
                  ["PRIORITY", task.priority],
                  ["DEADLINE", task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"],
                  ["CREATED",  new Date(task.createdAt).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    padding: "10px 12px", borderRadius: 12,
                    background: "var(--bg-card)",
                    border: `1px solid var(--border)`,
                  }}>
                    <p style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--text-muted)", margin: "0 0 3px", fontWeight: 600 }}>{k}</p>
                    <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0, fontWeight: 500, textTransform: "capitalize" }}>{v || "—"}</p>
                  </div>
                ))}
              </div>

              {/* attachments */}
              {task.attachments?.length > 0 && (
                <div>
                  <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-muted)", fontWeight: 600 }}>
                    ATTACHMENTS
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                    {task.attachments.map((file, i) => (
                      <a key={i}
                        href={`http://localhost:3000${file.fileUrl}`}
                        target="_blank" rel="noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "8px 12px", borderRadius: 10, textDecoration: "none",
                          background: "var(--accent-subtle)",
                          border: `1px solid var(--border)`,
                          color: "var(--accent)", fontSize: 12, fontWeight: 500,
                          transition: "all 0.18s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--nav-active)"}
                        onMouseLeave={e => e.currentTarget.style.background = "var(--accent-subtle)"}
                      >
                        📎 {file.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* action buttons */}
              {task.status === "pending" && (
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button
                    onClick={(e) => handleAction(e, "completed")}
                    disabled={busy}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 13, fontSize: 13, fontWeight: 600,
                      background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)",
                      color: "var(--success)", cursor: busy ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(16,185,129,0.22)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(16,185,129,0.12)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    ✓ Complete
                  </button>
                  <button
                    onClick={(e) => handleAction(e, "failed")}
                    disabled={busy}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 13, fontSize: 13, fontWeight: 600,
                      background: "rgba(244,63,94,0.10)", border: "1px solid rgba(244,63,94,0.30)",
                      color: "var(--danger)", cursor: busy ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(244,63,94,0.20)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(244,63,94,0.10)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    ✕ Failed
                  </button>
                </div>
              )}

              {/* status badge */}
              {task.status !== "pending" && (
                <div style={{
                  textAlign: "center", padding: "12px", borderRadius: 13,
                  background: task.status === "completed"
                    ? "rgba(16,185,129,0.10)"
                    : "rgba(244,63,94,0.10)",
                  border: `1px solid ${task.status === "completed"
                    ? "rgba(16,185,129,0.3)"
                    : "rgba(244,63,94,0.3)"}`,
                  color: task.status === "completed" ? "var(--success)" : "var(--danger)",
                  fontSize: 13, fontWeight: 600,
                }}>
                  {task.status === "completed" ? "✓ Task Completed" : "✕ Task Failed"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FlipCard;