# Kamod Charts: SVG-Ausbau und Cursor-Prompts

Stand: 20. Oktober 2026. Geprüfter Commit: `001ad79c65c5ece59cb9fae287331a9eaae8b050`.

## Ergebnis der erneuten Prüfung

Empfehlung: Zuerst bestehende SVG-Funktionen absichern, danach Viewport und Monitoring ergänzen. Canvas bleibt ein späterer, optionaler Renderer. Keine vollständige Neuentwicklung und kein pauschales Refactoring.

Diese Analyse beruht auf Repository-Baum, öffentlichen Typen und gezielt gelesenen Implementierungen. Tests und Browser-Benchmarks wurden hier nicht ausgeführt. Konkrete Fehlerhypothesen sind durch die unten verlangten Regressionstests zu bestätigen.

### Änderungen gegenüber der vorherigen Einschätzung

Bereits hinzugekommen sind SVG-Export, svgRef/Surface-Optionen, Defs-/Clipping-Optionen, aspectRatio, benutzerdefinierte Punkt-/Balken-Renderer und Achsen-Kollisionsstrategien. Diese Funktionen nicht neu bauen. Insbesondere ist „SVG-Export fehlt“ inzwischen überholt.

### Befunde und Priorität

| Priorität | Befund                                                                                                     | Konsequenz                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| P0        | Benchmark markiert das Update unmittelbar nach setData; Runner wartet nur auf SVG, nicht auf Messabschluss | Zeiten messen nicht verlässlich den fertigen Update-Zyklus; explizites Messprotokoll nötig |
| P0        | Bar-Benchmark reduziert Daten vor dem Rendern auf ungefähr 24 Zeilen                                       | Rohdatenzahl und tatsächlich gezeichnete Elemente getrennt ausweisen                       |
| P0        | Min/Max-Downsampling entfernt ungültige Werte in seinem Reduktionspfad                                     | Datenlücken können verschwinden; segmenterhaltende Reduktion ergänzen                      |
| P0        | Export sammelt Tokens vom Element aufwärts und überschreibt schon gefundene Werte                          | Übergeordnete Theme-Werte können lokale Overrides verdrängen                               |
| P0        | Exportmodus all-computed sammelt aktuell nur Custom Properties                                             | Name verspricht mehr als die Implementierung; reguläre SVG-Stile separat absichern         |
| P1        | Tick hide verwendet horizontale Breitenlogik, lässt ersten/letzten Tick immer sichtbar                     | Y-Achsen, umgekehrte Positionen und Randkollisionen absichern                              |
| P1        | High-Level-Props haben yDomain, aber kein kontrolliertes xDomain                                           | Gemeinsames Viewport-Modell als Basis für Zoom und Streaming                               |
| P1        | Annotationen unterscheiden sich nach Charttyp                                                              | Vorhandene Primitive konsistent zugänglich machen                                          |
| P1        | Kein dediziertes Zoom-/Pan-/Brush-/Streaming-Modul im geprüften Source-Baum                                | Schrittweise ergänzen, nach aktueller Bestandsprüfung                                      |
| P2        | PNG/CSV, Sparkline, Histogramm, Heatmap                                                                    | Erst nach stabilem Dashboard-/Monitoring-Kern                                              |

### Grenzen der Befunde

Tick-Kollisionen existieren bereits, arbeiten aber heuristisch mit etwa 6,5 Pixeln pro Zeichen. Nicht pauschal durch DOM-Messung ersetzen: SSR braucht einen deterministischen Anfangszustand. Ein neuer Renderer beseitigt weder falsches Downsampling noch schlechte Messmethoden.

## Umsetzung in Reihenfolge

1. Prompt 00: Bestand und Ausgangsqualität feststellen.
2. Prompts 01–04: Benchmarks, Datenlücken, Export, Achsen absichern.
3. Prompts 05–08: Viewport, Zoom/Pan, Brush/Synchronisation, Annotationen.
4. Prompts 09–11: Streaming, SVG-Demo, Abschlussprüfung und Canvas-Entscheidung.
5. Optionale Prompts 12–13 nur ausdrücklich auswählen.

