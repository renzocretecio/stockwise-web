import type { ForecastPoint } from "@/modules/dashboard/types";

export function ForecastChart({ points }: { points: ForecastPoint[] }) {
  const width = 720,
    height = 220,
    left = 42,
    right = 16,
    top = 18,
    bottom = 34;
  const values = points
    .flatMap((point) => [point.actual, point.forecast])
    .filter((value): value is number => value !== null);
  const maximum = Math.max(1, ...values);
  const x = (index: number) =>
    left + index * ((width - left - right) / Math.max(1, points.length - 1));
  const y = (value: number) =>
    top + (maximum - value) * ((height - top - bottom) / maximum);
  const line = (field: "actual" | "forecast") =>
    points
      .map((point, index) =>
        point[field] === null
          ? null
          : `${x(index)},${y(point[field] as number)}`,
      )
      .filter(Boolean)
      .join(" ");
  const labels = [0, Math.floor((points.length - 1) / 2), points.length - 1];
  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Historical and forecast daily demand"
      >
        <line
          x1={left}
          y1={height - bottom}
          x2={width - right}
          y2={height - bottom}
          className="stroke-border"
        />
        {[0, 0.5, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1={left}
              y1={top + ratio * (height - top - bottom)}
              x2={width - right}
              y2={top + ratio * (height - top - bottom)}
              className="stroke-border/60"
              strokeDasharray="3 5"
            />
            <text
              x={left - 8}
              y={top + ratio * (height - top - bottom) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {Math.round(maximum * (1 - ratio))}
            </text>
          </g>
        ))}
        <polyline
          points={line("actual")}
          fill="none"
          className="stroke-primary"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={line("forecast")}
          fill="none"
          className="stroke-amber-500"
          strokeWidth="3"
          strokeDasharray="7 6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {labels.map((index) => (
          <text
            key={index}
            x={x(index)}
            y={height - 10}
            textAnchor={
              index === 0
                ? "start"
                : index === points.length - 1
                  ? "end"
                  : "middle"
            }
            className="fill-muted-foreground text-[10px]"
          >
            {new Date(`${points[index].date}T00:00:00`).toLocaleDateString(
              "en-PH",
              { month: "short", day: "numeric" },
            )}
          </text>
        ))}
      </svg>
      <div className="flex justify-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <i className="h-0.5 w-5 bg-primary" />
          Net sales
        </span>
        <span className="flex items-center gap-2">
          <i className="h-0.5 w-5 border-t-2 border-dashed border-amber-500" />
          Forecast
        </span>
      </div>
    </div>
  );
}
