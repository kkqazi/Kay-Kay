# Daily Labour / UPLH — Phase 1

Open **Operations & People → Daily Labour / UPLH** in `GC_NH_Cockpit_Daily_Labour_Phase1.html`.

This is an addition to the supplied cockpit. It retains the original cockpit, its data and its existing features. It embeds the supplied Crown and roster sources, so the first view is ready for **13 October 2026**. The production window is **12 October 19:00 to 13 October 18:00**, in **Europe/London**. The 18:00–19:00 gap contributes no hours.

## What Phase 1 delivers

- Crown clock-hour calculation, employee-number matching and one central role classification engine.
- DL, IDL, LC, excluded and REVIEW classes; area summaries, role drilldowns and employee clock evidence.
- Source statuses, mandatory exceptions, weekly roster audit and controlled role/identity corrections.
- Prep KG entry by production date and ABC Prep KG per Crown Prep DL hour.
- Retained raw imports, historical roster versions, calculation revisions, file metadata and correction audit.
- Excel and module JSON exports. Data uses the existing cockpit IndexedDB/save infrastructure.
- D/K placeholders and model scopes, with no validated D/K labour productivity until their rosters are supplied.

**Efficiency output and official Labour Report imports are intentionally deferred.** Phase 2 will inspect the Efficiency workbook and connect actual finished units. Phase 3 will inspect the Labour Report and add official precedence and reconciliation while retaining Crown Flash. Neither output units nor official hours are invented from existing financial-week data.

## Inspected source mappings

### Crown131026.xlsx

One relevant worksheet: **Master Data**, with headers on **row 6** and **3,020 events for 1,471 employee IDs**.

| Model field | Source | Treatment |
|---|---|---|
| Employee matching key | `EMPLOYEEID` | Digit string normalisation: leading zeroes removed for comparison with roster Clock No. Original source number retained. |
| Employee code | `EMPLOYEECODE` | Retained as evidence; **zero** matches with the roster Clock No population, so it is not the matching key. |
| Name validation | `FORENAMES` + `SURNAME` | Secondary identity check only; no automatic name join. Minor spelling differences and abbreviated names are tolerated. Significant differences require review. |
| Actual clock time | `CLOCKINGDATETIMEUNROUNDED` | Parsed as London civil time; actual elapsed duration clipped to the production window. |
| Event direction | `DAYREVIEWINOUTFLAG` | **0 = IN; 1 = OUT; −1 = unresolved**. Raw values remain visible. Unknown codes are never guessed. |
| Unit | `Unit` | Cross-checked against roster scope/area and IN/OUT clock locations. |
| Physical clock location | `TIMECLOCKDESCRIPTION` | Evidence for clock unit; not automatically converted into an operational job section. |
| Export coverage | Start Date / End Date above headers | Coverage indicator, separate from individual event completeness. |

**Important Crown issue:** the supplied `In / Out` formula labels the first employee occurrence IN and every later occurrence OUT. It is not an authoritative event-direction field. The parser uses the raw direction flag instead. It also avoids rounded clock columns: this export contains many midnight placeholders and `−1` values. Administration dates are not production dates.

The source contains events for A/B/C, D, K and two Unit E events. Only A/B/C have a supplied roster. The export includes some events after 18:00; they do not contribute to the 13 October production day. It is stored against its selected production date, so late events do not silently become the next day's labour position.

### ABC roster workbook

Inspected all **10** worksheets. Headers are on **row 2**:

| Worksheets | Operational context |
|---|---|
| PROD DS / PROD NS | Production; Day / Night team |
| PACKING DS / PACKING NS | Packing; Day / Night team |
| PREP DS / PREP NS | Prep; Day / Night team |
| SETTERS DS / SETTERS NS | Setters; Day / Night team |
| OVEN DS | Oven; Day team |
| MANAGERS | Support; explicit management exclusions or support-role classification |

