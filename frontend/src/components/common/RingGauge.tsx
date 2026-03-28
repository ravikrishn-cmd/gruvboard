interface RingGaugeProps {
  value: number;
  label: string;
  detail?: string;
  size?: number;
}

const RADIUS = 11;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getColor(value: number): string {
  if (value >= 90) return "var(--red)";
  if (value >= 75) return "var(--orange)";
  if (value >= 50) return "var(--yellow)";
  return "var(--green)";
}

export function RingGauge({ value, label, detail, size = 32 }: RingGaugeProps) {
  const offset = CIRCUMFERENCE - (Math.min(value, 100) / 100) * CIRCUMFERENCE;

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 28 28"
          width={size}
          height={size}
          className="-rotate-90"
        >
          <circle
            cx="14"
            cy="14"
            r={RADIUS}
            fill="none"
            strokeWidth={3}
            className="stroke-grv-bg2"
          />
          <circle
            cx="14"
            cy="14"
            r={RADIUS}
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            stroke={getColor(value)}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-semibold text-grv-fg1 font-mono">
          {value.toFixed(0)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-medium text-grv-fg2">{label}</span>
        {detail && (
          <span className="text-[10px] text-grv-fg3 font-mono">{detail}</span>
        )}
      </div>
    </div>
  );
}