Ein Prompt ist eine eigenständige Arbeitseinheit. Nach einem roten Gate nicht zum nächsten Feature wechseln. Die unten genannten API-Namen für neue Funktionen sind Vorschläge, keine Behauptung vorhandener Exporte.

## Gemeinsamer Arbeitsauftrag für Cursor

Diesen Block zuerst in Cursor einfügen; danach die ausgewählten nummerierten Prompts oder die ganze Datei als Kontext übergeben.

```text
Du arbeitest im Repository kamod-ch/kamod-charts. Verwende den vorhandenen build-with-kamod Skill, falls verfügbar, und lies alle geltenden AGENTS.md sowie die bestehenden Entwicklungsregeln.

Ziel: Die ausgewählten Prompts dieses Dokuments vollständig implementieren, prüfen und dokumentieren. Nicht nur einen Plan schreiben. Arbeite sequenziell und überprüfe vor jedem Schritt, ob die Funktion mittlerweile vorhanden ist. Erweitere vorhandene Implementierungen statt parallele Systeme zu schaffen.

Regeln:
- Prüfe git status und bewahre fremde/uncommittete Änderungen. Keine destruktiven Git-Befehle.
- Kein pauschales Refactoring, keine Umbenennungen ohne Bedarf, keine neue Architektur außerhalb des aktuellen Prompts.
- Preact-native, SVG-first, ESM, SSR-sicher. Kein React/ReactDOM/compat und keine D3-DOM-Manipulation.
- Vorhandenen Package Manager und Subpath-Exports verwenden. Öffentliche APIs rückwärtskompatibel erweitern.
- Oxlint und Oxfmt verwenden; bestehende Theme-Tokens, Accessibility und Reduced Motion erhalten.
- Neue Abhängigkeiten nur wenn notwendig; zuerst Plattform-APIs und vorhandene Helfer prüfen.
- Reproduzierbare Regressionstests für Fehler; gezielte Browser-Tests für Koordinaten, Gesten, Export und Hydration. Tests nicht durch schwächere Assertions oder gelöschte Cases grün machen.
- Keine veröffentlichten Performance-Zahlen erfinden. Nicht ausgeführte Prüfungen ausdrücklich ausweisen.
- Kein Publish, Push oder Merge. Kein Canvas-Renderer in diesen Pflichtprompts.

Arbeite innerhalb des gewählten Umfangs ohne Rückfragen zu üblichen Implementierungsdetails. Dokumentiere begründete Entscheidungen. Bei fehlendem Zugang oder einer nicht sicher lösbaren API-Inkompatibilität den betroffenen Schritt als blockiert festhalten.

Führe pro Schritt passende Tests, pnpm typecheck, pnpm lint und Oxfmt für geänderte Dateien aus; anschließend pnpm format:check. Bei öffentlichen API-/Exportänderungen zusätzlich Build, Exportprüfung und Consumer-Smoke. Führe die vollständigen Gates spätestens am Meilensteinende aus.

Pflege docs/development/svg-monitoring-progress.md mit Prompt-ID, Status, Dateien, Entscheidungen, Prüfkommandos und Ergebnissen. Ein Schritt ist nur erledigt, wenn seine Abnahmekriterien erfüllt sind. Bestehende fremde Fehler getrennt ausweisen.
```

## Prompt 00 – Aktuellen Bestand prüfen

```text
Wende den gemeinsamen Arbeitsauftrag an. Prüfe den aktuellen Checkout gegen den Analyse-Commit 001ad79c65c5ece59cb9fae287331a9eaae8b050. Ein neuerer Checkout ist maßgeblich; nichts zurücksetzen.

Lies package.json, pnpm-lock.yaml, tsconfig, Exporte, Entwicklungsregeln, Chart-Typen, ChartContext/Layout, Surface/Clipping, Achsen, Downsampling, Interaktion/Synchronisation, Export sowie relevante Tests und Browser-Fixtures.

Erstelle docs/development/svg-monitoring-baseline.md mit einer Matrix: bereits vorhanden / teilweise vorhanden / fehlt / durch Tests zu bestätigen. Prüfe besonders xDomain, Viewport, Zoom, Brush, Streaming, Tick-Kollisionen, SVG-Export und Render-Slots. Nenne konkrete Dateipfade und aktuelle Commit-ID.

Führe die vorhandene Ausgangsprüfung pnpm check aus und erfasse echte Ergebnisse. Bei fehlenden Dependencies verwende die festgelegte pnpm-Version und den Lockfile-konformen Installationsweg. Behebe keine fachfremden Probleme.

Abnahme: nachvollziehbare Ausgangsbasis und aktualisierte Reihenfolge. Bei bereits vollständig umgesetzten Folgeprompts deren Verhalten prüfen und als erledigt markieren. In diesem Schritt keine neuen Chartfeatures bauen.
```

