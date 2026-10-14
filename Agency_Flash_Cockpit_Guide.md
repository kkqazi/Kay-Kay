# Agency estimates inside the cockpit — Flash UPLH

Use **GC_NH_Cockpit_Daily_Labour_Phase2.html** and open **Operations & People → Daily Labour / UPLH**. Agency allocations now appear in that same cockpit, alongside Crown, roster and Efficiency sources. There is no need to use the standalone agency HTML.

If your working cockpit contains changes made since the repository version, use **Cockpit_Agency_Flash_InPlace_Updater.html** on your latest saved Phase 2 master instead. Save the working cockpit first, keep its tab open and pause autosave while updating. Choose that saved HTML in the updater, allow editing, then reopen the same master after verification. The updater preserves the existing embedded source/saved-state blocks, retains the full previous file in its browser database before writing and verifies the written file. It rejects a file without Phase 2 or one with Agency Flash already installed. Download previous file is an explicit recovery action; normal installation creates no new cockpit copy.

## Provisional calculation

**Flash DL UPLH = reported Valid Packs ÷ (retained Crown DL hours + estimated agency DL hours).**

Each agency person receives **8 estimated hours per printed source date**, until the Labour Report is supplied. Where the agency employee number or a unique exact name matches a Crown person, the agency 8-hour estimate **replaces** that person's Crown hours in the Flash calculation. The original clock events are retained. Estimates are not added on top of matched clock hours, and are neither actual worked nor payroll paid hours.

On the supplied **13 October 2026** data, ABC reports **206,549 Valid Packs**, **2,362.1964 retained Crown DL hours** plus **840 estimated agency DL hours**, giving **3,202.1964 Flash DL hours** and **64.50 provisional Flash UPLH**. The full agency source has **184 people / 1,472 estimated hours** across all locations; this full estimate is not the DL denominator. Classification and validated unit coverage determine which estimates enter ABC DL. The module replaces **1,275.1425 Crown hours across all classes and locations** for matched agency records; this is not all DL.

Sanitiser/Sanitizer is always **IDL**, including mixed labels provisionally, and does not enter the DL denominator. Explicit source Direct/Indirect fields and recognised operational locations determine other classes. Unknown roles remain REVIEW. Use the agency mapping controls and provide a reason to classify reviewed operational locations. Identity and source-location conflicts stay outside DL even if a role is mapped. Unmapped nonproduction locations cannot be silently assigned to a unit.

Shared **ABC** agency locations contribute to ABC/Site only; their **24 estimated DL hours** on 13 October are not divided between A/B/C. Therefore ABC DL includes the individually assigned A/B/C hours plus those shared hours. D/K agency estimates are visible, but D/K UPLH remains unavailable until full roster and core labour coverage is validated. Site remains the active validated roster scope.

## Daily use and saving

1. Select the production date in Daily Labour / UPLH.
2. Use **Upload J&T allocations** and **Upload Quest allocations** to inspect and replace that agency's allocation source; the other agency, Crown and other cockpit modules are retained. Historical workbook rows keep their supplied dates.
3. Upload that day's Crown and Efficiency exports using the existing buttons. Valid Packs continue to use the documented 19:00 previous day → 18:00 selected day production window. Agency allocation dates are not shifted for night shifts.
4. Review the agency table and mapping flags, then use **Save dashboard** to retain sources and edits in the same master file.

The existing JSON export now includes agency files and mappings (schema 3). Excel export includes an **Agency estimates** sheet with names, locations, estimated hours, matched Crown hours replaced, classifications and source rows. History is recalculated on first installation while retaining previous results as revisions. Actual Labour Report selection/reconciliation is still a future update; no official hours have been invented.

## Verification and reproduction

`tests/Agency_Flash_Engine_Verification.json` and `tests/Agency_Flash_Browser_Verification.json` record the current checks. The engine checks cover duplicates, cross-agency matches, Crown replacement, identity conflicts, classifications, shared units, D/K limits, dates and embedded-source preservation. Browser checks cover upgrading an already saved master, user Prep data retention, complaints/PO preservation, exports, mobile layout, same-file saving, cold reopen and native updater backup/write.

The additive builder replaces only the Daily Labour module and adds agency seed/engine scripts; the 23 prior embedded source data blocks remain byte-for-byte intact. For a latest saved Phase 2 input, run `python scripts/build-agency-cockpit.py --cockpit /path/to/saved-phase2.html --output /path/to/updated-cockpit.html`; its agency source defaults to the previously generated agency companion stored in the repository. Then `python scripts/build-agency-updater.py` refreshes the updater from the repository cockpit. Existing workbook ingestion remains in `scripts/agency/build.py`; the cockpit supports later workbook uploads directly.

Run `node tests/agency-flash-engine.cjs` and `node tests/agency-flash-browser.cjs` from the repository root. The browser check uses retained Playwright and `/usr/bin/chromium`, creates its own temporary HTTP server and stops it afterward. The historical pre-agency fixture is read from Git commit `1a65e65`.

The delivery ZIP contains the integrated cockpit, optional in-place updater, this guide, builder/module source and verification files. Keep it in the private repository. Original workbooks and standalone agency artifacts are not in this cockpit delivery ZIP.
