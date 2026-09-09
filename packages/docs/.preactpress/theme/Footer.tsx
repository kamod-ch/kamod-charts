import type { FunctionalComponent } from "preact";
import { KamodMarkLogo } from "@kamod-ch/brand";

type FooterProps = {
  base: string;
};

function withBase(base: string, link: string): string {
  if (/^https?:\/\//.test(link)) return link;
  const b = base === "/" ? "" : base.replace(/\/$/, "");
  const l = link.startsWith("/") ? link : `/${link}`;
  return `${b}${l}`;
}

const Footer: FunctionalComponent<FooterProps> = ({ base }) => (
  <footer class="docs-footer">
    <a
      class="docs-footer-logo"
      href="https://www.kamod.ch"
      target="_blank"
      rel="noopener noreferrer"
    >
      <KamodMarkLogo base={base} resolveAsset={(path) => withBase(base, path)} />
    </a>

    <p class="docs-footer-license">Released under the MIT License.</p>

    <p class="docs-footer-copy">
      Copyright © 2026 Klaus Zahiragic –{" "}
      <a href="https://www.kamod.ch" target="_blank" rel="noopener noreferrer">
        www.kamod.ch
      </a>
    </p>

    <p class="docs-footer-built">
      Built with{" "}
      <a href="https://kamod-ch.github.io/preactpress/" target="_blank" rel="noopener noreferrer">
        PreactPress
      </a>
      .
    </p>
  </footer>
);

export default Footer;
