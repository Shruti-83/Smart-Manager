import { useState, useEffect, useRef, useCallback } from "react";

/* ─── GAME REGISTRY ─────────────────────────────────── */
const GAMES = [
  {
    id: "memory",
    title: "Neural Match",
    subtitle: "Memory Matrix",
    emoji: "🧠",
    icon: "◈",
    description: "Flip tiles and match pairs before your memory fades",
    tags: ["Memory", "Focus"],
    color: "#7c6ff7",
    glow: "rgba(124,111,247,0.4)",
    difficulty: 2,
    bestKey: "best_memory",
  },
  {
    id: "math",
    title: "Math Blitz",
    subtitle: "Speed Arithmetic",
    emoji: "⚡",
    icon: "∑",
    description: "30 seconds. Infinite equations. How sharp is your mind?",
    tags: ["Logic", "Speed"],
    color: "#10b981",
    glow: "rgba(16,185,129,0.4)",
    difficulty: 3,
    bestKey: "best_math",
  },
  {
    id: "typing",
    title: "Type Racer",
    subtitle: "Keystroke Precision",
    emoji: "⌨️",
    icon: "≋",
    description: "Race against yourself. Words per minute. No mercy.",
    tags: ["Focus", "Accuracy"],
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.4)",
    difficulty: 1,
    bestKey: "best_typing",
  },
  {
    id: "sequence",
    title: "Echo",
    subtitle: "Pattern Memory",
    emoji: "🎯",
    icon: "◎",
    description: "Watch the pattern. Repeat it. Each round gets harder.",
    tags: ["Pattern", "Memory"],
    color: "#f472b6",
    glow: "rgba(244,114,182,0.4)",
    difficulty: 2,
    bestKey: "best_sequence",
  },
  {
    id: "reaction",
    title: "Reflex",
    subtitle: "Reaction Time",
    emoji: "🚀",
    icon: "◉",
    description: "Click when the signal fires. Measure your raw reaction time.",
    tags: ["Reflex", "Speed"],
    color: "#ef4444",
    glow: "rgba(239,68,68,0.4)",
    difficulty: 1,
    bestKey: "best_reaction",
  },
  {
    id: "wordle",
    title: "Word Forge",
    subtitle: "Deduction Game",
    emoji: "📝",
    icon: "◫",
    description: "Guess the hidden 5-letter word in 6 tries using logic.",
    tags: ["Vocabulary", "Logic"],
    color: "#00d2c8",
    glow: "rgba(0,210,200,0.4)",
    difficulty: 3,
    bestKey: "best_wordle",
  },
];

/* ─── HELPERS ────────────────────────────────────────── */
const getBest = (key) => localStorage.getItem(key) || null;
const setBest = (key, val) => {
  const prev = getBest(key);
  if (!prev || val > parseInt(prev)) localStorage.setItem(key, val);
};

