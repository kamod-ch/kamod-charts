# Kamod Charts – Cursor-Prompts für SVG-Interoperabilität und Export

Stand: 20. Oktober 2026. Erstellt auf Basis von Commit `e55c296`. Cursor muss vor jeder Aufgabe den aktuellen Checkout prüfen; Pfade, APIs und Testzahlen können sich geändert haben.

Diese Prompt-Reihe erweitert die vorhandene SVG-first-Architektur. Sie ersetzt nicht die bestehende Roadmap in `docs/development/kamod-charts-cursor-prompts.md`. Die Aufgaben sollen einzeln und in der angegebenen Reihenfolge ausgeführt werden.

## Zielbild

Nach Abschluss des Kernprogramms soll Kamod Charts:

- das gerenderte `<svg>` kontrolliert über `svgProps` und `svgRef` zugänglich machen;
- stabile SVG-Layer, chartlokale `<defs>` und optionales Plot-Clipping besitzen;
- Charts ohne neue Runtime-Abhängigkeit als eigenständiges SVG serialisieren und herunterladen können;
- typisierte Erweiterungspunkte für eigene Marks, Labels und SVG-Ressourcen anbieten;
- lange Achsentexte deterministisch und SSR-sicher behandeln;
- Aspect-Ratio- und erweiterte Responsive-Anforderungen abdecken;
- dieselbe Surface-API über kartesische, Pie-, Donut- und Motion-Charts anbieten;
- optional einen getrennten, browsergebundenen Rasterexport ermöglichen.

## Reihenfolge

| Prompt | Ergebnis                                                 | Voraussetzung         |
| -----: | -------------------------------------------------------- | --------------------- |
|     00 | Aktueller Befund, API-RFC und Fortschrittsdatei          | –                     |
|     01 | `svgProps`, `svgRef` und kontrollierte Event-Komposition | 00                    |
|     02 | SVG-Layer, `<defs>`-Slot und optionales Plot-Clipping    | 01                    |
|     03 | SVG-Serialisierung und Download-Einstiegspunkt           | 01, 02                |
|     04 | Typisierte Mark-/Label-Slots und SVG-Ressourcen          | 02                    |
|     05 | Kollisions- und Overflow-Strategie für Achsentexte       | 02                    |
|     06 | Aspect Ratio und erweiterte responsive SVG-Größen        | 01, 02                |
|     07 | API-Parität für alle statischen und Motion-Charts        | 01–06                 |
|     08 | Optionaler PNG-/Rasterexport                             | 03, 07                |
|     09 | Optionaler Zoom-/Pan-/Brush-Spike                        | 02, 04, 07            |
|     10 | Gesamtprüfung, Dokumentation und Release-Vorbereitung    | 01–07; 08/09 optional |

Prompts 08 und 09 sind bewusst optional. Sie dürfen den Abschluss des SVG-Kernprogramms nicht blockieren.

---

## Basis-Prompt – in jedem neuen Cursor-Chat zuerst verwenden

