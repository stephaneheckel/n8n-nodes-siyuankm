# n8n-nodes-siyuan v2.0.2 — Manual Test List

> **How to use this file:**
> - For each test, enter `PASS` or `FAIL` in the **Result** field
> - Add optional context in the **Notes** field
> - Tests marked `[PASS]` or `[SKIP]` were already verified and don't need retesting
> - All tests should be performed in n8n against your live SiYuan instance at `http://siyuan.lan`
>
> **SiYuan credentials for testing:**
> - API URL: `http://siyuan.lan`
> - API Token: configured in n8n credentials

---

## T1: Build & Compilation (PREVIOUSLY VERIFIED)

All T1 tests were verified during development. No manual retesting needed.

- [PASS] pnpm install, build, lint, format — all clean
- [PASS] dist/ output complete — 6 nodes, 6 icons, 1 codex, 1 credential, 3 lib files
- [PASS] Package size: 59.2 kB packed, 90 files, no sensitive file leakage

---

## T2: Credentials

> **Setup:** In n8n, go to Credentials > Add credential > SiYuan API. Enter your SiYuan URL and token.

### T2.1 Credential Fields (test in n8n credential editor)

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | `apiUrl` field renders in credential UI | PASS | |
| 2 | `apiUrl` defaults to `http://127.0.0.1:6806` | PASS | verified programmatically |
| 3 | `apiUrl` accepts custom URL (`http://siyuan.lan`) | PASS | |
| 4 | `apiToken` field renders and is masked (dots/asterisks) | PASS | |
| 5 | Documentation link is present/clickable | PASS | The link takes you to https://github.com/siyuan-note/siyuan/blob/master/API.md |

### T2.2 Connection Test (use "Test" button in credential editor)

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Valid credentials → test succeeds with green checkmark | PASS | Use `http://siyuan.lan` + your token |
| 2 | Invalid token → test fails with clear error | FAIL | If you put in the incorrect token you get a message stating "connection tested successfully" in green |
| 3 | Wrong URL (`http://siyuan.lan:9999`) → test fails with clear error | PASS | |
| 4 | URL without trailing slash works the same as with | PASS | Try `http://siyuan.lan` vs `http://siyuan.lan/` |

---

## T3: Node Registration & UI

> **Setup:** Create a new workflow in n8n. Try adding each node type.

### T3.1 Main SiYuan Node

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | SiYuan node appears when searching in node picker | PASS | Search "SiYuan" |
| 2 | SiYuan icon displays correctly (not broken image) | PASS | |
| 3 | Node can be added to canvas | PASS | |
| 4 | Resource dropdown shows: Asset, Attribute, Block, Document, Notebook, Search, System, Tag | ____ | |
| 5 | Selecting "Notebook" → shows notebook operations (Create, List, etc.) | PASS | |
| 6 | Selecting "Document" → shows document operations | PASS | |
| 7 | Selecting "Block" → shows block operations | PASS | |
| 8 | Parameters show/hide correctly when switching operations | PASS | |
| 9 | Credential selector shows SiYuanApi and can be selected | PASS | |

### T3.2 AI Tool Nodes

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | SiYuan Document Tool appears in node picker | PASS | Search "SiYuan Document" |
| 2 | SiYuan Block Tool appears in node picker | PASS | Search "SiYuan Block" |
| 3 | SiYuan Search Tool appears in node picker | PASS | Search "SiYuan Search" |
| 4 | SiYuan Notebook Tool appears in node picker | PASS | Search "SiYuan Notebook" |
| 5 | All 4 tool nodes show SiYuan icon correctly | PASS | |

### T3.3 Trigger Node

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | SiYuan Trigger appears in trigger node picker | PASS | |
| 2 | Trigger icon displays correctly | PASS | |
| 3 | Event dropdown shows "Document Changed" and "Block Changed" | PASS | |
| 4 | Notebook ID filter field is visible | PASS | |
| 5 | Credential selector works | PASS | |

