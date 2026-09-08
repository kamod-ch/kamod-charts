export type AreaGradientDirection = "top-to-bottom" | "bottom-to-top" | "left-to-right";

export interface AreaGradientFill {
  type: "gradient";
  direction?: AreaGradientDirection;
  fromOpacity?: number;
  toOpacity?: number;
}

export type AreaFill = "solid" | AreaGradientFill;

export const isAreaGradientFill = (fill: AreaFill): fill is AreaGradientFill =>
  fill !== "solid" && fill.type === "gradient";
