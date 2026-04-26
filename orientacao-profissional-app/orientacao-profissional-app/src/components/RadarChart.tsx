interface RadarItem {
  label: string;
  value: number;
}

interface RadarChartProps {
  title: string;
  data: RadarItem[];
}

function polarToCartesian(center: number, radius: number, angle: number) {
  const angleInRadians = (angle - 90) * (Math.PI / 180);
  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians)
  };
}

function buildPoints(data: RadarItem[], center: number, radius: number) {
  return data
    .map((item, index) => {
      const angle = (360 / data.length) * index;
      const point = polarToCartesian(center, radius * (item.value / 100), angle);
      return `${point.x},${point.y}`;
    })
    .join(' ');
}

export function RadarChart({ title, data }: RadarChartProps) {
  const size = 320;
  const center = size / 2;
  const radius = 105;
  const levels = [0.25, 0.5, 0.75, 1];

  return (
    <section className="radar-card">
      <div className="section-heading compact">
        <h3>{title}</h3>
        <p>Escala normalizada de 0 a 100</p>
      </div>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Gráfico radar de ${title}`} className="radar-svg">
        {levels.map((level) => (
          <polygon
            key={level}
            points={buildPoints(data.map((item) => ({ ...item, value: level * 100 })), center, radius)}
            className="radar-grid"
          />
        ))}

        {data.map((item, index) => {
          const angle = (360 / data.length) * index;
          const end = polarToCartesian(center, radius, angle);
          const label = polarToCartesian(center, radius + 32, angle);
          return (
            <g key={item.label}>
              <line x1={center} y1={center} x2={end.x} y2={end.y} className="radar-axis" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className="radar-label">
                {item.label.length > 15 ? `${item.label.slice(0, 13)}…` : item.label}
              </text>
            </g>
          );
        })}

        <polygon points={buildPoints(data, center, radius)} className="radar-area" />
        {data.map((item, index) => {
          const angle = (360 / data.length) * index;
          const point = polarToCartesian(center, radius * (item.value / 100), angle);
          return <circle key={item.label} cx={point.x} cy={point.y} r="4" className="radar-dot" />;
        })}
      </svg>
      <div className="radar-list">
        {data.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
