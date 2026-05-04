import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import TaskComments from "./TaskComments";
import GetMotivation from "./GetMotivation";

const PRIORITY_CONFIG = {
  high:   { gradient: "from-rose-600 via-red-500 to-orange-500",   ring: "#f43f5e", label: "HIGH",   icon: "🔥" },
  medium: { gradient: "from-amber-500 via-orange-400 to-yellow-400", ring: "#f59e0b", label: "MED",  icon: "⚡" },
  low:    { gradient: "from-emerald-500 via-teal-400 to-cyan-400",  ring: "#10b981", label: "LOW",   icon: "🌿" },
};

const STATUS_CYCLE = ["pending", "in-progress", "completed", "failed"];
const STATUS_STYLE = {
  pending:     { bg: "bg-slate-700",   text: "text-slate-200",  dot: "bg-slate-400"  },
  "in-progress":{ bg: "bg-blue-900",   text: "text-blue-200",   dot: "bg-blue-400"   },
  completed:   { bg: "bg-emerald-900", text: "text-emerald-200",dot: "bg-emerald-400" },
  failed:      { bg: "bg-red-900",     text: "text-red-200",    dot: "bg-red-400"    },
};

function TaskCard({ task, onClick, onStatusChange }) {
  const cardRef    = useRef(null);
  const innerRef   = useRef(null);
  const glowRef    = useRef(null);
  const [flipped, setFlipped]           = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [status, setStatus]             = useState(task.status || "pending");
  const [motivation, setMotivation]     = useState("");
  const [liked, setLiked]               = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;
  const stStyle = STATUS_STYLE[status] || STATUS_STYLE.pending;

  useEffect(() => {
    setMotivation(GetMotivation(task.priority));
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40, rotateX: -15 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: "back.out(1.4)" }
    );
  }, []);

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    gsap.to(innerRef.current, {
      rotateY: dx * 14,
      rotateX: -dy * 14,
      duration: 0.3,
      ease: "power2.out",
    });
    // move glow to cursor
    gsap.to(glowRef.current, {
      x: (dx + 1) / 2 * rect.width,
      y: (dy + 1) / 2 * rect.height,
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(innerRef.current, { rotateY: 0, rotateX: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  };

  // flip card
  const handleFlip = (e) => {
    e.stopPropagation();
    gsap.to(innerRef.current, {
      rotateY: flipped ? 0 : 180,
      duration: 0.6,
      ease: "power3.inOut",
    });
    setFlipped(!flipped);
  };

  // cycle status
  const handleStatusCycle = (e) => {
    e.stopPropagation();
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length];
    setStatus(next);
    onStatusChange?.(task._id, next);
    gsap.fromTo(e.currentTarget,
      { scale: 0.85 },
      { scale: 1, duration: 0.35, ease: "back.out(2)" }
    );
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    gsap.fromTo(e.currentTarget,
      { scale: 1.5, rotate: liked ? 0 : 20 },
      { scale: 1,   rotate: 0, duration: 0.4, ease: "back.out(2)" }
    );
  };

  // progress ring
  const progress = task.subtasks?.length
    ? Math.round((task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100)
    : (status === "completed" ? 100 : status === "in-progress" ? 50 : status === "failed" ? 0 : 10);
  const circumference = 2 * Math.PI * 20;
  const dash = (progress / 100) * circumference;

  return (
    <>
      {/* ── CARD ── */}
      <div
        ref={cardRef}
        className="relative w-full h-56"
        style={{ perspective: "900px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        <div
          ref={innerRef}
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >

          {/* ── FRONT FACE ── */}
          <div
            className={`absolute inset-0 rounded-2xl overflow-hidden cursor-pointer
              bg-gradient-to-br ${cfg.gradient} shadow-xl`}
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* cursor glow */}
            <div
              ref={glowRef}
              className="pointer-events-none absolute w-32 h-32 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
                top: 0, left: 0,
              }}
            />

            {/* grain texture */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                backgroundSize: "150px" }} />

            {/* priority badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/25 backdrop-blur-sm rounded-full px-2 py-0.5">
              <span className="text-[10px]">{cfg.icon}</span>
              <span className="text-[10px] font-bold text-white tracking-widest">{cfg.label}</span>
            </div>

            {/* progress ring */}
            <div className="absolute top-3 right-3" title={`${progress}% complete`}>
              <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="3"
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                {progress}%
              </span>
            </div>

            {/* motivation quote */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-white font-semibold text-sm leading-snug drop-shadow break-words line-clamp-3">
                "{motivation}"
              </p>
              <p className="text-white/60 text-xs mt-2 font-medium truncate max-w-full px-2">
                {task.title}
              </p>
            </div>

            {/* ── BOTTOM ACTION BAR ── */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-black/25 backdrop-blur-sm">

              {/* status pill — click to cycle */}
              <button
                onClick={handleStatusCycle}
                className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${stStyle.bg} ${stStyle.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${stStyle.dot}`} />
                {status.replace("-", " ")}
              </button>

              <div className="flex items-center gap-2">
                {/* like */}
                <button onClick={handleLike}
                  className="text-base leading-none"
                  title="Like">
                  {liked ? "❤️" : "🤍"}
                </button>

                {/* flip to details */}
                <button onClick={handleFlip}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition"
                  title="Details">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 8v4m0 4h.01"/>
                  </svg>
                </button>

                {/* comments */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition"
                  title="Comments">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── BACK FACE ── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 p-4 flex flex-col gap-2"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{task.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{task.description || "No description"}</p>
              </div>
              <button onClick={handleFlip} className="text-gray-500 hover:text-white text-xs ml-2">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 mt-1">
              {[
                ["Assigned to", task.assignedTo?.name || task.assignedTo?.email || "—"],
                ["Priority",    task.priority || "—"],
                ["Status",      status],
                ["Due date",    task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"],
                ["Created",     new Date(task.createdAt).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-200 font-medium capitalize">{val}</span>
                </div>
              ))}
            </div>

            {/* subtasks checklist */}
            {task.subtasks?.length > 0 && (
              <div className="border-t border-white/10 pt-2 space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Subtasks</p>
                {task.subtasks.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0 ${s.done ? "bg-emerald-500 border-emerald-500" : "border-gray-600"}`}>
                      {s.done && <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                    </span>
                    <span className={s.done ? "line-through text-gray-600" : "text-gray-300"}>{s.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── COMMENTS MODAL ── */}
      {showComments && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowComments(false)}
        >
          <div
            className="bg-gray-900 border border-white/10 w-[420px] max-h-[80vh] rounded-2xl p-5 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold">Comments</h2>
                <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[280px]">{task.title}</p>
              </div>
              <button onClick={() => setShowComments(false)}
                className="text-gray-500 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition">
                ✕
              </button>
            </div>
            <TaskComments taskId={task._id} currentUser={currentUser} />
          </div>
        </div>
      )}
    </>
  );
}

export default TaskCard;