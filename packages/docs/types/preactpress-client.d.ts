import type { ComponentType } from "preact";

declare module "@kamod-ch/preactpress/client" {
  export interface OutlineItem {
    id: string;
    text: string;
    level: number;
  }

  export interface SiteData {
    title: string;
    description: string;
    base: string;
    lang: string;
    url?: string;
    titleTemplate?: string | false;
  }

  export interface NavItem {
    text: string;
    link?: string;
    items?: NavItem[];
  }

  export interface SidebarItem {
    text: string;
    link?: string;
    collapsed?: boolean;
    items?: SidebarItem[];
  }

  export interface SidebarGroup {
    text?: string;
    collapsed?: boolean;
    items: SidebarItem[];
  }

  export type SidebarConfig = SidebarGroup[] | Record<string, SidebarGroup[]>;
  export type PageOutlineConfig = number | [number, number] | "deep" | false;

  export interface ThemeConfig {
    nav?: NavItem[];
    sidebar?: SidebarConfig;
    outline?: boolean | PageOutlineConfig;
    search?: boolean | Record<string, unknown>;
    footer?: string;
    socialLinks?: Array<{
      icon?: string;
      link: string;
      ariaLabel?: string;
    }>;
  }

  interface BasePageView {
    title?: string;
    description?: string;
    tags?: string[];
    image?: string;
    pageType?: "website" | "article";
    meta: Record<string, unknown>;
    headings: OutlineItem[];
    relativePath?: string;
    lastUpdated?: string;
  }

  export interface HtmlPageView extends BasePageView {
    kind: "markdown";
    html: string;
  }

  export interface MdxPageView extends BasePageView {
    kind: "mdx";
    Component: ComponentType<{
      components?: Record<string, ComponentType<Record<string, unknown>>>;
    }>;
  }

  export type PageView = HtmlPageView | MdxPageView;

  export interface ResolvedLocale {
    key: string;
    label: string;
    lang: string;
    prefix: string;
  }

  export interface ResolvedI18n {
    defaultLocale: ResolvedLocale;
    locales: ResolvedLocale[];
  }

  export interface LayoutProps {
    site: SiteData;
    themeConfig: ThemeConfig;
    routePath: string;
    page?: PageView;
    i18n?: ResolvedI18n;
    locale?: ResolvedLocale;
    locales?: ResolvedLocale[];
    localizeRoute?: (locale: ResolvedLocale) => string;
  }
}
