import React, { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, HelpCircle, Shield, Award, RefreshCw, Star, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Briefcase, Building2, Play, ChevronRight, Info } from "lucide-react";
import { Message, Scorecard, TargetField, User, CustomQuestionsResult } from "../types";

interface InterviewCoachTabProps {
  selectedIndustry: TargetField;
  currentUser: User | null;
  onTriggerAuth: (msg: string) => void;
  incrementInterviewSessions: () => boolean; // Returns true if allowed, false if limit reached
  sessionsRemaining: number;
}

export default function InterviewCoachTab({
  selectedIndustry,
  currentUser,
  onTriggerAuth,
  incrementInterviewSessions,
  sessionsRemaining,
}: InterviewCoachTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom Questions Generator states
  const [subMode, setSubMode] = useState<"simulator" | "builder">("simulator");
  const [jobTitle, setJobTitle] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [builderLoading, setBuilderLoading] = useState(false);
  const [builderError, setBuilderError] = useState("");
  const [customQuestions, setCustomQuestions] = useState<CustomQuestionsResult | null>(null);
  const [loadedQuestionInfo, setLoadedQuestionInfo] = useState<{ question: string; jobTitle: string } | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load welcome question when the tab opens or the industry changes
  useEffect(() => {
    startNewSession();
    setCustomQuestions(null);
    setJobTitle("");
    setCompanyType("");
    setSubMode("simulator");
  }, [selectedIndustry]);

  const startNewSession = async (customQuestionToLoad?: string) => {
    setLoading(true);
    setError("");
    setMessages([]);

    if (customQuestionToLoad) {
      setMessages([
        {
          role: "assistant",
          content: customQuestionToLoad,
        }
      ]);
      setLoading(false);
      return;
    }

    setLoadedQuestionInfo(null);

    try {
      const response = await fetch("/api/gemini/interview-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: selectedIndustry,
          history: [],
          lastUserMessage: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize mock interview coaching session.");
      }

      const data = await response.json();
      setMessages([
        {
          role: "assistant",
          content: data.nextQuestion || `Welcome to your mock interview for ${selectedIndustry}. Tell me about a time you had to handle a critical challenge in your field.`,
        },
      ]);
    } catch (err: any) {
      setError(err.message || "Could not connect to the QA Interview Coach.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || builderLoading) return;

    setBuilderLoading(true);
    setBuilderError("");
    setCustomQuestions(null);

    try {
      const response = await fetch("/api/gemini/custom-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: selectedIndustry,
          jobTitle: jobTitle.trim(),
          companyType: companyType.trim() || "General/Standard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate custom interview questions.");
      }

      const data = await response.json();
      setCustomQuestions(data);
    } catch (err: any) {
      setBuilderError(err.message || "Failed to communicate with the QA questions engine.");
    } finally {
      setBuilderLoading(false);
    }
  };

  const handlePracticeQuestion = (questionText: string, title: string) => {
    setLoadedQuestionInfo({ question: questionText, jobTitle: title });
    startNewSession(questionText);
    setSubMode("simulator");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    // Check usage limit for free users when sending a response (active session)
    if (messages.length === 1 && currentUser && !currentUser.isPremium) {
      const allowed = incrementInterviewSessions();
      if (!allowed) {
        onTriggerAuth("You have reached your daily limit of 1 interactive interview session. Unlock Premium to get unlimited mock sessions today!");
        return;
      }
    }

    const userMsgText = inputMessage.trim();
    setInputMessage("");
    setError("");

    // Append user message immediately
    const updatedMessages = [...messages, { role: "user" as const, content: userMsgText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/interview-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: selectedIndustry,
          history: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          lastUserMessage: userMsgText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate interview response.");
      }

      const data = await response.json();

      // Append assistant's question and scorecard evaluation to the history
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.nextQuestion,
          scorecard: data.evaluation?.hasResponseToEvaluate ? data.evaluation : undefined,
        },
      ]);
    } catch (err: any) {
      setError(err.message || "An error occurred during evaluation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300" id="interview-coach-tab">
      
      {/* Sub-option Selector (Bento Switcher at the Top) */}
      <div className="flex border-b border-slate-300 gap-6 select-none bg-white p-1 rounded-xl border px-4 shadow-2xs">
        <button
          onClick={() => setSubMode("simulator")}
          className={`py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all -mb-[5px] shrink-0 cursor-pointer ${
            subMode === "simulator"
              ? "border-blue-600 text-blue-650 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current text-blue-600" />
          <span>Live Interactive Simulator</span>
        </button>
        <button
          onClick={() => setSubMode("builder")}
          className={`py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all -mb-[5px] shrink-0 cursor-pointer ${
            subMode === "builder"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 animate-pulse" />
          <span>Custom Questions Generator</span>
        </button>
      </div>

      {subMode === "simulator" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Interactive Chat Canvas - Refined with premium card styles */}
          <div className="premium-card p-6 lg:col-span-2 flex flex-col h-[650px]">
            
            {/* Chat Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-150 shrink-0">
              <div>
                <h2 className="text-sm font-extrabold text-neutral-900 font-display flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Interview Simulator
                </h2>
                <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                  {loadedQuestionInfo ? (
                    <span>
                      Practicing tailored <span className="font-bold text-blue-600 font-mono">{loadedQuestionInfo.jobTitle}</span> question
                    </span>
                  ) : (
                    <span>
                      Hiring Manager Mock Session for <span className="font-bold text-neutral-700 font-mono">{selectedIndustry}</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                {loadedQuestionInfo && (
                  <button
                    onClick={() => startNewSession()}
                    className="text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 px-2.5 py-1.5 rounded-lg transition-all font-bold cursor-pointer shadow-2xs"
                    title="Load original general industry mock questions"
                  >
                    Reset to Default
                  </button>
                )}
                <span className="text-[10px] bg-neutral-100 border border-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-lg font-mono font-bold">
                  Daily Sessions: {currentUser?.isPremium ? "Unlimited" : `${sessionsRemaining}/1`}
                </span>
                <button
                  onClick={() => startNewSession(loadedQuestionInfo?.question)}
                  className="text-[11px] text-neutral-700 hover:text-neutral-950 font-bold flex items-center gap-1.5 border border-neutral-250 px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 transition-all cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500" /> Restart
                </button>
              </div>
            </div>

            {error && (
              <div className="my-3 bg-red-50 text-red-655 text-xs px-3 py-2.5 rounded-xl border border-red-100 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                  <div className={`p-2.5 rounded shrink-0 border h-9 w-9 flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-neutral-100 text-neutral-800 border-neutral-200"
                  }`}>
                    {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className={`text-xs px-4 py-3 rounded-2xl border leading-relaxed ${
                      msg.role === "user"
                        ? "bg-neutral-50 text-neutral-900 border-neutral-200"
                        : "bg-white text-neutral-850 border-neutral-200"
                    }`}>
                      {msg.content}
                    </div>

                    {/* Inline Scorecard summary for last assistant message evaluated */}
                    {msg.scorecard && (
                      <div className="bg-blue-50/30 border border-blue-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-100/50">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-blue-600" />
                            <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider font-mono">QA Evaluation Scorecard</span>
                          </div>
                          <div className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded font-mono">
                            Score: {msg.scorecard.overallScore}/100
                          </div>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans font-medium">
                          {msg.scorecard.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                  <div className="p-2.5 rounded shrink-0 border bg-neutral-50 border-neutral-200 h-9 w-9 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-neutral-500" />
                  </div>
                  <div className="text-xs text-neutral-550 italic bg-white border border-neutral-200 px-4 py-2.5 rounded-2xl shadow-2xs font-mono">
                    Coach is auditing your tone and STAR metrics structure...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="mt-auto pt-3 border-t border-neutral-200 shrink-0 flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
                placeholder="Type your professional interview response here..."
                className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-neutral-900 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white p-2.5 rounded transition-all shrink-0 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Real-time Meticulous QA Scorecard Sidebar - Refined with premium card styles */}
          <div className="premium-card p-6 h-[650px] overflow-y-auto">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-150 font-mono">
              Response Scorecard
            </h3>

            {/* Find the most recent scorecard in the message history */}
            {(() => {
              const lastScorecardMsg = [...messages].reverse().find((m) => m.scorecard);
              const scorecard: Scorecard | undefined = lastScorecardMsg?.scorecard;

              if (!scorecard) {
                return (
                  <div className="flex flex-col items-center justify-center text-center py-20 text-slate-400">
                    <Star className="w-10 h-10 stroke-1 stroke-slate-300 fill-slate-50 mb-3" />
                    <h4 className="text-xs font-bold text-slate-900 font-display">Awaiting Response Evaluation</h4>
                    <p className="text-[11px] leading-relaxed max-w-[200px] mt-1 text-slate-500">
                      Type your reply to the question on the left. The QA Engine will grade your answers here.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Radial Metrics */}
                  <div className="bg-slate-50 border border-slate-250 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Overall Match</h4>
                      <span className="text-3xl font-extrabold text-slate-900 font-mono mt-1 block">
                        {scorecard.overallScore}%
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">QA Status</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase font-mono ${
                        scorecard.overallScore >= 80
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                          : "bg-amber-50 text-amber-800 border border-amber-100"
                      }`}>
                        {scorecard.overallScore >= 80 ? "METRIC COMPLIANT" : "METRICS DEFICIENT"}
                      </span>
                    </div>
                  </div>

                  {/* Subscores */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Tone Alignment</span>
                        <span className="font-mono">{scorecard.toneScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${scorecard.toneScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>STAR Structure</span>
                        <span className="font-mono">{scorecard.starScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${scorecard.starScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Core Competencies</span>
                        <span className="font-mono">{scorecard.competenciesScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${scorecard.competenciesScore}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* STAR Evaluation Grid */}
                  <div className="space-y-3.5 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 font-display flex items-center gap-1">
                      <Star className="w-4 h-4 fill-blue-500/10 text-blue-600 shrink-0" />
                      STAR Structure Breakdown
                    </h4>

                    <div className="space-y-2 text-[11px] leading-relaxed">
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-250">
                        <strong className="text-slate-900 uppercase font-mono tracking-wider text-[9px] block">Situation:</strong>
                        <span className="text-slate-650 font-medium">{scorecard.starMethodBreakdown.situation}</span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded border border-slate-250">
                        <strong className="text-slate-900 uppercase font-mono tracking-wider text-[9px] block">Task:</strong>
                        <span className="text-slate-650 font-medium">{scorecard.starMethodBreakdown.task}</span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded border border-slate-250">
                        <strong className="text-slate-900 uppercase font-mono tracking-wider text-[9px] block">Action:</strong>
                        <span className="text-slate-655 font-medium">{scorecard.starMethodBreakdown.action}</span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded border border-slate-250">
                        <strong className="text-slate-900 uppercase font-mono tracking-wider text-[9px] block">Result (Metrics):</strong>
                        <span className="text-slate-655 font-medium">{scorecard.starMethodBreakdown.result}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* Custom Questions Generator Sub-option View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
          
          {/* Configuration Form Column (Left, col-span 4) */}
          <div className="lg:col-span-4 premium-card p-5 space-y-5">
            <div>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider font-mono">
                Generator Console
              </span>
              <h3 className="text-sm font-extrabold text-neutral-900 mt-2 font-display">
                Tailored QA Questions
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Generate highly targeted situational and behavioral prompts matching specific job titles and company contexts.
              </p>
            </div>

            <form onSubmit={handleGenerateCustomQuestions} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                  Target Job Title *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior QA Engineer"
                    className="w-full bg-neutral-50 border border-neutral-300 text-xs font-medium text-neutral-850 py-2.5 pl-9 pr-3 rounded-lg focus:outline-hidden focus:border-neutral-950 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                  Company Type / Context
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    placeholder="e.g. Series-A AI Startup, MNC Bank"
                    className="w-full bg-neutral-50 border border-neutral-300 text-xs font-medium text-neutral-850 py-2.5 pl-9 pr-3 rounded-lg focus:outline-hidden focus:border-neutral-950 font-mono"
                  />
                </div>
              </div>

              {builderError && (
                <div className="bg-red-50 text-red-650 text-[11px] px-3 py-2.5 rounded-xl border border-red-200 font-semibold flex items-start gap-1.5 leading-relaxed">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                  <span>{builderError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={builderLoading || !jobTitle.trim()}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 disabled:bg-neutral-200 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                {builderLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Analyzing Core Competencies...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-white/10" />
                    <span>Generate 5 Tailored Questions</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-neutral-150">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono mb-2">
                What makes this unique?
              </h4>
              <p className="text-[11px] leading-relaxed text-neutral-550">
                Unlike static standard questions, custom questions are computed using real-time recruiter parameters. Click <strong>Practice</strong> on any generated question to load it directly into the interactive chatbot with the STAR scorecard assessment.
              </p>
            </div>
          </div>

          {/* Results Column (Right, col-span 8) */}
          <div className="lg:col-span-8 space-y-6">
            {!customQuestions && !builderLoading ? (
              <div className="premium-card p-12 text-center flex flex-col items-center justify-center h-[450px]">
                <div className="bg-neutral-50 border border-neutral-200 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                </div>
                <h4 className="font-bold text-sm text-neutral-900 font-display">Awaiting Custom Question Request</h4>
                <p className="text-xs text-neutral-500 max-w-[360px] mt-2 leading-relaxed">
                  Submit a job title and company profile context. The AI-powered QA engine will generate an advanced set of behavioral and situational prompts.
                </p>
              </div>
            ) : builderLoading ? (
              <div className="premium-card p-12 text-center flex flex-col items-center justify-center h-[450px] space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-blue-500 absolute animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 font-display">Formulating Role-specific Questions</h4>
                  <p className="text-xs text-neutral-500 max-w-[340px] mt-1.5 leading-relaxed">
                    Analyzing target role requirements, mapping industry-standard performance metrics, and defining STAR grader guidelines...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Role Profile summary card */}
                {customQuestions?.roleProfile && (
                  <div className="bg-blue-50/20 border border-blue-200 rounded-2xl p-5 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider font-mono">Hiring Profile Match Guidance</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-700 font-medium font-sans">
                      {customQuestions.roleProfile}
                    </p>
                  </div>
                )}

                {/* Question Cards List */}
                <div className="space-y-4">
                  {customQuestions?.questions.map((q, idx) => (
                    <div key={q.id || idx} className="premium-card p-5 space-y-4">
                      
                      {/* Card Header with Number and Type */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-neutral-150 text-neutral-700 px-2 py-0.5 rounded font-mono font-bold">
                          QUESTION {idx + 1}
                        </span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                          q.type === "Behavioral"
                            ? "bg-blue-50 text-blue-700 border border-blue-150"
                            : "bg-purple-50 text-purple-700 border border-purple-150"
                        }`}>
                          {q.type}
                        </span>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs font-extrabold text-neutral-900 leading-relaxed font-display">
                        {q.question}
                      </p>

                      {/* Expanded Help Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1.5">
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-1">
                          <div className="flex items-center gap-1 text-neutral-800 font-bold text-[9.5px] uppercase tracking-wider font-mono">
                            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>What Recruiter Audits</span>
                          </div>
                          <p className="text-[10.5px] text-neutral-600 leading-relaxed">
                            {q.industryFocus}
                          </p>
                        </div>

                        <div className="bg-emerald-50/10 p-3 rounded-lg border border-neutral-200 space-y-1">
                          <div className="flex items-center gap-1 text-neutral-800 font-bold text-[9.5px] uppercase tracking-wider font-mono">
                            <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                            <span>STAR Response Hint</span>
                          </div>
                          <p className="text-[10.5px] text-neutral-700 leading-relaxed">
                            {q.starHint}
                          </p>
                        </div>
                      </div>

                      {/* CTA to Practice */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handlePracticeQuestion(q.question, jobTitle)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Practice in Simulator</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