---

## T4: Notebook Operations

> **How to test:** Add a SiYuan node to a workflow. Set Resource to **Notebook**. Change the Operation dropdown for each test. Click **Execute Node** (or **Test Workflow**) to run.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Create a test notebook | Set Operation to **Create**. Set Notebook Name to `n8n-test-notebook`. Execute. Check the output JSON contains `id` and `name` fields. | PASS | Write down the ID: 20260411144320-u7rcd08 |
| 2 | Verify it appeared in SiYuan | Open SiYuan in your browser (`http://siyuan.lan`). Look in the left sidebar for "n8n-test-notebook". | PASS | |
| 3 | List all notebooks | Set Operation to **List**. Execute. Check the output is an array and your test notebook is in it. | PASS | |
| 4 | Check List output fields | Look at any notebook item in the List output. Confirm it has these fields: `id`, `name`, `icon`, `sort`, `closed`. | PASS | |
| 5 | Rename the notebook | Set Operation to **Rename**. Paste the notebook ID into Notebook ID. Set New Name to `n8n-test-renamed`. Execute. | PASS | |
| 6 | Verify rename in SiYuan | Refresh SiYuan UI. The notebook should now show as "n8n-test-renamed". | PASS | |
| 7 | Close the notebook | Set Operation to **Close**. Paste the notebook ID. Execute. Output should show `{success: true}`. | PASS | |
| 8 | Open the notebook | Set Operation to **Open**. Paste the notebook ID. Execute. Output should show `{success: true}`. | PASS | |
| 9 | Get configuration | Set Operation to **Get Configuration**. Paste the notebook ID. Execute. Output should contain `box`, `conf`, and `name` fields. | PASS | |
| 10 | Set configuration | Set Operation to **Set Configuration**. Paste the notebook ID. Set Configuration (JSON) to `{"icon": "1f4d3"}`. Execute. Then do Get Configuration again to verify the icon changed. | FAIL | Failed with error code: SiYuan API Error (/api/notebook/setNotebookConf): json: cannot unmarshal string into Go value of type con.BoxConf (Code: -1). Check the operation parameters and ensure SiYuan is running. My SiYuan instance was running during this test. |
| 11 | Test invalid ID error | Set Operation to **Get Configuration**. Set Notebook ID to `invalid-id-12345`. Execute. It should error with a clear message (not a crash). | PASS | Error message: SiYuan API Error (/api/notebook/getNotebookConf): invalid ID argument (Code: -1). Check the operation parameters and ensure SiYuan is running |
| 12 | Remove the notebook | Set Operation to **Remove**. Paste the notebook ID. Execute. | PASS | |
| 13 | Verify removal in SiYuan | Refresh SiYuan UI. "n8n-test-renamed" should be gone. | PASS | |

---

## T5: Document Operations