/* ─── MAIN HUB ───────────────────────────────────────── */
export default function GamesPage() {
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [bests, setBests] = useState({});

  useEffect(() => {
    const b = {};
    GAMES.forEach((g) => { b[g.id] = getBest(g.bestKey); });
    setBests(b);
  }, [active]);

  const game = GAMES.find((g) => g.id === active);

  if (active === "memory")   return <MemoryGame   onBack={() => setActive(null)} config={GAMES[0]} />;
  if (active === "math")     return <MathBlitz    onBack={() => setActive(null)} config={GAMES[1]} />;
  if (active === "typing")   return <TypingRacer  onBack={() => setActive(null)} config={GAMES[2]} />;
  if (active === "sequence") return <SequenceGame onBack={() => setActive(null)} config={GAMES[3]} />;
  if (active === "reaction") return <ReactionGame onBack={() => setActive(null)} config={GAMES[4]} />;
  if (active === "wordle")   return <WordleGame   onBack={() => setActive(null)} config={GAMES[5]} />;

  return (
    <div style={{ padding: "28px 24px", minHeight: "100%", color: "var(--text-primary)" }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, var(--accent), var(--accent-alt))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 0 24px var(--accent-glow)",
          }}>🎮</div>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--accent)", fontWeight: 700, marginBottom: 2 }}>
              BRAIN TRAINING CENTER
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Game Hub
            </h1>
          </div>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 480 }}>
          Six brain-training games designed to sharpen focus, memory, logic and reaction time. 
          Take a break — your brain will thank you.
        </p>
      </div>

      {/* ── GRID ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
      }}>
        {GAMES.map((g) => {
          const isHov = hovered === g.id;
          const best = bests[g.id];
          return (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              onMouseEnter={() => setHovered(g.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHov
                  ? `radial-gradient(circle at 30% 40%, ${g.glow.replace("0.4", "0.08")} 0%, var(--bg-panel) 70%)`
                  : "var(--bg-panel)",
                border: `1px solid ${isHov ? g.color + "55" : "var(--border)"}`,
                borderRadius: 20,
                padding: "22px 20px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
                transform: isHov ? "translateY(-5px) scale(1.01)" : "translateY(0) scale(1)",
                boxShadow: isHov ? `0 20px 50px ${g.glow.replace("0.4", "0.25")}` : "none",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${g.color}, transparent)`,
                opacity: isHov ? 1 : 0, transition: "opacity 0.28s",
              }} />

              {/* icon */}
              <div style={{
                width: 50, height: 50, borderRadius: 16, marginBottom: 16,
                background: `${g.color}18`,
                border: `1px solid ${g.color}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
                boxShadow: isHov ? `0 0 20px ${g.glow}` : "none",
                transition: "box-shadow 0.28s",
              }}>
                {g.emoji}
              </div>

              {/* text */}
              <p style={{ fontSize: 9, letterSpacing: "0.15em", color: g.color, fontWeight: 700, marginBottom: 4 }}>
                {g.subtitle.toUpperCase()}
              </p>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                {g.title}
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                {g.description}
              </p>

              {/* tags + difficulty */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {g.tags.map(t => (
                  <span key={t} style={{
                    fontSize: 10, padding: "3px 9px", borderRadius: 99,
                    background: `${g.color}12`, color: g.color,
                    border: `1px solid ${g.color}25`, fontWeight: 600,
                  }}>{t}</span>
                ))}
                <span style={{
                  fontSize: 10, padding: "3px 9px", borderRadius: 99,
                  background: "var(--bg-card)", color: "var(--text-secondary)",
                  border: "1px solid var(--border)", marginLeft: "auto",
                }}>
                  {"●".repeat(g.difficulty)}{"○".repeat(3 - g.difficulty)}
                </span>
              </div>

              {/* footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: g.color,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  Play Now
                  <span style={{
                    display: "inline-block",
                    transform: isHov ? "translateX(4px)" : "translateX(0)",
                    transition: "transform 0.2s",
                  }}>→</span>
                </span>
                {best && (
                  <span style={{
                    fontSize: 10, color: "var(--text-muted)",
                    background: "var(--bg-card)", padding: "2px 8px",
                    borderRadius: 99, border: "1px solid var(--border)",
                  }}>
                    Best: {best}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── SHARED SHELL ───────────────────────────────────── */
function GameShell({ config, onBack, stats, onRestart, children, won, playing }) {
  return (
    <div style={{ padding: "24px", maxWidth: 680, margin: "0 auto", color: "var(--text-primary)" }}>
      {/* header bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "12px 16px",
      }}>
        <button onClick={onBack} style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "6px 12px", color: "var(--text-secondary)",
          cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-input)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--bg-card)"; }}
        >← Hub</button>

        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `${config.color}18`, border: `1px solid ${config.color}35`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>{config.emoji}</div>

        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>{config.title}</h2>
          <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0, letterSpacing: "0.1em" }}>{config.subtitle.toUpperCase()}</p>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {stats.map(([label, value, color]) => (
            <div key={label} style={{
              textAlign: "center", background: "var(--bg-card)",
              border: "1px solid var(--border)", borderRadius: 10,
              padding: "6px 12px", minWidth: 52,
            }}>
              <p style={{ fontSize: 15, fontWeight: 800, margin: 0, color: color || config.color }}>{value}</p>
              <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0, letterSpacing: "0.08em" }}>{label}</p>
            </div>
          ))}
        </div>

        {onRestart && (
          <button onClick={onRestart} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "6px 12px", color: "var(--text-secondary)",
            cursor: "pointer", fontSize: 12, transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = config.color; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
          >↺</button>
        )}
      </div>

      {children}
    </div>
  );
}

/* ─── WIN SCREEN ─────────────────────────────────────── */
function WinScreen({ config, lines, onRestart, onBack }) {
  return (
    <div style={{
      textAlign: "center", padding: "52px 32px",
      background: `radial-gradient(circle at 50% 40%, ${config.glow.replace("0.4","0.08")} 0%, var(--bg-panel) 70%)`,
      border: `1px solid ${config.color}40`,
      borderRadius: 24,
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{lines[0]}</div>
      <h3 style={{ fontSize: 26, fontWeight: 800, color: config.color, marginBottom: 6 }}>{lines[1]}</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>{lines[2]}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={onRestart} style={{
          background: config.color, color: "white", border: "none",
          borderRadius: 12, padding: "12px 32px", cursor: "pointer",
          fontSize: 14, fontWeight: 700, boxShadow: `0 8px 24px ${config.glow}`,
        }}>Play Again</button>
        <button onClick={onBack} style={{
          background: "var(--bg-panel)", color: "var(--text-secondary)",
          border: "1px solid var(--border)", borderRadius: 12,
          padding: "12px 24px", cursor: "pointer", fontSize: 14,
        }}>← Hub</button>
      </div>
    </div>
  );
}

/* ─── 1. MEMORY GAME ─────────────────────────────────── */
const MEM_EMOJIS = ["🧠","⚡","🎯","🔥","💎","🌊","🎲","🚀","🦋","🌸","🐉","🎸"];

function MemoryGame({ onBack, config }) {
  const [cards, setCards]     = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves]     = useState(0);
  const [time, setTime]       = useState(0);
  const [done, setDone]       = useState(false);
  const [locked, setLocked]   = useState(false);
  const timerRef              = useRef(null);

  const init = useCallback(() => {
    const pairs = MEM_EMOJIS.slice(0, 8);
    const deck = [...pairs, ...pairs]
      .sort(() => Math.random() - 0.5)
      .map((e, i) => ({ id: i, emoji: e, key: e }));
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setTime(0);
    setDone(false);
    setLocked(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
  }, []);

  useEffect(() => { init(); return () => clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (flipped.length < 2) return;
    const [a, b] = flipped;
    setLocked(true);
    setMoves(m => m + 1);
    if (cards[a].key === cards[b].key) {
      setMatched(prev => {
        const next = new Set(prev);
        next.add(cards[a].key);
        if (next.size === 8) {
          clearInterval(timerRef.current);
          setBest(config.bestKey, moves + 1);
          setTimeout(() => setDone(true), 400);
        }
        return next;
      });
      setFlipped([]);
      setLocked(false);
    } else {
      setTimeout(() => { setFlipped([]); setLocked(false); }, 800);
    }
  }, [flipped]);

  const flip = (i) => {
    if (locked || flipped.includes(i) || matched.has(cards[i]?.key)) return;
    setFlipped(p => [...p, i]);
  };

  if (done) return (
    <div style={{ padding: 24, maxWidth: 680, margin: "0 auto" }}>
      <WinScreen config={config}
        lines={["🎉", `${moves} Moves · ${time}s`, moves < 12 ? "Incredible memory!" : moves < 18 ? "Nice work!" : "Keep practicing!"]}
        onRestart={init} onBack={onBack}
      />
    </div>
  );

  return (
    <GameShell config={config} onBack={onBack} onRestart={init}
      stats={[["Moves", moves], ["Pairs", `${matched.size}/8`], ["Time", `${time}s`]]}
    >
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
      }}>
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.has(card.key);
          const isMatched = matched.has(card.key);
          return (
            <button key={card.id} onClick={() => flip(i)} style={{
              height: 80, borderRadius: 16, fontSize: 28,
              cursor: isFlipped ? "default" : "pointer",
              border: `1.5px solid ${isMatched ? config.color + "60" : isFlipped ? config.color + "80" : "var(--border)"}`,
              background: isMatched
                ? `${config.color}18`
                : isFlipped ? "var(--bg-input)" : "var(--bg-panel)",
              transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              transform: isFlipped ? "scale(1.04)" : "scale(1)",
              boxShadow: isMatched ? `0 0 18px ${config.glow}` : "none",
              color: isFlipped ? "inherit" : "transparent",
            }}>
              {isFlipped ? card.emoji : "?"}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}

/* ─── 2. MATH BLITZ ──────────────────────────────────── */
function genMath() {
  const ops = ["+", "-", "×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === "+") { a = Math.floor(Math.random()*99)+1; b = Math.floor(Math.random()*99)+1; answer = a+b; }
  else if (op === "-") { a = Math.floor(Math.random()*99)+10; b = Math.floor(Math.random()*a)+1; answer = a-b; }
  else if (op === "×") { a = Math.floor(Math.random()*12)+1; b = Math.floor(Math.random()*12)+1; answer = a*b; }
  else { b = Math.floor(Math.random()*11)+2; answer = Math.floor(Math.random()*11)+1; a = b*answer; }
  return { q: `${a} ${op} ${b}`, answer };
}

function MathBlitz({ onBack, config }) {
  const [q, setQ]         = useState(genMath());
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [time, setTime]   = useState(30);
  const [done, setDone]   = useState(false);
  const [flash, setFlash] = useState(null);
  const [streak, setStreak] = useState(0);
  const inputRef          = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const t = setInterval(() => setTime(p => {
      if (p <= 1) { setDone(true); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  const submit = () => {
    if (!input.trim() || done) return;
    const correct = parseInt(input) === q.answer;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFlash("right");
    } else {
      setWrong(w => w + 1);
      setStreak(0);
      setFlash("wrong");
    }
    setTimeout(() => setFlash(null), 250);
    setInput("");
    setQ(genMath());
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (done) setBest(config.bestKey, score);
  }, [done]);

  const acc = score + wrong === 0 ? 100 : Math.round(score / (score + wrong) * 100);
  const timerPct = (time / 30) * 100;
  const timerColor = time > 15 ? "#10b981" : time > 8 ? "#f59e0b" : "#ef4444";

  if (done) return (
    <div style={{ padding: 24, maxWidth: 680, margin: "0 auto" }}>
      <WinScreen config={config}
        lines={[
          score >= 20 ? "🏆" : score >= 12 ? "⭐" : "💪",
          score >= 20 ? "Lightning Brain!" : score >= 12 ? "Sharp Mind!" : "Keep Going!",
          `${score} correct · ${wrong} wrong · ${acc}% accuracy`,
        ]}
        onRestart={() => { setScore(0); setWrong(0); setTime(30); setDone(false); setQ(genMath()); setStreak(0); setTimeout(() => inputRef.current?.focus(), 50); }}
        onBack={onBack}
      />
    </div>
  );

  return (
    <GameShell config={config} onBack={onBack}
      stats={[["Score", score, "#10b981"], ["Wrong", wrong, "#ef4444"], ["Streak", streak, config.color], ["Acc", `${acc}%`]]}
    >
      {/* timer bar */}
      <div style={{ height: 6, borderRadius: 99, background: "var(--bg-panel)", marginBottom: 20, overflow: "hidden", border: "1px solid var(--border)" }}>
        <div style={{ height: "100%", borderRadius: 99, width: `${timerPct}%`, background: timerColor, transition: "width 1s linear, background 1s" }} />
      </div>

      <div style={{
        background: flash === "right" ? "rgba(16,185,129,0.08)" : flash === "wrong" ? "rgba(239,68,68,0.08)" : "var(--bg-panel)",
        border: `1.5px solid ${flash === "right" ? "#10b981" : flash === "wrong" ? "#ef4444" : "var(--border)"}`,
        borderRadius: 22, padding: "40px 28px", textAlign: "center",
        transition: "all 0.15s",
      }}>
        <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-muted)", marginBottom: 12 }}>SOLVE THIS</p>
        <p style={{ fontSize: 54, fontWeight: 900, color: "var(--text-primary)", marginBottom: 32, fontVariantNumeric: "tabular-nums" }}>
          {q.q} <span style={{ color: "var(--text-muted)" }}>=</span> ?
        </p>
        <input
          ref={inputRef}
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Answer..."
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 14, fontSize: 22,
            background: "var(--bg-input)", border: "1px solid var(--border)",
            color: "var(--text-primary)", outline: "none", textAlign: "center",
            marginBottom: 12, boxSizing: "border-box", fontWeight: 700,
          }}
          onFocus={e => e.target.style.borderColor = config.color}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <button onClick={submit} style={{
          width: "100%", padding: "13px", borderRadius: 14, fontSize: 15,
          background: config.color, color: "white", border: "none",
          cursor: "pointer", fontWeight: 800, boxShadow: `0 8px 24px ${config.glow}`,
        }}>Submit ↵</button>
        {streak >= 3 && (
          <p style={{ marginTop: 12, fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>
            🔥 {streak} streak!
          </p>
        )}
      </div>
    </GameShell>
  );
}

/* ─── 3. TYPING RACER ────────────────────────────────── */
const SENTENCES = [
  "The quick brown fox jumps over the lazy dog",
  "Focus sharpens the mind and clears the path forward",
  "Success is the sum of small efforts repeated every day",
  "Every expert was once a beginner who refused to quit",
  "The brain grows stronger with every challenge it faces",
  "Clarity of thought leads to clarity of action always",
  "Hard work beats talent when talent fails to show up",
  "Dream big work hard stay humble and never give up",
];

function TypingRacer({ onBack, config }) {
  const [sentence, setSentence] = useState("");
  const [input, setInput]       = useState("");
  const [started, setStarted]   = useState(false);
  const [done, setDone]         = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed]   = useState(0);
  const [wpm, setWpm]           = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef                = useRef(null);
  const timerRef                = useRef(null);

  const init = useCallback(() => {
    const s = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    setSentence(s);
    setInput("");
    setStarted(false);
    setDone(false);
    setElapsed(0);
    setWpm(0);
    setAccuracy(100);
    clearInterval(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => { init(); return () => clearInterval(timerRef.current); }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    if (!started) {
      setStarted(true);
      const t = Date.now();
      setStartTime(t);
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - t) / 1000)), 200);
    }
    setInput(val);
    let correct = 0;
    for (let i = 0; i < val.length; i++) if (val[i] === sentence[i]) correct++;
    setAccuracy(val.length === 0 ? 100 : Math.round((correct / val.length) * 100));
    if (val === sentence) {
      clearInterval(timerRef.current);
      const secs = (Date.now() - startTime) / 1000 || 1;
      const w = Math.round((sentence.split(" ").length / secs) * 60);
      setWpm(w);
      setBest(config.bestKey, w);
      setDone(true);
    }
  };

  const renderSentence = () => sentence.split("").map((char, i) => {
    let bg = "transparent", color = "var(--text-muted)";
    if (i < input.length) {
      color = input[i] === char ? "#10b981" : "#ef4444";
      if (input[i] !== char) bg = "rgba(239,68,68,0.15)";
    }
    const isCursor = i === input.length;
    return (
      <span key={i} style={{
        color, background: bg, borderRadius: 2,
        borderBottom: isCursor ? `2px solid ${config.color}` : "none",
        transition: "color 0.08s",
      }}>{char}</span>
    );
  });

  const progress = sentence ? (input.length / sentence.length) * 100 : 0;

  if (done) return (
    <div style={{ padding: 24, maxWidth: 680, margin: "0 auto" }}>
      <WinScreen config={config}
        lines={[
          wpm >= 70 ? "🚀" : wpm >= 50 ? "⭐" : "💪",
          wpm >= 70 ? "Speed Demon!" : wpm >= 50 ? "Fast Fingers!" : "Keep Practicing!",
          `${wpm} WPM · ${accuracy}% accuracy · ${elapsed}s`,
        ]}
        onRestart={init} onBack={onBack}
      />
    </div>
  );

  return (
    <GameShell config={config} onBack={onBack} onRestart={init}
      stats={[["WPM", wpm || "—"], ["Acc", `${accuracy}%`], ["Time", `${elapsed}s`]]}
    >
      <div style={{ height: 4, borderRadius: 99, background: "var(--bg-panel)", marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${config.color}, var(--accent-alt))`, width: `${progress}%`, transition: "width 0.1s", borderRadius: 99 }} />
      </div>
      <div style={{
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: 18, padding: "28px", marginBottom: 16,
        fontSize: 19, lineHeight: 1.9, letterSpacing: "0.04em",
        fontFamily: "'Courier New', monospace", wordBreak: "break-all",
      }}>
        {renderSentence()}
      </div>
      <input
        ref={inputRef}
        value={input}
        onChange={handleInput}
        placeholder={started ? "" : "Start typing to begin the race..."}
        style={{
          width: "100%", padding: "14px 18px", borderRadius: 14, fontSize: 16,
          background: "var(--bg-input)", border: "1px solid var(--border)",
          color: "var(--text-primary)", outline: "none",
          fontFamily: "'Courier New', monospace", boxSizing: "border-box",
        }}
        onFocus={e => e.target.style.borderColor = config.color}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
      />
    </GameShell>
  );
}

