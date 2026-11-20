import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({
  values,
  color,
  height = 40,
  className,
}: {
  values: (number | null)[];
  color: string;
  height?: number;
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div className={className} style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gid})`}
            isAnimationActive={false}
            connectNulls={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
