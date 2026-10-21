export type CsvExportScope = "all" | "visible";

export type CsvCellValue = string | number | Date | null | undefined;

export interface CsvColumn<TDatum> {
  /** Stable column id (header row). */
  key: string;
  header: string;
  unit?: string;
  value: (row: TDatum, rowIndex: number) => CsvCellValue;
}

export interface SerializeChartDataCsvOptions<TDatum> {
  data: readonly TDatum[];
  columns: readonly CsvColumn<TDatum>[];
  /** `visible` applies `visibleRowFilter` when provided. Default: `all`. */
  scope?: CsvExportScope;
  visibleRowFilter?: (row: TDatum, rowIndex: number) => boolean;
  /** Default: `,` */
  delimiter?: string;
  /**
   * Neutralize spreadsheet formula injection for untrusted string cells by prefixing
   * values that start with `=`, `+`, `-`, `@`, tab, or carriage return.
   * Default: `true`.
   */
  neutralizeFormulaInjection?: boolean;
  /** ISO-8601 for `Date` values. Default: `true`. */
  isoDates?: boolean;
}

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export const neutralizeCsvFormulaCell = (value: string): string => {
  if (FORMULA_PREFIX.test(value)) {
    return `'${value}`;
  }
  return value;
};

const escapeCsvField = (raw: string, delimiter: string): string => {
  const needsQuotes =
    raw.includes('"') || raw.includes("\n") || raw.includes("\r") || raw.includes(delimiter);
  if (!needsQuotes) {
    return raw;
  }
  return `"${raw.replace(/"/g, '""')}"`;
};

const formatCsvCell = (
  value: CsvCellValue,
  options: { isoDates: boolean; neutralizeFormulaInjection: boolean },
): string => {
  if (value == null) {
    return "";
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }
    return options.isoDates ? value.toISOString() : String(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "";
    }
    return String(value);
  }
  const stringValue = String(value);
  return options.neutralizeFormulaInjection ? neutralizeCsvFormulaCell(stringValue) : stringValue;
};

const headerLabel = (column: CsvColumn<unknown>): string =>
  column.unit ? `${column.header} (${column.unit})` : column.header;

/** Serializes chart **source** rows to CSV (not geometry or downsampled paths). */
export const serializeChartDataCsv = <TDatum>(
  options: SerializeChartDataCsvOptions<TDatum>,
): string => {
  const delimiter = options.delimiter ?? ",";
  const scope = options.scope ?? "all";
  const isoDates = options.isoDates ?? true;
  const neutralizeFormulaInjection = options.neutralizeFormulaInjection ?? true;

  const rows: TDatum[] = [];
  options.data.forEach((row, rowIndex) => {
    if (
      scope === "visible" &&
      options.visibleRowFilter &&
      !options.visibleRowFilter(row, rowIndex)
    ) {
      return;
    }
    rows.push(row);
  });

  const formatOptions = { isoDates, neutralizeFormulaInjection };
  const lines: string[] = [];
  lines.push(
    options.columns
      .map((column) => escapeCsvField(headerLabel(column as CsvColumn<unknown>), delimiter))
      .join(delimiter),
  );

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]!;
    const fields = options.columns.map((column) => {
      const cell = formatCsvCell(column.value(row, rowIndex), formatOptions);
      return escapeCsvField(cell, delimiter);
    });
    lines.push(fields.join(delimiter));
  }

  return `${lines.join("\n")}\n`;
};

export const downloadChartDataCsv = (
  csv: string,
  filename: string,
  options: { revokeDelayMs?: number } = {},
): void => {
  if (typeof globalThis.document === "undefined") {
    throw new Error("[kamod-charts] downloadChartDataCsv requires a browser environment.");
  }
  if (typeof globalThis.URL?.createObjectURL !== "function") {
    throw new Error("[kamod-charts] downloadChartDataCsv requires URL.createObjectURL.");
  }

  const trimmed = filename.trim() || "chart-data.csv";
  const safe = trimmed.replace(/\.csv$/i, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
  const downloadName = `${safe || "chart-data"}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const objectUrl = globalThis.URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = downloadName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  globalThis.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  const revokeDelayMs = options.revokeDelayMs ?? 60_000;
  globalThis.setTimeout(() => {
    globalThis.URL.revokeObjectURL(objectUrl);
  }, revokeDelayMs);
};
