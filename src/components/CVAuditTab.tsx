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
      
      {/* Input Section - Refined with premium design classes */}
      <div className="premium-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-neutral-150">
          <div>
            <h2 className="text-lg font-extrabold font-display flex items-center gap-2.5 text-neutral-900">
              <FileText className="w-5 h-5 text-blue-600" /> The CV Architect
            </h2>
            <p className="text-xs text-neutral-500 mt-1.5">
              Universal ATS & Metric density auditor. Optimize resume layout alignment to match target roles with strict industry validation.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadSampleData}
              className="text-xs text-blue-600 hover:text-white font-bold border border-blue-200 bg-blue-50/50 hover:bg-blue-600 px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              Load Sample CV
            </button>
            <span className="text-xs bg-neutral-100 border border-neutral-200 text-neutral-700 px-3 py-2 rounded-lg font-mono font-bold">
              Daily audits left: {currentUser?.isPremium ? "Unlimited" : auditsRemaining}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-650 text-xs px-4 py-3 rounded-xl border border-red-200/80 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">
              1. Paste Your Current CV / Resume Text
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your resume details here (experience, skills, contact detail formats...)"
              rows={10}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs focus:bg-white focus:outline-hidden focus:border-neutral-900 transition-all font-mono leading-relaxed text-neutral-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 font-mono">
              2. Paste Target Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job post or role description here to execute ATS alignment audit..."
              rows={10}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs focus:bg-white focus:outline-hidden focus:border-neutral-900 transition-all font-mono leading-relaxed text-neutral-800"
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-neutral-150 flex justify-end">
          <button
            onClick={handleInspect}
            disabled={loading}
            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-850 disabled:bg-neutral-200 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
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
            <div className="premium-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-900" />
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-4 font-mono">
                ATS Compatibility Score
              </h3>
              
              <div className="relative flex items-center justify-center w-36 h-36">
                {/* SVG Circular Progress */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="stroke-neutral-150 fill-none"
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
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5 font-mono">
                    Match Score
                  </span>
                </div>
              </div>

              <div className="mt-5 text-xs font-bold text-neutral-600 bg-neutral-100 px-3.5 py-1.5 rounded-lg border border-neutral-200">
                Industry Focus: <span className="text-neutral-900 font-extrabold">{selectedIndustry}</span>
              </div>
            </div>

            {/* Keyword Match List */}
            <div className="premium-card p-6 md:col-span-2 flex flex-col">
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-150 font-mono">
                ATS Keyword Evaluation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Aligned Keywords ({result.keywordAnalysis.foundKeywords.length})
                  </h4>
                  {result.keywordAnalysis.foundKeywords.length === 0 ? (
                    <p className="text-xs text-neutral-400">No matching keyword markers identified.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordAnalysis.foundKeywords.map((word, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-50 text-emerald-800 text-[10.5px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Missing Key Terms ({result.keywordAnalysis.missingKeywords.length})
                  </h4>
                  {result.keywordAnalysis.missingKeywords.length === 0 ? (
                    <p className="text-xs text-emerald-700 font-bold">Perfect keyword alignment achieved!</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordAnalysis.missingKeywords.map((word, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-50 text-amber-800 text-[10.5px] font-bold px-2.5 py-1 rounded-lg border border-amber-200"
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
          <div className="premium-card p-6">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-150 flex items-center gap-2 font-mono">
              <span className="bg-neutral-900 text-white text-[9px] py-0.5 px-2 rounded-sm font-mono font-bold">QA INSPECTION</span>
              Quantifiable Metrics Audit
            </h3>
            
            <div className="space-y-4">
              {result.qaMetricsAudit.map((report, idx) => (
                <div key={idx} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 hover:border-neutral-300 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-850 p-1.5 rounded-lg border border-amber-200 mt-0.5 font-bold text-xs shrink-0 font-mono">
                      QA-0{idx + 1}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-extrabold text-neutral-950 leading-tight">
                        {report.finding}
                      </p>
                      <p className="text-xs text-neutral-500">
                        <strong className="text-neutral-700 font-bold">Why it matters for {selectedIndustry}:</strong> {report.whyItMatters}
                      </p>
                      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-neutral-150 text-xs text-neutral-800 flex items-center gap-2 font-medium mt-1 shadow-2xs">
                        <span className="text-blue-600 font-extrabold shrink-0 uppercase tracking-wide text-[10px] font-mono">Suggestion:</span>
                        <span>{report.suggestion}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phrasing Suggestions */}
          <div className="premium-card p-6 relative">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-neutral-150">
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                Line-by-Line Phrasing Upgrades
              </h3>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer border border-neutral-200 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Phrasing"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 text-xs text-white bg-neutral-900 hover:bg-neutral-850 px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shadow-sm"
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
                <h4 className="text-sm font-extrabold text-neutral-900 font-display">Sign up to unlock Detailed Phrasing Recommendations</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  We found <span className="font-bold text-blue-600">{result.phrasingImprovements.length} line-by-line optimization paths</span>. Enter your email to view them and download your report.
                </p>
                <button
                  onClick={() => onTriggerAuth("Register to view line-by-line phrasing enhancements and copy results immediately!")}
                  className="mt-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer font-mono tracking-wider uppercase"
                >
                  Reveal Detailed QA Breakdown
                </button>
              </div>
            )}

            {/* Phrasing Suggestions Content */}
            <div className="space-y-4">
              {result.phrasingImprovements.map((phrasing, idx) => (
                <div key={idx} className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 bg-neutral-50/50 border-b border-neutral-200">
                    <div className="p-4 border-r border-neutral-200">
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1 font-mono">
                        Weak Statement
                      </span>
                      <p className="text-xs text-neutral-500 line-through leading-relaxed font-mono">
                        "{phrasing.originalText}"
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50/10">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1 flex items-center gap-1 font-mono">
                        <Sparkles className="w-3 h-3 text-blue-500 shrink-0 fill-blue-500/20" /> Optimized QA-Standard
                      </span>
                      <p className="text-xs text-neutral-800 font-bold leading-relaxed font-mono">
                        "{phrasing.improvedText}"
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-50 text-[10.5px] text-neutral-550 flex items-start gap-1.5 leading-relaxed">
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