```text
Du arbeitest im Repository kamod-ch/kamod-charts an @kamod-ch/charts.
Implementiere die anschließend ausgewählte nummerierte SVG-Aufgabe tatsächlich.

Verbindlicher Kontext:
- Preact-native und SVG-first. D3 dient nur Berechnungen und Geometrie.
- Kein React, react-dom, preact/compat, d3-selection oder imperatives D3-DOM-Rendering.
- Motion bleibt optional und über @kamod-ch/charts/motion getrennt.
- Statische Imports dürfen Motion und @kamod-ch/motion nicht laden.
- SSR, Hydration, deterministische IDs, Responsive-Verhalten, Tastaturbedienung,
  Reduced Motion und vorhandene Accessibility-Semantik erhalten.
- Bestehende öffentliche APIs bleiben kompatibel, sofern die Aufgabe keinen
  ausdrücklich dokumentierten API-Wechsel verlangt.
- Keine unnötige Runtime-Abhängigkeit hinzufügen. Web-APIs nur in klar
  browsergebundenen Funktionen und nie ungeschützt im SSR-Pfad verwenden.

Vor Änderungen:
1. Lies CONTRIBUTING.md, package.json, packages/core/package.json,
   docs/development/implementation-contract.md, die SVG-RFC und
   docs/development/svg-roadmap-progress.md, sofern diese Dateien existieren.
2. Prüfe git status und relevante Diffs. Erhalte uncommittete Nutzeränderungen.
   Kein git reset --hard, git clean oder pauschales Überschreiben von Dateien.
3. Prüfe den aktuellen Quellcode, Tests, Paket-Exports und Dokumentation. Historische
   Befunde sind Hinweise, keine Beweise für den aktuellen Zustand.
4. Beachte, dass packages/core/dist teilweise getrackt ist. Führe Builds so aus,
   dass keine unbeabsichtigten generierten Änderungen übernommen werden.

API-Regeln:
- Bevorzuge additive, typisierte Props gegenüber impliziten DOM-Hacks.
- Von Kamod kontrollierte SVG-Attribute und Nutzerattribute müssen eine dokumentierte
  Priorität besitzen. Kein versehentliches Überschreiben von IDs, viewBox,
  Accessibility-Verknüpfungen oder internen Eventhandlern.
- Nutzerhandler werden höchstens einmal aufgerufen. Pointer-, Tastatur- und
  Klickinteraktionen dürfen durch neue Layer oder Capture-Flächen nicht brechen.
- IDs in defs, clipPath, mask, marker und gradient müssen pro Chartinstanz eindeutig,
  SSR-deterministisch und nach Hydration stabil bleiben.
- Keine API einführen, die nur in JSDOM funktioniert, aber in echten Browsern bricht.

Qualität:
- Schreibe fokussierte Unit-, SSR- und gegebenenfalls Playwright-Regressionstests.
- Formatiere nur geänderte unterstützte Dateien mit
  pnpm exec oxfmt <konkrete Dateien>.
- Führe mindestens fokussierte Tests sowie pnpm typecheck aus.
- Für öffentliche API-, Export- oder Packaging-Änderungen zusätzlich:
  pnpm check
  pnpm test:exports
  pnpm smoke:consumer
  pnpm docs:build
- Für Pointer-, Fokus-, Download-, Clipping- oder Responsive-Verhalten zusätzlich:
  pnpm test:browser
- Bei Bundle-relevanten Änderungen pnpm size:report ausführen und unerwartete
  Änderungen erklären. Keine Budgets oder Assertions lockern, um Fehler zu verbergen.

Arbeitsweise:
- Bleibe im Umfang der ausgewählten Aufgabe. Keine nachfolgenden Prompts vorziehen.
- Prüfe zunächst, ob Teile bereits umgesetzt sind. Vorhandene Implementierungen
  vervollständigen statt parallel neu zu bauen.
- Bei einem echten API-Konflikt oder einer notwendigen Breaking Change: stoppen,
  Befund und Alternativen dokumentieren und nicht eigenmächtig improvisieren.
- Nicht veröffentlichen, nicht pushen und keine Paketversion erhöhen.
- Aktualisiere docs/development/svg-roadmap-progress.md mit Status, Änderungen,
  ausgeführten Checks, Ergebnissen, offenen Punkten und nächstem Schritt.
- Am Schluss knapp berichten: Änderungen, öffentliche API, Tests/Checks und Risiken.
```

---

## Prompt 00 – Istzustand und SVG-API-RFC festhalten

