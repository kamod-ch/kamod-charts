export type EmbedChartSvgStyles = "none" | "kamod-tokens" | "all-computed";

export interface SerializeChartSvgOptions {
  /** Default: `kamod-tokens` (`--kamod-*` and `--chart-*`). */
  embedStyles?: EmbedChartSvgStyles;
  /** Opaque background rect; default transparent (omitted). */
  backgroundColor?: string;
  inlineStyle?: Record<string, string>;
}

export interface DownloadChartSvgOptions extends SerializeChartSvgOptions {
  /** Delay before revoking the object URL. Default: 60000. */
  revokeDelayMs?: number;
}
