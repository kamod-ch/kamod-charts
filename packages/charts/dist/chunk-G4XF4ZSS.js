import { normalizeAccessor } from './chunk-B4X27YLI.js';
import { jsxs, jsx } from 'preact/jsx-runtime';

// src/accessibility/chart-description.ts
var buildChartDescription = ({
  title,
  description,
  dataCount,
  seriesCount
}) => [
  title,
  description,
  dataCount == null ? void 0 : `${dataCount} Datenpunkte`,
  seriesCount == null ? void 0 : `${seriesCount} Serien`
].filter(Boolean).join(". ");
var formatCell = (value) => {
  if (value == null) {
    return "";
  }
  return value instanceof Date ? value.toISOString() : String(value);
};
var DataTable = ({
  data,
  columns,
  caption,
  visuallyHidden = false
}) => {
  const tableStyle = visuallyHidden ? {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)"
  } : void 0;
  return /* @__PURE__ */ jsxs("table", { "data-kamod-chart-data-table": "", style: tableStyle, children: [
    caption ? /* @__PURE__ */ jsx("caption", { children: caption }) : null,
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: columns.map((column) => /* @__PURE__ */ jsx("th", { scope: "col", children: column.header }, column.id)) }) }),
    /* @__PURE__ */ jsx("tbody", { children: data.map((datum, rowIndex) => /* @__PURE__ */ jsx("tr", { children: columns.map((column) => {
      const read = normalizeAccessor(column.accessor);
      return /* @__PURE__ */ jsx("td", { children: formatCell(read(datum, rowIndex)) }, column.id);
    }) }, rowIndex)) })
  ] });
};

export { DataTable, buildChartDescription };
//# sourceMappingURL=chunk-G4XF4ZSS.js.map
//# sourceMappingURL=chunk-G4XF4ZSS.js.map