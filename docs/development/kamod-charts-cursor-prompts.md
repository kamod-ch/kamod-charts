# Kamod Charts – Cursor-Prompts zur Roadmap

Stand: 17. Oktober 2026. Grundlage: `kamod-charts-roadmap.md`, Analyse von Commit `89a1bad6a95cca6d839e2a226ad13012f2b2aa74`. Die damalige Paketversion war 0.2.0. Cursor muss den aktuellen Checkout prüfen; Dateipfade und Befunde können sich inzwischen geändert haben.

## So verwendest du die Prompts

1. Öffne das Repository `kamod-ch/kamod-charts` in Cursor. Hänge diese Datei und bei Bedarf die Roadmap an den Chat an.
2. Kopiere den Basis-Prompt einmal an den Anfang jedes neuen Chats.
3. Führe anschließend jeweils **einen** nummerierten Prompt aus. Lasse Cursor die Aufgabe implementieren und die Ergebnisse prüfen, bevor du den nächsten Prompt startest.
4. Prompt 00 legt den Arbeitsstand und die Fortschrittsdatei an. Folgeaufgaben gleichen ihre Voraussetzungen mit dieser Datei und dem tatsächlichen Code ab.
5. Versionsnummern sind Meilensteine aus der Roadmap. Diese Prompts veröffentlichen keine Releases und ändern nicht automatisch die Paketversion.

Alle Blöcke sind Arbeitsaufträge für Cursor. Sie behaupten nicht, dass die beschriebenen Änderungen bereits umgesetzt wurden. Nicht alle Aufgaben müssen in einer einzigen Sitzung erledigt werden.

## Reihenfolge

| Prompt | Ergebnis                                                   | Voraussetzung         |
| ------ | ---------------------------------------------------------- | --------------------- |
| 00     | Aktueller Befund, Arbeitsregeln und Fortschrittsliste      | –                     |
| 01     | DataTable-/Downsampling-Fixes und Type-Reexport bereinigt  | 00                    |
| 02     | Installationsreste aus Git und Docs als PR-Gate            | 00                    |
| 03     | Playwright-Smoke-Test und echter Balkenklick               | 01                    |
| 04     | Browser-Abdeckung für SSR, Tastatur, Touch und Darstellung | 03                    |
| 05     | Reproduzierbare Performance-Baseline                       | 03                    |
| 06     | Consumer-Bundles und gepacktes npm-Paket geprüft           | 02                    |
| 07     | Gemeinsames Layout-/Stackmodell                            | 01, 05                |
| 08     | Schnellere Suche und gebündelte Pointerupdates             | 07                    |
| 09     | Konsistente Achsen-, Domain- und Layout-API                | 07, 08                |
| 10     | Kontrollierte Auswahl, Legenden und Aktivierung            | 09                    |
| 11     | Locale, Zeitzone und Standardtexte                         | 09                    |
| 12     | Min/Max-Sampling mit Originalindizes                       | 08, 09                |
| 13     | Synchronisierte Zeitreihen                                 | 10, 11, 12            |
| 14     | Nutzbare Analytics-Rezepte                                 | 09, 10, 11, 13        |
| 15     | Gesamtprüfung und Releasevorbereitung                      | 01–14                 |
| A–C    | Optionale Erweiterungen: Sparkline, Combo, Histogramm      | Nach dem Kernprogramm |

## Basis-Prompt – in jedem neuen Cursor-Chat zuerst verwenden

```text
Du arbeitest im Repository kamod-ch/kamod-charts an @kamod-ch/charts.
Implementiere die jeweils anschließende nummerierte Aufgabe tatsächlich.

Verbindlicher Kontext:
- Preact-native, SVG-first. D3 dient Berechnungen und Geometrie.
- Kein React, react-dom, preact/compat, Radix oder D3-DOM-Rendering hinzufügen.
- Motion bleibt optional und über einen getrennten Einstiegspunkt verfügbar.
- SSR, Hydration, responsive Größen, Tastaturbedienung und Reduced Motion erhalten.
- Bestehende öffentliche APIs kompatibel weiterführen, sofern die Aufgabe nicht
  ausdrücklich einen dokumentierten API-Wechsel verlangt.
- Keine spekulativen Kamod-Imports oder erfundenen Props verwenden.
  Prüfe tatsächliche Exports und installierte Versionen.
- Füge nur für die konkrete Aufgabe notwendige Abhängigkeiten hinzu.

Vor Änderungen:
1. Lies einschlägige AGENTS.md-Dateien, package.json, Workspace-Konfiguration,
   betroffene Quelltexte, Tests und vorhandene Entwicklungsnotizen.
2. Prüfe git status und relevante Diffs. Erhalte vorhandene Nutzeränderungen.
   Kein git reset --hard, git clean oder pauschales Überschreiben von Dateien.
3. Vergleiche historische Befunde mit dem aktuellen Code. Bereits gelöste Punkte
   nicht erneut implementieren. Widersprüche kurz dokumentieren.
4. Prüfe den Umgang mit eingechecktem dist, bevor ein Build Dateien ersetzt.
   Wenn nötig in einer separaten Arbeitskopie bauen und nur beabsichtigte
   Änderungen übernehmen. Nicht pauschal generierte Dateien löschen.

Qualität:
- Verwende den Paketmanager und die Version gemäß aktuellem Repository.
- Oxlint und Oxfmt sind verpflichtend: pnpm lint (oxlint .),
  pnpm exec oxfmt <konkrete geänderte unterstützte Dateien>,
  pnpm format:check (oxfmt --check .).
- Erhalte zusätzliche vorhandene Checks. Keine globale Formatierungsaktion.
- Schreibe fokussierte Regressionstests für Fehler und Tests für neue öffentliche
  Semantik. Bei reinen Dokumentationsänderungen genügen angemessene Docs-Checks.
- Für Codeänderungen am Ende die vorhandenen passenden Typecheck-, Test-, Build-
  und Exportprüfungen ausführen; nutze pnpm check, soweit weiterhin gültig.
- Browserprüfungen ausführen, wenn Interaktion oder Layout geändert wurde und
  die Suite eingerichtet ist. Fehlende Browser nie als bestandenen Test melden.
- Fehler nicht durch abgeschaltete Checks, gelockerte Assertions, pauschale
  any-Casts oder unterdrückte Build-Warnungen verstecken.
- Messergebnisse, Vermutungen und Zielwerte klar unterscheiden.

Arbeitsweise:
- Bleibe im Umfang der nummerierten Aufgabe. Naheliegende lokale Entscheidungen
  selbst treffen und begründen; keine unnötigen Bestätigungsrunden.
- Bei einem echten Blocker unabhängige Teile fertigstellen und den Blocker
  konkret benennen. Keine erfolgreiche Implementierung vortäuschen.
- Nicht veröffentlichen, nicht pushen und keine weiteren Repositories ändern.
- Am Schluss: Änderungen, betroffene öffentliche APIs, ausgeführte Kommandos
  mit Ergebnis sowie offene Punkte knapp dokumentieren.
- Falls docs/development/roadmap-progress.md bereits existiert, den jeweiligen
  Schritt mit Ergebnis und verbleibenden Punkten aktualisieren.
```

