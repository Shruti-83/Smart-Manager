import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

export const THEMES = [
  {
    id: "obsidian",
    name: "Obsidian",
    emoji: "🖤",
    description: "Deep dark glass",
    isDark: true,
    vars: {
      "--bg-primary":       "#0a0a0f",
      "--bg-secondary":     "#12121a",
      "--bg-panel":         "rgba(255,255,255,0.06)",
      "--bg-card":          "rgba(255,255,255,0.04)",
      "--bg-input":         "rgba(255,255,255,0.08)",
      "--border":           "rgba(255,255,255,0.10)",
      "--border-focus":     "rgba(124,111,247,0.6)",
      "--text-primary":     "#f0f0f5",
      "--text-secondary":   "rgba(240,240,245,0.5)",
      "--text-muted":       "rgba(240,240,245,0.25)",
      "--accent":           "#7c6ff7",
      "--accent-alt":       "#a78bfa",
      "--accent-glow":      "rgba(124,111,247,0.30)",
      "--accent-subtle":    "rgba(124,111,247,0.12)",
      "--nav-active":       "rgba(124,111,247,0.15)",
      "--nav-hover":        "rgba(255,255,255,0.06)",
      "--msg-me-bg":        "linear-gradient(135deg,#7c6ff7,#a78bfa)",
      "--msg-other-bg":     "rgba(255,255,255,0.10)",
      "--msg-other-text":   "#f0f0f5",
      "--danger":           "#f43f5e",
      "--success":          "#10b981",
      "--warning":          "#f59e0b",
      "--shadow-card":      "0 24px 60px rgba(0,0,0,0.5)",
      "--shadow-glow":      "0 0 40px rgba(124,111,247,0.15)",
      "--sidebar-blur":     "blur(20px)",
      "--scrollbar-thumb":  "rgba(124,111,247,0.4)",
      "--chart-grid":       "rgba(255,255,255,0.08)",
      "--chart-text":       "rgba(240,240,245,0.5)",
    },
    preview: ["#0a0a0f", "#7c6ff7", "#12121a"],
  },
  {
    id: "aurora",
    name: "Aurora",
    emoji: "🌌",
    description: "Northern lights",
    isDark: true,
    vars: {
      "--bg-primary":       "#050d1a",
      "--bg-secondary":     "#091424",
      "--bg-panel":         "rgba(0,210,200,0.06)",
      "--bg-card":          "rgba(0,210,200,0.03)",
      "--bg-input":         "rgba(0,210,200,0.08)",
      "--border":           "rgba(0,210,200,0.15)",
      "--border-focus":     "rgba(0,210,200,0.7)",
      "--text-primary":     "#e0faff",
      "--text-secondary":   "rgba(224,250,255,0.5)",
      "--text-muted":       "rgba(224,250,255,0.25)",
      "--accent":           "#00d2c8",
      "--accent-alt":       "#67e8f9",
      "--accent-glow":      "rgba(0,210,200,0.30)",
      "--accent-subtle":    "rgba(0,210,200,0.10)",
      "--nav-active":       "rgba(0,210,200,0.12)",
      "--nav-hover":        "rgba(0,210,200,0.06)",
      "--msg-me-bg":        "linear-gradient(135deg,#00d2c8,#67e8f9)",
      "--msg-other-bg":     "rgba(0,210,200,0.10)",
      "--msg-other-text":   "#e0faff",
      "--danger":           "#f43f5e",
      "--success":          "#00d2c8",
      "--warning":          "#f59e0b",
      "--shadow-card":      "0 24px 60px rgba(0,0,0,0.55)",
      "--shadow-glow":      "0 0 40px rgba(0,210,200,0.15)",
      "--sidebar-blur":     "blur(24px)",
      "--scrollbar-thumb":  "rgba(0,210,200,0.4)",
      "--chart-grid":       "rgba(0,210,200,0.1)",
      "--chart-text":       "rgba(224,250,255,0.5)",
    },
    preview: ["#050d1a", "#00d2c8", "#091424"],
  },
  {
    id: "crimson",
    name: "Crimson",
    emoji: "🔴",
    description: "Bold & dramatic",
    isDark: true,
    vars: {
      "--bg-primary":       "#0f0508",
      "--bg-secondary":     "#1a080d",
      "--bg-panel":         "rgba(220,38,38,0.08)",
      "--bg-card":          "rgba(220,38,38,0.04)",
      "--bg-input":         "rgba(220,38,38,0.08)",
      "--border":           "rgba(220,38,38,0.18)",
      "--border-focus":     "rgba(239,68,68,0.7)",
      "--text-primary":     "#ffe8e8",
      "--text-secondary":   "rgba(255,232,232,0.5)",
      "--text-muted":       "rgba(255,232,232,0.25)",
      "--accent":           "#ef4444",
      "--accent-alt":       "#fca5a5",
      "--accent-glow":      "rgba(239,68,68,0.30)",
      "--accent-subtle":    "rgba(239,68,68,0.10)",
      "--nav-active":       "rgba(239,68,68,0.14)",
      "--nav-hover":        "rgba(239,68,68,0.07)",
      "--msg-me-bg":        "linear-gradient(135deg,#ef4444,#fca5a5)",
      "--msg-other-bg":     "rgba(239,68,68,0.10)",
      "--msg-other-text":   "#ffe8e8",
      "--danger":           "#ef4444",
      "--success":          "#10b981",
      "--warning":          "#f59e0b",
      "--shadow-card":      "0 24px 60px rgba(0,0,0,0.55)",
      "--shadow-glow":      "0 0 40px rgba(239,68,68,0.15)",
      "--sidebar-blur":     "blur(20px)",
      "--scrollbar-thumb":  "rgba(239,68,68,0.4)",
      "--chart-grid":       "rgba(239,68,68,0.1)",
      "--chart-text":       "rgba(255,232,232,0.5)",
    },
    preview: ["#0f0508", "#ef4444", "#1a080d"],
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌿",
    description: "Organic & calm",
    isDark: true,
    vars: {
      "--bg-primary":       "#060f08",
      "--bg-secondary":     "#0c1a0e",
      "--bg-panel":         "rgba(16,185,129,0.07)",
      "--bg-card":          "rgba(16,185,129,0.03)",
      "--bg-input":         "rgba(16,185,129,0.08)",
      "--border":           "rgba(16,185,129,0.15)",
      "--border-focus":     "rgba(16,185,129,0.7)",
      "--text-primary":     "#e0faea",
      "--text-secondary":   "rgba(224,250,234,0.5)",
      "--text-muted":       "rgba(224,250,234,0.25)",
      "--accent":           "#10b981",
      "--accent-alt":       "#6ee7b7",
      "--accent-glow":      "rgba(16,185,129,0.28)",
      "--accent-subtle":    "rgba(16,185,129,0.10)",
      "--nav-active":       "rgba(16,185,129,0.13)",
      "--nav-hover":        "rgba(16,185,129,0.06)",
      "--msg-me-bg":        "linear-gradient(135deg,#10b981,#6ee7b7)",
      "--msg-other-bg":     "rgba(16,185,129,0.10)",
      "--msg-other-text":   "#e0faea",
      "--danger":           "#f43f5e",
      "--success":          "#10b981",
      "--warning":          "#f59e0b",
      "--shadow-card":      "0 24px 60px rgba(0,0,0,0.55)",
      "--shadow-glow":      "0 0 40px rgba(16,185,129,0.12)",
      "--sidebar-blur":     "blur(20px)",
      "--scrollbar-thumb":  "rgba(16,185,129,0.4)",
      "--chart-grid":       "rgba(16,185,129,0.1)",
      "--chart-text":       "rgba(224,250,234,0.5)",
    },
    preview: ["#060f08", "#10b981", "#0c1a0e"],
  },
  {
    id: "gold",
    name: "Gold",
    emoji: "✨",
    description: "Luxury & refined",
    isDark: true,
    vars: {
      "--bg-primary":       "#0d0a04",
      "--bg-secondary":     "#181208",
      "--bg-panel":         "rgba(245,158,11,0.07)",
      "--bg-card":          "rgba(245,158,11,0.03)",
      "--bg-input":         "rgba(245,158,11,0.08)",
      "--border":           "rgba(245,158,11,0.16)",
      "--border-focus":     "rgba(245,158,11,0.7)",
      "--text-primary":     "#fff8e6",
      "--text-secondary":   "rgba(255,248,230,0.5)",
      "--text-muted":       "rgba(255,248,230,0.25)",
      "--accent":           "#f59e0b",
      "--accent-alt":       "#fcd34d",
      "--accent-glow":      "rgba(245,158,11,0.28)",
      "--accent-subtle":    "rgba(245,158,11,0.10)",
      "--nav-active":       "rgba(245,158,11,0.13)",
      "--nav-hover":        "rgba(245,158,11,0.06)",
      "--msg-me-bg":        "linear-gradient(135deg,#f59e0b,#fcd34d)",
      "--msg-other-bg":     "rgba(245,158,11,0.10)",
      "--msg-other-text":   "#fff8e6",
      "--danger":           "#f43f5e",
      "--success":          "#10b981",
      "--warning":          "#f59e0b",
      "--shadow-card":      "0 24px 60px rgba(0,0,0,0.55)",
      "--shadow-glow":      "0 0 40px rgba(245,158,11,0.12)",
      "--sidebar-blur":     "blur(20px)",
      "--scrollbar-thumb":  "rgba(245,158,11,0.4)",
      "--chart-grid":       "rgba(245,158,11,0.1)",
      "--chart-text":       "rgba(255,248,230,0.5)",
    },
    preview: ["#0d0a04", "#f59e0b", "#181208"],
  },
  {
    id: "rose",
    name: "Rose",
    emoji: "🌸",
    description: "Soft & elegant",
    isDark: true,
    vars: {
      "--bg-primary":       "#0f080c",
      "--bg-secondary":     "#1a0d13",
      "--bg-panel":         "rgba(244,114,182,0.07)",
      "--bg-card":          "rgba(244,114,182,0.03)",
      "--bg-input":         "rgba(244,114,182,0.08)",
      "--border":           "rgba(244,114,182,0.15)",
      "--border-focus":     "rgba(244,114,182,0.7)",
      "--text-primary":     "#ffe8f2",
      "--text-secondary":   "rgba(255,232,242,0.5)",
      "--text-muted":       "rgba(255,232,242,0.25)",
      "--accent":           "#f472b6",
      "--accent-alt":       "#fbcfe8",
      "--accent-glow":      "rgba(244,114,182,0.28)",
      "--accent-subtle":    "rgba(244,114,182,0.10)",
      "--nav-active":       "rgba(244,114,182,0.13)",
      "--nav-hover":        "rgba(244,114,182,0.06)",
      "--msg-me-bg":        "linear-gradient(135deg,#f472b6,#fbcfe8)",
      "--msg-other-bg":     "rgba(244,114,182,0.10)",
      "--msg-other-text":   "#ffe8f2",
      "--danger":           "#f43f5e",
      "--success":          "#10b981",
      "--warning":          "#f59e0b",
      "--shadow-card":      "0 24px 60px rgba(0,0,0,0.55)",
      "--shadow-glow":      "0 0 40px rgba(244,114,182,0.12)",
      "--sidebar-blur":     "blur(20px)",
      "--scrollbar-thumb":  "rgba(244,114,182,0.4)",
      "--chart-grid":       "rgba(244,114,182,0.1)",
      "--chart-text":       "rgba(255,232,242,0.5)",
    },
    preview: ["#0f080c", "#f472b6", "#1a0d13"],
  },
  {
    id: "arctic",
    name: "Arctic",
    emoji: "🧊",
    description: "Cool & minimal",
    isDark: false,
    vars: {
      "--bg-primary":       "#f4f7fb",
      "--bg-secondary":     "#e8eef6",
      "--bg-panel":         "rgba(59,130,246,0.06)",
      "--bg-card":          "rgba(59,130,246,0.04)",
      "--bg-input":         "rgba(59,130,246,0.07)",
      "--border":           "rgba(59,130,246,0.14)",
      "--border-focus":     "rgba(59,130,246,0.6)",
      "--text-primary":     "#1e2a3a",
      "--text-secondary":   "rgba(30, 30, 31, 0.55)",
      "--text-muted":       "rgba(30,42,58,0.30)",
      "--accent":           "#3b82f6",
      "--accent-alt":       "#93c5fd",
      "--accent-glow":      "rgba(59,130,246,0.20)",
      "--accent-subtle":    "rgba(59,130,246,0.08)",
      "--nav-active":       "rgba(59,130,246,0.10)",
      "--nav-hover":        "rgba(59,130,246,0.05)",
      "--msg-me-bg":        "linear-gradient(135deg,#3b82f6,#93c5fd)",
      "--msg-other-bg":     "rgba(59,130,246,0.10)",
      "--msg-other-text":   "#1e2a3a",
      "--danger":           "#ef4444",
      "--success":          "#10b981",
      "--warning":          "#f59e0b",
      "--shadow-card":      "0 8px 32px rgba(59,130,246,0.10)",
      "--shadow-glow":      "0 0 30px rgba(59,130,246,0.10)",
      "--sidebar-blur":     "blur(16px)",
      "--scrollbar-thumb":  "rgba(59,130,246,0.3)",
      "--chart-grid":       "rgba(30,42,58,0.08)",
      "--chart-text":       "rgba(30,42,58,0.5)",
    },
    preview: ["#f4f7fb", "#3b82f6", "#e8eef6"],
  },
  {
    id: "slate",
    name: "Slate",
    emoji: "🌫️",
    description: "Muted & focused",
    isDark: true,
    vars: {
      "--bg-primary":       "#0e1117",
      "--bg-secondary":     "#161b26",
      "--bg-panel":         "rgba(148,163,184,0.07)",
      "--bg-card":          "rgba(148,163,184,0.03)",
      "--bg-input":         "rgba(148,163,184,0.08)",
      "--border":           "rgba(148,163,184,0.12)",
      "--border-focus":     "rgba(148,163,184,0.5)",
      "--text-primary":     "#e2e8f0",
      "--text-secondary":   "rgba(226,232,240,0.45)",
      "--text-muted":       "rgba(226,232,240,0.25)",
      "--accent":           "#94a3b8",
      "--accent-alt":       "#6c9ecf",
      "--accent-glow":      "rgba(148,163,184,0.20)",
      "--accent-subtle":    "rgba(148,163,184,0.08)",
      "--nav-active":       "rgba(148,163,184,0.10)",
      "--nav-hover":        "rgba(148,163,184,0.05)",
      "--msg-me-bg":        "linear-gradient(135deg,#94a3b8,#cbd5e1)",
      "--msg-other-bg":     "rgba(148,163,184,0.10)",
      "--msg-other-text":   "#e2e8f0",
      "--danger":           "#f43f5e",
      "--success":          "#10b981",
      "--warning":          "#f59e0b",
      "--shadow-card":      "0 24px 60px rgba(0,0,0,0.5)",
      "--shadow-glow":      "0 0 30px rgba(148,163,184,0.08)",
      "--sidebar-blur":     "blur(20px)",
      "--scrollbar-thumb":  "rgba(148,163,184,0.3)",
      "--chart-grid":       "rgba(148,163,184,0.08)",
      "--chart-text":       "rgba(226,232,240,0.45)",
    },
    preview: ["#0e1117", "#94a3b8", "#161b26"],
  },
];

