# Efficiency-tab output for Crown Flash

1. Save your current cockpit.
2. Extract this ZIP and open `Cockpit_Efficiency_Tab_Updater.html` in Chrome or Edge.
3. Select your latest saved cockpit HTML and download the updated copy.
4. Open it and go to **Daily Labour / UPLH**. Keep the intended **Production Date** selected.
5. Click **Upload Efficiency** and choose your current `Efficiency.xlsm` on your PC again.
6. Check the preview: **Efficiency** worksheet, source dates, selected production date and output field. Click **Use this Efficiency report**, then **Save dashboard**.

The new reader recognises the **Efficiency** tab's **Shift Date / Line Name / Packs Made** layout. Its printed Shift Date selects the production day; it does not invent run timestamps. Physical Line Name selects A/B/C/D/K. If a Valid Packs column is present, that explicit field is used; otherwise the output is labelled Packs Made throughout the Flash cards and exports. It does not silently relabel Packs Made as Valid Packs.

An old Detail sheet is not substituted when an Efficiency tab is present. Timed-run exports remain supported with their original Product Start / Product End / Valid Packs rules. They retain boundary-run and duplicate checks. Selected files with conflicting output definitions cannot produce UPLH.

The preview shows source worksheet, date coverage and output field. A report without usable rows for the selected day cannot replace the existing source. Existing mismatched imports are retained for audit and now show the reason for their blank output. **Download workbook inspection** produces a small local diagnostic file if a layout needs further review.

The full workbook is read locally, including workbooks larger than the chat transfer limit. No workbook macros execute and nothing is uploaded by this updater. Existing Crown hours, roster, agency estimates, saved corrections, historical days, complaints, rates, commentary and financial records remain intact. Historical output is not re-dated. Current output appears after re-uploading the workbook through the corrected reader; the updater cannot recreate current production from an old saved extract.
