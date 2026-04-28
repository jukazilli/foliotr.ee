import type { PersistedState, TestResult, UserProfile } from '../types/test';
import { ScorePill } from './ScorePill';
import { RadarChart } from './RadarChart';

interface ResultScreenProps {
  state: PersistedState;
  result: TestResult;
  profile: UserProfile;
  onRestart: () => void;
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ResultScreen({ state, result, profile, onRestart }: ResultScreenProps) {
  const topAreas = result.recommendedAreas.slice(0, 3);
  const alternatives = result.recommendedAreas.slice(3, 6);

  return (
    <main className="result-layout">
      <section className="result-hero glass-card">
        <div>
          <span className="eyebrow">Relatório final</span>
          <h1>{profile.name ? `${profile.name}, seu mapa profissional está pronto` : 'Seu mapa profissional está pronto'}</h1>
          <p>{result.summary}</p>
        </div>
        <div className="result-kpis">
          <div>
            <span>Código RIASEC</span>
            <strong>{result.riasecCode}</strong>
          </div>
          <div>
            <span>Arquétipo</span>
            <strong>{result.dominantArchetypeLabel}</strong>
          </div>
          <div>
            <span>Clareza</span>
            <strong>{result.confidence}</strong>
            <small>{result.confidenceLabel}</small>
          </div>
        </div>
      </section>

      <section className="section-card glass-card warning-card">
        <strong>Uso responsável do resultado</strong>
        <p>
          Este teste é uma ferramenta de apoio à decisão e autoconhecimento profissional. Ele não é diagnóstico psicológico,
          não define destino fixo e deve ser usado como ponto de partida para reflexão, pesquisa e validação prática.
        </p>
      </section>

      <section className="charts-grid">
        <RadarChart title="Mapa de Afinidades Profissionais" data={result.riasec.ranking.map((item) => ({ label: item.label, value: item.value }))} />
        <RadarChart title="Mapa de Forças Comportamentais" data={result.bigFive.ranking.map((item) => ({ label: item.label, value: item.value }))} />
        <RadarChart title="Perfil de Motivação" data={result.archetype.ranking.map((item) => ({ label: item.label, value: item.value }))} />
      </section>

      <section className="section-card glass-card">
        <div className="section-heading">
          <h2>Áreas mais compatíveis</h2>
          <p>Ranking calculado por afinidade profissional, estilo comportamental e arquétipo motivacional.</p>
        </div>
        <div className="area-list">
          {topAreas.map((item, index) => (
            <article key={item.area.id} className="area-card">
              <div className="area-rank">#{index + 1}</div>
              <div className="area-content">
                <div className="area-title-row">
                  <h3>{item.area.area}</h3>
                  <ScorePill value={item.score} />
                </div>
                <p>{item.area.description}</p>
                <ul className="reason-list">
                  {item.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
                <div className="tag-list">
                  {item.area.carreiras.map((career) => <span key={career}>{career}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="two-column-grid">
        <div className="section-card glass-card">
          <div className="section-heading compact">
            <h2>Forças principais</h2>
            <p>Características que aparecem como recursos positivos no seu perfil.</p>
          </div>
          <div className="insight-list">
            {result.strengths.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="section-card glass-card">
          <div className="section-heading compact">
            <h2>Pontos de atenção</h2>
            <p>Não são fraquezas definitivas. São pontos para desenvolvimento.</p>
          </div>
          <div className="insight-list">
            {result.attentionPoints.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p><strong>Risco:</strong> {item.risk}</p>
                <p><strong>Desenvolvimento:</strong> {item.development}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-card glass-card">
        <div className="section-heading">
          <h2>Próximos passos práticos</h2>
          <p>Use as áreas principais para validar interesse com ações pequenas antes de tomar uma decisão maior.</p>
        </div>
        <div className="action-grid">
          {topAreas.map((item) => (
            <article key={item.area.id}>
              <h3>{item.area.area}</h3>
              <ol>
                {item.area.proximosPassos.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card glass-card">
        <div className="section-heading compact">
          <h2>Áreas alternativas</h2>
          <p>Podem funcionar como caminhos secundários ou combinações híbridas.</p>
        </div>
        <div className="alternative-grid">
          {alternatives.map((item) => (
            <div key={item.area.id} className="alternative-card">
              <strong>{item.area.area}</strong>
              <span>{item.score}/100</span>
            </div>
          ))}
        </div>
      </section>

      <section className="result-actions">
        <button className="primary-btn" onClick={() => downloadJson('resultado-orientacao-profissional.json', { profile, answers: state.answers, result })}>
          Exportar JSON
        </button>
        <button className="ghost-btn" onClick={() => window.print()}>Imprimir / salvar PDF</button>
        <button className="danger-btn" onClick={onRestart}>Refazer teste</button>
      </section>
    </main>
  );
}
