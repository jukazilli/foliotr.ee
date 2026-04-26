import type { BehavioralAnalysisSnapshot } from "@/lib/vocational-test/public-analysis";
import { BehavioralRadar } from "./BehavioralRadar";

export function BehavioralAnalysisSection({
  analysis,
  compact = false,
}: {
  analysis: BehavioralAnalysisSnapshot;
  compact?: boolean;
}) {
  const { result } = analysis;
  const report = analysis.aiReport || result.summary;
  const topAreas = result.recommendedAreas.slice(0, compact ? 2 : 3);

  return (
    <section className="min-w-0 rounded-[28px] border-2 border-line bg-cream p-5 text-ink shadow-hard sm:p-7">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <div className="min-w-0">
          <p className="brand-eyebrow">Análise comportamental</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Arquétipo {result.dominantArchetypeLabel}
          </h2>
          <p className="brand-copy mt-4 whitespace-pre-line text-sm sm:text-base">
            {report}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border-2 border-line bg-lime px-3 py-1 text-sm font-extrabold">
              RIASEC {result.riasecCode}
            </span>
            <span className="rounded-full border-2 border-line bg-pink px-3 py-1 text-sm font-extrabold">
              Clareza {result.confidence}/100
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          {topAreas.map((item) => (
            <article key={item.area.id} className="border-2 border-line bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-extrabold">{item.area.area}</h3>
                <span className="font-extrabold text-blue">{item.score}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-muted">
                {item.area.carreiras.slice(0, 3).join(", ")}
              </p>
            </article>
          ))}
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
        />
        <BehavioralRadar
          title="RIASEC"
          items={result.riasec.ranking.map((item) => ({
            label: item.label,
            value: item.value,
          }))}
          color="#ff4d00"
        />
      </div>
    </section>
  );
}
