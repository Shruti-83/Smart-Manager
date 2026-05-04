import { useEffect, useState, useRef } from "react";
import { getComments, addComment, deleteComment } from "../API/Task.js";
import { useTheme } from "../context/ThemeContext";

function TaskComments({ taskId, currentUser }) {
  const { theme } = useTheme();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const currentId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (!taskId) return;
    getComments(taskId).then((res) => setComments(res.data));
  }, [taskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await addComment(taskId, text);
      setComments((prev) => [...prev, res.data]);
      setText("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    await deleteComment(taskId, commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const getInitials = (user) =>
    (user?.name || user?.email || "?").slice(0, 2).toUpperCase();

  const formatTime = (date) =>
    new Date(date).toLocaleString([], {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* comment list */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 8,
        maxHeight: 256, overflowY: "auto",
        paddingRight: 4,
      }}>
        {comments.length === 0 && (
          <p style={{
            fontSize: 12, color: "var(--text-muted)",
            textAlign: "center", padding: "20px 0",
          }}>
            No comments yet · be the first!
          </p>
        )}
        {comments.map((c) => {
          const isMe  = String(c.user?._id) === String(currentId);
          const isHov = hoveredId === c._id;
          return (
            <div
              key={c._id}
              style={{ display: "flex", gap: 10 }}
              onMouseEnter={() => setHoveredId(c._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg, var(--accent), var(--accent-alt))`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "white",
                flexShrink: 0, marginTop: 2,
                border: isMe ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
                boxShadow: isMe ? "0 0 8px var(--accent-glow)" : "none",
                transition: "all 0.2s",
              }}>
                {getInitials(c.user)}
              </div>

              {/* bubble */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isMe ? "var(--accent)" : "var(--text-primary)" }}>
                    {c.user?.name || c.user?.email || "Unknown"}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {formatTime(c.createdAt)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <p style={{
                    fontSize: 13, color: "var(--text-secondary)",
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border)",
                    borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    padding: "7px 12px",
                    margin: 0, flex: 1,
                    wordBreak: "break-words",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxShadow: isHov ? "var(--shadow-glow)" : "none",
                    borderColor: isHov ? "var(--border-focus)" : "var(--border)",
                  }}>
                    {c.text}
                  </p>

                  {/* delete button */}
                  {(isMe || currentUser?.role === "admin") && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      style={{
                        opacity: isHov ? 1 : 0,
                        transition: "opacity 0.2s, color 0.2s, transform 0.2s",
                        background: "none", border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer", fontSize: 12, flexShrink: 0,
                        marginTop: 6,
                        transform: isHov ? "scale(1)" : "scale(0.8)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
        borderRadius: 14, padding: "8px 10px",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = "var(--border-focus)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-glow)";
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder="Add a comment..."
          style={{
            flex: 1, background: "transparent",
            color: "var(--text-primary)", fontSize: 13, outline: "none",
            border: "none",
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim() || loading}
          style={{
            fontSize: 11, padding: "5px 12px", borderRadius: 99, fontWeight: 600,
            background: text.trim() && !loading ? "var(--accent)" : "var(--bg-card)",
            color: text.trim() && !loading ? "#fff" : "var(--text-muted)",
            border: "none", cursor: text.trim() && !loading ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: text.trim() && !loading ? "0 4px 12px var(--accent-glow)" : "none",
            transform: text.trim() && !loading ? "scale(1)" : "scale(0.96)",
          }}
        >
          {loading ? "..." : "Post"}
        </button>
      </div>
    </div>
  );
}

export default TaskComments;