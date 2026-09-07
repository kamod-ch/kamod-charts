export interface ChartDescriptionInput {
  title?: string;
  description?: string;
  dataCount?: number;
  seriesCount?: number;
}

export const buildChartDescription = ({
  title,
  description,
  dataCount,
  seriesCount,
}: ChartDescriptionInput): string =>
  [
    title,
    description,
    dataCount == null ? undefined : `${dataCount} Datenpunkte`,
    seriesCount == null ? undefined : `${seriesCount} Serien`,
  ]
    .filter(Boolean)
    .join(". ");
