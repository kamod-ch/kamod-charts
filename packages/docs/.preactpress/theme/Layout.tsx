import type { LayoutProps } from "@kamod-ch/preactpress/client";
import { ExternalLinkIcon, GithubIcon, MenuIcon, XIcon } from "@kamod-ch/icons/shadcn";
import { syncThemeFromStorage } from "@kamod-ch/themes";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  ThemeToggle,
} from "@kamod-ch/ui";
import { cn } from "@kamod-ch/ui/lib/utils";
import type { ComponentChildren, FunctionalComponent, JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ChartLab } from "../../components/playground/ChartLab";
import { GalleryPage } from "../../components/gallery/GalleryPage";
import { BrandLogo } from "../../components/shared/BrandLogo";
import "../../styles/index.css";

if (typeof window !== "undefined") {
  syncThemeFromStorage();
}

type NavItem = { text: string; link: string };
type SidebarGroup = { text: string; items: NavItem[] };

function withBase(base: string, link: string): string {
  if (/^https?:\/\//.test(link)) return link;
  const b = base === "/" ? "" : base.replace(/\/$/, "");
  const l = link.startsWith("/") ? link : `/${link}`;
  return `${b}${l}`;
}

function normalizeLink(link: string): string {
  const clean = link.split(/[?#]/, 1)[0] || "/";
  const prefixed = clean.startsWith("/") ? clean : `/${clean}`;
  return prefixed.replace(/\/$/, "") || "/";
}

function isActive(routePath: string, link: string): boolean {
  const route = normalizeLink(routePath);
  const target = normalizeLink(link);
  return route === target || (target !== "/" && route.startsWith(`${target}/`));
}

function childText(children: ComponentChildren): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childText).join("");
  if (typeof children === "object" && "props" in children) {
    return childText((children as { props: { children?: ComponentChildren } }).props.children);
  }
  return "";
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

function createMdxComponents(base: string) {
  const used = new Map<string, number>();
  const heading =
    (Tag: "h2" | "h3") =>
    ({ children, ...props }: JSX.HTMLAttributes<HTMLHeadingElement>) => {
      const base = slugify(childText(children));
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      return (
        <Tag {...props} id={id} class={cn("scroll-mt-24", props.class)}>
          {children}
        </Tag>
      );
    };

  return {
    a: ({ href, ...props }: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        href={typeof href === "string" && href.startsWith("/") ? withBase(base, href) : href}
        {...props}
      />
    ),
    h2: heading("h2"),
    h3: heading("h3"),
  };
}

function SidebarNav({
  groups,
  routePath,
  base,
  onNavigate,
}: {
  groups: SidebarGroup[];
  routePath: string;
  base: string;
  onNavigate?: () => void;
}): JSX.Element {
  return (
    <nav aria-label="Documentation" class="space-y-6">
      {groups.map((group) => (
        <div key={group.text} class="space-y-2">
          <p class="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {group.text}
          </p>
          <ul class="space-y-1">
            {group.items.map((item) => {
              const active = isActive(routePath, item.link);
              return (
                <li key={item.link}>
                  <a
                    href={withBase(base, item.link)}
                    class={cn(
                      "flex min-h-11 items-center rounded-md border-l-2 px-3 text-sm transition-colors",
                      active
                        ? "border-[color:var(--brand)] bg-[color:color-mix(in_oklab,var(--brand)_14%,transparent)] font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

const Layout: FunctionalComponent<LayoutProps> = ({ site, themeConfig, routePath, page }) => {
  const title = page?.title ? `${page.title} | ${site.title}` : site.title;
  const nav = (themeConfig.nav ?? []) as NavItem[];
  const sidebar = (themeConfig.sidebar ?? []) as SidebarGroup[];
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | undefined>();

  const isGallery = normalizeLink(routePath) === "/";
  const isPlayground = normalizeLink(routePath) === "/playground";
  const showDocsChrome = !isGallery && !isPlayground;
  const showOutline =
    showDocsChrome && themeConfig.outline !== false && Boolean(page?.headings?.length);

  const MdxComponent = page?.kind === "mdx" ? page.Component : undefined;
  const mdxComponents = createMdxComponents(site.base);

  useEffect(() => {
    setMenuOpen(false);
  }, [routePath]);

  useEffect(() => {
    if (!page?.headings?.length) {
      setActiveHeading(undefined);
      return;
    }
    const update = () => {
      const visible = page.headings
        .map((heading) => document.getElementById(heading.id))
        .filter((el): el is HTMLElement => Boolean(el))
        .filter((el) => el.getBoundingClientRect().top <= 96);
      setActiveHeading(visible.at(-1)?.id ?? page.headings[0]?.id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [page?.headings]);

  const content = (() => {
    if (isGallery) return <GalleryPage />;
    if (isPlayground) return <ChartLab />;
    if (MdxComponent) {
      return (
        <div class="docs-prose">
          <MdxComponent components={mdxComponents} />
        </div>
      );
    }
    return (
      <main
        class="docs-prose"
        dangerouslySetInnerHTML={{ __html: page?.kind === "markdown" ? page.html : "" }}
      />
    );
  })();

  return (
    <div class="min-h-screen bg-background text-foreground">
      <title>{title}</title>
      <a class="docs-skip-link" href="#content">
        Skip to content
      </a>

      <header class="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div class="mx-auto flex h-[var(--docs-header-height)] max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <a href={withBase(site.base, "/")} class="shrink-0" aria-label={site.title}>
            <BrandLogo label={site.title} base={site.base} />
          </a>
          <nav class="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((item) => {
              const active = isActive(routePath, item.link);
              return (
                <a
                  key={item.link}
                  href={withBase(site.base, item.link)}
                  class={cn(
                    "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors",
                    active
                      ? "text-[color:var(--brand-hover)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.text}
                </a>
              );
            })}
          </nav>

          <div class="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" class="hit-target" asChild>
              <a
                href="https://github.com/kamod-ch/kamod-charts"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
              >
                <GithubIcon class="size-4" />
                <span class="sr-only">GitHub</span>
                <ExternalLinkIcon class="sr-only" />
              </a>
            </Button>
            <ThemeToggle class="hit-target" />
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  class="hit-target lg:hidden"
                  aria-label="Open menu"
                >
                  {menuOpen ? <XIcon class="size-4" /> : <MenuIcon class="size-4" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" class="w-[min(100%,20rem)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div class="mt-4 space-y-6">
                  <nav class="space-y-1" aria-label="Primary mobile">
                    {nav.map((item) => (
                      <a
                        key={item.link}
                        href={withBase(site.base, item.link)}
                        class="flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-muted"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                  {showDocsChrome ? (
                    <SidebarNav
                      groups={sidebar}
                      routePath={routePath}
                      base={site.base}
                      onNavigate={() => setMenuOpen(false)}
                    />
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div
        class={cn(
          "mx-auto max-w-[90rem]",
          showDocsChrome
            ? "lg:grid lg:grid-cols-[var(--docs-sidebar-width)_minmax(0,1fr)] xl:grid-cols-[var(--docs-sidebar-width)_minmax(0,1fr)_var(--docs-outline-width)]"
            : "",
        )}
      >
        {showDocsChrome ? (
          <aside class="sticky top-[var(--docs-header-height)] hidden h-[calc(100vh-var(--docs-header-height))] overflow-y-auto border-r border-border p-4 lg:block">
            <SidebarNav groups={sidebar} routePath={routePath} base={site.base} />
          </aside>
        ) : null}

        <div id="content" class="min-w-0">
          {showDocsChrome ? (
            <div class="px-4 py-8 sm:px-6 lg:px-8">
              {page?.title ? (
                <header class="mb-8 space-y-2">
                  <p class="text-sm text-muted-foreground">
                    {isActive(routePath, "/charts/line") || routePath.includes("/charts/")
                      ? "Charts"
                      : routePath.includes("/foundations/")
                        ? "Foundations"
                        : "Docs"}
                  </p>
                  <h1 class="text-3xl font-bold tracking-tight text-foreground">{page.title}</h1>
                  {page.description ? (
                    <p class="max-w-3xl text-base text-muted-foreground">{page.description}</p>
                  ) : null}
                </header>
              ) : null}
              {content}
            </div>
          ) : (
            content
          )}
        </div>

        {showOutline ? (
          <aside class="sticky top-[var(--docs-header-height)] hidden h-[calc(100vh-var(--docs-header-height))] overflow-y-auto p-4 xl:block">
            <p class="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              On this page
            </p>
            <ul class="space-y-1">
              {page?.headings?.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    class={cn(
                      "block border-l-2 py-1.5 pl-3 text-sm",
                      activeHeading === heading.id
                        ? "border-[color:var(--brand)] text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                      heading.level > 2 ? "pl-5" : "",
                    )}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>

      <footer class="border-t border-border py-8 text-center text-sm text-muted-foreground">
        {themeConfig.footer ?? "Released under the MIT License."}
      </footer>
    </div>
  );
};

export default Layout;
