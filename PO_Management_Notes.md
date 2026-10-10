# Cost & PO review v6.5

This version adds Purchase Order Management to the user's latest supplied cockpit, `Cockpit_Cost_Review_v6_4 (2).html`. Existing labour, Quality House, materials, operations and other saved datasets are retained. The source HTML and both workbooks are unchanged.

## Start using it

Download `Cockpit_Cost_PO_Review_v6_5.html` and open it in a current Chrome or Edge browser. PO Management is under **Budget & Forecast** and opens first in a fresh browser. Use **Find PO** to jump to the searchable register.

Select the PO financial year, cost centre and period. These controls are independent of the labour header's unit/week filters. Choose **All periods** when searching a whole year; FY25, FY26 and FY27 source records are all retained. Record filters cover keyword, vendor, PO number, category and status. Include archived records to see Capital, cancelled or deleted POs.

Use **Raise new PO** to create a draft or submit a request. Edit an existing PO to amend its number, vendor, amount, date, allocation, category, unit, description, raiser or status. A new number is suggested, but can be changed; duplicate numbers are rejected. Names, category/ledger labels, period labels, KPI/chart/table headings and cost-centre names can be changed in **Names & settings**. Derived totals recalculate from the source entries and budgets.

Every change requires a name and reason. Approval reserves the PO value against its category, cost centre, financial year and period. An over-budget, missing-budget or unreviewed-budget approval requires an explicit override and override reason. Approved POs imported from the workbook retain their source status; historical override reasons are not invented. Pending requests are shown separately from approved commitments.

**Transfer** moves the PO to another cost centre or to Capital. A Capital PO is excluded from operating-budget commitments; transfer back is available by changing accounting treatment to Operating. An approved transfer into a destination with insufficient or missing budget needs an override. **Delete** archives the PO, releases its commitment and retains its previous values and change history. Deleted POs can be restored, with budget checks applied again.

In **Budget management**, edit period amounts, confirm the selected values/year, apply either workbook budget block, or create the next financial year from the current budgets. All amendments are recorded. Blank means no budget is set; zero means an explicit £0 budget. Copied future-year budgets remain unreviewed until confirmed.

The Control Tower has PO commitment and pending-approval KPI cards plus a three-category budget-position card. These use the configured PO cost centre, all units, the header year, and financial periods corresponding to the selected header weeks. The independent scope is stated on the cards.

After making changes, use **Save as copy**, choosing this updated v6.5 file, to retain the changes inside the portable HTML. Browser storage keeps local working changes; the saved HTML carries them to another computer. Saving into an earlier cockpit without the PO module is blocked. Keep an up-to-date saved copy.

## Source reconciliation and decisions to review

The PO tracker contains **171 records**, with total source values **£161,607.28** across all statuses: 159 Approved, 11 Submitted and 1 Cancelled. There are 70 FY25, 96 FY26 and 5 FY27 records. Currency text and non-breaking spaces were normalised; each original row and its source values remain inspectable and exportable.

The source categories are **147 Repairs**, **22 Consumables** and **2 Stationary**. There are no IT-labelled POs. Repairs are retained as **Repairs (legacy)** outside the three-category budget, rather than silently reclassified or discarded. Existing entries can be amended into the appropriate category. New POs use the three main categories. The tracker supplies units but no cost-centre codes; imported entries use the provisional common Operations PO budget centre 63, retaining their original units.

The budget filename says FY27, but the sheets and month headers say FY26. There is a **63 Operations (B)** sheet and a **69 Operations (C)** sheet, rather than “63 Operations (C)”. The values highlighted in the user's screenshot match the plan in **63 Operations (B)**, columns **CW:DH**:

| Category | Highlighted plan | Formal budget, BO:BZ |
|---|---:|---:|
| Consumables | £37,200 | £30,000 |
| Stationary | £5,300 | £2,400 |
| IT | £3,600 | £15,000 |

The highlighted plan is carried into FY27 **provisionally**, with review required before normal approval. The budget panel lets the user select the correct sheet/block, change the target year and cost centre, or enter other values. Source cell references and original values are retained. Only templates whose 12 cached monthly values reconcile with their annual totals are offered; missing or inconsistent aggregates are not invented.

Period 1 of FY27 contains five approved Consumables POs totalling **£3,522.62**. Against the provisional P1 Consumables plan of **£2,807.69**, the category is **£714.93 over budget**. The combined three-category P1 budget is **£3,492.30**, making the combined gap **£30.32**. Category alerts are checked individually; spare IT or Stationary budget does not cancel a Consumables alert.

Budgets and amounts use integer pennies. Source sub-penny monthly budget values are rounded, with any remaining rounding difference allocated to the final period to preserve the workbook annual total. The calendar uses financial 4–4–5 periods starting on the last Saturday of September; any extra fiscal week belongs to P12. Imported financial-year and period allocations are retained, and can be amended with a reason.

## Exports and validation

**Excel** exports the selected view, filtered register, annual period comparisons and category budgets, plus full-ledger, all-budget-year, complete-history, original-source-row and provenance backup sheets. **PDF** and **PowerPoint** follow the selected financial scope and register filters; their annual comparisons cover all 12 periods for the selected cost centre(s). PowerPoint includes native editable charts, record tables and history slides. PDF and PowerPoint libraries are bundled and loaded only when exported; no external runtime download is needed.

Checks completed:

- All 171 imported records and their £161,607.28 total reconcile; annual category budgets reconcile exactly.
- All prior snapshot values are retained. Previous executable scripts are unchanged except the targeted save-version check.
- Raise, submit, blocked approval, reasoned override, amendment, Capital transfer, cost-centre transfer, deletion, restoration, duplicate rejection and future-budget amendments passed browser checks.
- Both the approval dialog and the record editor were exercised; record/keyword searches passed.
- Existing-browser installation persists the seed without overwriting other saved data; subsequent reloads preserve PO amendments.
- A saved HTML copy reopened in a fresh browser retained the ledger and budget totals. Choosing an earlier cockpit for saving was rejected.
- PO views fit 360, 390, 768 and 1440px screens without page overflow. Wide record tables scroll inside their panels.
- Native Excel, PDF and PowerPoint downloads were generated and their records and totals checked. Excel includes all 171 records; PowerPoint contains three native category charts. Office presentation rendering was not tested in PowerPoint itself.

This is a portable local workflow. Approved PO values are **commitments, not paid invoices**. Raising, approval and transfer here do not create or post transactions in an external purchasing/accounting system. Recorded names are editable attribution, not authenticated approval identities. A shared HTML file does not provide simultaneous multi-user transactions or a tamper-proof audit service.
