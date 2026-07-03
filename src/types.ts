export type TargetField =
  | "Customer Service/Call Center"
  | "Tech/IT"
  | "Sales & Marketing"
  | "Healthcare"
  | "Finance"
  | "Administrative"
  | "Hospitality"
  | "Other";

export type PitchType =
  | "Cover Letter"
  | "LinkedIn Cold Outreach Message"
  | "Recruiter Follow-up Email";

export interface User {
  email: string;
  name: string;
  industry: TargetField;
  isPremium: boolean;
  registeredAt: string;
}

export interface CVAuditResult {
  compatibilityScore: number;
  keywordAnalysis: {
    foundKeywords: string[];
    missingKeywords: string[];
  };
  qaMetricsAudit: Array<{
    finding: string;
    whyItMatters: string;
    suggestion: string;
  }>;
  phrasingImprovements: Array<{
    originalText: string;
    improvedText: string;
    reason: string;
  }>;
}

export interface PitchResult {
  subjectOrHeadline: string;
  pitchContent: string;
  qaOptimizationNotes: string[];
}

export interface Scorecard {
  hasResponseToEvaluate: boolean;
  overallScore: number;
  toneScore: number;
  starScore: number;
  competenciesScore: number;
  feedback: string;
  starMethodBreakdown: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  scorecard?: Scorecard;
}

export interface KanbanTask {
  id: string;
  companyName: string;
  roleTitle: string;
  industry: TargetField;
  column: "Applied" | "Interviewing" | "Offered";
  salary?: string;
  notes?: string;
  dateAdded: string;
}

export interface DailyGoal {
  id: string;
  goal: string;
  completed: boolean;
  category: string;
}

export interface CustomQuestion {
  id: string;
  question: string;
  type: "Behavioral" | "Situational";
  industryFocus: string;
  starHint: string;
}

export interface CustomQuestionsResult {
  roleProfile: string;
  questions: CustomQuestion[];
}
