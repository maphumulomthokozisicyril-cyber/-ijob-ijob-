import React, { useState, useEffect } from "react";
import {
  Zap,
  Check,
  CheckCircle2,
  ArrowRight,
  Lock,
  Shield,
  Activity,
  FileText,
  MessageSquare,
  LogOut,
  ChevronDown,
  Sparkles,
  Star,
  Award,
  Info,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";
import { User, TargetField, KanbanTask } from "./types";
import SignInModal from "./components/SignInModal";
import CVAuditTab from "./components/CVAuditTab";
import PitchGeneratorTab from "./components/PitchGeneratorTab";
import InterviewCoachTab from "./components/InterviewCoachTab";
import KanbanTracker from "./components/KanbanTracker";
import DailyPlanner from "./components/DailyPlanner";
import AdminPortal from "./components/AdminPortal";

export default function App() {
  // Application view states
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<"cv-architect" | "pitch-generator" | "interview-coach">("cv-architect");
  const [selectedIndustry, setSelectedIndustry] = useState<TargetField>("Tech/IT");
  const [isAdminMode, setIsAdminMode] = useState(false);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup" | "premium_cta">("signup");
  const [authModalMessage, setAuthModalMessage] = useState("");

  // Kanban and Strategic state
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);

  // Usage Tracker limits (tracked locally per user/day)
  const [cvAuditsToday, setCvAuditsToday] = useState(0);
  const [interviewSessionsToday, setInterviewSessionsToday] = useState(0);

  // Load state on startup
  useEffect(() => {
    const userJson = localStorage.getItem("ijob_current_user");
    if (userJson) {
      const parsed = JSON.parse(userJson);
      setCurrentUser(parsed);
      setSelectedIndustry(parsed.industry || "Tech/IT");
      setView("dashboard"); // Automatically direct logged in users to workspace
    }

    const tasksJson = localStorage.getItem("ijob_kanban_tasks");
    if (tasksJson) {
      setKanbanTasks(JSON.parse(tasksJson));
    } else {
      // Seed initial sample tasks for demonstration
      const initialTasks: KanbanTask[] = [
        {
          id: "seed-1",
          companyName: "Stripe",
          roleTitle: "Customer Operations Specialist",
          industry: "Customer Service/Call Center",
          column: "Applied",
          salary: "$75,000",
          notes: "Screening submitted. Follow up in 3 days.",
          dateAdded: "Jul 2",
        },
        {
          id: "seed-2",
          companyName: "Google",
          roleTitle: "Frontend Engineer (Contracts)",
          industry: "Tech/IT",
          column: "Interviewing",
          salary: "$120,000",
          notes: "Technical interview scheduled. Prepare with STAR method questions.",
          dateAdded: "Jun 30",
        },
      ];
      setKanbanTasks(initialTasks);
      localStorage.setItem("ijob_kanban_tasks", JSON.stringify(initialTasks));
    }

    // Initialize/read usage logs
    const dateKey = new Date().toDateString();
    const cvLogs = localStorage.getItem(`ijob_cv_logs_${dateKey}`);
    const intLogs = localStorage.getItem(`ijob_int_logs_${dateKey}`);
    setCvAuditsToday(cvLogs ? parseInt(cvLogs) : 0);
    setInterviewSessionsToday(intLogs ? parseInt(intLogs) : 0);
  }, []);

  // Update Kanban tasks state in localStorage on changes
  const handleKanbanChange = (updatedTasks: KanbanTask[]) => {
    setKanbanTasks(updatedTasks);
    localStorage.setItem("ijob_kanban_tasks", JSON.stringify(updatedTasks));
  };

  // Authenticate user successfully
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setSelectedIndustry(user.industry || "Tech/IT");
    setView("dashboard");
  };

  // Sign out user cleanly
  const handleSignOut = () => {
    localStorage.removeItem("ijob_current_user");
    setCurrentUser(null);
    setIsAdminMode(false);
    setView("landing");
  };

  // Setup prompt or trigger to registration modal (conversion hooks)
  const triggerAuthFlow = (message: string, isPremiumUpgrade: boolean = false) => {
    setAuthModalMessage(message);
    setAuthModalMode(isPremiumUpgrade ? "premium_cta" : "signup");
    setAuthModalOpen(true);
  };

  // Increment usage with local safety guards
  const incrementCVAudits = (): boolean => {
    const dateKey = new Date().toDateString();
    const current = cvAuditsToday;
    if (currentUser?.isPremium) return true; // Unlimited

    if (current >= 3) {
      return false; // Lock out
    }

    const nextVal = current + 1;
    setCvAuditsToday(nextVal);
    localStorage.setItem(`ijob_cv_logs_${dateKey}`, nextVal.toString());
    return true;
  };

  const incrementInterviewSessions = (): boolean => {
    const dateKey = new Date().toDateString();
    const current = interviewSessionsToday;
    if (currentUser?.isPremium) return true; // Unlimited

    if (current >= 1) {
      return false; // Lock out
    }

    const nextVal = current + 1;
    setInterviewSessionsToday(nextVal);
    localStorage.setItem(`ijob_int_logs_${dateKey}`, nextVal.toString());
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] relative font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white antialiased">
      
      {/* GLOBAL SYSTEM BAR FOR HIDDEN ADMIN NOTIFICATIONS */}
      {currentUser?.email === "admin@ijobijob.com" && (
        <div className="bg-red-600 text-white text-xs px-4 py-2 font-semibold flex items-center justify-between gap-4 select-none shrink-0 border-b border-red-700">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
            <span>Secure Admin Account Identified. Hidden Operations Portal is unlocked.</span>
          </div>
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all"
          >
            {isAdminMode ? "Exit Admin View" : "Enter Admin View"}
          </button>
        </div>
      )}

      {/* HEADER / NAVIGATION BAR */}
      <header className="backdrop-blur-md bg-white/80 border-b border-zinc-200/80 sticky top-0 z-40 transition-all shrink-0 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          
          {/* Logo / Title */}
          <button
            onClick={() => { setIsAdminMode(false); setView("landing"); }}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            <div className="bg-blue-600 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black italic text-base transition-all-custom group-hover:scale-105 shadow-sm shadow-blue-500/20">
              ij
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-neutral-950 font-display">i job i job</span>
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200/60 font-mono font-bold">QA v1.2</span>
              </div>
              <span className="text-[9px] font-bold text-neutral-400 block tracking-wider uppercase font-mono">Evaluation & Auditing Console</span>
            </div>
          </button>

          {/* Central navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-neutral-500">
            <button
              onClick={() => { setIsAdminMode(false); setView("landing"); }}
              className={`hover:text-neutral-900 transition-colors cursor-pointer ${view === "landing" ? "text-neutral-950 font-extrabold border-b-2 border-blue-600 py-1" : ""}`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                if (!currentUser) {
                  triggerAuthFlow("Register your email to access the unified candidate tracking dashboard.");
                } else {
                  setIsAdminMode(false);
                  setView("dashboard");
                }
              }}
              className={`hover:text-neutral-900 transition-colors cursor-pointer ${view === "dashboard" && !isAdminMode ? "text-neutral-950 font-extrabold border-b-2 border-blue-600 py-1" : ""}`}
            >
              Candidate Workspace
            </button>
            <a href="#pricing-table" className="hover:text-neutral-900 transition-colors py-1">
              Premium Upgrade (R99/mo)
            </a>
          </nav>

          {/* Authentication trigger actions */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-1">
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono">System Status</span>
              <span className="text-[10.5px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 100% OPERATIONAL
              </span>
            </div>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-neutral-800">{currentUser.name}</span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide font-mono ${
                    currentUser.isPremium
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                  }`}>
                    {currentUser.isPremium ? "Premium Pass" : "Free Plan"}
                  </span>
                </div>
                
                {currentUser.isPremium ? (
                  <span className="bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-200" title="Premium status activated">
                    <Award className="w-4 h-4 fill-blue-500/10" />
                  </span>
                ) : (
                  <button
                    onClick={() => triggerAuthFlow("Upgrade to i job i job Premium Pass to get unlimited CV scans and recruiter follow-ups.", true)}
                    className="hidden lg:flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 px-3 py-1.5 rounded-lg transition-all shadow-2xs"
                  >
                    Upgrade Pass
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="text-neutral-500 hover:text-neutral-900 p-2 rounded-lg hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode("signin");
                    setAuthModalMessage("Access your professional job seeker dashboard.");
                    setAuthModalOpen(true);
                  }}
                  className="text-xs font-bold text-neutral-600 hover:text-neutral-900 px-3.5 py-2 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode("signup");
                    setAuthModalMessage("Create your professional i job i job account to unlock metrics tracking.");
                    setAuthModalOpen(true);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-all-custom shadow-xs cursor-pointer"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* RENDER VIEW CONTROLLER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdminMode ? (
          /* Secure Administrative Operations Dashboard */
          <AdminPortal onBackToDashboard={() => setIsAdminMode(false)} />
        ) : view === "landing" ? (
          /* High-Conversion SaaS Public Landing Page */
          <div className="space-y-16 animate-in fade-in duration-300">
            
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-6 pt-10 pb-6">
              <div className="inline-flex items-center gap-2.5 bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 fill-sky-600/10" />
                <span>Meticulous QA Review for Resumes & Pitches</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-neutral-900 leading-none">
                Job Seeking is a{" "}
                <span className="underline decoration-sky-500 decoration-wavy decoration-2 underline-offset-4">Process</span>.
              </h1>
              
              <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl mx-auto">
                Stop throwing resumes into blind ATS black holes. Our advanced platform evaluates, optimizes, and rewrites your career application materials to clear high-standard hiring criteria in every major industry.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    if (currentUser) {
                      setView("dashboard");
                    } else {
                      triggerAuthFlow("Sign up today to access the unified candidate workspace!");
                    }
                  }}
                  className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-850 text-white font-extrabold text-sm py-3 px-7 rounded-xl transition-all-custom shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Enter Member Workspace <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#pricing-table"
                  className="w-full sm:w-auto text-xs font-bold text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 py-3 px-5 rounded-xl transition-all text-center"
                >
                  View Enterprise Plans
                </a>
              </div>

              {/* Secure micro-trust badge */}
              <div className="pt-6 flex justify-center items-center gap-6 text-[11px] text-neutral-400 font-bold tracking-wide uppercase">
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-sky-600" /> Private document parsing</span>
                <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-sky-600" /> Zero host log archives</span>
              </div>
            </div>

            {/* Interactive Widget Playground Preview */}
            <div className="bg-white border border-neutral-150 rounded-3xl p-6 sm:p-8 shadow-xs relative">
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-sky-600" /> Playground Mode
              </div>
              
              <div className="text-center max-w-xl mx-auto mb-8 pt-2">
                <h2 className="text-lg font-bold text-neutral-900 font-display">Test our Universal ATS Match tool instantly</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Evaluate your alignment scores below. Registration is required to unlock full phrasing feedback and interview session evaluations.
                </p>
              </div>

              {/* Simplified CV audit widget rendering */}
              <CVAuditTab
                selectedIndustry={selectedIndustry}
                currentUser={currentUser}
                onTriggerAuth={(msg) => triggerAuthFlow(msg)}
                incrementCVAudits={incrementCVAudits}
                auditsRemaining={3 - cvAuditsToday}
              />
            </div>

            {/* Core Feature Highlights */}
            <div className="space-y-6 pt-6">
              <div className="text-center max-w-xl mx-auto">
                <h2 className="text-xl font-bold font-display text-neutral-900">Built for Critical Job Opportunities</h2>
                <p className="text-xs text-neutral-500 mt-1.5">
                  Universal parameters adjust dynamically to find and optimize the missing metrics hiring directors actually evaluate.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-neutral-150 rounded-2xl p-6 shadow-2xs space-y-3">
                  <div className="bg-neutral-100 text-neutral-900 p-2.5 rounded-xl border border-neutral-200 w-fit">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-900 font-display">1. The CV Architect</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Identifies missing high-value industry KPIs. Our engine audits weak phrasing and outputs high-impact statements embedding metric variables and placeholders.
                  </p>
                </div>

                <div className="bg-white border border-neutral-150 rounded-2xl p-6 shadow-2xs space-y-3">
                  <div className="bg-neutral-100 text-neutral-900 p-2.5 rounded-xl border border-neutral-200 w-fit">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-900 font-display">2. Multi-channel Pitch Generator</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Generates polished Cover Letters, targeted LinkedIn connection prompts, and recruiter follow-ups tailored to key sectors like Finance, Tech, Healthcare, and Hospitality.
                  </p>
                </div>

                <div className="bg-white border border-neutral-150 rounded-2xl p-6 shadow-2xs space-y-3">
                  <div className="bg-neutral-100 text-neutral-900 p-2.5 rounded-xl border border-neutral-200 w-fit">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-900 font-display">3. QA Interview Coach</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Interactive situational interview simulator. Grades responses on a rigorous scorecard, evaluates STAR components, and provides detailed feedback.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Section Table */}
            <div id="pricing-table" className="bg-white border border-neutral-150 rounded-3xl p-8 shadow-xs max-w-4xl mx-auto">
              <div className="text-center max-w-md mx-auto mb-10">
                <span className="bg-sky-50 text-sky-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-sky-100 uppercase tracking-widest font-mono">
                  Affordable & Transparent
                </span>
                <h2 className="text-xl font-bold font-display text-neutral-900 mt-2">Pick Your Career Optimization Level</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Keep hosting and processing costs down with secure, private client-side sessions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <div className="border border-neutral-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between hover:border-neutral-300 transition-all bg-neutral-50/30">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider font-display">Standard Free Pass</h3>
                      <p className="text-xs text-neutral-400 mt-1">Great for casual resume evaluations</p>
                    </div>

                    <div className="flex items-baseline text-neutral-900">
                      <span className="text-3xl font-black font-display">R0</span>
                      <span className="text-xs text-neutral-500 ml-1">/ forever</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-neutral-600 font-medium pt-2 border-t border-neutral-100">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" /> 3 CV Audits per day
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" /> 1 Mock Interview session per day
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Basic compatibility match score
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Local Kanban Board access
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (currentUser) {
                        setView("dashboard");
                      } else {
                        triggerAuthFlow("Create your standard free account to track resumes!");
                      }
                    }}
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs py-2.5 rounded-xl transition-all text-center cursor-pointer"
                  >
                    {currentUser ? "Enter Workspace" : "Register Free Account"}
                  </button>
                </div>

                {/* Premium Plan */}
                <div className="border border-sky-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between bg-sky-50/20 relative shadow-xs">
                  <div className="absolute top-4 right-4 bg-sky-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide font-mono">
                    Popular
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-sky-950 uppercase tracking-wider font-display">QA Premium Pass</h3>
                      <p className="text-xs text-sky-600 font-medium mt-1">Unlimited executive-level evaluation</p>
                    </div>

                    <div className="flex items-baseline text-sky-950">
                      <span className="text-3xl font-black font-display">R99</span>
                      <span className="text-xs text-neutral-500 ml-1">/ month</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-neutral-700 font-medium pt-2 border-t border-sky-100">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-sky-600 shrink-0" /> <strong className="text-sky-950 font-bold">Unlimited</strong> CV Keyword & Metric Audits
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-sky-600 shrink-0" /> <strong className="text-sky-950 font-bold">Unlimited</strong> Interactive Interview Coaching
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-sky-600 shrink-0" /> Copy full phrasing enhancements immediately
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-sky-600 shrink-0" /> Download comprehensive report drafts
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-sky-600 shrink-0" /> Custom industry adaptive parameters
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (currentUser && currentUser.isPremium) {
                        setView("dashboard");
                      } else {
                        triggerAuthFlow("Unlock i job i job Premium for unlimited access instantly.", true);
                      }
                    }}
                    className="w-full bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs py-2.5 rounded-xl transition-all-custom text-center shadow-xs cursor-pointer"
                  >
                    {currentUser?.isPremium ? "Enter Workspace" : "Unlock Premium Pass Now"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Unified Candidate Dashboard Workspace with High-Density layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
            
            {/* LEFT SIDEBAR (Col-span 4 for structured layout density) */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Daily Action Planner component */}
              <DailyPlanner selectedIndustry={selectedIndustry} />

              {/* High-density Premium Upgrade Sidebar Widget */}
              <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Console Usage Track</span>
                  <span className="text-xs font-mono text-blue-400 font-bold">
                    {currentUser?.isPremium ? "Unlimited Access" : `${Math.round(((3 - (3 - cvAuditsToday)) / 3) * 100)}% Used`}
                  </span>
                </div>
                {!currentUser?.isPremium && (
                  <>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${(cvAuditsToday / 3) * 100}%` }}></div>
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-slate-400">
                      {cvAuditsToday}/3 CV Audits used today. Upgrade to i job i job Premium for meticulous real-time unlimited scans and AI interview coaches.
                    </p>
                  </>
                )}
                {currentUser?.isPremium ? (
                  <div className="bg-blue-950/40 border border-blue-900/50 rounded-xl p-3">
                    <p className="text-[11.5px] text-blue-300 font-medium leading-relaxed">
                      🚀 <strong className="text-white">Premium Status Active:</strong> Infinite scans, cover letter copying, and unlimited interview coaching are unlocked.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => triggerAuthFlow("Upgrade to i job i job Premium Pass to get unlimited CV scans and recruiter follow-ups.", true)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer text-center"
                  >
                    Get Premium Pass R99/mo
                  </button>
                )}
              </div>
            </aside>

            {/* MAIN WORKSPACE CONTENT (Col-span 8) */}
            <main className="lg:col-span-8 space-y-6">
              
              {/* Top Workspace Header & Global Industry Selector */}
              <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded border border-slate-200 uppercase tracking-wider font-mono">
                    WORKSPACE CONSOLE
                  </span>
                  <h1 className="text-lg font-bold text-slate-900 mt-1.5 font-display">
                    Candidate Evaluation Console
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    QA engine evaluates alignment matching to secure high-standard recruiter placement.
                  </p>
                </div>

                {/* Target Field Dropdown Selector */}
                <div className="space-y-1 w-full sm:w-60 shrink-0">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Target Job Field
                  </label>
                  <div className="relative">
                    <select
                      value={selectedIndustry}
                      onChange={(e) => {
                        const ind = e.target.value as TargetField;
                        setSelectedIndustry(ind);
                        // Update user record locally if possible
                        if (currentUser) {
                          const updated = { ...currentUser, industry: ind };
                          setCurrentUser(updated);
                          localStorage.setItem("ijob_current_user", JSON.stringify(updated));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 py-2.5 pl-3 pr-10 rounded-lg appearance-none focus:outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Customer Service/Call Center">Customer Service/Call Center</option>
                      <option value="Tech/IT">Tech/IT</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Tabs controls & content */}
              <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-xs space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 select-none overflow-x-auto">
                  {(
                    [
                      { id: "cv-architect", label: "CV Architect", icon: FileText },
                      { id: "pitch-generator", label: "Pitch Generator", icon: MessageSquare },
                      { id: "interview-coach", label: "QA Interview Coach", icon: Award },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-1.5 px-3 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                        activeTab === tab.id
                          ? "bg-white text-slate-900 border border-slate-200 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  {activeTab === "cv-architect" && (
                    <CVAuditTab
                      selectedIndustry={selectedIndustry}
                      currentUser={currentUser}
                      onTriggerAuth={(msg) => triggerAuthFlow(msg)}
                      incrementCVAudits={incrementCVAudits}
                      auditsRemaining={3 - cvAuditsToday}
                    />
                  )}

                  {activeTab === "pitch-generator" && (
                    <PitchGeneratorTab
                      selectedIndustry={selectedIndustry}
                      currentUser={currentUser}
                      onTriggerAuth={(msg) => triggerAuthFlow(msg)}
                    />
                  )}

                  {activeTab === "interview-coach" && (
                    <InterviewCoachTab
                      selectedIndustry={selectedIndustry}
                      currentUser={currentUser}
                      onTriggerAuth={(msg) => triggerAuthFlow(msg)}
                      incrementInterviewSessions={incrementInterviewSessions}
                      sessionsRemaining={1 - interviewSessionsToday}
                    />
                  )}
                </div>
              </div>

              {/* Kanban board (Application Pipeline!) */}
              <KanbanTracker
                tasks={kanbanTasks}
                onTasksChange={handleKanbanChange}
                selectedIndustry={selectedIndustry}
              />

            </main>

          </div>
        )}
      </main>

      {/* GLOBAL HIGH-CONTRAST COMPLIANT FOOTER */}
      <footer className="bg-white border-t border-neutral-100 py-6 mt-16 text-center text-xs text-neutral-400 font-medium select-none shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span>&copy; {new Date().getFullYear()} i job i job. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            <button onClick={() => setView("landing")} className="hover:text-neutral-600 transition-colors">Overview</button>
            <button
              onClick={() => triggerAuthFlow("Upgrade to i job i job Premium to unlock unlimited scans instantly.", true)}
              className="hover:text-neutral-600 transition-colors"
            >
              Pricing
            </button>
            <span>Privacy Guarded</span>
          </div>
        </div>
      </footer>

      {/* CENTRAL AUTHENTICATION MODAL POPUP */}
      <SignInModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        message={authModalMessage}
      />

    </div>
  );
}