| Model field | Source | Treatment |
|---|---|---|
| Employee name | `Name`; PROD NS header reads `Bantus` | Header alias for that name column. |
| Employee key | `Clock No` | Primary join to Crown EMPLOYEEID. Blank/TBC values remain unresolved. |
| Role | `Role` | Central rules or an audited manual override. |
| Shift | `Shift` | Retained as supplied. |
| Organisational scope | ABC workbook upload scope | ABC; no D/K classifications inferred. |
| A/B/C area | `Unit` where present | A, B/C or ABC; blanks stay unspecified. B/C is not arbitrarily split. |
| Section / team | Worksheet label | Source-supported Production, Packing, Prep, Setters, Oven, Support; DS/NS. Role rules can select a more specific section, e.g. Prep Setter. |
| Core / Agency | Explicit employment field, if supplied; Agency role label | Agency role labels are visible. All other employment types remain **Unknown**, rather than assuming Core. |

Daily holiday/absence cells, training markers and worksheet totals/legends are not clock-hours inputs. The roster supplies the employee/role master in this phase; attendance is measured from Crown.

## Issues requiring review

The roster contains **774 employee rows**, **750 rows with numeric clock numbers**, **747 distinct numeric clock numbers** and **24 blank/TBC clock numbers**. The three duplicated clock numbers are:

| Clock | Conflicting rows |
|---|---|
| 202796 | PROD DS row 14: Line Coordinator; row 25: QM |
| 151862 | PROD DS row 169: Cutter/Feeder; PACKING DS row 44: Cutter/Feeder |
| 804420 | PROD NS row 34: QM; row 140: Roller/Feeder/Cutter |

These are not silently deduplicated into a chosen labour class. Use the employee exception drawer to select the correct roster row, with a review note. A different section remains a material ambiguity even when both roles are DL.

**Roles awaiting manual mapping:** `Agency` (**40 roster rows**) and `Operative-Barcodes` (**one roster row**). Agency describes employment rather than a job; its productive class/section cannot be assumed. Map these in **Central role mapping** after checking their duties.

The source-file populations have **448 employee-number matches**. Inside the selected 13 October window, the calculation sees **1,438 people**, of whom **436 have a unique roster match**; three further matched IDs have duplicated roster rows. Many remaining people belong to D/K, have unlisted agency identities or lack a usable clock-number match.

The initial identity check also flags four names for review: clock numbers **774406, 774783, 722244 and 774859**. Check their raw Crown and roster names in the employee drawer. Do not change an ID based only on a similar name.

The selected window has **135 people across all Crown units with capped clock-out estimates**, **85 missing-IN exceptions**, unresolved direction flags and clock-unit disagreements. The complete raw list is available in the dashboard and Excel export. Some hours are unavailable because an OUT exists without an earlier IN; those hours cannot be reconstructed from this export.

## Classification rules

The implementation uses one central function, `DailyLabourEngine.classify`, for imports, display, audit and calculation:

| Class | Rules |
|---|---|
| DL — Production | Machine Minder / MM; Roller/Cutter/Feeder combinations; Line Operative; Platters; Pot line; **generic Porter**; recognised LO Agency roles. |
| DL — Packing | Packing Operative, Line Op/Pink Labels, Multiskilled Operative and recognised production operative roles on Packing sheets. |
| DL — Prep | Prep Setter, Setter Mixer, Mixer, Prep Mixer, Prep Op. |
| DL — Oven | Oven Operative. |
| DL — Setters | Setter / Pot Setter. |
| IDL | **Fridge Porter**, QM / Quality Monitor, Sanitiser / Sanitizer, Clerk / NS Clerk, Trainer / NS Trainer, H&S / NS H&S. |
| LC | Line Coordinator / LC; separate hours and heads, excluded from DL UPLH. |
| EXCLUDED | Manufacturing Manager, Zone Manager / ZM; no productive DL/IDL/LC availability. |
| REVIEW | Unknown/missing role, unmatched or duplicated identity, significant name disagreement, unresolved direction or unit/area conflict. |

Overrides are scoped by **normalised role + roster operational section**, with a saved reason and timestamp. They do not rewrite raw roster roles. DL overrides must select a DL section. IDL, LC and excluded roles retain their separate sections.

## Hours and performance assumptions

