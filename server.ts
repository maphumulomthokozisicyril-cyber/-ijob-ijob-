import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initializer for Gemini client to prevent startup crash if key is missing
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Configure this in the Secrets panel in AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Tab 1: CV Architect - Universal ATS & Metrics Optimizer
app.post("/api/gemini/cv-audit", async (req, res) => {
  try {
    const { cvText, jobDescription, industry } = req.body;

    if (!cvText || !jobDescription || !industry) {
      return res.status(400).json({ error: "Missing required fields: cvText, jobDescription, and industry" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a Senior Technical QA Inspector and Executive Recruiter for the ${industry} industry. 
Your job is to perform a meticulous audit on the user's Curriculum Vitae (CV) against their target job description.
Focus on:
1. Keyword match analysis (identifying key skills/tools found or missing).
2. QA Metrics Audit: A strict evaluation checking if the CV lacks quantifiable, industry-specific metrics. For example, Sales needs quotas, customer success needs CSAT/resolution metrics, Tech/IT needs project delivery scales/user base/speed, Healthcare needs patient volumes, etc. Identify exactly what is missing and why it is critical for ${industry}.
3. Phrasing Improvements: Provide a list of line-by-line phrasing improvements. Take weak/general statements from their CV and optimize them into high-impact, QA-compliant statements that embed quantifiable placeholders and action verbs.
4. Calculate an overall objective Match Score (0-100) based on alignment.`;

    const prompt = `Here is the user's CV:
"""
${cvText}
"""

Here is the target job description:
"""
${jobDescription}
"""

Provide your detailed quality assurance breakdown in JSON format matching the requested schema. Ensure the phrasing suggestions directly target areas of their CV.`;

    const cvAuditSchema = {
      type: Type.OBJECT,
      properties: {
        compatibilityScore: {
          type: Type.INTEGER,
          description: "Overall compatibility percentage score (0-100) between the CV and the job description.",
        },
        keywordAnalysis: {
          type: Type.OBJECT,
          properties: {
            foundKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "High-value keywords or skills from the job description that are present in the CV.",
            },
            missingKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "High-value keywords or skills from the job description that are missing from the CV.",
            }
          },
          required: ["foundKeywords", "missingKeywords"]
        },
        qaMetricsAudit: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              finding: {
                type: Type.STRING,
                description: "A specific area in the CV lacking quantifiable metrics or details.",
              },
              whyItMatters: {
                type: Type.STRING,
                description: "Industry-specific reason why this metric is crucial for this target field.",
              },
              suggestion: {
                type: Type.STRING,
                description: "Actionable suggestion to add numbers or metrics.",
              }
            },
            required: ["finding", "whyItMatters", "suggestion"]
          },
          description: "QA audit reports highlighting where quantifiable field-specific metrics are missing in the CV.",
        },
        phrasingImprovements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              originalText: {
                type: Type.STRING,
                description: "The draft or weaker sentence from the CV.",
              },
              improvedText: {
                type: Type.STRING,
                description: "The QA-optimized, high-impact phrasing suggestion incorporating strong verbs and placeholder metrics.",
              },
              reason: {
                type: Type.STRING,
                description: "Why this improvement strengthens the resume.",
              }
            },
            required: ["originalText", "improvedText", "reason"]
          },
          description: "Line-by-line phrasing improvements.",
        }
      },
      required: ["compatibilityScore", "keywordAnalysis", "qaMetricsAudit", "phrasingImprovements"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: cvAuditSchema,
        temperature: 0.2,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in /api/gemini/cv-audit:", error);
    res.status(500).json({ error: error.message || "An error occurred during CV QA Audit" });
  }
});

// Tab 2: The Pitch Generator
app.post("/api/gemini/pitch-generate", async (req, res) => {
  try {
    const { cvText, industry, pitchType } = req.body;

    if (!cvText || !industry || !pitchType) {
      return res.status(400).json({ error: "Missing required fields: cvText, industry, and pitchType" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a Professional Career Coach and Executive Copywriter. 
Your goal is to draft exceptional, tailored job application materials based on the candidate's CV and selected industry: ${industry}.
You generate structured pitch content based on the selected Pitch Type:
- Cover Letter: A highly compelling, modern, 3-paragraph letter aligning experience to the sector.
- LinkedIn Cold Outreach Message: A short, high-conversion networking note (maximum 280 characters/3 sentences) to a team lead or connection.
- Recruiter Follow-up Email: A professional, clear, and action-oriented follow-up to send after applying or interviewing.

Focus on a pristine QA layout: polished headers, active verb openings, spacing, and dynamic phrasing tailored to the target industry.`;

    const prompt = `The selected Pitch Type is: ${pitchType}.
The target industry is: ${industry}.

Here is the candidate's CV:
"""
${cvText}
"""

Generate the pitch details in JSON format matching the schema requested. Include actionable advice under 'qaOptimizationNotes'.`;

    const pitchSchema = {
      type: Type.OBJECT,
      properties: {
        subjectOrHeadline: {
          type: Type.STRING,
          description: "An attention-grabbing subject line or LinkedIn headline.",
        },
        pitchContent: {
          type: Type.STRING,
          description: "The complete body text of the generated cover letter, email, or LinkedIn message.",
        },
        qaOptimizationNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Meticulous QA optimization tips for utilizing this copy.",
        }
      },
      required: ["subjectOrHeadline", "pitchContent", "qaOptimizationNotes"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: pitchSchema,
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in /api/gemini/pitch-generate:", error);
    res.status(500).json({ error: error.message || "An error occurred during Pitch Generation" });
  }
});

// Tab 3: The QA Interview Coach
app.post("/api/gemini/interview-coach", async (req, res) => {
  try {
    const { industry, history, lastUserMessage } = req.body;

    if (!industry || !history) {
      return res.status(400).json({ error: "Missing required fields: industry and history" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a tough but constructive QA Interview Coach and Hiring Manager in the ${industry} sector.
Your goal is to conduct an interactive text-based behavioral and situational mock interview.

Rules:
1. If the user is starting or there is no user response to evaluate yet, welcome them to the mock interview for ${industry} and present a tough, standard behavioral/situational question (e.g., using STAR themes like 'Tell me about a time when...').
2. If the user provided a response ('lastUserMessage'), you must meticulously grade that specific response using a 'QA Scorecard' assessing:
   - Overall Score (0-100)
   - Tone (professional, clear, role-appropriate)
   - STAR structure (Situation, Task, Action, Result)
   - Core Competencies for ${industry}
3. Provide a detailed, constructive coaching response telling them what they nailed and where they failed the QA standard.
4. Conclude by presenting the next interview question.`;

    const prompt = `Target Industry: ${industry}
Recent Dialogue History:
${JSON.stringify(history)}

User's Latest Response to Evaluate (if any):
"${lastUserMessage || ""}"

Generate the JSON response containing the next interview question and the complete evaluation scorecard of their latest answer (setting hasResponseToEvaluate to true if they answered the previous question, or false if this is the start of the session).`;

    const interviewCoachSchema = {
      type: Type.OBJECT,
      properties: {
        nextQuestion: {
          type: Type.STRING,
          description: "The next situational or behavioral interview question tailored to the selected industry.",
        },
        evaluation: {
          type: Type.OBJECT,
          properties: {
            hasResponseToEvaluate: {
              type: Type.BOOLEAN,
              description: "True if the user's last message was a response to an interview question and has been evaluated.",
            },
            overallScore: {
              type: Type.INTEGER,
              description: "Meticulous QA Score (0-100) for the user's response.",
            },
            toneScore: {
              type: Type.INTEGER,
              description: "Score (0-100) for professional, confident, and role-appropriate tone.",
            },
            starScore: {
              type: Type.INTEGER,
              description: "Score (0-100) for structural clarity using the STAR (Situation, Task, Action, Result) method.",
            },
            competenciesScore: {
              type: Type.INTEGER,
              description: "Score (0-100) for demonstrating role-specific core competencies.",
            },
            feedback: {
              type: Type.STRING,
              description: "Actionable QA-style coaching points highlighting strengths and clear opportunities for improvement.",
            },
            starMethodBreakdown: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.STRING, description: "Evaluation or guidance on how they set the Situation." },
                task: { type: Type.STRING, description: "Evaluation or guidance on how they defined the Task." },
                action: { type: Type.STRING, description: "Evaluation or guidance on how they detailed their Action." },
                result: { type: Type.STRING, description: "Evaluation or guidance on how they highlighted the Result (metrics/outcomes)." }
              },
              required: ["situation", "task", "action", "result"]
            }
          },
          required: ["hasResponseToEvaluate"]
        }
      },
      required: ["nextQuestion", "evaluation"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: interviewCoachSchema,
        temperature: 0.5,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in /api/gemini/interview-coach:", error);
    res.status(500).json({ error: error.message || "An error occurred during Interview Coaching" });
  }
});

// Custom interview questions generator
app.post("/api/gemini/custom-questions", async (req, res) => {
  try {
    const { industry, jobTitle, companyType } = req.body;

    if (!industry || !jobTitle) {
      return res.status(400).json({ error: "Missing required fields: industry and jobTitle" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a tough, meticulous QA Recruiter and Executive Career Coach.
Your goal is to generate 5 highly specific, tailored situational and behavioral interview questions for a candidate seeking the role of "${jobTitle}" in a "${companyType || 'General'}" company environment, within the broad context of the "${industry}" sector.

For each generated question, you must analyze exactly what recruiters are auditing under the QA standard (e.g. specific metrics, tooling, scalability, conflict resolution, or SLA adherence) and provide a concise STAR structure hint. Ensure the questions are highly relevant, challenging, and realistic.`;

    const prompt = `Target Industry context: ${industry}
Target Job Title: ${jobTitle}
Company Type/Context: ${companyType || "standard/general industry company"}

Generate exactly 5 distinct behavioral and situational questions (a mix of both). Do not make them generic; they must target "${jobTitle}" specifically. Include what recruiters look for in "industryFocus" and how to answer it in "starHint". Return the output as JSON conforming exactly to the requested schema.`;

    const customQuestionsSchema = {
      type: Type.OBJECT,
      properties: {
        roleProfile: {
          type: Type.STRING,
          description: "A professional and encouraging summary of the hiring expectations for this role at this type of company.",
        },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING, description: "The full behavior or situational interview question." },
              type: { type: Type.STRING, description: "Must be 'Behavioral' or 'Situational'." },
              industryFocus: { type: Type.STRING, description: "What recruiters audit (key competencies, performance metrics, or technical checks)." },
              starHint: { type: Type.STRING, description: "Specific advice on what to detail in Situation, Task, Action, and Result." }
            },
            required: ["id", "question", "type", "industryFocus", "starHint"]
          }
        }
      },
      required: ["roleProfile", "questions"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: customQuestionsSchema,
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in /api/gemini/custom-questions:", error);
    res.status(500).json({ error: error.message || "An error occurred during Custom Questions Generation" });
  }
});

// ----------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
