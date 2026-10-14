# Phase 3 — official Labour Report and Crown reconciliation

Open **GC_NH_Cockpit_Daily_Labour_Phase3.html** and select **Operations & People → Daily Labour / UPLH**. The supplied Week 03 Labour Report is embedded. The report's financial year is **2027**, but its printed reporting dates are **10–13 October 2026**. No dates have been changed to 2027.

For an edited, already saved Phase 2 cockpit with Agency Flash installed, use **Cockpit_Daily_Labour_Phase3_InPlace_Updater.html**. Save the working master first, keep its tab open and pause autosave during installation. Choose the saved master in the updater, allow editing and reopen that same file after verification. All existing data blocks are preserved, including agency allocations, roster/Crown/Efficiency sources and saved user state. A full previous-file backup is retained in the updater's browser before writing and the write is verified. There is no separate official-hours application. A Phase 2 cockpit without the Agency Flash engine must receive that update first.

## Sources and precedence

**Headline DL hours use Labour Report Actual Hours**, when a reported date and valid summary are available. Crown-only Flash and agency-adjusted Flash are retained as independent comparisons. The official source does not overwrite Crown events, roster classifications or 8-hour agency assumptions. Those assumptions remain clearly provisional on the Flash side and do not enter official hours.

The main headline UPLH keeps the existing reported Efficiency numerator; that export does not certify full-day output completeness: **reported Valid Packs ÷ official DL hours**. Workbook output and workbook-reported UPLH are displayed separately. They must not be confused with the cockpit's Efficiency output. If no Labour Report covers a date, the headline explicitly falls back to Flash. Missing or future official hours stay unavailable; a genuine reported zero remains zero and yields no UPLH division. Overlapping report revisions require a selected revision rather than summing hours across files.

Mappings use cached workbook values, with exact worksheet/cell references available in the cockpit and Excel export. The workbook is read as data: formulas and macros are not executed or modified, and preparatory notes in worksheets are not instructions to change the file. An Excel report must have its formulas recalculated and saved by its owner before upload if caches are missing. No TLS, package verification or workbook integrity checks were bypassed.

| Measure | Official mapping |
| --- | --- |
| ABC DL | `UNIT ABC - DL`, Actual Hours, current-week date columns C–I; 13 October `F18` |
| A/B/C DL | `Total Northampton - DL`, Actual Hours unit rows, current-week columns F–L; 13 October `I93:I95` |
| D/K DL | Unit D/K DL sheets, Actual Hours; 13 October `F18` |
| Site DL | `Total Northampton - DL`, Actual Hours; 13 October `I92` |
| ABC/D/K IDL | Unit IDL Total Hours summaries; ABC/D 13 October `F12`, K `F11` |
| Site IDL | `Total Northampton - IDL`, Total Weekly Indirect Hours; 13 October `I56` |
| Official ABC Prep | `Detail1`, Worked Hours, final Direct/Indirect = Direct, final Scanning Type = Prep; used only after detail totals reconcile to ABC DL |

Dates come from the report's W/C, Reporting To and current-week date headers. Where unit sheets inherit dates via weekday columns, that alignment is checked. The report contains calendar-day administration dates; Crown uses the previous-day 19:00 → selected-day 18:00 production window. Reconciliation shows this basis difference rather than inventing an adjustment. Booked, Standard, contract, forecast, budget and WTD hours are not substitutes for Actual Hours.

## 13 October 2026: ABC results

| Measure | Result |
| --- | ---: |
| Official DL hours | 4,027.1333 |
| Crown-only DL hours | 2,404.5464 |
| Agency-adjusted Flash DL hours | 3,202.1964 |
| Crown − Official hours | −1,622.5869 |
| Adjusted Flash − Official hours | −824.9369 |
| Adjusted variance ÷ Official | −20.4845% |
| Efficiency Valid Packs | 206,549 |
| Headline UPLH: Efficiency ÷ Official hours | 51.2893 |
| Crown-only Flash UPLH | 85.8994 |
| Agency-adjusted Flash UPLH | 64.5023 |
| Labour Report output | 225,119 |
| Workbook-reported UPLH | 55.9006 |
| Efficiency − Report output | −18,570 |
| Official ABC IDL hours | 620.4833 |
| Official ABC Prep DL hours | 258.2667 |

