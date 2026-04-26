"use client";

type RadarItem = {
  label: string;
  value: number;
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

export function BehavioralRadar({
  title,
  items,
  color = "#245fd6",
}: {
  title: string;
  items: RadarItem[];
  color?: string;
}) {
  const center = 120;
  const radius = 82;
  const rings = [25, 50, 75, 100];

  return (
    <figure className="min-w-0 rounded-[24px] border-2 border-line bg-white p-4 shadow-hard-sm">
      <figcaption className="mb-3 text-sm font-extrabold uppercase text-ink">
        {title}
      </figcaption>
      <svg
        viewBox="0 0 240 270"
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
              strokeOpacity={ring === 100 ? 0.35 : 0.16}
              strokeWidth={ring === 100 ? 2 : 1.5}
            />
          ))}
          {items.map((item, index) => {
            const edge = pointFor(index, items.length, 100, radius, center);
            const label = pointFor(index, items.length, 118, radius, center);

            return (
              <g key={item.label}>
                <line
                  x1={center}
                  y1={center}
                  x2={edge.x}
                  y2={edge.y}
                  stroke="#111111"
                  strokeOpacity="0.12"
                  strokeWidth="1"
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-ink text-[10px] font-extrabold"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
          <polygon
            points={polygonPoints(items, radius, center)}
            fill={color}
            fillOpacity="0.18"
            stroke={color}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {items.map((item, index) => {
            const point = pointFor(index, items.length, item.value, radius, center);
            return (
              <g key={`${item.label}-${item.value}`}>
                <circle cx={point.x} cy={point.y} r="6" fill={color} />
                <text
                  x={point.x}
                  y={point.y + 18}
                  textAnchor="middle"
                  className="fill-muted text-[9px] font-bold"
                >
                  {item.value}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </figure>
  );
}
