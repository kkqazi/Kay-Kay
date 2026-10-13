# Recover the cockpit from the tab that is still open

**Keep the original tab open. Do not refresh it, clear browser data, or overwrite the 0 KB file.** Untick **Auto-save after changes** in the bottom-left save panel.

The error shown means Edge could not read the linked file. The previous green saved timestamp is not evidence that the current disk file is intact. OneDrive/file permissions or a file replacement can invalidate a saved file handle; the screenshot alone does not establish why the file became empty.

## Rescue using Edge Developer Tools

This helper runs in the existing cockpit page. It does not open a new dashboard, make network requests, read the damaged file, or overwrite any file. It pauses autosave, detaches the broken file reference and locks the API key. It then reads the dashboard's configured browser stores and captures the code already in the page, including later modules such as SHE.

1. Open [Cockpit_Recovery_Copy_Into_Edge.txt](Cockpit_Recovery_Copy_Into_Edge.txt) on GitHub in a separate tab and click **Download raw file**. Open the downloaded `.txt` in **Notepad**, press **Ctrl+A**, then **Ctrl+C** to copy everything. This is the same tested recovery code in a text file; downloading or opening it does not run recovery. If you already downloaded the `.js`, right-click it and choose **Open with → Notepad**. Double-clicking the `.js` launches Windows Script Host, which cannot run this browser-only code; an “Expected …” compilation error there means recovery has not run.
2. Return to the **original cockpit tab**. Press **F12**.
3. In Developer Tools, select **Sources → Snippets**. Snippets may be under **»** in the left panel.
4. Choose **New snippet**, name it `Cockpit Recovery`, and paste the code into its editor. Use the Snippets editor, rather than pasting a command into the Console.
5. Press **Ctrl+Enter** to run the snippet. Keep the tab open. A recovery panel reports progress; large stores can take several minutes. Do not use the dashboard while the snapshot is being prepared.
6. When ready, click **Download recovered HTML**, then **Download complete data backup**. Save both in a local folder outside OneDrive, such as an ordinary **Downloads** folder. The filenames begin `GC_NH_Cockpit_RECOVERED_`.
7. Check that both downloaded files have non-zero sizes. Keep the `.ndjson.gz` backup as-is; it is a full data backup, not the dashboard's ordinary JSON import format.
8. Keep the original tab open. Once both files are saved, check the recovered HTML in a **separate Edge profile or InPrivate window**, so its startup cannot replace the original profile's working browser store. If InPrivate/local-file access is blocked, keep the original tab open and share the recovered file for review instead. Confirm the PO records, SHE page/data and latest edits before closing the original.
9. Send the recovered HTML for review so the save code in the actual **PO + SHE** version can be repaired. The earlier OpenAI/training cockpit files do not contain this later SHE addition and should not replace it.

The recovered copy starts with autosave off and without automatically loading the old linked file handle. It is a **rescue copy**, not a permanent fix for OneDrive saving. Do not link it back to the 0 KB file or resume autosave before checking recovery.

## Coverage and limits

The helper includes the inline application code still in the DOM; every database/object store listed in this dashboard's Live Save configuration; local storage within the same configured save scope; and current in-memory core store, actions, settings and loaded complaints delta. It preserves dates, undefined values, maps, sets, typed arrays and blob attachments. API key vaults and passwords are excluded.

It does not submit unfinished forms or invent missing data. Data in an unconfigured separate module/database or unexposed in-memory buffers is not guaranteed to be captured. If the helper reports an error, **do not close or refresh the tab**; report the message. The latest SHE file has not yet been supplied for direct inspection.

The helper leaves a complete recovered HTML Blob and compressed data Blob in `window.__cockpitEmergencyRecovery` while the original tab stays open, so its download buttons can be used again. That object remains local to the page and is never transmitted by the script.

For an extra backup, use **Data & AI → Data Hub → Export snapshot** and the available **SHE/PO Excel** exports. The ordinary snapshot may omit separately stored module data, so keep the full recovery backup too.

## OneDrive version history

As an additional route, right-click `GC_NH_Cockpit.html` in OneDrive and open **Version history**, or use the OneDrive website. Download a previous non-empty version to a new local filename. Do not restore over the current file while emergency recovery is in progress, and do not open that older dashboard in the original browser profile. A prior version may lack the latest edits; the open tab may contain more recent data.

## Verification

The browser test simulated a linked file whose read fails and verified that recovery made no further file reads or filesystem writes. The test captured a new module present only in the live DOM and its separately stored data; latest unsaved in-memory PO and complaints changes; 171 POs and 4,271 complaints; typed values and blob bytes; absence of API vault/password data; and cold reopening of the recovered HTML with autosave off and no linked handle. The test had no page errors.

This verifies the helper against the known cockpit save format and a simulated separate module, **not the user's unseen SHE version or actual OneDrive failure**. Tests served files locally; direct `file://` navigation is blocked in the managed verification browser.
