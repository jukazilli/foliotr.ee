import type { PersistedState } from '../types/test';

interface IntroScreenProps {
  state: PersistedState;
  onStart: () => void;
  onContinue: () => void;
  onRestart: () => void;
}

export function IntroScreen({ state, onStart, onContinue, onRestart }: IntroScreenProps) {
  const hasProgress = Object.keys(state.answers).length > 0 || state.stage === 'result';

  return (
    <main className="hero-layout">
      <section className="hero-card glass-card">
        <span className="eyebrow">Orientação profissional e autoconhecimento</span>
        <h1>Descubra trilhas profissionais compatíveis com seu perfil</h1>
        <p>
          Responda 60 perguntas simples sobre comportamento, afinidades e motivadores. Ao final, você receberá um relatório com
          mapa RIASEC, forças, pontos de atenção, arquétipo dominante, áreas recomendadas e próximos passos.
        </p>

        <div className="hero-actions">
          {hasProgress ? (
            <>
              <button className="primary-btn" onClick={onContinue}>Continuar teste salvo</button>
              <button className="ghost-btn" onClick={onRestart}>Começar do zero</button>
            </>
          ) : (
            <button className="primary-btn" onClick={onStart}>Iniciar teste</button>
          )}
        </div>
      </section>

      <aside className="info-grid">
        <div className="info-card">
          <strong>60</strong>
          <span>perguntas</span>
        </div>
        <div className="info-card">
          <strong>3</strong>
          <span>mapas de leitura</span>
        </div>
        <div className="info-card">
          <strong>10–15 min</strong>
          <span>tempo estimado</span>
        </div>
        <div className="info-card wide">
          <strong>Salvamento automático</strong>
          <span>Você pode sair e voltar depois. O progresso fica salvo neste navegador.</span>
        </div>
      </aside>
    </main>
  );
}
