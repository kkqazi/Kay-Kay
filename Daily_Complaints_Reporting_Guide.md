# Daily reports use the previous complaint day

Use **[Cockpit_Daily_Complaints_Updater.html](Cockpit_Daily_Complaints_Updater.html)** on your **own latest saved cockpit**. It installs the date adjustment into that existing HTML while preserving all embedded data blocks.

## What changes

A daily report dated **13 October 2026** reads complaints with ticket date **12 October 2026**. Its complaint comparisons use **5 October 2026** and **13 October 2025** (the matching weekday, 364 days earlier). The report explicitly shows its reporting date and complaint date.

The adjustment applies to:

- **Overview → Reports → Daily:** headline, Quality summary card, complaint and serious-complaint KPIs, comparisons, type/family breakdowns and serious-case lists.
- **Quality → Review & reports → Daily brief:** filtered totals, key measures, department brief, case lists, charts and report exports.
- The corresponding Excel, HTML, print/PDF, copied text and email report outputs use the same source dates. Quality exports inherit the changed daily brief's population and scope.

Only daily **complaint** measures shift. Safety, labour, cost, delivery, scale accuracy, Quality House, downtime, people and action figures in the SQDCP report continue to use the selected report date or their existing scope. Weekly, period and custom complaint windows retain their existing date-range behavior.

Complaints per 1,000 units in a daily report use the complaint day's Labour Report volume, when available. They do not divide yesterday's complaints by today's production. The measure is unavailable when volume is missing.

The SQDCP report refreshes its complaint list from the current Quality data rather than relying on a cached Site Meeting list after new uploads/classifications. Missing dates beyond the loaded ticket-date span show **Unavailable**, without a green zero. Loaded zero tickets within the date span do not prove complete uploads or zero incidents. Severity figures depend on classifications; zero serious cases with unclassified tickets is marked for review.

New daily selections default to the current reporting date in **Europe/London**. Existing selected report dates are retained; the displayed complaint date clarifies their new daily scope. Calendar arithmetic handles month/year boundaries and leap days without daylight-saving shifts.

## Install

1. Save any work that exists only in your open cockpit tab into its master HTML, or use Download copy if it has not been linked. Keep the tab open and pause its autosave while checking the update.
2. Download this small updater from GitHub with **Download raw file**, and open it in current Edge or Chrome.
3. Click **Choose master HTML and update it**, select the latest saved cockpit, and allow editing.
4. Wait for **Updated and verified**, then reopen that same HTML. Select **Reports → Daily → 13/10/2026** and confirm the **Complaints dated 12-10-2026** label.

The installer updates the selected file in place and keeps a previous-file backup in browser storage. It validates unchanged embedded data, aborts failed writes and checks the complete written HTML. It also retains the same-file Save behavior from the preceding adjustment. Normal Save updates the linked master; a separate copy is downloaded only when explicitly requested. The API key vault and selected model are preserved.

## Verification

Browser tests used controlled complaint dates, including records added after the original index was cached. For a 13 October report, current totals and serious cases came only from 12 October, with week/year comparisons on their shifted complaint dates. Separate fixtures confirmed labour, delivery, line efficiency and downtime stayed on 13 October, while the complaint rate used 12 October production volume.

Tests verified unchanged weekly/period/custom windows, the dedicated daily Quality brief, missing-date handling, fiscal-week boundaries, New Year and leap-day arithmetic, exact preservation of all 21 embedded data blocks, repeated update, Excel/HTML/text output dates and a portable-save cold reopen retaining the adjustment and newly added records. The workbook evidence sheet contained three test complaints, all dated 12 October. No real OpenAI API call was made.