const ThemeContext = createContext(null);

// Inject global scrollbar + transition styles once
const GLOBAL_STYLE_ID = "theme-global-styles";
function injectGlobalStyles() {
  if (document.getElementById(GLOBAL_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = GLOBAL_STYLE_ID;
  style.textContent = `
    *, *::before, *::after {
      transition-property: background-color, border-color, color, box-shadow;
      transition-duration: 350ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb, rgba(255,255,255,0.15));
      border-radius: 99px;
    }
    input, textarea, select, button {
      transition-property: background-color, border-color, color, box-shadow, transform, opacity !important;
    }
  `;
  document.head.appendChild(style);
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdRaw] = useState(
    () => localStorage.getItem("app-theme") || "obsidian"
  );
  const [transitioning, setTransitioning] = useState(false);

  const theme = useMemo(
    () => THEMES.find((t) => t.id === themeId) || THEMES[0],
    [themeId]
  );

  const setThemeId = useCallback((id) => {
    setTransitioning(true);
    // Flash overlay for a smooth transition
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;pointer-events:none;
      background:var(--accent);opacity:0;
      transition:opacity 150ms ease;
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = "0.08";
      setTimeout(() => {
        setThemeIdRaw(id);
        overlay.style.opacity = "0";
        setTimeout(() => {
          document.body.removeChild(overlay);
          setTransitioning(false);
        }, 350);
      }, 150);
    });
  }, []);

  useEffect(() => {
    injectGlobalStyles();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem("app-theme", themeId);
  }, [themeId, theme]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme, themes: THEMES, transitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};