## Prompt 01 – Browser-Benchmarks reparieren

```text
Wende den gemeinsamen Arbeitsauftrag an. Untersuche scripts/browser-benchmark.mjs und packages/browser-fixture/src/BenchmarkFixture.tsx.

Aktueller Verdacht: markUpdated wird direkt nach setData ausgeführt und kann vor markReady liegen. Der Runner wartet nicht explizit auf vollständige Messungen. Fehlende Messwerte werden als 0 maskiert. Beim Bar-Fall werden ungefähr 24 statt der ausgewiesenen Rohdatenzeilen gezeichnet.

Implementiere ein explizites Messprotokoll mit Run-ID, initial-ready, update-start und update-complete. Der Runner löst ein reproduzierbares Update erst nach initial-ready aus und wartet auf das Ende desselben Runs. Bestätige DOM-Commit und einen dokumentierten Frame-Beobachtungspunkt. rAF bzw. doppeltes rAF nicht als exakte GPU-/Paint-Messung bezeichnen. Unterscheide Navigations-/Startzeit von Updatezeit.

Fehlende, negative und nicht endliche Werte müssen einen Messfehler ergeben statt 0. Alle Timer/rAF-Callbacks und globale Fixtures sauber aufräumen. Exportiere Rohmessungen als JSON und generiere den Bericht daraus. Pro Szenario Rohpunkte, Serien, sichtbare Punkte/Marks, Animationseinstellung und Downsampling angeben.

Nutze reproduzierbare Daten, Warmups und genügend Wiederholungen; bei nur wenigen Samples p95 entsprechend als grobe Schätzung kennzeichnen. Keine pauschale 16-ms-Navigationsschwelle. Benchmarkkosten und Interaktionslatenz getrennt behandeln.

Abnahme: reproduzierbarer Regressionstest für die Reihenfolge; keine negativen oder fingierten Messwerte; Bar-Last korrekt ausgewiesen; erfolgreicher Durchlauf oder klar dokumentierter Umgebungsblocker. Aktualisiere docs/performance/browser-benchmarks.md nur mit echten Messungen.
```

## Prompt 02 – Downsampling mit erhaltenen Datenlücken

```text
Wende den gemeinsamen Arbeitsauftrag an. Prüfe performance/downsample-min-max.ts, Linien-/Area-Pfade und bestehende Tests.

Ergänze segmenterhaltendes Downsampling für monotone numerische und zeitliche X-Daten. Fehlende/ungültige Y-Werte müssen die Messkurve unterbrechen. Unterscheide explizite null-/NaN-Lücken von großen Zeitabständen; eine zeitliche gapThreshold-Option ist explizit und nicht automatisch aus geratenen Intervallen abzuleiten.

Definiere den Budgetvertrag: Budget gilt für gezeichnete numerische Punkte; Segmentgrenzen/Metadaten zählen getrennt. Wenn Budget nicht alle Segmentendpunkte erhalten kann, verwende eine dokumentierte deterministische Priorisierung, ohne getrennte Segmente zu verbinden. Tests für Budget 0, 1, 2, nichtganzzahlige und nicht endliche Eingaben. Bestehenden Helper nicht still inkompatibel ändern; bei Bedarf einen ergänzenden segmentierten Helper bereitstellen.

Originalindizes und Datenreferenzen erhalten. Bei mehreren Serien deren eigene Lücken respektieren. Keine gemeinsamen Werte erfinden. Kein unabhängiges Ausdünnen gestapelter Reihen mit anschließend falschen Summen; Stacking zunächst explizit ausschließen oder kohärent gemeinsam behandeln.

Abnahme: Tests mit Spitzen vor/nach Lücken, vielen Segmenten, vollständig fehlenden Werten, ungleichen Serienlücken, unsortierten und doppelten X-Werten. Unsortierte Daten nach dokumentiertem Vertrag behandeln, niemals still mutieren. Eine SVG-Fixture muss eine sichtbare Unterbrechung auch nach Reduktion zeigen. connectNulls nur bei expliziter Aktivierung beachten. Dokumentation und Exporte aktualisieren.
```

