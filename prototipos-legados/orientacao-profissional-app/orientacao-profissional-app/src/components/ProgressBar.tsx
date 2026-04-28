interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="progress-wrap" aria-label={label ?? 'Progresso'}>
      <div className="progress-meta">
        <span>{label ?? 'Progresso'}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
