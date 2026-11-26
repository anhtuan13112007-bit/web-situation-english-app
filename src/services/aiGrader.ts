import { AiProvider, AiSettings, GradingResult, PracticeFrame } from '../types';

export const GEMINI_MODEL_PRESETS = [
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

export const GROQ_MODEL_PRESETS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

export const DEFAULT_AI_SETTINGS: AiSettings = {
  mode: 'byok',
  provider: 'gemini',
  geminiApiKey: '',
  geminiModel: 'gemini-3.5-flash-lite',
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile',
};

const REQUEST_TIMEOUT_MS = 20000;

export const GRADER_SYSTEM_PROMPT = `You are a strict yet supportive Education English Professor grading a student's Classroom Management Situation response using the Action - Saying - Goal framework.

Pedagogical grading rules:
1. Problem count rule:
   - If the situation has 1 problem (+ optional psychological cause), it MUST be solved in 1 single unified Action - Saying - Goal frame (do not penalize keeping it unified; penalize splitting 1 problem unnecessarily).
   - If the situation has 2 separate problems, BOTH problems should be addressed cleanly in 2 separate Action - Saying - Goal frames.
2. Action (What would you do?): Must give clear, concrete teacher actions specifying timing (e.g., after class, at the start of the next class), target (one-on-one vs whole class), and practical steps.
3. Saying (What would you say?): Must use direct speech in quotation marks ("...") with I / you / we pronouns, open-ended questions, and a calm, respectful, non-judgmental, solution-focused tone.
4. Goal (Why would you do it?): Must clearly explain the pedagogical purpose (understanding underlying causes, building trust, maintaining a respectful/focused classroom environment, encouraging responsibility).
5. Language & Grammar: Check Imperatives, hypothetical modals (would/could), Present Perfect observations (I've noticed...), open-ended questions & "find it + adj + to V", purpose connectors (by + V-ing, so that, help to), direct speech punctuation, and gender-neutral pronouns (his/her, they/them).

You MUST return ONLY a valid JSON object matching this exact JSON schema (no extra prose outside JSON):
{
  "overallScore": 8.5,
  "scores": {
    "action": 9,
    "saying": 8,
    "goal": 8.5,
    "language": 8.5
  },
  "strengths": ["Short point in Vietnamese or English"],
  "improvements": ["Actionable suggestion in Vietnamese"],
  "grammarFixes": [
    {
      "original": "Exact phrase from user response",
      "corrected": "Corrected phrase",
      "reasonVi": "Giai thich ngan gon bang tieng Viet"
    }
  ],
  "improvedSample": {
    "action": "Polished Action paragraph in English",
    "saying": "\"Polished direct speech in English\"",
    "goal": "Polished Goal paragraph in English"
  },
  "summaryVi": "Nhan xet tong quan ngan gon, khich le bang tieng Viet."
}

Scoring scale: 0 to 10 (can use 0.5 increments). Give empty arrays [] if there are no grammarFixes. Always output valid JSON.`;

function clampScore(value: unknown, fallback = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(10, Math.round(num * 10) / 10));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? '').trim()).filter(Boolean);
}

/**
 * Strips accidental markdown fences and parses the first JSON object safely.
 */
export function safeParseGradingJson(rawText: string): GradingResult {
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error('Phản hồi từ AI không chứa định dạng JSON hợp lệ. Vui lòng thử chấm lại.');
  }

  const jsonSlice = cleaned.slice(startIdx, endIdx + 1);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonSlice) as Record<string, unknown>;
  } catch {
    throw new Error('Không thể phân tích kết quả JSON từ AI. Vui lòng nhấn "Thử lại".');
  }

  const scoresRaw = (parsed.scores ?? {}) as Record<string, unknown>;
  const improvedRaw = (parsed.improvedSample ?? {}) as Record<string, unknown>;
  const fixesRaw = Array.isArray(parsed.grammarFixes) ? parsed.grammarFixes : [];

  const actionScore = clampScore(scoresRaw.action);
  const sayingScore = clampScore(scoresRaw.saying);
  const goalScore = clampScore(scoresRaw.goal);
  const languageScore = clampScore(scoresRaw.language);
  const computedAvg =
    Math.round(((actionScore + sayingScore + goalScore + languageScore) / 4) * 10) / 10;

  return {
    overallScore:
      parsed.overallScore !== undefined ? clampScore(parsed.overallScore, computedAvg) : computedAvg,
    scores: {
      action: actionScore,
      saying: sayingScore,
      goal: goalScore,
      language: languageScore,
    },
    strengths: asStringArray(parsed.strengths),
    improvements: asStringArray(parsed.improvements),
    grammarFixes: fixesRaw
      .map((item) => {
        const entry = (item ?? {}) as Record<string, unknown>;
        return {
          original: String(entry.original ?? '').trim(),
          corrected: String(entry.corrected ?? '').trim(),
          reasonVi: String(entry.reasonVi ?? '').trim(),
        };
      })
      .filter((fix) => fix.original && fix.corrected),
    improvedSample: {
      action: String(improvedRaw.action ?? '').trim(),
      saying: String(improvedRaw.saying ?? '').trim(),
      goal: String(improvedRaw.goal ?? '').trim(),
    },
    summaryVi: String(parsed.summaryVi ?? 'Đã hoàn tất chấm bài theo chuẩn Action – Saying – Goal.').trim(),
  };
}

