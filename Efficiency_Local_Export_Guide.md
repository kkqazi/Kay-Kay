# Exporting the Efficiency source for Phase 2

The supplied Efficiency `.xlsm` exceeds the environment's 32 MiB attachment-transfer limit. It has not yet been inspected, so its output quantity cannot safely be connected to Flash DL UPLH.

`Efficiency_Local_Export_Helper.html` reads the original workbook locally in Edge and creates smaller source files for this conversation. It does not change the cockpit, edit the workbook, execute workbook macros or calculate a KPI.

1. Download the helper from GitHub using **Download raw file**, then open the `.html` file in Edge.
2. Choose `Efficiency(20261013-211229).xlsm` using the file selector.
3. Check the selected production-detail worksheet and the header preview. Choose the production date/time column, preferably **Product Start** if that field exists. The dates default to **12–13 October 2026**, deliberately covering both calendar dates in the overnight production window. If no suitable date column can be identified, untick date filtering to export all rows in the selected sheet.
4. Click **Prepare export**, then download every displayed `Efficiency_Phase2_part_*.json.gz` file.
5. Attach those generated file(s) in the conversation. They are the inputs needed to inspect the real schema and complete Phase 2.

The extract retains original headers, raw values, Excel date-system information, number formats, source row numbers, formula text/cached values and worksheet previews. Unknown date rows are retained and counted for review. No output field is selected as a KPI numerator by this helper. Its broad calendar-date selection is a transfer aid; the final module will apply the exact **12 October 19:00 → 13 October 18:00 Europe/London** window after the timestamp field is verified.

Large extracts are split into compressed parts. No network requests are made while reading or preparing the workbook. The transfer occurs only when you upload the generated files in the conversation.

Validation used a **35.7 MB synthetic workbook**, not the unreadable actual Efficiency attachment. Browser checks confirmed worksheet/header discovery, retaining both requested dates, preserving unparseable rows, exact headers/raw values/source-row numbers, gzip download and mobile layout. Evidence is in `tests/Efficiency_Export_Helper_Verification.json`; the test fixture is not embedded in the helper.

Phase 2 remains pending receipt of an accessible extract. The existing Phase 1 cockpit and its saved data are unchanged.
