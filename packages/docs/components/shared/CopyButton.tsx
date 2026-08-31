import { Button } from "@kamod-ch/ui";
import { CheckIcon, CopyIcon } from "@kamod-ch/icons/shadcn";
import { useState } from "preact/hooks";
import type { JSX } from "preact";

type CopyButtonProps = {
  value: string;
  class?: string;
  label?: string;
};

export function CopyButton({
  value,
  class: className,
  label = "Copy",
}: CopyButtonProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      class={className}
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <CheckIcon class="size-4" /> : <CopyIcon class="size-4" />}
      <span class="ml-1.5">{copied ? "Copied" : label}</span>
    </Button>
  );
}
