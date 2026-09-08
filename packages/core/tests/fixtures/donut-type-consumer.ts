import type { DataAccessor } from "../../src/core";
import type {
  DonutCenterContext,
  DonutChartProps,
  DonutFormatTotal,
  DonutVariant,
} from "../../src/charts/donut-chart";
import { DonutChart } from "../../src/charts/donut-chart";

type RevenueRow = {
  region: string;
  revenue: number;
  recordedAt: Date;
};

const revenueKey: DataAccessor<RevenueRow, number | null | undefined> = (row, _index) =>
  row.revenue;
const regionKey: DataAccessor<RevenueRow, string | null | undefined> = (row, _index) => row.region;
const dateKey: DataAccessor<RevenueRow, Date | null | undefined> = (row, _index) => row.recordedAt;

const formatTotal: DonutFormatTotal<RevenueRow> = (
  total,
  context: DonutCenterContext<RevenueRow>,
) => `${context.variant}:${total}`;

const variant: DonutVariant = "half";

const props: DonutChartProps<RevenueRow> = {
  data: [{ region: "North", revenue: 42, recordedAt: new Date("2026-01-01") }],
  valueKey: revenueKey,
  labelKey: regionKey,
  height: 280,
  variant,
  formatTotal,
  centerContent: (context) =>
    `${context.visibleCount}/${context.segmentCount}:${dateKey(context.data[0]!, 0)}`,
};

function renderDonut(props: DonutChartProps<RevenueRow>) {
  return DonutChart(props);
}

export { renderDonut, props, variant };
