# Cost Review v6.4.1

Open the revised HTML in a current Chrome or Edge browser. This is a portable review copy with the supplied data retained. Your original HTML is unchanged.

What changed:

- Added a Cost Overview as the opening module, separating recorded Finance Detail1 charges from modelled direct-labour variance.
- Split the modelled gap into product mix and an execution/other residual. Those components reconcile using each unit/week's budget and rate. The residual is not presented as a proven cause.
- Made earned-standard-hours / paid-hours the headline efficiency measure, compared against the corresponding budget target. Raw UPLH remains available.
- Fixed grouped Mix percentages, recovery signs, product-profit wording, daily Meeting budget comparators and partial-week agency valuation. Forecast mix changes remain visible and flagged rather than being silently replaced.
- Added compact mobile filters and module navigation, responsive grids, full-width source drawers and scrolling detail tables. Existing specialist modules remain available.
- Removed the startup reload and HTML clone; packed large saved values losslessly and decode them when needed. Detailed Quality and Materials histories load on demand. Navigation preferences no longer trigger shared-file autosaves.
- Added a visible storage-failure warning and downloadable recovery snapshot. Shared-file saves recheck the file revision immediately before writing.

Validation:

- 45 module/viewport combinations at 390, 768 and 1440px: no page overflow or JavaScript errors. Targeted 360px checks also passed, including all eight year/unit combinations on the overview.
- Filters, mobile focus/Escape behavior, source drawer, large-value/date storage, simulated storage failure and recovery download passed.
- A saved HTML copy reopened in a fresh browser retained a test action, Finance hours and Date values.
- All original snapshot records, Finance baseline and retained history seeds compared equal. Only the fully superseded LCM seed copy was omitted; the imported records covering its dates remain.
- ABC FY27 YTD modelled gap: £24,109.04 adverse = £19,424.73 favourable mix + £43,533.77 adverse residual. Paid hours and volumes remain unchanged.
- Indicative local Chromium cold opening: about 1.7–2.4 seconds, compared with 10.3 seconds in the original review. These are local samples, not a phone or network benchmark.

Limits to bear in mind:

The file is still approximately 25.7MB because it retains the embedded history. Recorded charges have partial coverage; for ABC FY27 YTD, Detail1 covers five of twelve reported unit-days. Missing charges are excluded and not estimated. Site charges include ABC, D and K and exclude unassigned units. Modelled £ variances are not payroll spend or product profit. Existing forecasts remain scenarios. A portable shared HTML file still does not provide transactional multi-user collaboration.

## Clarity update v6.4.1

The Cost Overview now uses neutral numbers and explicit status labels: Over budget / Under budget, Less / More labour required, Above / Below the mix-adjusted allowance, and Below / Above the budget efficiency target. The efficiency card shows the percentage-point distance from target. Modelled requirements are distinguished from booked savings, and missing charges are distinguished from zero cost. The cost bridge states the signed arithmetic explicitly. Calculations and source records are unchanged.

For Site FY27 W1, the model shows £24,522 over budget: a £25,661 lower mix requirement plus a £50,183 remaining hours gap. Efficiency is 113.6% against 119.2%, or 5.6 percentage points below target. Browser checks reproduced these values, confirmed neutral number colours, and verified 360/390/768/1440px layouts plus all eight year/unit scopes.
