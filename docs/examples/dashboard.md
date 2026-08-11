# Dashboard example

```tsx
import "@kamod-ch/charts/theme.css";
import { BarChart, LineChart, PieChart, ScatterChart } from "@kamod-ch/charts";

export function Dashboard({ data }) {
  return (
    <div class="grid gap-4 md:grid-cols-2">
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", label: "Revenue" }]}
        height={320}
        showGrid
        showLegend
        tooltip
      />
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue" }, { key: "costs" }]}
        height={320}
        showGrid
      />
      <ScatterChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "users" }]}
        height={320}
        tooltip
      />
      <PieChart data={data} valueKey="revenue" labelKey="month" height={320} innerRadius={48} />
    </div>
  );
}
```

Include examples for empty data, invalid data, and large datasets by combining `DataTable`, `downsampleByStride`, and chart empty states.
