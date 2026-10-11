# Training and surveys — v6.6

## Open and start

Download `Cockpit_Cost_PO_Training_v6_6.html` using GitHub’s **Download raw file** button. Open it in a current Chrome or Edge browser. Training is under **Operations & People → Training & Surveys**; this version opens there first. Existing Cost, PO, Quality and People data are retained.

Go to **Training & surveys**, configure the four Group training slots with their actual titles and first cycle dates, then add links or embedded videos. The supplied rosters do not establish the four titles, a quarterly anchor, or completed training. The placeholders therefore say **Setup required**, rather than showing invented completion performance.

The default recurrence is one shared deadline every **three calendar months**, anchored to each course’s first start date. A recurring deadline is the day before the next cycle starts. This is separate from the cockpit’s financial periods and the roster’s April–March year. The user can choose one-off training or surveys instead. Individual renewal three months after each person’s completion is not implemented in this review version; it would require a different due-date model.

## People and sources

Both supplied workbooks are embedded as compact employee roster records:

| Source | Coverage | Employee rows | Matched people within the year |
|---|---|---:|---:|
| NEW, USE THIS ONE of Holiday rota 2026-2027 Unit ABCV1.xlsx | 1 Apr 2026–31 Mar 2027 | 781 | 775 |
| Holiday rota ABC 2027-2028.xlsx | 1 Apr 2027–31 Mar 2028 | 781 | 781 |

There are **806 identities across both years**. Repeated clock entries are combined while preserving their source sheets and row numbers. Missing clocks match a name only when there is an unambiguous known clock, otherwise they retain an internal identity for review. **36 identities need review**: 33 lack an unambiguous clock match, and three known clock numbers have different roster names across years. This matching is provisional; the dashboard cannot verify that a reused clock belongs to the same person.

Use **Employees → Edit** to amend an employee. For records with multiple names, verify that they represent the same person, or use **Separate a different person from these roster records** to move one name’s roster profiles into another employee. A split retains existing completion history with the original employee and cancels unfinished bookings in the moved roster dates for replanning. Review and correct completion ownership manually when necessary. New clock numbers must be unique; leave an uncertain number blank for review. Refresh imports preserve an explicitly separated provisional identity.

Add employees manually, including their eligible-from date. A newly added employee has unknown availability until a roster or recorded availability exception is supplied. **Remove** archives someone; it retains their source records and completed history. Set an actual leaving date when known. Historical eligibility is based on roster coverage, manual eligible-from/leaving dates and archive dates; blank roster cells are not interpreted as confirmed employment or availability. Department and shift come from the applicable roster year unless explicitly amended.

**Rosters & settings** previews and imports a refreshed workbook of the same layout. Exact duplicate files are rejected. Clock/name matching preserves amendments, archived people and completion history. A refreshed employee/sheet replaces availability only for its covered dates; original rows remain in source history. Unknown layouts stop with an explanation.

## Completion and reporting

**Progress & tick-off** shows current Group requirements, per-course progress, an employee matrix and an employee tick-off list. Filter by department, day/night shift, employee name, clock or role. Use the selected course and cycle to record one person or a selected group.

A completion requires an actual date, recorder’s name and evidence/session note. Future completion dates are rejected. Watching a video, booking a session or importing a roster does **not** tick anyone complete. Repeated completion of the same employee/course/cycle is not counted twice. **Correct / reopen** retains the original record as void and reopens the requirement. Each recurring cycle is independent, and outstanding earlier cycles remain in the overdue queue.

**Training & surveys** supports adding, amending, closing, removing and restoring courses. Closing stops new cycles without erasing history. Existing cycle schedules cannot be rewritten after completion history exists; create a new course for a different schedule. One-off surveys use the same employee tick-off and evidence workflow, with a survey URL. Survey responses and quiz results are not automatically collected from external tools.

**History** records changes with entered names, timestamps, reasons and before/after details. Employee history shows completion evidence across years. Names are entered locally; this is not authenticated attribution or a tamper-proof audit system.

**Daily / weekly / period reports** separates activity from deadlines:

- Completion activity counts non-void completions whose actual date falls within the report interval.
- Requirements due count employee × course × cycle deadlines in that interval. Their completion status is evaluated as of the interval’s end.
- Weekly reports use Monday–Sunday. Period reports use the cockpit’s 4–4–5 financial periods, including the actual date range.
- Booked sessions and roster training entries are shown separately because mapped records can overlap. They are not added together or counted as completion.
- Excel and PDF exports contain the selected interval and employee filters, completion evidence, due requirements, sessions and roster entries.

Reports are available on demand when the HTML is open. This portable file does not send scheduled daily emails or refresh when closed.

## Future planning and roster training

**Future plan** selects a configured training and cycle and proposes future dates from the loaded rosters. Code `1` is a rostered working day. Holidays, rest days, sickness, existing training, partial days, unrecognised codes, blanks and conflicting records are excluded from automatic suggestions. A recorded availability exception can resolve a specific date.

The planner applies an editable maximum people per department/shift/day, respects existing dashboard bookings, and lists people with no suitable day. **Confirm these bookings** creates sessions; a supervisor still needs to agree the time and production cover. It does not infer spare production capacity or shift hours. Cancel a booking and replan to reschedule it.

There are **858 source training-day entries** marked `T`. **Roster training** brings them through as scheduled entries requiring course identification. Map them to a configured course, then explicitly record completion after checking evidence. Completed or closed entries leave the active list while remaining available through its history filter. A roster `T` cannot identify which of the four Group modules was taught.

## Video, saving and team use

Add an HTTP/HTTPS video or survey link, or attach a video up to 25 MB for offline use. Video playback is available in the course content drawer. Links keep the dashboard light; a linked video needs access to its hosting service. Embedded videos are stored separately from the main training ledger and travel in saved HTML copies. Embedding adds their size to the portable file.

After changes, use **Save as copy** and select the updated **v6.6** file. The save guard rejects older cockpit shells that lack training management. Open the newly saved copy next time. This version preserves the existing storage/recovery workflow. If browser storage fails, download the recovery snapshot before closing; a normal save cannot promise to include failed database writes.

The portable dashboard works in one browser’s local data. Separate users’ browsers and HTML copies do **not** automatically sync. For team use in this version, appoint one owner of the master copy and record who completed each tick-off. A shared database with authenticated accounts is recommended before relying on simultaneous team editing.

The Control Tower includes training remaining/setup and overdue cards for the complete current ABC roster, independent of local training search filters. Training itself uses its explicit local controls, independent of the labour header’s FY/week/unit selection.

## Validation

Browser checks covered real workbook parsing, duplicate source rejection, employee matching and refresh preservation, three-month calendar boundaries, previous-cycle overdue carry-forward, employee add/amend/archive, duplicate and future completion guards, completion corrections, survey reporting, next-year availability and capacity limits, booking/completion separation, course setup and tick-off through the UI, split-identity handling and refresh, all eight views at 360/390/768/1440 pixels, Control Tower integration, Excel/PDF content, warm reloads and a saved HTML reopened in a fresh browser context. Embedded video Blob bytes and MIME type survived a saved-copy round trip; full playback of a production video was not tested. Browser tests served the HTML locally with external requests blocked. Direct `file://` opening could not be tested because the managed test browser blocks local-file navigation; the existing portable-file delivery workflow is retained.

All existing database keys and datasets, including all 171 POs, remain unchanged in the delivered seed. The supplied roster files are unchanged. The training module adds approximately **0.68 MB** to the existing **26.61 MB** cockpit before embedded videos. No artificial completions, verification employees, courses or test media are included in the delivered dashboard.