## Prompt 00 – Ausgangslage und Arbeitsplan im Repository festhalten

```text
Wende den Basis-Prompt an. Bereite die Umsetzung der Kamod-Charts-Roadmap vor.

Lies README, CHANGELOG, package.json-Dateien, Lockfile, Build-/Testkonfiguration,
CI-Workflows, plans/README.md und die betroffenen Quelltexte. Prüfe insbesondere:
- CommonCartesianChartProps und APIs der sechs fertigen Charts;
- Pointer-/Hit-Testing, Stack-Berechnung und Active-Layer;
- DataTable, Stride-Sampling und ScatterSizeScale-Reexport;
- tatsächliche Browser-Tests, Bundlemessung und Paket-Exports;
- von Git erfasste Dateien unter node_modules und dist.

Erstelle docs/development/roadmap-progress.md mit:
1. Aktuellem Commit, Paketversion, Paketmanager und vorhandenem Arbeitsbaumstatus.
2. Status für die Schritte 00–15: offen / erledigt / teilweise / blockiert.
3. Kurzem Befund pro Punkt mit aktuellen Quellpfaden.
4. Abhängigkeiten und den passenden Prüfkommandos.
5. Getrennter Liste bestätigter Fehler und noch zu prüfender Verdachtsfälle.

Halte die Arbeitsregeln aus dem Basis-Prompt zusätzlich in einer kurzen
docs/development/implementation-contract.md fest und verlinke sie in der
Fortschrittsdatei. Erstelle keine neue AGENTS.md.

Historischer Kontext, den du prüfen musst:
- Die Pläne 001–005 waren als DONE markiert.
- 479 Tests in 41 Dateien bestanden in der damaligen Analyse.
- Der Klickverlust bei eingeschaltetem Tooltip war nur ein Quellcodeverdacht.
- Die beiden Datenrandfälle wurden damals reproduziert.
Übernimm diese Angaben nicht ungeprüft als aktuellen Zustand.

Ermittle eine angemessene Ausgangsprüfung. Verwende bestehende aktuelle
Prüfergebnisse, falls sie für exakt denselben Zustand vorliegen. Andernfalls
führe pnpm check und pnpm docs:build aus, sofern die Umgebung es erlaubt.

Abnahme:
- Ein neuer Entwickler erkennt Istzustand, Reihenfolge und offene Fragen.
- In dieser Aufgabe keine Features umbauen und keine Paketversion erhöhen.
- Erledigte frühere Pläne bleiben als historische Dokumente erhalten.
```

## Prompt 01 – Bestätigte Randfälle und Type-Reexport korrigieren

```text
Wende den Basis-Prompt an. Lies die aktuelle Fortschrittsdatei und behebe nur
die folgenden drei Punkte, sofern sie im aktuellen Code noch vorliegen.

A. DataTable:
Prüfe packages/core/src/accessibility/data-table.tsx. Ein ungültiges Date-Objekt
darf weder SSR noch Client-Rendering durch toISOString() abbrechen lassen.
Definiere eine zum vorhandenen Missing-Value-Verhalten passende Ausgabe.
Gültige Datumswerte und vorhandene APIs bleiben unverändert.
Regression: Serverrendering mit gültigem Datum, invalid Date und null.

B. downsampleByStride:
Prüfe packages/core/src/performance/downsample.ts. Das letzte Originaldatum
muss erhalten bleiben, auch wenn es 0, false, leerer String, null oder undefined
ist. Nutze zur Auswahl von Anfang und Ende Originalpositionen statt Truthiness
oder Vergleich des Datenwertes.
Regression: [1, 2, 3, 0] mit threshold 2 muss mit 0 enden. Gleiche Werte an
verschiedenen Positionen dürfen nicht als dieselbe Position behandelt werden.
Erhalte dokumentierte Threshold-/Längen-Konventionen; ändere sie nicht still.
Prüfe leere und kurze Arrays sowie unveränderte Objektidentitäten.

C. ScatterSizeScale:
Untersuche den Type-Reexport zwischen charts/types.ts, charts/scatter-size.ts
und series/scatter-series.tsx. Beseitige die Warnungsursache möglichst durch
direkten Type-Import aus der Definition. Falls nötig ein kleines unabhängiges
Typmodul nutzen. Öffentliche Exports nicht entfernen und Warnungen nicht filtern.

Führe fokussierte Regressionstests und die passenden Paketchecks aus.
Prüfe im tatsächlichen Build, ob die Warnung verschwunden ist.

Abnahme:
- Die zwei Datenrandfälle sind reproduzierbar getestet und behoben.
- Keine Änderung am Samplingalgorithmus über diesen Bugfix hinaus.
- Keine neue Runtime-Abhängigkeit und keine inkompatiblen Exports.
- Ergebnisse in roadmap-progress.md dokumentiert.
```

