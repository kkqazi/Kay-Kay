# Agency allocations — provisional 8-hour estimates

Open `Agency_Allocations_Provisional.html` in Chrome or Edge. This portable companion uses the supplied J&T and Quest allocation workbooks and opens on their latest supplied date, 13 October 2026. Choose a source date, agency or location, or search a name. CSV export uses the current filters and labels every hours value as provisional.

The latest date contains **184 people / 1,472 estimated hours**. Every unique person on a source date receives **8 estimated hours**, as instructed, until the Labour Report is available. This is neither actual attendance nor paid hours. The estimates are separate from the existing cockpit's Crown hours and UPLH. No existing cockpit HTML or ZIP has been rebuilt or changed.

Sanitiser and Sanitizer allocations are **IDL**. Labels containing Sanitiser alongside another location provisionally use IDL for their 8-hour estimate and carry a mixed-location review flag. An actual split requires the Labour Report. Explicit source Direct/Indirect classifications are retained; other roles display Unclassified. Unknown classes do not reduce the total 8-hour estimate.

People are grouped by employee number and original source date; missing or invalid employee numbers use a normalised name. Repeated rows and cross-agency matches count once. Conflicting locations are shown together and flagged; their 8 hours remain in the Review location instead of being assigned to one unit. Agency filtering retains the shared person's estimate within either matching agency; filtered agency counts must not be added together where a person appears in both agencies. AM and PM are retained as shifts, without inventing two 8-hour shifts for one person-day.

All original Data-row dates are preserved, including the anomalous 1902 date. No night-shift dates are shifted and no dates are inferred from filenames. J&T tabs `2702` and `2902` have original date cells of **27 September 2025** and **29 September 2025**; their original date values and Excel number formats are retained in the embedded audit metadata. Those comparison tabs are not added to the Data table as extra allocations. Budget dates are not allocation dates.

The source contains **67,629 named, dated allocation rows**, grouped into **67,311 unique person-days**. **705 nonempty rows** missing a valid date or name are excluded from the person-day view and retained as an exclusion audit. Source row numbers, original names/locations, agency, IDs, shift, date number formats and input file hashes are included in the embedded data. Original source workbooks are unchanged and are not included in this package.

The earlier agency-specific dashboard/checkpoint was not supplied. This is a new agency companion based on the existing repository and supplied allocations, rather than a claimed recovery of that missing version. The existing Daily Labour Phase 2 is unchanged.

## Validation

`tests/Agency_Source_Verification.json` records source hashes and ingestion totals. `tests/Agency_Browser_Verification.json` records the current browser checks: date preservation, one 8-hour estimate per person-day, Sanitiser IDL, filters, CSV scope, mobile fit, cold reopen and no JavaScript errors. Existing Daily Labour Phase 1/2 engine, browser and updater checks passed earlier in this session and were not rerun because those files did not change.

## Reproduce

The saved dashboard has no installation or server dependency. Rebuilding requires Python, openpyxl 3.1.5 and the two original workbooks. From the repository root:

```sh
python scripts/agency/build.py --jt '/path/to/J&T allocations.xlsx' --quest '/path/to/Quest Allocations GC WK 29.xlsx'
node tests/agency-browser.cjs
```

The browser check uses Playwright and `/usr/bin/chromium`; it starts and stops its own local server. The ZIP includes the generated dashboard, this guide, builder/template and verification files. Do not combine estimated agency hours with clock hours until identity overlap is reconciled. Replace estimates with Labour Report evidence in a separate update when available.

Keep this employee-data package in the user's private repository.
