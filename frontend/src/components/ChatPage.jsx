import { useEffect, useState, useRef } from "react";
import { socket } from "../socket.js";
import { getChatUsers, getMessages, sendFileMessage } from "../API/Chat.js";
import EmojiPicker from "emoji-picker-react";
import { useTheme } from "../context/ThemeContext";

function ChatPage({ currentUser, searchQuery }) {
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]); // ✅ track online
  const [showSidebar, setShowSidebar] = useState(true);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const emojiRef = useRef(null);
  const uploadingRef = useRef(false);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const currentId = currentUser?._id || currentUser?.id;

  // ── join room once ────────────────────────────────────
  useEffect(() => {
    if (!currentId) return;
    socket.emit("joinRoom", currentId);
  }, [currentId]);

  // ── track online users ────────────────────────────────  ✅ NEW
  useEffect(() => {
    const handleOnlineUsers = (ids) => setOnlineUsers(ids);
    socket.on("onlineUsers", handleOnlineUsers);
    return () => socket.off("onlineUsers", handleOnlineUsers);
  }, []);

  // ── receive message ───────────────────────────────────
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      const receiverId = msg.receiver?._id || msg.receiver;
      if (!selectedUser) return;
      if (
        (String(senderId) === String(selectedUser._id) && String(receiverId) === String(currentId)) ||
        (String(senderId) === String(currentId) && String(receiverId) === String(selectedUser._id))
      ) {
        setMessages((prev) => {
          // Replace optimistic temp message if _id matches, otherwise append
          const tempIdx = prev.findIndex(
            m => m._id?.startsWith?.("temp-") &&
              String(m.sender) === String(senderId) &&
              String(m.receiver) === String(receiverId)
          );
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = msg;
            return next;
          }
          const exists = prev.some(m => m._id && msg._id && String(m._id) === String(msg._id));
          return exists ? prev : [...prev, msg];
        });
      }
    };
    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [selectedUser, currentId]);

  // ── message status updates ────────────────────────────  ✅ NEW
  useEffect(() => {
    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages(prev =>
        prev.map(m => String(m._id) === String(messageId) ? { ...m, status } : m)
      );
    };
    socket.on("messageStatusUpdate", handleStatusUpdate);
    socket.on("messagesSeen", ({ senderId }) => {
      // All messages to that sender are now seen
      setMessages(prev =>
        prev.map(m =>
          String(m.receiver) === String(senderId) ? { ...m, status: "seen" } : m
        )
      );
    });
    return () => {
      socket.off("messageStatusUpdate", handleStatusUpdate);
      socket.off("messagesSeen");
    };
  }, []);

  // ── typing indicator ──────────────────────────────────
  useEffect(() => {
    const handleTyping = ({ senderId }) => {  // ✅ destructure object now
      if (selectedUser && String(senderId) === String(selectedUser._id)) {
        setIsTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
      }
    };
    const handleStopTyping = ({ senderId }) => {
      if (selectedUser && String(senderId) === String(selectedUser._id)) {
        setIsTyping(false);
      }
    };
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [selectedUser]);

  // ── mark seen when conversation opens ────────────────  ✅ NEW
  useEffect(() => {
    if (!selectedUser) return;
    socket.emit("markSeen", {
      senderId: selectedUser._id,
      receiverId: currentId,
    });
  }, [selectedUser, currentId]);

  // ── close emoji on outside click ─────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── file upload ───────────────────────────────────────
  const handleFileUpload = async (file) => {
    if (!file || !selectedUser || uploadingRef.current) return;
    uploadingRef.current = true;
    const tempId = `temp-${Date.now()}`;
    const localUrl = URL.createObjectURL(file);
    const tempMsg = {
      _id: tempId, sender: currentId, receiver: selectedUser._id,
      fileUrl: localUrl, fileType: file.type, status: "sending",
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("senderId", currentId);
      formData.append("receiverId", selectedUser._id);
      const res = await sendFileMessage(formData);
      setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
    } catch {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: "failed" } : m));
    } finally {
      uploadingRef.current = false;
      URL.revokeObjectURL(localUrl);
    }
  };

  // ── fetch users ───────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await getChatUsers();
      const filtered = res.data.filter(u =>
        currentUser.role === "user" ? u.role === "admin" : (u._id || u.id) !== currentId
      );
      setUsers(filtered);
    };
    fetchUsers();
  }, [currentId]);

  // ── fetch messages ────────────────────────────────────
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      const res = await getMessages(selectedUser._id);
      setMessages(res.data);
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (selectedUser) {
      socket.emit("typing", { senderId: currentId, receiverId: selectedUser._id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("stopTyping", { senderId: currentId, receiverId: selectedUser._id });
      }, 1500);
    }
  };

  // ── send text message ─────────────────────────────────  ✅ optimistic add
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser || sending) return;
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      sender: currentId,
      receiver: selectedUser._id,
      message: text,
      status: "sending",
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]); // ✅ show immediately

    socket.emit("sendMessage", {
      senderId: currentId,
      receiverId: selectedUser._id,
      message: text,
    });

    setText("");
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ── status icon helper ────────────────────────────────
  const StatusIcon = ({ status }) => {
    if (status === "sending") return <span style={{ marginLeft: 4, color: "var(--text-muted)" }}>·</span>;
    if (status === "sent") return <span style={{ marginLeft: 4, color: "var(--text-muted)" }}>✓</span>;
    if (status === "delivered") return <span style={{ marginLeft: 4, color: "var(--text-muted)" }}>✓✓</span>;
    if (status === "seen") return <span style={{ marginLeft: 4, color: "var(--accent)" }}>✓✓</span>;
    if (status === "failed") return <span style={{ marginLeft: 4, color: "red" }}>!</span>;
    return null;
  };

  const isOnline = (userId) => onlineUsers.includes(String(userId)); // ✅ helper

  const filteredUsers = searchQuery
    ? users.filter(u => (u.name || u.email || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  // ── resolve relative file URLs ────────────────────────
  const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("blob:") || url.startsWith("http")) return url;
    return `http://localhost:3000${url}`;
  };
  return (
    <div style={{
      display: "flex", height: "100%", borderRadius: 18, overflow: "hidden",
      border: "1px solid var(--border)",
      background: "var(--bg-primary)",
      boxShadow: "var(--shadow-card)",
    }}>
      {/* ── SIDEBAR ── */}
      <div style={{
        width: showSidebar ? 260 : 0, overflow: "hidden", flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "var(--bg-panel)", borderRight: "1px solid var(--border)",
        transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--accent)", fontWeight: 700, marginBottom: 4 }}>MESSAGES</p>
          <h2 style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 700, margin: 0 }}>Conversations</h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {filteredUsers.length === 0 && (
            <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No conversations</p>
          )}
          {filteredUsers.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const online = isOnline(user._id); // ✅
            return (
              <button
                key={user._id}
                onClick={() => { setSelectedUser(user); setShowSidebar(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                  width: "100%", textAlign: "left",
                  background: isSelected ? "var(--nav-active)" : "transparent",
                  border: isSelected ? "1px solid var(--border)" : "1px solid transparent",
                  transition: "all 0.18s",
                  boxShadow: isSelected ? "var(--shadow-glow)" : "none",
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--nav-hover)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                {/* avatar with online dot ✅ */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: `linear-gradient(135deg, var(--accent), var(--accent-alt))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "white",
                    border: isSelected ? "2px solid var(--accent)" : "2px solid var(--border)",
                  }}>
                    {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
                  </div>
                  {online && (
                    <span style={{
                      position: "absolute", bottom: 1, right: 1,
                      width: 10, height: 10, borderRadius: "50%",
                      background: "#22c55e",
                      border: "2px solid var(--bg-panel)",
                    }} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    color: isSelected ? "var(--accent)" : "var(--text-primary)",
                    fontSize: 13, fontWeight: 600, margin: "0 0 2px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {user.name || user.email}
                  </p>
                  <p style={{ color: online ? "#22c55e" : "var(--text-muted)", fontSize: 11, margin: 0 }}>
                    {online ? "Online" : (user.role || "Member")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!selectedUser ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            }}>◎</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>Select a conversation</p>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Choose someone from the sidebar to start chatting</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div style={{
              padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
              background: "var(--bg-panel)", borderBottom: "1px solid var(--border)", flexShrink: 0,
            }}>
              <button
                onClick={() => setShowSidebar(true)}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  color: "var(--text-secondary)", cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-subtle)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >←</button>

              <div style={{ position: "relative" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `linear-gradient(135deg, var(--accent), var(--accent-alt))`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "white", border: "2px solid var(--accent-glow)",
                }}>
                  {(selectedUser.name || selectedUser.email || "?").slice(0, 1).toUpperCase()}
                </div>
                {/* ✅ online dot in header */}
                {isOnline(selectedUser._id) && (
                  <span style={{
                    position: "absolute", bottom: 1, right: 1,
                    width: 10, height: 10, borderRadius: "50%",
                    background: "#22c55e", border: "2px solid var(--bg-panel)",
                  }} />
                )}
              </div>

              <div>
                <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 14, margin: 0 }}>
                  {selectedUser.name || selectedUser.email}
                </p>
                <p style={{ color: isOnline(selectedUser._id) ? "#22c55e" : "var(--text-muted)", fontSize: 11, margin: 0 }}>
                  {isTyping ? "typing…" : isOnline(selectedUser._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* MESSAGES */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 6 }}>
              {messages.map((msg, i) => {
                const isMe = String(msg.sender) === String(currentId) ||
                  String(msg.sender?._id) === String(currentId);
                return (
                  <div
                    key={msg._id || i}
                    style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}
                    onMouseEnter={() => setHoveredMsg(msg._id || i)}
                    onMouseLeave={() => setHoveredMsg(null)}
                  >
                    {!isMe && (
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg, var(--accent), var(--accent-alt))`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, color: "white",
                      }}>
                        {(selectedUser.name || "?").slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", gap: 2, alignItems: isMe ? "flex-end" : "flex-start" }}>
                      {msg.fileUrl ? (
                        msg.fileType?.startsWith("image/") ? (
                          // ── image preview ──
                          <img
                            src={resolveUrl(msg.fileUrl)}
                            alt="attachment"
                            onClick={() => window.open(resolveUrl(msg.fileUrl), "_blank")}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                            style={{
                              maxWidth: 220, maxHeight: 260,
                              borderRadius: 12, display: "block",
                              border: "1px solid var(--border)",
                              opacity: msg.status === "sending" ? 0.6 : 1,
                              transition: "opacity 0.3s",
                              objectFit: "cover", cursor: "pointer",
                            }}
                          />
                        ) : msg.fileType?.startsWith("video/") ? (
                          // ── video preview ──
                          <video
                            src={resolveUrl(msg.fileUrl)}
                            controls
                            style={{
                              maxWidth: 220, borderRadius: 12,
                              border: "1px solid var(--border)", display: "block",
                            }}
                          />
                        ) : (
                          // ── other file — clean card ──
                          <div style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 14px", borderRadius: 12,
                            background: isMe ? "var(--accent-subtle)" : "var(--bg-panel)",
                            border: "1px solid var(--border)", maxWidth: 220,
                          }}>
                            <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>📎</span>
                            <div style={{ minWidth: 0 }}>
                              <p style={{
                                color: "var(--text-primary)", fontSize: 12, fontWeight: 600,
                                margin: "0 0 2px", overflow: "hidden",
                                textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                                {decodeURIComponent(msg.fileUrl.split("/").pop()) || "File"}
                              </p>
                              <a
                                href={resolveUrl(msg.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "var(--accent)", fontSize: 11, textDecoration: "none" }}
                              >
                                Open ↗
                              </a>
                            </div>
                          </div>
                        )
                      ) : (
                        <div style={{
                          padding: "9px 14px",
                          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isMe ? "var(--msg-me-bg)" : "var(--msg-other-bg)",
                          color: isMe ? "#fff" : "var(--msg-other-text)",
                          fontSize: 13, lineHeight: 1.5,
                          border: isMe ? "none" : "1px solid var(--border)",
                          boxShadow: isMe ? "0 4px 14px var(--accent-glow)" : "none",
                          opacity: msg.status === "sending" ? 0.7 : 1,
                          transition: "transform 0.15s, opacity 0.2s",
                          transform: hoveredMsg === (msg._id || i) ? "scale(1.02)" : "scale(1)",
                          wordBreak: "break-word",
                        }}>
                          {msg.message}
                        </div>
                      )}

                      <span style={{
                        fontSize: 10, color: "var(--text-muted)",
                        opacity: hoveredMsg === (msg._id || i) ? 1 : 0,
                        transition: "opacity 0.2s",
                        display: "flex", alignItems: "center",
                      }}>
                        {formatTime(msg.createdAt)}
                        {isMe && <StatusIcon status={msg.status} />}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: `linear-gradient(135deg, var(--accent), var(--accent-alt))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "white", fontWeight: 700,
                  }}>
                    {(selectedUser.name || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{
                    padding: "10px 14px", borderRadius: "18px 18px 18px 4px",
                    background: "var(--msg-other-bg)", border: "1px solid var(--border)",
                    display: "flex", gap: 4, alignItems: "center",
                  }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{
                        width: 6, height: 6, borderRadius: "50%", background: "var(--accent)",
                        animation: `bounce 1.2s ${j * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div style={{
              padding: "12px 16px", borderTop: "1px solid var(--border)",
              background: "var(--bg-panel)", flexShrink: 0, position: "relative",
            }}>
              {showEmoji && (
                <div ref={emojiRef} style={{ position: "absolute", bottom: "70px", left: 16, zIndex: 100 }}>
                  <EmojiPicker
                    theme={theme.isDark !== false ? "dark" : "light"}
                    onEmojiClick={(emojiData) => {
                      setText(prev => prev + emojiData.emoji);
                      inputRef.current?.focus();
                    }}
                  />
                </div>
              )}

              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg-input)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "8px 12px", transition: "border-color 0.2s, box-shadow 0.2s",
              }}>
                <button onClick={() => setShowEmoji(v => !v)} style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: showEmoji ? "var(--accent-subtle)" : "transparent",
                  border: "none", cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: showEmoji ? "var(--accent)" : "var(--text-secondary)", transition: "all 0.18s",
                }}>😊</button>

                <button onClick={() => fileInputRef.current?.click()} style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: "transparent", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-secondary)", fontSize: 16, transition: "all 0.18s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
                >📎</button>
                <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={e => handleFileUpload(e.target.files[0])} />

                <input
                  ref={inputRef}
                  value={text}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "var(--text-primary)", fontSize: 13,
                  }}
                />

                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || sending}
                  style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: text.trim() ? "var(--accent)" : "var(--bg-card)",
                    border: "none", cursor: text.trim() ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: 15, transition: "all 0.2s",
                    transform: text.trim() ? "scale(1)" : "scale(0.9)",
                    boxShadow: text.trim() ? "0 4px 14px var(--accent-glow)" : "none",
                  }}
                >➤</button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

export default ChatPage;