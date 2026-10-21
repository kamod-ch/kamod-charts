import { describe, expect, it } from "vitest";
import { neutralizeCsvFormulaCell, serializeChartDataCsv } from "../src/export/csv";

const parseCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]!;
    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      fields.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  fields.push(current);
  return fields;
};

describe("serializeChartDataCsv", () => {
  it("quotes delimiters, quotes, and newlines without turning null into zero", () => {
    const csv = serializeChartDataCsv({
      data: [
        { name: 'Say "hi"', note: "a,b", gap: null, value: 3 },
        { name: "line\nbreak", note: "=SUM(1)", gap: undefined, value: Number.NaN },
      ],
      columns: [
        { key: "name", header: "Name", value: (row) => row.name },
        { key: "note", header: "Note", value: (row) => row.note },
        { key: "gap", header: "Gap", value: (row) => row.gap },
        { key: "value", header: "Value", unit: "ms", value: (row) => row.value },
      ],
    });

    expect(csv).toContain("Name,Note,Gap,Value (ms)");
    const row1 = parseCsvLine(csv.split("\n")[1]!);
    expect(row1).toEqual(['Say "hi"', "a,b", "", "3"]);
    expect(csv).toContain('"line\nbreak"');
    expect(csv).toContain("'=SUM(1)");
    expect(csv).not.toContain(",0\n");
  });

  it("supports visible scope with stable column order and unicode", () => {
    const csv = serializeChartDataCsv({
      scope: "visible",
      visibleRowFilter: (row) => row.keep,
      data: [
        { keep: true, label: "café ☕" },
        { keep: false, label: "hidden" },
      ],
      columns: [{ key: "label", header: "Label", value: (row) => row.label }],
    });
    expect(csv).toBe("Label\ncafé ☕\n");
  });

  it("roundtrips neutralized formula cells", () => {
    expect(neutralizeCsvFormulaCell("=1+1")).toBe("'=1+1");
    expect(neutralizeCsvFormulaCell("safe")).toBe("safe");
  });
});