> **How to test:** First create a fresh test notebook (Notebook → Create, name it `doc-test-notebook`). Write down its ID below. Then add a second SiYuan node with Resource set to **Document**.
>
> **Test notebook ID:** _______________

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Create a document | Set Operation to **Create**. Set Notebook ID to your test notebook. Set Document Path to `/test-doc`. Set Markdown Content to `# Hello World\n\nThis is a test document.\n\n- Item 1\n- Item 2`. Execute. Output should return a document ID string. | PASS | Write down Doc ID: 20260411145756-nsgnzr2. The test passes but the markdown that I had to input wasn't formatted correctly in the document. It was written as one line as H1 |
| 2 | Verify in SiYuan UI | Open SiYuan. Navigate to `doc-test-notebook`. You should see "test-doc" with the heading and list. | PASS | |
| 3 | Create a nested document | Set Operation to **Create**. Same notebook ID. Set Document Path to `/parent/child/deep-doc`. Set Markdown to `Nested document content`. Execute. | PASS | |
| 4 | List documents in notebook | Set Operation to **List in Notebook**. Set Notebook ID. Execute. Output should be an array containing both documents, each with `id`, `name`, `title`. | PASS | |
| 5 | Get document content | Set Operation to **Get Content**. Set Document ID to the ID from step 1. Execute. Output should be the markdown string you entered. | PASS | |
| 6 | Export as markdown | Set Operation to **Export Markdown**. Set Document ID. Execute. Output should have `hPath` (like `/test-doc`) and `content` (the markdown). | PASS | |
| 7 | Get ID by path | Set Operation to **Get ID by Path**. Set Notebook ID. Set Document Path to `/test-doc`. Execute. Output should return the same ID as step 1. | PASS | |
| 8 | Get path by ID | Set Operation to **Get Path by ID**. Set Document ID from step 1. Execute. Output should be `/test-doc`. | PASS | |
| 9 | Get storage path | Set Operation to **Get Storage Path by ID**. Set Document ID. Execute. Output should be a path like `/data/notebookId/docId.sy`. | PASS | |
| 10 | Get document tree | Set Operation to **Get Document Tree**. Set Document ID. Execute. Output should be an array of block objects with `id`, `type`, `kramdown`, and `children`. | PASS | |
| 11 | Rename the document | Set Operation to **Rename**. Set Document ID. Set New Title to `Renamed Test Doc`. Execute. | PASS | |
| 12 | Verify rename in SiYuan | Refresh SiYuan. The document should now show as "Renamed Test Doc". | PASS | |
| 13 | Test invalid ID error | Set Operation to **Get Content**. Set Document ID to `invalid-id-12345`. Execute. Should error with a clear message. | PASS | |
| 14 | Remove test documents | Set Operation to **Remove**. Remove both documents by running with each Document ID. | PASS | |
| 15 | Clean up notebook | Switch Resource back to **Notebook**, Operation to **Remove**. Remove the test notebook. | PASS | |

---

## T6: Block Operations

> **How to test:** Create a fresh test notebook + document first. The document ID is also the "root block ID" you'll use as the parent for appending blocks.
>
> **Test notebook ID:** _______________
> **Test document ID (= root block ID):** _______________

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Append a block | Set Resource to **Block**, Operation to **Append**. Set Parent Block ID to your document ID. Set Content (Markdown) to `## Section 1\n\nSome paragraph text.`. Execute. Output should contain block info. | PASS | Write down the Block ID from the output: 2026041151400-5yugzhz. The markdown wasn't formatted correctly. It was output as a single line in H1 |
| 2 | Verify in SiYuan | Open the document in SiYuan. "Section 1" and the paragraph should appear at the bottom. | PASS | |
| 3 | Prepend a block | Set Operation to **Prepend**. Same Parent Block ID (doc ID). Set Content to `This should be at the very top.`. Execute. | PASS | |
| 4 | Get child blocks | Set Operation to **Get Child Blocks**. Set Block ID to the document ID. Execute. Output should be an array listing all the blocks you added. Note: each item has `id`, `type`, `subType`. | PASS | |
| 5 | Get kramdown | Set Operation to **Get Kramdown**. Set Block ID to the block ID from step 1. Execute. Output should show `{id, kramdown}` where kramdown contains the markdown. | PASS | |
| 6 | Get content as markdown | Set Operation to **Get Content (Markdown)**. Set Block ID. Execute. Output should be a plain markdown string. | PASS | |
| 7 | Update a block | Set Operation to **Update**. Set Block ID to the block from step 1. Set Content to `## Updated Section\n\nThis content was changed.`. Execute. | PASS | The markdown wasn't formatted correctly. It was output as a single line in H1 |
| 8 | Verify update in SiYuan | Refresh the document in SiYuan. The heading should now say "Updated Section". | PASS | |
| 9 | Move a block | Set Operation to **Move**. Set Block ID to the prepended block (from step 3 — use Get Child Blocks to find its ID). Set Move After Block ID to the block from step 1. Execute. The prepended block should now appear after Section 1. | PASS | |
| 10 | Fold a heading block | Set Operation to **Fold**. Set Block ID to the heading block from step 1. Execute. In SiYuan, the heading should appear collapsed. | PASS | |
| 11 | Unfold the block | Set Operation to **Unfold**. Same Block ID. Execute. The heading should expand again in SiYuan. | PASS | |
| 12 | Delete a block | Set Operation to **Delete**. Set Block ID to any block you created. Execute. | PASS | |
| 13 | Verify deletion in SiYuan | Refresh the document. The deleted block should be gone. | PASS | |
| 14 | Test invalid ID error | Set Operation to **Get Kramdown**. Set Block ID to `invalid-id-12345`. Execute. Should error with a clear message. | PASS | |
| 15 | Clean up | Switch to Resource **Notebook**, Operation **Remove**. Remove the test notebook (this deletes everything inside it). | PASS | |

