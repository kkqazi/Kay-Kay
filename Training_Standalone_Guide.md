# Standalone training dashboard and cockpit JSON transfer

## Files

- **ABC_Training_Survey_Dashboard_v1.html**: the independent training application, approximately **1.00 MB**. It contains the two roster datasets and training tools, without the labour, cost, PO or Quality House datasets. Spreadsheet/PDF libraries are embedded and load only when needed.
- **Cockpit_Cost_PO_Training_v6_6_1.html**: the companion cockpit with **Import training JSON** and **Export JSON for cockpit**, approximately 27.73 MB. Its existing datasets are unchanged. Older cockpit versions do not support this training JSON format.

On GitHub, open the file and click **Download raw file**. Save the `.html` file, then open it in a current Chrome or Edge browser. The standalone dashboard does not need the cockpit to run.

## Use the standalone dashboard

Maintain training records here as the master dataset. Both April–March rosters are already included: 775 matched people in 2026–2027, 781 in 2027–2028, and 806 identities across both years. Missing clocks and three conflicting clock/name matches remain flagged for review. Source identity resolution and roster interpretation are described in [Training management notes](Training_Management_Notes.md).

Configure the four Group course titles and first cycle starts before tracking their targets. The files did not establish those titles or a cycle anchor, and no completions have been fabricated. The default recurrence is a shared deadline every three **calendar months**, separate from financial periods.

The standalone dashboard retains employee add/amend/archive, training and survey management, individual or bulk completion with actual dates and evidence, corrections, overdue carry-forward, course/employee history, video links or offline attachments, roster training mapping, future availability planning, and daily/weekly/financial-period reports with Excel/PDF export. Roster code `T` is scheduled training and does not establish completion.

### Autosave, manual save and leaving

**Autosave is on every 30 seconds** while the dashboard is open. Recorded employee, course, completion, survey, booking and settings changes also persist immediately. **Save now** forces a browser save. The header shows the last successful browser save in UK time and whether the portable HTML needs saving. Reopening the dashboard in the same browser retains that distinction; a browser save is not presented as an updated disk file.

In browsers supporting file access, **Choose autosave file** lets you select an HTML file to update. This performs an initial file save and links it for the current session. Subsequently, the 30-second autosave writes recorded changes to that file, and **Save now** writes it immediately. Link the file again after reopening the dashboard. If the picker is unavailable, this button is hidden and browser autosave remains available. Prefer a new filename when first linking. Browser restrictions may prevent file access; use **Save as copy** in that case.

**Save as copy** downloads a new standalone HTML containing the current ledger, its embedded videos and any JSON-import recovery information. It does not ask you to choose a cockpit file. The app can start a download but cannot confirm whether you kept it: keep the downloaded file and open that saved copy next time. Browser storage is isolated from the cockpit. Downloaded HTML and JSON are portable copies; browser storage is a working copy tied to that browser and file location/origin.

An unfinished form is **not a recorded change**. Use its **Save employee**, **Save training**, **Record completion**, **Save settings** or **Confirm** button to apply it with validation and evidence. Autosave does not fabricate completions or submit unfinished forms. Its status identifies unrecorded edits. Closing an edited form, replacing it or navigating away from an edited settings/roster-import form asks whether to discard those edits; cancel keeps them.

Closing/reloading/navigating away from the browser tab invokes its leave warning if the HTML copy still needs saving, a form has unrecorded edits, a save is in progress or a browser save failed. Browser autosave can recover recorded changes even if an HTML copy is pending. **Browsers choose the native leave-dialog wording** and may require prior interaction; the requested custom sentence cannot be forced on tab close. The in-dashboard discard prompt says the form has not been saved and asks whether to leave and lose its edits.

If browser storage or a linked file write fails, the app shows the failure and keeps the unsaved state. Keep the tab open, retry **Save now** or download **Save as copy**. Autosave operates while the page is running; browsers can throttle background tabs or suspend them, so it is not a guarantee of writes exactly every 30 seconds while inactive. Separate browsers or simultaneous editors do not synchronise automatically.

## Export JSON and bring it into the cockpit

