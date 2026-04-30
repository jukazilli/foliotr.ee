import type { BehavioralAnalysisSnapshot } from "@/lib/vocational-test/public-analysis";
import {
  bigFiveDescriptions,
  riasecDescriptions,
} from "@/lib/vocational-test/labels";
import { BehavioralRadar } from "./BehavioralRadar";

export function BehavioralAnalysisSection({
  analysis,
}: {
  analysis: BehavioralAnalysisSnapshot;
  compact?: boolean;
}) {
  const { result } = analysis;
  const report = analysis.aiReport || result.summary;

  return (
    <section className="min-w-0 rounded-xl border border-[#dddfe2] bg-white p-5 text-[#050505] shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-6">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#65676b]">
          Análise comportamental
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
          Arquétipo {result.dominantArchetypeLabel}
        </h2>
        <p className="mt-4 max-w-5xl whitespace-pre-line text-sm font-normal leading-6 text-[#050505] sm:text-base">
          {report}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#f0f2f5] px-3 py-1 text-sm font-semibold text-[#050505]">
            RIASEC {result.riasecCode}
          </span>
          <span className="rounded-full bg-[#f0f2f5] px-3 py-1 text-sm font-semibold text-[#050505]">
            Clareza {result.confidence}/100
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <BehavioralRadar
          title="Big Five"
          items={result.bigFive.ranking.map((item) => ({
            label: item.label,
            value: item.value,
          }))}
          color="#245fd6"
          legend={[
            {
              label: "Abertura",
              description: `O quanto você tende a ${bigFiveDescriptions.abertura}.`,
            },
            {
              label: "Conscienciosidade",
              description: `O quanto você tende a ${bigFiveDescriptions.conscienciosidade}.`,
            },
            {
              label: "Extroversão",
              description: `O quanto você tende a ${bigFiveDescriptions.extroversao}.`,
            },
            {
              label: "Amabilidade",
              description: `O quanto você tende a ${bigFiveDescriptions.amabilidade}.`,
            },
            {
              label: "Estabilidade Emocional",
              description: `O quanto você tende a ${bigFiveDescriptions.estabilidadeEmocional}.`,
            },
          ]}
        />
        <BehavioralRadar
          title="RIASEC"
          items={result.riasec.ranking.map((item) => ({
            label: item.label,
            value: item.value,
          }))}
          color="#ff4d00"
          legend={[
            {
              label: "Realista",
              description: `Prefere ${riasecDescriptions.realista}.`,
            },
            {
              label: "Investigativo",
              description: `Prefere ${riasecDescriptions.investigativo}.`,
            },
            {
              label: "Artístico",
              description: `Prefere ${riasecDescriptions.artistico}.`,
            },
            {
              label: "Social",
              description: `Prefere ${riasecDescriptions.social}.`,
            },
            {
              label: "Empreendedor",
              description: `Prefere ${riasecDescriptions.empreendedor}.`,
            },
            {
              label: "Convencional",
              description: `Prefere ${riasecDescriptions.convencional}.`,
            },
          ]}
        />
      </div>
    </section>
  );
}
