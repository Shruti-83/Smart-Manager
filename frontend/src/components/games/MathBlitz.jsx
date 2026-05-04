import { useState, useEffect, useRef } from "react";

function generate() {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === "+") { a = Math.floor(Math.random()*50)+1; b = Math.floor(Math.random()*50)+1; answer = a+b; }
  if (op === "-") { a = Math.floor(Math.random()*50)+10; b = Math.floor(Math.random()*a)+1; answer = a-b; }
  if (op === "×") { a = Math.floor(Math.random()*12)+1; b = Math.floor(Math.random()*12)+1; answer = a*b; }
  return { question: `${a} ${op} ${b}`, answer };
}

export default function MathBlitz({ onBack }) {
  const [q, setQ]           = useState(generate());
  const [input, setInput]   = useState("");
  const [score, setScore]   = useState(0);
  const [wrong, setWrong]   = useState(0);
  const [time, setTime]     = useState(30);
  const [done, setDone]     = useState(false);
  const [flash, setFlash]   = useState(null); // "right" | "wrong"
  const inputRef            = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTime(p => {
      if (p <= 1) { setDone(true); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [done]);

  const submit = () => {
    if (!input.trim()) return;
    if (parseInt(input) === q.answer) {
      setScore(s => s + 1);
      setFlash("right");
    } else {
      setWrong(w => w + 1);
      setFlash("wrong");
    }
    setTimeout(() => setFlash(null), 300);
    setInput("");
    setQ(generate());
    inputRef.current?.focus();
  };

  const accuracy = score + wrong === 0 ? 100 : Math.round((score / (score + wrong)) * 100);

  return (
    <div className="p-6 text-white max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} style={{
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "6px 14px", color: "var(--text-secondary)",
          cursor: "pointer", fontSize: 13,
        }}>← Back</button>
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>⚡ Math Blitz</h2>
      </div>

      {/* timer bar */}
      <div style={{
        height: 6, borderRadius: 99, background: "var(--bg-panel)",
        border: "1px solid var(--border)", marginBottom: 24, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 99, transition: "width 1s linear, background 1s",
          width: `${(time / 30) * 100}%`,
          background: time > 10 ? "#10b981" : time > 5 ? "#f59e0b" : "#ef4444",
        }} />
      </div>

      <div className="flex gap-4 mb-8">
        {[["Score", score, "#10b981"], ["Wrong", wrong, "#ef4444"], ["Time", `${time}s`, "var(--accent)"], ["Accuracy", `${accuracy}%`, "#f59e0b"]].map(([l, v, c]) => (
          <div key={l} style={{
            flex: 1, textAlign: "center", background: "var(--bg-panel)",
            border: "1px solid var(--border)", borderRadius: 14, padding: "10px 0",
          }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</p>
            <p style={{ fontSize: 10, color: "var(--text-secondary)" }}>{l}</p>
          </div>
        ))}
      </div>

      {done ? (
        <div style={{
          textAlign: "center", padding: "40px 24px",
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {score >= 15 ? "🏆" : score >= 8 ? "⭐" : "💪"}
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>
            {score >= 15 ? "Outstanding!" : score >= 8 ? "Nice Work!" : "Keep Practicing!"}
          </h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            {score} correct · {wrong} wrong · {accuracy}% accuracy
          </p>
          <button onClick={() => { setScore(0); setWrong(0); setTime(30); setDone(false); setQ(generate()); setTimeout(() => inputRef.current?.focus(), 50); }}
            style={{
              background: "var(--accent)", color: "white", border: "none",
              borderRadius: 12, padding: "10px 28px", cursor: "pointer", fontSize: 14, fontWeight: 600,
            }}>Play Again</button>
        </div>
      ) : (
        <div style={{
          background: flash === "right" ? "rgba(16,185,129,0.1)" : flash === "wrong" ? "rgba(239,68,68,0.1)" : "var(--bg-panel)",
          border: `1px solid ${flash === "right" ? "#10b981" : flash === "wrong" ? "#ef4444" : "var(--border)"}`,
          borderRadius: 20, padding: "36px 24px", textAlign: "center",
          transition: "all 0.15s",
        }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Solve this:</p>
          <p style={{ fontSize: 48, fontWeight: 800, color: "var(--text-primary)", marginBottom: 28 }}>{q.question}</p>
          <input
            ref={inputRef}
            type="number"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Your answer..."
            style={{
              width: "100%", padding: "14px 18px", borderRadius: 14, fontSize: 20,
              background: "var(--bg-input)", border: "1px solid var(--border)",
              color: "var(--text-primary)", outline: "none", textAlign: "center",
              marginBottom: 14,
            }}
          />
          <button onClick={submit} style={{
            width: "100%", padding: "12px", borderRadius: 14,
            background: "var(--accent)", color: "white", border: "none",
            cursor: "pointer", fontSize: 15, fontWeight: 700,
          }}>Submit ↵</button>
        </div>
      )}
    </div>
  );
}