export function mapHttpErrorVi(status: number, provider: AiProvider, detail?: string): string {
  const providerLabel = provider === 'gemini' ? 'Google AI Studio (Gemini)' : 'Groq';
  const suffix = detail ? ` (${detail})` : '';

  if (status === 400) {
    return `Yêu cầu hoặc tên Model của ${providerLabel} không hợp lệ (HTTP 400). Hãy kiểm tra lại Model ID trong Cài đặt AI.${suffix}`;
  }
  if (status === 401 || status === 403) {
    return `API Key ${providerLabel} không hợp lệ hoặc chưa đủ quyền truy cập (HTTP ${status}). Vui lòng kiểm tra lại Key trong Cài đặt AI.`;
  }
  if (status === 429) {
    return `${providerLabel} đang chạm giới hạn lượt gọi miễn phí (HTTP 429). Bạn hãy đợi khoảng 30 giây hoặc chuyển sang nhà cung cấp còn lại (Gemini / Groq) trong Cài đặt AI.`;
  }
  if (status >= 500) {
    return `Máy chủ ${providerLabel} đang gặp sự cố tạm thời (HTTP ${status}). Vui lòng thử lại sau ít phút hoặc đổi sang nhà cung cấp dự phòng.`;
  }
  return `Lỗi kết nối ${providerLabel} (HTTP ${status})${suffix}.`;
}

function formatUserPrompt(params: {
  situationPromptEn: string;
  expectedProblemCount: 1 | 2;
  frames: PracticeFrame[];
}): string {
  const formattedFrames = params.frames
    .map(
      (frame, idx) =>
        `Frame ${idx + 1}:
- Action: ${frame.action.trim() || '(trống)'}
- Saying: ${frame.saying.trim() || '(trống)'}
- Goal: ${frame.goal.trim() || '(trống)'}`
    )
    .join('\n\n');

  return `Situation Prompt:
${params.situationPromptEn}

Expected Problem Count: ${params.expectedProblemCount} (${
    params.expectedProblemCount === 1
      ? 'Should be solved in 1 single unified Action-Saying-Goal frame'
      : 'Has 2 distinct problems; should be solved in 2 separate Action-Saying-Goal frames'
  })

Student Response (${params.frames.length} frame(s) submitted):
${formattedFrames}

Evaluate the student response strictly against the Action - Saying - Goal framework and return JSON only.`;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Hết thời gian chờ phản hồi (20 giây). Vui lòng kiểm tra mạng và thử lại.');
    }
    throw new Error(
      'Lỗi kết nối mạng hoặc trình duyệt chặn CORS. Hãy kiểm tra Internet, tắt extension chặn API, hoặc bật chế độ Vercel Proxy (/api/grade).'
    );
  } finally {
    clearTimeout(timer);
  }
}

async function callGeminiDirect(
  apiKey: string,
  model: string,
  userPrompt: string
): Promise<string> {
  const cleanModel = model.trim() || 'gemini-3.5-flash-lite';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    cleanModel
  )}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: GRADER_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const errBody = (await response.json()) as { error?: { message?: string } };
      detail = errBody.error?.message ?? '';
    } catch {
      // ignore parse failure on error body
    }
    throw new Error(mapHttpErrorVi(response.status, 'gemini', detail));
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) {
    throw new Error('Gemini trả về nội dung trống. Vui lòng thử lại.');
  }
  return text;
}

async function callGroqOnce(
  apiKey: string,
  model: string,
  userPrompt: string
): Promise<{ ok: boolean; status: number; text?: string; detail?: string }> {
  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: GRADER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const errBody = (await response.json()) as { error?: { message?: string } };
      detail = errBody.error?.message ?? '';
    } catch {
      // ignore
    }
    return { ok: false, status: response.status, detail };
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? '';
  return { ok: true, status: 200, text };
}

