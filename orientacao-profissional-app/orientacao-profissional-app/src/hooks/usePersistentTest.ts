import { useEffect, useMemo, useState } from 'react';
import { questions } from '../data/questions';
import { calculateResult } from '../engine/scoring';
import type { Answers, PersistedState, TestStage, UserProfile } from '../types/test';
import { clearState, loadState, saveState } from '../utils/storage';

const emptyProfile: UserProfile = {
  name: '',
  moment: 'escolhendoFaculdade',
  goal: ''
};

const initialState: PersistedState = {
  stage: 'intro',
  currentQuestionIndex: 0,
  answers: {},
  profile: emptyProfile
};

export function usePersistentTest() {
  const [state, setState] = useState<PersistedState>(() => loadState() ?? initialState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const answeredCount = useMemo(() => Object.keys(state.answers).length, [state.answers]);
  const progress = Math.round((answeredCount / questions.length) * 100);
  const currentQuestion = questions[state.currentQuestionIndex];

  function setStage(stage: TestStage) {
    setState((prev) => ({ ...prev, stage }));
  }

  function updateProfile(profile: UserProfile) {
    setState((prev) => ({
      ...prev,
      profile,
      stage: 'test',
      startedAt: prev.startedAt ?? new Date().toISOString()
    }));
  }

  function answerQuestion(questionId: string, value: number) {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }));
  }

  function goNext() {
    setState((prev) => {
      if (prev.currentQuestionIndex >= questions.length - 1) return prev;
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 };
    });
  }

  function goBack() {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1)
    }));
  }

  function finish() {
    setState((prev) => {
      const result = calculateResult(prev.answers, prev.profile);
      return {
        ...prev,
        result,
        stage: 'result'
      };
    });
  }

  function restart() {
    clearState();
    setState(initialState);
  }

  return {
    state,
    setStage,
    updateProfile,
    answerQuestion,
    goNext,
    goBack,
    finish,
    restart,
    currentQuestion,
    answeredCount,
    progress,
    isComplete: answeredCount === questions.length
  };
}
