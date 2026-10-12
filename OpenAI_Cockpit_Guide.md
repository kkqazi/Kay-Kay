# OpenAI complaints analysis — cockpit v6.5.1

Use **[Cockpit_Cost_PO_OpenAI_v6_5_1.html](Cockpit_Cost_PO_OpenAI_v6_5_1.html)**. This updates the latest supplied **Cockpit_Cost_PO_Review_v6_5.html** snapshot saved on 12 October 2026, rather than the older repository copy. Download it on GitHub with **Download raw file**, save the `.html` extension, and open it in current Chrome/Edge.

## Connect your own key

1. Open **Settings → AI connection** and choose **Add key**.
2. Enter your **OpenAI API key**, a password of at least eight characters and its confirmation. Choose **Save & lock**. Do not put a key or password into chat, workbook fields, complaint text or a shared dashboard file.
3. Set **Use OpenAI API → On**. The default model is **gpt-4.1-mini**; change **Model** to another Responses API model supporting structured outputs if your OpenAI project requires one. Choose **Save settings**.
4. Open **Asset, Quality & Materials → Quality → Data & setup** and choose **Classify … with OpenAI API**.
5. Enter your password to unlock the key, then review the confirmation explaining the fields sent and API charges. **Stop** aborts the current request and retains already applied results. Retry classifies only the complaints still pending.
6. Use **Lock now** in Settings when finished. The key also locks after the idle interval selected there. **Change key / password** requires the current password. **Remove key** forgets the local key.

OpenAI API access and billing are separate from ChatGPT subscriptions. The work network must permit `api.openai.com`. The dashboard cannot override network restrictions or supply API credit. No live connection was tested with your key; the connection tests used intercepted, mocked API responses only.

## Password protection and saving

The OpenAI key has its own browser vault (`fy27openai.enc`) and does not reuse an old Claude key. It is encrypted using PBKDF2-SHA256 (250,000 iterations) and AES-GCM, with a random salt and IV. The password is not stored. Saving a key locks it immediately; unlocking decrypts it into this browser's memory. Locking cancels active API requests. Losing the password requires removing/replacing the key; the dashboard cannot recover it.

The key vault is outside HTML Live Save, JSON snapshot and recovery-export scopes. Saved HTML carries your data and connection settings, **not the key or password**. Moving the file or opening it in another browser may require adding your key again. Reopening retains the local encrypted key where browser storage remains available but starts locked. Older Claude settings migrate to OpenAI **Off**; enabling the new connection is explicit.

This password protects the saved API key through the dashboard UI. It is not a user login and does not encrypt the complaint, labour, PO or other dashboard data. The HTML remains an editable browser application: an unlocked key is accessible to its running JavaScript, browser developer tools and sufficiently privileged browser extensions. Use your own trusted browser session and an OpenAI project with suitable usage limits. A company-hosted gateway remains preferable if authenticated access by multiple people is needed.

Use **Save as copy** to make a portable updated HTML, selecting **the new OpenAI v6.5.1 file** when prompted. Selecting an older Claude-based cockpit is rejected, so saving cannot silently revert the connection. Existing Live Save, local persistence and export behaviour are retained. This update does not change the independent training dashboard or add training datasets to the supplied v6.5 cockpit.

## What the API sends and returns

Both the general AI analyst and the complaints classifier call **OpenAI Responses API** at `https://api.openai.com/v1/responses`, using Bearer authentication. There is no Anthropic endpoint or automatic fallback to Claude. Requests set `store: false`; this does not establish a separate zero-retention agreement with the provider.

Classification sends only the complaint's **subcategory, issue, product and customer description**, together with the classification instructions. It does not upload the whole cockpit or operator/roster datasets. Free-text descriptions can themselves contain personal or business information; use the connection under your organisation's approved arrangements. The general analyst sends summary figures and your typed question.

The existing severity/nature schema and scoring rules are retained. API results use a strict JSON schema and are checked before applying. New API classifications record `provider`, `model`, `classifiedAt`, `responseId` and an **AI suggestion** review label, visible in the complaint detail. Historical classifications are preserved; their model/date is not fabricated. Root-cause text remains a hypothesis requiring review, not a proven cause. API output is treated as text when rendered.

Requests time out after 90 seconds. Temporary rate limits retry at most twice; exhausted credit, invalid keys, missing models, refusals, incomplete output, invalid JSON and network failures leave the affected complaint pending. Successful results persist after each complaint. Browser storage failures keep the existing recovery warning; keep the tab open and export the recovery snapshot before closing.

**Copy Context Pack → ChatGPT → Paste results** remains available without an API key. The dashboard makes no API call when copying the pack; pasting it into ChatGPT still sends those contents to that service.

[Desktop preview](previews/OpenAI_Quality_Desktop.png) · [Mobile preview](previews/OpenAI_Quality_Mobile.png)

## Verification

The builder checks all embedded application-data scripts byte for byte against the supplied source. The initial file contains **4,271 complaints, 4,239 classified and 32 pending**, and **171 POs**. No test classifications or credentials are written into the delivered file.

Browser tests cover initial migration with API off; key validation; password encryption and lock; failed password with no outgoing request; classification cancellation; schema-validated mocked results applied only to the 32 pending complaints; preservation of all historical classifications and unrelated cockpit data; model/date provenance; authentication, permission, model, quota, rate-limit, refusal, incomplete-output, malformed-result and network errors; timeout cancellation; the general analyst and safe text rendering; responsive quality setup; rejection of older save shells; and cold reopening of saved HTML with data but no embedded key or password.

The files are served locally for browser verification, with OpenAI requests intercepted and every other external request blocked. The managed verification browser does not permit direct `file://` navigation, and native workplace network/API access remains unverified.

Rebuild from the supplied v6.5 source with `python scripts/build-openai-cockpit.py source.html`. Tests require Node, Playwright and Chromium: `COCKPIT_SOURCE=/path/to/source.html node tests/openai-cockpit.cjs`. Set `CHROMIUM_PATH` if Chromium is installed elsewhere.