async function callGroqDirect(
  apiKey: string,
  model: string,
  userPrompt: string
): Promise<{ text: string; usedFallbackModel?: string }> {
  const primaryModel = model.trim() || 'llama-3.3-70b-versatile';
  const firstAttempt = await callGroqOnce(apiKey, primaryModel, userPrompt);

  if (firstAttempt.ok && firstAttempt.text) {
    return { text: firstAttempt.text };
  }

  // Automatic 429 fallback to llama-3.1-8b-instant
  if (firstAttempt.status === 429 && primaryModel !== 'llama-3.1-8b-instant') {
    const fallbackModel = 'llama-3.1-8b-instant';
    const secondAttempt = await callGroqOnce(apiKey, fallbackModel, userPrompt);
    if (secondAttempt.ok && secondAttempt.text) {
      return { text: secondAttempt.text, usedFallbackModel: fallbackModel };
    }
    throw new Error(mapHttpErrorVi(secondAttempt.status, 'groq', secondAttempt.detail));
  }

  if (firstAttempt.ok) {
    throw new Error('Groq trả về nội dung trống. Vui lòng thử lại.');
  }

  throw new Error(mapHttpErrorVi(firstAttempt.status, 'groq', firstAttempt.detail));
}

export async function gradeSituationResponse(params: {
  settings: AiSettings;
  situationPromptEn: string;
  expectedProblemCount: 1 | 2;
  frames: PracticeFrame[];
}): Promise<{ result: GradingResult; modelUsed: string }> {
  const { settings, situationPromptEn, expectedProblemCount, frames } = params;
  const userPrompt = formatUserPrompt({ situationPromptEn, expectedProblemCount, frames });

  if (settings.mode === 'proxy') {
    const modelUsed =
      settings.provider === 'gemini' ? settings.geminiModel : settings.groqModel;

    const response = await fetchWithTimeout('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: settings.provider,
        model: modelUsed,
        systemPrompt: GRADER_SYSTEM_PROMPT,
        userPrompt,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      rawText?: string;
      usedFallbackModel?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error || mapHttpErrorVi(response.status, settings.provider));
    }

    const parsed = safeParseGradingJson(data.rawText ?? '');
    if (data.usedFallbackModel) {
      parsed.usedFallbackModel = data.usedFallbackModel;
    }
    return { result: parsed, modelUsed: data.usedFallbackModel || modelUsed };
  }

  if (settings.provider === 'gemini') {
    if (!settings.geminiApiKey.trim()) {
      throw new Error('Bạn chưa nhập Gemini API Key. Hãy mở "Cài đặt AI" để dán key miễn phí.');
    }
    const rawText = await callGeminiDirect(
      settings.geminiApiKey,
      settings.geminiModel,
      userPrompt
    );
    return {
      result: safeParseGradingJson(rawText),
      modelUsed: settings.geminiModel || 'gemini-3.5-flash-lite',
    };
  }

  if (!settings.groqApiKey.trim()) {
    throw new Error('Bạn chưa nhập Groq API Key. Hãy mở "Cài đặt AI" để dán key miễn phí.');
  }

  const { text, usedFallbackModel } = await callGroqDirect(
    settings.groqApiKey,
    settings.groqModel,
    userPrompt
  );
  const parsed = safeParseGradingJson(text);
  if (usedFallbackModel) {
    parsed.usedFallbackModel = usedFallbackModel;
  }
  return {
    result: parsed,
    modelUsed: usedFallbackModel || settings.groqModel || 'llama-3.3-70b-versatile',
  };
}

export async function testAiConnection(settings: AiSettings): Promise<string> {
  const samplePrompt = formatUserPrompt({
    situationPromptEn: 'A student is distracted during class. What should you do?',
    expectedProblemCount: 1,
    frames: [
      {
        action: 'Schedule a short one-on-one chat after class to understand the cause.',
        saying: '"I\'ve noticed you seem distracted today. Is everything okay?"',
        goal: 'Understand the underlying reason and show care for the student.',
      },
    ],
  });

  if (settings.mode === 'proxy') {
    const modelUsed =
      settings.provider === 'gemini' ? settings.geminiModel : settings.groqModel;
    const response = await fetchWithTimeout('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: settings.provider,
        model: modelUsed,
        systemPrompt: GRADER_SYSTEM_PROMPT,
        userPrompt: samplePrompt,
      }),
    });
    if (!response.ok) {
      const errData = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errData.error || mapHttpErrorVi(response.status, settings.provider));
    }
    return `Kết nối thành công qua Proxy (${settings.provider.toUpperCase()} - ${modelUsed})!`;
  }

  if (settings.provider === 'gemini') {
    if (!settings.geminiApiKey.trim()) {
      throw new Error('Vui lòng nhập Gemini API Key trước khi kiểm tra.');
    }
    const raw = await callGeminiDirect(settings.geminiApiKey, settings.geminiModel, samplePrompt);
    safeParseGradingJson(raw);
    return `Kết nối Gemini thành công (${settings.geminiModel})!`;
  }

  if (!settings.groqApiKey.trim()) {
    throw new Error('Vui lòng nhập Groq API Key trước khi kiểm tra.');
  }
  const { text, usedFallbackModel } = await callGroqDirect(
    settings.groqApiKey,
    settings.groqModel,
    samplePrompt
  );
  safeParseGradingJson(text);
  return `Kết nối Groq thành công (${usedFallbackModel || settings.groqModel})!`;
}
