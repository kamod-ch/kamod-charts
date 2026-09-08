export type RevenueSegment = {
  product: string;
  revenue: number;
};

/** Quarterly revenue mix with long category names for legend wrapping demos. */
export const revenueSegments: RevenueSegment[] = [
  { product: "Enterprise subscriptions", revenue: 420 },
  { product: "Professional services", revenue: 280 },
  { product: "Marketplace transaction fees", revenue: 190 },
  { product: "Partner referral commissions", revenue: 110 },
];

export type StorageQuotaRow = {
  label: string;
  gigabytes: number;
};

/** Used vs available storage for KPI ring demos (680 / 1000 = 68%). */
export const storageQuota: StorageQuotaRow[] = [
  { label: "Used", gigabytes: 680 },
  { label: "Available", gigabytes: 320 },
];

export type HalfYearProgressRow = {
  quarter: string;
  amount: number;
};

/** Semicircle progress split for half-donut demos. */
export const halfYearProgress: HalfYearProgressRow[] = [
  { quarter: "Closed won", amount: 42 },
  { quarter: "Pipeline", amount: 58 },
];