```text
Wende den Basis-Prompt an. Erstelle vor der Implementierung eine belastbare
Ausgangslage und einen kleinen API-RFC für die SVG-Erweiterungen.

Prüfe mindestens:
- packages/core/src/core/chart-surface.tsx
- packages/core/src/core/chart.tsx
- packages/core/src/core/types.ts
- packages/core/src/core/responsive-container.tsx
- packages/core/src/charts/types.ts und alle sechs High-Level-Charts
- statische und Motion-Serien
- Achsen, Annotationen, Tooltip-/Pointer-Layer und vorhandene defs/gradient-Logik
- Package-Exports, SSR-/Hydrationstests, Playwright-Fixtures und Dokumentation

Bestätige oder widerlege insbesondere:
1. ChartSurface akzeptiert nur eine feste Teilmenge nativer SVG-Attribute und
   bietet keinen öffentlichen Zugriff auf das tatsächliche SVG-Element.
2. Plotinhalt, Achsen, Annotationen und Interaktionsflächen besitzen noch kein
   explizites öffentliches Layer-/Clipping-Modell.
3. Area-Gradients sind spezialisiert; ein allgemeiner defs-Slot fehlt.
4. Es gibt keinen öffentlichen SVG-Serializer oder Download-Einstiegspunkt.
5. Line-/Scatter-Marks und Bar-Geometrien besitzen keine einheitlichen typisierten
   Render-Slots.
6. Achsentext behandelt Kollisionen primär über manuelle Rotation.
7. ResponsiveContainer misst nur die Breite und setzt eine feste Höhe voraus.
8. Surface-Props sind zwischen Cartesian, Pie, Donut und Motion nicht vollständig
   konsistent.

Erstelle:
- docs/development/svg-roadmap-progress.md mit Commit, Version, Paketmanager,
  Arbeitsbaumstatus, Status 00–10, Abhängigkeiten und Prüfkommandos;
- docs/development/rfcs/001-svg-surface-and-export.md.

Der RFC muss entscheiden oder klar als offene Entscheidung markieren:
- Form und Typisierung von svgProps und svgRef;
- welche Attribute Kamod besitzt und nicht überschrieben werden dürfen;
- Komposition interner und externer Eventhandler;
- Layer-Reihenfolge sowie Semantik von defs, plot, annotations, axes und overlay;
- Default von clipPlotArea; aus Kompatibilitätsgründen zunächst bevorzugt opt-in;
- Browser-/SSR-Grenze des Exportmoduls;
- Strategie für CSS-Variablen und berechnete Styles im exportierten SVG;
- statische/Motion-Parität;
- additive Migration ohne Breaking Change.

Noch keine Produktions-API implementieren. Nur eindeutig falsche Dokumentation darf
korrigiert werden. Führe eine passende Ausgangsprüfung aus und dokumentiere sie.

Abnahme:
- Der RFC enthält konkrete TypeScript-Signaturen oder Pseudotypen.
- Jede offene Frage hat eine empfohlene Standardentscheidung.
- Die Reihenfolge 01–10 ist gegen den aktuellen Code validiert.
- Keine Featureimplementierung und keine neue Dependency in diesem Schritt.
```

---

## Prompt 01 – `svgProps`, `svgRef` und Event-Komposition

```text
Wende den Basis-Prompt an. Implementiere die im RFC beschlossene gemeinsame
SVG-Surface-API, aber noch kein Clipping und keinen Export.

Ziele:
1. ChartSurface und ChartRoot bieten einen typisierten Zugriff auf das tatsächliche
   SVG-Element, vorzugsweise als explizites svgRef, damit generische Preact-Komponenten
   und bestehende Aufrufer kompatibel bleiben.
2. Ein svgProps-Objekt erlaubt sinnvolle native SVG-Attribute wie aria-label,
   preserveAspectRatio, focusable, data-*, onClick, onPointerDown, onFocus und onBlur.
3. Von Kamod kontrollierte Attribute bleiben geschützt: id, width, height, viewBox,
   xmlns, interne data-Attribute und title/desc-Verknüpfungen dürfen nicht unbemerkt
   durch Spread-Reihenfolge überschrieben werden.
4. Externe Eventhandler werden mit internen Chart-Handlern deterministisch komponiert
   und genau einmal aufgerufen. Dokumentiere Reihenfolge und defaultPrevented-Semantik.
5. Die API wird durch CommonCartesianChartProps, PieChartProps und DonutChartProps bis
   zum SVG durchgereicht. Motion-Wrapper müssen dieselbe Surface-Semantik behalten.

Entscheide anhand des RFC, ob gemeinsame Typen wie ChartSvgProps oder
ChartSurfaceOptions eingeführt werden. Verwende Preact-Typen, keine React-Typen.
Vermeide eine unübersichtliche Verdopplung sämtlicher SVG-Attribute als einzelne
Chart-Props.

Tests:
- SSR-Weitergabe von aria-label, preserveAspectRatio und data-Testattribut;
- geschützte Attribute können nicht versehentlich überschrieben werden;
- svgRef zeigt nach Client-Render auf genau das erwartete SVGSVGElement;
- interne und externe Keyboard-/Pointerhandler laufen jeweils genau einmal;
- bestehende title/desc-IDs bleiben korrekt und SSR-deterministisch;
- mindestens ein Cartesian-, Pie-/Donut- und Motion-Fall.

Dokumentiere die API mit einem kopierbaren Beispiel. Keine Exportlogik, keine neuen
Layer und keine Render-Slots in diesem Schritt.
```

