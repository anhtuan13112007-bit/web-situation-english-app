import React from 'react';
import { WordDiffResult } from '../../types';

interface WordDiffViewProps {
  diff: WordDiffResult;
  expectedSentence?: string;
}

export const WordDiffView: React.FC<WordDiffViewProps> = ({ diff, expectedSentence }) => {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-[#475569]">Chấm theo từng từ:</span>
        <span
          className={`px-2.5 py-0.5 rounded-full font-bold border ${
            diff.accuracy === 100
              ? 'bg-[#DCFCE7] text-[#15803D] border-emerald-200'
              : diff.accuracy >= 70
              ? 'bg-[#FEF3C7] text-[#B45309] border-amber-200'
              : 'bg-[#FEE2E2] text-[#B91C1C] border-red-200'
          }`}
        >
          Chính xác {diff.accuracy}%
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] flex flex-wrap gap-1.5 leading-relaxed">
        {diff.tokens.map((tok, idx) => {
          if (tok.status === 'correct') {
            return (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-sm font-semibold border border-emerald-200"
              >
                {tok.expected}
              </span>
            );
          }
          if (tok.status === 'missing') {
            return (
              <span
                key={idx}
                title="Từ bị thiếu"
                className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] text-sm font-semibold border border-dashed border-amber-400"
              >
                +{tok.expected}
              </span>
            );
          }
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEE2E2] text-[#B91C1C] text-sm border border-red-200"
            >
              <span className="line-through">{tok.actual}</span>
              {tok.expected && (
                <span className="font-bold text-[#15803D]">→ {tok.expected}</span>
              )}
            </span>
          );
        })}
      </div>

      {expectedSentence && (
        <p className="text-xs text-[#475569]">
          <strong className="text-[#1B365D]">Đáp án chuẩn: </strong>
          {expectedSentence}
        </p>
      )}
    </div>
  );
};
