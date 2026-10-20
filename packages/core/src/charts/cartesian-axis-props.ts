import type { TickCollisionOptions } from "../axes/tick-collision";

export type CartesianAxisCollisionProps = TickCollisionOptions & {
  tickRotation?: number;
};

export const cartesianAxisCollisionProps = ({
  tickCollision,
  maxTickLabelLength,
  maxTickLabelWidth,
  tickRotation,
}: CartesianAxisCollisionProps) => ({
  tickCollision,
  maxTickLabelLength,
  maxTickLabelWidth,
  tickRotation,
});
