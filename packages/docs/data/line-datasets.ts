const day = (year: number, month: number, dayOfMonth: number) =>
  new Date(Date.UTC(year, month, dayOfMonth));

export type ActualForecastRow = {
  month: string;
  date: Date;
  actual: number | null;
  forecast: number | null;
};

/** Half-year actuals plus projected months for forecast-style line demos. */
export const actualVsForecast: ActualForecastRow[] = [
  { month: "Jan", date: day(2025, 0, 1), actual: 38_200, forecast: null },
  { month: "Feb", date: day(2025, 1, 1), actual: 41_500, forecast: null },
  { month: "Mar", date: day(2025, 2, 1), actual: 39_800, forecast: null },
  { month: "Apr", date: day(2025, 3, 1), actual: 44_600, forecast: null },
  { month: "May", date: day(2025, 4, 1), actual: 47_900, forecast: null },
  { month: "Jun", date: day(2025, 5, 1), actual: 46_200, forecast: null },
  { month: "Jul", date: day(2025, 6, 1), actual: null, forecast: 49_500 },
  { month: "Aug", date: day(2025, 7, 1), actual: null, forecast: 52_800 },
  { month: "Sep", date: day(2025, 8, 1), actual: null, forecast: 54_100 },
];

export type ChannelStackRow = {
  month: string;
  direct: number;
  partner: number;
  marketplace: number;
};

export const channelStackMetrics: ChannelStackRow[] = [
  { month: "Jan", direct: 18, partner: 12, marketplace: 8 },
  { month: "Feb", direct: 20, partner: 14, marketplace: 9 },
  { month: "Mar", direct: 22, partner: 13, marketplace: 11 },
  { month: "Apr", direct: 24, partner: 15, marketplace: 10 },
  { month: "May", direct: 26, partner: 16, marketplace: 12 },
  { month: "Jun", direct: 28, partner: 18, marketplace: 13 },
];

export type ThroughputRow = {
  week: string;
  date: Date;
  throughput: number;
  capacity: number;
};

/** Weekly throughput with discrete capacity step changes. */
export const throughputMetrics: ThroughputRow[] = [
  { week: "W1", date: day(2025, 2, 3), throughput: 780, capacity: 800 },
  { week: "W2", date: day(2025, 2, 10), throughput: 810, capacity: 800 },
  { week: "W3", date: day(2025, 2, 17), throughput: 835, capacity: 900 },
  { week: "W4", date: day(2025, 2, 24), throughput: 860, capacity: 900 },
  { week: "W5", date: day(2025, 3, 3), throughput: 905, capacity: 900 },
  { week: "W6", date: day(2025, 3, 10), throughput: 940, capacity: 1_000 },
  { week: "W7", date: day(2025, 3, 17), throughput: 965, capacity: 1_000 },
  { week: "W8", date: day(2025, 3, 24), throughput: 990, capacity: 1_000 },
];

export type ReleaseTimelineRow = {
  label: string;
  date: Date;
  adoption: number;
};

/** Daily adoption curve around a product launch window. */
export const releaseTimeline: ReleaseTimelineRow[] = [
  { label: "Mon", date: day(2025, 5, 2), adoption: 120 },
  { label: "Tue", date: day(2025, 5, 3), adoption: 145 },
  { label: "Wed", date: day(2025, 5, 4), adoption: 210 },
  { label: "Thu", date: day(2025, 5, 5), adoption: 380 },
  { label: "Fri", date: day(2025, 5, 6), adoption: 520 },
  { label: "Sat", date: day(2025, 5, 7), adoption: 610 },
  { label: "Sun", date: day(2025, 5, 8), adoption: 680 },
  { label: "Mon", date: day(2025, 5, 9), adoption: 740 },
  { label: "Tue", date: day(2025, 5, 10), adoption: 790 },
];

export const launchWindow = {
  start: day(2025, 5, 4),
  end: day(2025, 5, 7),
} as const;
