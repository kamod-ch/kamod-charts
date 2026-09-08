export type PieSliceRow = {
  name: string;
  value: number;
};

/** Regional parcel volumes for rose / Nightingale-style demos. */
export const regionalParcelVolumes: PieSliceRow[] = [
  { name: "North", value: 420 },
  { name: "South", value: 280 },
  { name: "East", value: 180 },
  { name: "West", value: 95 },
  { name: "Central", value: 62 },
];

/** Hub capacity utilization for carrier donut demo (parcels in thousands). */
export type CarrierCapacityRow = {
  lane: string;
  parcels: number;
};

export const carrierCapacityMix: CarrierCapacityRow[] = [
  { lane: "Allocated", parcels: 7_840 },
  { lane: "Available", parcels: 1_560 },
  { lane: "Maintenance hold", parcels: 420 },
];

export const carrierCapacityTotal = carrierCapacityMix.reduce((sum, row) => sum + row.parcels, 0);

/** Dense category names for outside-label collision demos. */
export const denseChannelMix: PieSliceRow[] = [
  { name: "Organic search (brand)", value: 36 },
  { name: "Partner marketplace", value: 24 },
  { name: "Email nurture", value: 21 },
  { name: "Community referrals", value: 19 },
  { name: "Paid social", value: 14 },
  { name: "Events", value: 11 },
];
