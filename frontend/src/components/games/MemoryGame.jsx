import { useState, useEffect } from "react";

const EMOJIS = ["🧠","⚡","🎯","🔥","💎","🌊","🎲","🚀"];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MemoryGame({ onBack }) {
  const [cards, setCards]       = useState([]);
  const [flipped, setFlipped]   = useState([]);
  const [matched, setMatched]   = useState([]);
  const [moves, setMoves]       = useState(0);
  const [won, setWon]           = useState(false);
  const [time, setTime]         = useState(0);
  const [running, setRunning]   = useState(false);

  const init = () => {
    const deck = shuffle([...EMOJIS, ...EMOJIS]).map((e, i) => ({ id: i, emoji: e }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWon(false);
    setTime(0);
    setRunning(true);
  };

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (flipped.length < 2) return;
    const [a, b] = flipped;
    if (cards[a].emoji === cards[b].emoji) {
      const newMatched = [...matched, cards[a].emoji];
      setMatched(newMatched);
      setFlipped([]);
      if (newMatched.length === EMOJIS.length) {
        setWon(true);
        setRunning(false);
      }
    } else {
      setTimeout(() => setFlipped([]), 900);
    }
    setMoves(m => m + 1);
  }, [flipped]);

  const flip = (i) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(cards[i].emoji)) return;
    setFlipped(p => [...p, i]);
  };

  const isFlipped = (i) => flipped.includes(i) || matched.includes(cards[i]?.emoji);

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      {/* header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} style={{
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "6px 14px", color: "var(--text-secondary)",
          cursor: "pointer", fontSize: 13,
        }}>← Back</button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>🧠 Memory Match</h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Match all pairs to win</p>
        </div>
        <div className="ml-auto flex gap-4">
          {[["Moves", moves], ["Time", `${time}s`]].map(([l, v]) => (
            <div key={l} style={{
              textAlign: "center", background: "var(--bg-panel)",
              border: "1px solid var(--border)", borderRadius: 12, padding: "8px 16px",
            }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{v}</p>
              <p style={{ fontSize: 10, color: "var(--text-secondary)" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {won ? (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>You Won!</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            {moves} moves · {time} seconds
          </p>
          <button onClick={init} style={{
            background: "var(--accent)", color: "white", border: "none",
            borderRadius: 12, padding: "10px 28px", cursor: "pointer",
            fontSize: 14, fontWeight: 600,
          }}>Play Again</button>
        </div>
      ) : (
        <>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
          }}>
            {cards.map((card, i) => {
              const face = isFlipped(i);
              return (
                <button
                  key={card.id}
                  onClick={() => flip(i)}
                  style={{
                    height: 80, borderRadius: 14, fontSize: 28, cursor: "pointer",
                    border: `1px solid ${face ? "var(--accent)" : "var(--border)"}`,
                    background: face ? "var(--accent-subtle)" : "var(--bg-panel)",
                    transition: "all 0.2s",
                    transform: face ? "scale(1.04)" : "scale(1)",
                    boxShadow: face ? "0 0 16px var(--accent-glow)" : "none",
                  }}
                >
                  {face ? card.emoji : "?"}
                </button>
              );
            })}
          </div>
          <button onClick={init} style={{
            marginTop: 20, background: "var(--bg-panel)",
            border: "1px solid var(--border)", borderRadius: 10,
            padding: "8px 20px", color: "var(--text-secondary)",
            cursor: "pointer", fontSize: 13, width: "100%",
          }}>↺ Restart</button>
        </>
      )}
    </div>
  );
}