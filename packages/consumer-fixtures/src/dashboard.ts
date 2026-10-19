import { BarChart } from "@kamod-ch/charts/bar";
import { LineChart } from "@kamod-ch/charts/line";

(globalThis as { __kamodDash?: unknown }).__kamodDash = { LineChart, BarChart };
