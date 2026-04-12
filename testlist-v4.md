# v2.0.5 Retest List — Trailing Slash Fix + Trigger UX

> **Prerequisites:**
> 1. Publish v2.0.5: `npm publish --token=YOUR_TOKEN`
> 2. Verify: `npm view n8n-nodes-siyuan version` → should show `2.0.5`
> 3. In n8n: Settings → Community Nodes → Update `n8n-nodes-siyuan` to 2.0.5
> 4. Run each test below

---

## Fix 1: Trailing Slash No Longer Breaks Credential Test or API Calls

**What was wrong in v2.0.4:** When the API URL was entered with a trailing slash (e.g., `http://siyuan.lan/`), the credential test URL became `http://siyuan.lan//api/notebook/lsNotebooks` (double slash). SiYuan's reverse proxy returned HTML `404 page not found` for double-slash URLs. n8n couldn't parse this as JSON, causing unpredictable behavior — sometimes "success" with wrong token, sometimes hanging.

**What was fixed in v2.0.5:**
- `SiYuanClient` constructor now strips trailing slashes from the base URL before creating the Axios instance
- Credential test URL expression now strips trailing slashes: `$credentials.apiUrl.replace(/\/+$/, "")`
- This means `http://siyuan.lan`, `http://siyuan.lan/`, and `http://siyuan.lan///` all work identically

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | URL without slash + correct token | Go to **Credentials → SiYuan API**. Set URL to `http://siyuan.lan` (no trailing slash). Set correct token. Click **Test**. Should show green success. | FAIL | The message shows that the authentication failed eventhough the connection the successful when testing flows |
| 2 | URL with slash + correct token | Change URL to `http://siyuan.lan/` (with trailing slash). Same correct token. Click **Test**. Should ALSO show green success. | FAIL | The message shows that the authentication failed eventhough the connection the successful when testing flows |
| 3 | URL without slash + wrong token | Set URL to `http://siyuan.lan` (no slash). Change token to `wrongtoken12345`. Click **Test** once and wait. Should show red error about authentication. | PASS | The message shows that the authentication failed, flows no longer work |
| 4 | URL with slash + wrong token | Set URL to `http://siyuan.lan/` (with slash). Token still `wrongtoken12345`. Click **Test** once and wait. Should ALSO show red error (not green success, not hanging). | PASS | The message shows that the authentication failed, flows no longer work |
| 5 | Restore and save | Put back correct URL and token. Test. Save. | PASS | |

> **Important:** Click the Test button only ONCE per test and wait for the response (up to 30 seconds). Do not click repeatedly.

---

## Fix 2: Trigger Notebook Filter — Improved Description

**What was wrong in v2.0.4:** The "Notebook ID" filter field didn't explain that only notebook IDs work. Users tried document IDs and block IDs, which don't match (the SQL uses `box = 'xxx'` which is the notebook column).

**What was fixed in v2.0.5:** Updated the field description to clearly state that only notebook IDs work, and to use Notebook → List to find them.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Check description text | Add a SiYuan Trigger node. Look at the Notebook ID field description/tooltip. It should mention "Must be a notebook ID" and say document/block IDs won't work. | PASS | |
| 2 | Filter with notebook ID | First, find a notebook ID: add a SiYuan node → Notebook → List → execute → copy an ID. Then set the trigger's Notebook ID to that ID. Activate the workflow. Make a change **in that notebook** in SiYuan. Wait for poll. Trigger should fire. | PASS | |
| 3 | Filter excludes other notebooks | With the same filter active, make a change in a **different** notebook. Wait for poll. Trigger should NOT fire. | PASS | |
| 4 | Empty filter catches all | Remove the Notebook ID (leave blank). Activate. Make a change in any notebook. Trigger should fire. | PASS | |

---

## Also verify: Previous fixes still work

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Set Notebook Configuration | Notebook → Create test notebook. Set Configuration with `{"icon": "1f4d3"}`. Get Configuration → icon should be `1f4d3`. Remove notebook. | PASS | |
| 2 | Put + Get File | Asset → Put File `/data/v5-test.txt` with content `test`. Asset → Get File → should return `test`. Asset → Remove File. | PASS | |
| 3 | Trigger baseline (no flood) | Activate a trigger workflow. It should NOT immediately fire. Only fires after you make a change in SiYuan. | PASS | |

---

## Summary of Changes in v2.0.5

| # | Change | File | What |
|---|--------|------|------|
| 1 | Strip trailing slashes from base URL | `lib/SiYuanClient.ts` | `baseURL.replace(/\/+$/, '')` in constructor |
| 2 | Strip trailing slashes in credential test URL | `credentials/SiYuanApi.credentials.ts` | `$credentials.apiUrl.replace(/\/+$/, "")` |
| 3 | Improved notebook filter description | `nodes/SiYuanTrigger/SiYuanTrigger.node.ts` | Clarified that only notebook IDs work |
| 4 | Version bump | `package.json` | 2.0.4 → 2.0.5 |
