export type MonthlyMetric = {
  month: string;
  date: Date;
  revenue: number;
  customers: number;
  costs: number | null;
};

export type TrafficSource = {
  name: string;
  value: number;
};

export type ConversionPoint = {
  visitors: number;
  conversion: number;
  plan: string;
};

export type DeploymentRow = {
  day: string;
  deploys: number;
  failures: number;
};

const month = (year: number, m: number, day = 1) => new Date(Date.UTC(year, m, day));

export const monthlyMetrics: MonthlyMetric[] = [
  { month: "Jan", date: month(2024, 0), revenue: 28_400, customers: 1_120, costs: 14_200 },
  { month: "Feb", date: month(2024, 1), revenue: 31_200, customers: 1_240, costs: 15_100 },
  { month: "Mar", date: month(2024, 2), revenue: 36_800, customers: 1_380, costs: 16_400 },
  { month: "Apr", date: month(2024, 3), revenue: 34_100, customers: 1_410, costs: 15_900 },
  { month: "May", date: month(2024, 4), revenue: 41_600, customers: 1_560, costs: 17_800 },
  { month: "Jun", date: month(2024, 5), revenue: 48_200, customers: 1_720, costs: 19_200 },
  { month: "Jul", date: month(2024, 6), revenue: 46_500, customers: 1_790, costs: 18_700 },
  { month: "Aug", date: month(2024, 7), revenue: 52_100, customers: 1_910, costs: 20_400 },
  { month: "Sep", date: month(2024, 8), revenue: 49_800, customers: 1_980, costs: 19_900 },
  { month: "Oct", date: month(2024, 9), revenue: 55_400, customers: 2_080, costs: 21_100 },
  { month: "Nov", date: month(2024, 10), revenue: 58_900, customers: 2_210, costs: 22_300 },
  { month: "Dec", date: month(2024, 11), revenue: 61_200, customers: 2_340, costs: 23_000 },
];

export const halfYearMetrics = monthlyMetrics.slice(0, 6);

export const sparseMetrics: MonthlyMetric[] = [
  { month: "Jan", date: month(2024, 0), revenue: 28_400, customers: 1_120, costs: 14_200 },
  { month: "Feb", date: month(2024, 1), revenue: 31_200, customers: 1_240, costs: null },
  { month: "Mar", date: month(2024, 2), revenue: 36_800, customers: 1_380, costs: 16_400 },
  { month: "Apr", date: month(2024, 3), revenue: 34_100, customers: 1_410, costs: null },
  { month: "May", date: month(2024, 4), revenue: 41_600, customers: 1_560, costs: 17_800 },
  { month: "Jun", date: month(2024, 5), revenue: 48_200, customers: 1_720, costs: 19_200 },
];

export const emptyMetrics: MonthlyMetric[] = [];

export const trafficSources: TrafficSource[] = [
  { name: "Organic", value: 42 },
  { name: "Direct", value: 28 },
  { name: "Referral", value: 18 },
  { name: "Paid", value: 12 },
];

export const conversionPoints: ConversionPoint[] = [
  { visitors: 420, conversion: 4.2, plan: "Free" },
  { visitors: 680, conversion: 6.1, plan: "Free" },
  { visitors: 910, conversion: 7.4, plan: "Starter" },
  { visitors: 1_240, conversion: 8.9, plan: "Starter" },
  { visitors: 1_580, conversion: 9.6, plan: "Pro" },
  { visitors: 1_920, conversion: 11.2, plan: "Pro" },
  { visitors: 2_310, conversion: 10.4, plan: "Pro" },
  { visitors: 2_780, conversion: 12.8, plan: "Business" },
  { visitors: 3_150, conversion: 13.5, plan: "Business" },
  { visitors: 3_640, conversion: 14.1, plan: "Business" },
];

export const weeklyDeployments: DeploymentRow[] = [
  { day: "Mon", deploys: 12, failures: 1 },
  { day: "Tue", deploys: 18, failures: 2 },
  { day: "Wed", deploys: 15, failures: 0 },
  { day: "Thu", deploys: 22, failures: 3 },
  { day: "Fri", deploys: 19, failures: 1 },
  { day: "Sat", deploys: 8, failures: 0 },
  { day: "Sun", deploys: 6, failures: 0 },
];

export const longLabelTraffic: TrafficSource[] = [
  { name: "Organic search (brand)", value: 36 },
  { name: "Partner marketplace", value: 24 },
  { name: "Email nurture", value: 21 },
  { name: "Community referrals", value: 19 },
];

export const chartColors = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  tertiary: "var(--chart-3)",
  quaternary: "var(--chart-4)",
} as const;

/** Extended monthly rows used for forecast-style area examples. */
export const projectedRevenueMetrics: MonthlyMetric[] = [
  ...halfYearMetrics,
  { month: "Jul", date: month(2024, 6), revenue: 50_500, customers: 1_850, costs: 20_100 },
  { month: "Aug", date: month(2024, 7), revenue: 53_800, customers: 1_920, costs: 20_600 },
];
