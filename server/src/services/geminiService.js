import { GoogleGenerativeAI } from '@google/generative-ai';

// Active free-tier candidate models in priority order.
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash'];

const getGenAIClient = () => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const isGeminiConfigured = () => {
  return !!(process.env.GEMINI_API_KEY || '').trim();
};

const safeJsonParse = (text) => {
  if (!text) return null;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let start = -1;
  if (firstBrace === -1) start = firstBracket;
  else if (firstBracket === -1) start = firstBrace;
  else start = Math.min(firstBrace, firstBracket);
  if (start > 0) cleaned = cleaned.slice(start);
  try {
    return JSON.parse(cleaned);
  } catch {
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const end = Math.max(lastBrace, lastBracket);
    if (end > 0) {
      try {
        return JSON.parse(cleaned.slice(0, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const generateWithFallback = async (prompt, isJson = true) => {
  const genAI = getGenAIClient();
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const config = isJson
        ? { generationConfig: { responseMimeType: 'application/json' } }
        : {};
      const model = genAI.getGenerativeModel({ model: modelName, ...config });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (isJson) {
        const parsed = safeJsonParse(text);
        if (parsed === null) throw new Error('Failed to parse AI JSON response');
        return parsed;
      }
      return text;
    } catch (err) {
      lastError = err;
      console.warn(`[GeminiService] Model '${modelName}' failed:`, err.message);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
};

export const generateFlashcards = async (content, subject = 'General', count = 10) => {
  const prompt = `You are an expert educator. Generate ${count} flashcards from the following study material.
Each flashcard must have a question, a concise answer, a difficulty (easy/medium/hard), and the subject.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "flashcards": [
    {
      "question": "Clear question here",
      "answer": "Concise answer here",
      "difficulty": "medium",
      "subject": "${subject}"
    }
  ]
}

Study material:
${(content || 'General study material').slice(0, 5000)}`;

  const parsed = await generateWithFallback(prompt, true);
  if (parsed && Array.isArray(parsed.flashcards)) {
    return parsed.flashcards;
  }
  throw new Error('Failed to parse flashcards from AI response');
};

export const generateQuiz = async (content, subject = 'General', count = 5) => {
  const prompt = `You are an expert quiz creator. Generate ${count} quiz questions from the following study material.
Mix question types: mcq (with 4 options), truefalse (with 2 options: "True" and "False"), and short (no options).
For each question, provide the correct answer and a brief explanation.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "question": "Question text",
      "type": "mcq",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "explanation": "Why B is correct",
      "difficulty": "medium"
    }
  ]
}

Study material:
${(content || 'General study material').slice(0, 5000)}`;

  const parsed = await generateWithFallback(prompt, true);
  if (parsed && Array.isArray(parsed.questions)) {
    return parsed.questions;
  }
  throw new Error('Failed to parse quiz from AI response');
};

export const generateStudyPlan = async ({ subjects = [], availableHours = 2, examDate = '', weakTopics = [] } = {}) => {
  const subjectsStr = Array.isArray(subjects) ? subjects.join(', ') : 'General';
  const weakStr = Array.isArray(weakTopics) && weakTopics.length ? weakTopics.join(', ') : 'None specified';
  const examInfo = examDate ? `Exam date: ${examDate}` : 'No specific exam date';

  const prompt = `You are an expert study planner. Create a comprehensive study plan.
Subjects: ${subjectsStr}
Available hours per day: ${availableHours}
${examInfo}
Weak topics to focus on: ${weakStr}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "dailyPlan": [
    {
      "day": "Monday",
      "date": "2026-01-01",
      "topics": ["Topic 1", "Topic 2"],
      "hours": 4,
      "activities": ["Read chapter 1", "Practice problems"],
      "isRevision": false
    }
  ],
  "weeklyPlan": [
    {
      "day": "Week 1",
      "topics": ["Focus area 1"],
      "hours": 28,
      "activities": ["Complete syllabus review"]
    }
  ],
  "revisionSchedule": [
    {
      "day": "Day 1",
      "topics": ["Revise topic"],
      "hours": 2,
      "activities": ["Review notes", "Take practice quiz"]
    }
  ]
}`;

  const parsed = await generateWithFallback(prompt, true);
  if (parsed) {
    return {
      dailyPlan: parsed.dailyPlan || [],
      weeklyPlan: parsed.weeklyPlan || [],
      revisionSchedule: parsed.revisionSchedule || [],
    };
  }
  throw new Error('Failed to parse study plan from AI response');
};

export const generateRecommendations = async (context = {}) => {
  const prompt = `You are an AI learning advisor. Based on the student's data, provide personalized recommendations.

Student data:
- Study hours total: ${context.studyHours || 0}
- Learning streak: ${context.streak || 0} days
- Documents uploaded: ${context.documentsCount || 0}
- Flashcards: ${context.flashcardsCount || 0}
- Quizzes taken: ${context.quizzesCount || 0}
- Average quiz score: ${context.avgScore || 0}%
- Subjects: ${(context.subjects || []).join(', ') || 'None'}
- Recent quiz performance: ${JSON.stringify(context.recentScores || [])}

Provide recommendations in this exact JSON format (no markdown, no extra text):
{
  "topicsToRevise": ["Topic 1", "Topic 2"],
  "weakSubjects": ["Subject that needs work"],
  "practiceQuestions": ["Suggested practice area 1"],
  "dailyGoals": ["Goal for today 1", "Goal for today 2"],
  "learningStrategy": "Overall strategy advice paragraph",
  "insights": ["Insight 1", "Insight 2"]
}`;

  const parsed = await generateWithFallback(prompt, true);
  if (parsed) {
    return {
      topicsToRevise: parsed.topicsToRevise || [],
      weakSubjects: parsed.weakSubjects || [],
      practiceQuestions: parsed.practiceQuestions || [],
      dailyGoals: parsed.dailyGoals || [],
      learningStrategy: parsed.learningStrategy || '',
      insights: parsed.insights || [],
    };
  }
  throw new Error('Failed to parse recommendations from AI response');
};

export const chatWithTutor = async (message, history = []) => {
  const genAI = getGenAIClient();
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({
        history: (history || [])
          .slice(-10)
          .map((h) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content || h.text || h.message || '' }],
          })),
      });
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (err) {
      lastError = err;
      console.warn(`[GeminiService] Chat model '${modelName}' failed:`, err.message);
    }
  }

  throw lastError || new Error('AI Tutor chat failed across all models.');
};
export const summarizeDocument = async (text, length = 'medium') => {
  const prompt = `You are an expert academic summarizer. 
Please provide a structured, high-quality summary of the following document content.

Length preference: ${length} (short = concise bullet points, medium = balanced summary with key takeaways, detailed = comprehensive overview).

Return ONLY valid JSON in this exact format (no markdown formatting outside JSON):
{
  "title": "A concise title for the document summary",
  "overview": "A brief overall summary paragraph",
  "keyPoints": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "actionItems": [
    "Suggested study action item or focus area"
  ]
}

Document content:
${(text || '').slice(0, 20000)}`;

  const parsed = await generateWithFallback(prompt, true);
  if (parsed && parsed.overview) {
    return parsed;
  }
  throw new Error('Failed to generate document summary');
};

export const askAITutor = chatWithTutor;