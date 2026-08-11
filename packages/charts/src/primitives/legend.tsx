export interface LegendItem {
  id: string;
  label?: string;
  color?: string;
  hidden?: boolean;
}

export interface LegendProps {
  items: readonly LegendItem[];
  onToggle?: (id: string) => void;
}

export const Legend = ({ items, onToggle }: LegendProps) => (
  <div
    data-kamod-chart-legend=""
    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}
  >
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        data-kamod-chart-legend-item=""
        aria-pressed={!item.hidden}
        onClick={onToggle ? () => onToggle(item.id) : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          opacity: item.hidden ? 0.45 : 1,
          background: "transparent",
          border: "0",
          color: "inherit",
          cursor: onToggle ? "pointer" : "default",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: "0.75rem",
            height: "0.75rem",
            background: item.color ?? "var(--chart-1)",
            borderRadius: "999px",
          }}
        />
        {item.label ?? item.id}
      </button>
    ))}
  </div>
);