1. In the standalone dashboard, choose **Export JSON for cockpit**.
2. Enter an exported-by name if useful. Leave **Include embedded videos** unchecked for a lighter file, or check it to carry the actual video attachments.
3. Choose **Download cockpit JSON**. This exports the full dataset, independent of employee, date or department filters. Video URLs are always retained.
4. Open the companion **v6.6.1 cockpit**, navigate to **Operations & People → Training & Surveys**, and choose **Import training JSON**.
5. Select the JSON, review its timestamp, employees, courses, completions, bookings and attachment warnings. Enter a recorder name and import note, tick **Replace only Training & Surveys with this snapshot**, then import.
6. Use the cockpit’s **Save as copy** and select the **v6.6.1 HTML** to carry the imported data in its next saved copy. Older shells are rejected because they do not contain JSON import.

An import replaces the **complete training snapshot**, including local training edits made since the last import. It does not merge partial employee selections or modify labour, finance, cost, Quality House, PO, budget or other cockpit datasets. The prior training snapshot is retained under **Rosters & settings → Undo last JSON import**. Undo replaces subsequent training edits with that prior snapshot, so review it before confirming.

Embedded videos are optional in JSON. A light pack lists excluded attachments. If the cockpit already has the same video key, its file remains available; otherwise re-export with videos included to play it offline in the cockpit. Removing a video from the JSON export does not remove its URL or its completion history. Each video is limited to 25 MB. A JSON file is limited to 150 MB; larger media collections can be transferred without video bytes and use links instead.

The standalone app also accepts its own exported JSON through **Import training JSON**, with the same preview, replacement and undo workflow.

JSON is a manual snapshot transfer. It is not live synchronisation between browsers or users. Nominate one owner of the standalone master when several supervisors contribute.

## JSON format

The versioned envelope uses `app: "abc-training-dashboard"`, `kind: "cockpit-training-pack"`, `schemaVersion: 1`, and `unit: "ABC"`. It carries a pack ID, dataset ID, export timestamp/name, counts, a SHA-256 data checksum, the complete `data` ledger, optional `media` entries and `omittedMedia` metadata.

The data ledger contains employees/roster profiles, source provenance, courses, completion evidence including corrected records, sessions, roster-task mappings, availability exceptions, settings and change history. Imported pack metadata is stored separately from that ledger. Video entries carry their key, MIME type, file name, byte size, base64 data and SHA-256 checksum.

Validation rejects unsupported schemas, broken record references, duplicate active completions, invalid dates and runs, future completion evidence, mismatched counts/checksums, malformed videos and repeated imports of the same pack ID. It never executes instructions from an imported JSON document. Checksums detect inconsistent data; they do not authenticate an exporter.

## Verification

Verified the standalone UI for course setup and actual completion tick-off; all eight views at 360/390/768/1440 pixels; real workbook parsing with spreadsheet code deferred until needed; full-scope JSON downloads with and without video bytes; Excel/PDF report content; isolated standalone/cockpit storage; cockpit import preview and confirmation; rejection of invalid schemas, data checksums, duplicate completions, unknown employee references and video checksums without changing the ledger; duplicate-pack rejection; training-only replacement with all other cockpit dataset hashes preserved; HTML saving and fresh-context reopening in both applications; embedded video byte/MIME preservation; and undo of imports after reopening the cockpit.

The autosave update additionally verifies an actual 30-second checkpoint, manual browser save, warm-reload copy status, native leave cancellation retaining form inputs, in-dashboard discard confirmation, storage-failure recovery, ordered writes, saved-copy reopening and linked-file write/close/abort/retry behaviour. The linked-file pipeline was tested with a controlled handle; the native file-picker permission dialog was not automated. The reproducible save test is [tests/training-autosave.cjs](tests/training-autosave.cjs); it requires Node, Playwright and Chromium and runs against the delivered HTML over a local test server.

The delivered files contain only the supplied roster seed and four unconfigured Group slots, with no verification courses, employees, completions, bookings or test videos. Full playback of a production video was not tested. Tests served the self-contained files locally with external requests blocked; the managed browser blocks direct `file://` navigation.
