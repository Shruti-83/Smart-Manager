import React, { useEffect, useRef, useState } from "react";
import { createTask } from "../API/Task.js";
import gsap from "gsap";
import { useTheme } from "../context/ThemeContext";

const STEPS = ["basics", "assign", "files"];

const STEP_META = {
  basics: { label: "Task Basics",  icon: "✦", desc: "What needs to be done?" },
  assign: { label: "Assignment",   icon: "◎", desc: "Who does it and when?" },
  files:  { label: "Attachments",  icon: "⬡", desc: "Any files to include?" },
};

const PRIORITY_OPTIONS = [
  { value: "high",   label: "High",   color: "#f43f5e", bg: "rgba(244,63,94,0.12)"  },
  { value: "medium", label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { value: "low",    label: "Low",    color: "#10b981", bg: "rgba(16,185,129,0.12)" },
];

function Particle({ x, y, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 40 + Math.random() * 60;
    gsap.fromTo(ref.current,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
        opacity: 0, scale: 0, duration: 0.7 + Math.random() * 0.4,
        ease: "power2.out" }
    );
  }, []);
  return (
    <div ref={ref} style={{
      position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999,
      width: 6, height: 6, borderRadius: "50%", background: color,
    }} />
  );
}

function TaskCreateModal({ users, onClose, onTaskCreated }) {
  const { theme } = useTheme();
  const modalRef  = useRef(null);
  const cardRef   = useRef(null);
  const glowRef   = useRef(null);
  const stepRefs  = useRef([]);

  const [step,       setStep]       = useState(0);
  const [priority,   setPriority]   = useState("high");
  const [files,      setFiles]      = useState([]);
  const [particles,  setParticles]  = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [dragOver,   setDragOver]   = useState(false);

  // ── entrance ────────────────────────────────────────────
  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 60, rotateX: 25, scale: 0.92 },
      { opacity: 1, y: 0, rotateX: 0, scale: 1,
        duration: 0.55, ease: "back.out(1.6)" });
  }, []);

  // ── 3D tilt ─────────────────────────────────────────────
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    gsap.to(card, { rotateY: dx * 10, rotateX: -dy * 10, duration: 0.3, ease: "power2.out" });
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: (dx + 1) / 2 * rect.width,
        y: (dy + 1) / 2 * rect.height,
        duration: 0.3,
      });
    }
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
  };

  // ── step transition ──────────────────────────────────────
  const goToStep = (next) => {
    const dir     = next > step ? 1 : -1;
    const current = stepRefs.current[step];
    const target  = stepRefs.current[next];
    gsap.to(current, { x: -dir * 40, opacity: 0, duration: 0.2, ease: "power2.in",
      onComplete: () => {
        setStep(next);
        gsap.fromTo(target,
          { x: dir * 40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.25, ease: "power2.out" });
      }
    });
  };

  // ── particle burst ───────────────────────────────────────
  const burst = (e, color) => {
    const rect = e.currentTarget?.getBoundingClientRect?.() ||
                 cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const id = Date.now();
    setParticles(p => [...p, ...Array.from({ length: 10 }, (_, i) => ({ id: id + i, x: cx, y: cy, color }))]);
    setTimeout(() => setParticles(p => p.filter(pt => pt.id < id || pt.id >= id + 10)), 1200);
  };

  // ── submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    files.forEach(f => formData.append("attachments", f));
    try {
      const res = await createTask(formData);
      setDone(true);
      burst({ currentTarget: cardRef.current }, "var(--success)");
      gsap.to(cardRef.current, { scale: 1.04, duration: 0.2, yoyo: true, repeat: 1 });
      setTimeout(() => { onTaskCreated(res.data); onClose(); }, 900);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const priorityCfg = PRIORITY_OPTIONS.find(p => p.value === priority);
  const today = new Date().toISOString().split("T")[0];

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: 12, padding: "10px 14px",
    fontSize: 13, color: "var(--text-primary)",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <>
      {particles.map(p => <Particle key={p.id} x={p.x} y={p.y} color={p.color} />)}

      {/* backdrop */}
      <div
        ref={modalRef}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)",
        }}
        onClick={onClose}
      >
        {/* card */}
        <div
          ref={cardRef}
          onClick={e => e.stopPropagation()}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: 440,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            boxShadow: "var(--shadow-card)",
            transformStyle: "preserve-3d",
            willChange: "transform",
            position: "relative",
            overflow: "hidden",
            padding: "28px 28px 24px",
          }}
        >
          {/* cursor glow */}
          <div ref={glowRef} style={{
            position: "absolute", width: 200, height: 200, borderRadius: "50%",
            background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`,
            transform: "translate(-50%,-50%)", top: 0, left: 0,
            pointerEvents: "none",
          }} />

          {/* header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--accent)", fontWeight: 700, marginBottom: 3 }}>
                {STEP_META[STEPS[step]].icon} {STEP_META[STEPS[step]].label.toUpperCase()}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                {STEP_META[STEPS[step]].desc}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "var(--bg-panel)", border: "1px solid var(--border)",
                color: "var(--text-secondary)", fontSize: 14, cursor: "pointer",
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
            >✕</button>
          </div>

          {/* step progress */}
          <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{
                height: 3, flex: 1, borderRadius: 99, overflow: "hidden",
                background: "var(--bg-panel)",
              }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  background: i <= step ? `linear-gradient(90deg, var(--accent), var(--accent-alt))` : "transparent",
                  transition: "background 0.4s",
                }} />
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>

            {/* ── STEP 0: basics ── */}
            <div ref={el => stepRefs.current[0] = el}
              style={{ display: step === 0 ? "flex" : "none", flexDirection: "column", gap: 12 }}>
              <input
                name="title"
                placeholder="Task title"
                required
                style={inputStyle}
                onFocus={e => {
                  e.target.style.borderColor = "var(--border-focus)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <textarea
                name="description"
                placeholder="Describe the task..."
                rows={3}
                required
                style={{ ...inputStyle, resize: "none" }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--border-focus)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* priority */}
              <div>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.1em", fontWeight: 600 }}>
                  PRIORITY
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {PRIORITY_OPTIONS.map(opt => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={(e) => { setPriority(opt.value); burst(e, opt.color); }}
                      style={{
                        flex: 1, padding: "9px 0", borderRadius: 12,
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        transition: "all 0.2s",
                        border: priority === opt.value
                          ? `1.5px solid ${opt.color}`
                          : `1px solid var(--border)`,
                        background: priority === opt.value ? opt.bg : "var(--bg-panel)",
                        color: priority === opt.value ? opt.color : "var(--text-secondary)",
                        transform: priority === opt.value ? "scale(1.04) translateY(-1px)" : "scale(1)",
                        boxShadow: priority === opt.value ? `0 4px 14px ${opt.color}44` : "none",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="priority" value={priority} />
              </div>
            </div>

            {/* ── STEP 1: assign ── */}
            <div ref={el => stepRefs.current[1] = el}
              style={{ display: step === 1 ? "flex" : "none", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.1em", fontWeight: 600 }}>
                  ASSIGN TO
                </p>
                <select
                  name="assignedTo"
                  required
                  style={{ ...inputStyle, cursor: "pointer", colorScheme: "dark" }}
                  onFocus={e => {
                    e.target.style.borderColor = "var(--border-focus)";
                    e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="" style={{ background: "var(--bg-secondary)" }}>Select team member</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id} style={{ background: "var(--bg-secondary)" }}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.1em", fontWeight: 600 }}>
                  DEADLINE
                </p>
                <input
                  type="date"
                  name="deadline"
                  required
                  min={today}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                  onFocus={e => {
                    e.target.style.borderColor = "var(--border-focus)";
                    e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* user pills */}
              {users.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {users.slice(0, 6).map(u => (
                    <div key={u._id} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "5px 10px", borderRadius: 99,
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border)",
                      fontSize: 11, color: "var(--text-secondary)",
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: `hsl(${u._id.charCodeAt(0) * 137 % 360}, 55%, 45%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700, color: "white",
                      }}>
                        {(u.name || u.email || "?").slice(0, 1).toUpperCase()}
                      </div>
                      {(u.name || u.email || "").split(" ")[0]}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── STEP 2: files ── */}
            <div ref={el => stepRefs.current[2] = el}
              style={{ display: step === 2 ? "flex" : "none", flexDirection: "column", gap: 12 }}>

              {/* drop zone */}
              <label
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: "28px 16px", borderRadius: 16, cursor: "pointer",
                  border: `1.5px dashed ${dragOver ? "var(--accent)" : files.length ? "var(--accent-glow)" : "var(--border)"}`,
                  background: dragOver ? "var(--accent-subtle)" : files.length ? "var(--bg-panel)" : "transparent",
                  transition: "all 0.25s",
                  transform: dragOver ? "scale(1.01)" : "scale(1)",
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <span style={{ fontSize: 28, transition: "transform 0.2s", transform: dragOver ? "scale(1.2)" : "scale(1)" }}>
                  {files.length ? "📎" : "⬆"}
                </span>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", margin: 0 }}>
                  {files.length
                    ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                    : "Click or drag & drop files here"}
                </p>
                <input type="file" multiple style={{ display: "none" }}
                  onChange={e => setFiles(Array.from(e.target.files))} />
              </label>

              {/* file list */}
              {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "7px 12px", borderRadius: 10,
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border)",
                    }}>
                      <span style={{
                        fontSize: 12, color: "var(--text-secondary)",
                        maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        📄 {f.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, j) => j !== i))}
                        style={{
                          fontSize: 11, color: "var(--danger)", background: "none",
                          border: "none", cursor: "pointer", transition: "transform 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                padding: "12px 14px", borderRadius: 12,
                background: "var(--bg-panel)",
                border: "1px solid var(--border)",
                fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7,
              }}>
                Ready to create? Review above then hit{" "}
                <strong style={{ color: "var(--accent)" }}>Create Task</strong>.
              </div>
            </div>

            {/* ── NAV BUTTONS ── */}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => goToStep(step - 1)}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: "var(--bg-panel)", border: "1px solid var(--border)",
                    color: "var(--text-secondary)", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "var(--nav-hover)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--bg-panel)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => goToStep(step + 1)}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: "var(--accent)", border: "none", color: "white",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px var(--accent-glow)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 8px 28px var(--accent-glow)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px var(--accent-glow)";
                  }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || done}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: done ? "var(--success)" : "var(--accent)",
                    border: "none", color: "white",
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 20px var(--accent-glow)",
                    opacity: submitting ? 0.7 : 1, transition: "all 0.3s",
                  }}
                  onMouseEnter={e => {
                    if (!submitting && !done) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 8px 28px var(--accent-glow)";
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px var(--accent-glow)";
                  }}
                >
                  {done ? "✓ Created!" : submitting ? "Creating..." : "Create Task"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default TaskCreateModal;