## Prompt 03 – Vorhandenen SVG-Export absichern

```text
Wende den gemeinsamen Arbeitsauftrag an. SVG-Export ist bereits vorhanden: export/serialize.ts, download.ts, types.ts und docs/development/svg-export.md erweitern, nicht neu bauen.

Reproduziere mit Browser-Tests: übergeordneter Container --chart-1: blue, lokaler Chart --chart-1: red. Der Export muss den lokalen effektiven Wert behalten. Die aktuelle Aufwärtsiteration darf lokale Werte nicht durch Vorfahren überschreiben.

Prüfe verschachtelte Tokens (z.B. --chart-1: var(--primary)), pro-Serie gesetzte Variablen sowie externe Klassen für stroke, fill und Text. Der Modus all-computed sammelt bisher nur Custom Properties: definiere und implementiere eine begrenzte, dokumentierte Liste relevanter berechneter SVG-/Text-Stile pro Element. Keine vollständige ungezielte Kopie aller Browser-Stile. Kamod-token-Modus bleibt leichtgewichtig; seine Grenzen klar dokumentieren.

Nur auf einem Clone arbeiten. Defs, gradients, patterns, clipPaths, title/desc und lokale url(#id)-Referenzen erhalten. Export ohne Stylesheet im isolierten Dokument prüfen. Normale externe Webfonts/Bilder nicht ungefragt herunterladen; dokumentierte Grenzen beibehalten. Blob-URLs verlässlich freigeben, Browserzugriff nur beim Aufruf.

Abnahme: lokale Theme-Overrides, Dark Mode und relevante Klassen bleiben im isolierten SVG sichtbar; Live-DOM bleibt unverändert; SSR-Import funktioniert; bestehende Export-APIs und Tree-Shaking bleiben intakt. PNG ist nicht Teil dieses Schritts.
```

## Prompt 04 – Bestehende Achsen-Kollisionslogik vervollständigen

```text
Wende den gemeinsamen Arbeitsauftrag an. Nutze axes/tick-collision.ts, tick-label sowie XAxis/YAxis und die vorhandenen High-Level-Props.

Prüfe hide bei auf- und absteigenden Pixelpositionen. Y-Kollisionen hängen von der vertikalen Texthöhe ab, nicht von der Textbreite. Berücksichtige rotierte Bounding-Boxes. Reserviere Platz für Randticks und lege eine deterministische Regel fest, wenn beide Randlabels nicht passen; nicht blind beide sichtbar halten. maxTickLabelWidth darf ungekürzten Text nicht rechnerisch kleiner machen, als er tatsächlich dargestellt wird.

Erhalte den deterministischen SSR-Pfad. Verbessere zunächst die Heuristik und mache Layoutannahmen dokumentiert; DOM-/Font-Messung höchstens optional nach Hydration. Keine Resize-/Messschleifen. Rotation allein garantiert keine Kollisionsfreiheit: dokumentiere oder ergänze eine kombinierte Strategie ohne bestehende Props umzudeuten.

Prüfe lange deutsche Labels, negative Werte, Datumslabels, kleine Breiten, umgekehrte Achsen und benutzerdefinierte Fonts. Volltexte bleiben zugänglich. Ergänze nur wenn nötig opt-in automatische Ränder mit stabiler SSR-Ausgangsgröße; explizite margins haben Vorrang.

Abnahme: Unit-Tests für Geometrie und Randkonflikte, Browser-Fixtures bei schmal/breit und Hydration ohne Warnung. Keine abgeschnittenen Achsentitel bei dokumentierten Layoutoptionen. Keine Neuerfindung bereits vorhandener Tick-Props.
```

## Prompt 05 – Gemeinsames X-Viewport-Modell

