import { useState } from "preact/hooks";
import { LineChart } from "@kamod-ch/charts/line-chart";

const data = Array.from({ length: 120 }, (_, index) => ({
  t: new Date(Date.UTC(2024, 0, 1, 0, index)),
  value: 40 + Math.sin(index / 5) * 15,
}));

export const ViewportFixture = () => {
  const [narrow, setNarrow] = useState(false);
  return (
    <div>
      <button type="button" data-testid="toggle-width" onClick={() => setNarrow((value) => !value)}>
        Toggle width
      </button>
      <LineChart
        data={data}
        xKey="t"
        xScale="time"
        xViewportInteraction={{ wheelZoom: "modifier" }}
        series={[{ key: "value", id: "v", label: "Value" }]}
        width={narrow ? 420 : 720}
        height={280}
        showGrid
        tooltip
        title="Viewport interaction fixture"
        description="Drag to pan; Alt+wheel to zoom; R resets."
      />
    </div>
  );
};
