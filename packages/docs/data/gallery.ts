export type ChartKind = "line" | "area" | "bar" | "pie" | "donut" | "scatter";

export type GalleryExample = {
  id: string;
  title: string;
  description: string;
  kind: ChartKind;
  href: string;
  tags: Array<
    | "basic"
    | "series"
    | "colors"
    | "responsive"
    | "tooltip"
    | "legend"
    | "empty"
    | "sizeKey"
    | "categoryKey"
    | "referenceAreas"
  >;
};

export const galleryExamples: GalleryExample[] = [
  {
    id: "line-basic",
    title: "Revenue over time",
    description: "Single-series line for monthly revenue.",
    kind: "line",
    href: "/charts/line#basic",
    tags: ["basic", "tooltip"],
  },
  {
    id: "line-multi",
    title: "Revenue vs customers",
    description: "Multiple series with legend and tooltip.",
    kind: "line",
    href: "/charts/line#multiple-series",
    tags: ["series", "legend", "tooltip"],
  },
  {
    id: "area-basic",
    title: "Smooth revenue area",
    description: "Filled area with monotoneX smoothing.",
    kind: "area",
    href: "/charts/area#basic-smooth",
    tags: ["basic"],
  },
  {
    id: "area-stacked",
    title: "Stacked costs",
    description: "Stacked areas for revenue and costs.",
    kind: "area",
    href: "/charts/area#stacked",
    tags: ["series", "tooltip"],
  },
  {
    id: "area-gradient",
    title: "Gradient fill",
    description: "Theme-aware vertical gradient fade.",
    kind: "area",
    href: "/charts/area#gradient-fill",
    tags: ["colors"],
  },
  {
    id: "area-markers",
    title: "Point markers",
    description: "Area series with showPoints enabled.",
    kind: "area",
    href: "/charts/area#markers-on",
    tags: ["tooltip"],
  },
  {
    id: "bar-sized-vertical",
    title: "Sized vertical bars",
    description: "maxBarSize cap with rounded corners.",
    kind: "bar",
    href: "/charts/bar#sized-vertical",
    tags: ["basic", "responsive"],
  },
  {
    id: "bar-horizontal-labels",
    title: "Horizontal categories",
    description: "Long labels on the Y axis.",
    kind: "bar",
    href: "/charts/bar#horizontal-long-labels",
    tags: ["basic"],
  },
  {
    id: "bar-grouped-legend",
    title: "Grouped with legend",
    description: "Multi-series side-by-side with toggles.",
    kind: "bar",
    href: "/charts/bar#grouped-legend",
    tags: ["series", "legend", "tooltip"],
  },
  {
    id: "bar-stacked",
    title: "Stacked composition",
    description: "Part-to-whole bars per category.",
    kind: "bar",
    href: "/charts/bar#stacked-series",
    tags: ["series", "tooltip"],
  },
  {
    id: "bar-signed-fill",
    title: "Signed fill accessor",
    description: "Per-bar color with explicit sign labels.",
    kind: "bar",
    href: "/charts/bar#signed-fill",
    tags: ["colors"],
  },
  {
    id: "bar-value-labels",
    title: "Formatted labels",
    description: "Outside labels with custom format.",
    kind: "bar",
    href: "/charts/bar#value-labels",
    tags: ["tooltip"],
  },
  {
    id: "bar-stacked-compact",
    title: "Compact stacked tile",
    description: "Short frame with legend and tooltip.",
    kind: "bar",
    href: "/charts/bar#stacked-compact",
    tags: ["series", "legend", "tooltip", "responsive"],
  },
  {
    id: "bar-carrier-mtd",
    title: "MTD reference band",
    description: "Category highlight behind grouped bars.",
    kind: "bar",
    href: "/charts/bar#carrier-mtd",
    tags: ["series", "legend"],
  },
  {
    id: "pie-basic",
    title: "Legend and tooltip",
    description: "Basic pie with Intl-formatted value and percent tooltips.",
    kind: "pie",
    href: "/charts/pie#basic",
    tags: ["legend", "tooltip"],
  },
  {
    id: "pie-donut",
    title: "Donut innerRadius",
    description: "Donut hole via innerRadius with outside labels.",
    kind: "pie",
    href: "/charts/pie#donut",
    tags: ["colors"],
  },
  {
    id: "pie-rose",
    title: "Rose chart",
    description: "Equal angles with sqrt-scaled radii.",
    kind: "pie",
    href: "/charts/pie#rose",
    tags: ["basic", "tooltip"],
  },
  {
    id: "pie-carrier",
    title: "Carrier capacity",
    description: "Operational donut with center utilization KPI.",
    kind: "pie",
    href: "/charts/pie#carrier-capacity",
    tags: ["legend", "colors"],
  },
  {
    id: "donut-revenue",
    title: "Revenue split",
    description: "Full donut with outside labels, legend, and tooltip.",
    kind: "donut",
    href: "/charts/donut#revenue-split",
    tags: ["legend", "tooltip", "responsive"],
  },
  {
    id: "donut-kpi",
    title: "KPI storage ring",
    description: "Used vs available with center utilization label.",
    kind: "donut",
    href: "/charts/donut#kpi-ring",
    tags: ["colors"],
  },
  {
    id: "donut-half",
    title: "Half-year progress",
    description: "Semicircle with total below the arc.",
    kind: "donut",
    href: "/charts/donut#half-donut",
    tags: ["legend", "tooltip"],
  },
  {
    id: "scatter-basic",
    title: "Basic scatter",
    description: "Default markers with grid and tooltip.",
    kind: "scatter",
    href: "/charts/scatter#basic",
    tags: ["basic"],
  },
  {
    id: "scatter-bubble",
    title: "Sized bubbles",
    description: "sqrt-scaled radius from a third numeric field.",
    kind: "scatter",
    href: "/charts/scatter#bubble-sized",
    tags: ["sizeKey"],
  },
  {
    id: "scatter-cargo",
    title: "Air cargo lanes",
    description: "Rate vs transit with tonnage and region color.",
    kind: "scatter",
    href: "/charts/scatter#air-cargo-rate",
    tags: ["categoryKey", "referenceAreas"],
  },
  {
    id: "line-empty",
    title: "Empty state",
    description: "Default empty rendering when data is missing.",
    kind: "line",
    href: "/charts/line#empty-state",
    tags: ["empty"],
  },
  {
    id: "line-responsive",
    title: "Responsive line",
    description: "Charts that follow container width.",
    kind: "line",
    href: "/foundations/responsive-charts",
    tags: ["responsive"],
  },
  {
    id: "bar-colors",
    title: "Custom palette",
    description: "Series colors via CSS chart tokens.",
    kind: "bar",
    href: "/foundations/colors-and-themes",
    tags: ["colors"],
  },
];
