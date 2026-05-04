import { useState, useEffect, useRef } from "react";

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog",
  "Focus on what matters and let go of the rest",
  "Success is the sum of small efforts repeated daily",
  "Every expert was once a beginner who never quit",
  "The brain is a muscle that grows stronger with use",
  "Clarity of mind leads to clarity of action always",
  "Hard work beats talent when talent does not work hard",
];

export default function TypingRacer({ onBack }) {
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

  const init = () => {
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
  };

  useEffect(() => { init(); }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    if (!started) {
      setStarted(true);
      const t = Date.now();
      setStartTime(t);
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - t) / 1000));
      }, 500);
    }
    setInput(val);

    // accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === sentence[i]) correct++;
    }
    setAccuracy(val.length === 0 ? 100 : Math.round((correct / val.length) * 100));

    // done
    if (val === sentence) {
      clearInterval(timerRef.current);
      const secs = (Date.now() - startTime) / 1000;
      const words = sentence.split(" ").length;
      setWpm(Math.round((words / secs) * 60));
      setDone(true);
    }
  };

  // colored character display
  const renderSentence = () => sentence.split("").map((char, i) => {
    let color = "var(--text-muted)";
    if (i < input.length) color = input[i] === char ? "#10b981" : "#ef4444";
    return (
      <span key={i} style={{
        color,
        borderBottom: i === input.length ? "2px solid var(--accent)" : "none",
        transition: "color 0.1s",
      }}>
        {char}
      </span>
    );
  });

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} style={{
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "6px 14px", color: "var(--text-secondary)",
          cursor: "pointer", fontSize: 13,
        }}>← Back</button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>⌨️ Typing Racer</h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Type the sentence accurately</p>
        </div>
        <div className="ml-auto flex gap-3">
          {[["Time", `${elapsed}s`], ["Accuracy", `${accuracy}%`]].map(([l, v]) => (
            <div key={l} style={{
              textAlign: "center", background: "var(--bg-panel)",
              border: "1px solid var(--border)", borderRadius: 12, padding: "8px 14px",
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>{v}</p>
              <p style={{ fontSize: 10, color: "var(--text-secondary)" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* progress bar */}
      <div style={{
        height: 4, borderRadius: 99, background: "var(--bg-panel)",
        border: "1px solid var(--border)", marginBottom: 24, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: "linear-gradient(90deg, var(--accent), var(--accent-alt))",
          transition: "width 0.1s",
          width: `${(input.length / sentence.length) * 100}%`,
        }} />
      </div>

      {done ? (
        <div style={{
          textAlign: "center", padding: "40px 24px",
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {wpm >= 60 ? "🚀" : wpm >= 40 ? "⭐" : "💪"}
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>
            {wpm >= 60 ? "Blazing Fast!" : wpm >= 40 ? "Great Speed!" : "Keep Practicing!"}
          </h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            {wpm} WPM · {accuracy}% accuracy · {elapsed}s
          </p>
          <button onClick={init} style={{
            background: "var(--accent)", color: "white", border: "none",
            borderRadius: 12, padding: "10px 28px", cursor: "pointer", fontSize: 14, fontWeight: 600,
          }}>Try Again</button>
        </div>
      ) : (
        <>
          <div style={{
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            borderRadius: 18, padding: "24px", marginBottom: 16,
            fontSize: 20, lineHeight: 1.8, letterSpacing: "0.02em",
            fontFamily: "monospace",
          }}>
            {renderSentence()}
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            placeholder={started ? "" : "Start typing to begin..."}
            style={{
              width: "100%", padding: "14px 18px", borderRadius: 14, fontSize: 16,
              background: "var(--bg-input)", border: "1px solid var(--border)",
              color: "var(--text-primary)", outline: "none", fontFamily: "monospace",
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />

          <button onClick={init} style={{
            marginTop: 12, background: "var(--bg-panel)",
            border: "1px solid var(--border)", borderRadius: 10,
            padding: "8px 20px", color: "var(--text-secondary)",
            cursor: "pointer", fontSize: 13, width: "100%",
          }}>↺ New Sentence</button>
        </>
      )}
    </div>
  );
}