## Prompt 02 – Git-Hygiene und Docs-Prüfung für Pull Requests

```text
Wende den Basis-Prompt an. Bereinige reproduzierbare Entwicklungsartefakte und
ergänze den Docs-Build in der PR-CI.

1. Ermittle mit git ls-files die tatsächlich getrackten Pfade unter node_modules.
   In der historischen Analyse waren es 22 unter packages/core/node_modules.
   Prüfe, ob es ausschließlich generierte Shims, Symlinks und Caches sind.
2. Entferne nur nachweislich generierte Installationsreste aus dem Git-Index,
   ohne lokale Dateien oder uncommittete Nutzerarbeit zu löschen. Verwende eng
   begrenzte Pfade; keine globale Cleanup-Aktion. Prüfe Ignore-Regeln.
3. Behalte Paketdateien und Lockfile als Installationsgrundlage. Ändere keine
   Dependency-Versionen als Nebenwirkung.
4. Dokumentiere die bestehende dist-Policy. Verändere sie in dieser Aufgabe
   nicht. Wenn keine Policy erkennbar ist, halte die Entscheidung offen und
   schlage einen begrenzten Folgeschritt vor.
5. Ergänze .github/workflows/ci.yml oder den tatsächlich zuständigen Workflow
   um einen Docs-Build auf pull_request. Nutze bestehende Node-/pnpm-Versionen,
   Caching und pnpm docs:build. Das ist ein Build-Check, kein PR-Deployment.
6. Aktualisiere veraltete Hinweise in plans/README.md sparsam: erledigte Pie-
   Themen nicht erneut als offen darstellen; neue Roadmap verlinken.

Abnahme:
- Ein frischer Checkout kann ohne getrackte node_modules-Reste installiert werden.
- Keine lokalen Dependencies werden nur wegen der Indexbereinigung gelöscht.
- PRs prüfen die Dokumentation vor Merge.
- Bestehendes Pages-Deployment und Releaseverhalten bleiben intakt.
- Prüfe den Docs-Build und die betroffenen Konfigurationsdateien.
```

## Prompt 03 – Playwright einrichten und echte Balkenklicks prüfen

```text
Wende den Basis-Prompt an. Richte eine kleine Playwright-Suite für echte
Browserinteraktionen ein. Nutze eine vorhandene Testanwendung, sofern geeignet;
sonst eine minimale Preact-/Vite-Fixture ohne den ganzen Dokumentations-Stack.

Beginne mit Chromium und einem klaren test:browser-Skript. Fixture und Server
müssen reproduzierbar starten; keine beliebigen Sleeps. Warte auf sichtbare
Bereitschaft. Vergib gezielte stabile Test-Selektoren.

Prüfe diesen bislang unbestätigten Verdacht:
ChartRoot zeichnet bei eingeschaltetem Pointerhandler ein transparentes
Capture-Rechteck nach den Datenmarken. BarMarks bindet onBarClick an den Pfad.
Kann die Capture-Fläche bei tooltip=true echte Mausklicks auf Balken abfangen?

Schreibe einen echten Browser-Test mit Mauskoordinaten im sichtbaren Balken.
Kein dispatchEvent oder fireEvent direkt am Pfad: Das würde den Verdacht umgehen.
Prüfe tooltip an/aus sowie vertikale und horizontale Orientierung. Verwende im
Test einen sichtbaren Callback-Zähler mit ausgewähltem Datum und Serien-ID.

Falls reproduzierbar:
- Korrigiere die Ereignisarchitektur so, dass Pointerbewegung, Tooltip und
  Balkenaktivierung gleichzeitig funktionieren.
- Keine doppelte Callback-Auslösung durch Bubbling oder zwei Eventpfade.
- Keine Abhängigkeit davon, ob vor dem Klick eine Mousemove ausgelöst wurde.
- Enter/Space bleiben funktionsfähig; in Lücken keinen beliebigen Balken klicken.
- Die optionale Motion-Variante ebenfalls mit einem kleinen Fall prüfen.

Falls nicht reproduzierbar: keinen spekulativen Fix einbauen; den geprüften
Browserfall und das Ergebnis dokumentieren.

Nimm den kleinen Smoke-Test in die PR-CI auf. Browserinstallation und Artefakte
bei Fehlern angemessen konfigurieren; keine große Screenshot-Sammlung erzeugen.

Abnahme: Echte Trefferflächen sind getestet, jeder Klick meldet genau ein
korrektes Ereignis, Tooltips funktionieren weiter. Kein Behaupten eines Fixes
ohne vorherige Reproduktion.
```

## Prompt 04 – Browser-Verhalten, SSR und Accessibility absichern

```text
Wende den Basis-Prompt an. Erweitere die vorhandene Browser-Suite gezielt um
repräsentative Fälle statt jeder möglichen Props-Kombination.

Pflichtfälle:
1. SSR + Hydration: Rendere echtes Servermarkup mit dem vorhandenen Preact-
   Serverrenderer und hydrate es mit identischen Daten. Ein rein clientseitiger
   Mount zählt nicht als Hydrationstest. Prüfe zwei Charts auf eindeutige IDs,
   verknüpfte Titel/Beschreibungen und korrekte Geometrie nach ResizeObserver.
2. Tastatur: Fokus sichtbar, Navigation, Escape, Enter/Space bei aktivierbaren
   Daten; sinnvolle Auswahl nach Datenverkürzung oder ausgeblendeter Serie.
3. Tooltip: An beiden Rändern und in einem schmalen Container sichtbar;
   Positionen nach Scroll und Resize korrekt.
4. Touch: Tap-Auswahl nachvollziehbar, Seitenscrollen bleibt möglich.
5. Darstellungsfälle: Light/Dark, Reduced Motion und ein höherer Zoom-/Skalenfall.

Prüfe außerdem ChartSurface: Name und Beschreibung semantisch korrekt über
aria-labelledby bzw. aria-describedby verknüpfen. Keine unüberlegte Änderung
auf role=application. LiveRegion soll informative Tastaturauswahl melden und
bei Pointerbewegungen keine unnötige Ansageflut erzeugen. Prüfe aktuelle
Semantik zuerst, bevor du etwas änderst.

Nutze wenige deterministische Screenshots mit festen Fixtures und deaktivierten
zufälligen Animationen. Ergänze WebKit und Firefox für kritische SVG-/Pointer-
Fälle, wenn die CI-Laufzeit vertretbar bleibt; Chromium bleibt Pflichtgate.

Dokumentiere eine kurze manuelle Screenreader-Prüfung als Checkliste. Ohne
vorhandene manuelle Ausführung ihren Status ausdrücklich offen lassen.

Abnahme: Die zentralen Nutzerwege funktionieren im Browser; Tests prüfen
Beobachtbares. Fehlende Engines oder manuelle Prüfungen transparent berichten.
```

