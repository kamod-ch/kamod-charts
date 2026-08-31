import { KamodProductLogo } from "@kamod-ch/brand";
import type { JSX } from "preact";

type BrandLogoProps = {
  class?: string;
  label: string;
  base?: string;
};

export function BrandLogo({ class: className, label, base = "/" }: BrandLogoProps): JSX.Element {
  return <KamodProductLogo class={className} label={label} base={base} suffix="Charts" />;
}