/* ─── 4. SEQUENCE GAME ───────────────────────────────── */
const SEQ_COLORS = [
  { id: 0, color: "#7c6ff7", label: "◈" },
  { id: 1, color: "#10b981", label: "◈" },
  { id: 2, color: "#f59e0b", label: "◈" },
  { id: 3, color: "#ef4444", label: "◈" },
];

function SequenceGame({ onBack, config }) {
  const [seq, setSeq]         = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [phase, setPhase]     = useState("idle"); // idle | showing | input | won | lost
  const [active, setActive]   = useState(null);
  const [round, setRound]     = useState(0);
  const [best, setBestState]  = useState(parseInt(getBest(config.bestKey)) || 0);

  const show = useCallback(async (sequence) => {
    setPhase("showing");
    await new Promise(r => setTimeout(r, 600));
    for (const id of sequence) {
      setActive(id);
      await new Promise(r => setTimeout(r, 550));
      setActive(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setPhase("input");
  }, []);

  const startRound = useCallback((currentSeq) => {
    const next = [...currentSeq, Math.floor(Math.random() * 4)];
    setSeq(next);
    setUserSeq([]);
    setRound(next.length);
    show(next);
  }, [show]);

  const start = () => startRound([]);

  const press = (id) => {
    if (phase !== "input") return;
    const next = [...userSeq, id];
    setUserSeq(next);
    setActive(id);
    setTimeout(() => setActive(null), 200);

    for (let i = 0; i < next.length; i++) {
      if (next[i] !== seq[i]) {
        setPhase("lost");
        const score = round - 1;
        if (score > best) { setBestState(score); setBest(config.bestKey, score); }
        return;
      }
    }

    if (next.length === seq.length) {
      setTimeout(() => startRound(seq), 700);
    }
  };

  return (
    <GameShell config={config} onBack={onBack}
      stats={[["Round", round], ["Best", best]]}
    >
      <div style={{
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: 22, padding: "40px 28px", textAlign: "center",
      }}>
        {phase === "idle" && (
          <>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 14 }}>
              Watch the sequence, then repeat it. Each round adds one more step.
            </p>
            <button onClick={start} style={{
              background: config.color, color: "white", border: "none",
              borderRadius: 14, padding: "14px 40px", cursor: "pointer",
              fontSize: 16, fontWeight: 800, boxShadow: `0 8px 24px ${config.glow}`,
            }}>Start Game</button>
          </>
        )}

        {phase === "lost" && (
          <WinScreen config={config}
            lines={[
              round > 8 ? "🏆" : round > 4 ? "⭐" : "💪",
              round > 8 ? "Incredible!" : round > 4 ? "Well Done!" : "Nice Try!",
              `You reached round ${round}`,
            ]}
            onRestart={start} onBack={onBack}
          />
        )}

        {(phase === "showing" || phase === "input") && (
          <>
            <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--text-muted)", marginBottom: 8 }}>
              {phase === "showing" ? "WATCH CAREFULLY" : "YOUR TURN"}
            </p>
            <p style={{ fontSize: 32, fontWeight: 900, color: config.color, marginBottom: 36 }}>
              Round {round}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 280, margin: "0 auto" }}>
              {SEQ_COLORS.map(btn => (
                <button
                  key={btn.id}
                  onClick={() => press(btn.id)}
                  disabled={phase === "showing"}
                  style={{
                    height: 100, borderRadius: 20, fontSize: 32,
                    background: active === btn.id ? btn.color : `${btn.color}22`,
                    border: `2px solid ${active === btn.id ? btn.color : btn.color + "44"}`,
                    cursor: phase === "input" ? "pointer" : "default",
                    transition: "all 0.12s",
                    transform: active === btn.id ? "scale(0.95)" : "scale(1)",
                    boxShadow: active === btn.id ? `0 0 30px ${btn.color}80` : "none",
                    color: btn.color,
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 24 }}>
              {seq.map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i < userSeq.length ? config.color : "var(--border)",
                  transition: "background 0.2s",
                }} />
              ))}
            </div>
          </>
        )}
      </div>
    </GameShell>
  );
}

