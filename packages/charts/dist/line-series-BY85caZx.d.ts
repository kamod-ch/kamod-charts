import * as preact from 'preact';
import { CurveFactory } from 'd3-shape';
import { D as DataAccessor } from './types-CzGslxWS.js';
import { S as ScaleKind } from './domain-COQUkiLk.js';

type LineCurve = "linear" | "monotoneX" | "basis" | CurveFactory;
interface LineSeriesProps<TDatum> {
    dataKey: DataAccessor<TDatum, number | null | undefined>;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ScaleKind;
    xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    yDomain?: readonly [number, number];
    id?: string;
    color?: string;
    strokeWidth?: number;
    curve?: LineCurve;
    connectNulls?: boolean;
    showPoints?: boolean | "auto";
    activeIndex?: number | null;
    class?: string;
}
declare const LineSeries: <TDatum>({ dataKey, xKey, xScale, xDomain, yDomain, id, color, strokeWidth, curve, connectNulls, showPoints, activeIndex, class: className, }: LineSeriesProps<TDatum>) => preact.JSX.Element;

export { type LineCurve as L, LineSeries as a, type LineSeriesProps as b };
