interface ServerlessRequest {
  method?: string;
  body?: {
    provider?: 'gemini' | 'groq';
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
  };
}

interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  json: (payload: unknown) => void;
}

const REQUEST_TIMEOUT_MS = 20000;

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider = 'gemini', model, systemPrompt, userPrompt } = req.body ?? {};
  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: 'Thiếu nội dung systemPrompt hoặc userPrompt.' });
  }

  try {
    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(401).json({
          error: 'Server chưa cấu hình GEMINI_API_KEY trong Vercel Environment Variables.',
        });
      }

      const targetModel = (model || 'gemini-3.5-flash-lite').trim();
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          targetModel
        )}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        }
      );

      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
        return res.status(response.status).json({
          error: err.error?.message || `Gemini HTTP ${response.status}`,
        });
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return res.status(200).json({ rawText });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(401).json({
        error: 'Server chưa cấu hình GROQ_API_KEY trong Vercel Environment Variables.',
      });
    }

    const callGroq = async (targetModel: string) =>
      fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

    const primaryModel = (model || 'llama-3.3-70b-versatile').trim();
    let response = await callGroq(primaryModel);
    let usedFallbackModel: string | undefined;

    if (response.status === 429 && primaryModel !== 'llama-3.1-8b-instant') {
      usedFallbackModel = 'llama-3.1-8b-instant';
      response = await callGroq(usedFallbackModel);
    }

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
      return res.status(response.status).json({
        error: err.error?.message || `Groq HTTP ${response.status}`,
      });
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const rawText = data.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ rawText, usedFallbackModel });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi proxy không xác định.';
    return res.status(500).json({ error: message });
  }
}
