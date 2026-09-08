export type ShipmentWeek = {
  week: string;
  onTime: number;
  late: number;
  damaged: number;
};

export type AcquisitionChannel = {
  channel: string;
  signups: number;
};

export type CashflowRow = {
  period: string;
  balance: number;
};

export type ProductMixRow = {
  segment: string;
  units: number;
  returns: number;
};

export const shipmentWeeks: ShipmentWeek[] = [
  { week: "W01", onTime: 920, late: 48, damaged: 12 },
  { week: "W02", onTime: 880, late: 62, damaged: 18 },
  { week: "W03", onTime: 940, late: 35, damaged: 9 },
  { week: "W04", onTime: 905, late: 51, damaged: 14 },
];

export const acquisitionChannels: AcquisitionChannel[] = [
  { channel: "Organic search (brand terms)", signups: 1840 },
  { channel: "Partner marketplace listings", signups: 1260 },
  { channel: "Lifecycle email nurture", signups: 980 },
  { channel: "Community ambassador referrals", signups: 740 },
  { channel: "Paid social retargeting", signups: 620 },
];

export const cashflowLedger: CashflowRow[] = [
  { period: "Jan", balance: 24 },
  { period: "Feb", balance: -11 },
  { period: "Mar", balance: 17 },
  { period: "Apr", balance: -8 },
  { period: "May", balance: 31 },
  { period: "Jun", balance: 12 },
];

export const productMix: ProductMixRow[] = [
  { segment: "Core", units: 420, returns: 18 },
  { segment: "Plus", units: 280, returns: 12 },
  { segment: "Enterprise", units: 160, returns: 6 },
  { segment: "Trials", units: 95, returns: 22 },
];
