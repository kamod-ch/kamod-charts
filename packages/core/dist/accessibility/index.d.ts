import * as preact from 'preact';
import { D as DataAccessor } from '../types-B2kenooF.js';

interface ChartDescriptionInput {
    title?: string;
    description?: string;
    dataCount?: number;
    seriesCount?: number;
}
declare const buildChartDescription: ({ title, description, dataCount, seriesCount, }: ChartDescriptionInput) => string;

interface DataTableColumn<TDatum> {
    id: string;
    header: string;
    accessor: DataAccessor<TDatum, string | number | Date | null | undefined>;
}
interface DataTableProps<TDatum> {
    data: readonly TDatum[];
    columns: readonly DataTableColumn<TDatum>[];
    caption?: string;
    visuallyHidden?: boolean;
}
declare const DataTable: <TDatum>({ data, columns, caption, visuallyHidden, }: DataTableProps<TDatum>) => preact.JSX.Element;

export { type ChartDescriptionInput, DataTable, type DataTableColumn, type DataTableProps, buildChartDescription };
