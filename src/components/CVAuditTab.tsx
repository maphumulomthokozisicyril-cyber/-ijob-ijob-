import React, { useState } from "react";
import { FileText, Search, AlertCircle, RefreshCw, CheckCircle2, Lock, Download, Copy, Sparkles, Check, HelpCircle } from "lucide-react";
import { CVAuditResult, TargetField, User } from "../types";

interface CVAuditTabProps {
  selectedIndustry: TargetField;
  currentUser: User | null;
  onTriggerAuth: (msg: string) => void;
  incrementCVAudits: () => boolean; // Returns true if allowed, false if limit reached
  auditsRemaining: number;
}

export default function CVAuditTab({
  selectedIndustry,
  currentUser,
  onTriggerAuth,
  incrementCVAudits,
  auditsRemaining,
}: CVAuditTabProps) {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult] = useState<CVAuditResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleInspect = async () => {
    if (!cvText.trim()) {
      setError("Please paste your current CV or resume text.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the target job description.");
      return;
    }

    setError("");

    // Check usage limits if logged in
    if (currentUser && !currentUser.isPremium) {
      const allowed = incrementCVAudits();
      if (!allowed) {
        onTriggerAuth("You have reached your daily limit of 3 CV Audits. Unlock Premium to inspect unlimited resumes immediately!");
        return;
      }
    }

    setLoading(true);
    setResult(null);

    // Realistic multi-stage inspection messages for a "QA Engine" vibe
    const stages = [
      "Synthesizing target industry parameters...",
      "Analyzing ATS keywords alignment...",
      "Auditing metric density & KPI presence...",
      "Generating line-by-line phrasing enhancements...",
    ];

    let currentStage = 0;
    setLoadingStage(stages[0]);
    const stageInterval = setInterval(() => {
      currentStage++;
      if (currentStage < stages.length) {
        setLoadingStage(stages[currentStage]);
      }
    }, 1200);

    try {
      const response = await fetch("/api/gemini/cv-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          jobDescription,
          industry: selectedIndustry,
        }),
      });

      clearInterval(stageInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to audit CV");
      }

      const data: CVAuditResult = await response.json();
      setResult(data);
    } catch (err: any) {
      clearInterval(stageInterval);
      setError(err.message || "An error occurred while connecting to the QA Engine.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentUser) {
      onTriggerAuth("Register your email to copy the full QA phrasing enhancements and unlock the complete dashboard!");
      return;
    }

    if (!result) return;
    const phrasingStr = result.phrasingImprovements
      .map((p) => `Original: "${p.originalText}"\nImproved: "${p.improvedText}"\nReason: ${p.reason}\n`)
      .join("\n");
    const copyContent = `i job i job - QA CV Evaluation\nScore: ${result.compatibilityScore}%\n\n--- Phrasing Suggestions ---\n${phrasingStr}`;

    navigator.clipboard.writeText(copyContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentUser) {
      onTriggerAuth("Register your email to download the detailed QA report PDF/text immediately!");
      return;
    }

    if (!result) return;
    const content = `i job i job - Professional QA Report
=============================================
Industry: ${selectedIndustry}
Overall ATS Compatibility Score: ${result.compatibilityScore}%

KEYWORDS IDENTIFIED:
${result.keywordAnalysis.foundKeywords.map((k) => `- ${k}`).join("\n")}

CRITICAL MISSING KEYWORDS:
${result.keywordAnalysis.missingKeywords.map((k) => `- ${k}`).join("\n")}

QA METRICS AUDIT FINDINGS:
${result.qaMetricsAudit
  .map(
    (m, idx) => `[${idx + 1}] Finding: ${m.finding}
    Why It Matters: ${m.whyItMatters}
    Suggestion: ${m.suggestion}`
  )
  .join("\n\n")}

PHRASING RECOMMENDATIONS:
${result.phrasingImprovements
  .map(
    (p, idx) => `[${idx + 1}] Original: "${p.originalText}"
    Improved: "${p.improvedText}"
    Why: ${m => p.reason}`
  )
  .join("\n\n")}
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ijob_qa_audit_report.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample data to load to make testing very easy and satisfying for visitors
  const loadSampleData = () => {
    setCvText(`John Doe
Sales Professional with 3 years of experience.
Responsible for managing customer relationships and selling software products.
Good communication skills and hardworking. Helped the team reach sales goals.
Skills: CRM, Cold calling, Customer success, Product demos, Negotiation.`);
    
    setJobDescription(`Account Executive / Sales Specialist
Looking for an energetic Sales representative to own client development.
Must have experience hitting monthly revenue quotas and driving outbound pipeline.
Key skills needed: Outbound Sales, Pipeline Management, CRM, Cold Calling, SaaS Sales, Revenue Growth, CSAT.`);
  };

  return (
    <div className="space-y-6" id="cv-architect-tab">
      
      {/* Input Section */}
      <div className="bg-white rounded-2xl border border-neutral-150 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold font-display flex items-center gap-2 text-neutral-900">
              <FileText className="w-5 h-5 text-neutral-800" /> The CV Architect
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Universal ATS & Metric density auditor. Optimize resume layout alignment to match target roles.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadSampleData}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold border border-sky-200 bg-sky-50/50 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Load Sample CV
            </button>
            <span className="text-xs bg-neutral-100 border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg font-mono font-medium">
              Daily audits left: {currentUser?.isPremium ? "Unlimited" : auditsRemaining}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              1. Paste Your Current CV / Resume Text
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your resume details here (experience, skills, contact detail formats...)"
              rows={10}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm focus:bg-white focus:outline-hidden focus:border-neutral-950 transition-all font-sans leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              2. Paste Target Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job post or role description here to execute ATS alignment audit..."
              rows={10}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm focus:bg-white focus:outline-hidden focus:border-neutral-950 transition-all font-sans leading-relaxed"
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-neutral-100 flex justify-end">
          <button
            onClick={handleInspect}
            disabled={loading}
            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{loadingStage}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Inspect Resume with QA Engine</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Main Compatibility Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Compatibility Score Widget */}
            <div className="bg-white rounded-2xl border border-neutral-150 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xs">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-900" />
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
                ATS Compatibility Score
              </h3>
              
              <div className="relative flex items-center justify-center w-36 h-36">
                {/* SVG Circular Progress */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="stroke-neutral-100 fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="stroke-neutral-900 fill-none transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * result.compatibilityScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold font-display tracking-tight text-neutral-900">
                    {result.compatibilityScore}%
                  </span>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">
                    Match
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs font-semibold text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                Industry Focus: <span className="text-neutral-900 font-bold">{selectedIndustry}</span>
              </div>
            </div>

            {/* Keyword Match List */}
            <div className="bg-white rounded-2xl border border-neutral-150 p-6 md:col-span-2 flex flex-col shadow-xs">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100">
                ATS Keyword Evaluation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="w-4 h-4" /> Aligned Keywords ({result.keywordAnalysis.foundKeywords.length})
                  </h4>
                  {result.keywordAnalysis.foundKeywords.length === 0 ? (
                    <p className="text-xs text-neutral-400">No matching keyword markers identified.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordAnalysis.foundKeywords.map((word, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2 py-1 rounded-lg border border-emerald-100/50"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-2.5">
                    <AlertCircle className="w-4 h-4" /> Missing Key Terms ({result.keywordAnalysis.missingKeywords.length})
                  </h4>
                  {result.keywordAnalysis.missingKeywords.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-medium">Perfect keyword alignment achieved!</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordAnalysis.missingKeywords.map((word, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-50 text-amber-800 text-[11px] font-semibold px-2 py-1 rounded-lg border border-amber-100/50"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QA Metrics Audit Reports */}
          <div className="bg-white rounded-2xl border border-neutral-150 p-6 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <span className="bg-neutral-900 text-white text-[10px] py-0.5 px-1.5 rounded-sm font-mono font-bold">QA INSPECTION</span>
              Quantifiable Metrics Audit
            </h3>
            
            <div className="space-y-4">
              {result.qaMetricsAudit.map((report, idx) => (
                <div key={idx} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/60 hover:border-neutral-300 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-500/10 text-amber-700 p-1.5 rounded-lg border border-amber-500/20 mt-0.5 font-bold text-xs shrink-0">
                      QA-0{idx + 1}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-neutral-900 leading-tight">
                        {report.finding}
                      </p>
                      <p className="text-xs text-neutral-500">
                        <strong className="text-neutral-700 font-semibold">Why it matters for {selectedIndustry}:</strong> {report.whyItMatters}
                      </p>
                      <div className="bg-white px-3 py-2 rounded-lg border border-neutral-150 text-xs text-neutral-800 flex items-center gap-2 font-medium mt-1">
                        <span className="text-sky-600 font-bold shrink-0">Suggestion:</span>
                        <span>{report.suggestion}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phrasing Suggestions */}
          <div className="bg-white rounded-2xl border border-neutral-150 p-6 shadow-xs relative">
            <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Line-by-Line Phrasing Upgrades
              </h3>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Phrasing"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 text-xs text-white bg-neutral-900 hover:bg-neutral-850 px-3.5 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>

            {/* Unauthenticated lock screen/blur container */}
            {!currentUser && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-2xl z-10">
                <div className="bg-neutral-900 text-white p-3 rounded-2xl shadow-lg mb-4 border border-neutral-800">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-neutral-900 font-display">Sign up to unlock Detailed Phrasing Recommendations</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  We found <span className="font-bold text-sky-600">{result.phrasingImprovements.length} line-by-line optimization paths</span>. Enter your email to view them and download your report.
                </p>
                <button
                  onClick={() => onTriggerAuth("Register to view line-by-line phrasing enhancements and copy results immediately!")}
                  className="mt-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Reveal Detailed QA Breakdown
                </button>
              </div>
            )}

            {/* Phrasing Suggestions Content */}
            <div className="space-y-4">
              {result.phrasingImprovements.map((phrasing, idx) => (
                <div key={idx} className="border border-neutral-150 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 bg-neutral-50/50 border-b border-neutral-150">
                    <div className="p-4 border-r border-neutral-150">
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1">
                        Weak Statement
                      </span>
                      <p className="text-xs text-neutral-600 line-through leading-relaxed">
                        "{phrasing.originalText}"
                      </p>
                    </div>
                    <div className="p-4 bg-sky-50/20">
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-500 shrink-0 fill-sky-500/20" /> Optimized QA-Standard
                      </span>
                      <p className="text-xs text-sky-950 font-bold leading-relaxed">
                        "{phrasing.improvedText}"
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-50 text-[11px] text-neutral-500 flex items-start gap-1.5 leading-relaxed">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Evaluation Strategy:</strong> {phrasing.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
