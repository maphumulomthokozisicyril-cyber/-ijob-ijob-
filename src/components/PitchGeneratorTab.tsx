import React, { useState } from "react";
import { MessageSquare, Sparkles, Copy, Check, Download, Lock, RefreshCw, FileText, Send, Mail } from "lucide-react";
import { PitchResult, PitchType, TargetField, User } from "../types";

interface PitchGeneratorTabProps {
  selectedIndustry: TargetField;
  currentUser: User | null;
  onTriggerAuth: (msg: string) => void;
}

export default function PitchGeneratorTab({
  selectedIndustry,
  currentUser,
  onTriggerAuth,
}: PitchGeneratorTabProps) {
  const [cvText, setCvText] = useState("");
  const [pitchType, setPitchType] = useState<PitchType>("Cover Letter");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PitchResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!cvText.trim()) {
      setError("Please paste your resume/CV text to generate tailored application materials.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/gemini/pitch-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          industry: selectedIndustry,
          pitchType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate pitch material");
      }

      const data: PitchResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating your pitch.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentUser) {
      onTriggerAuth("Sign up or Sign in to copy your full generated pitch draft and unblock advanced tracking metrics!");
      return;
    }

    if (!result) return;
    const fullText = `${result.subjectOrHeadline ? `Subject / Headline: ${result.subjectOrHeadline}\n\n` : ""}${result.pitchContent}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentUser) {
      onTriggerAuth("Create your free account to download professional Word/text drafts of your tailored pitch!");
      return;
    }

    if (!result) return;
    const filename = `${pitchType.toLowerCase().replace(/\s+/g, "_")}_draft.txt`;
    const fullText = `i job i job - Professional Pitch Draft
==================================================
Type: ${pitchType}
Industry: ${selectedIndustry}
${result.subjectOrHeadline ? `Subject / Headline: ${result.subjectOrHeadline}\n` : ""}
==================================================

${result.pitchContent}

==================================================
QA OPTIMIZATION CHANNEL NOTES:
${result.qaOptimizationNotes.map((note) => `- ${note}`).join("\n")}
`;

    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSampleCV = () => {
    setCvText(`John Doe
Sales Representative with 3 years of experience.
Responsible for managing customer relationships and selling software products.
Good communication skills and hardworking. Helped the team reach sales goals.
Skills: CRM, Cold calling, Customer success, Product demos, Negotiation.`);
  };

  return (
    <div className="space-y-6" id="pitch-generator-tab">
      
      {/* Configuration Header */}
      <div className="bg-white rounded-2xl border border-neutral-150 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold font-display flex items-center gap-2 text-neutral-900">
              <MessageSquare className="w-5 h-5 text-neutral-800" /> The Pitch Generator
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Draft high-conversion cover letters, cold outreach messages, and follow-up sequences.
            </p>
          </div>
          <button
            onClick={loadSampleCV}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold border border-sky-200 bg-sky-50/50 hover:bg-sky-50 px-3.5 py-1.5 rounded-lg transition-colors self-start md:self-auto"
          >
            Load Sample CV
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                1. Select Pitch Type
              </label>
              <div className="space-y-2">
                {(["Cover Letter", "LinkedIn Cold Outreach Message", "Recruiter Follow-up Email"] as PitchType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPitchType(type)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      pitchType === type
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                        : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    <span>{type}</span>
                    {type === "Cover Letter" && <FileText className="w-4 h-4 shrink-0 opacity-80" />}
                    {type === "LinkedIn Cold Outreach Message" && <Send className="w-4 h-4 shrink-0 opacity-80" />}
                    {type === "Recruiter Follow-up Email" && <Mail className="w-4 h-4 shrink-0 opacity-80" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                2. Paste Your CV / Resume Experience
              </label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste details of your professional history to align parameters..."
                rows={7}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm focus:bg-white focus:outline-hidden focus:border-neutral-950 transition-all font-sans leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating tailored {pitchType.toLowerCase()}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                  <span>Draft Professional Pitch Material</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Pitch Draft Result */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Main Draft Canvas */}
          <div className="bg-white rounded-2xl border border-neutral-150 p-6 lg:col-span-2 shadow-xs relative">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Tailored {pitchType} Draft
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-xs text-white bg-neutral-900 hover:bg-neutral-850 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Unauthenticated Cover Lock */}
            {!currentUser && (
              <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-2xl z-10">
                <div className="bg-neutral-900 text-white p-3 rounded-2xl shadow-lg mb-4 border border-neutral-800">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 font-display">Sign up to copy and download your full draft</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Your customized pitch document has been fully constructed by our QA Copywriter engine! Register your email to release.
                </p>
                <button
                  onClick={() => onTriggerAuth(`Register now to release your tailored ${pitchType} and edit immediately!`)}
                  className="mt-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Unlock Pitch Draft Now
                </button>
              </div>
            )}

            {/* Draft Content */}
            <div className="space-y-4 font-sans text-neutral-850">
              {result.subjectOrHeadline && (
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-150 font-mono text-xs">
                  <span className="text-neutral-400 font-bold uppercase tracking-wider block mb-1 text-[10px]">
                    {pitchType === "LinkedIn Cold Outreach Message" ? "LinkedIn Headline Option" : "Subject Line"}
                  </span>
                  <span className="text-neutral-900 font-semibold">"{result.subjectOrHeadline}"</span>
                </div>
              )}

              <div className="bg-neutral-50/50 p-5 rounded-xl border border-neutral-150 whitespace-pre-line text-xs leading-relaxed text-neutral-800 font-mono overflow-x-auto min-h-[250px]">
                {result.pitchContent}
              </div>
            </div>
          </div>

          {/* QA Optimization Tips */}
          <div className="bg-white rounded-2xl border border-neutral-150 p-6 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100">
              Channel Optimization Tips
            </h3>
            <div className="space-y-4">
              {result.qaOptimizationNotes.map((note, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-[10px] border border-sky-100 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-600 font-medium">
                    {note}
                  </p>
                </div>
              ))}

              <div className="pt-4 border-t border-neutral-100 bg-neutral-50/50 rounded-xl p-3 mt-4 border border-neutral-200/50 text-[10px] text-neutral-500 leading-relaxed">
                <strong>Pitch Standard Met:</strong> These channel rules ensure higher response rates, keeping messages short, impact-oriented, and structured around measurable goals.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