## Prompt 05 – Performance messen, bevor optimiert wird

```text
Wende den Basis-Prompt an. Erstelle eine kleine reproduzierbare Browser-
Benchmark-Suite auf Basis der Test-Fixture.

Datensätze deterministisch erzeugen:
- 100, 500, 2.000 und 10.000 Punkte;
- Line, gestapelte Line/Area, gruppierte Bar und Scatter;
- mindestens ein Fall mit mehreren Serien, Lücken und gleichen X-Werten.
10.000 Punkte dienen auch als Stressfall, nicht als versprochener SVG-Support.

Messe getrennt:
- initiales Rendern und Datenupdate;
- Interaktionsarbeit im Event-/Frame-Pfad;
- Zeit bis zur nächsten beobachtbaren visuellen Aktualisierung, mit sauber
  dokumentierter Messmethode; nicht als exakte Browser-Paintzeit ausgeben;
- Geometrie-/Stack-Neuberechnungen mittels geeigneter Benchmark-Instrumentierung;
- Node-Anzahl und Resize-Kosten für ausgewählte repräsentative Szenarien.

Warm-up, Wiederholungen, feste Viewports, Browser-Version und Laufzeitumgebung
angeben. Median und p95 ausgeben; Rohmessungen als temporäres/CI-Artefakt halten.
Produktionscode nicht mit globalen Debug-Zählern oder öffentlicher Debug-API belasten.

Lege docs/performance/browser-benchmarks.md mit reproduzierbaren Befehlen,
Baseline und Grenzen an. Ein p95-Ziel von 16 ms bei 2.000 Punkten ist zunächst
ein zu prüfendes Ziel, keine bestehende Leistungsgarantie.

Abnahme:
- Ergebnisse basieren auf ausgeführten Browsermessungen.
- Baseline vor dem Refactoring ist nachvollziehbar vorhanden.
- Zunächst informativer CI-Lauf oder manueller Workflow statt instabiler
  harter Zeitgrenzen auf beliebigen geteilten Runnern.
- Kein Performance-Refactoring in dieser Aufgabe.
```

## Prompt 06 – Consumer-Bundles und gepacktes Paket prüfen

```text
Wende den Basis-Prompt an. Ergänze die bestehende Dist-Dateiliste um echte
Consumer-Messungen und einen Paket-Smoke-Test.

Prüfe scripts/bundle-size-report.mjs. Behalte den Bericht, benenne seine Metrik
aber klar als Dist-Inventar. Einzelne Stub-Dateien sind keine Chart-Bundlegröße.

Baue minimale Consumer-Fixtures:
- LineChart, BarChart, DonutChart;
- Dashboard mit mehreren Charts;
- gezielte animierte Variante über den Motion-Einstiegspunkt.
Nutze optimierte Produktionsbundles mit nachvollziehbarer Bundler-Konfiguration.
Berichte minifiziertes JS sowie gzip und Brotli. CSS separat ausweisen.
Falls Preact externalisiert wird, die externe Laufzeit ausdrücklich ausweisen;
für den tatsächlichen Gesamtumfang auch eine Variante inklusive Preact messen.
Vergleiche für einen Fall Root-Import und Subpath-Import nach Tree-Shaking.

Packe das veröffentlichbare Paket mit pnpm pack und installiere den Tarball in
einen temporären Consumer außerhalb der Workspace-Auflösung.
- Typprüfung und Build müssen über veröffentlichte Paket-Exports funktionieren.
- Ein statischer Consumer enthält weder motion noch @kamod-ch/motion.
- Prüfe fehlende Motion-Peers in einem wirklich isolierten Dependency-Graph.
- Die CSS-Datei muss im Paket vorhanden und importierbar sein.
- Eine zweite Variante installiert die deklarierten optionalen Motion-Peers.
- Paketverbrauch darf weder source-Aliasse noch Workspace-Dateien benötigen.

Automatisiere die Messung mit einem klaren Skript. Leite Größenbudgets aus den
gemessenen Baselines ab. Bei >10 % Wachstum zunächst einen nachvollziehbaren
Reviewhinweis bzw. ein bewusst konfiguriertes Budget vorsehen.

Abnahme: Reproduzierbarer Consumer-Bericht und Tarball-Smoke-Test bestehen.
Keine pauschalen Bibliothekswechsel allein wegen der Dist-Gesamtsumme.
```

## Prompt 07 – Gemeinsames kartesisches Layout und Stack-Caching

