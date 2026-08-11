import { ComponentChildren, JSX } from 'preact';

type ChartPrimitiveValue = string | number | Date;
type ChartNullableValue<TValue extends ChartPrimitiveValue = ChartPrimitiveValue> = TValue | null | undefined;
type DataAccessor<TDatum, TValue = ChartPrimitiveValue> = Extract<keyof TDatum, string | number> | ((datum: TDatum, index: number) => TValue);
type NumericDataAccessor<TDatum> = DataAccessor<TDatum, number | null | undefined>;
type DomainDataAccessor<TDatum> = DataAccessor<TDatum, ChartNullableValue>;
interface ChartSeries<TDatum> {
    id: string;
    label?: string;
    value: NumericDataAccessor<TDatum>;
    color?: string;
    hidden?: boolean;
}
interface ChartMargin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
interface ChartSize {
    width: number;
    height: number;
}
interface ChartRect extends ChartSize {
    x: number;
    y: number;
}
type ChartOrientation = "vertical" | "horizontal";
type ChartCartesianScaleKind = "linear" | "time" | "band" | "point";
interface ChartInteraction<TDatum> {
    datum: TDatum;
    seriesId: string;
    index: number;
    value: number | null;
    x: number;
    y: number;
    nativeEvent?: PointerEvent | KeyboardEvent;
}
interface ChartAccessibilityOptions {
    id?: string;
    title?: string;
    description?: string;
    labelledBy?: string;
    describedBy?: string;
    role?: "img" | "group";
}
interface ChartDimensionsInput {
    width?: number;
    height: number;
    initialWidth?: number;
    responsive?: boolean;
}
interface ChartRootProps<TDatum> extends ChartDimensionsInput, ChartAccessibilityOptions {
    data: readonly TDatum[];
    margin?: Partial<ChartMargin>;
    xKey?: DomainDataAccessor<TDatum>;
    xScale?: ChartCartesianScaleKind;
    children?: ComponentChildren;
    class?: string;
    style?: JSX.CSSProperties | string;
    tabIndex?: number;
    onKeyDown?: JSX.KeyboardEventHandler<SVGSVGElement>;
    onPointerMove?: JSX.PointerEventHandler<SVGSVGElement>;
    onPointerLeave?: JSX.PointerEventHandler<SVGSVGElement>;
    overlay?: ComponentChildren;
    emptyState?: ComponentChildren;
}
interface ChartContextValue<TDatum> {
    data: readonly TDatum[];
    ids: {
        root: string;
        title: string;
        description: string;
    };
    margin: ChartMargin;
    size: ChartSize;
    plotArea: ChartRect;
    isEmpty: boolean;
    xKey?: DomainDataAccessor<TDatum>;
    xScale?: ChartCartesianScaleKind;
}

export type { ChartAccessibilityOptions as C, DataAccessor as D, NumericDataAccessor as N, ChartCartesianScaleKind as a, ChartContextValue as b, ChartDimensionsInput as c, ChartInteraction as d, ChartMargin as e, ChartNullableValue as f, ChartOrientation as g, ChartPrimitiveValue as h, ChartRect as i, ChartRootProps as j, ChartSeries as k, ChartSize as l, DomainDataAccessor as m };
