# Efficiency CSV output for Daily Labour

1. Save your latest cockpit, then extract this updater ZIP and open `Cockpit_Efficiency_Tab_Updater.html` in Edge or Chrome.
2. Select that latest saved cockpit HTML, download the updated copy and open it.
3. Extract **Efficiency.csv** from the Efficiency ZIP you already have.
4. In **Daily Labour / UPLH**, select the intended **Production Date**, click **Upload Efficiency** and choose **Efficiency.csv**.
5. Check **Efficiency CSV**, **Shift Date**, **Valid Packs** and the A/B/C/D/K totals in the preview. Click **Use this Efficiency report**, then **Save dashboard**.

This correction has been checked against the actual supplied CSV. It reads UK dates and Excel serial dates as printed, without the spreadsheet library converting them to US dates. The printed **Shift Date** identifies the production day; the CSV's Product Start/End fields do not contain the run times needed for an overnight timestamp calculation.

Only the selected day's output rows are stored for each CSV import. To connect another production date, select that date and upload the same CSV again. Previous day selections remain available. The CSV can be larger than 32 MB because it is read locally in a worker; blank formula-export rows are ignored. Source file checksum, date selection, field definitions and original source row numbers are retained for audit and export.

**Valid Packs** is used when present. Otherwise an explicit **Packs Made** field is used and labelled accordingly. Physical **Line Name** supplies A/B/C/D/K. Adjustment and duplicate checks remain active. Output from all five units appears in the preview; the Site productivity card retains its existing validated-roster scope. Efficiency labour hours do not replace Crown or agency hours.

The original XLSM remains supported where its worksheet headings can be read, but its full internal layout was not available for verification. Use the supplied CSV for the verified path in this update. A rejected import does not replace the previous source.

Everything runs locally. The updater contains code only and does not upload business data. Saved roster, Crown and agency sources, finance, complaints, product amendments, prior days and other dashboard modules are retained. The original HTML remains available.