```text
Wende den Basis-Prompt an. Nutze die Benchmark-Baseline aus Schritt 05 und
refaktoriere die redundanten kartesischen Berechnungen intern.

Untersuche insbesondere:
- charts/line-chart.tsx, area-chart.tsx und bar-chart.tsx;
- charts/cartesian-interaction.ts und cartesian-active-layers.tsx;
- series/cartesian.ts, stack.ts und stacked-line-points.ts;
- Chart-Kontext, Achsen und responsive Größenauflösung.

Ziel:
Pro Änderung an Daten, relevanten Serien, Sichtbarkeit, Domain oder Plotgröße
ein gemeinsames konsistentes Layoutmodell aufbauen. Es enthält die tatsächlich
benötigten Skalen, projizierten Positionen bzw. Balkengeometrien, stabile
Originalindizes und gegebenenfalls vorberechnete Stack-Layer.

Implementierung:
1. Stabilisiere sichtbare Serien und Stack-Konfigurationen mit sinnvoller
   Memoisierung. Keine pauschale Deep-Equality und kein JSON.stringify-Caching.
2. Richte Rendering, Hit-Testing und Active-Layer auf dieselbe Geometrie aus.
3. getStackedSeriesValueAt darf bei einer Auswahl nicht alle Layer neu berechnen.
   Bestehende öffentlich exportierte Helfer kompatibel lassen; intern einen
   vorberechneten Lookup nutzen.
4. Berechne gemeinsamen Active-Context für Tooltip, Crosshair und LiveRegion.
5. Verwende tatsächlich gemessene Plotgröße, keine abweichende Fallback-Geometrie
   nach Resize. Stabile Serien-IDs auch nach Legendentoggles erhalten.
6. Falls Scatter ein anderes Datenmodell benötigt, seine Modellgrenze erhalten;
   kein universelles Chart-Framework erzwingen.

Abnahme:
- Reine Pointerbewegung baut Domains, komplette Geometrie und Stacks nicht neu.
- Lücken, negative Stack-Werte, verborgene Serien und mehrere Chartinstanzen
  behalten die korrekte Bedeutung.
- Die bestehende öffentliche API funktioniert weiter.
- Fokussierte Tests bestätigen Semantik und Cache-Invalidierung bei echten
  Modelländerungen; Benchmarks liefern Vorher/Nachher-Werte.
```

## Prompt 08 – Suchindex und Pointerupdates optimieren

```text
Wende den Basis-Prompt an. Nutze das gemeinsame Layoutmodell aus Schritt 07
und optimiere die Verarbeitung von Pointerbewegungen.

1. Für monoton sortierte numerische und zeitliche X-Positionen einen beim
   Modellaufbau erzeugten Suchindex verwenden. Nächsten Wert per binärer Suche
   ermitteln. Das Vorbereiten bzw. Prüfen der Sortierung darf nicht bei jeder
   Pointerbewegung erneut über alle Punkte laufen.
2. Für gleiche X-Werte deterministische Tie-Break-Regeln definieren und mit dem
   bisherigen Verhalten abgleichen. Originalindizes bewahren. Unsortierte und
   kategoriale Daten behalten einen korrekten Fallback.
3. Höchstens ein geplantes Pointerupdate pro Animationsframe verarbeiten.
   Innerhalb des Frames den neuesten Wert nutzen. Pointerleave, Escape,
   Unmount, Datenwechsel und Resize dürfen keinen veralteten Frame anwenden.
4. Verhindere doppelte Verarbeitung durch Capture-Fläche und Event-Bubbling.
   Tastaturaktionen und echte Aktivierungen nicht unnötig verzögern.
5. Bei Scatter zunächst die vorberechneten Kandidaten wiederverwenden. Einen
   räumlichen Index nur dann ergänzen, wenn die Messungen seinen Nutzen zeigen;
   Entscheidung und Zusatzkosten dokumentieren.

Abnahme:
- Randpunkte, gleiche X-Werte, unsortierte Daten und Lücken korrekt ausgewählt.
- Bei einer schnellen Sequenz endet die Auswahl am neuesten Pointerwert.
- Kein zurückkehrender Tooltip nach Pointerleave oder Escape.
- Browser-Regressionen und Benchmarks bestehen; Messresultate separat vom
  gewünschten p95-Ziel berichten.
```

## Prompt 09 – High-Level-Achsen-, Domain- und Layout-API ergänzen

```text
Wende den Basis-Prompt an. Erweitere die fertigen kartesischen Charts um die
praktisch benötigten Achsen- und Layoutoptionen.

Lies die aktuellen Typen und vorhandenen Low-Level-Funktionen. Schreibe ein
kurzes RFC in docs/rfc mit den konkreten TypeScript-Typen, Defaults und einem
Beispiel. Nutze vorhandene Namenskonventionen. Setze anschließend die kompatible
kleine Lösung um; bleibe nicht bei einem Plan stehen.

Umfang:
- Explizite X-/Y-Domains, soweit für den jeweiligen Chart fachlich gültig.
- Achsenformatter, Tickanzahl, Sichtbarkeit sowie sinnvolle bestehende Optionen.
- margin, class und style bis zur vorgesehenen Ebene durchreichen.
- Einheitlicher konfigurierbarer Empty-State für fertige Charts.
  Loading/Error als dokumentierte Wrapper-Komposition ohne Datenfetching im Core.
- Beide Balkenorientierungen unterstützen und semantische Kategorie-/Wertachsen
  sauber erklären. Keine ungültigen Optionen still ignorieren.

Definiere die Präzedenz: explizite Domain vor Inferenz; gemeinsame Skalen für
Achse, Serie, Grid, Annotation und Hit-Testing. Ein nice-Schritt darf keine
getrennten effektiven Domains erzeugen. Legendentoggles dürfen feste Domains
nicht unbeabsichtigt ändern. Verhalten für Daten außerhalb der Domain festlegen
(inklusive Clipping bzw. ausdrücklich dokumentierter Darstellung).

Keine zweite Y-Achse oder ComboChart in dieser Aufgabe. Vorhandene Defaults
müssen bestehende Diagramme erhalten.

Abnahme:
- Zwei Charts mit unterschiedlichem Datenumfang zeigen dieselbe feste Y-Domain.
- Formatter funktionieren bei Zahlen, Datum und Kategorien passend zur Achse.
- Responsive Plotgröße, Tooltip und Annotationen bleiben deckungsgleich.
- Ein leerer Chart zeigt das konfigurierte Empty-State ohne ungültige SVG-Nodes.
- Öffentliche Type-Tests, Exportprüfung und Docs-Beispiele sind aktualisiert.
```

