import React, { useEffect, useState } from 'react';
import { Clock, Heart, RotateCcw, Trophy } from 'lucide-react';
import { SENTENCE_PATTERNS } from '../../data/patterns';
import { VOCABULARY_ITEMS } from '../../data/vocabulary';
import { SpeechAccent, speakEnglish } from '../../utils/speech';
import { cleanVocabWord, resolveDefaultPatternSentence } from '../../utils/studyHelpers';

interface MatchingGameModeProps {
  accent: SpeechAccent;
  onRecordMistake: (wordId: string) => void;
}

interface PairTile {
  id: string;
  text: string;
  vocabId?: string;
}

type MatchDeck = 'vocab' | 'patterns';

function buildRound(deck: MatchDeck): { left: PairTile[]; right: PairTile[] } {
  const source: { id: string; en: string; vi: string; vocabId?: string }[] =
    deck === 'vocab'
      ? [...VOCABULARY_ITEMS]
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)
          .map((v) => ({
            id: v.id,
            en: v.word,
            vi: v.meaningVi,
            vocabId: v.id,
          }))
      : [...SENTENCE_PATTERNS]
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)
          .map((p) => ({
            id: p.id,
            en: resolveDefaultPatternSentence(p),
            vi: `${p.category.toUpperCase()}: ${p.labelVi}`,
          }));

  const left = source.map((s) => ({ id: s.id, text: s.en, vocabId: s.vocabId }));
  const right = [...source]
    .sort(() => Math.random() - 0.5)
    .map((s) => ({ id: s.id, text: s.vi, vocabId: s.vocabId }));

  return { left, right };
}

export const MatchingGameMode: React.FC<MatchingGameModeProps> = ({
  accent,
  onRecordMistake,
}) => {
  const [deck, setDeck] = useState<MatchDeck>('vocab');
  const [round, setRound] = useState(() => buildRound('vocab'));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongFlash, setWrongFlash] = useState<{ left: string; right: string } | null>(null);
  const [hearts, setHearts] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(90);

  const isWon = matchedIds.length === 6;
  const isLost = hearts <= 0 || secondsLeft <= 0;
  const isOver = isWon || isLost;

  const startNewRound = (nextDeck: MatchDeck = deck) => {
    setDeck(nextDeck);
    setRound(buildRound(nextDeck));
    setSelectedLeft(null);
    setMatchedIds([]);
    setWrongFlash(null);
    setHearts(5);
    setSecondsLeft(90);
  };

  useEffect(() => {
    if (isOver) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOver]);

  const handleSelectLeft = (tile: PairTile) => {
    if (isOver || matchedIds.includes(tile.id)) return;
    setSelectedLeft(tile.id);
    speakEnglish(cleanVocabWord(tile.text), accent);
  };

  const handleSelectRight = (tile: PairTile) => {
    if (isOver || !selectedLeft || matchedIds.includes(tile.id)) return;
    if (selectedLeft === tile.id) {
      setMatchedIds((prev) => [...prev, tile.id]);
      setSelectedLeft(null);
    } else {
      const leftTile = round.left.find((t) => t.id === selectedLeft);
      if (leftTile?.vocabId) onRecordMistake(leftTile.vocabId);
      setWrongFlash({ left: selectedLeft, right: tile.id });
      setHearts((prev) => Math.max(0, prev - 1));
      setSelectedLeft(null);
      setTimeout(() => setWrongFlash(null), 550);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-[#F5F7FA] p-1 border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => startNewRound('vocab')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
              deck === 'vocab' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
            }`}
          >
            6 cặp Từ vựng
          </button>
          <button
            type="button"
            onClick={() => startNewRound('patterns')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
              deck === 'patterns' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-[#475569]'
            }`}
          >
            6 cặp Mẫu câu
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#B91C1C]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < hearts ? 'fill-[#B91C1C] text-[#B91C1C]' : 'text-slate-300'}`}
              />
            ))}
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-bold text-[#1B365D]">
            <Clock className="w-3.5 h-3.5" /> {secondsLeft}s
          </div>

          <button
            type="button"
            onClick={() => startNewRound(deck)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1B365D] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Vòng mới
          </button>
        </div>
      </div>

      {isOver ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center space-y-4 shadow-xs">
          <Trophy
            className={`w-10 h-10 mx-auto ${isWon ? 'text-[#15803D]' : 'text-[#B45309]'}`}
          />
          <h4 className="text-xl font-bold text-[#1B365D]">
            {isWon
              ? `Hoàn thành xuất sắc! Còn ${secondsLeft}s và ${hearts} tim.`
              : hearts <= 0
              ? 'Đã hết 5 tim!'
              : 'Hết 90 giây!'}
          </h4>
          <button
            type="button"
            onClick={() => startNewRound(deck)}
            className="px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-semibold cursor-pointer"
          >
            Chơi vòng mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase text-[#475569] px-1">
              1. Chọn Tiếng Anh (tự phát âm)
            </div>
            {round.left.map((tile) => {
              const isMatched = matchedIds.includes(tile.id);
              const isSelected = selectedLeft === tile.id;
              const isWrong = wrongFlash?.left === tile.id;
              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleSelectLeft(tile)}
                  className={`w-full p-3.5 rounded-xl border text-left text-sm font-semibold transition cursor-pointer ${
                    isMatched
                      ? 'bg-[#DCFCE7] border-emerald-300 text-[#15803D] opacity-60 cursor-default'
                      : isWrong
                      ? 'bg-[#FEE2E2] border-red-400 text-[#B91C1C]'
                      : isSelected
                      ? 'bg-[#DBEAFE] border-[#2E6B9E] text-[#1B365D] ring-2 ring-[#2E6B9E]/30'
                      : 'bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#1B365D]'
                  }`}
                >
                  {tile.text}
                </button>
              );
            })}
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase text-[#475569] px-1">
              2. Chọn Nghĩa tiếng Việt tương ứng
            </div>
            {round.right.map((tile) => {
              const isMatched = matchedIds.includes(tile.id);
              const isWrong = wrongFlash?.right === tile.id;
              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleSelectRight(tile)}
                  className={`w-full p-3.5 rounded-xl border text-left text-sm transition cursor-pointer ${
                    isMatched
                      ? 'bg-[#DCFCE7] border-emerald-300 text-[#15803D] opacity-60 cursor-default'
                      : isWrong
                      ? 'bg-[#FEE2E2] border-red-400 text-[#B91C1C]'
                      : 'bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#1F2933]'
                  }`}
                >
                  {tile.text}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
