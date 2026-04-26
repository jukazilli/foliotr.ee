import { IntroScreen } from './components/IntroScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { ResultScreen } from './components/ResultScreen';
import { usePersistentTest } from './hooks/usePersistentTest';
import './styles.css';

function App() {
  const {
    state,
    setStage,
    updateProfile,
    answerQuestion,
    goNext,
    goBack,
    finish,
    restart,
    currentQuestion,
    progress
  } = usePersistentTest();

  if (state.stage === 'intro') {
    return (
      <IntroScreen
        state={state}
        onStart={() => setStage('profile')}
        onContinue={() => setStage(state.result ? 'result' : state.profile.name || Object.keys(state.answers).length ? 'test' : 'profile')}
        onRestart={restart}
      />
    );
  }

  if (state.stage === 'profile') {
    return <ProfileScreen initialProfile={state.profile} onSubmit={updateProfile} />;
  }

  if (state.stage === 'result' && state.result) {
    return <ResultScreen state={state} result={state.result} profile={state.profile} onRestart={restart} />;
  }

  return (
    <QuestionScreen
      question={currentQuestion}
      currentIndex={state.currentQuestionIndex}
      answers={state.answers}
      progress={progress}
      onAnswer={answerQuestion}
      onNext={goNext}
      onBack={goBack}
      onFinish={finish}
    />
  );
}

export default App;