/* ─── 5. REACTION GAME ───────────────────────────────── */
function ReactionGame({ onBack, config }) {
  const [phase, setPhase]   = useState("idle"); // idle | waiting | ready | result
  const [reaction, setReaction] = useState(null);
  const [best, setBestState] = useState(parseInt(getBest(config.bestKey)) || null);
  const [attempts, setAttempts] = useState([]);
  const timeoutRef          = useRef(null);
  const startRef            = useRef(null);
  const [tooEarly, setTooEarly] = useState(false);

  const startWait = () => {
    setPhase("waiting");
    setTooEarly(false);
    const delay = 2000 + Math.random() * 4000;
    timeoutRef.current = setTimeout(() => {
      setPhase("ready");
      startRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (phase === "idle" || phase === "result") { startWait(); return; }
    if (phase === "waiting") {
      clearTimeout(timeoutRef.current);
      setTooEarly(true);
      setPhase("result");
      return;
    }
    if (phase === "ready") {
      const ms = Date.now() - startRef.current;
      setReaction(ms);
      setAttempts(p => [...p, ms]);
      if (!best || ms < best) {
        setBestState(ms);
        setBest(config.bestKey, ms);
      }
      setPhase("result");
    }
  };

  const avg = attempts.length ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) : null;

  const bgColor = phase === "waiting" ? "var(--bg-panel)"
    : phase === "ready" ? `${config.color}22`
    : "var(--bg-panel)";
  const borderColor = phase === "ready" ? config.color : "var(--border)";

  return (
    <GameShell config={config} onBack={onBack}
      stats={[
        ["Best", best ? `${best}ms` : "—"],
        ["Avg", avg ? `${avg}ms` : "—"],
        ["Tries", attempts.length],
      ]}
    >
      <button
        onClick={handleClick}
        style={{
          width: "100%", minHeight: 300, borderRadius: 24,
          background: bgColor, border: `2px solid ${borderColor}`,
          cursor: "pointer", transition: "all 0.2s",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
          boxShadow: phase === "ready" ? `0 0 60px ${config.glow}` : "none",
        }}
      >
        {phase === "idle" && (
          <>
            <div style={{ fontSize: 52 }}>🎯</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Click to Start</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>When the screen lights up — click!</p>
          </>
        )}
        {phase === "waiting" && (
          <>
            <div style={{ fontSize: 48 }}>⏳</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-secondary)" }}>Wait for it...</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Don't click yet!</p>
          </>
        )}
        {phase === "ready" && (
          <>
            <div style={{ fontSize: 64 }}>⚡</div>
            <p style={{ fontSize: 28, fontWeight: 900, color: config.color }}>CLICK NOW!</p>
          </>
        )}
        {phase === "result" && (
          <>
            {tooEarly ? (
              <>
                <div style={{ fontSize: 48 }}>😅</div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#ef4444" }}>Too Early!</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Click to try again</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48 }}>{reaction < 200 ? "🏆" : reaction < 300 ? "⚡" : "👍"}</div>
                <p style={{ fontSize: 42, fontWeight: 900, color: config.color }}>{reaction}ms</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {reaction < 200 ? "Superhuman!" : reaction < 250 ? "Lightning fast!" : reaction < 350 ? "Above average" : "Keep practicing"} · Click to try again
                </p>
              </>
            )}
          </>
        )}
      </button>

      {attempts.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {attempts.map((a, i) => (
            <span key={i} style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 99,
              background: a === Math.min(...attempts) ? `${config.color}20` : "var(--bg-panel)",
              border: `1px solid ${a === Math.min(...attempts) ? config.color + "50" : "var(--border)"}`,
              color: a === Math.min(...attempts) ? config.color : "var(--text-secondary)",
              fontWeight: 600,
            }}>#{i+1}: {a}ms</span>
          ))}
        </div>
      )}
    </GameShell>
  );
}

