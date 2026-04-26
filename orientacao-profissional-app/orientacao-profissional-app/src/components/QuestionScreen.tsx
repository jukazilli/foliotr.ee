import { affinityScale, agreementScale } from '../data/scales';
import { questions } from '../data/questions';
import { getBlockInstruction, getBlockLabel } from '../engine/scoring';
import { dimensionLabels } from '../types/labels';
import type { Answers, Question } from '../types/test';
import { ProgressBar } from './ProgressBar';

interface QuestionScreenProps {
  question: Question;
  currentIndex: number;
  answers: Answers;
  progress: number;
  onAnswer: (questionId: string, value: number) => void;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
}

export function QuestionScreen({ question, currentIndex, answers, progress, onAnswer, onNext, onBack, onFinish }: QuestionScreenProps) {
  const selected = answers[question.id];
  const scale = question.block === 'riasec' ? affinityScale : agreementScale;
  const isLast = currentIndex === questions.length - 1;

  function handleNext() {
    if (!selected) return;
    if (isLast) onFinish();
    else onNext();
  }

  return (
    <main className="test-layout">
      <section className="test-shell glass-card">
        <ProgressBar value={progress} label={`${Object.keys(answers).length} de ${questions.length} respondidas`} />

        <div className="question-meta">
          <span>{getBlockLabel(question.block)}</span>
          <strong>Pergunta {question.number}/{questions.length}</strong>
        </div>

        <div className="question-card">
          <div className="dimension-chip">{dimensionLabels[question.dimension]}</div>
          <p className="instruction">{getBlockInstruction(question.block)}</p>
          <h1>{question.text}</h1>
        </div>

        <div className="scale-grid" role="radiogroup" aria-label="Escala de resposta">
          {scale.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`scale-option ${selected === option.value ? 'selected' : ''}`}
              onClick={() => onAnswer(question.id, option.value)}
            >
              <strong>{option.value}</strong>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <button className="ghost-btn" onClick={onBack} disabled={currentIndex === 0}>Voltar</button>
          <button className="primary-btn" onClick={handleNext} disabled={!selected}>{isLast ? 'Finalizar teste' : 'Próxima pergunta'}</button>
        </div>
      </section>
    </main>
  );
}