---

## T7: Attribute Operations

> **How to test:** Create a test notebook, then a document, then use Block → Append to create a paragraph block. Write down the block ID below.
>
> **Test block ID:** _______________

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Set a custom attribute | Set Resource to **Attribute**, Operation to **Set**. Set Block ID. In the Attributes section, click "Add Attribute". Set Name to `custom-status` and Value to `draft`. Execute. | PASS | |
| 2 | Set a built-in attribute | Same setup, but add another attribute with Name `memo` and Value `test memo text`. Execute. | PASS | |
| 3 | Get all attributes | Set Operation to **Get**. Set Block ID. Execute. Output should contain both `custom-status: draft` and `memo: test memo text` among other built-in fields. | PASS | |
| 4 | Overwrite an attribute | Set Operation to **Set**. Set Block ID. Add attribute Name `custom-status`, Value `published`. Execute. Then Get again — value should now be `published`. | PASS | |
| 5 | Test invalid ID error | Set Operation to **Get**. Set Block ID to `invalid-id-12345`. Execute. Should error with a clear message. | PASS | |
| 6 | Clean up | Remove the test notebook. | PASS | |

---

## T8: Tag Operations

> **How to test:** Create a test notebook + document + paragraph block. Write down the block ID below. Set Resource to **Tag** for all tests.
>
> **Test block ID:** _______________

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Add a tag | Set Operation to **Add**. Set Block ID. Set Tag to `test-tag`. Execute. Output should show `{blockId, tags: ["test-tag"]}`. | PASS | |
| 2 | Add a second tag | Same setup. Set Tag to `another-tag`. Execute. Output should show both tags in the array. | PASS | |
| 3 | Get tags for the block | Set Operation to **Get Tags for Block**. Set Block ID. Execute. Output should list `["test-tag", "another-tag"]`. | PASS | |
| 4 | Add duplicate tag (idempotent) | Set Operation to **Add**. Set Tag to `test-tag` again. Execute. Output tags array should still only have `test-tag` once (no duplicates). | PASS | |
| 5 | List all tags in workspace | Set Operation to **List All**. Execute. Output should be an array of `{tag, count}` objects that includes your test tags. | PASS | |
| 6 | Find blocks by tag | Set Operation to **Find Blocks by Tag**. Set Tag to `test-tag`. Execute. Output should include your test block. | PASS | |
| 7 | Rename a tag | Set Operation to **Rename**. Set Current Tag Name to `test-tag`. Set New Tag Name to `renamed-tag`. Execute. Output should show `{oldTag, newTag, blocksUpdated: 1}`. | PASS | |
| 8 | Remove a tag | Set Operation to **Remove**. Set Block ID. Set Tag to `another-tag`. Execute. Then do Get Tags — only `renamed-tag` should remain. | PASS | |
| 9 | Test invalid ID error | Set Operation to **Add**. Set Block ID to `invalid-id-12345`. Set Tag to `x`. Execute. Should error clearly. | PASS | |
| 10 | Clean up | Remove the test notebook. | PASS | |