---

## Prompt 02 – SVG-Layer, `<defs>` und Plot-Clipping

```text
Wende den Basis-Prompt an. Implementiere ein explizites SVG-Layermodell auf Basis
des RFC, ohne bestehende Chartdarstellung standardmäßig zu verändern.

Zielstruktur, an den aktuellen Code anzupassen:
- chartlokale defs direkt unter dem SVG;
- Hintergrund/Grid;
- optional geclippte Datenserien;
- ungeclippte aktive Marks und Annotationen, sofern semantisch erforderlich;
- Achsen und Achsenlabels;
- Interaktionsfläche mit unverändertem Hit-Testing;
- bestehendes HTML-Overlay außerhalb des SVG.

Anforderungen:
1. Erzeuge für jede Chartinstanz eine eindeutige, SSR- und hydration-stabile
   clipPath-ID aus der vorhandenen Chart-ID-Infrastruktur.
2. Der Clip-Rechteckbereich entspricht exakt der berechneten PlotArea.
3. clipPlotArea ist additiv und zunächst opt-in, sofern der RFC keine nachweislich
   kompatible andere Entscheidung enthält.
4. Achsenticks, Achsenlabels, Pie-Außenlabels und Tooltips dürfen nicht versehentlich
   abgeschnitten werden.
5. Pointer-Capture, Balkenklicks, Fokusmarker, Tooltip-Anker und aktive Offsets
   funktionieren mit und ohne Clipping.
6. Ergänze einen klar benannten defs-Slot. Nutzer-defs werden einmal gerendert und
   nicht in jede Serie dupliziert. Der Slot muss SSR-fähige Preact-Children erlauben.
7. Erhalte das bestehende Verhalten frei komponierter Chart-Children. Falls ihre
   Layerzuordnung nicht eindeutig migrierbar ist, biete neue explizite Primitives
   an und dokumentiere die Grenze, statt still umzudeuten.

Tests:
- zwei Charts auf derselben Seite haben unterschiedliche Clip-IDs;
- SSR-Markup und Hydration behalten dieselben Referenzen;
- große Scatterpunkte und breite Linien werden nur bei clipPlotArea begrenzt;
- Achsen und Außenlabels bleiben sichtbar;
- defs-Inhalte und url(#id)-Referenzen bleiben nach Legend Toggle erhalten;
- echter Browserfall für Klick/Tooltip/Clipping.

Keine generische Filter-/Pattern-Abstraktion und keine Exportfunktion in diesem Schritt.
```

---

## Prompt 03 – SVG serialisieren und herunterladen