## Prompt 10 – Kontrollierte Auswahl, Legenden und Aktivierung

```text
Wende den Basis-Prompt an. Ergänze eine additive API für extern gesteuerte
Interaktion. Lies das RFC aus Schritt 09 und ergänze eine kurze Entscheidung
über Zustandsmodell und Ereigniskontext vor der Implementierung.

Anforderungen:
1. Kontrollierte und unkontrollierte Auswahl mit klaren Defaults und null als
   ausdrücklich keiner Auswahl. Stabile Serien-ID plus Datum-/X-Bezug statt
   ausschließlich instabiler sichtbarer Serienindizes verwenden.
2. Extern steuerbare Serien-Sichtbarkeit mit Change-Callback und einer
   funktionierenden externen Legende. Bestehende interne Legende bleibt nutzbar.
3. Konsistenter Aktivierungskontext für Drill-down, etwa Datum, Originalindex,
   Serien-ID, X-Wert und Eingabequelle. Exakte Typen aus realen Chartmodellen
   ableiten, keine aufgezwungene kartesische Semantik für Kreisdiagramme.
4. Bestehende onBarClick-/onSegmentClick-Callbacks kompatibel erhalten. Eine
   Benutzeraktion darf keinen Callback doppelt auslösen.
5. Unterschied zwischen Zustandsänderung und Benutzerabsicht dokumentieren:
   Wenn ein Parent kontrollierte Props aktualisiert, keine Rückkopplung durch
   erneutes Emittieren derselben Änderung erzeugen.
6. Datenänderung, ausgeblendete aktive Serie und ungültig gewordene Auswahl
   deterministisch behandeln. Die Anwendung besitzt kontrollierten State.

Zunächst die kartesischen Charts konsistent ausstatten; Pie/Donut nur mit
sauber modellierter kompatibler Auswahl ergänzen. Keine verpflichtende globale
State-Library hinzufügen.

Abnahme:
- Externe Steuerung sowie bisheriges unkontrolliertes Verhalten funktionieren.
- Mouse, Tastatur und Tap können denselben fachlichen Drill-down auslösen.
- Keine Callback-Schleifen beim Parent-Update.
- Tests decken aktive Daten nach Filterung, Neuordnung und Legendenauswahl ab.
- Galerie enthält ein vollständiges Beispiel mit externer Legende.
```

## Prompt 11 – Locale, Zeitzone und Standardtexte konsistent machen

```text
Wende den Basis-Prompt an. Implementiere explizite Formatierungsoptionen für
Locale und Zeitzone sowie anpassbare Standardtexte.

Prüfe Default-Formatter in cartesian-active-layers, Achsenticks, Pie/Donut,
DataTable und ChartDescription. Vermeide globale mutable Locale-Einstellungen
und globales d3.formatDefaultLocale/timeFormatDefaultLocale pro SSR-Anfrage.

Umsetzung:
- Definiere additive Optionen pro Chart oder einen optionalen Preact-Provider
  mit klarer Überschreibung durch lokale Props. Nur nötige Abstraktion einführen.
- Locale und Zeitzone für Server und Client identisch übergeben können.
- Cache Intl-Formatter anhand der tatsächlich relevanten Optionen, ohne
  veränderlichen Zustand zwischen SSR-Anfragen zu teilen.
- Benutzerdefinierte Formatter haben klar dokumentierte Präzedenz.
- Zahlen, Währungen und Datumslabels für Tooltip, Achse und tabellarische
  Alternative konsistent formatieren, soweit dieselbe Semantik verlangt ist.
- UTC-/lokale Zeitskalen und die Darstellung in einer anderen Zeitzone
  unterscheiden. Nur Intl-Labels ändern nicht automatisch die Tick-Geometrie.
- Empty-State, Datenpunkt-/Serienbeschreibungen und Tastaturhinweise anpassbar
  machen. Bestehende Defaults nicht unbeabsichtigt inkompatibel ändern.
- Kein zwingendes @kamod-ch/i18n im Chart-Core; native Intl-APIs bevorzugen.

Abnahme:
- de-CH/CHF, de-AT/EUR und en-US funktionieren mit konkreten Beispielen.
- Tests prüfen Zahlenformatierung, ungültige Daten und Zeitpunkte nahe einem
  Tageswechsel in UTC gegenüber Europe/Vienna.
- SSR und Hydration mit derselben Konfiguration liefern konsistente Labels.
- Zwei gleichzeitig servergerenderte Locale-Varianten beeinflussen sich nicht.
- Relevante öffentliche Typen und Docs sind vollständig aktualisiert.
```

## Prompt 12 – Min/Max-Downsampling mit Datenherkunft

```text
Wende den Basis-Prompt an. Ergänze den bestehenden Stride-Helfer um ein
explizit nutzbares Min/Max-Sampling für numerische/zeitliche Linien.
Kein automatisches Sampling aller Charts einführen.

API und Semantik zuerst kurz dokumentieren, anschließend implementieren:
- Originaldaten unverändert lassen; Ergebnis referenziert Originaldatum und
  Originalindex bzw. liefert eine eindeutige Indexauswahl.
- Eindeutige Regeln für Budget, zu kleine Budgets, Endpunkte und zeitliche
  Reihenfolge festlegen. Mehrfach ausgewählte Originalindizes deduplizieren.
- Minima und Maxima pro Bucket erhalten. Unterschied zu bloßem Stride zeigen.
- Lücken in zusammenhängende Abschnitte aufteilen; kein scheinbar durchgehender
  Pfad über fehlende Werte. Bei vielen Lücken Zielkonflikte zum Punktbudget
  ausdrücklich regeln und dokumentieren.
- Unsor­tierte X-Daten nicht still umsortieren; Vorbedingungen prüfen oder einen
  klar dokumentierten korrekten Fallback liefern.
- Für mehrere Serien dieselbe X-Indexauswahl verwenden. Falls die Vereinigung
  der Extrema das Budget überschreitet, eine definierte Strategie wählen.
- Für Stacking zunächst keinen automatischen Einsatz behaupten: entweder die
  kumulierten Grenzen gemeinsam berücksichtigen und testen oder es ausdrücklich
  als vorerst nicht unterstützten Samplingmodus begrenzen.

Ergänze optional LTTB erst als separate Erweiterung, wenn Min/Max stabil ist;
es ist für diese Aufgabe nicht erforderlich.

Abnahme:
- Eine schmale Traffic-Spitze bleibt im Vergleichsbeispiel erhalten.
- Endpunkte, negative Werte, konstante Werte und Lücken sind getestet.
- Tooltip und Auswahl melden korrekte Originaldaten nach Sampling.
- DataTable kann weiterhin die vollständigen fachlichen Originaldaten zeigen.
- Consumer-Export und ein 10.000-Punkte-Benchmark sind ergänzt.
```