- London timestamps are interpreted independently of the PC timezone. Daylight-saving transitions use elapsed time; ambiguous repeated clock times are flagged for review.
- Hours measure **elapsed clocked presence**, not confirmed paid/payroll hours. No unpaid-break or rounding policy is supplied, so none is invented.
- IN before 19:00 contributes only from 19:00. An open segment contributes no time beyond 18:00.
- Missing OUT is capped at 18:00 and explicitly labelled an estimate. Unknown-direction events cause REVIEW, even if some elapsed time can be measured.
- OUT without a preceding IN creates an exception and no invented duration. To resolve it, obtain an export with the earlier clock event.
- Duplicate events are removed from calculation while raw imported files remain retained. Repeated INs keep the earliest open segment and raise an overlap exception. Overlapping seconds are counted once.
- A valid shift uses the IN clock unit. An IN/OUT unit change or disagreement with an explicit roster area is flagged and excluded from confirmed DL.
- Site totals include active roster scopes. D/K raw review hours remain inspectable without presenting productive headcounts/hours as validated.
- LC, IDL, excluded and REVIEW hours never enter the DL denominator. Prep DL is included in total DL but has its own KG-per-hour measure.

Initial ABC position, before any manual corrections: **2,404.55 classified DL hours**, **401.27 IDL hours** and **2,926.16 REVIEW hours**, totalling **5,731.98 measured/capped Crown hours**. **Zero classified LC hours does not establish that no LCs worked**: unresolved identities and duplicate rows may conceal LC availability. These are provisional clocking measures, not an official Labour Report result.

## Using and saving the module

1. Select the Production Date and unit. The module's date controls its clock window; the financial-week header does not change it.
2. Upload the latest ABC roster weekly. Review its audit, then **Apply inspected roster**. The previous master is retained for historic days. If you intend to correct an already imported day, use **Use current master for this production day**.
3. Upload Crown for the selected day. Its export must overlap that day's window. Re-importing the same events does not double-count them.
4. Resolve duplicate identities and map unknown roles using the exception and role drawers. Record the reason for changes.
5. Enter Prep KG and choose **Save Prep KG**. Zero is a valid entry; blank is not treated as zero.
6. Use **Save dashboard** or the existing bottom **Save** button. Link the existing master HTML once if requested. Subsequent saves update it; they do not create another HTML download.

The existing **30-second autosave**, manual Save, browser previous-version backup and unsaved-leave warning remain in place. Native file writing depends on Edge granting edit access to the selected existing file. Export Excel/JSON and explicitly requested download-copy actions intentionally create export files.

The new module stores data in `APP.store.dailyLabour`, within the existing saved database. Browser edits are accepted only after a successful store write; failed writes roll back the module edit and show an error. Saving the full HTML retains the sources, corrections, Prep KG and history for a fresh browser reopening. API keys remain in the existing encrypted local vault and are not exported into the HTML or module JSON.

## Validation and changelog

- Added an independent parser/classification/clocking engine, embedded source seed, cockpit view and module styles. No application rebuild.
- Fixed the linked-file PO validation fallback: appended modules no longer cause a valid cockpit to be rejected simply because PO sits outside the final 128 KB. The fallback checks the actual inert-parsed PO script and retains the existing dashboard identity checks.
- Preserved all **21 original inert data blocks byte-for-byte** while adding the new labour seed.
- Preserved the existing loaded stores, settings, actions, complaint classifications, SHE configuration and old navigation routes in runtime comparison.
- Retained **4,283 complaints** and **172 POs** from the supplied current cockpit.
- Carried forward the separately requested daily complaint reporting correction: a 13 October report uses complaints dated 12 October; other daily measures keep their existing report-day basis.
- Tested production boundaries, missing IN/OUT, all principal role rules, LC/IDL/excluded denominator separation, multiple shifts, overlapping/duplicate events, identity/area conflicts, controlled overrides, future D/K exclusion, header errors, London DST and roster audit.
- Independently reconciled JavaScript raw clock totals against an openpyxl/Python calculation for A/B/C/D/K.
- Browser checks cover real workbook uploads and duplicate re-imports, Prep KG and overrides, storage-failure rollback, Excel/JSON exports, mobile layout, same-file verified save and cold reopening.

Evidence: `tests/Daily_Labour_Source_Inspection.json`, `tests/Daily_Labour_Independent_Reconciliation.json`, `tests/Daily_Labour_Verification.json`; executable checks in `tests/daily-labour-engine.cjs` and `tests/daily-labour-browser.cjs`.

Actual finished-unit UPLH, official labour precedence and Flash-versus-Official reconciliation tests remain for Phases 2/3 after those workbooks are supplied. The legacy cockpit's existing financial calculations remain unchanged.
