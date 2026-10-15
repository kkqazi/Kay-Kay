# Normal Efficiency XLSM import

1. Save your latest cockpit. Extract this updater ZIP and open `Cockpit_Efficiency_Tab_Updater.html` in Edge or Chrome.
2. Select that saved cockpit HTML, download the updated copy and open it.
3. In **Daily Labour / UPLH**, select the intended **Production Date**, click **Upload Efficiency**, and choose your normal **Efficiency.xlsm**.
4. Check the **Efficiency** worksheet, **Shift Date**, **Valid Packs** and A/B/C/D/K totals in the preview. Click **Use this Efficiency report**, then **Save dashboard**.

No CSV conversion or workbook-check step is needed for daily imports.

The user's workbook inspection confirmed readable production headings on the Efficiency worksheet and a separate older Detail1 extract. The new XLSX/XLSM reader reads the named Efficiency worksheet directly from the workbook's XML, using its workbook relationships and shared strings. It streams worksheet rows, retains the selected production day's rows, and avoids building cell objects for every worksheet and every formatted blank row. Original source row numbers, file checksum, output definition and date selection are retained. Required ZIP entries are checked for size and CRC integrity. Macros and formulas are not executed; saved formula results are read.

The printed **Shift Date** selects the production day. Physical **Line Name** supplies A/B/C/D/K. **Valid Packs** is used when available; otherwise **Packs Made** is used and explicitly labelled. The older Detail1 extract is not substituted for a present Efficiency worksheet. Normal run-level exports without an Efficiency worksheet retain their existing timestamp rules. CSV remains an optional supported input.

For another production date, select that date and upload the same normal workbook again. Each date keeps its own selected source rows. Historical selections remain intact. Files without matching output, unreadable headings, broken references or corrupt required entries do not replace the previous report. A current Edge or Chrome version with native deflate support is required for direct XLSX/XLSM reading.

Output for all five physical units appears in the preview. Site productivity retains the existing validated-roster scope. This correction does not replace Crown or agency labour hours, or change finance, complaints, product amendments or other dashboard modules. Work remains local and nothing is uploaded by the updater.

Validation used the supplied workbook inspection plus an XLSM fixture reconstructed from the supplied production data, with the same headings, original row positions, all source production dates and unrelated padding to reach approximately the original workbook's size. Totals were checked independently for three production dates. Browser checks cover import, changing dates, UPLH, Excel export, preserving existing hours/finance/history, and native save/reopen. The original full binary workbook exceeds the attachment-transfer limit and could not be run here in its entirety.
