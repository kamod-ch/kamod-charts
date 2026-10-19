import type { DataAccessor } from "../core";
import { normalizeAccessor } from "../core";

export interface DataTableColumn<TDatum> {
  id: string;
  header: string;
  accessor: DataAccessor<TDatum, string | number | Date | null | undefined>;
}

export interface DataTableProps<TDatum> {
  data: readonly TDatum[];
  columns: readonly DataTableColumn<TDatum>[];
  caption?: string;
  visuallyHidden?: boolean;
}

const formatCell = (value: string | number | Date | null | undefined): string => {
  if (value == null) {
    return "";
  }

  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? value.toISOString() : "";
  }

  return String(value);
};

export const DataTable = <TDatum,>({
  data,
  columns,
  caption,
  visuallyHidden = false,
}: DataTableProps<TDatum>) => {
  const tableStyle = visuallyHidden
    ? {
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        clipPath: "inset(50%)",
      }
    : undefined;

  return (
    <table data-kamod-chart-data-table="" style={tableStyle}>
      {caption ? <caption>{caption}</caption> : null}
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((datum, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => {
              const read = normalizeAccessor(column.accessor);
              return <td key={column.id}>{formatCell(read(datum, rowIndex))}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