```text
Wende den Basis-Prompt an. Implementiere einen tree-shakebaren SVG-Export als
separaten Package-Einstiegspunkt, bevorzugt @kamod-ch/charts/export.

Öffentliche Kernfunktionen, Namen anhand des RFC finalisieren:
- serializeChartSvg(svgElement, options): string
- downloadChartSvg(svgElement, filename, options): void oder ein testbarer Blob-Helfer

Anforderungen:
1. Keine neue Runtime-Abhängigkeit, sofern die Plattform-APIs ausreichen.
2. Das Modul darf beim Import in SSR/Node nicht auf window, document,
   XMLSerializer, URL oder Blob zugreifen. Browserabhängigkeit erst beim Aufruf
   einer browsergebundenen Funktion prüfen und verständlich melden.
3. Das geklonte Export-SVG erhält korrekten SVG-Namespace, width, height und viewBox.
4. title, desc, aria-Verknüpfungen, defs, clipPath, gradient, pattern, marker und
   interne url(#id)-Referenzen bleiben gültig.
5. Biete eine dokumentierte Option, relevante CSS Custom Properties und notwendige
   berechnete Präsentationswerte einzubetten. Das Original-DOM darf nicht mutiert
   werden. Definiere klar, ob standardmäßig nur Kamod-Tokens oder alle ermittelten
   Custom Properties übernommen werden.
6. Optionaler Hintergrund: transparent als Default, explizite Farbe als Option.
7. Dateiname sicher normalisieren und .svg nicht doppelt anhängen.
8. Objekt-URLs nach Download wieder freigeben, ohne den Download zu früh zu brechen.
9. Keine PNG-/Canvas-Logik in diesem Prompt.

Tests:
- serialisiertes Ergebnis lässt sich erneut als image/svg+xml parsen;
- Namespace, viewBox, title/desc, defs und Clip-Referenzen sind vorhanden;
- CSS-Token werden gemäß Option eingebettet;
- Original-SVG bleibt unverändert;
- SSR-sicherer Modulimport;
- Browser-Download erzeugt einen SVG-Blob mit korrektem MIME-Type;
- Package-Export-, Tarball- und statischer Consumer-Test;
- statischer Import lädt weder motion noch @kamod-ch/motion.

Ergänze eine Export-Dokumentationsseite mit Ref-Beispiel aus Prompt 01 und klaren
Grenzen für externe Fonts, Bilder, Stylesheets und Content Security Policy.
```

---

## Prompt 04 – Typisierte Marks, Labels und SVG-Ressourcen

```text
Wende den Basis-Prompt an. Ergänze kontrollierte Erweiterungspunkte für eigene
SVG-Geometrie, ohne aus der High-Level-API einen unstrukturierten SVG-Wrapper zu machen.

Untersuche reale Anwendungsfälle und implementiere nur stabile, gemeinsame Slots:
- renderPoint für Line, Area und Scatter;
- renderBar für Bar;
- renderLabel dort, wo bereits Datenlabels existieren;
- gegebenenfalls renderActiveMark für aktiven Zustand;
- defs-Slot aus Prompt 02 für raw Preact-SVG-Children.

Jeder Render-Kontext soll mindestens enthalten:
- Originaldatum und Originalindex;
- stabile Serien-ID und optionales Label;
- Datenwert bzw. Stack-Start/-Ende;
- endgültige SVG-Koordinaten und Geometrie;
- Farbe, Opacity und aktiven/verborgenen Zustand;
- einen stabilen Key oder eine dokumentierte Key-Semantik.

Anforderungen:
1. Defaults erzeugen exakt die bisherige Geometrie und Semantik.
2. Nutzer können etwa circle, square, diamond oder ein eigenes path zurückgeben,
   ohne Skalen und Hit-Testing neu implementieren zu müssen.
3. Render-Slots dürfen Tooltip, Tastaturnavigation, Hit-Testing und aktive Auswahl
   nicht von der sichtbaren Mark-Geometrie entkoppeln. Falls beliebige Geometrie
   keine automatische Trefferfläche erlaubt, dokumentiere und typisiere die Grenze.
4. Motion-Charts müssen entweder dieselben Slots korrekt unterstützen oder eine
   explizit dokumentierte Einschränkung besitzen. Keine scheinbare API-Parität mit
   statisch falschem Verhalten.
5. Für pattern, marker, mask und filter zunächst den defs-Slot dokumentieren.
   Kleine typisierte Ressourcen-Primitives nur ergänzen, wenn sie ID-Kollisionen
   oder wiederkehrende Fehler nachweislich verhindern.
6. Keine foreignObject-Abhängigkeit für Marks oder Labels einführen.

Tests und Beispiele:
- eigener Diamond-Point;
- datenabhängiger Bar-Path oder Bar-Inhalt;
- Pattern-Fill über defs und stabile url(#id)-Referenz;
- zwei Chartinstanzen ohne ID-Kollision;
- SSR, Legend Toggle, aktive Auswahl und mindestens ein Browser-Hit-Test.
```

