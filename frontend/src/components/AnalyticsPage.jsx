import React, { useEffect, useState, useMemo } from "react";
import { logTask } from "../API/Task.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from "recharts";

function AnalyticsPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await logTask();
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.createdAt) return false;
      const taskDate = new Date(task.createdAt);
      const now = new Date();
      const week  = new Date(); week.setDate(now.getDate() - 7);
      const month = new Date(); month.setDate(now.getDate() - 30);
      if (filter === "week")  return taskDate >= week;
      if (filter === "month") return taskDate >= month;
      return true;
    });
  }, [tasks, filter]);

  const totalTasks      = filteredTasks.length;
  const completedTasks  = filteredTasks.filter(t => t.status === "completed").length;
  const pendingTasks    = filteredTasks.filter(t => t.status === "pending").length;
  const failedTasks     = filteredTasks.filter(t => t.status === "failed").length;
  const completionRate  = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const overdueTasks    = filteredTasks.filter(
    t => t.status === "pending" && t.deadline && new Date(t.deadline) < new Date()
  ).length;

  const userPerformance = useMemo(() => {
    const map = {};
    filteredTasks.forEach(task => {
      const id = typeof task.assignedTo === "object" ? task.assignedTo._id : task.assignedTo;
      if (!map[id]) {
        const first = task.assignedTo?.firstName || "";
        const last  = task.assignedTo?.lastName  || "";
        map[id] = { name: `${first} ${last}`.trim() || "User", completed: 0, total: 0 };
      }
      map[id].total += 1;
      if (task.status === "completed") map[id].completed += 1;
    });
    return Object.values(map);
  }, [filteredTasks]);

  const trendData = useMemo(() => {
    const map = {};
    filteredTasks.forEach(task => {
      const date = new Date(task.createdAt).toLocaleDateString();
      if (!map[date]) map[date] = { date, completed: 0, total: 0 };
      map[date].total += 1;
      if (task.status === "completed") map[date].completed += 1;
    });
    return Object.values(map);
  }, [filteredTasks]);

  const myStats = [
    { name: "Completed", value: completedTasks, color: "var(--success)"  },
    { name: "Pending",   value: pendingTasks,   color: "var(--warning)"  },
    { name: "Failed",    value: failedTasks,    color: "var(--danger)"   },
  ];

  const hasData = completedTasks + pendingTasks + failedTasks > 0;

  // Themed tooltip
  const ThemedTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-secondary)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "8px 12px", fontSize: 12,
        color: "var(--text-primary)", boxShadow: "var(--shadow-card)",
      }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color || "var(--accent)", margin: "2px 0" }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: "50%",
              background: "var(--accent)",
              animation: `bounce 1s ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-12px)}}`}</style>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } }),
  };

  return (
    <div style={{
      padding: 24,
      color: "var(--text-primary)",
      background: "var(--bg-primary)",
      minHeight: "100%",
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--accent)", fontWeight: 700, margin: "0 0 4px" }}>
            OVERVIEW
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Analytics Dashboard
          </h1>
        </div>
        {/* filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "week", "month"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: filter === f ? "var(--accent)" : "var(--bg-panel)",
                color: filter === f ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: filter === f ? "0 4px 14px var(--accent-glow)" : "none",
                transform: filter === f ? "scale(1.03)" : "scale(1)",
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
        {[
          { title: "Total Tasks",   value: totalTasks,      icon: "📋" },
          { title: "Completed",     value: completedTasks,  icon: "✅" },
          { title: "Completion %",  value: `${completionRate}%`, icon: "📊" },
          { title: "Overdue",       value: overdueTasks,    icon: "⚠️" },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            style={{
              padding: "16px 18px", borderRadius: 16,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              backdropFilter: "blur(12px)",
              boxShadow: "var(--shadow-card)",
              cursor: "default",
              transition: "box-shadow 0.2s",
            }}
            whileHover={{ boxShadow: "var(--shadow-glow)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ color: "var(--text-secondary)", fontSize: 12, margin: 0 }}>{card.title}</p>
              <span style={{ fontSize: 18 }}>{card.icon}</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              {card.value}
            </h2>
            {/* accent bar */}
            <div style={{
              marginTop: 10, height: 3, borderRadius: 99,
              background: "var(--bg-panel)", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: `linear-gradient(90deg, var(--accent), var(--accent-alt))`,
                width: card.title === "Completion %" ? `${completionRate}%` : "60%",
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS */}
      {isAdmin ? (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* Team Performance */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              flex: "1 1 340px", minWidth: 0, padding: 20, borderRadius: 18,
              background: "var(--bg-panel)", border: "1px solid var(--border)",
              backdropFilter: "var(--sidebar-blur)", boxShadow: "var(--shadow-card)",
            }}
          >
            <p style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", margin: "0 0 4px" }}>
              TEAM
            </p>
            <h2 style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>
              Performance
            </h2>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userPerformance} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" stroke="var(--chart-text)" fontSize={11} />
                  <YAxis stroke="var(--chart-text)" fontSize={11} />
                  <Tooltip content={<ThemedTooltip />} />
                  <Bar dataKey="completed" fill="var(--accent)"     radius={[6,6,0,0]} name="Completed" />
                  <Bar dataKey="total"     fill="var(--accent-glow)" radius={[6,6,0,0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Trend */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              flex: "1 1 340px", minWidth: 0, padding: 20, borderRadius: 18,
              background: "var(--bg-panel)", border: "1px solid var(--border)",
              backdropFilter: "var(--sidebar-blur)", boxShadow: "var(--shadow-card)",
            }}
          >
            <p style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", margin: "0 0 4px" }}>
              ACTIVITY
            </p>
            <h2 style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>
              Trend 📈
            </h2>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="date" stroke="var(--chart-text)" fontSize={10} />
                  <YAxis stroke="var(--chart-text)" fontSize={11} />
                  <Tooltip content={<ThemedTooltip />} />
                  <Bar dataKey="completed" fill="var(--accent)"     radius={[6,6,0,0]} name="Completed" />
                  <Bar dataKey="total"     fill="var(--accent-glow)" radius={[6,6,0,0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            padding: 24, borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center",
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            backdropFilter: "var(--sidebar-blur)", boxShadow: "var(--shadow-card)",
          }}
        >
          <p style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", margin: "0 0 4px" }}>
            MY STATS
          </p>
          <h2 style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 700, margin: "0 0 20px" }}>
            Task Breakdown
          </h2>

          {!chartReady ? (
            <div style={{
              width: 320, height: 320, borderRadius: "50%",
              background: "var(--bg-card)", animation: "pulse 1.5s ease infinite",
            }} />
          ) : !hasData ? (
            <p style={{ color: "var(--text-secondary)", padding: "60px 0" }}>No task data available</p>
          ) : (
            <>
              <PieChart width={320} height={320}>
                <Pie
                  data={myStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  innerRadius={55}
                  paddingAngle={4}
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                  isAnimationActive
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {myStats.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<ThemedTooltip />} />
              </PieChart>

              {/* legend */}
              <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                {myStats.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: s.color, display: "inline-block",
                      boxShadow: `0 0 8px ${s.color}`,
                    }} />
                    <span style={{ color: "var(--text-secondary)" }}>{s.name}: </span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-12px)}}
      `}</style>
    </div>
  );
}

export default AnalyticsPage;