export type AirCargoLane = {
  lane: string;
  transitDays: number;
  rateUsdPerKg: number;
  tonnage: number;
  region: string;
};

/** Operational air-cargo lanes for rate vs transit-time scatter demos. */
export const airCargoLanes: AirCargoLane[] = [
  {
    lane: "FRA → JFK",
    transitDays: 2,
    rateUsdPerKg: 4.85,
    tonnage: 128,
    region: "Transatlantic",
  },
  {
    lane: "FRA → ORD",
    transitDays: 3,
    rateUsdPerKg: 3.95,
    tonnage: 94,
    region: "Transatlantic",
  },
  {
    lane: "LHR → DXB",
    transitDays: 4,
    rateUsdPerKg: 3.2,
    tonnage: 156,
    region: "Middle East & Africa",
  },
  {
    lane: "AMS → HKG",
    transitDays: 5,
    rateUsdPerKg: 2.75,
    tonnage: 210,
    region: "Asia-Pacific",
  },
  {
    lane: "CDG → PVG",
    transitDays: 6,
    rateUsdPerKg: 2.45,
    tonnage: 182,
    region: "Asia-Pacific",
  },
  {
    lane: "MUC → SIN",
    transitDays: 5,
    rateUsdPerKg: 2.6,
    tonnage: 118,
    region: "Asia-Pacific",
  },
  {
    lane: "FRA → GRU",
    transitDays: 7,
    rateUsdPerKg: 3.55,
    tonnage: 76,
    region: "Latin America",
  },
  {
    lane: "VIE → IST",
    transitDays: 2,
    rateUsdPerKg: 2.15,
    tonnage: 64,
    region: "Intra-Europe",
  },
  {
    lane: "ZRH → JNB",
    transitDays: 8,
    rateUsdPerKg: 4.1,
    tonnage: 52,
    region: "Middle East & Africa",
  },
  {
    lane: "LHR → LAX",
    transitDays: 3,
    rateUsdPerKg: 4.25,
    tonnage: 142,
    region: "Transatlantic",
  },
  {
    lane: "FRA → NRT",
    transitDays: 6,
    rateUsdPerKg: 2.9,
    tonnage: 98,
    region: "Asia-Pacific",
  },
  {
    lane: "AMS → JFK",
    transitDays: 2,
    rateUsdPerKg: 5.15,
    tonnage: 88,
    region: "Transatlantic",
  },
];

export const airCargoRegions = [
  { value: "Transatlantic", label: "Transatlantic", color: "var(--chart-1)" },
  { value: "Asia-Pacific", label: "Asia-Pacific", color: "var(--chart-2)" },
  {
    value: "Middle East & Africa",
    label: "Middle East & Africa",
    color: "var(--chart-3)",
  },
  { value: "Latin America", label: "Latin America", color: "var(--chart-4)" },
  { value: "Intra-Europe", label: "Intra-Europe", color: "var(--chart-1)" },
] as const;

/** Precomputed guide segment for the conversion scatter — not a regression fit. */
export const conversionGuideSegment = {
  start: { x: 420, y: 4.2 },
  end: { x: 3_640, y: 14.1 },
} as const;