---

## Prompt 05 – Achsentexte, Kollisionen und Overflow

```text
Wende den Basis-Prompt an. Ergänze eine deterministische, SSR-sichere Strategie
für lange oder dichte X- und Y-Achsentexte.

Öffentliche Semantik, anhand des RFC und bestehender Props finalisieren:
- tickCollision: none | hide | rotate | truncate;
- optionale maximale Labelbreite oder Zeichenbegrenzung;
- explizite Rotation weiterhin unterstützen;
- vollständigen Wert bei Kürzung zugänglich halten;
- optional mehrzeilige Ausgabe mit SVG-tspan, wenn ohne Browsermessung zuverlässig.

Anforderungen:
1. Das Defaultverhalten bleibt kompatibel.
2. Keine DOM-Messung, getBBox oder Canvas-Messung im SSR-/Initial-Render-Pfad.
3. Hide/Truncate müssen bei identischen Daten und Dimensionen deterministisches
   SSR- und Client-Markup erzeugen.
4. Der erste und letzte relevante Tick dürfen nicht zufällig verschwinden.
5. Gekürzte sichtbare Labels behalten einen zugänglichen vollständigen Namen,
   ohne für jeden Tick störende Screenreader-Duplikate zu erzeugen.
6. Intl-Formatter, Date-Werte, negative Werte, Rotation und expliziter tickCount
   bleiben kompatibel.
7. Falls automatische Marginberechnung eine DOM-Messung erfordert, nicht in diese
   Aufgabe aufnehmen. Stattdessen notwendige Margin-Konfiguration dokumentieren.

Tests:
- lange Kategorien in schmalem SVG;
- dichte Zeitachse;
- SSR/Hydration-Gleichheit;
- hide, rotate und truncate;
- X- und Y-Achse;
- Browser-Screenshot oder geometrische Assertions für Overflow.

Dokumentiere klare Empfehlungen, wann Nutzer hide, rotate oder truncate wählen sollen.
```

---

## Prompt 06 – Aspect Ratio und responsive SVG-Größen

```text
Wende den Basis-Prompt an. Erweitere die responsive SVG-Größensteuerung, ohne die
bestehende stabile initialWidth-/SSR-Strategie zu beschädigen.

Ziele:
- preserveAspectRatio über svgProps aus Prompt 01 zuverlässig unterstützen;
- eine optionale aspectRatio-Konfiguration anbieten;
- bei Bedarf responsive Höhe ermöglichen, ohne ResizeObserver-Schleifen;
- feste width/height-Aufrufer unverändert lassen.

Anforderungen:
1. Definiere eine eindeutige Priorität zwischen height, aspectRatio, width,
   initialWidth und responsive. Unmögliche Kombinationen möglichst typisieren oder
   in Entwicklung verständlich validieren.
2. SSR rendert mit initialWidth und daraus deterministisch berechneter Höhe.
3. Hydration beginnt mit identischem Markup; ResizeObserver aktualisiert erst danach.
4. Mindestdimensionen und 0-/NaN-/Infinity-Werte verwenden die bestehenden
   Clamp-Konventionen.
5. Keine Endlosschleife durch gegenseitiges Messen von Breite und Höhe.
6. Tooltip-Koordinaten, viewBox-Umrechnung, Hit-Testing, Clipping und Overlay-Position
   bleiben nach Resize korrekt.
7. Dokumentiere den Unterschied zwischen intern berechneter Chartgröße,
   CSS-Darstellungsgröße, viewBox und preserveAspectRatio.

Tests:
- feste Größe unverändert;
- responsive Breite mit fester Höhe;
- responsive Breite mit aspectRatio;
- SSR/Hydration und nachfolgender Resize;
- schmaler Container, Zoom-/Skalenfall und Tooltip am Rand;
- mehrere Charts mit verschiedenen Aspect Ratios.
```

