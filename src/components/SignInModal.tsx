import React, { useState } from "react";
import { X, Mail, Shield, Zap, CheckCircle2, Lock } from "lucide-react";
import { User, TargetField } from "../types";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: "signin" | "signup" | "premium_cta";
  message?: string;
}

export default function SignInModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "signup",
  message,
}: SignInModalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "premium_cta">(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<TargetField>("Tech/IT");
  const [isPremiumSelect, setIsPremiumSelect] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup" && !name) {
      setError("Please enter your name.");
      return;
    }

    // Save user to localStorage
    const newUser: User = {
      email: email.trim().toLowerCase(),
      name: mode === "signup" ? name.trim() : email.split("@")[0],
      industry,
      isPremium: isPremiumSelect || email.toLowerCase().includes("premium") || mode === "premium_cta",
      registeredAt: new Date().toISOString(),
    };

    // Get existing users to persist registered users count in localStorage
    const usersJson = localStorage.getItem("ijob_registered_users");
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    if (!users.some((u) => u.email === newUser.email)) {
      users.push(newUser);
      localStorage.setItem("ijob_registered_users", JSON.stringify(users));
    } else {
      // If user exists, read their previous profile
      const existing = users.find((u) => u.email === newUser.email);
      if (existing) {
        newUser.name = existing.name;
        newUser.isPremium = existing.isPremium || newUser.isPremium;
        newUser.industry = existing.industry;
      }
    }

    localStorage.setItem("ijob_current_user", JSON.stringify(newUser));
    onAuthSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="auth-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-neutral-100 overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Banner */}
        <div className="bg-neutral-900 px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center justify-center bg-sky-500/20 text-sky-400 p-2.5 rounded-xl border border-sky-500/30 mb-3">
            <Zap className="w-6 h-6 fill-sky-400/20 animate-pulse" />
          </div>
          
          <h3 className="text-xl font-bold font-display tracking-tight text-white">
            {mode === "premium_cta" ? "Unlock i job i job Premium" : "Sign up for i job i job"}
          </h3>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-xs mx-auto">
            {message || "The standard QA evaluation engine for resumes, pitch materials, and technical mock interviews."}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

          {mode === "premium_cta" ? (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-sky-950">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-sky-900 font-display">
                  <Shield className="w-4 h-4 text-sky-600" /> Professional QA Suite Included
                </div>
                <p className="text-xs leading-relaxed text-neutral-600">
                  You are unlocking our high-standard AI engine. Get unlimited CV deep audits, unlimited recruiter cover pitches, and a dedicated 24/7 interview grading coach.
                </p>
              </div>

              <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 font-display">Monthly Premium Pass</h4>
                  <p className="text-xs text-neutral-500">Cancel anytime, no questions asked</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-neutral-900 font-display">R99</span>
                  <span className="text-xs text-neutral-500">/mo</span>
                </div>
              </div>

              <form onSubmit={(e) => { setIsPremiumSelect(true); handleSubmit(e); }} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Your Professional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4" /> Unlock Premium Pass
                </button>
              </form>

              <button
                onClick={() => setMode("signup")}
                className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors pt-2 block"
              >
                Back to standard registration
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white px-3.5 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Select Target Field</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as TargetField)}
                  className="w-full bg-white px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900"
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
              </div>

              {mode === "signup" && (
                <div className="flex items-start gap-2.5 pt-1.5">
                  <input
                    type="checkbox"
                    id="isPremiumSelect"
                    checked={isPremiumSelect}
                    onChange={(e) => setIsPremiumSelect(e.target.checked)}
                    className="mt-0.5 rounded-sm text-sky-600 focus:ring-sky-500 border-neutral-300"
                  />
                  <label htmlFor="isPremiumSelect" className="text-xs text-neutral-600 cursor-pointer">
                    <span className="font-bold text-neutral-900">Get 7-Day Premium Trial</span> (Unlimited detailed breakdowns & interview sessions)
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-neutral-900 hover:bg-neutral-850 text-white py-2.5 rounded-xl text-sm font-semibold transition-all-custom shadow-xs mt-2"
              >
                {mode === "signup" ? "Create Free Account" : "Access QA Engine"}
              </button>

              <div className="text-center text-xs text-neutral-500 mt-4 pt-1 border-t border-neutral-100">
                {mode === "signup" ? (
                  <p>
                    Already have an account?{" "}
                    <button type="button" onClick={() => setMode("signin")} className="font-semibold text-sky-600 hover:underline">
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setMode("signup")} className="font-semibold text-sky-600 hover:underline">
                      Sign Up
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}

          <div className="mt-4 bg-neutral-50 rounded-xl p-3 flex items-center gap-2 border border-neutral-150 text-[10px] text-neutral-500 leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>
              <strong>Privacy Protection:</strong> All resume parsing, drafting, and feedback metrics remain inside your browser session. Your career documents are never stored on our host disks.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
