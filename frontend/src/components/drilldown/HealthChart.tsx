import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { HealthRecord } from "@/types/app";

interface HealthChartProps {
  history: HealthRecord[];
}

export function HealthChart({ history }: HealthChartProps) {
  // Reverse so oldest is first (left side of chart)
  const data = [...history]
    .reverse()
    .map((r) => ({
      time: new Date(r.checked_at).toLocaleTimeString(),
      response_time: r.response_time_ms,
      status: r.status,
    }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-grv-fg3 text-sm">
        No history data yet
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--bg2)" />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--fg2)", fontSize: 10 }}
            stroke="var(--bg2)"
          />
          <YAxis
            tick={{ fill: "var(--fg2)", fontSize: 10 }}
            stroke="var(--bg2)"
            label={{
              value: "ms",
              angle: -90,
              position: "insideLeft",
              style: { fill: "var(--fg3)", fontSize: 10 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg1)",
              border: "1px solid var(--bg2)",
              borderRadius: "6px",
              color: "var(--fg)",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="response_time"
            stroke="var(--blue)"
            strokeWidth={2}
            dot={false}
            name="Response Time"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
