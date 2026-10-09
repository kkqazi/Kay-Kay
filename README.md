# Labour Cost Command Cockpit — review v6.4.1

A portable, responsive review copy of the supplied FY27 Labour Command Cockpit. The original supplied HTML remains unchanged. This copy contains the embedded labour data; keep this repository private.

## Download and open

1. Open [Cockpit_Cost_Review_v6_4.html](Cockpit_Cost_Review_v6_4.html) on GitHub.
2. Click **Download raw file** near the top right of the file view. The HTML is approximately 25.7 MB, so GitHub may not display its contents.
3. Save it with the `.html` extension, then open the downloaded file in a current Chrome or Edge browser.

Alternatively, use **Code → Download ZIP** for this branch, extract the ZIP, and open the HTML from the extracted folder. The dashboard does not need a build or an installation.

## What changed

Version 6.4.1 replaces colour-based interpretations with neutral numbers and explicit comparison labels. The efficiency card shows the distance from its budget target, the cost bridge states its signed arithmetic, and missing charges are distinguished from zero cost. The underlying calculations and source records are unchanged.

- Cost Overview opens first, with recorded charges separate from modelled direct-labour variance.
- Product mix and the execution/other residual reconcile to the modelled gap.
- Mix-adjusted efficiency compares earned standard hours with paid hours and the budget target.
- Mobile filters, navigation, tables and source drawers fit smaller screens.
- Faster startup and lazy history loading; navigation no longer triggers full-file autosaves.
- Improved saving, revision checking and storage-failure recovery.

See [review notes and validation](Review_Notes.md) for coverage, calculations and limits. Recorded charges have partial coverage; modelled variances are not payroll spend or product profit.

## Preview

![Cost overview on desktop](previews/Cost_Overview_Desktop.png)

[Mobile preview](previews/Cost_Overview_Mobile.png)
