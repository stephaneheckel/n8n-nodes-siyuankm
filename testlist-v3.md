# v2.0.4 Retest List — Fixes for v2.0.3 Failures

> **Prerequisites:**
> 1. Publish v2.0.4: `npm publish --token=YOUR_TOKEN`
> 2. Verify: `npm view n8n-nodes-siyuan version` → should show `2.0.4`
> 3. In n8n: Settings → Community Nodes → Update `n8n-nodes-siyuan` to 2.0.4
> 4. Run each test below

---

## Fix 1: Credential Test — Invalid Token Now Rejected

**What was wrong in v2.0.3:** The credential test checked HTTP status only (200 = pass). SiYuan returns HTTP 200 even for auth failures — it puts the error in the JSON body `{"code": -1, "msg": "Auth failed"}`. So n8n said "Connection tested successfully" with a bad token.

**What was fixed in v2.0.4:** Added a `responseSuccessBody` rule that checks the JSON body's `code` field equals `0`. If `code` is `-1` (auth failed), n8n now shows the error message.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Valid token passes | Go to **Credentials → SiYuan API**. Make sure API URL is `http://siyuan.lan` and token is your real token. Click **Test**. Should show green success. | PASS | For the test to pass I had to add a "/" at the end of the domain for the connection to be successful. When I omitted the "/" at the end of the domain, I got a an error message saying "Couldn't connect with these settings. Authentication failed. Check your API token (found in SiYuan > About)." I guess the error message is technically incorrect as the API key is correct, it is the missing "/" at the end of the domain name that is cause the error message to pop up |
| 2 | Invalid token fails | Change the API Token to `wrongtoken12345`. Click **Test**. Should show a red error mentioning "Authentication failed" or similar. **Do NOT repeatedly click Test** — click once and wait for the response. | FAIL | I got a green message stating "connection successfully tested." However, if I remove the "/" at the end of the domain name and click retry, I get an error message stating "Authorisation failed - please check your credentials" which is more of a correct error message for this test.  |
| 3 | Restore and save | Put back your real token. Click **Test** to confirm it works, then click **Save**. | PASS | I tested using the domain and IP:port but they both need to have "/" at the end. |

> **Important:** If the test button seems to hang, wait 30 seconds for the timeout. Do not click it repeatedly — that sends multiple requests to SiYuan which can overwhelm n8n's UI.

---

## Fix 2: Get File — Now Returns Raw Content

**What was wrong in v2.0.3:** SiYuan's `/api/file/getFile` returns raw file content (plain text, not JSON). Our client tried to parse it as JSON and failed with "Unknown error (Code: unidentified)".

**What was fixed in v2.0.4:** Added a special handler for `getFile` that uses `responseType: 'text'` and returns the raw content directly without JSON parsing.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Create a test file | Resource **Asset**, Operation **Put File**. Set File Path to `/data/v3-test-file.txt`. Set File Content to `Hello from n8n v2.0.4!`. Execute. Should succeed. | PASS | |
| 2 | Read the file back | Operation **Get File**. Set File Path to `/data/v3-test-file.txt`. Execute. Output should contain the text `Hello from n8n v2.0.4!`. | PASS | |
| 3 | Read a non-existent file | Operation **Get File**. Set File Path to `/data/this-does-not-exist.txt`. Execute. Should return a clear error message (not "Unknown error"). | PASS | Error message states file doesn't exist |
| 4 | Clean up | Operation **Remove File**. Set File Path to `/data/v3-test-file.txt`. Execute. | PASS | |

---

## Fix 3: Trigger Node — No Longer Floods on First Poll

**What was wrong in v2.0.3:** On the first activation, the trigger had no `lastTimestamp` baseline, so it queried ALL blocks matching the event type. For "Block Changed" on a workspace with thousands of blocks, this returned a massive result set that could overwhelm n8n's memory (2GB LXC), causing unresponsiveness.

**What was fixed in v2.0.4:** The first poll now queries only the latest timestamp as a baseline and returns `null` (no trigger). Subsequent polls only detect changes that happen *after* activation.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Activate trigger | Create a new workflow. Add **SiYuan Trigger**. Set Event to **Document Changed**. Set credentials. Click **Activate** (top-right toggle). Should activate without errors or n8n becoming unresponsive. | UNKNOWN | I added a trigger node and set up a gotify node so I can receive a notification when the trigger happens. I edited the name of the notebook and I created a new document. I have published the flow. Testing the trigger for the document change doesn't seem to be working. I am using a notebook ID and a document ID and it is not detecting any change. When I use the block changed trigger node, I can sometimes get the notification to come through. I have tried using a notebook ID, document ID and block ID but I can't tell exactly what is succeeding and failing. I just tried a new test and when I leave the Notebook ID field blank in the block changed node, I get a notification for each separate change made. I also removed the ID from the document changed node and I immediately got a notification. There seems to be an issue when using an ID to track the changes, but when no ID is used it tracks all changes |
| 2 | No immediate trigger | Immediately after activation, check the workflow executions. There should be NO execution yet (first poll just captures baseline). | PASS | |
| 3 | Create a doc in SiYuan | Go to SiYuan and create a new document in any notebook. Wait ~1-2 minutes for the next poll. | PASS | |
| 4 | Trigger fires | Check n8n workflow executions. A new execution should appear. Click on it. | PASS | |
| 5 | Check output | The trigger output should contain block data with fields: `id`, `type` (= `d`), `content`, `updated`, `box`. | PASS | |
| 6 | Deactivate | Toggle the workflow off. Should deactivate cleanly with no errors. | PASS | |
| 7 | Test "Block Changed" | Edit the trigger. Change Event to **Block Changed**. Activate. Edit some text in a document in SiYuan. Wait for poll. Trigger should fire with block data where `type` is NOT `d`. Deactivate when done. | PASS | |

---

## Summary of Changes in v2.0.4

| # | Issue | Root Cause | Fix |
|---|-------|-----------|-----|
| 1 | Credential test accepts invalid token | SiYuan returns HTTP 200 for auth failures; n8n only checked HTTP status | Added `responseSuccessBody` rule checking JSON `code === 0` |
| 2 | Get File returns "Unknown error" | `/api/file/getFile` returns raw text, not JSON; client tried to JSON-parse it | New `getFile()` method with `responseType: 'text'` and custom error handling |
| 3 | Trigger crashes n8n on activation | First poll with no baseline returned ALL blocks (thousands of rows) | First poll now just captures latest timestamp as baseline, returns null |