## Prompt 13 – Zeitreihen nach X-Wert synchronisieren

```text
Wende den Basis-Prompt an. Implementiere eine kleine Preact-Komposition für
mehrere synchronisierte Zeitreihencharts auf Basis der kontrollierten API.

Beginne mit einem Rezept mit gehobenem State. Falls echte Wiederverwendung
sichtbar wird, einen kleinen Hook ergänzen und dessen Export bewusst wählen.
Kein globaler Eventbus, kein zwingendes kamod-state/signals und kein neuer
Framework-Layer.

Anforderungen:
- Synchronisierung nach fachlichem X-Wert bzw. Timestamp, nicht nach Arrayindex.
- Zwei Charts mit unterschiedlichen Zeitrastern und verschiedenen Punktzahlen
  müssen korrekt zusammenarbeiten, auch wenn eines gesampelt ist.
- Strategie nearest/exact und optionaler maximaler zeitlicher Abstand klar
  definieren. Kein Treffer darf nicht als irreführender Nullwert erscheinen.
- Ein gemeinsamer Domain-/Viewport-State kann an beide Charts übergeben werden;
  in dieser Aufgabe keine vollständige Brush-/Zoom-Oberfläche bauen.
- Quelle einer Interaktion beachten; ein empfangenes Parent-Update darf kein
  neues Synchronisierungsereignis erzeugen.
- Verlassen, Escape, Tastaturfokus und gesperrte Auswahl klar definieren.
  Wenn zwei Charts gleichzeitig fokussiert/bedient werden, gewinnt eine
  ausdrücklich dokumentierte Benutzeraktion.
- Tooltips mit Locale-/Zeitzonenoptionen aus Schritt 11 formatieren.

Abnahme:
- Ein Beispiel zeigt Aufrufe pro Stunde und Bewerbungsklicks in einem anderen
  Zeitraster mit korrekter gemeinsamer Auswahl.
- Fehlende Zeitpunkte, große Lücken und gesampelte Daten werden korrekt behandelt.
- Keine Render-/Callback-Schleife und keine globale SSR-Zustandsverschmutzung.
- Browser-Test prüft wechselseitige Pointer- und Tastaturauswahl.
```

## Prompt 14 – Analytics-Rezepte für das Kamod-Ökosystem

```text
Wende den Basis-Prompt an. Erstelle kopierbare Analytics-Rezepte in der
bestehenden PreactPress-Dokumentation und nutze reale Paket-Exports.

Baue ein vollständiges Dashboard-Beispiel für Devjobs.ch:
- KPI-Karten: Seitenaufrufe, Jobdetail-Aufrufe und externe Bewerbungsklicks.
- Zeitreihe für Traffic mit Vorperiode und ausdrücklich gleichen Domains.
- Balkenvergleich nach Quelle und synchronisierte Zeitreihenauswahl.
- Externe Legende, Zeitraumfilter und Formatierung für de-CH.
- Empty-, Loading- und Error-Ansichten in der Dashboard-Komposition.
- Tastatur und schmale Ansichten sinnvoll unterstützen.

Verwende vorhandene Kamod-UI-/Icon-/Theme-Abhängigkeiten der Docs, sofern ihre
Exports verifiziert sind. Keine neue UI-Bibliothek hinzufügen.

Daten:
- Verwende eine klar als synthetisch gekennzeichnete Fixture.
- Definiere einen kleinen typisierten Datenadapter, der fachliche Dashboard-
  Daten in Chartdaten übersetzt. Charts kennt kein Tracking-Backend.
- Externe Bewerbungsklicks sind keine nachgewiesenen Bewerbungen. Beschrifte
  Metriken korrekt und definiere Zähler/Nenner bei Conversion-Raten. Verwende
  keine Session-/Unique-Metrik, die die Fixture bzw. Datenquelle nicht liefert.
- Eine kamod-tracking-Integration nur dann als umgesetzt bezeichnen, wenn die
  aktuelle Tracking-API eingesehen und im passenden Projekt getestet wurde.
  Ohne diese Prüfung nur einen dokumentierten Adaptervertrag liefern.

Dokumentation:
- Vollständige importierbare Beispiele ohne interne Docs-Aliasse zum Kopieren.
- Erläutere notwendige Theme-Imports und optionale Motion-Peers.
- Ergänze ein kleineres PreactHub-Rezept mit denselben Basiskomponenten.
- Verlinke passende vorhandene Chart-Lab-/API-Seiten.

Abnahme: Docs-Build, kopierbarer Consumer und Browser-Smoke-Test bestehen.
Keine produktive Website und kein weiteres Repository in dieser Aufgabe ändern.
Reale Integrationen bleiben als solche offen, bis sie separat umgesetzt wurden.
```

## Prompt 15 – Gesamtprüfung und Release vorbereiten

