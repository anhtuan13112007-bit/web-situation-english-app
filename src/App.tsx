import React, { useMemo, useState } from 'react';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { GrammarLab } from './components/GrammarLab';
import { Layout } from './components/Layout';
import { PatternBank } from './components/PatternBank';
import { PracticeWorkspace } from './components/PracticeWorkspace';
import { SituationLibrary } from './components/SituationLibrary';
import { StudyHub } from './components/StudyHub';
import { GRAMMAR_LESSONS } from './data/grammar';
import { SITUATION_ITEMS } from './data/situations';
import { VOCABULARY_ITEMS } from './data/vocabulary';
import {
  AiSettings,
  ExamRecord,
  StudyStreak,
  SubmissionRecord,
  TabId,
  VocabMasteryStatus,
} from './types';
import {
  loadAiSettings,
  loadExamHistory,
  loadGrammarScores,
  loadMistakes,
  loadStudyStreak,
  loadSubmissions,
  loadVocabMastery,
  recordDailyActivity,
  saveAiSettings,
  saveExamHistory,
  saveGrammarScores,
  saveMistakes,
  saveSubmissions,
  saveVocabMastery,
} from './utils/storage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('hub');
  const [selectedSituationId, setSelectedSituationId] = useState<string>(SITUATION_ITEMS[0].id);

  const [vocabMastery, setVocabMastery] = useState<Record<string, VocabMasteryStatus>>(() =>
    loadVocabMastery()
  );
  const [grammarScores, setGrammarScores] = useState<Record<string, number>>(() =>
    loadGrammarScores()
  );
  const [mistakes, setMistakes] = useState<Record<string, number>>(() => loadMistakes());
  const [examHistory, setExamHistory] = useState<ExamRecord[]>(() => loadExamHistory());
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(() => loadSubmissions());
  const [aiSettings, setAiSettings] = useState<AiSettings>(() => loadAiSettings());
  const [streak, setStreak] = useState<StudyStreak>(() => loadStudyStreak());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const touchStreak = () => {
    setStreak(recordDailyActivity());
  };

  const handleUpdateVocabMastery = (wordId: string, status: VocabMasteryStatus) => {
    setVocabMastery((prev) => {
      const next = { ...prev, [wordId]: status };
      saveVocabMastery(next);
      return next;
    });
    touchStreak();
  };

  const handleRecordMistake = (wordId: string) => {
    setMistakes((prev) => {
      const next = { ...prev, [wordId]: (prev[wordId] ?? 0) + 1 };
      saveMistakes(next);
      return next;
    });
    touchStreak();
  };

  const handleSaveExam = (record: ExamRecord) => {
    setExamHistory((prev) => {
      const next = [record, ...prev].slice(0, 20);
      saveExamHistory(next);
      return next;
    });
    touchStreak();
  };

  const handleSaveQuizScore = (lessonId: string, score: number) => {
    setGrammarScores((prev) => {
      const best = Math.max(prev[lessonId] ?? 0, score);
      const next = { ...prev, [lessonId]: best };
      saveGrammarScores(next);
      return next;
    });
    touchStreak();
  };

  const handleAddSubmission = (record: SubmissionRecord) => {
    setSubmissions((prev) => {
      const next = [record, ...prev].slice(0, 30);
      saveSubmissions(next);
      return next;
    });
    touchStreak();
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveSubmissions(next);
      return next;
    });
  };

  const handleSaveSettings = (next: AiSettings) => {
    setAiSettings(next);
    saveAiSettings(next);
  };

  const handlePracticeSituation = (situationId: string) => {
    setSelectedSituationId(situationId);
    setActiveTab('practice');
  };

  const progressPercent = useMemo(() => {
    const masteredVocab = VOCABULARY_ITEMS.filter(
      (item) => vocabMastery[item.id] === 'mastered'
    ).length;
    const completedGrammar = GRAMMAR_LESSONS.filter(
      (lesson) => (grammarScores[lesson.id] ?? 0) >= 3
    ).length;
    const practicedSituations = new Set(submissions.map((s) => s.situationId)).size;

    const totalMilestones = VOCABULARY_ITEMS.length + GRAMMAR_LESSONS.length + 5;
    const achieved =
      masteredVocab + completedGrammar + Math.min(5, practicedSituations);
    return Math.min(100, Math.round((achieved / totalMilestones) * 100));
  }, [vocabMastery, grammarScores, submissions]);

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        progressPercent={progressPercent}
        streak={streak}
        aiSettings={aiSettings}
        onOpenSettings={() => setSettingsOpen(true)}
      >
        {activeTab === 'hub' && (
          <StudyHub
            mastery={vocabMastery}
            mistakes={mistakes}
            examHistory={examHistory}
            onUpdateMastery={handleUpdateVocabMastery}
            onRecordMistake={handleRecordMistake}
            onSaveExam={handleSaveExam}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'patterns' && <PatternBank />}

        {activeTab === 'grammar' && (
          <GrammarLab
            grammarScores={grammarScores}
            onSaveQuizScore={handleSaveQuizScore}
          />
        )}

        {activeTab === 'situations' && (
          <SituationLibrary onPracticeSituation={handlePracticeSituation} />
        )}

        {activeTab === 'practice' && (
          <PracticeWorkspace
            selectedSituationId={selectedSituationId}
            onSelectSituationId={setSelectedSituationId}
            aiSettings={aiSettings}
            onOpenSettings={() => setSettingsOpen(true)}
            submissions={submissions}
            onAddSubmission={handleAddSubmission}
            onDeleteSubmission={handleDeleteSubmission}
          />
        )}
      </Layout>

      <ApiSettingsModal
        key={settingsOpen ? 'open' : 'closed'}
        isOpen={settingsOpen}
        settings={aiSettings}
        onSave={handleSaveSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};

export default App;
