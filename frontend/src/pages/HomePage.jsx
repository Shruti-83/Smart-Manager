import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterModal from "../components/RegisterModal.jsx"; 
import LoginModal from "../components/LoginModal.jsx";

import {
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  ZapIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  BarChart3Icon,
  UsersIcon,
} from "lucide-react";

function HomePage() {
  const navigate = useNavigate();
const [showRegister, setShowRegister] = useState(false);
const [showLogin, setShowLogin] = useState(false);
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) setIsLoggedIn(true);
}, []);

 const handleLoginSuccess = (user) => {
     setShowLogin(false);
  setIsLoggedIn(true);

  if (user.role === "admin") {
    navigate("/admin");
  } else {
    navigate("/dashboard");
  }

  };


useEffect(() => {
  const isModalOpen = showRegister || showLogin;
  document.body.style.overflow = isModalOpen ? "hidden" : "auto";
}, [showRegister, showLogin]);

const handleProtectedAction = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    setShowRegister(true);
  } else if (user.role === "admin") {
    navigate("/admin");
  } else {
    navigate("/dashboard");
  }
};
  return (
    <div className="relative">
<div
  data-theme="business"
  className={
    showRegister || showLogin
      ? "blur-sm pointer-events-none bg-gradient-to-br from-base-100 via-base-200 to-base-300"
      : "bg-gradient-to-br from-base-100 via-base-200 to-base-300"
  }
>
      {/* NAVBAR */}
      <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
              <SparklesIcon className="size-6 text-white" />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
                FlowTrack

              </span>
              <span className="text-xs text-base-content/60 font-medium -mt-1">
                Manage Smartly
              </span>
            </div>
          </Link>

          {/* SIMPLE CTA BUTTON */}
          <button
            className="btn btn-primary"
           onClick={handleProtectedAction}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-8">
            <div className="badge badge-primary badge-lg">
             <LayoutDashboardIcon className="size-4" />
             Efficient Workflow Management
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
  Manage Tasks,
</span>
<br />
<span className="text-base-content">Boost Productivity</span>
            </h1>

          <p className="text-xl text-base-content/70 leading-relaxed max-w-xl">
  A powerful workflow management platform to organize tasks, track progress,
  and collaborate with your team in real-time. Stay productive and never miss a deadline.
</p>

            {/* FEATURE PILLS */}
            <div>
              <div className="badge badge-lg badge-outline mr-3">
  <CheckIcon className="size-4 text-success" />
  Task Tracking
</div>

<div className="badge badge-lg badge-outline mr-3">
  <CheckIcon className="size-4 text-success" />
  Team Collaboration
</div>

<div className="badge badge-lg badge-outline">
  <CheckIcon className="size-4 text-success" />
  Deadline Management
</div>
            </div>

            {/* CTA BUTTON */}
            <button
              className="btn btn-primary btn-lg"
             onClick={handleProtectedAction}
            >
             Start Managing Tasks
              <ArrowRightIcon className="size-5" />
            </button>

            {/* STATS */}
            <div className="stats lg:stats-horizontal bg-base-100 shadow-lg">
             <div className="stat">
  <div className="stat-value text-primary">5K+</div>
  <div className="stat-title">Active Teams</div>
</div>

<div className="stat">
  <div className="stat-value text-secondary">20K+</div>
  <div className="stat-title">Tasks Managed</div>
</div>

<div className="stat">
  <div className="stat-value text-accent">99%</div>
  <div className="stat-title">On-Time Completion</div>
</div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <img
            src="/bg1.png"
            alt="Platform"
            className="w-full h-auto   border- hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-primary font-mono">Build High-Performing Workflows</span>
          </h2>

          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
           Smart tools to organize tasks, collaborate with your team, and track progress — all in one place
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* CARD 1 */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
               <ListTodoIcon className="size-8 text-primary" />
              </div>
             <h3 className="card-title">Task Management</h3>
<p className="text-base-content/70">
  Create, assign, and track tasks with ease using a simple and intuitive interface.
</p>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
<UsersIcon className="size-8 text-primary" />
              </div>
              <h3 className="card-title">Real-time Collaboration</h3>
<p className="text-base-content/70">
  Work with your team, update progress, and stay aligned in real-time.
</p>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3Icon className="size-8 text-primary" />
              </div>
             <h3 className="card-title">Progress Tracking</h3>
<p className="text-base-content/70">
  Monitor task status, deadlines, and productivity with powerful insights.
</p>
            </div>
          </div>
        </div>
      </div>


    
    </div>
    {/* REGISTER MODAL */}
{showRegister && (
  <RegisterModal
    onClose={() => setShowRegister(false)}
    openLogin={() => {
      setShowRegister(false);
      setShowLogin(true);
    }}
  />
)}

{/* LOGIN MODAL */}
{showLogin && (
  <LoginModal
  onClose={() => setShowLogin(false)}
  openRegister={() => {
    setShowLogin(false);
    setShowRegister(true);
  }}
  onLoginSuccess={handleLoginSuccess}
/>
)}
    </div>
  );
}

export default HomePage;