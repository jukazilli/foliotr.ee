import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { RedesignFooter, RedesignHeader } from "@/components/landing/RedesignShell";
import VocationModal from "@/components/vocation/VocationModal";

export const metadata: Metadata = {
  title: "Teste vocacional | LINKFOLIO",
  description:
    "Descubra suas forças, fraquezas, comportamento e caminhos profissionais com uma análise profunda baseada em métodos comprovados.",
};

export default function VocationPage() {
  return (
    <>
      <RedesignHeader />

      <main>
        <section className="vocation-hero" aria-labelledby="vocation-title">
          <div className="vocation-copy">
            <p className="eyebrow">Teste vocacional</p>
            <h1 id="vocation-title">Entenda seu perfil antes de escolher o próximo passo.</h1>
            <p>
              Descubra suas forças e fraquezas, comportamento e quem é você
              através de uma análise profunda usando métodos comprovados.
            </p>
            <VocationModal />
          </div>

          <div className="vocation-panel" aria-label="Prévia da análise vocacional">
            <div className="vocation-panel-header">
              <span>Mapa pessoal</span>
              <strong>Forças, sinais e caminhos</strong>
            </div>
            <div className="vocation-meter-grid" aria-hidden="true">
              <span style={{ "--value": "84%" } as CSSProperties}>Comunicação</span>
              <span style={{ "--value": "72%" } as CSSProperties}>Estratégia</span>
              <span style={{ "--value": "64%" } as CSSProperties}>Criatividade</span>
              <span style={{ "--value": "58%" } as CSSProperties}>Execução</span>
            </div>
            <p>
              O teste vai cruzar respostas comportamentais, interesses e padrões
              de decisão para sugerir áreas, formatos de trabalho e próximos
              movimentos de carreira.
            </p>
          </div>
        </section>
      </main>

      <RedesignFooter />
    </>
  );
}
