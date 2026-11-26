---
name: web-situation-english
description: Build an interactive English for Education (Classroom Management Situations) practice web app with vocabulary flashcards (Oxford IPA), sentence patterns, grammar drills, Action-Saying-Goal model answers, and error-free free AI grading via Google AI Studio (Gemini) or Groq. Use when the user asks to create, design, or extend a classroom-situation English study website or mentions WEB-situation.
---

# web-situation-english

Build a focused, interactive study web application that helps Education majors master English Classroom Management Situations using the **Action - Saying - Goal** framework, complete with vocabulary, sentence patterns, grammar drills, model answers, and free AI grading.

## When to Use

- The user wants to build or iterate on a web app for practicing English classroom management situations.
- The user wants flashcards with Oxford IPA, sentence-pattern builders, grammar practice, and AI grading for Action-Saying-Goal responses.
- The user invokes `/web-situation-english` or asks to apply the `web-situation-english` skill in Antigravity or another coding agent.

## Pedagogical Content Rules

Follow this exact grading and answer-structuring standard across the Situation Library and AI Grader:

- **1 problem (+ psychological cause):** Solve in **1 single unified frame** (`Action`, `Saying`, `Goal`). Do not split 1 problem into 2 steps.
- **2 separate problems:** Solve **each distinct problem** in its own `Action - Saying - Goal` frame (2 frames total).
- **Action:** Clear, concrete teacher actions (when, where, who, how).
- **Saying:** Exact direct speech in quotation marks with a calm, respectful, non-judgmental tone.
- **Goal:** Pedagogical purpose explaining why the action and words help the student and class.

## Visual Design, Colors & Layout

Use a clean, calm, academic EdTech aesthetic (inspired by Test-English, Busuu, and Knowt) that prioritizes readability for both Vietnamese UI labels and English study content.

### Color Palette

- **Primary (Navy):** `#1B365D` (navigation, headings, primary buttons)
- **Accent (Academic Blue):** `#2E6B9E` (links, active tabs, focus rings)
- **Canvas Background:** `#F5F7FA` (soft cool slate)
- **Surface Cards:** `#FFFFFF` with `1px solid #E2E8F0` border and subtle shadow
- **Body Text:** `#1F2933` (charcoal) and `#475569` (muted secondary text)
- **Semantic Accents:** Success `#15803D` / `#DCFCE7` (Goal & high scores), Warning `#B45309` / `#FEF3C7` (Saying & tips), Info `#1D4ED8` / `#DBEAFE` (Action badges), Error `#B91C1C` / `#FEE2E2` (grammar fixes)

### Typography & Responsive Layout

- **Fonts:** `Plus Jakarta Sans` or `Inter` (full Vietnamese diacritic + IPA glyph support). Load from Google Fonts.
- **Shell Layout:** Fixed left sidebar (`240px`) on desktop collapsing to a bottom tab bar on mobile, plus a top header bar showing study streak, progress %, and an **AI Settings** button (API key & provider switcher).
- **Content Width:** Max-width `1040px` centered container with generous spacing (`24px` card padding, `16px` grid gaps) to avoid visual clutter.

## Core Functional Modules

Implement these 5 tabs inside the app:

1. **Vocabulary Trainer (Tu vung Oxford IPA):**
   - Cards displaying Word, Part of Speech, Oxford IPA (`BrE` and `NAmE`), Vietnamese meaning, and classroom example with Vietnamese translation.
   - Built-in Web Speech API (`window.speechSynthesis`) with `en-GB` and `en-US` audio toggle.
   - Flip-card mode + Leitner spaced-repetition mastery status (`New`, `Learning`, `Mastered`) saved in `localStorage`, plus a quick fill-in-the-blank quiz.

2. **Sentence Patterns (Mau cau theo Form):**
   - Filterable bank grouped by **Action**, **Saying (Direct Speech)**, and **Goal**.
   - Highlighted fill-in slots (e.g., `I've noticed you seem [adj] during class...`) with one-click copy and interactive slot-practice mode.

3. **Grammar Lab (Ngu phap trong tam):**
   - Bite-sized cards covering the 6 essential structures: Imperatives (`Schedule...`, `Let's...`), Hypothetical `would / could`, Present Perfect observations (`I've noticed...`), Open-ended questions + `find it + adj + to V`, Purpose/method connectors (`by + V-ing`, `so that`, `help to`), and Direct Speech punctuation + gender-neutral pronouns (`his/her`, `they/them`).
   - Short 5-question micro-quizzes per grammar point with instant explanations.

4. **Situation Library (Kho tinh huong mau):**
   - Searchable/filterable list of classroom situations tagged by topic (Disruption, Homework, Tardiness, Cheating, Grade Dispute, Disengagement, Group Conflict) and problem count (`1 Problem` vs `2 Problems`).
   - Collapsible model answers rendered in clean color-coded `Action`, `Saying`, `Goal` cards.

5. **AI Practice & Grader (Luyen tap & Cham bai bang AI):**
   - Split-screen workspace: Situation prompt + optional hint drawer (suggested vocabulary/patterns) on the left; structured response editor (`Action`, `Saying`, `Goal` textareas, plus an "Add Problem 2" button) on the right.
   - Submit button triggers AI evaluation and renders a structured scorecard: overall score (`0-10`), sub-scores (`Action Clarity`, `Direct Speech & Tone`, `Goal Alignment`, `Grammar & Vocabulary`), line-by-line error corrections, and an improved sample answer.
   - Save submission history in `localStorage` so the user can review past attempts.

## Build Architecture & Tech Stack

Use **Vite + React + TypeScript + Tailwind CSS** as the default stack (deployable for free on Vercel or GitHub Pages).

