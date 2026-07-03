import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, ListTodo, Trophy, Sparkles, RefreshCw } from "lucide-react";
import { TargetField, DailyGoal } from "../types";

interface DailyPlannerProps {
  selectedIndustry: TargetField;
}

export default function DailyPlanner({ selectedIndustry }: DailyPlannerProps) {
  const [goals, setGoals] = useState<DailyGoal[]>([]);

  // Generate 3 unique industry-specific QA strategic career goals
  const generateGoals = () => {
    let industryGoals: string[] = [];

    switch (selectedIndustry) {
      case "Tech/IT":
        industryGoals = [
          "Audit a past project on your CV: add 2 concrete metrics (e.g., codebase speed improvements, page load reductions, or user base sizes).",
          "Draft 1 LinkedIn cold message targeted to an Engineering Manager hiring for a stack similar to yours.",
          "Practice 1 behavioral question using STAR method on situation: 'Tell me about a technical debt you resolved.'",
        ];
        break;
      case "Customer Service/Call Center":
        industryGoals = [
          "Optimize your resume profile to explicitly highlight Average Handle Time (AHT) and Customer Satisfaction (CSAT) ratings.",
          "Draft a Recruiter follow-up template for a customer success role focusing on metrics of retention.",
          "Answer 1 mock question on 'How do you de-escalate a highly dissatisfied customer?' with quantifiable resolutions.",
        ];
        break;
      case "Sales & Marketing":
        industryGoals = [
          "Audit your CV to ensure every bullet points to a quota (e.g. '% over target', '$ revenue size', or 'outbound pipeline generated').",
          "Draft an outreach email to a Sales Director demonstrating pipeline alignment and previous growth percentages.",
          "Practice the STAR interview model on 'Describe your most complex close' focusing on the action and revenue result.",
        ];
        break;
      case "Healthcare":
        industryGoals = [
          "Align your CV keyword indicators with clinical standards, patient compliance, or administrative speed guidelines.",
          "Write a professional follow-up message to a Healthcare staffing recruiter focusing on caseload metrics and certificates.",
          "Practice situational responses for: 'Describe an emergency protocol you successfully led under high-stress conditions.'",
        ];
        break;
      case "Finance":
        industryGoals = [
          "Refine resume experience statements to detail portfolio sizes, audit speeds, or cost reduction values managed.",
          "Generate a follow-up template emphasizing accuracy rates, financial forecasting models, and project timelines.",
          "Practice interview response on: 'How do you handle variance anomalies in financial spreadsheets?'",
        ];
        break;
      case "Administrative":
        industryGoals = [
          "Update CV skills keywords with specific tools (e.g., SharePoint, advanced Excel, calendar automation, or CRM platforms).",
          "Draft a networking note to an Office Manager highlighting support efficiency gains or coordination metrics.",
          "Rehearse mock responses on multi-tasking priorities and organizational pipeline management.",
        ];
        break;
      case "Hospitality":
        industryGoals = [
          "Optimize your profile text to explicitly cite customer ratings, repeat visitor percentages, or event capacity managed.",
          "Compose a follow-up note highlighting guest satisfaction index scores and fast-paced team coordination.",
          "Rehearse Star responses on: 'Tell me about a time you handled a double-booking crisis successfully.'",
        ];
        break;
      default:
        industryGoals = [
          "Audit your CV experience section: replace 3 general verbs with active verbs and quantify results with metric variables.",
          "Draft a structured cover pitch aligning your core competencies to a specific target role.",
          "Practice 1 situational mock response focusing on how you delivered measurable impact under a tight schedule.",
        ];
    }

    const newGoals: DailyGoal[] = [
      { id: "1", goal: industryGoals[0], completed: false, category: "CV Audit" },
      { id: "2", goal: industryGoals[1], completed: false, category: "Networking" },
      { id: "3", goal: industryGoals[2], completed: false, category: "Interview Prep" },
    ];

    setGoals(newGoals);
  };

  useEffect(() => {
    generateGoals();
  }, [selectedIndustry]);

  const toggleGoal = (id: string) => {
    setGoals(
      goals.map((g) => {
        if (g.id === id) {
          return { ...g, completed: !g.completed };
        }
        return g;
      })
    );
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  return (
    <div className="bg-white rounded-2xl border border-neutral-150 p-6 shadow-xs flex flex-col h-full" id="daily-planner-utility">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-neutral-100">
        <h3 className="text-sm font-bold text-neutral-900 font-display flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-neutral-850" /> Daily Action Planner
        </h3>
        <button
          onClick={generateGoals}
          className="text-[10px] text-neutral-500 hover:text-neutral-950 font-bold flex items-center gap-1 border border-neutral-200 px-2 py-1 rounded-md hover:bg-neutral-50 transition-colors"
          title="Refresh goals"
        >
          <RefreshCw className="w-3 h-3" /> Reset Goals
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-neutral-50 border border-neutral-150 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Strategic Progress</span>
          <span className="text-xs font-bold text-neutral-800 font-mono">{completedCount}/3 Done</span>
        </div>
        <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-neutral-900 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Strategic Goals List */}
      <div className="space-y-3 flex-1">
        {goals.map((g) => (
          <button
            key={g.id}
            onClick={() => toggleGoal(g.id)}
            className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
              g.completed
                ? "bg-emerald-50/20 border-emerald-100 text-neutral-500"
                : "bg-white hover:bg-neutral-50 border-neutral-150 text-neutral-850 shadow-2xs"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {g.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-500/10" />
              ) : (
                <Circle className="w-4 h-4 text-neutral-300" />
              )}
            </div>
            <div className="space-y-1">
              <span className={`text-[9px] font-extrabold uppercase tracking-wider font-mono ${
                g.completed ? "text-emerald-700 bg-emerald-50" : "text-neutral-500 bg-neutral-100"
              } px-1.5 py-0.5 rounded-xs inline-block`}>
                {g.category}
              </span>
              <p className={`text-xs leading-relaxed font-sans ${g.completed ? "line-through text-neutral-400" : "font-medium text-neutral-850"}`}>
                {g.goal}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Reward Notification Cards */}
      {completedCount === 3 && (
        <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3.5 flex items-start gap-2.5 mt-5 animate-in zoom-in duration-200 text-emerald-950">
          <Trophy className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold font-display flex items-center gap-1 text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/10" /> QA Standards Cleared!
            </h4>
            <p className="text-[10px] text-neutral-600 mt-0.5 leading-relaxed font-medium">
              You completed all daily strategic career actions. Your profile metrics are strengthening! Come back tomorrow for updated industry actions.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
