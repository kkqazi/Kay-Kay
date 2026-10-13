# Quality review and reports — v6.7

Use **GC_NH_Cockpit_Quality_PO_SHE_v6_7.html**, built from the supplied **13 October 10:56** OpenAI cockpit. This is a complete standalone cockpit: the existing cost, labour, PO, SHE and other modules remain available. Its data retains **4,271 active complaint tickets and 172 POs**.

## Download and open

1. On the GitHub file page, click **Download raw file**. Keep the `.html` extension. Alternatively download the ZIP, extract it, then open the HTML.
2. Save to a local folder outside OneDrive for the first check. Use current Edge or Chrome.
3. Go to **Asset, Quality & Materials → Quality → Review & reports**.
4. Keep the original working dashboard tab open until you have checked the new copy and recovered any SHE manual entries described below.

## Review and reporting

The four modes share report filters and export settings:

- **Visual review:** key measures; complaint counts by unit, P&L category, product family and issue; two unit heatmaps; total, unit, measure, issue and classification-mix trends; classification signals; top SKUs; significant cases; unmapped UPCs.
- **Daily brief:** choose a day and units. Compare with the same weekday last week and 52 weeks earlier; review severity 4–5 cases and the last seven days.
- **Weekly brief:** choose any date in the week. The week runs **Saturday–Friday**, consistently with the cockpit financial calendar. Compare with the prior week and the matching weekdays 52 weeks earlier.
- **Custom report:** choose dates, departments/units, categories, families, issues, nature, minimum severity, keyword and report sections. Edit the report title and team focus/subtitle. Empty selections mean all values for that filter; no selected report sections means no sections. Other filters intersect.

Departments currently use the source's **Unit A/B/C/D/K** mapping. No additional departmental attribution is invented. Unmapped tickets remain in the all-unit totals. Click bars, heatmap cells, key measures or rows to inspect source tickets. Click a ticket row for its existing description, classification and action tools.

The report date controls are independent of the cockpit's header week selector. The trend can use report dates or a separate 4/12/26/52-week window ending at the report's end date; its title states its dates. All other report filters apply to both the trend and report. Top-SKU sparklines use the eight weeks ending in the week containing the report's end date.

## Export

- **Download PNG** beneath a chart downloads that visual.
- **Excel** includes the selected sections, definitions and all matching ticket records as an evidence sheet.
- **PDF** includes the selected graphics and tables across pages.
- **PowerPoint** produces a slide pack with chart images and editable headings, KPI/table text.
- **Team slide** produces one summary slide with key measures, available selected graphics, investigation priorities and scope. Chart graphics are images, rather than editable chart objects.
- **Copy brief** copies a Markdown briefing; if the clipboard is unavailable it downloads a `.md` file.
- **Print report** opens a report-only page for printing or the browser's Save as PDF.

Report creation works locally and does not call an AI service. The existing OpenAI classification and password/key controls remain available in Settings / Data & setup; no API key or password is added to the HTML export.

## Data meaning

Counts are active, deduplicated tickets by **ticket date**, not production date or complaints per unit produced. Unit and category come from the existing SKU master/manual mapping; family comes from the existing family mapping. `Other` is retained where a specific family is missing. Key measures use the existing Quality definitions and can overlap, so their sum need not equal total complaints.

Severity and objective/subjective classifications are screening labels and hypotheses for investigation. They do not establish a root cause. Investigation priorities sum classified severity squared, with unclassified tickets contributing zero; unclassified complaints must still be reviewed.

The latest supplied ticket is **11 October 2026**. The date span of loaded tickets does **not** prove complete uploads on every date. Dates beyond that span are labelled unavailable; periods crossing it are partial. Trend lines exclude partial buckets; the total trend shows their loaded count as a separate amber dot. Gaps are kept as gaps. Comparisons are unavailable when either period falls outside the loaded date span. Prior-year comparisons shift by **364 days** to match weekdays, not calendar-date anniversaries.

Open-action figures count only actions explicitly linked to tickets in the report. General Quality/manual actions are still in the existing Action Centre and are not attributed to particular complaints or departments without a link.

## Saving and SHE recovery

The update uses an isolated browser database, so its first restore does not delete the database used by the original working tab. A recovered copy no longer waits indefinitely behind that tab's database connection.

**Browser autosave** runs every **30 seconds** while the tab remains open and autosave is enabled. Browser storage and a portable HTML file are different copies. Use **Save**, **Save as copy** or **Download copy** to download a complete HTML containing current data, report choices and SHE edits. Generation uses the loaded page and browser data, so it does not need to read the damaged/0 KB file. Check that the download has a nonzero size before relying on it.

The **optional linked file** feature reads and retains the previous complete file before starting a writer. It starts a previous-version backup download, aborts a failed write, verifies the written file, and shows a failed status when verification fails. A complete generated copy remains available through Download copy. The native leave warning protects unsaved changes. Save/export failures are reported rather than acknowledged as saved. Keep independent HTML/JSON backups; browser storage is local to that browser/profile and the HTML file path may affect access.

The old save scope omitted these five SHE local-storage keys: data, configuration, manual entries, risks and selection. The supplied HTML contains the SHE code and workbook seed but **does not include those separate manual values/settings**. Do not assume the recovered score reproduces all manually entered figures.

Run **[SHE-only backup snippet](recovery/SHE_Only_Backup_Copy_Into_Edge.txt)** in Edge DevTools → Sources → Snippets in the **original working tab**, as previously instructed. In the new cockpit, click the bottom **⋯ → Import SHE backup** and choose `Cockpit_SHE_Local_Backup.json`. The importer validates the five keys, keeps a previous-SHE backup and restores only SHE values into the isolated workspace. Then download a new complete HTML copy. Leave the original tab open until this succeeds.

## Verification

Browser checks reproduced the original blocked-loader failure, then opened this update with the original database connection held open and confirmed the original data remained unchanged. The checks covered 30-second persistence, source-independent full-copy downloads, normal/fresh-context reopening, SHE entry and supplementary import, linked writer abort/success verification, browser-storage failure reporting, report-setting persistence, combined filters, daily/weekly date boundaries, unknown/partial coverage and mobile layout.

For 27 September–3 October 2025, the current source reconciles to **58 tickets, 29 severity 4–5, 19 foreign-body, 6 illness/sickness, 9 underfill and 12 dry/stale**. Unit and issue heatmap totals reconcile to 58. A combined unit/category/issue/severity filter reconciles to five tickets. PNG, XLSX, PDF and full/single-slide PPTX downloads were generated and inspected; an Excel evidence sheet contained the selected unit's 15 tickets. No real API call was made.
