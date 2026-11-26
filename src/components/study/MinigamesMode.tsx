import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Heart,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react';
import { VOCABULARY_ITEMS } from '../../data/vocabulary';
import { SpeechAccent, speakEnglish } from '../../utils/speech';
import {
  cleanVocabWord,
  diffWords,
  getAllPracticeSentences,
  isTypingTarget,
  normalizeEn,
  tokenizeEnWords,
} from '../../utils/studyHelpers';
import { WordDiffView } from './WordDiffView';

interface MinigamesModeProps {
  accent: SpeechAccent;
  onRecordMistake: (wordId: string) => void;
}

type MiniGameId =
  | 'hangman'
  | 'scramble'
  | 'memory'
  | 'rain'
  | 'sentence-order'
  | 'true-false';

const SINGLE_WORDS = VOCABULARY_ITEMS.filter((v) => !cleanVocabWord(v.word).includes(' '));

/* 1. Hangman */
const HangmanGame: React.FC<{ accent: SpeechAccent; onRecordMistake: (id: string) => void }> = ({
  accent,
  onRecordMistake,
}) => {
  const [idx, setIdx] = useState(0);
  const [guessed, setGuessed] = useState<string[]>([]);
  const item = SINGLE_WORDS[idx % SINGLE_WORDS.length];
  const target = cleanVocabWord(item.word).toLowerCase();
  const letters = useMemo(() => 'abcdefghijklmnopqrstuvwxyz'.split(''), []);

  const wrongGuesses = guessed.filter((ch) => !target.includes(ch));
  const livesLeft = Math.max(0, 6 - wrongGuesses.length);
  const isWon = target.split('').every((ch) => !/[a-z]/.test(ch) || guessed.includes(ch));
  const isLost = livesLeft === 0 && !isWon;

  const pickLetter = (ch: string) => {
    if (isWon || isLost || guessed.includes(ch)) return;
    const next = [...guessed, ch];
    setGuessed(next);
    if (!target.includes(ch) && 6 - next.filter((c) => !target.includes(c)).length === 0) {
      onRecordMistake(item.id);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const ch = e.key.toLowerCase();
      if (/^[a-z]$/.test(ch)) pickLetter(ch);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const nextWord = () => {
    setIdx((prev) => prev + 1);
    setGuessed([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-[#1B365D]">Đoán chữ (Hangman)</h4>
          <p className="text-xs text-[#475569]">
            Nghĩa: <strong className="text-[#15803D]">{item.meaningVi}</strong> ({item.pos})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-xs font-bold">
            Còn {livesLeft}/6 lượt sai
          </span>
          <button
            type="button"
            onClick={nextWord}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] cursor-pointer"
          >
            Từ mới
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#E2E8F0] flex flex-wrap justify-center gap-2">
        {target.split('').map((ch, i) => {
          const show = !/[a-z]/.test(ch) || guessed.includes(ch) || isLost;
          return (
            <span
              key={i}
              className={`w-9 h-11 rounded-lg border-b-2 flex items-center justify-center text-xl font-extrabold uppercase ${
                isLost && !guessed.includes(ch)
                  ? 'bg-[#FEE2E2] border-red-400 text-[#B91C1C]'
                  : 'bg-white border-[#1B365D] text-[#1B365D]'
              }`}
            >
              {show ? ch : ''}
            </span>
          );
        })}
      </div>

      {(isWon || isLost) && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 ${
            isWon ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'
          }`}
        >
          <span>
            {isWon ? 'Chính xác!' : 'Hết lượt!'} Từ đúng: <strong>{item.word}</strong> ({item.ipaBrE})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => speakEnglish(target, accent)}
              className="p-1.5 rounded-lg bg-white border border-current/20 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextWord}
              className="px-3 py-1.5 rounded-lg bg-[#1B365D] text-white text-xs font-semibold cursor-pointer"
            >
              Từ tiếp
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-1.5">
        {letters.map((ch) => {
          const used = guessed.includes(ch);
          const ok = used && target.includes(ch);
          return (
            <button
              key={ch}
              type="button"
              disabled={used || isWon || isLost}
              onClick={() => pickLetter(ch)}
              className={`w-9 h-9 rounded-lg border text-xs font-bold uppercase cursor-pointer disabled:cursor-default ${
                !used
                  ? 'bg-white border-[#E2E8F0] hover:bg-[#DBEAFE] text-[#1B365D]'
                  : ok
                  ? 'bg-[#DCFCE7] border-emerald-300 text-[#15803D]'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {ch}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* 2. Word Scramble (Click tiles OR Type directly) */
const ScrambleGame: React.FC<{ accent: SpeechAccent; onRecordMistake: (id: string) => void }> = ({
  accent,
  onRecordMistake,
}) => {
  const [idx, setIdx] = useState(0);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);

  const item = SINGLE_WORDS[idx % SINGLE_WORDS.length];
  const target = cleanVocabWord(item.word).toLowerCase();

  const scrambled = useMemo(() => {
    const chars = target.split('');
    return chars.sort(() => Math.random() - 0.5);
  }, [target, idx]);

  const builtWord = pickedIndices.map((i) => scrambled[i]).join('');

  const handleReset = () => {
    setPickedIndices([]);
    setTyped('');
    setChecked(null);
  };

  const handleNext = () => {
    setIdx((prev) => prev + 1);
    handleReset();
  };

  const handleCheck = (value: string) => {
    const ok = normalizeEn(value) === normalizeEn(target);
    setChecked(ok);
    if (!ok) onRecordMistake(item.id);
    else speakEnglish(target, accent);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-[#1B365D]">Sắp xếp chữ (Word Scramble)</h4>
          <p className="text-xs text-[#475569]">
            Nghĩa: <strong className="text-[#15803D]">{item.meaningVi}</strong> ({item.pos})
          </p>
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] cursor-pointer"
        >
          Từ tiếp
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {scrambled.map((ch, i) => {
          const used = pickedIndices.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={used}
              onClick={() => {
                const next = [...pickedIndices, i];
                setPickedIndices(next);
                setTyped(next.map((k) => scrambled[k]).join(''));
                setChecked(null);
              }}
              className={`w-10 h-10 rounded-xl border text-base font-extrabold uppercase cursor-pointer ${
                used
                  ? 'bg-slate-100 border-slate-200 text-slate-300'
                  : 'bg-[#DBEAFE]/50 border-blue-200 text-[#1B365D] hover:bg-[#DBEAFE]'
              }`}
            >
              {ch}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCheck(typed || builtWord);
        }}
        className="flex flex-wrap gap-2"
      >
        <input
          type="text"
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            setChecked(null);
          }}
          placeholder="Bấm chữ ở trên hoặc gõ trực tiếp đáp án..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
        />
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] cursor-pointer"
        >
          Xóa
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#1B365D] text-white text-xs sm:text-sm font-semibold cursor-pointer"
        >
          Kiểm tra
        </button>
      </form>

      {checked !== null && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between ${
            checked ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'
          }`}
        >
          <span>
            {checked ? 'Tuyệt vời! ' : 'Chưa đúng! '}
            Đáp án: <strong>{target}</strong> ({item.ipaBrE})
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="px-3 py-1 rounded-lg bg-[#1B365D] text-white text-xs font-semibold cursor-pointer"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
};

/* 3. Memory Match (12 Flip Cards) */
interface MemoryCard {
  uid: string;
  pairId: string;
  text: string;
  lang: 'en' | 'vi';
}

function buildMemoryDeck(): MemoryCard[] {
  const chosen = [...VOCABULARY_ITEMS].sort(() => Math.random() - 0.5).slice(0, 6);
  const cards: MemoryCard[] = [];
  chosen.forEach((v) => {
    cards.push({ uid: `${v.id}-en`, pairId: v.id, text: v.word, lang: 'en' });
    cards.push({ uid: `${v.id}-vi`, pairId: v.id, text: v.meaningVi, lang: 'vi' });
  });
  return cards.sort(() => Math.random() - 0.5);
}

const MemoryMatchGame: React.FC<{ accent: SpeechAccent }> = ({ accent }) => {
  const [cards, setCards] = useState<MemoryCard[]>(() => buildMemoryDeck());
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const handleFlip = (card: MemoryCard) => {
    if (flipped.length === 2 || flipped.includes(card.uid) || matched.includes(card.pairId)) return;
    if (card.lang === 'en') speakEnglish(cleanVocabWord(card.text), accent);

    const next = [...flipped, card.uid];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const first = cards.find((c) => c.uid === next[0]);
      const second = cards.find((c) => c.uid === next[1]);
      if (first && second && first.pairId === second.pairId) {
        setMatched((prev) => [...prev, first.pairId]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 650);
      }
    }
  };

  const reset = () => {
    setCards(buildMemoryDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-[#1B365D]">Lật thẻ trí nhớ (6 cặp EN–VN)</h4>
          <p className="text-xs text-[#475569]">
            Đã ghép: {matched.length}/6 cặp • Số lượt lật: {moves}
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Chơi lại
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isRevealed = flipped.includes(card.uid) || matched.includes(card.pairId);
          const isDone = matched.includes(card.pairId);
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlip(card)}
              className={`min-h-[86px] p-3 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center text-center ${
                isDone
                  ? 'bg-[#DCFCE7] border-emerald-300 text-[#15803D]'
                  : isRevealed
                  ? 'bg-[#DBEAFE] border-[#2E6B9E] text-[#1B365D]'
                  : 'bg-[#1B365D] border-[#1B365D] text-white/80 hover:bg-[#2E6B9E]'
              }`}
            >
              {isRevealed ? card.text : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* 4. Word Rain (Writing Game!) */
interface RainDrop {
  uid: string;
  vocabId: string;
  wordClean: string;
  meaningVi: string;
  y: number;
  xPct: number;
}

const WordRainGame: React.FC<{ accent: SpeechAccent; onRecordMistake: (id: string) => void }> = ({
  accent,
  onRecordMistake,
}) => {
  const [running, setRunning] = useState(false);
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<string>('');

  const spawnDrop = (): RainDrop => {
    const pick = VOCABULARY_ITEMS[Math.floor(Math.random() * VOCABULARY_ITEMS.length)];
    return {
      uid: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      vocabId: pick.id,
      wordClean: cleanVocabWord(pick.word),
      meaningVi: pick.meaningVi,
      y: 0,
      xPct: 10 + Math.floor(Math.random() * 60),
    };
  };

  const startGame = () => {
    setDrops([spawnDrop()]);
    setScore(0);
    setLives(3);
    setInput('');
    setFeedback('');
    setRunning(true);
  };

  useEffect(() => {
    if (!running || lives <= 0) return;
    const tick = setInterval(() => {
      setDrops((prev) => {
        const moved = prev.map((d) => ({ ...d, y: d.y + 4.5 }));
        const missed = moved.filter((d) => d.y >= 100);
        const alive = moved.filter((d) => d.y < 100);

        if (missed.length > 0) {
          missed.forEach((m) => onRecordMistake(m.vocabId));
          setLives((l) => Math.max(0, l - missed.length));
          setFeedback(`Rơi mất: ${missed.map((m) => `${m.wordClean} (${m.meaningVi})`).join(', ')}`);
        }

        if (alive.length < 2 && Math.random() < 0.35) {
          alive.push(spawnDrop());
        }
        if (alive.length === 0) {
          alive.push(spawnDrop());
        }
        return alive;
      });
    }, 380);
    return () => clearInterval(tick);
  }, [running, lives, onRecordMistake]);

  useEffect(() => {
    if (lives <= 0 && running) setRunning(false);
  }, [lives, running]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!running || !input.trim()) return;
    const norm = normalizeEn(input);
    const hit = drops.find((d) => normalizeEn(d.wordClean) === norm);
    if (hit) {
      setDrops((prev) => prev.filter((d) => d.uid !== hit.uid));
      setScore((s) => s + 10);
      setFeedback(`Bắn trúng: ${hit.wordClean}!`);
      speakEnglish(hit.wordClean, accent);
      setInput('');
    } else {
      setFeedback('Chưa khớp từ nào đang rơi!');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-[#1B365D]">Mưa từ (Word Rain — Luyện phản xạ gõ từ)</h4>
          <p className="text-xs text-[#475569]">
            Nhìn nghĩa tiếng Việt đang rơi, gõ đúng từ tiếng Anh + Enter trước khi chạm đáy!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold">
            Điểm: {score}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? 'fill-[#B91C1C] text-[#B91C1C]' : 'text-slate-300'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={startGame}
            className="px-3.5 py-1.5 rounded-lg bg-[#1B365D] text-white text-xs font-semibold cursor-pointer"
          >
            {running ? 'Chơi lại' : 'Bắt đầu'}
          </button>
        </div>
      </div>

      <div className="relative h-64 rounded-2xl bg-[#1B365D] overflow-hidden border border-slate-700">
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4 bg-slate-900/60 z-10 space-y-2">
            <Trophy className="w-8 h-8 text-amber-300" />
            <div className="font-bold text-base">
              {lives <= 0 ? `Game Over! Điểm của bạn: ${score}` : 'Sẵn sàng gõ từ vựng tốc độ cao?'}
            </div>
            <button
              type="button"
              onClick={startGame}
              className="px-4 py-2 rounded-xl bg-[#2E6B9E] text-white text-xs font-semibold cursor-pointer"
            >
              {lives <= 0 ? 'Chơi lại' : 'Bắt đầu ngay'}
            </button>
          </div>
        )}

        {drops.map((d) => (
          <div
            key={d.uid}
            style={{ top: `${d.y}%`, left: `${d.xPct}%` }}
            className="absolute px-3 py-1.5 rounded-xl bg-white text-[#1B365D] text-xs font-bold shadow-md border border-sky-200 max-w-[210px] truncate transition-all duration-300"
          >
            {d.meaningVi}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!running}
          placeholder="Gõ từ tiếng Anh tương ứng và nhấn Enter..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
        />
        <button
          type="submit"
          disabled={!running}
          className="px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs sm:text-sm font-semibold disabled:opacity-50 cursor-pointer"
        >
          Gửi (Enter)
        </button>
      </form>
      {feedback && <p className="text-xs text-[#475569]">{feedback}</p>}
    </div>
  );
};

/* 5. Sentence Order & Write */
const SentenceOrderGame: React.FC<{ accent: SpeechAccent }> = ({ accent }) => {
  const sentences = useMemo(() => getAllPracticeSentences(), []);
  const [idx, setIdx] = useState(0);
  const [writeMode, setWriteMode] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);

  const item = sentences[idx % sentences.length];
  const words = useMemo(() => tokenizeEnWords(item.en), [item.en]);
  const shuffledIndices = useMemo(
    () => words.map((_, i) => i).sort(() => Math.random() - 0.5),
    [words, idx]
  );

  const builtSentence = picked.map((i) => words[words.length ? shuffledIndices[i] : 0]).join(' ');
  const diff = useMemo(
    () => (checked ? diffWords(writeMode ? typed : builtSentence, item.en) : null),
    [checked, writeMode, typed, builtSentence, item.en]
  );

  const nextSentence = () => {
    setIdx((prev) => prev + 1);
    setPicked([]);
    setTyped('');
    setChecked(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-[#1B365D]">Xếp câu & Gõ câu chuẩn Form</h4>
          <p className="text-xs text-[#475569]">{item.labelVi}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setWriteMode((prev) => !prev);
              setChecked(false);
            }}
            className="px-3 py-1.5 rounded-lg border border-[#2E6B9E] text-[#2E6B9E] text-xs font-semibold cursor-pointer"
          >
            {writeMode ? 'Chuyển sang Xếp thẻ' : 'Chuyển sang Tự gõ câu'}
          </button>
          <button
            type="button"
            onClick={nextSentence}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] cursor-pointer"
          >
            Câu tiếp
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-sm font-semibold text-[#1B365D]">
        Nghĩa: {item.vi}
      </div>

      {writeMode ? (
        <textarea
          rows={3}
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            setChecked(false);
          }}
          placeholder="Gõ lại toàn bộ câu tiếng Anh..."
          className="w-full p-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6B9E]"
        />
      ) : (
        <>
          <div className="min-h-[60px] p-3 rounded-xl bg-slate-50 border border-dashed border-[#2E6B9E]/40 flex flex-wrap gap-1.5">
            {picked.length === 0 ? (
              <span className="text-xs text-[#475569]">Nhấn các mảnh từ bên dưới theo đúng thứ tự...</span>
            ) : (
              picked.map((slotIdx, orderPos) => (
                <button
                  key={orderPos}
                  type="button"
                  onClick={() => {
                    setPicked((prev) => prev.filter((_, p) => p !== orderPos));
                    setChecked(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#1B365D] text-white text-xs font-semibold cursor-pointer"
                >
                  {words[shuffledIndices[slotIdx]]}
                </button>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {shuffledIndices.map((wordIdx, posIdx) => {
              const used = picked.includes(posIdx);
              return (
                <button
                  key={posIdx}
                  type="button"
                  disabled={used}
                  onClick={() => {
                    setPicked((prev) => [...prev, posIdx]);
                    setChecked(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    used
                      ? 'bg-slate-100 border-slate-200 text-slate-300'
                      : 'bg-white border-[#E2E8F0] hover:bg-[#DBEAFE] text-[#1B365D]'
                  }`}
                >
                  {words[wordIdx]}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => speakEnglish(item.en, accent)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-[#2E6B9E]" /> Nghe câu mẫu
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setPicked([]);
              setTyped('');
              setChecked(false);
            }}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] cursor-pointer"
          >
            Xóa
          </button>
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="px-5 py-2 rounded-xl bg-[#1B365D] text-white text-xs font-semibold cursor-pointer"
          >
            Kiểm tra
          </button>
        </div>
      </div>

      {diff && <WordDiffView diff={diff} expectedSentence={item.en} />}
    </div>
  );
};

/* 6. True / False 60s Sprint */
interface TfItem {
  vocabId: string;
  word: string;
  shownMeaning: string;
  isTrue: boolean;
  realMeaning: string;
}

function nextTfItem(): TfItem {
  const real = VOCABULARY_ITEMS[Math.floor(Math.random() * VOCABULARY_ITEMS.length)];
  const isTrue = Math.random() >= 0.45;
  const fake = VOCABULARY_ITEMS.filter((v) => v.id !== real.id)[
    Math.floor(Math.random() * (VOCABULARY_ITEMS.length - 1))
  ];
  return {
    vocabId: real.id,
    word: real.word,
    shownMeaning: isTrue ? real.meaningVi : fake.meaningVi,
    isTrue,
    realMeaning: real.meaningVi,
  };
}

const TrueFalseSprint: React.FC<{ onRecordMistake: (id: string) => void }> = ({
  onRecordMistake,
}) => {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [item, setItem] = useState<TfItem>(() => nextTfItem());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastMsg, setLastMsg] = useState('');

  const start = () => {
    setSeconds(60);
    setScore(0);
    setStreak(0);
    setLastMsg('');
    setItem(nextTfItem());
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const answer = (choice: boolean) => {
    if (!running) return;
    if (choice === item.isTrue) {
      setScore((s) => s + 10 + streak * 2);
      setStreak((st) => st + 1);
      setLastMsg(`Chính xác! ${item.word} = ${item.realMeaning}`);
    } else {
      onRecordMistake(item.vocabId);
      setStreak(0);
      setLastMsg(`Sai rồi! ${item.word} nghĩa là "${item.realMeaning}"`);
    }
    setItem(nextTfItem());
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || !running) return;
      if (e.key === '1') answer(true);
      else if (e.key === '2') answer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-[#1B365D]">Đúng hay Sai 60 giây</h4>
          <p className="text-xs text-[#475569]">Phím tắt: 1 = Đúng · 2 = Sai</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold">
            Điểm: {score} (Combo x{streak})
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-bold text-[#1B365D]">
            <Clock className="w-3.5 h-3.5" /> {seconds}s
          </span>
          <button
            type="button"
            onClick={start}
            className="px-3.5 py-1.5 rounded-lg bg-[#1B365D] text-white text-xs font-semibold cursor-pointer"
          >
            {running ? 'Chơi lại' : 'Bắt đầu'}
          </button>
        </div>
      </div>

      {!running ? (
        <div className="p-8 rounded-2xl bg-[#F5F7FA] border border-[#E2E8F0] text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#2E6B9E] mx-auto" />
          <div className="font-bold text-[#1B365D]">
            {seconds === 0 ? `Hết giờ! Tổng điểm: ${score}` : 'Kiểm tra phản xạ nghĩa từ trong 60 giây'}
          </div>
          <button
            type="button"
            onClick={start}
            className="px-5 py-2 rounded-xl bg-[#1B365D] text-white text-sm font-semibold cursor-pointer"
          >
            Bắt đầu 60s
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#F5F7FA] border border-[#E2E8F0] text-center space-y-2">
            <div className="text-2xl font-extrabold text-[#1B365D]">{item.word}</div>
            <div className="text-sm text-[#475569]">có nghĩa là:</div>
            <div className="text-lg font-bold text-[#2E6B9E]">{item.shownMeaning}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => answer(true)}
              className="py-3.5 rounded-xl bg-[#DCFCE7] hover:bg-emerald-200 border border-emerald-300 text-[#15803D] font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> 1. ĐÚNG
            </button>
            <button
              type="button"
              onClick={() => answer(false)}
              className="py-3.5 rounded-xl bg-[#FEE2E2] hover:bg-red-200 border border-red-300 text-[#B91C1C] font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> 2. SAI
            </button>
          </div>
        </div>
      )}

      {lastMsg && <p className="text-xs text-[#475569] text-center">{lastMsg}</p>}
    </div>
  );
};

export const MinigamesMode: React.FC<MinigamesModeProps> = ({ accent, onRecordMistake }) => {
  const [game, setGame] = useState<MiniGameId>('rain');

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-wrap gap-2">
        {(
          [
            { id: 'rain', label: 'Mưa từ (Gõ nhanh)' },
            { id: 'hangman', label: 'Đoán chữ' },
            { id: 'scramble', label: 'Sắp xếp chữ' },
            { id: 'memory', label: 'Lật thẻ' },
            { id: 'sentence-order', label: 'Xếp & Gõ câu' },
            { id: 'true-false', label: 'Đúng / Sai 60s' },
          ] as const
        ).map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGame(g.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border cursor-pointer transition ${
              game === g.id
                ? 'bg-[#1B365D] text-white border-[#1B365D]'
                : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:bg-slate-100'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {game === 'hangman' && <HangmanGame accent={accent} onRecordMistake={onRecordMistake} />}
      {game === 'scramble' && <ScrambleGame accent={accent} onRecordMistake={onRecordMistake} />}
      {game === 'memory' && <MemoryMatchGame accent={accent} />}
      {game === 'rain' && <WordRainGame accent={accent} onRecordMistake={onRecordMistake} />}
      {game === 'sentence-order' && <SentenceOrderGame accent={accent} />}
      {game === 'true-false' && <TrueFalseSprint onRecordMistake={onRecordMistake} />}
    </div>
  );
};
