import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@kamod-ch/preactpress/config";
import { getThemeInitScript } from "@kamod-ch/themes";
import tailwindcss from "@tailwindcss/vite";

const configDir = dirname(fileURLToPath(import.meta.url));
const chartsSrc = resolve(configDir, "../../core/src");
const chartsRoot = resolve(configDir, "../../core");
const base = "/";

function publicUrl(assetPath: string): string {
  const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${prefix}/${assetPath.replace(/^\//, "")}`;
}

export default defineConfig({
  theme: "./theme/Layout.tsx",
  srcExclude: [
    "README.md",
    "dist/**",
    "components/**",
    "data/**",
    "styles/**",
    "public/**",
    "node_modules/**",
  ],
  site: {
    title: "kamod charts",
    description:
      "Preact-native, SVG-first chart components. Accessible, composable, and ready for production dashboards.",
    url: "https://kamod-ch.github.io/charts/",
    base,
  },
  markdown: {
    html: false,
    linkify: true,
    typographer: true,
  },
  head: [
    ["link", { rel: "icon", href: `${base}favicon.svg`, type: "image/svg+xml" }],
    ["link", { rel: "apple-touch-icon", href: `${base}favicon.svg` }],
    ["link", { rel: "stylesheet", href: publicUrl("styles/logo.css") }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
      },
    ],
    ["script", { type: "text/javascript" }, getThemeInitScript({ defaultScheme: "system" })],
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          find: "@kamod-ch/charts/theme.css",
          replacement: resolve(chartsSrc, "theme/tokens.css"),
        },
        {
          find: "@kamod-ch/charts/line",
          replacement: resolve(chartsSrc, "charts/line-chart.tsx"),
        },
        {
          find: "@kamod-ch/charts/area",
          replacement: resolve(chartsSrc, "charts/area-chart.tsx"),
        },
        {
          find: "@kamod-ch/charts/bar",
          replacement: resolve(chartsSrc, "charts/bar-chart.tsx"),
        },
        {
          find: "@kamod-ch/charts/pie",
          replacement: resolve(chartsSrc, "charts/pie-chart.tsx"),
        },
        {
          find: "@kamod-ch/charts/donut",
          replacement: resolve(chartsSrc, "charts/donut-chart.tsx"),
        },
        {
          find: "@kamod-ch/charts/scatter",
          replacement: resolve(chartsSrc, "charts/scatter-chart.tsx"),
        },
        {
          find: "@kamod-ch/charts/motion",
          replacement: resolve(chartsSrc, "motion/index.ts"),
        },
        {
          find: "@kamod-ch/charts/accessibility",
          replacement: resolve(chartsSrc, "accessibility/index.ts"),
        },
        {
          find: "@kamod-ch/charts/primitives",
          replacement: resolve(chartsSrc, "primitives/index.ts"),
        },
        {
          find: "@kamod-ch/charts/core",
          replacement: resolve(chartsSrc, "core/index.ts"),
        },
        {
          find: "@kamod-ch/charts",
          replacement: resolve(chartsSrc, "index.ts"),
        },
      ],
      dedupe: ["preact", "preact/hooks", "@preact/signals"],
    },
    server: {
      fs: {
        allow: [resolve(configDir, ".."), chartsRoot, resolve(configDir, "../../../kamod-motion")],
      },
    },
    ssr: {
      noExternal: [
        "@kamod-ch/brand",
        "@kamod-ch/charts",
        "@kamod-ch/ui",
        "@kamod-ch/icons",
        "@kamod-ch/themes",
        "@kamod-ch/motion",
        "motion",
        "@preact/signals",
        "preact",
        "preact/hooks",
      ],
    },
  },
  themeConfig: {
    outline: true,
    lastUpdated: true,
    footer: "Released under the MIT License.\n\nCopyright © 2026 Klaus Zahiragic - www.kamod.ch",
    editLink: {
      text: "Edit this page",
      pattern: "https://github.com/kamod-ch/charts/edit/main/packages/docs/:path",
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kamod-ch/charts",
        ariaLabel: "kamod charts on GitHub",
      },
    ],
    nav: [
      { text: "Gallery", link: "/" },
      { text: "Charts", link: "/charts/line" },
      { text: "Examples", link: "/examples/" },
      { text: "Playground", link: "/playground/" },
      { text: "API", link: "/api/" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Introduction", link: "/getting-started/" },
          { text: "Installation", link: "/getting-started/#installation" },
          { text: "Quick start", link: "/getting-started/#quick-start" },
        ],
      },
      {
        text: "Charts",
        items: [
          { text: "Line Chart", link: "/charts/line" },
          { text: "Area Chart", link: "/charts/area" },
          { text: "Bar Chart", link: "/charts/bar" },
          { text: "Pie Chart", link: "/charts/pie" },
          { text: "Donut Chart", link: "/charts/donut" },
          { text: "Scatter Chart", link: "/charts/scatter" },
        ],
      },
      {
        text: "Foundations",
        items: [
          { text: "Data", link: "/foundations/data" },
          { text: "Colors & themes", link: "/foundations/colors-and-themes" },
          { text: "Responsive charts", link: "/foundations/responsive-charts" },
          { text: "Accessibility", link: "/foundations/accessibility" },
          { text: "Motion", link: "/foundations/motion" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Examples", link: "/examples/" },
          { text: "API", link: "/api/" },
          { text: "Playground", link: "/playground/" },
        ],
      },
    ],
  },
});
