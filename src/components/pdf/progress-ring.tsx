interface ProgressRingProps {
  value: number;
  label?: string;
}

export function ProgressRing({ value, label }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="progress-wrap">
      <div className="progress-ring">
        <svg width="120" height="120" aria-hidden="true">
          <circle className="track" cx="60" cy="60" r={r} />
          <circle
            className="fill"
            cx="60"
            cy="60"
            r={r}
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="val">{Math.round(clamped)}%</div>
      </div>
      {label && <div className="progress-label">{label}</div>}
    </div>
  );
}
