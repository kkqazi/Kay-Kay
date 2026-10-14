# Daily Labour Phase 2 — Efficiency output and Flash DL UPLH

**Historical Phase 2 baseline:** the latest repository cockpit now includes agency estimates. Follow [Agency Flash in the cockpit](Agency_Flash_Cockpit_Guide.md) for the current denominator and 64.50 provisional ABC UPLH. The 85.90 result below describes the original Crown-only baseline retained in the earlier Phase 2 ZIP.

Open `GC_NH_Cockpit_Daily_Labour_Phase2.html` in Edge to review the supplied 13 October data. Choose **Daily Labour / UPLH**. The 13 October source is already included. Later Efficiency exports can be loaded with **Upload Efficiency**; the dashboard shows a run and unit preview before you select it for the chosen production date. Save the dashboard to the same linked HTML after making changes. **Export module JSON** is for cockpit integration, and **Export Excel** includes the run audit.

If you have edited and saved a Phase 1 cockpit since it was delivered, open `Cockpit_Daily_Labour_Phase2_InPlace_Updater.html` in Edge. Save your current cockpit first, keep it open, and pause auto-save during the update. Choose that saved Phase 1 HTML in the updater. The updater retains its full previous version in the browser, installs Phase 2 into the same file, verifies the write, and offers **Download previous file** if needed. Reopen the updated file after success. It keeps your saved Prep KG, roster changes, classifications, complaints, POs, and other data. It does not download a new cockpit automatically.

## Source mapping and actual result

| Efficiency workbook field | Dashboard use |
| --- | --- |
| `Product Start` (column 1), `Product End` (2) | Include runs wholly in the production window, 12 Oct 19:00 to 13 Oct 18:00 Europe/London. A run crossing the boundary stays unallocated and blocks affected UPLH pending review. |
| `Line Name` (4) | Physical unit A/B/C/D/K, used for grouping output. |
| `Run ID` (14) | Deduplicate repeated runs. Conflicting duplicates are excluded and flagged. |
| `Valid Packs` (106) | Reported production output and Flash numerator. |
| `Packs Made` (44), `Pack Count Adjustment` (8) | Audit that `Valid Packs = Packs Made + Pack Count Adjustment`. |
| `Area` (99) | Retained as source evidence and flagged when different from the Line Name unit. |
| `1 Code` (5), `Product Description` (6) | Run and product audit. |
| `Actual Labour Hours` (102), `Actual UPLH` (118) | Retained as source evidence only. Crown classified DL clock hours provide the Flash denominator. |

The supplied `eff.xlsx` has 386 runs; 210 lie in the 13 October production window. Its in-window Valid Packs are **A 141,189; B 53,625; C 11,735; D 209,009; K 33,550**. Thus ABC is **206,549** and all five units total **449,108**. ABC Flash DL UPLH is **206,549 ÷ 2,404.5464 Crown DL hours = 85.90**. The diagnostic production UPLH excluding 97.6667 Prep DL hours is **89.54**. D/K output is visible, but their UPLH remains blank until validated roster and labour coverage exist. The Site measure covers active roster scope ABC and uses 206,549, rather than mixing all-site output with an ABC-only denominator.

The `Area` field disagrees with the physical Line Name unit in **141 of the 210** selected runs, and 265 of all 386 runs. The dashboard flags those differences while counting output by Line Name. All 386 rows satisfy the Valid Packs arithmetic check. The export has no full-day completeness marker, so the output is labelled **reported** and the UPLH **provisional**. The Crown export still has 2,926.16 REVIEW hours for ABC and 135 capped clock-out estimates across its scope. REVIEW, IDL, LC, and excluded hours do not enter the DL denominator. Official Labour Report hours and variance reconciliation remain Phase 3.

Phase 2 adds only Daily Labour code and an Efficiency seed to the Phase 1 cockpit. The 22 original embedded data blocks are preserved byte-for-byte; the old reports, quality, SHE, PO, and complaint-date behavior remain available. The `eff.xlsx` workbook is treated as data, not as instructions.
