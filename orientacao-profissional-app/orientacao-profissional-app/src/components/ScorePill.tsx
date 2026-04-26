interface ScorePillProps {
  value: number;
  label?: string;
}

function classify(value: number) {
  if (value >= 65) return 'Alto';
  if (value >= 35) return 'Moderado';
  return 'Baixo';
}

export function ScorePill({ value, label }: ScorePillProps) {
  return (
    <span className={`score-pill score-${classify(value).toLowerCase()}`}>
      {label && <span>{label}</span>}
      <strong>{value}</strong>
      <small>{classify(value)}</small>
    </span>
  );
}