```text
Wende den gemeinsamen Arbeitsauftrag an. Baue die Grundlage für Zeitfenster, zunächst für Line/Area mit kontinuierlicher linearer oder zeitlicher X-Skala.

Prüfe die tatsächliche Scale-Weitergabe in ChartContext, Layout, Serie, Achsen, Grid, Annotationen und Hit-Testing. Ergänze ein kontrolliertes xDomain und ein kleines rendererunabhängiges Viewport-Modell. Zahlen/Date-Eingaben an einer Grenze normalisieren. Reine Funktionen für Validierung, Clamp, minimale Spanne, Verschieben und Zoom um einen Anker.

Alle Ebenen müssen dieselbe Skala und Plotgröße nutzen. Datenmenge nicht blind auf sichtbare Zeilen filtern: Nachbarpunkte außerhalb des Fensters können für korrekt geclippte Linien nötig sein. Tooltips müssen Originalindizes behalten. Definiere Y-Autoscale über alle Daten oder sichtbares Fenster als explizite Option; bestehender Standard bleibt gleich.

Leere/degenerierte Domains, invertierte Grenzen, Dates, ungültige Werte, Domains außerhalb der Daten und live wachsende Daten behandeln. Bei kategorialen Charts neue kontinuierliche Viewport-Optionen klar ausschließen, statt numerische Semantik zu erzwingen. Öffentliche Typen entsprechend gestalten.

Abnahme: Achsen, Linien, Grid, Annotationen und Pointer-Auswahl stimmen bei festem X-Fenster überein; Originalindizes bleiben korrekt; SSR/Hydration und Resize funktionieren; bisherige Charts ohne xDomain unverändert. Ein Beispiel mit Buttons für 5/15/60 Minuten. Noch keine Gesten implementieren.
```

## Prompt 06 – Zoom und Pan

```text
Wende den gemeinsamen Arbeitsauftrag an. Voraussetzung: geprüftes Viewport-Modell aus Prompt 05. Implementiere opt-in X-Zoom und X-Pan für Line/Area.

Unterstütze Drag-Pan mit Pointer Capture, optionalen Wheel-Zoom um den Cursor, Reset und Tastatur-/Button-Bedienung. Seiten-Scrollen bleibt Standard; Wheel-Zoom nur nach einer klaren Aktivierungsregel. Touch-Scrollen nicht global unterdrücken. Pinch ist optionaler Folgeschritt und keine Voraussetzung dieses Prompts.

Ein gemeinsamer Zustandsweg für controlled und uncontrolled Nutzung. onViewportChange nur für benutzergetriebene Änderungen, keine Feedbackschleifen bei neuen Props. Begrenze Fenster an extents/minSpan; benutze rAF-Batching und räume Pointer-/rAF-Zustand bei Cancel/Unmount auf.

Während Drag Tooltipverhalten definieren, versehentliche Klicks vermeiden und sichtbaren Interaktionszustand anbieten. Keyboard-Fokus, Escape zum Abbrechen und verständliche Beschriftungen berücksichtigen.

Abnahme: Browser-Tests für Anker-Zoom, Pan-Grenzen, Reset, Pointer-Cancel, Keyboard und Page-Scroll. Resize und zwei unterschiedliche Chartgrößen prüfen. Keine manuell duplizierten Scale-Berechnungen.
```

## Prompt 07 – Brush und synchronisierte Zeitfenster

```text
Wende den gemeinsamen Arbeitsauftrag an. Voraussetzungen: Prompts 05/06. Ergänze eine optionale Bereichsauswahl und eine kleine Übersicht auf Basis bestehender SVG-Primitive.

Brush-Handles per Pointer und Tastatur verschiebbar machen; minimale Spanne und Clamp respektieren. Rollen, Werte und Labels für Handles festlegen. Die Übersicht verwendet die volle Domain, der Hauptchart den gewählten Ausschnitt. Optional reduzierte Übersichtsdaten dürfen Spitzen/Lücken nicht semantisch verfälschen.

Erweitere die vorhandene Synchronisation um einen gemeinsam kontrollierten X-Bereich. Synchronisiere Datenkoordinaten/Zeitstempel, keine Pixel und keine Zeilenindizes. Beispiel mit ungleichen Samplingraten, ungleichen Chartbreiten und Lücken. Explizite Policy für unterschiedliche Datenextents. Kein globaler Singleton-Store und keine Update-Echos.

Abnahme: Brush, Zoom, Zeitraum-Buttons und Reset verändern dieselbe Quelle der Wahrheit. Zwei Charts zeigen dasselbe Zeitfenster, auch bei unterschiedlicher Datenzahl. Keyboard- und Browser-Tests, keine Schleifen bei controlled Props. Transport/Backend nicht implementieren.
```

