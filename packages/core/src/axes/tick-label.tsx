import type { JSX } from "preact";

export const AxisTickText = ({
  displayText,
  fullText,
  ...rest
}: {
  displayText: string;
  fullText: string;
} & JSX.IntrinsicElements["text"]) => (
  <text {...rest}>
    {displayText}
    {displayText !== fullText ? <title>{fullText}</title> : null}
  </text>
);
