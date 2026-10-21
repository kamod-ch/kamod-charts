# Chart data CSV export

`serializeChartDataCsv` and `downloadChartDataCsv` live in `@kamod-ch/charts/export`. They serialize **source rows** passed to charts, not SVG markup or downsampled geometry.

## Scope

| `scope`   | Behavior                                                                   |
| --------- | -------------------------------------------------------------------------- |
| `all`     | Every row in `data` (default).                                             |
| `visible` | Rows where `visibleRowFilter(row, index)` is true (e.g. current viewport). |

## Columns

Define stable headers, optional units, and per-row accessors:

```ts
import { serializeChartDataCsv, downloadChartDataCsv } from "@kamod-ch/charts/export";

const csv = serializeChartDataCsv({
  data: rows,
  scope: "all",
  columns: [
    { key: "t", header: "time", unit: "iso", value: (row) => row.t },
    { key: "cpu", header: "cpu", unit: "%", value: (row) => row.cpuPercent },
  ],
});

downloadChartDataCsv(csv, "metrics.csv");
```

- `null` / `undefined` / non-finite numbers → empty cells (never coerced to `0`).
- `Date` values default to ISO-8601 strings.
- RFC4180 quoting for commas, quotes, and newlines.

## Spreadsheet formula injection

Untrusted string cells that start with `=`, `+`, `-`, `@`, tab, or carriage return are prefixed with `'` by default (`neutralizeFormulaInjection: true`). The prefix is intentional and documented so security reviewers know the transformation is applied.

Disable only for trusted, fully controlled data:

```ts
serializeChartDataCsv({ /* ... */, neutralizeFormulaInjection: false });
```

Use `neutralizeCsvFormulaCell` directly when building custom export pipelines.
