import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import LeftPanel from "../components/LeftPanel";
import TaskCard from "../components/TaskCard";
import FlipCard from "../components/FlipCard.jsx";
import ChatPage from "../components/ChatPage.jsx";
import { logTask, updateTaskStatus } from "../API/Task.js";   // ✅ import updateTask
import AnalyticsPage from "../components/AnalyticsPage.jsx";
import AnimatedBackground from "../components/AnimatedBackground.jsx";
import GamesPage from "../components/GamesPage.jsx";

function UserDashboard({ panelOpen, setPanelOpen }) {
  const [activeTask, setActiveTask] = useState(null);
  const [view, setView] = useState("pending");
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const timerRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  // ── sidebar auto-hide ────────────────────────────────────
  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPanelOpen(false), 5000);
  };

  const handleMouseMove = (e) => {
    if (e.clientX < 40) {
      setPanelOpen(true);
      startTimer();
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── fetch tasks ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      try {
        const res = await logTask();
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);   // ✅ empty dep array — user from localStorage doesn't change

  // ── update status (called from TaskCard + FlipCard) ──────
  const UpdateTaskStatus = async (id, newStatus) => {
    const prevTasks = [...tasks]; // store backup

    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to update task status:", err);
      setTasks(prevTasks); // rollback safely
    }
  };

  // ── filter + sort ────────────────────────────────────────
 const priorityOrder = { high: 1, medium: 2, low: 3 };

const sortedTasks = tasks
  .filter((task) => task.status === view)
  .filter((task) => {
    const q = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q) ||
      task.priority?.toLowerCase().includes(q)
    );
  })
  .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // ── view title ───────────────────────────────────────────
  const viewTitle = {
    pending: "Your Tasks 🚀",
    completed: "Completed Tasks ✅",
    failed: "Failed Tasks ❌",
    "in-progress": "In Progress ⚡",
  }[view];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AnimatedBackground />
      <Navbar setSearchQuery={setSearchQuery} />

      <div className="flex flex-1 min-h-0">

        {/* LEFT PANEL */}
        <LeftPanel
          open={panelOpen}
          onMouseEnter={() => { setPanelOpen(true); startTimer(); }}
          onChangeView={setView}
          currentView={view}
          setSearchQuery={setSearchQuery}
        />

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">

          {view === "chat" ? (
            <ChatPage
              currentUser={user}
              view={view}
              searchQuery={searchQuery}
            />

          ) : view === "analytics" ? (
            <AnalyticsPage />

          ) : view === "games" ? (
            <GamesPage />
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4 text-white">{viewTitle}</h1>

              {sortedTasks.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">No {view} tasks</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onClick={() => setActiveTask(task)}
                      onStatusChange={UpdateTaskStatus}   // ✅ pass the real function
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* TASK DETAIL MODAL */}
        {activeTask && view !== "chat" && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
            onClick={() => setActiveTask(null)}
          >
            <FlipCard
              task={activeTask}
              onUpdateTask={(id, status) => {
                UpdateTaskStatus(id, status);  // ✅ reuse same function
                setActiveTask(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;