"""Build an in-place daily complaint-date updater using the tested installer."""
from pathlib import Path
import re
r=Path(__file__).resolve().parent.parent
s=(r/'Cockpit_Save_To_Same_File_Updater.html').read_text()
# Insert the pure report patch after the existing save/API code-only changes,
# before the shared exact data-block preservation check.
helper=(r/'scripts/quality/daily-complaint-lag-patch.js').read_text()
s=s.replace('<script>','<script>'+helper+'\n',1)
needle=' // Every inert data block must remain byte-for-byte unchanged.'
assert s.count(needle)==1;s=s.replace(needle,' updated=applyDailyComplaintLag(updated).html;\n'+needle)
s=s.replace('Save cockpit to the same file','Update daily complaint reporting')
s=s.replace('Save to the same dashboard file','Daily reports: previous-day complaints')
a=s.index('<p>This installs');b=s.index('<ol>',a)
s=s[:a]+'''<p>A report dated <b>13 October</b> will use complaints dated <b>12 October</b>. The complaint comparison dates move with it. The report labels both dates; other measures retain the reporting day.</p><p>This updates both <b>Overview → Reports → Daily</b> and <b>Quality → Review &amp; reports → Daily brief</b>. Weekly, period and custom ranges retain their existing meaning.</p>'''+s[b:]
s=s.replace('Both Save buttons now update a master file.', 'Daily reports now use the previous complaint ticket day, with report and complaint dates labelled.')
s=s.replace('Ready. This changes a selected existing file, rather than downloading a new dashboard.', 'Ready. Select your latest saved cockpit. This updates its code in place and preserves its saved data.')
(r/'Cockpit_Daily_Complaints_Updater.html').write_text(s)
print('Built daily-complaints updater')