```text
web-situation/
├── api/
│   └── grade.ts                 # Optional Vercel Serverless proxy for production keys
├── src/
│   ├── data/
│   │   ├── vocabulary.ts        # Oxford IPA BrE/NAmE vocab bank
│   │   ├── patterns.ts          # Action / Saying / Goal templates
│   │   ├── grammar.ts           # Grammar lessons & micro-quizzes
│   │   └── situations.ts        # Practice situations & model answers
│   ├── services/
│   │   └── aiGrader.ts          # Unified Gemini + Groq client with fallback & JSON parser
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── VocabTrainer.tsx
│   │   ├── PatternBank.tsx
│   │   ├── GrammarLab.tsx
│   │   ├── SituationLibrary.tsx
│   │   ├── PracticeWorkspace.tsx
│   │   └── ApiSettingsModal.tsx
│   └── App.tsx
├── .env.example
└── package.json
```

### Build Steps

1. Scaffold with `npm create vite@latest web-situation -- --template react-ts` and install Tailwind CSS + `lucide-react`.
2. Populate `src/data/` with structured TypeScript datasets (seed with at least 20 Oxford IPA words, 20 sentence patterns, 6 grammar lessons, and 8 classroom situations).
3. Implement `src/services/aiGrader.ts` following the Free AI Integration rules below.
4. Build the 5 UI modules and connect `localStorage` persistence for mastery progress, history, and BYOK API keys.
5. Verify with `npm run build` and test both Gemini and Groq grading calls (including invalid-key and rate-limit error states).

## Free AI Integration (Google AI Studio & Groq) Without Errors

Support **both** Google AI Studio (Gemini) and Groq so the user always has a free backup if one provider hits a rate limit.

### Security & Deployment Modes

- **Local / Personal Mode (BYOK):** Let the user paste their own free API key in `ApiSettingsModal.tsx` and store it in `localStorage`. Never hardcode any API key in `src/`.
- **Public Production Mode (Vercel):** Route requests through `/api/grade.ts` (Vercel Serverless Function) reading `process.env.GEMINI_API_KEY` or `process.env.GROQ_API_KEY` from Vercel Environment Variables. This protects the key and eliminates browser CORS issues.

### Provider 1: Google AI Studio (Gemini API)

- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
- **Default Free Model:** `gemini-3.5-flash-lite` (avoid deprecated `gemini-2.5-flash`; allow users to edit the model ID in Settings).
- **Strict JSON Output:** Set `generationConfig: { responseMimeType: "application/json", temperature: 0.3 }`.

### Provider 2: Groq API (OpenAI-Compatible Free Tier)

- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Headers:** `Authorization: Bearer ${apiKey}`, `Content-Type: application/json`
- **Default Free Model:** `llama-3.3-70b-versatile` (high grading quality).
- **Automatic Rate-Limit Fallback:** If `llama-3.3-70b-versatile` returns HTTP `429`, automatically retry once with `llama-3.1-8b-instant`.
- **Strict JSON Output:** Set `response_format: { type: "json_object" }` and explicitly include the word `JSON` and the exact schema in the system prompt.

### Grading JSON Schema

Enforce this exact JSON response contract in the system prompt for both providers:

```json
{
  "overallScore": 8.5,
  "scores": {
    "action": 9,
    "saying": 8,
    "goal": 8.5,
    "language": 8.5
  },
  "strengths": ["Clear 1-on-1 timing", "Polite direct speech"],
  "improvements": ["Explain the pedagogical purpose more specifically"],
  "grammarFixes": [
    { "original": "I notice you...", "corrected": "I've noticed you...", "reasonVi": "Dung hien tai hoan thanh de neu quan sat nhe nhang." }
  ],
  "improvedSample": {
    "action": "...",
    "saying": "...",
    "goal": "..."
  },
  "summaryVi": "Nhan xet tong quan ngan gon bang tieng Viet."
}
```

### Error-Proofing Rules

- **Safe JSON Parsing:** Strip accidental markdown code fences (` ```json ` / ` ``` `) and extract the first `{ ... }` block before calling `JSON.parse()`. Wrap in `try/catch` and show a friendly retry button if parsing fails.
- **Timeout & Double-Submit Guard:** Use `AbortController` with a `20000ms` timeout and disable the Submit button while `isLoading` is true.
- **Graceful HTTP Error Mapping (in Vietnamese):**
  - `400`: Request or model name invalid (suggest checking model ID in Settings).
  - `401 / 403`: API key invalid or missing permissions.
  - `429`: Free tier rate limit reached (wait 30 seconds or switch provider between Gemini and Groq).
  - `Network / CORS`: Advise checking internet connection or using the `/api/grade.ts` proxy.
- **Git Safety:** Always include `.env` and `.env.local` in `.gitignore`.

## Gotchas

- **Deprecated Model IDs:** Free-tier model names evolve. Keep the model string configurable in `ApiSettingsModal.tsx` instead of hardcoding it permanently.
- **Groq JSON Mode Requirement:** Groq rejects `response_format: { type: "json_object" }` with HTTP `400` if the system or user prompt does not explicitly mention `JSON`. Always include the word `JSON` in the system prompt.
- **CORS on Client-Side Calls:** Both Gemini REST and Groq REST support browser `fetch`, but browser extensions or strict networks can block them. Providing the optional `/api/grade.ts` Vercel route avoids this completely in production.
- **IPA Font Rendering:** Some default system fonts misalign IPA stress marks (`ˈ`, `ˌ`). Always load `Inter` or `Plus Jakarta Sans` with `DejaVu Sans` fallback for IPA spans.
