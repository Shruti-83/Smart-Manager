import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../API/Auth.js";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useTheme, THEMES } from "../context/ThemeContext.jsx";

const NAV_ITEMS = [
  { id: "pending",     label: "Pending Tasks", icon: "◷", badge: null },
  { id: "completed",   label: "Completed",     icon: "✓", badge: null },
  { id: "failed",      label: "Failed",        icon: "✕", badge: null },
  { id: "chat",        label: "Chat",          icon: "◎", badge: null },
  { id: "analytics",  label: "Analytics",     icon: "▲", badge: null },
   { id: "games",     label: "Brain Games",   icon: "⬡", badge: "NEW" },
];

/* ─── Theme Picker ─────────────────────────────────────── */
function ThemePicker({ onClose }) {
  const { themeId, setThemeId, theme } = useTheme();
  const modalRef   = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { opacity: 0, scale: 0.90, y: 20 },
      { opacity: 1, scale: 1,    y: 0, duration: 0.35, ease: "back.out(1.8)" }
    );
  }, []);

  const handlePick = (id) => {
    setThemeId(id);
    toast.success("Theme updated ✨", {
      style: {
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
      },
    });
  };

  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.93, y: 12, duration: 0.2,
      onComplete: onClose,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(10px)" }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        style={{
          width: 440,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 22,
          padding: "26px 24px 22px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--accent)", fontWeight: 700, marginBottom: 3 }}>
              APPEARANCE
            </p>
            <h2 style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 700, margin: 0 }}>
              Choose Theme
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "var(--bg-panel)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
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

        {/* live preview strip */}
        <div style={{
          height: 6, borderRadius: 99, marginBottom: 20, overflow: "hidden",
          background: "var(--bg-panel)", border: "1px solid var(--border)",
        }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, var(--accent), var(--accent-alt))`,
            transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
            width: `${((THEMES.findIndex(t => t.id === themeId) + 1) / THEMES.length) * 100}%`,
          }} />
        </div>

        {/* grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {THEMES.map((t) => {
            const active = t.id === themeId;
            const isHov  = hovered === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handlePick(t.id)}
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "11px 13px", borderRadius: 14, cursor: "pointer",
                  background: active ? "var(--nav-active)" : isHov ? "var(--nav-hover)" : "var(--bg-panel)",
                  border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                  transition: "all 0.2s",
                  transform: active ? "scale(1.02)" : isHov ? "scale(1.01)" : "scale(1)",
                  textAlign: "left",
                  boxShadow: active ? "var(--shadow-glow)" : "none",
                }}
              >
                {/* swatches */}
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  {t.preview.map((c, i) => (
                    <div key={i} style={{
                      width: i === 1 ? 13 : 7,
                      height: 26, borderRadius: 5,
                      background: c,
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      transition: "transform 0.2s",
                      transform: (active || isHov) ? "scaleY(1.05)" : "scaleY(1)",
                    }} />
                  ))}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600, margin: "0 0 2px",
                    color: active ? "var(--accent)" : "var(--text-primary)",
                  }}>
                    {t.emoji} {t.name}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>
                    {t.description}
                  </p>
                </div>
                {active && (
                  <div style={{
                    marginLeft: "auto", width: 18, height: 18, borderRadius: "50%",
                    background: "var(--accent)", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "white", fontWeight: 700,
                    boxShadow: "0 0 12px var(--accent-glow)",
                  }}>✓</div>
                )}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>
          Theme saves automatically · Changes apply across all pages
        </p>
      </div>
    </div>
  );
}

/* ─── Left Panel ───────────────────────────────────────── */
function LeftPanel({ open, onMouseEnter, onChangeView, currentView, setSearchQuery }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const navItemRefs = useRef([]);

  useEffect(() => {
    gsap.to(".sidebar", {
      width: open ? 240 : 0,
      duration: 0.5,
      ease: "power3.inOut",
    });
  }, [open]);

  // Staggered entrance for nav items
  useEffect(() => {
    if (open) {
      gsap.fromTo(navItemRefs.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.04, duration: 0.35, ease: "power2.out", delay: 0.15 }
      );
    }
  }, [open]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleNav = (id, index) => {
    // Ripple the icon
    const el = navItemRefs.current[index];
    if (el) {
      gsap.to(el, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    }
    onChangeView(id);
    setSearchQuery?.("");
  };

  return (
    <>
      {showThemePicker && <ThemePicker onClose={() => setShowThemePicker(false)} />}

      <div
        onMouseEnter={onMouseEnter}
        className="sidebar"
        style={{
          width: open ? 240 : 0,
          overflow: "hidden",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "var(--bg-panel)",
          backdropFilter: "var(--sidebar-blur)",
          borderRight: "1px solid var(--border)",
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── LOGO ── */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-glow)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>
              {theme.emoji}
            </div>
            <div>
              <p style={{
                fontSize: 11, letterSpacing: "0.18em", fontWeight: 700,
                color: "var(--accent)", margin: "0 0 1px",
              }}>
                WORKFLOW
              </p>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                Smart Manager
              </p>
            </div>
          </div>
        </div>

        {/* ── NAV ── */}
        <div style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item, i) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                ref={el => navItemRefs.current[i] = el}
                onClick={() => handleNav(item.id, i)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "9px 12px", borderRadius: 11, cursor: "pointer",
                  background: active ? "var(--nav-active)" : "transparent",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  textAlign: "left", width: "100%",
                  transition: "all 0.18s",
                  whiteSpace: "nowrap",
                  boxShadow: active ? "var(--shadow-glow)" : "none",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = "var(--nav-hover)";
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.transform = "translateX(3px)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                  background: active ? "var(--accent-subtle)" : "var(--bg-card)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: active ? "var(--accent)" : "var(--text-secondary)",
                  transition: "all 0.18s",
                  boxShadow: active ? "0 0 10px var(--accent-glow)" : "none",
                }}>
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <div style={{
                    marginLeft: "auto", width: 5, height: 5, borderRadius: "50%",
                    background: "var(--accent)", flexShrink: 0,
                    boxShadow: "0 0 8px var(--accent)",
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── BOTTOM ── */}
        <div style={{
          padding: "12px 10px",
          borderTop: "1px solid var(--border)",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {/* theme button */}
          <button
            onClick={() => setShowThemePicker(true)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "9px 12px", borderRadius: 11, cursor: "pointer",
              background: "transparent", border: "1px solid transparent",
              color: "var(--text-secondary)", fontSize: 13, textAlign: "left",
              width: "100%", transition: "all 0.18s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--nav-hover)";
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateX(3px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: 7, flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.preview[0]}, ${theme.preview[1]})`,
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11,
            }}>
              {theme.emoji}
            </span>
            Theme
            <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--accent)", fontWeight: 600 }}>
              {theme.name}
            </span>
          </button>

          {/* logout */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "9px 12px", borderRadius: 11, cursor: "pointer",
              background: "transparent", border: "1px solid transparent",
              color: "var(--text-secondary)", fontSize: 13, textAlign: "left",
              width: "100%", transition: "all 0.18s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(244,63,94,0.08)";
              e.currentTarget.style.color = "var(--danger)";
              e.currentTarget.style.borderColor = "rgba(244,63,94,0.2)";
              e.currentTarget.style.transform = "translateX(3px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: 7, flexShrink: 0,
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11,
            }}>
              ⎋
            </span>
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}

export default LeftPanel;