/* ─── 6. WORDLE GAME ─────────────────────────────────── */
const WORDS = [
  "BRAIN","LIGHT","FLAME","SHARP","SWIFT","POWER","FOCUS","DRIVE","DREAM","MAGIC",
  "BLAZE","CRUSH","GRACE","SPARK","PRIME","STORM","GLYPH","QUEST","BRAVE","CLICK",
  "FLASH","GLOOM","CRISP","FROST","BLOOM","HASTE","PRIDE","SLEEK","BLEND","DANCE",
];

function WordleGame({ onBack, config }) {
  const [word]              = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [done, setDone]     = useState(false);
  const [won, setWon]       = useState(false);
  const [shake, setShake]   = useState(false);

  const getLetterState = (letter, pos, guess) => {
    if (word[pos] === letter) return "correct";
    if (word.includes(letter)) return "present";
    return "absent";
  };

  const submit = () => {
    if (current.length !== 5) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    const newGuesses = [...guesses, current];
    setGuesses(newGuesses);
    setCurrent("");
    if (current === word) { setWon(true); setDone(true); setBest(config.bestKey, 7 - newGuesses.length); return; }
    if (newGuesses.length === 6) setDone(true);
  };

  const stateColors = {
    correct: config.color,
    present: "#f59e0b",
    absent: "var(--bg-input)",
  };
  const stateBorders = {
    correct: config.color,
    present: "#f59e0b",
    absent: "var(--border)",
  };

  // keyboard
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const letterStates = {};
  guesses.forEach(g => {
    g.split("").forEach((l, i) => {
      const s = getLetterState(l, i, g);
      if (!letterStates[l] || s === "correct") letterStates[l] = s;
      else if (s === "present" && letterStates[l] !== "correct") letterStates[l] = s;
      else if (!letterStates[l]) letterStates[l] = s;
    });
  });

  const rows = [...guesses];
  if (!done) rows.push(current.padEnd(5));
  while (rows.length < 6) rows.push("     ");

  return (
    <GameShell config={config} onBack={onBack}
      stats={[["Guesses", guesses.length + "/6"], ["Best", getBest(config.bestKey) ? getBest(config.bestKey) + "⭐" : "—"]]}
    >
      {done && (
        <WinScreen config={config}
          lines={[
            won ? (guesses.length <= 3 ? "🏆" : "⭐") : "💀",
            won ? (guesses.length <= 3 ? "Genius!" : "Solved!") : `The word was ${word}`,
            won ? `Found in ${guesses.length} guess${guesses.length !== 1 ? "es" : ""}` : "Better luck next time!",
          ]}
          onRestart={() => window.location.reload()}
          onBack={onBack}
        />
      )}

      {!done && (
        <>
          {/* grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", marginBottom: 20 }}>
            {rows.map((row, ri) => (
              <div key={ri} style={{
                display: "flex", gap: 6,
                animation: shake && ri === guesses.length ? "shake 0.5s" : "none",
              }}>
                {row.split("").map((letter, ci) => {
                  const isGuessed = ri < guesses.length;
                  const state = isGuessed ? getLetterState(letter.trim(), ci, row) : null;
                  const isCurrent = ri === guesses.length;
                  return (
                    <div key={ci} style={{
                      width: 52, height: 52, borderRadius: 12,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 800,
                      background: state ? stateColors[state] : isCurrent && letter.trim() ? "var(--bg-input)" : "var(--bg-panel)",
                      border: `2px solid ${state ? stateBorders[state] : isCurrent && letter.trim() ? "var(--border-focus)" : "var(--border)"}`,
                      color: state ? "white" : "var(--text-primary)",
                      transition: "all 0.2s",
                      boxShadow: state === "correct" ? `0 0 16px ${config.glow}` : "none",
                    }}>
                      {letter.trim()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* input */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              value={current}
              onChange={e => setCurrent(e.target.value.toUpperCase().slice(0, 5))}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="Type 5-letter word"
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 12, fontSize: 18,
                background: "var(--bg-input)", border: "1px solid var(--border)",
                color: "var(--text-primary)", outline: "none",
                fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              }}
              onFocus={e => e.target.style.borderColor = config.color}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button onClick={submit} style={{
              background: config.color, color: "white", border: "none",
              borderRadius: 12, padding: "12px 20px", cursor: "pointer",
              fontSize: 15, fontWeight: 800,
            }}>↵</button>
          </div>

          {/* keyboard hints */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
            {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map(l => {
              const s = letterStates[l];
              return (
                <button key={l}
                  onClick={() => setCurrent(p => (p + l).slice(0, 5))}
                  style={{
                    width: 30, height: 34, borderRadius: 6, fontSize: 11,
                    fontWeight: 700, cursor: "pointer",
                    background: s === "correct" ? config.color : s === "present" ? "#f59e0b" : s === "absent" ? "var(--bg-card)" : "var(--bg-panel)",
                    border: `1px solid ${s ? "transparent" : "var(--border)"}`,
                    color: s ? "white" : "var(--text-primary)",
                    opacity: s === "absent" ? 0.4 : 1,
                  }}
                >{l}</button>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </GameShell>
  );
}