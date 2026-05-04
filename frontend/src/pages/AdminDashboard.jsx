import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import LeftPanel from "../components/LeftPanel";
import TaskCard from "../components/TaskCard";
import FlipCard from "../components/FlipCard";
import TaskCreateModal from "../components/TaskCreateModal";
import { motion } from "framer-motion";
import { logTask } from "../API/Task.js";
import { getUsers } from "../API/Auth.js";
import ChatPage from "../components/ChatPage.jsx";
import AnalyticsPage from "../components/AnalyticsPage.jsx";
import AnimatedBackground from "../components/AnimatedBackground.jsx";
import GamesPage from "../components/GamesPage.jsx";

function AdminDashboard({ panelOpen, setPanelOpen }) {
 
  const timerRef = useRef(null);

  // ✅ STATES
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [view, setView] = useState("pending");
 const [searchQuery, setSearchQuery] = useState("");
 
  const user = JSON.parse(localStorage.getItem("user"));

  // 🎯 Sidebar logic
  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setPanelOpen(false);
    }, 5000);
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

  // 🌐 FETCH TASKS (ALL tasks)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await logTask();
        setTasks(res.data); // ✅ no filtering here
      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();
  }, []);

  // 🌐 FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  // 🎯 FILTER BASED ON VIEW
const filteredTasks = tasks
    .filter(task => task.status === view)
    .filter(task => {
      const query = searchQuery.toLowerCase();

      return (
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.priority?.toLowerCase().includes(query)
      );
    });

  // 🔥 PRIORITY SORT
  const priorityOrder = { high: 1, medium: 2, low: 3 };

  const sortedTasks = [...filteredTasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-base-100 via-base-200 to-base-300 overflow-hidden">

<AnimatedBackground />
      {/* NAVBAR */}
      <Navbar setSearchQuery={setSearchQuery} />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT PANEL */}
       <LeftPanel
          open={panelOpen}
          onMouseEnter={() => {
            setPanelOpen(true);
            startTimer();
          }}
          onChangeView={setView}
          currentView={view}
          setSearchQuery={setSearchQuery} 
        />

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">

          {/* 🔥 CHAT VIEW */}
          {view === "chat" ? (
            <ChatPage currentUser={user} searchQuery={searchQuery}/>
          ) : view === "analytics" ? (
            <AnalyticsPage />   // 🔥 ADD THIS

          ): view === "games" ? (
  <GamesPage />
): (
              <>
                <h1 className="text-2xl font-bold mb-4 text-white">
                  {view === "pending" && "Pending Tasks 📝"}
                  {view === "completed" && "Completed Tasks ✅"}
                  {view === "failed" && "Failed Tasks ❌"}
                </h1>

                {/* EMPTY STATE */}
                {sortedTasks.length === 0 ? (
                  <p className="text-gray-500 text-center mt-10">
                    No tasks found
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onClick={() => setActiveTask(task)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

        </div>
      </div>

      {/* ➕ FLOATING BUTTON */}
      {view !== "chat" && (
       <motion.button
  onClick={() => setShowModal(true)}
  whileHover={{
    scale: 1.15,
    rotateX: 10,
    rotateY: -10,
  }}
  whileTap={{
    scale: 0.95,
    rotateX: 0,
    rotateY: 0,
  }}
  initial={{ y: 40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 15 }}
  className="
    fixed bottom-20 right-8
    w-16 h-16 rounded-full
    bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500
    text-white text-3xl font-bold
    flex items-center justify-center
    shadow-[0_20px_40px_rgba(0,0,0,0.6)]
    border border-white/20
    backdrop-blur-xl
  "
  style={{
    transformStyle: "preserve-3d",
  }}
>
  <span style={{ transform: "translateZ(10px)" }}>+</span>
</motion.button>
      )}

      {/* 🧾 CREATE TASK MODAL */}
      {showModal && (
        <TaskCreateModal
          users={users}
          onClose={() => setShowModal(false)}
          onTaskCreated={(newTask) => {
            setTasks(prev => [newTask, ...prev]); // ✅ always add
          }}
        />
      )}

      {/* 🔥 FLIP MODAL */}
      {activeTask && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={() => setActiveTask(null)}
        >
          <FlipCard
            task={activeTask}
            onUpdateTask={(id, status) => {
              setTasks(prev =>
                prev.map(task =>
                  task._id === id ? { ...task, status } : task
                )
              );
              setActiveTask(null);
            }}
          />
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;