```text
Wende den Basis-Prompt an. Prüfe den erreichten Gesamtstand und bereite einen
reviewbaren Releasekandidaten vor. Nicht veröffentlichen, nicht taggen und nicht
pushen; bestehende Paketversion nicht allein aufgrund dieses Prompts erhöhen.

1. Lies roadmap-progress.md und prüfe erledigte Einträge am tatsächlichen Code.
2. Führe die aktuellen Aggregate-Checks aus: Typecheck, Oxlint, Oxfmt-Check,
   Tests, Build und Exportprüfung; außerdem Docs, Browser-Smoke-Tests sowie
   Tarball-Consumer. Nutze die eingeführten tatsächlichen Skripte.
3. Führe die relevanten Performance- und Bundlemessungen auf vergleichbarer
   Grundlage aus. Berichte reale Vorher/Nachher-Werte mit Messumgebung.
   Größere Bundles oder langsamere Fälle offen erklären.
4. Prüfe neue APIs auf Defaults, Präzedenz, kontrollierte Zustände, SSR,
   Locale-Grenzen, Theme-Tokens, optionale Motion-Abhängigkeiten und Exports.
5. Prüfe Änderungen an package.json/Lockfile auf unnötige Abhängigkeiten und
   zufällige Versionsupdates. Erhalte die vereinbarte dist-Policy.
6. Ergänze CHANGELOG unter Unreleased mit nutzerbezogenen Änderungen,
   Kompatibilität und eventuell nötigen Migrationen.
7. Aktualisiere Releasecheckliste und Dokumentation. Unausgeführte manuelle
   Screenreader-/Geräteprüfungen bleiben ausdrücklich offen.
8. Erstelle docs/development/release-candidate.md mit Ergebnissen, Einschränkungen,
   offenen Blockern und vorgeschlagenem nächsten Versionsschritt.

1.0 nicht nur anhand grüner Tests empfehlen. Die Roadmap verlangt auch einen
stabilen öffentlichen API-Vertrag und mindestens zwei reale Integrationen.
Ein Docs-Dashboard mit Fixture ist keine produktive Integration.

Abnahme: Ein Reviewer kann nachvollziehen, welche Änderungen bereit sind,
welche noch nicht und welche Prüfungen wirklich durchgeführt wurden.
Wenn ein Check scheitert, innerhalb dieses Umfangs beheben oder konkret als
offenen Blocker dokumentieren. Kein künstlich grüner Releasebericht.
```

## Optionale Erweiterungen – erst nach dem Kernprogramm

Diese drei Prompts sind unabhängig von einem 1.0-Versprechen. Wähle sie anhand eines konkreten Anwendungsfalls; sie gehören nicht zum geschätzten Kernaufwand der Roadmap.

### Prompt A – Sparkline als schlankes Rezept

```text
Wende den Basis-Prompt an. Ergänze ein kompaktes Sparkline-Rezept für KPI-Karten.
Verwende vorhandene Line-/Area-Bausteine ohne neue Runtime-Abhängigkeit.

Anforderungen: kleine feste Höhe, optionaler responsiver Container, ausgeblendete
Achsen, transparente Bedeutung von Min/Max bzw. fester Domain, Lücken und negative
Werte korrekt. Semantische Tokens statt fester Markenfarben. Titel und kurze
textliche Zusammenfassung auch ohne Tooltip anbieten.

Beginne als dokumentierte Komposition. Einen öffentlichen Sparkline-Wrapper nur
einführen, wenn er eine klar nützliche stabile API bietet. Optionaler Trendtext
muss Zeitfenster und Vergleichsgrundlage nennen; kein irreführender Prozentwert
bei einer Basis von null.

Abnahme: kopierbares KPI-Beispiel, SSR, schmale Ansichten und Dark Mode geprüft;
kein unnötiger Motion-Import in statischen Sparklines.
```

### Prompt B – ComboChart aus Bar und Line

```text
Wende den Basis-Prompt an. Entwickle zunächst eine dokumentierte Kombination
aus Bar und Line auf dem gemeinsamen kartesischen Layout.

Nutze vorhandene Serien und Skalen. Gemeinsame X-Domain, eindeutige Serien-IDs,
ein Tooltip und eine Legende. Starte mit derselben Y-Einheit für beide Serien.
Ergänze keine zweite Y-Achse ohne ausdrückliche Typzuordnung und klar sichtbare
Einheiten. Volumen und Prozentwerte dürfen nicht auf einer unbeschrifteten
gemeinsamen Skala erscheinen.

Prüfe negative Balken, fehlende Linienwerte, Legendenauswahl und responsive
Hit-Tests. Externe Aktivierung über die bestehende kontrollierte API integrieren.
Nur dann einen High-Level-Wrapper exportieren, wenn das Rezept eine stabile
wiederverwendbare Props-Schnittstelle begründet. Bestehende APIs erhalten.

Abnahme: korrektes kombiniertes Beispiel, klarer Einheitenvertrag und Browser-
Tests für Tooltip und Legende; keine duplizierte Geometrie-Engine.
```

### Prompt C – Histogramm mit expliziten Bin-Regeln

```text
Wende den Basis-Prompt an. Ergänze einen typisierten Histogramm-Helfer und ein
darauf aufbauendes Beispiel mit vorhandenen Balkenprimitiven.

Definiere untere/obere Bin-Grenzen, Inklusionsregeln, Verhalten am oberen Rand,
Anzahl bzw. feste Grenzen der Bins, leere Eingabe, konstante Werte und nicht
endliche Werte. Negative Zahlen unterstützen. Nicht ungeprüft kategoriale
BarChart-Abstände als kontinuierliches Histogramm ausgeben.

Der Helfer soll Counts und nötige Originalindex-Zuordnung liefern. Daten und
Grenzen nicht mutieren. Tooltip zeigt Intervall und Anzahl; DataTable und
Beschreibung erklären dieselbe Verteilung. Keine automatische Aussage über
Wahrscheinlichkeitsdichte oder Normalverteilung aus Counts ableiten.

Abnahme: Grenzwerttests, ein reproduzierbares Verteilungsbeispiel, korrekte
öffentliche Exports und eine verständliche Dokumentation der Bin-Semantik.
```