---

## Prompt 07 – Surface- und SVG-API-Parität

```text
Wende den Basis-Prompt an. Vereinheitliche die in Prompts 01–06 entstandene
öffentliche Surface-API über alle High-Level-Charts und Motion-Wrapper.

Prüfe systematisch:
- LineChart, AreaChart, BarChart und ScatterChart;
- PieChart und DonutChart;
- @kamod-ch/charts/motion;
- Low-Level Chart, ChartSurface und ResponsiveContainer;
- fokussierte Subpath-Exports und Declaration-Dateien.

Mindestens konsistent verfügbar, soweit semantisch sinnvoll:
- class und style;
- svgProps und svgRef;
- title, description und weitere Accessibility-Attribute;
- defs-Slot;
- clipPlotArea für kartesische Plotflächen;
- aspectRatio/preserveAspectRatio;
- Export über denselben SVG-Ref-Weg.

Anforderungen:
1. Keine kartesischen Props künstlich auf Pie/Donut übertragen.
2. Keine semantisch falsche Gleichheit: dokumentiere bewusst nicht verfügbare
   Features, etwa kartesisches Plot-Clipping bei Circular Charts.
3. Statische und Motion-Varianten müssen dieselben Typen teilen, statt auseinander
   driftende Kopien zu besitzen.
4. Bestehende Subpath-Imports und Tree-Shaking bleiben erhalten.
5. Dokumentation und Props-Tabellen werden aus der tatsächlichen API aktualisiert.
6. Ergänze Type-Consumer-Tests, die alle Chartfamilien mit den gemeinsamen Props
   kompilieren und ungültige Kombinationen ablehnen.

Führe vollständige Paket-, Consumer-, Docs- und Browserchecks aus. Unerwartete
Bundleänderungen untersuchen und nicht nur den Bericht aktualisieren.
```

---

## Prompt 08 – Optionaler PNG-/Rasterexport

```text
Wende den Basis-Prompt an. Dies ist optional und darf nur nach stabilem SVG-Export
aus Prompt 03 umgesetzt werden. Prüfe zuerst konkrete Consumer-Anforderungen.

Entwickle einen getrennten browsergebundenen Adapter, nicht Teil des statischen
Chart-Kerns. Bevorzugte Funktionen:
- renderChartToPngBlob(svgElement, options): Promise<Blob>
- downloadChartPng(svgElement, filename, options): Promise<void>

Anforderungen:
1. Verwende die SVG-Serialisierung aus Prompt 03 als einzige Quelle der Darstellung.
2. Definiere Breite, Höhe, devicePixelRatio/scale, Hintergrund und MIME-Type klar.
3. Warte kontrolliert auf Image-Decoding und räume Objekt-URLs, Image-Elemente und
   Canvas-Ressourcen auf.
4. Externe Bilder, Fonts, Stylesheets, CORS und tainted canvas erhalten klare
   Fehlermeldungen und Dokumentation. Keine still unvollständigen Exporte.
5. SSR-sicherer Modulimport; Browser-APIs erst beim Funktionsaufruf.
6. Der SVG-Export bleibt ohne Rastercode und ohne zusätzliche Abhängigkeit nutzbar.
7. Prüfe, ob WebP oder JPEG wirklich benötigt werden. Nicht vorsorglich anbieten.

Tests:
- deterministische Dimensionen und Hintergrund;
- PNG-Blob und korrekter MIME-Type;
- High-DPI-Skalierung;
- transparenter und fester Hintergrund;
- verständlicher Fehler bei nicht exportierbarer externer Ressource;
- Package- und Bundle-Isolation.
```

---

## Prompt 09 – Optionaler Zoom-, Pan- und Brush-Spike

