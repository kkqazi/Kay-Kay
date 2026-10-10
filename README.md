# Labour Cost Command Cockpit — Cost & PO review v6.5

A portable, responsive review copy of the supplied FY27 Labour Command Cockpit, with purchase order management. The original supplied HTML remains unchanged. This copy contains embedded labour and PO data; keep this repository private.

## Download and open

1. Open [Cockpit_Cost_PO_Review_v6_5.html](Cockpit_Cost_PO_Review_v6_5.html) on GitHub.
2. Click **Download raw file** near the top right of the file view. The HTML is approximately 26.6 MB, so GitHub may not display its contents.
3. Save it with the `.html` extension, then open the downloaded file in a current Chrome or Edge browser.

Alternatively, use **Code → Download ZIP** for this branch, extract the ZIP, and open the HTML from the extracted folder. The dashboard does not need a build or an installation.

## What changed

Version 6.5 adds **PO Management** under Budget & Forecast: 171 imported POs, category/period budget monitoring, approval alerts with recorded overrides, edits/amendments, Capital and cost-centre transfers, retained deletion/history, keyword/vendor/PO search, editable budgets and headings, future-year budget creation, Excel/PDF/PowerPoint exports and Control Tower KPIs. It uses the latest supplied cockpit and retains existing datasets.

The source has 147 Repairs POs outside the three new categories, preserved as legacy records. The budget sheets say FY26 and differ from the filename/requested sheet name. The highlighted 63 Operations (B) plan is carried into FY27 provisionally and flagged for review in the budget panel. See [PO usage, source decisions and validation](PO_Management_Notes.md).

After changes, use **Save as copy** and choose this updated v6.5 file to retain the edited data inside the portable HTML.

Version 6.4.2 fixes Quality House audit visibility and includes the supplied 9 October pack. Quality House follows the header year and weeks by default; rolling windows include the current week. It shows the dates and audit coverage, explains empty selections, and offers a button to show the latest audit. Actions are explicitly labelled as using all dates for the selected unit.

The supplied pack contains one live Unit A audit, dated 9 October 2026: maturity 4.00/5, with Coaching weakest at 2.00/5, and one open action. Other units remain unscored. This is limited audit coverage, not evidence of maturity across the whole site. The original labour records and cost calculations are retained.

Version 6.4.1 replaced colour-based interpretations with neutral numbers and explicit comparison labels. The efficiency card shows the distance from its budget target, the cost bridge states its signed arithmetic, and missing charges are distinguished from zero cost.

- Cost Overview opens first, with recorded charges separate from modelled direct-labour variance.
- Product mix and the execution/other residual reconcile to the modelled gap.
- Mix-adjusted efficiency compares earned standard hours with paid hours and the budget target.
- Mobile filters, navigation, tables and source drawers fit smaller screens.
- Faster startup and lazy history loading; navigation no longer triggers full-file autosaves.
- Improved saving, revision checking and storage-failure recovery.

See [review notes and validation](Review_Notes.md) for coverage, calculations and limits. Recorded charges have partial coverage; modelled variances are not payroll spend or product profit.

## Preview

![PO management on desktop](previews/PO_Desktop.png)

[PO management mobile preview](previews/PO_Mobile.png)

![Cost overview on desktop](previews/Cost_Overview_Desktop.png)

[Mobile preview](previews/Cost_Overview_Mobile.png)

![Quality House on desktop](previews/Quality_House_Desktop.png)

[Quality House mobile preview](previews/Quality_House_Mobile.png)
