# v2.0.3 Retest List — Fixes for Failed Tests

> **Prerequisites:**
> 1. Publish v2.0.3: `npm publish --token=YOUR_TOKEN`
> 2. Verify: `npm view n8n-nodes-siyuan version` → should show `2.0.3`
> 3. In n8n: Settings → Community Nodes → Update `n8n-nodes-siyuan` to 2.0.3
> 4. Run each test below

---

## Fix 1: Credential Test — Invalid Token Detection

**What was wrong:** The credential "Test" button was calling `/api/system/version` which doesn't require authentication, so any token passed.

**What was fixed:** Changed the test endpoint to `/api/notebook/lsNotebooks` which requires a valid token.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Valid token → test succeeds | Go to Credentials → SiYuan API. Enter your correct API URL and token. Click **Test**. Should show green "Connection tested successfully". | FAIL | Changing the API token to either the correct or incorrect value seems to have crashed my n8n instance. When I input wither the incorrect or correct API token and clicked on the button to retry the connection, it would just load and load with no output. I then closed the credential window and I got a series of about 7 popups stating "Failed to connect to SiYuan" or something like that. I'm running n8n in a Proxmox LXC so I have deleted the LXC and restored it from a backup. I have n8n up and running again and I have updated the custom node. I haven't changed any credential settings post update so I can continue with the testing. |
| 2 | Invalid token → test fails | Change the API Token to `wrongtoken12345`. Click **Test**. Should show a red error (NOT green success). | FAIL | |
| 3 | Restore correct token | Put back your real token. Click **Test** to confirm it works again, then **Save**. | FAIL | |

---

## Fix 2: Set Notebook Configuration

**What was wrong:** The node was sending the user's partial JSON directly to SiYuan, but SiYuan expects the *complete* conf object. Sending just `{"icon": "1f4d3"}` failed because SiYuan couldn't unmarshal it into the full BoxConf struct.

**What was fixed:** The handler now first fetches the current configuration, merges the user's changes into it, then sends the complete object back.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Create a test notebook | Resource **Notebook**, Operation **Create**. Name: `setconf-test`. Execute. | PASS | Notebook ID: 20260411183420-gngkb6j |
| 2 | Set configuration — change icon | Operation **Set Configuration**. Paste the Notebook ID. Set Configuration (JSON) to `{"icon": "1f4d3"}`. Execute. Should succeed (no error). | PASS | |
| 3 | Verify the change persisted | Operation **Get Configuration**. Same Notebook ID. Execute. The `conf.icon` field should be `1f4d3`. | PASS | |
| 4 | Set configuration — change another field | Set Configuration (JSON) to `{"dailyNoteSavePath": "/daily/"}`. Execute. Should succeed. | PASS | |
| 5 | Verify both changes | Get Configuration again. `conf.icon` should still be `1f4d3` AND `conf.dailyNoteSavePath` should be `/daily/`. | PASS | |
| 6 | Clean up | Operation **Remove**. Delete the test notebook. | PASS | |

---

## Fix 3: File Operations (Put File)

**What was wrong:** The `/api/file/putFile` endpoint requires **multipart form data** (like a file upload), not a JSON body. The node was sending JSON which SiYuan couldn't parse (`form file is nil`). The Get/Rename/Remove failures were cascading because the file was never created.

**What was fixed:** `putFile` now constructs a proper multipart form data request with `path`, `isDir`, and `file` fields.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Create a file | Resource **Asset**, Operation **Put File**. Set File Path to `/data/n8n-test-file.txt`. Set File Content to `Hello from n8n! This is a test file.`. Execute. Should succeed with `{success: true}`. | PASS | |
| 2 | Read the file back | Operation **Get File**. Set File Path to `/data/n8n-test-file.txt`. Execute. Output should contain the text you wrote. | FAIL | SiYaun API Error (/api/file/getFile): Unknown error (Code: unidentified) |
| 3 | Rename the file | Operation **Rename File**. Set Current Path to `/data/n8n-test-file.txt`. Set New Path to `/data/n8n-test-renamed.txt`. Execute. Should succeed. | PASS | |
| 4 | Verify rename worked | Operation **Get File**. Set File Path to `/data/n8n-test-renamed.txt`. Execute. Should return the file content. | FAIL | SiYaun API Error (/api/file/getFile): Unknown error (Code: unidentified) |
| 5 | Remove the file | Operation **Remove File**. Set File Path to `/data/n8n-test-renamed.txt`. Execute. Should succeed. | PASS | |
| 6 | Verify removal | Operation **Get File**. Set File Path to `/data/n8n-test-renamed.txt`. Execute. Should error with "file not found" or similar. | FAIL | SiYaun API Error (/api/file/getFile): Unknown error (Code: unidentified) |

---

## Bonus: Trigger Node (Not Tested in v1)

These were left blank in the original test run. If you have time, please test them with v2.0.3.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Activate trigger | Create a new workflow. Add **SiYuan Trigger**. Set Event to **Document Changed**. Set credentials. Click **Activate** (toggle top-right). Should activate without error. | PASS | |
| 2 | Trigger on doc creation | With workflow active, create a new document in SiYuan. Wait ~1 minute. Check n8n workflow executions — trigger should have fired. | FAILED | Something about running this caused n8n to crash. There was no error popup, n8n just become unresponsive. I restored the LCX backup again |
| 3 | Check output data | Click on the execution. Output should have fields: `id`, `type` (= `d`), `content`, `updated`. | PASS | |
| 4 | Deactivate | Toggle the workflow off. No errors should appear. | SKIPPED | Skipped because of above reason |

---

## Summary

| Fix | Original Test | What Changed |
|-----|--------------|-------------|
| Fix 1 | T2.2 #2 | Credential test endpoint: `/api/system/version` → `/api/notebook/lsNotebooks` |
| Fix 2 | T4 #10 | setNotebookConf handler: now fetches current conf, merges changes, sends full object |
| Fix 3 | T10 #3-6 | putFile: JSON body → multipart form data with boundary |

**After all tests pass**, update the main `project-test-list.md` with the new results.