```text
Wende den Basis-Prompt an. Dies ist zunächst ein Design- und Prototyping-Spike,
keine Verpflichtung zu einer sofortigen öffentlichen API.

Ermittle anhand eines konkreten Zeitreihen- oder Scatter-Anwendungsfalls, ob Kamod
Charts Zoom, Pan und/oder Brush selbst anbieten sollte oder ob kontrollierte Domain-
Props plus externe Zustandsverwaltung ausreichen.

Untersuche:
- aktuelle xDomain/yDomain- und controlled-selection-APIs;
- SVG pointer capture, wheel und touch-action;
- Tastatur- und Screenreader-Alternativen;
- synchronisierte Charts;
- Clipping- und Layermodell aus Prompt 02;
- Auswirkungen auf Tooltip, Downsampling, Motion und SSR.

Erstelle docs/development/rfcs/002-svg-navigation-and-selection.md mit:
- konkreten User Stories;
- empfohlenem Minimalumfang;
- kontrollierter State-API und Ereignismodell;
- Touch-/Scroll-Konflikten;
- Tastatursemantik und Resetmöglichkeit;
- Performancegrenzen;
- Entscheidung Build / Defer / External Composition.

Wenn und nur wenn der RFC einen kleinen stabilen Kern zeigt, implementiere einen
internen oder experimentellen Prototypen hinter einem ausdrücklich nicht stabilen
Export. Keine große öffentliche API, keine neue Gestenbibliothek und keine
vollständige d3-zoom-Integration in diesem Schritt.
```

---

## Prompt 10 – Gesamtprüfung und Release-Vorbereitung

```text
Wende den Basis-Prompt an. Prüfe das abgeschlossene SVG-Kernprogramm 01–07 und die
optional umgesetzten Schritte 08/09 als Release Candidate. Keine neuen Features.

1. Gleiche RFC, Fortschrittsdatei, öffentliche Typen, Package-Exports, README,
   API-Seiten, Beispiele und CHANGELOG gegeneinander ab.
2. Führe in sauberer Umgebung aus:
   pnpm check
   pnpm test:exports
   pnpm smoke:consumer
   pnpm test:browser
   pnpm docs:build
   pnpm size:report
3. Prüfe ein gepacktes npm-Tarball in einem isolierten Consumer:
   - statischer Chart;
   - Motion-Chart mit optionalen Peers;
   - SVG-Export;
   - gegebenenfalls Rasterexport;
   - TypeScript-Typen und CSS-Import.
4. Prüfe manuell oder per Browser-Fall:
   - zwei Chartinstanzen mit defs/clipPath ohne ID-Kollision;
   - SSR + Hydration;
   - SVG-Download in Light und Dark Theme;
   - lange Achsenlabels;
   - responsive Aspect Ratio und Resize;
   - Tastatur, Pointer, Touch und Reduced Motion;
   - externe svgProps und Handler genau einmal;
   - statische Imports ohne Motion-Code.
5. Aktualisiere CHANGELOG unter Unreleased. Keine Version erhöhen und nicht
   veröffentlichen.
6. Markiere in svg-roadmap-progress.md jeden Prompt als erledigt, teilweise,
   blockiert oder bewusst verworfen. Offene manuelle Prüfungen nicht als bestanden
   ausgeben.

Abnahme:
- Öffentliche API ist dokumentiert und über Subpath-Consumer getestet.
- Exportdateien sind eigenständige valide SVGs.
- Keine Regression bei SSR, Hydration, Accessibility oder Interaktion.
- Keine unerklärte Bundlevergrößerung und keine neue Pflichtabhängigkeit.
```

---

## Bewusst nicht Teil dieser Prompt-Reihe

- Neue Diagrammtypen wie Radar, Gauge oder Heatmap.
- Sparkline, ComboChart und Histogramm; dafür existieren bereits die optionalen Prompts A–C in `docs/development/kamod-charts-cursor-prompts.md`.
- PDF-Export, serverseitiges Headless-Browser-Rendering und Office-Formate.
- Eine vollständige proprietäre SVG-Abstraktionsschicht über Preact.
- Automatische DOM-Textmessung im SSR- oder Initial-Render-Pfad.

Diese Punkte erst nach Abschluss von Prompt 10 anhand konkreter Nutzerfälle neu priorisieren.