---

## T9: Search & Query Operations

> **How to test:** Make sure you have some content in SiYuan (from earlier tests, or your existing notes). Set Resource to **Search**.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Basic SQL query | Set Operation to **SQL Query**. Set SQL Statement to `SELECT * FROM blocks LIMIT 5`. Execute. Output should be an array of 5 block row objects. | PASS | |
| 2 | SQL query filtering documents | Set SQL Statement to `SELECT * FROM blocks WHERE type = 'd' LIMIT 10`. Execute. Every result should have `type: "d"`. | PASS | |
| 3 | SQL with invalid syntax | Set SQL Statement to `SELCT * FORM blocks`. Execute. Should return a clear error message (not a crash). | PASS | |
| 4 | Full-text search (has results) | Set Operation to **Full-Text Search**. Set Search Query to a word you know exists in your SiYuan notes. Execute. Output should contain matching blocks. | PASS | Search word used: and |
| 5 | Full-text search (no results) | Set Search Query to `xyznonexistentword12345`. Execute. Output should be empty results (not an error). | PASS | |
| 6 | Search by attribute | Set Operation to **Search by Attribute**. Set Attribute Name to `memo` and Attribute Value to `test` (or any value you set in T7). Execute. | PASS | |
| 7 | Get recent changes | Set Operation to **Get Recent Changes**. Set Limit to `5`. Execute. Output should be an array of recently modified documents, newest first. | PASS | |

---

## T10: Asset & File Operations

> **How to test:** Set Resource to **Asset**. For the Upload test, you'll need a previous node that provides binary data (e.g., an HTTP Request node that downloads a small image).

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | List files in /data/ | Set Operation to **List Files in Directory**. Set Directory Path to `/data/`. Execute. Output should be an array of folder entries (one per notebook). | PASS | |
| 2 | Check list output fields | Look at an entry in the output. Confirm it has `isDir`, `name`, `updated` fields. | PASS | |
| 3 | Create a test file | Set Operation to **Put File**. Set File Path to `/data/n8n-test-file.txt`. Set File Content to `Hello from n8n!`. Execute. | FAIL | Error message: SiYuan API Error (/api/file/putFile): form file is nil (Code: 400). Check operation parameters and ensure SiYuan is running |
| 4 | Read the file back | Set Operation to **Get File**. Set File Path to `/data/n8n-test-file.txt`. Execute. Output should contain the text you wrote. | FAIL | Error message: SiYuan API Error (/api/file/getFile): file does not exist (Code: 404) Check operation parameters and ensure SiYuan is running |
| 5 | Rename the file | Set Operation to **Rename File**. Set Current Path to `/data/n8n-test-file.txt`. Set New Path to `/data/n8n-test-renamed.txt`. Execute. | FAIL | Error message: SiYuan API Error (/api/file/renameFile) the [path] file or directory does not exist (Code: 404). Check the operation parameters and ensure SiYuan is running |
| 6 | Remove the file | Set Operation to **Remove File**. Set File Path to `/data/n8n-test-renamed.txt`. Execute. | FAIL | Error message: SiYuan API Error: (/api/file/removeFile): Unknown error (Code: 404). Check operation parameters and ensure SiYuan is running |
| 7 | Test invalid path error | Set Operation to **Get File**. Set File Path to `/nonexistent/fakefile.txt`. Execute. Should error with a clear message. | PASS | |
| 8 | Upload an asset (optional) | This requires binary data from a previous node. Add an HTTP Request node before the SiYuan node that downloads a small image (e.g., `https://via.placeholder.com/100`). Then set Operation to **Upload Asset**, Assets Directory Path to `/assets/`, Binary Property to `data`. Execute. Output should contain a `succMap` with the uploaded file path. | SKIPPED | Skip if too complex to set up |

---

## T11: System & Utility Operations