A negative hours gap means Flash is lower than Official; it is not a proven cost saving. The difference has not been attributed to breaks, paid time, roster exceptions, reallocation or missing clock coverage without evidence.

## Scope and limits

Site official DL is **8,878.0650 hours**, with **246.5483 hours of source Agency Adjustment** included in the report's Site total. This adjustment is not distributed to A/B/C/D/K or added to Crown. Site Efficiency output is **449,108**, whereas Site report output is **539,091**. Site Flash presently covers validated ABC only. The cockpit therefore suppresses Site hours variance against the full Site official source instead of comparing different populations.

D/K now have official DL hours and official-hours UPLH when compatible Efficiency output is available. Their Crown Flash UPLH and variances remain unavailable until core roster/labour coverage is validated. Per-unit A/B/C official IDL is not supplied by these mapped summaries and remains unavailable. Official Prep is supported for ABC/A/B/C where final Direct detail reconciles; D/K Prep remains unavailable. Separate official LC hours are not mapped, so no LC zero is invented.

`Detail1` reconciles to ABC DL using **Worked Hours** and the final reallocation columns **Direct/Indirect**, **Scanning Unit**, **Scanning Area**, and **Scanning Type**. It is not a complete Site/IDL employee ledger. The employee reconciliation unions official ABC DL records with Crown/adjusted-Flash DL records, matching employee and unit, checking names and leaving missing counterparts as null. Person-level differences are not a complete explanation of the aggregate gap. Sanitiser remains IDL in Crown and agency Flash rules; source Labour Report classifications and totals remain auditable and are not silently recast using roster rules.

## Daily use

Use **Upload Labour Report**, inspect the reporting period and daily hours, then choose **Use official Labour Report**. Report revisions and original files remain in the model; choose the active revision for the selected production date in the reconciliation panel. Upload Crown, agency allocations and Efficiency through their existing controls to maintain the Flash comparison. Save the same cockpit after changes.

The reconciliation panel also compares Crown/adjusted-Flash **IDL and Prep hours** against official hours where those measures and unit scopes are supported.

**Inspect official source cells** shows the selected day's exact cell mappings. **Inspect employee DL reconciliation** shows matched and unmatched records. JSON export uses schema **4** and retains official files and selections. Excel export adds **Official reconciliation**, **Official source cells**, and **Employee DL reconciliation** alongside all prior Flash/agency sheets. Prep KG remains user-entered, with Flash and official productivity shown separately.

## Validation and reproduction

The independent cached-cell check, engine checks and browser checks are saved under `tests/Daily_Labour_Phase3_*_Verification.json`. The builder preserves all **24 prior embedded data blocks** byte-for-byte and adds the official seed/engine plus an updated Daily Labour module. Existing Phase 2 and prior delivery packages are historical versions and were not rebuilt.

From the repository root:

```sh
python scripts/build-daily-labour-phase3.py --labour-report '/path/to/Week 03 - Labour Report 2027.xlsx'
python scripts/build-phase3-updater.py
node tests/daily-labour-phase3-engine.cjs
node tests/daily-labour-phase3-browser.cjs
python scripts/package-phase3.py
```

The generator defaults to the retained agency-enabled Phase 2 cockpit and produces Phase 3. Browser tests use Playwright and `/usr/bin/chromium`, start/stop their own local server, check user-data preservation, source provenance, official/Flash calculations, exports, mobile fit, save/reopen and native updater backup/write. No original workbook or standalone agency HTML is included in the Phase 3 delivery ZIP. Keep the ZIP and cockpit in the private repository.

With the original report available, `node tests/phase3-upload.cjs '/path/to/report.xlsx'` verifies the real workbook upload, preview, selection and hash deduplication. This optional repeat check requires the workbook, which is not included in the ZIP.
