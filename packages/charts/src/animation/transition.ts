export interface TransitionOptions {
  duration?: number;
  disabled?: boolean;
  reducedMotion?: boolean;
}

export const shouldAnimate = ({
  duration = 200,
  disabled = false,
  reducedMotion = false,
}: TransitionOptions = {}): boolean => !disabled && !reducedMotion && duration > 0;