> **How to test:** Set Resource to **System**. These are simple one-shot operations.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Get SiYuan version | Set Operation to **Get Version**. Execute. Output should be a version string like `"3.1.x"`. | PASS | Version returned: 3.6.3 |
| 2 | Get server time | Set Operation to **Get Current Time**. Execute. Output should be a large number (milliseconds since epoch). | PASS | |
| 3 | Push a message | Set Operation to **Push Message**. Set Message to `Hello from n8n!`. Leave Timeout at 7000. Execute. Then look at your SiYuan UI — a notification toast should appear briefly. | PASS | |
| 4 | Push an error message | Set Operation to **Push Error Message**. Set Message to `Test error from n8n`. Execute. A red/error-styled toast should appear in SiYuan. | PASS | |
| 5 | Render a Sprig template | Set Operation to **Render Sprig Template**. Set Sprig Template to `{{now \| date "2006-01-02"}}`. Execute. Output should be today's date in YYYY-MM-DD format (e.g., `2026-04-11`). | PASS | |
| 6 | Export resources | Set Operation to **Export Resources**. Set Paths to a valid notebook path from your SiYuan (e.g., the path of a small notebook — use List Files `/data/` to find one). Execute. Output should contain a `path` field pointing to the exported zip. | PASS | |

---

## T12: AI Tool Nodes — SKIPPED

> **Reason:** No AI model available for testing. AI Tool nodes were verified to compile, register, and appear in the node picker (tested in T3.2). Full agent-based testing deferred to when an AI model is available.

---

## T13: Trigger Node

> **How to test:** Create a **new workflow**. Add the **SiYuan Trigger** node as the start node. Configure it and activate the workflow. Then make changes in SiYuan and check if the trigger fires.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Activate trigger workflow | Add SiYuan Trigger to a new workflow. Set Event to **Document Changed**. Set credentials. Click **Activate** (toggle in top-right). It should activate without errors. | ___ | |
| 2 | Trigger on document creation | With the workflow active, go to SiYuan and create a new document in any notebook. Wait for the next poll (check workflow executions). The trigger should fire. | ___ | |
| 3 | Trigger on document edit | Edit an existing document in SiYuan (change some text). Wait for next poll. Trigger should fire again. | ___ | |
| 4 | Check trigger output data | Click on the execution in n8n. The output of the trigger node should contain fields: `id`, `type` (should be `d`), `content`, `updated`. | ___ | |
| 5 | Test notebook filter | Edit the trigger node. Set Notebook ID to a specific notebook ID (use Notebook → List to find one). Activate. Make a change in a **different** notebook — trigger should NOT fire. Make a change in the filtered notebook — it should fire. | ___ | |
| 6 | Test "Block Changed" event | Edit the trigger. Change Event to **Block Changed**. Activate. Edit a paragraph in SiYuan. Trigger should fire with `type` other than `d` (e.g., `p` for paragraph). | ___ | |
| 7 | Deactivate cleanly | Toggle the workflow off. Check that no errors appear. The trigger should stop polling. | ___ | |

---

## T14: Error Handling

> **How to test:** Use the main SiYuan node. Intentionally provide bad inputs to see if error messages are helpful.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Invalid notebook ID error | Set Resource to **Notebook**, Operation to **Get Configuration**. Set Notebook ID to `bad-id-12345`. Execute. Error message should mention the notebook and suggest what to do. | PASS | Copy the error message: SiYuan API Error (/api/notebook/getNotebookConf): invalid ID argument (Code: -1). Check the operation parameters and ensure SiYuan is running |
| 2 | Invalid document ID error | Set Resource to **Document**, Operation to **Get Content**. Set Document ID to `bad-id-12345`. Execute. Error should be clear. | PASS | Copy the error message: SiYuan API Error (/api/export/exportMdContent): invalid ID argument (Code: -1). Check the operation parameters and ensure SiYuan is running |
| 3 | Invalid block ID error | Set Resource to **Block**, Operation to **Get Kramdown**. Set Block ID to `bad-id-12345`. Execute. Error should be clear. | PASS | Copy the error message: SiYuan API Error (/api/block/getBlockKramdown): invalid ID argument (Code: -1). Check the operation parameters and ensure SiYuan is running |
| 4 | Invalid SQL error | Set Resource to **Search**, Operation to **SQL Query**. Set SQL Statement to `SELCT * FORM blocks`. Execute. Error should mention SQL syntax. | PASS | Copy the error message: SiYuan API Error (/api/query/sql): near "SELCT": syntax error (Code: 1). Check the operation parameters and ensure SiYuan is running |
| 5 | Continue On Fail test | On any SiYuan node, open **Settings** (gear icon) and enable **Continue On Fail**. Set an invalid ID. Execute. Instead of an error stopping the workflow, the output should be an item with `error`, `operation`, `endpoint`, `suggestion` fields. | PASS | |

