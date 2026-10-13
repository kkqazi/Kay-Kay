# OpenAI authentication diagnostics and single-file saving

Use **[Cockpit_OpenAI_Error_Updater.html](Cockpit_OpenAI_Error_Updater.html)** to update your **own latest saved cockpit**. This is a small, standalone updater, not a replacement dashboard containing an older dataset.

1. In the working cockpit, use **Save as copy** once to retain current changes, including new complaints and SHE entries. Keep the working tab open.
2. Download the updater from GitHub using **Download raw file**, and open that HTML in Edge.
3. Select the cockpit HTML downloaded in step 1 and click **Download updated cockpit**.
4. Open the updated cockpit, and check your latest records. The updater changes only supported application code and verifies that all embedded data blocks are unchanged. It does not upload the file or contact OpenAI.
5. Unlock OpenAI and retry once. A persistent error panel now displays the server message, error code and request ID when exposed by the server. **Copy error details** copies the redacted diagnosis. No API key is included in the diagnostic. The updater cannot change key permissions, billing, browser policy or an IT gateway.

## Missing authentication

The reported response says: `Missing bearer or basic authentication in header`. This means the responding server says it did not receive usable authentication; it does not establish a model-permission failure. Opening the API URL directly in a browser produces an unauthenticated request, so inspect the cockpit's actual failed POST.

In Edge DevTools:

1. Select **Network** and leave it recording. Do not refresh the working dashboard.
2. Click **Classify … with OpenAI API** once in the cockpit.
3. Click the red **responses** row with **403 / fetch**, not the **200 / preflight** row.
4. In its details panel select **Headers**, then expand **Request Headers**.
5. Check whether the **Authorization** row exists. **Do not share or screenshot its value**, which contains the API key.

The application sets `Authorization: Bearer <key>` on its POST to `https://api.openai.com/v1/responses`.

- **Header present but authentication missing:** ask IT to check whether a work proxy, redirect, gateway or browser extension removes or changes it. The actual request/response trace is needed to locate the cause.
- **Header absent:** the request is not carrying the header the application configures. Inspect the actual request and any browser/request interception; changing model names is not a fix for missing authentication.
- **Provisional headers only:** this does not establish what reached the server. Share the redacted error details with IT, including time, endpoint, status and exposed request ID.

No real API call was made during verification. Do not share your key or password with anyone troubleshooting this issue. The existing local encrypted vault and unlock requirement are retained.

## Update one master file

The prior recovery version intentionally downloaded full copies when no file was linked. That made recovery independent of the original 0 KB file, but its **Save** label was unclear. In the updated version:

- Both the bottom **Save** and top **Save dashboard** now ask for an existing master file on the first Save, then update it. They do not default to downloading a copy.
- Open the bottom **⋯ → Link master file…**, choose a valid updated HTML in a local folder outside OneDrive, and allow editing in Edge's native permission dialog.
- The bottom **Save** updates that linked master file. Browser autosave remains every **30 seconds** while enabled; changed data also updates a linked, permitted file on that cycle.
- **⋯ → Download copy** deliberately downloads a separate portable HTML when requested.

Before writing, the application reads the current linked file and retains its previous version in browser IndexedDB. It keeps the two most recent prior versions for that dashboard path without starting automatic downloads. **⋯ → Download previous backup** retrieves the latest previous version when requested. If retaining/verifying the backup fails, it stops before opening the file writer. Linked writes still abort on failure and verify the written result before acknowledging success.

These browser backups are local to the browser/profile; keep an independent HTML backup as well. A full generated copy remains recoverable from the open tab when a linked-file write fails. Continue to keep the original working tab until you have checked the updated copy and your SHE recovery.

The API error update supports the earlier OpenAI cockpit. The single-file label/backup change is applied only to the known repaired v6.7 save code; unsupported file boundaries stop the update rather than guessing.

## Verification

The updater was tested with mocked permission, missing-authentication, non-JSON gateway and successful responses. It preserves all 21 inert data blocks, makes no external network call itself, redacts keys, renders server text safely and clears the error on success. A test added 12 synthetic complaints to the baseline 4,271 and verified that all 4,283, PO edits and SHE entries survived a saved-copy cold reopen. Linked saving made no automatic downloads, kept a readable previous-version backup, allowed its download on demand, and stopped before writing when backup storage failed.

The actual failed POST response was subsequently obtained: the OpenAI project did not have access to `gpt-4.1-mini` (`model_not_found`). This establishes a project model-access problem; the earlier missing-authentication diagnosis was not the cause of that request. Enable the model in the correct project's Limits / Model usage, or select a model already allowed for that project. The user has completed the project-setting change.

For a future actual missing-authentication response, a concise report to give IT is:

> A standalone Edge dashboard sends POST requests to `https://api.openai.com/v1/responses` using an Authorization Bearer header. The preflight returns 200, but the POST returns 403 with `Missing bearer or basic authentication in header`. DevTools only displays provisional request headers. Please check whether browser policy, an extension, a redirect or the HTTPS gateway removes the Authorization header, and whether this approved API connection is permitted. No API key or complaint contents are included in this report.

The updater's **Copy error details** can supply the precise timestamp, final response URL, redirect flag and exposed request ID. It records that the application configured authentication, not proof that the gateway forwarded it.
