import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required. Configure it in Netlify environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

async function parseJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function cvAudit(req: Request) {
  const body = await parseJson(req);
  const { cvText, jobDescription, industry } = body ?? {};

  if (!cvText || !jobDescription || !industry) {
    return json({ error: "Missing required fields: cvText, jobDescription, and industry" }, { status: 400 });
  }

  const response = await getGeminiClient().models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Here is the user's CV:\n"""\n${cvText}\n"""\n\nHere is the target job description:\n"""\n${jobDescription}\n"""\n\nProvide your detailed quality assurance breakdown in JSON format matching the requested schema. Ensure the phrasing suggestions directly target areas of their CV.`,
    config: {
      systemInstruction: `You are a Senior Technical QA Inspector and Executive Recruiter for the ${industry} industry.
Your job is to perform a meticulous audit on the user's Curriculum Vitae (CV) against their target job description.
Focus on keyword match analysis, missing quantifiable industry metrics, line-by-line phrasing improvements, and an objective Match Score from 0-100.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          compatibilityScore: { type: Type.INTEGER },
          keywordAnalysis: {
            type: Type.OBJECT,
            properties: {
              foundKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["foundKeywords", "missingKeywords"],
          },
          qaMetricsAudit: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                finding: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                suggestion: { type: Type.STRING },
              },
              required: ["finding", "whyItMatters", "suggestion"],
            },
          },
          phrasingImprovements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalText: { type: Type.STRING },
                improvedText: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["originalText", "improvedText", "reason"],
            },
          },
        },
        required: ["compatibilityScore", "keywordAnalysis", "qaMetricsAudit", "phrasingImprovements"],
      },
      temperature: 0.2,
    },
  });

  return json(JSON.parse(response.text || "{}"));
}

async function pitchGenerate(req: Request) {
  const body = await parseJson(req);
  const { cvText, industry, pitchType } = body ?? {};

  if (!cvText || !industry || !pitchType) {
    return json({ error: "Missing required fields: cvText, industry, and pitchType" }, { status: 400 });
  }

  const response = await getGeminiClient().models.generateContent({
    model: "gemini-3.5-flash",
    contents: `The selected Pitch Type is: ${pitchType}.\nThe target industry is: ${industry}.\n\nHere is the candidate's CV:\n"""\n${cvText}\n"""\n\nGenerate the pitch details in JSON format matching the schema requested. Include actionable advice under 'qaOptimizationNotes'.`,
    config: {
      systemInstruction: `You are a Professional Career Coach and Executive Copywriter. Draft polished, tailored job application materials based on the candidate's CV and selected industry: ${industry}.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subjectOrHeadline: { type: Type.STRING },
          pitchContent: { type: Type.STRING },
          qaOptimizationNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["subjectOrHeadline", "pitchContent", "qaOptimizationNotes"],
      },
      temperature: 0.7,
    },
  });

  return json(JSON.parse(response.text || "{}"));
}

async function interviewCoach(req: Request) {
  const body = await parseJson(req);
  const { industry, history, lastUserMessage } = body ?? {};

  if (!industry || !history) {
    return json({ error: "Missing required fields: industry and history" }, { status: 400 });
  }

  const response = await getGeminiClient().models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Target Industry: ${industry}\nRecent Dialogue History:\n${JSON.stringify(history)}\n\nUser's Latest Response to Evaluate (if any):\n"${lastUserMessage || ""}"\n\nGenerate the JSON response containing the next interview question and the complete evaluation scorecard of their latest answer.`,
    config: {
      systemInstruction: `You are a tough but constructive QA Interview Coach and Hiring Manager in the ${industry} sector. Conduct a text-based behavioral and situational mock interview, grade responses with a scorecard, and present the next question.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nextQuestion: { type: Type.STRING },
          evaluation: {
            type: Type.OBJECT,
            properties: {
              hasResponseToEvaluate: { type: Type.BOOLEAN },
              overallScore: { type: Type.INTEGER },
              toneScore: { type: Type.INTEGER },
              starScore: { type: Type.INTEGER },
              competenciesScore: { type: Type.INTEGER },
              feedback: { type: Type.STRING },
              starMethodBreakdown: {
                type: Type.OBJECT,
                properties: {
                  situation: { type: Type.STRING },
                  task: { type: Type.STRING },
                  action: { type: Type.STRING },
                  result: { type: Type.STRING },
                },
                required: ["situation", "task", "action", "result"],
              },
            },
            required: ["hasResponseToEvaluate"],
          },
        },
        required: ["nextQuestion", "evaluation"],
      },
      temperature: 0.5,
    },
  });

  return json(JSON.parse(response.text || "{}"));
}

async function customQuestions(req: Request) {
  const body = await parseJson(req);
  const { industry, jobTitle, companyType } = body ?? {};

  if (!industry || !jobTitle) {
    return json({ error: "Missing required fields: industry and jobTitle" }, { status: 400 });
  }

  const response = await getGeminiClient().models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Target Industry context: ${industry}\nTarget Job Title: ${jobTitle}\nCompany Type/Context: ${companyType || "standard/general industry company"}\n\nGenerate exactly 5 distinct behavioral and situational questions. Return JSON conforming exactly to the requested schema.`,
    config: {
      systemInstruction: `You are a tough, meticulous QA Recruiter and Executive Career Coach generating tailored interview questions for ${jobTitle} in ${industry}.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roleProfile: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                type: { type: Type.STRING },
                industryFocus: { type: Type.STRING },
                starHint: { type: Type.STRING },
              },
              required: ["id", "question", "type", "industryFocus", "starHint"],
            },
          },
        },
        required: ["roleProfile", "questions"],
      },
      temperature: 0.7,
    },
  });

  return json(JSON.parse(response.text || "{}"));
}

export default async (req: Request) => {
  try {
    const { pathname } = new URL(req.url);

    if (pathname === "/api/health") {
      return json({ status: "ok", time: new Date().toISOString() });
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    if (pathname === "/api/gemini/cv-audit") return cvAudit(req);
    if (pathname === "/api/gemini/pitch-generate") return pitchGenerate(req);
    if (pathname === "/api/gemini/interview-coach") return interviewCoach(req);
    if (pathname === "/api/gemini/custom-questions") return customQuestions(req);

    return json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Gemini function error:", message);
    return json({ error: message }, { status: 500 });
  }
};

export const config = {
  path: ["/api/health", "/api/gemini/cv-audit", "/api/gemini/pitch-generate", "/api/gemini/interview-coach", "/api/gemini/custom-questions"],
};