---

## T15: Data Integrity & Edge Cases

> **How to test:** Use the main SiYuan node for these quick checks.

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Emoji notebook name | Set Resource to **Notebook**, Operation to **Create**. Set name to `📝 Emoji Test Notes`. Execute. Check it appears in SiYuan. Delete it after. | PASS | |
| 2 | Unicode document content | Create a document with Markdown Content containing Chinese, Japanese, or accented characters, e.g.: `# Tëst Döcümënt\n\n你好世界\n\nこんにちは`. Check the content renders in SiYuan. | PASS | |
| 3 | Large markdown content | Create a document with a very long Markdown Content field (copy-paste a few paragraphs of text, or repeat a sentence many times). Verify it doesn't error and content is complete in SiYuan. | PASS | |
| 4 | Empty SQL results | Set Resource to **Search**, Operation to **SQL Query**. Set SQL to `SELECT * FROM blocks WHERE content = 'xyznonexistent99999'`. Execute. Output should be an empty array `[]`, not an error. | PASS | There is no output but n8n shows the node successfully running. N8n shows the message "No output data shown" |

---

## T16: Integration Workflow — Knowledge Base CRUD

> **How to test:** Build a single workflow with multiple SiYuan nodes chained together (each node's output feeds into the next). Use expressions like `{{ $json.id }}` to pass IDs between nodes. This tests the full create → read → update → delete lifecycle.

| # | Step | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | Create notebook | First SiYuan node: Resource **Notebook**, Operation **Create**, Name `E2E Test`. Execute the workflow. | PASS | Notebook ID: 20260411171520-bnfky5y |
| 2 | Create document | Second SiYuan node: Resource **Document**, Operation **Create**. Set Notebook ID to `{{ $json.id }}` (expression from previous node). Path `/e2e/test-doc`. Markdown `# E2E Test\n\nContent here.`. | PASS | Doc ID: 20260411171703-hrg5zob |
| 3 | Append a block | Third node: Resource **Block**, Operation **Append**. Set Parent Block ID to `{{ $json }}` (the doc ID string from previous node). Content `Additional paragraph added by n8n.`. | PASS | Block ID: 20260411171947-pwxx4es |
| 4 | Read content back | Fourth node: Resource **Document**, Operation **Get Content**. Set Document ID to the doc ID (you may need to reference it via expression). Verify the output markdown includes both the original content and the appended block. | PASS | |
| 5 | Add a tag | Fifth node: Resource **Tag**, Operation **Add**. Set Block ID to the block from step 3. Set Tag to `e2e-test`. | PASS | |
| 6 | Find by tag | Sixth node: Resource **Tag**, Operation **Find Blocks by Tag**. Set Tag to `e2e-test`. Output should contain your block. | PASS | |
| 7 | Update the block | Seventh node: Resource **Block**, Operation **Update**. Set Block ID. Set Content to `Updated by E2E test.`. | PASS | |
| 8 | Verify update | Eighth node: Resource **Block**, Operation **Get Content (Markdown)**. Set Block ID. Output should be `Updated by E2E test.`. | PASS | |
| 9 | Delete block | Ninth node: Resource **Block**, Operation **Delete**. Set Block ID. | PASS | |
| 10 | Delete document | Tenth node: Resource **Document**, Operation **Remove**. Set Document ID. | PASS | |
| 11 | Delete notebook | Eleventh node: Resource **Notebook**, Operation **Remove**. Set Notebook ID. | PASS | |
| 12 | Verify cleanup | Twelfth node: Resource **Notebook**, Operation **List**. Execute. `E2E Test` should NOT appear in the list. | PASS | |

---

## T17: Documentation Verification

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | GitHub README | Visit https://github.com/PsycoStea/SiYuan-n8n-nodes in your browser. Check the README renders with proper formatting (tables, badges, headings). | SKIPPED | Not uploaded to GitHub yet. That will be the last step when this project is complete |
| 2 | npm README | Visit https://www.npmjs.com/package/n8n-nodes-siyuan in your browser. Check the README displays correctly. | PASS | |
| 3 | CHANGELOG | On the GitHub repo page, click on `CHANGELOG.md`. Check it lists v2.0.0 changes with breaking changes, added features, etc. | SKIPPED | Will test when uploaded to GitHub |
| 4 | Links work | Click through a few links in the README (SiYuan API docs, n8n community nodes, issues page). None should be 404. | PASS | |
| 5 | In-app descriptions | In n8n, add a SiYuan node. Switch between a few different Resource/Operation combos. Each operation should have a short description visible below the dropdown. Each parameter should have helper text visible. | PASS | |

---

## T18: Publishing Verification

| # | Test | How to do it | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | npm publish succeeded | Already done. | PASS | v2.0.2 published |
| 2 | Package visible on npm | Visit https://www.npmjs.com/package/n8n-nodes-siyuan. Should show the package page. | ___ | |
| 3 | Package version correct | The npm page should show version 2.0.2. | PASS | verified via `npm view` |
| 4 | Installable in n8n | Already done. | PASS | installed successfully |
| 5 | SiYuan node appears after install | Already confirmed in T3. | ___ | Same as T3.1 #1 |
| 6 | AI Tool nodes appear | Already confirmed in T3. | ___ | Same as T3.2 |
| 7 | Trigger node appears | Already confirmed in T3. | ___ | Same as T3.3 #1 |
| 8 | SiYuanApi credential appears | Already confirmed in T2. | ___ | Same as T2.1 |

---

## Test Execution Log

| Date | Tester | Sections Tested | Pass | Fail | Notes |
|------|--------|----------------|------|------|-------|
| 2026-04-10 | Claude | T1 (Build) | 14/16 | 0 | Automated verification |
| 2026-04-10 | Claude | T2 (Credentials, partial) | 5/13 | 0 | Code-level verification |
| 2026-04-11 | | | | | |

---

## Summary

| Section | Tests | Type |
|---------|-------|------|
| T1 | DONE | Automated (previously verified) |
| T2 | 9 manual | n8n credential UI |
| T3 | 19 manual | n8n node picker UI |
| T4 | 13 manual | n8n + SiYuan |
| T5 | 15 manual | n8n + SiYuan |
| T6 | 15 manual | n8n + SiYuan |
| T7 | 6 manual | n8n + SiYuan |
| T8 | 10 manual | n8n + SiYuan |
| T9 | 7 manual | n8n + SiYuan |
| T10 | 8 manual | n8n + SiYuan |
| T11 | 6 manual | n8n + SiYuan |
| T12 | SKIPPED | No AI model available |
| T13 | 7 manual | n8n + SiYuan |
| T14 | 5 manual | n8n + SiYuan |
| T15 | 4 manual | n8n + SiYuan |
| T16 | 12 manual | n8n + SiYuan (end-to-end) |
| T17 | 5 manual | Browser + n8n |
| T18 | 5 manual (3 already PASS) | npm + n8n |
| **Total manual** | **~146 tests** | |
