# Save dashboard to the same HTML file

Use **[Cockpit_Save_To_Same_File_Updater.html](Cockpit_Save_To_Same_File_Updater.html)**. It installs the adjustment into your **own latest saved cockpit**, preserving its existing embedded data. It updates the selected HTML in place rather than generating another dashboard filename.

## Install once

1. In the working cockpit, use **Save as copy** once if you have changes that exist only in that tab. Choose this newest saved HTML for the update. Keep the working tab open and pause its auto-save while checking the updated file.
2. Download this small updater from GitHub using **Download raw file**, then open it in current Edge or Chrome.
3. Click **Choose master HTML and update it**, select the latest saved cockpit HTML, and allow editing. A local folder outside OneDrive is recommended for the initial check because the previous file suffered a 0 KB save failure.
4. Wait for **Updated and verified**. The selected file retains its name and location. Reopen that same HTML and check your latest complaints, PO and SHE data.
5. Click **Save dashboard**. If asked, select that same existing HTML and allow editing once. The browser requires this file selection/permission to update a file directly. Further Save clicks update that master.

The updater cannot include data that was never saved into the selected HTML. Retain the working tab until you have checked the updated file. Pause saving in older cockpit tabs so they do not write an earlier code/data version over the master.

## Regular saving

- The top **Save dashboard**, bottom **Save** and Ctrl+S update the linked master HTML. They do not download a new HTML automatically.
- First Save asks for an existing file if none is linked. Cancelling leaves it unchanged and downloads nothing.
- If editing permission needs renewal after reopening, Save asks the browser for permission before writing.
- The 30-second browser autosave remains available. When enabled with a linked, permitted master and changed data, it updates that same file on the cycle.
- **⋯ → Download copy** deliberately creates a separate portable backup when you choose it.
- Previous linked-file versions are retained in browser storage, with the two latest kept. **⋯ → Download previous backup** retrieves the latest on demand.
- If file editing is unsupported or linking fails, ordinary Save reports the problem rather than falling back to creating a new HTML.

The master Save still packs from the open dashboard, retains the current linked file before writing, aborts failed writes and verifies the written snapshot before acknowledging success. A generated full copy remains available through Download copy when a write fails.

## Updater backup and validation

Before installation, this updater retains the selected file's full previous contents in a separate browser backup database. It keeps two previous installation versions and provides **Download previous file** on this updater page. It checks that the file did not change while being prepared, aborts a failed writer, and compares the complete written HTML against the expected result. If storing the backup fails, it stops before opening the writer.

Every inert data block in the selected HTML is checked for byte-for-byte preservation. API key/password vault code is retained; the OpenAI client gains the previously supplied redacted error display. The selected model is not changed. Your reported OpenAI failure was project access to `gpt-4.1-mini`; that is managed in the OpenAI project, separately from file saving.

Browser backups belong to that browser/profile. Keep an independent backup as well. This is a standalone HTML application; different users' browser data does not automatically synchronise.

## Verification

Browser tests verified in-place installation with the same filename and no dashboard download; preservation of all 21 data blocks; repeat installation; first-Save file selection only once; both top and bottom Save writing the same target; zero downloads during normal saves and the autosave path; cancellation without writes/downloads; permission renewal; saved-file cold reopen retaining PO edits and SHE entries; explicit copy export; and abort/backup behavior after a simulated write failure and a backup-storage failure that stopped before writing. Existing OpenAI diagnostics and additional-complaint retention tests also passed with mocked API responses. No real API request or user disk write was made by the tests.