## Prompt 08 – Annotationen konsistent machen

```text
Wende den gemeinsamen Arbeitsauftrag an. Prüfe referenceLines/referenceAreas/referencePoints/referenceSegments in den High-Level-Typen und die vorhandenen Primitive.

Ergänze fehlende Zugänge insbesondere bei Area und Line. Verwende gemeinsame Typed-Konfigurationen und denselben Layout-/Scale-Vertrag. Keine separate Geometrie je Chart kopieren. Bei Bar explizit zwischen Datenwerten und Kategorien unterscheiden; horizontale Orientierung gesondert testen. Nur fachlich sinnvolle Kombinationen anbieten.

Definiere Clipping, Layer-Reihenfolge und Einfluss auf Domains. Annotationen sollen Domains nicht unbemerkt erweitern. Labels müssen lesbar sein und dürfen Pointer-Interaktion nicht unerwartet blockieren. Beispiele: CPU-Warnschwelle, Wartungsfenster, Deployment-Markierung.

Abnahme: dieselben Datenkoordinaten landen bei Line/Area am selben Ort; Annotationen folgen Zoom/Resize und SVG-Export; negative Werte, unsichtbare Annotationen und Bar-Orientierung geprüft. Bestehende Props kompatibel erhalten.
```

## Prompt 09 – Rendererunabhängige Streaming-Grundlage

```text
Wende den gemeinsamen Arbeitsauftrag an. Voraussetzung: Viewport und segmenterhaltende Reduktion. Implementiere einen begrenzten Zeitreihenpuffer als reine TypeScript-Struktur plus einen kleinen optionalen Preact-Adapter.

Unterstütze batchweises Anhängen, Kapazität und optional zeitbasierte Aufbewahrung. Definiere Duplicate-/Out-of-order-Policy, z.B. reject/drop oder explizites Reorder-Fenster; nicht still umsortieren. Datenannahme und visuelle Updates entkoppeln. Beispiel: hohe Ingest-Rate, begrenzte Zeichenrate. Kein kompletter Array-Clone pro eingehendem Einzelwert und keine unbeschränkte Warteschlange.

Live folgt dem neuesten Zeitstempel mit festem Zeitfenster. Pause stoppt Follow/visuelle Updates, Datenannahme bleibt begrenzt aktiv; diesen Vertrag in UI und Docs nennen. Zurück zu Live springt zum aktuellen Fenster. Historische Auswahl, die aus dem Puffer fällt, klar anzeigen. Versteckte Tabs, Unmount und Resume berücksichtigen. Screenreader nicht für jeden Messwert benachrichtigen.

Kein WebSocket-Client im Chart-Core. Die Demo darf eine austauschbare Datenquelle verwenden; echte WebSocket/SSE-Anbindung bleibt Aufgabe der Anwendung. Neue Signale-Abhängigkeit nur bei belegtem Bedarf, keine parallelen State-Quellen.

Abnahme: Kapazität bleibt auch bei Überlast begrenzt, Timer/rAF werden aufgeräumt, Pause/Resume und Lücken korrekt, deterministische Tests mit kontrollierter Uhr. Bericht für einen längeren Browser-Lauf; verfügbaren Heap nur als umgebungsabhängige Messung kennzeichnen, nicht als universellen Leak-Beweis.
```

## Prompt 10 – SVG-Monitoring-Demo und Sparkline

