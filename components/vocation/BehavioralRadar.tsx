"use client";

type RadarItem = {
  label: string;
  value: number;
};

type RadarLegendItem = {
  label: string;
  description: string;
};

function pointFor(
  index: number,
  total: number,
  value: number,
  radius: number,
  center: number
) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const distance = (Math.max(0, Math.min(100, value)) / 100) * radius;

  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance,
  };
}

function polygonPoints(items: RadarItem[], radius: number, center: number) {
  return items
    .map((item, index) => {
      const point = pointFor(index, items.length, item.value, radius, center);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function labelLines(label: string) {
  if (label === "Estabilidade emocional") return ["Estabilidade", "emocional"];
  if (label.length <= 14) return [label];

  const words = label.split(" ");
  if (words.length > 1) return words;

  return [label];
}

function labelPlacement(x: number, center: number) {
  if (x < center - 48) {
    return {
      x: Math.max(36, x),
      textAnchor: "end" as const,
    };
  }

  if (x > center + 48) {
    return {
      x: Math.min(204, x),
      textAnchor: "start" as const,
    };
  }

  return {
    x,
    textAnchor: "middle" as const,
  };
}

export function BehavioralRadar({
  title,
  items,
  color = "#245fd6",
  legend,
}: {
  title: string;
  items: RadarItem[];
  color?: string;
  legend?: RadarLegendItem[];
}) {
  const center = 120;
  const radius = 82;
  const rings = [25, 50, 75, 100];

  return (
    <figure className="min-w-0 rounded-[24px] border-2 border-line bg-white p-4 shadow-hard-sm">
      <figcaption className="mb-3 text-sm font-semibold uppercase text-ink">
        {title}
      </figcaption>
      <svg
        viewBox="-18 0 276 270"
        role="img"
        aria-label={title}
        className="h-auto w-full"
      >
        <g>
          {rings.map((ring) => (
            <polygon
              key={ring}
              points={items
                .map((_, index) => {
                  const point = pointFor(index, items.length, ring, radius, center);
                  return `${point.x},${point.y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#111111"
              strokeOpacity={ring === 100 ? 0.22 : 0.09}
              strokeWidth={ring === 100 ? 1.15 : 0.75}
            />
          ))}
          {items.map((item, index) => {
            const edge = pointFor(index, items.length, 100, radius, center);
            const label = pointFor(index, items.length, 121, radius, center);
            const placement = labelPlacement(label.x, center);
            const lines = labelLines(item.label);

            return (
              <g key={item.label}>
                <line
                  x1={center}
                  y1={center}
                  x2={edge.x}
                  y2={edge.y}
                  stroke="#111111"
                  strokeOpacity="0.07"
                  strokeWidth="0.75"
                />
                <text
                  x={placement.x}
                  y={label.y}
                  textAnchor={placement.textAnchor}
                  dominantBaseline="middle"
                  className="fill-ink text-[6px] font-semibold"
                >
                  {lines.map((line, lineIndex) => (
                    <tspan
                      key={line}
                      x={placement.x}
                      dy={lineIndex === 0 ? `${(1 - lines.length) * 3}px` : "6px"}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
          <polygon
            points={polygonPoints(items, radius, center)}
            fill={color}
            fillOpacity="0.1"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {items.map((item, index) => {
            const point = pointFor(index, items.length, item.value, radius, center);
            return (
              <g key={`${item.label}-${item.value}`}>
                <circle cx={point.x} cy={point.y} r="6.5" fill={color} />
                <text
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white text-[5px] font-semibold"
                >
                  {item.value}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      {legend?.length ? (
        <dl className="mt-2 grid gap-1.5 text-[10px] leading-4 text-muted">
          {legend.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="inline font-medium text-ink">{item.label}</dt>
              <dd className="inline">: {item.description}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </figure>
  );
}
