import { useState } from "preact/hooks";
import { BarChart } from "@kamod-ch/charts/bar-chart";

interface Row {
  category: string;
  value: number;
}

const data: Row[] = [
  { category: "Alpha", value: 42 },
  { category: "Beta", value: 28 },
];

export const BarFixture = ({ mode }: { mode: "vertical" | "horizontal" }) => {
  const [result, setResult] = useState("");

  return (
    <div data-testid="bar-fixture" data-orientation={mode}>
      <p data-testid="bar-click-result">{result}</p>
      <BarChart
        data={data}
        xKey="category"
        height={280}
        width={400}
        title="Fixture bar chart"
        description="Browser fixture for Playwright smoke tests"
        tooltip
        orientation={mode}
        series={[{ key: "value", label: "Value", color: "var(--chart-1)" }]}
        onBarClick={(_datum, seriesId, index, value) => {
          setResult(`${seriesId}:${index}:${value}`);
        }}
      />
    </div>
  );
};
