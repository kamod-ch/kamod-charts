import type { ComponentChildren } from "preact";
import { defaultEmptyState } from "../core/chart";

export const resolveCartesianEmptyState = (emptyContent?: ComponentChildren) => {
  if (emptyContent === undefined) {
    return defaultEmptyState;
  }

  return (
    <foreignObject width="100%" height="100%" x="0" y="0">
      <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;text-align:center;padding:1rem;box-sizing:border-box;">
        {emptyContent}
      </div>
    </foreignObject>
  );
};