```text
Wende den gemeinsamen Arbeitsauftrag an. Baue in der bestehenden Dokumentation eine vorzeigbare Syncding-Monitoring-Demo mit ausdrücklich simulierten Daten: CPU, RAM und Netzwerkdurchsatz in getrennten Charts mit passenden Einheiten.

Zeige Live/Pause, 5-/15-Minuten-Fenster, Zoom/Reset, synchronisierten Crosshair/Zeitbereich, eine Deployment-Markierung und einen simulierten Verbindungsausfall. Keine erfundenen echten Syncding-Metriken. Datenquelle deterministisch seedbar; Werte, Ausfälle und Überlast reproduzierbar.

Leite eine Sparkline als dünnes Preset aus bestehenden Line/Area-Primitiven ab. Keine eigene zweite Layout-Engine. Accessible Titel und Trendzusammenfassung neben KPI; null-Lücken und Reduced Motion erhalten. Vor Veröffentlichung eines neuen Exports prüfen, ob zunächst ein Recipe genügt.

Zeige einen optionalen Performance-Modus mit Rohpunktezahl, gezeichneten Punkten und visueller Update-Rate. Keine Implementierungsdaten in der normalen Produktansicht. Nutze vorhandenes Theme und Kamod UI nur, wenn im Projekt bereits integriert oder sinnvoll erforderlich.

Abnahme: responsive und in Light/Dark nutzbar, Keyboard-Zugriff, keine laufenden Timer nach Navigation, unabhängige Domains für %, Bytes und Bytes/s. Browser-Smoke für Live/Pause, Lücke, Zoom und Export. Docs-Build erfolgreich.
```

## Prompt 11 – Abschlussprüfung und Canvas-Entscheidung

```text
Wende den gemeinsamen Arbeitsauftrag an. Prüfe die umgesetzten Pflichtprompts als Gesamtprodukt. Führe pnpm check, pnpm test:browser, pnpm smoke:consumer, pnpm docs:build und die zutreffenden Bundle-/Exportprüfungen aus. Verwende vorhandene Skripte, passe keine Gates bloß zum Bestehen an.

Prüfe SSR/Hydration, lokale SVG-IDs bei mehreren Charts, Resize, Themewechsel, Tastatur und exportierte Darstellung. Dokumentiere tatsächlich durchgeführte manuelle Screenreader-Prüfung; automatisierte ARIA-Tests ersetzen diese nicht.

Führe mit repariertem Benchmark repräsentative Monitoring-Szenarien aus: 1/4/12 Charts, niedrige und hohe Rohdatenmengen, unterschiedliche visuelle Update-Raten. Stelle Rohdatenzahl, gezeichnete Punkte, Serien, Viewport, Gerät/Browser und Downsampling immer daneben. Kleine belastbare Matrix zuerst; Last nur zur Aufklärung konkreter Grenzen erweitern.

Erstelle docs/development/canvas-decision.md mit gemessenen Engpässen: Datenverarbeitung, Layout, SVG-DOM, Hit-Testing oder Zeichnen. Empfehlung GO/DEFER mit Begründung. Bei GO nur RFC für optionales Canvas-Line/Area-Modul mit gemeinsamem Viewport und Datenpipeline, keine Implementierung. Bei DEFER verbleibende SVG-Optimierung konkret nennen.

Abnahme: Fortschrittsdatei vollständig; öffentliche API dokumentiert; echte Testergebnisse und verbleibende Risiken; kein Publish. Keine Behauptung von Canvas-Vorteilen ohne Vergleichsmessung.
```

## Optionaler Prompt 12 – PNG und CSV

```text
Nur auf ausdrückliche Auswahl ausführen. Wende den gemeinsamen Arbeitsauftrag an. Ergänze den bestehenden Export um PNG und einen separaten Daten-CSV-Helper.

PNG aus dem abgesicherten SVG-Export erzeugen; Scale/DPR, Hintergrund, sinnvolle Größenlimits und leere Dimensionen behandeln. Canvas darf hier als Rasterisierungsschritt dienen, ohne einen Canvas-Chart-Renderer einzuführen. Blob-/Image-Lebenszyklen aufräumen, Fehler durch externe Assets/tainted Canvas verständlich zurückgeben. SSR-Imports bleiben sicher.

CSV arbeitet auf Originaldaten, nicht aus SVG oder downsampled Pixelgeometrie. Explizite Auswahl all/visible; stabile Spalten, Units und Zeitformat, korrektes Quoting für Trennzeichen/Quotes/Zeilenumbrüche. Leere Werte nicht in 0 umwandeln. Spreadsheet-Formelinjektion bei untrusted Texten standardmäßig neutralisieren und diese Transformation dokumentieren.

Abnahme: CSV-Roundtrip-Tests für Sonderzeichen/Unicode/Lücken; PNG-Dimensionen und sichtbare Farben prüfen; keine unnötigen Export-Abhängigkeiten in normalen Chart-Imports.
```

## Optionaler Prompt 13 – Nächster Charttyp: Histogramm

```text
Nur auf ausdrückliche Auswahl ausführen. Wende den gemeinsamen Arbeitsauftrag an. Implementiere zuerst ein Histogramm-Recipe mit vorhandener Bar-Darstellung und einem getesteten, reinen Binning-Helper. Einen öffentlichen Charttyp nur hinzufügen, wenn das Recipe die API-Anforderungen nicht sauber erfüllt.

Definiere Bin-Grenzen explizit, z.B. links geschlossen/rechts offen mit inklusivem letztem Ende; unterstütze vorgegebene Grenzen oder deterministische Binanzahl. NaN, null, negative Werte, identische Werte und Ausreißer behandeln. Zählung und Dichte nicht vermischen. Tooltip nennt Intervall und Anzahl, nicht einen fingierten Einzelwert.

Abnahme: jeder gültige Wert wird genau einmal zugeordnet, Summe der Counts stimmt, ungleich breite Bins werden fachlich korrekt dargestellt. Beispiel für Antwortzeitverteilung. Heatmap, Range-Band, Waterfall und weitere Typen bleiben eigenständige spätere Aufgaben.
```

## Startprompt für weitgehend selbstständige Bearbeitung

```text
Lies kamod-charts-svg-analyse-cursor-prompts.md vollständig und befolge den gemeinsamen Arbeitsauftrag. Führe zunächst ausschließlich Prompts 00 bis 04 sequenziell aus. Setze vorhandene Funktionen nicht erneut um. Prüfe jeden Schritt anhand seiner Abnahmekriterien, korrigiere Fehler im aktuellen Umfang und aktualisiere die Fortschrittsdatei. Beende nach Prompt 04 mit Diff-Zusammenfassung, Testresultaten und offenen Punkten. Kein Push/Publish und keine optionalen Prompts.
```

Anschließend jeweils einen zweiten Auftrag für 05–08 und einen dritten für 09–11 geben. Dadurch bleiben Änderungen reviewbar und Cursor verliert seltener den Zusammenhang. Eine autonome Sitzung kann durch Kontext-, Laufzeit- oder Berechtigungsgrenzen unterbrochen werden; die Fortschrittsdatei ermöglicht die Wiederaufnahme.

## Quellen des geprüften Stands

Alle Links zeigen auf den geprüften Commit:

- [Chart-Typen](https://github.com/kamod-ch/kamod-charts/blob/001ad79c65c5ece59cb9fae287331a9eaae8b050/packages/core/src/charts/types.ts)
- [Surface-/Layout-Props](https://github.com/kamod-ch/kamod-charts/blob/001ad79c65c5ece59cb9fae287331a9eaae8b050/packages/core/src/charts/chart-chrome-props.ts)
- [Tick-Kollisionen](https://github.com/kamod-ch/kamod-charts/blob/001ad79c65c5ece59cb9fae287331a9eaae8b050/packages/core/src/axes/tick-collision.ts)
- [SVG-Serialisierung](https://github.com/kamod-ch/kamod-charts/blob/001ad79c65c5ece59cb9fae287331a9eaae8b050/packages/core/src/export/serialize.ts)
- [SVG-Export-Dokumentation](https://github.com/kamod-ch/kamod-charts/blob/001ad79c65c5ece59cb9fae287331a9eaae8b050/docs/development/svg-export.md)
- [Min/Max-Downsampling](https://github.com/kamod-ch/kamod-charts/blob/001ad79c65c5ece59cb9fae287331a9eaae8b050/packages/core/src/performance/downsample-min-max.ts)
- [Benchmark-Runner](https://github.com/kamod-ch/kamod-charts/blob/001ad79c65c5ece59cb9fae287331a9eaae8b050/scripts/browser-benchmark.mjs)
- [Benchmark-Fixture](https://github.com/kamod-ch/kamod-charts/blob/001ad79c65c5ece59cb9fae287331a9eaae8b050/packages/browser-fixture/src/BenchmarkFixture.tsx)
