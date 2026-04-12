# n8n-nodes-siyuan v2.0.0 — Project Checklist

## Phase 1: Cleanup & Project Setup

### 1.1 Remove Scaffolding
- [x] Delete `nodes/ExampleNode/` directory and all contents
- [x] Delete `nodes/HttpBin/` directory and all contents
- [x] Delete `credentials/ExampleCredentialsApi.credentials.ts`
- [x] Delete `credentials/HttpBinApi.credentials.ts`
- [x] Remove ExampleNode, HttpBin, and their credentials from `package.json` → `n8n` section
- [x] Delete `README_TEMPLATE.md`
- [x] Verify build still compiles after removals

### 1.2 Update Project Metadata
- [x] Bump version to `2.0.0` in `package.json`
- [x] Update `description` in `package.json` to reflect AI agent focus
- [x] Update `keywords` to include `siyuan`, `note-taking`, `knowledge-base`, `ai-agent`, `ai-tool`
- [x] Update `repository`, `homepage`, and `bugs` URLs in `package.json`
- [x] Update `engines` field if Node.js requirements change — kept at >=18.10 (still appropriate)
- [x] Review and update `.gitignore` for any new patterns — added `*.tsbuildinfo`
- [x] Review and update `.npmignore` for distribution — expanded to exclude source, dev, and project files

### 1.3 Dependency Audit
- [x] Review and update `axios` to latest stable — updated 1.9.0 → 1.15.0
- [x] Review and update `n8n-workflow` peer dependency — kept as `*` (appropriate for community nodes)
- [x] Review and update all devDependencies — updated prettier 3.5.3 → 3.8.2, eslint-plugin-n8n-nodes-base 1.16.3 → 1.16.6. Kept ESLint 8, TypeScript 5, Gulp 4 (major bumps risk n8n plugin compatibility)
- [x] Run `pnpm audit` and address any vulnerabilities — pnpm overrides already in place
- [x] Verify `pnpm build` passes cleanly

---

## Phase 2: Architecture Restructure

### 2.1 New Directory Structure
- [x] Create `nodes/SiYuan/actions/` directory
- [x] Create `nodes/SiYuan/actions/notebook/` directory
- [x] Create `nodes/SiYuan/actions/document/` directory
- [x] Create `nodes/SiYuan/actions/block/` directory
- [x] Create `nodes/SiYuan/actions/attribute/` directory
- [ ] Create `nodes/SiYuan/actions/tag/` directory — deferred to Phase 8 (new operations)
- [x] Create `nodes/SiYuan/actions/search/` directory
- [ ] Create `nodes/SiYuan/actions/asset/` directory — deferred to Phase 10 (new operations)
- [x] Create `nodes/SiYuan/actions/system/` directory
- [x] Created `lib/interfaces.ts` for shared type definitions (replaces descriptions/ directory)
- [ ] Create `nodes/SiYuanTrigger/` directory — deferred to Phase 13 (trigger node)
- [x] Restructured `lib/` with `interfaces.ts` + refactored `SiYuanClient.ts`

### 2.2 Refactor SiYuanClient.ts
- [x] Review current `SiYuanClient.ts` for all existing methods
- [x] Kept as single client with well-organized sections (logical grouping by resource)
- [x] Add typed interfaces for ALL API request/response payloads — created `lib/interfaces.ts`
- [x] Add JSDoc comments to all public methods
- [x] Implement credential test method (`testConnection()` calling `/api/system/version`)
- [x] Add consistent error wrapping for all API calls (NodeApiError with endpoint context)
- [x] Add structured error responses (error code, message, suggested action) — base structure in place
- [x] Ensure all methods return typed responses (no `any` types) — replaced with `unknown`, `BlockOperationResult`, etc.

### 2.3 Refactor Main Node File
- [x] Rewrite `SiYuan.node.ts` as a router that delegates to resource-specific files
- [x] Define resource dropdown (Notebook, Document, Block, Attribute, Search, System) — Tag + Asset added in later phases
- [x] Define operation dropdowns per resource
- [x] Import and wire up operation descriptions from resource files
- [x] Import and wire up execute handlers from resource files via `RESOURCE_HANDLERS` map
- [x] Ensure `continueOnFail()` error handling is consistent across all operations
- [x] Add `pairedItem` tracking to all output items via `constructExecutionMetaData`
- [x] Set `usableAsTool: true` for AI agent compatibility

---

## Phase 3: Credential Overhaul

### 3.1 Update SiYuanApi Credentials
- [x] Review current `SiYuanApi.credentials.ts`
- [x] Ensure `apiUrl` field has proper validation (URL format) — has default + placeholder
- [x] Ensure `apiToken` field uses `typeOptions: { password: true }`
- [x] Add `documentationUrl` pointing to SiYuan API docs
- [x] Implement `test` property that calls `/api/system/version` to verify connection
- [x] Add helpful placeholder text and descriptions for each field
- [ ] Test credential validation with valid and invalid tokens — requires running n8n + SiYuan
- [ ] Test credential validation with unreachable URLs — requires running n8n + SiYuan

---

## Phase 4: Resource Operations — Notebooks

### 4.1 Notebook Operations File (`actions/notebook/`)
- [x] Create `notebook.description.ts` with resource and operation definitions
- [x] Create `notebook.handler.ts`

### 4.2 Existing Operations (migrate & improve)
- [x] **Create Notebook** — migrated with AI-friendly description
  - [x] Parameter: `notebookName` (string, required)
  - [x] Return: created notebook object `{id, name, icon, sort, closed}`
- [x] **Rename Notebook** — migrated
  - [x] Parameters: `notebookId` (string, required), `newName` (string, required)
  - [x] Return: `{ success: true }`
- [x] **Remove Notebook** — migrated with irreversibility warning in description
  - [x] Parameter: `notebookId` (string, required)
  - [x] Return: `{ success: true }`
- [x] **List Notebooks** — migrated
  - [x] No parameters required
  - [x] Return: array of notebook objects

### 4.3 New Operations
- [x] **Open Notebook** — `/api/notebook/openNotebook`
  - [x] Parameter: `notebookId` (string, required)
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Close Notebook** — `/api/notebook/closeNotebook`
  - [x] Parameter: `notebookId` (string, required)
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Get Notebook Configuration** — `/api/notebook/getNotebookConf`
  - [x] Parameter: `notebookId` (string, required)
  - [x] Return: `{ box, conf, name }` — added `SiYuanNotebookConf` interface
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Set Notebook Configuration** — `/api/notebook/setNotebookConf`
  - [x] Parameters: `notebookId` (string, required), `notebookConf` (JSON, required)
  - [x] Added to SiYuanClient, node description, and handler

### 4.4 Notebook Testing
- [ ] Test all notebook operations against running SiYuan instance — deferred to testing phase
- [ ] Verify error handling for invalid notebook IDs — deferred to testing phase
- [ ] Verify error handling for duplicate names — deferred to testing phase
- [ ] Verify all operations return expected data shapes — deferred to testing phase

---

## Phase 5: Resource Operations — Documents

### 5.1 Document Operations File (`actions/document/`)
- [x] Create `document.description.ts` with resource and operation definitions
- [x] Create `document.handler.ts`

### 5.2 Existing Operations (migrate & improve)
- [x] **Create Document** — migrated with multiline markdown input (rows: 10)
  - [x] Parameters: `notebookId`, `docPath`, `markdownContent`
  - [x] Return: document ID string
- [x] **Rename Document** — migrated
  - [x] Parameters: `docId`, `newTitle`
- [x] **Remove Document** — migrated
  - [x] Parameter: `docId`
- [x] **Move Document** — migrated
  - [x] Parameters: `docId`, `targetParentId`
- [x] **Get Document ID by Path** — migrated
  - [x] Parameters: `docPath`, `notebookId`
  - [x] Return: array of document IDs
- [x] **Get Document Path by ID** — migrated
  - [x] Parameter: `docId`
  - [x] Return: human-readable path string
- [x] **List Documents in Notebook** — migrated
  - [x] Parameter: `notebookId`
  - [x] Return: array of document objects with titles
- [x] **Export Document as Markdown** — migrated
  - [x] Parameter: `docId`
  - [x] Return: `{hPath, content}`

### 5.3 New Operations
- [x] **Get Storage Path by ID** — `/api/filetree/getPathByID`
  - [x] Parameter: `docId`
  - [x] Return: storage path string (e.g., `/data/notebookId/docId.sy`)
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Get Readable Path from Storage Path** — `/api/filetree/getHPathByPath`
  - [x] Parameters: `notebookId`, `storagePath`
  - [x] Return: human-readable path
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Get Document Content** (high priority for AI agents)
  - [x] Convenience wrapper around `exportDocMd` that returns only the markdown string
  - [x] Parameter: `docId`
  - [x] Return: markdown content string
  - [x] Added to SiYuanClient (`getDocContent`), node description, and handler

### 5.4 Cross-Level: Document Tree
- [x] **Get Document Tree** — get full block structure of a document
  - [x] Parameter: `docId`
  - [x] Return: hierarchical tree of `DocumentTreeNode` objects (id, type, subType, kramdown, children)
  - [x] Implemented using recursive `getChildBlocks` + `getBlockKramdown`
  - [x] Added `maxDepth` optional parameter (default: 10) in Additional Options collection
  - [x] Added `DocumentTreeNode` interface to `lib/interfaces.ts`

### 5.5 Document Testing
- [ ] Test all document operations against running SiYuan instance — deferred to testing phase
- [ ] Test creating documents with complex markdown — deferred to testing phase
- [ ] Test moving documents between notebooks — deferred to testing phase
- [ ] Verify error handling for invalid paths and IDs — deferred to testing phase
- [ ] Test document tree retrieval on documents with deep nesting — deferred to testing phase

---

## Phase 6: Resource Operations — Blocks

### 6.1 Block Operations File (`actions/block/`)
- [x] Create `block.description.ts` with resource and operation definitions
- [x] Create `block.handler.ts`

### 6.2 Existing Operations (migrate & improve)
- [x] **Append Block** — migrated with markdown default, DOM via Additional Options
  - [x] Parameters: `parentBlockId`, `blockData`, `additionalOptions.dataType`
- [x] **Prepend Block** — migrated
  - [x] Parameters: `parentBlockId`, `blockData`, `additionalOptions.dataType`
- [x] **Insert Block** — migrated
  - [x] Parameters: `parentBlockId`, `blockData`, `previousBlockId` (opt), `nextBlockId` (opt), `additionalOptions.dataType`
- [x] **Update Block** — migrated
  - [x] Parameters: `blockId`, `blockData`, `additionalOptions.dataType`
- [x] **Delete Block** — migrated
  - [x] Parameter: `blockId`
- [x] **Get Block Kramdown** — migrated
  - [x] Parameter: `blockId` → returns `{id, kramdown}`
- [x] **Get Child Blocks** — migrated
  - [x] Parameter: `blockId` → returns array of `{id, type, subType}`

### 6.3 New Operations
- [x] **Move Block** — `/api/block/moveBlock`
  - [x] Parameters: `blockId`, `movePreviousId` (optional), `moveParentId` (optional)
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Fold Block** — `/api/block/foldBlock`
  - [x] Parameter: `blockId`
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Unfold Block** — `/api/block/unfoldBlock`
  - [x] Parameter: `blockId`
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Transfer Block References** — `/api/block/transferBlockRef`
  - [x] Parameters: `transferFromId`, `transferToId`, optional `transferOptions.refIDs` (comma-separated)
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Get Block Content as Markdown** — convenience wrapper around getBlockKramdown
  - [x] Parameter: `blockId`
  - [x] Returns kramdown string directly
  - [x] Added to SiYuanClient (`getBlockContentMd`), node description, and handler

### 6.4 Cross-Level: Bulk Block Operations
- [x] **Get All Blocks Matching Criteria** — SKIPPED: duplicates Search → SQL Query; users should use that instead
- [x] **Bulk Update Blocks** — SKIPPED: better handled by n8n's native loop/batch mechanisms rather than a single operation

### 6.5 Block Data Type Handling
- [x] Markdown is the default `dataType` for all block write operations
- [x] DOM available as optional via "Additional Options" collection (hidden by default)
- [x] Markdown input passed directly to SiYuan API (validation handled server-side)
- [x] DOM edge cases deferred — SiYuan handles conversion internally

### 6.6 Block Testing
- [ ] Test append/prepend/insert with various markdown content — deferred to testing phase
- [ ] Test block move between different parent blocks — deferred to testing phase
- [ ] Test fold/unfold operations — deferred to testing phase
- [ ] Test block reference transfer — deferred to testing phase
- [ ] Test update with markdown and DOM data types — deferred to testing phase
- [ ] Verify error handling for invalid block IDs — deferred to testing phase
- [ ] Test deeply nested block structures — deferred to testing phase

---

## Phase 7: Resource Operations — Attributes

### 7.1 Attribute Operations File (`actions/attribute/`)
- [x] Create `attribute.description.ts`
- [x] Create `attribute.handler.ts`

### 7.2 Existing Operations (migrate & improve)
- [x] **Set Block Attributes** — migrated
  - [x] Parameters: `blockId`, `attributes` (fixedCollection of name/value pairs)
  - [x] Validates `custom-` prefix for custom attributes in SiYuanClient
  - [x] Built-in attributes documented in description (title, name, alias, memo, bookmark, icon)
- [x] **Get Block Attributes** — migrated
  - [x] Parameter: `blockId`
  - [x] Return: `Record<string, string>` of all attributes

### 7.3 Attribute Testing
- [ ] Test setting custom attributes with `custom-` prefix — deferred to testing phase
- [ ] Test setting built-in attributes — deferred to testing phase
- [ ] Test getting all attributes for a block — deferred to testing phase
- [ ] Verify error handling for invalid block IDs — deferred to testing phase
- [ ] Test attribute overwrite behavior — deferred to testing phase

---

## Phase 8: Resource Operations — Tags

### 8.1 Tag Operations File (`actions/tag/`)
- [x] Create `tag.description.ts`
- [x] Create `tag.handler.ts`
- [x] Register Tag resource in main node router (resource option, operation dropdown, fields, handler)

### 8.2 Tag Operations (all new)
- [x] **Add Tag to Block**
  - [x] Parameters: `blockId`, `tag`
  - [x] Reads existing tags from `tag` attribute in IAL, appends new tag, writes back via `setBlockAttrs`
  - [x] Idempotent — no-op if tag already exists
  - [x] Returns `{ blockId, tags }` with updated tag list
- [x] **Remove Tag from Block**
  - [x] Parameters: `blockId`, `tag`
  - [x] Reads existing tags, filters out target, writes back
  - [x] Returns `{ blockId, tags }` with remaining tags
- [x] **Get Tags for Block**
  - [x] Parameter: `blockId`
  - [x] Returns `{ blockId, tags }` — array of tag strings parsed from `tag` attribute
- [x] **List All Tags**
  - [x] No parameters
  - [x] Implemented via SQL query on blocks IAL field, parses `tag="..."` values
  - [x] Returns array of `{ tag, count }` sorted by count descending
- [x] **Rename Tag**
  - [x] Parameters: `oldTag`, `newTag`
  - [x] Finds all blocks with old tag via SQL, updates each, deduplicates
  - [x] Returns `{ oldTag, newTag, blocksUpdated }` count
- [x] **Find Blocks by Tag**
  - [x] Parameter: `tag`
  - [x] Implemented via SQL query matching tag in IAL field
  - [x] Returns full block rows ordered by updated desc

### 8.3 Tag Testing
- [ ] Test adding single and multiple tags to blocks — deferred to testing phase
- [ ] Test removing tags without affecting other tags — deferred to testing phase
- [ ] Test listing all tags across the workspace — deferred to testing phase
- [ ] Test renaming tags across multiple blocks — deferred to testing phase
- [ ] Test finding blocks by tag — deferred to testing phase
- [ ] Verify tag operations don't corrupt other block attributes — deferred to testing phase

---

## Phase 9: Resource Operations — Search & Query

### 9.1 Search Operations File (`actions/search/`)
- [x] Create `search.description.ts`
- [x] Create `search.handler.ts`

### 9.2 Existing Operations (migrate & improve)
- [x] **SQL Query** — migrated
  - [x] Parameter: `sqlStatement` (multiline string, rows: 4)
  - [x] Default example: `SELECT * FROM blocks LIMIT 10`
  - [x] Return: array of result rows

### 9.3 New Operations
- [x] **Full-Text Search** — `/api/search/fullTextSearchBlock`
  - [x] Parameter: `searchQuery` (string, required)
  - [x] Returns `FullTextSearchResult` with `blocks[]`, `matchedBlockCount`, `matchedRootCount`, `pageCount`
  - [x] Added `FullTextSearchResult` interface to `lib/interfaces.ts`
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Search by Tag** — MOVED to Tag resource (Phase 8) as "Find Blocks by Tag" operation
  - [x] Already implemented as `Tag → Find Blocks by Tag` to avoid duplication
- [x] **Search by Attribute**
  - [x] Parameters: `attributeName`, `attributeValue` (partial match supported)
  - [x] Implemented via SQL JOIN on blocks + attributes tables
  - [x] Basic SQL escaping for single quotes
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Get Recent Changes**
  - [x] Parameters: `limit` (number, default 50), optional `since` timestamp in Additional Options
  - [x] Queries document-type blocks (`type = 'd'`) ordered by `updated DESC`
  - [x] Added to SiYuanClient, node description, and handler

### 9.4 Search Testing
- [ ] Test full-text search with various query strings — deferred to testing phase
- [ ] Test SQL query with valid and invalid SQL — deferred to testing phase
- [ ] Test attribute-based search — deferred to testing phase
- [ ] Test recent changes query — deferred to testing phase
- [ ] Verify search results contain sufficient context for AI agents — deferred to testing phase
- [ ] Test empty result handling — deferred to testing phase

---

## Phase 10: Resource Operations — Assets & Files

### 10.1 Asset Operations File (`actions/asset/`)
- [x] Create `asset.description.ts`
- [x] Create `asset.handler.ts`
- [x] Register Asset resource in main node router (resource option, operation dropdown, fields, handler)
- [x] Added `@types/node` and `form-data` dependencies

### 10.2 Operations
- [x] **Upload Asset** — `/api/asset/upload`
  - [x] Parameters: `assetsDirPath` (default `/assets/`), `binaryPropertyName` (default `data`)
  - [x] Multipart form data upload via `form-data` library
  - [x] Uses n8n's `assertBinaryData` + `getBinaryDataBuffer` for binary handling
  - [x] Returns `succMap` with uploaded file paths
- [x] **Get File** — `/api/file/getFile`
  - [x] Parameter: `filePath`
  - [x] Returns raw file content
- [x] **Put File** — `/api/file/putFile`
  - [x] Parameters: `filePath`, `fileContent` (multiline string), optional `isDir` in Additional Options
  - [x] Creates or overwrites files
- [x] **Remove File** — `/api/file/removeFile`
  - [x] Parameter: `filePath`
  - [x] Returns `{ success: true }`
- [x] **Rename File** — `/api/file/renameFile`
  - [x] Parameters: `currentPath`, `newPath`
  - [x] Returns `{ success: true }`
- [x] **List Files in Directory** — migrated from System resource to Asset
  - [x] Parameter: `directoryPath` (default `/data/`)
  - [x] Returns array of `SiYuanDirEntry` objects
  - [x] Removed from System resource to avoid duplication

### 10.3 Asset Testing
- [ ] Test uploading various file types (images, PDFs, text files) — deferred to testing phase
- [ ] Test downloading/getting files — deferred to testing phase
- [ ] Test file creation and overwrite — deferred to testing phase
- [ ] Test file deletion — deferred to testing phase
- [ ] Test file renaming — deferred to testing phase
- [ ] Test directory listing — deferred to testing phase
- [ ] Verify binary data handling works with n8n's binary data system — deferred to testing phase
- [ ] Test error handling for non-existent files — deferred to testing phase

---

## Phase 11: Resource Operations — System & Utilities

### 11.1 System Operations File (`actions/system/`)
- [x] Create `system.description.ts`
- [x] Create `system.handler.ts`

### 11.2 Existing Operations (migrate)
- [x] **Get Version** — migrated
- [x] **Push Message** — migrated
  - [x] Parameters: `message`, `timeout` (default 7000ms)
- [x] **Push Error Message** — migrated
  - [x] Parameters: `message`, `timeout`
- [x] **Render Sprig Template** — migrated
  - [x] Parameter: `sprigTemplate`
- [x] **List Files in Directory** — moved to Asset resource in Phase 10

### 11.3 New Operations
- [x] **Get Current Time** — `/api/system/currentTime`
  - [x] No parameters
  - [x] Returns server timestamp in milliseconds
  - [x] Added to SiYuanClient, node description, and handler
- [x] **Export Resources** — `/api/export/exportResources`
  - [x] Parameters: `exportPaths` (comma-separated string), optional `exportName` in Additional Options
  - [x] Returns `{ path }` with the exported package path
  - [x] Added to SiYuanClient, node description, and handler

### 11.4 System Testing
- [ ] Test all system operations — deferred to testing phase
- [ ] Verify push message appears in SiYuan UI — deferred to testing phase
- [ ] Test Sprig template rendering with various functions — deferred to testing phase
- [ ] Test export with multiple paths — deferred to testing phase

---

## Phase 12: AI Tool Nodes

### 12.1 Research & Setup
- [x] Confirmed `usableAsTool: true` approach — set on main SiYuan node (Phase 2) AND on all 4 tool nodes
- [x] `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` may be required — documented for users
- [x] Created separate focused tool nodes per resource group for better AI agent tool selection

### 12.2 AI Tool Node — SiYuan Documents
- [x] Created `nodes/SiYuanDocumentTool/` directory
- [x] Created `SiYuanDocumentTool.node.ts`
- [x] Operations: create, getContent, exportMd, getTree, listInNotebook, remove
- [x] AI-optimized description explains when to use each operation
- [x] Streamlined parameters (no resource dropdown — document-focused)
- [x] Icon and package.json registration done

### 12.3 AI Tool Node — SiYuan Blocks
- [x] Created `nodes/SiYuanBlockTool/` directory
- [x] Created `SiYuanBlockTool.node.ts`
- [x] Operations: append, update, delete, getContentMd, getChildren, move
- [x] AI-optimized description for block manipulation
- [x] Icon and package.json registration done

### 12.4 AI Tool Node — SiYuan Search
- [x] Created `nodes/SiYuanSearchTool/` directory
- [x] Created `SiYuanSearchTool.node.ts`
- [x] Operations: fullText, sqlQuery, searchByTag, searchByAttribute
- [x] AI-optimized description for knowledge retrieval
- [x] Icon and package.json registration done

### 12.5 AI Tool Node — SiYuan Notebooks
- [x] Created `nodes/SiYuanNotebookTool/` directory
- [x] Created `SiYuanNotebookTool.node.ts`
- [x] Operations: create, list, rename, remove, getConf
- [x] AI-optimized description for notebook management
- [x] Icon and package.json registration done

### 12.6 AI Tool Testing
- [ ] Test each AI Tool node appears in n8n's AI agent tool selection — deferred to testing phase
- [ ] Test AI agent can successfully call each tool — deferred to testing phase
- [ ] Verify tool descriptions are clear enough for agents to choose correctly — deferred to testing phase
- [ ] Test error responses are parseable by agents — deferred to testing phase
- [ ] Test multi-step agent workflows (search → read → update) — deferred to testing phase

---

## Phase 13: Trigger Node

### 13.1 SiYuan Trigger Node Setup
- [x] Created `nodes/SiYuanTrigger/` directory
- [x] Created `SiYuanTrigger.node.ts`
- [x] Added trigger node icon (`siyuan.svg`)
- [x] Registered in `package.json`

### 13.2 Trigger Implementation
- [x] Researched SiYuan WebSocket event system — limited documentation, inconsistent event coverage
- [x] Decision: Implemented **polling-based trigger** as primary approach (more reliable)
- [x] WebSocket implementation deferred to future v2.1 enhancement when SiYuan's event API matures
- [x] Implemented `poll()` method using n8n's `IPollFunctions` interface
- [x] Added event type parameter: "Document Changed" (type='d') and "Block Changed" (type!='d')
- [x] Added notebook filter parameter (optional — `box` column filter in SQL)
- [x] Document filter not added — filtering by document would require `root_id` which is less intuitive for users

### 13.3 Polling Implementation
- [x] Implemented polling-based trigger using n8n's native `polling: true` mechanism
- [x] Uses `getWorkflowStaticData('node')` to persist `lastTimestamp` between polls
- [x] Polls `/api/query/sql` for blocks with `updated > lastTimestamp`
- [x] First poll captures current state (no false triggers on activation)
- [x] Subsequent polls detect only new/changed items since last poll
- [x] Polling interval controlled by n8n's workflow settings (not a custom parameter)
- [x] Max results per poll configurable (default: 50)
- [x] Graceful failure — returns `null` if SiYuan is offline (skips poll, no error)

### 13.4 Trigger Output
- [x] Returns full block row data from SQL query (id, root_id, parent_id, type, content, updated, box, etc.)
- [x] Event type determined by the selected parameter (documentChanged vs blockChanged)
- [x] Affected block/document ID included in output (`id`, `root_id`)
- [x] Timestamp included (`updated` field)
- [x] Before/after content not available via polling — would require WebSocket events

### 13.5 Trigger Testing
- [ ] Test trigger fires when document is created — deferred to testing phase
- [ ] Test trigger fires when document is modified — deferred to testing phase
- [ ] Test trigger fires when block is created/modified — deferred to testing phase
- [ ] Test notebook filter limits triggers correctly — deferred to testing phase
- [ ] Test first poll doesn't produce false positives — deferred to testing phase
- [ ] Test trigger handles SiYuan offline gracefully — deferred to testing phase
- [ ] Test manual trigger functionality in n8n UI — deferred to testing phase
- [ ] Verify output data shape is consistent — deferred to testing phase

---

## Phase 14: Error Handling & Robustness

### 14.1 Structured Error Responses
- [x] Created `lib/errors.ts` with error utilities
- [x] Defined `formatErrorForAgent()` — returns `{ error, operation, endpoint, suggestion }`
- [x] Mapped common SiYuan error patterns to human-readable suggestions via `ERROR_SUGGESTIONS`
  - [x] Auth failures → credential check suggestion
  - [x] Block/notebook not found → ID verification + list suggestion
  - [x] File not found → path format suggestion
  - [x] SQL errors → syntax and table reference suggestion
  - [x] Default fallback suggestion for unknown errors
- [x] Enhanced `SiYuanClient.request()` to include suggestions in all error messages
- [x] Main node `continueOnFail` now returns structured error data via `formatErrorForAgent()`

### 14.2 Input Validation
- [x] Created validation utilities in `lib/errors.ts`:
  - [x] `validateRequiredString()` — checks non-empty string parameters
  - [x] `validateSiYuanId()` — checks for valid SiYuan ID format
  - [x] `validatePath()` — checks path starts with `/`
- [x] n8n's built-in `required: true` on parameters handles most validation at the UI level
- [x] Server-side validation in SiYuan catches remaining edge cases
- [x] Validation utilities available for handlers to use as needed

### 14.3 Connection Resilience
- [x] Network timeouts handled — 30s Axios timeout with clear "timed out" message and suggestion
- [x] SiYuan unavailable — ECONNREFUSED detected with "SiYuan does not appear to be running" suggestion
- [x] Authentication failures — HTTP 401/403 detected with "Check your API token" suggestion
- [x] API rate limiting — SiYuan doesn't rate limit; no special handling needed
- [x] `continueOnFail()` works correctly — main node returns structured error info per item, processing continues

### 14.4 Error Testing
- [ ] Test with invalid API token — deferred to testing phase
- [ ] Test with unreachable SiYuan URL — deferred to testing phase
- [ ] Test with invalid resource IDs (notebook, document, block) — deferred to testing phase
- [ ] Test with malformed input data — deferred to testing phase
- [ ] Test `continueOnFail` behavior for each operation — deferred to testing phase
- [ ] Verify error messages are helpful for both humans and AI agents — deferred to testing phase

---

## Phase 15: Documentation

### 15.1 README.md
- [x] Write project overview and purpose
- [x] Document installation instructions (npm, n8n community nodes UI)
- [x] Document SiYuan setup requirements (API token, URL configuration)
- [x] Document credential configuration (step-by-step with Test button)
- [x] List all available resources and operations in a reference table (all 56 operations across 8 resources)
- [x] Document AI Tool nodes and how to use them with n8n AI agents (setup + how agents choose tools)
- [x] Document Trigger node configuration (event type, notebook filter, output fields)
- [x] Provide example workflows for common use cases:
  - [x] AI Agent Knowledge Base (search + create + modify)
  - [x] Automated Note Creation (webhook + transform + tag)
  - [x] Content Sync (trigger + export + HTTP)
  - [x] AI Content Organization (schedule + list + agent + tag + move)
- [x] Add troubleshooting section (connection issues, common errors, AI tool visibility)
- [x] Add contributing guidelines
- [x] Link to CHANGELOG.md for version history

### 15.2 Node Descriptions (in-app documentation)
- [x] Every operation across all 7 nodes has a `description` field
- [x] Every parameter field has a `description` explaining what it does
- [x] Placeholder text added for key string inputs (API URL, search query, paths, etc.)
- [x] All display names are clear and consistent
- [x] All descriptions written in English
- [x] Verified programmatically — all operations have descriptions and actions

### 15.3 AI Tool Descriptions
- [x] Each tool node has an AI-optimized top-level `description` that tells agents when and how to use it
- [x] Document Tool: "Use to create, read, list, and manage documents..."
- [x] Block Tool: "Use to create, read, update, move, and delete content blocks..."
- [x] Search Tool: "Use to search and query the SiYuan knowledge base..."
- [x] Notebook Tool: "Use to manage SiYuan notebooks..."
- [ ] Test that AI agents correctly interpret and use the descriptions — deferred to testing phase

### 15.4 Codex File
- [x] Created `SiYuan.node.json` codex file with:
  - [x] Categories: Productivity, Data & Storage
  - [x] Subcategories: Note Taking, Knowledge Management
  - [x] Alias names: siyuan, knowledge base, notes, notebook, markdown, blocks, PKM
  - [x] Primary documentation and credential documentation URLs

### 15.5 CHANGELOG.md
- [x] Created `CHANGELOG.md`
- [x] Documented all v2.0.0 changes (breaking changes, added, changed, removed)
- [x] Included all previous versions (0.4.0, 0.3.1, 0.3.0, 0.2.0, 0.1.x)
- [x] Follows Keep a Changelog format with Semantic Versioning

---

## Phase 16: Build & Packaging

### 16.1 Build Configuration
- [x] Review `tsconfig.json` — updated with `lib/**/*` include in Phase 2
- [x] Review `gulpfile.js` icon copy task — all 7 node icons copied (6 nodes + trigger)
- [x] `package.json` → `n8n.nodes` lists all 6 node files (SiYuan, 4 AI Tools, Trigger)
- [x] `package.json` → `n8n.credentials` lists SiYuanApi credential file
- [x] `pnpm build` — zero TypeScript errors, zero warnings
- [x] `pnpm lint` — zero errors, zero warnings
- [x] `pnpm format` — all files match Prettier code style

### 16.2 Package Verification
- [x] `npx @n8n/scan-community-package` — ran against published v0.4.0 (scanner downloads from npm, not local). Note: flags `axios` as restricted for n8n Cloud. Self-hosted instances unaffected. Consider migrating to n8n built-in HTTP helpers in a future version for Cloud compatibility.
- [ ] Verify all nodes appear in n8n after local install — requires running n8n instance
- [ ] Verify credentials appear in n8n credential list — requires running n8n instance
- [ ] Verify icons display correctly for all nodes — requires running n8n instance
- [x] `dist/` output verified complete: 6 node JS files, 6 SVG icons, 1 codex JSON, 1 credential JS, 3 lib JS files, all with .d.ts and .js.map

### 16.3 Pre-publish Checks
- [x] `pnpm prepublishOnly` — build + prepublish lint both pass
- [x] README renders correctly (markdown with badges, tables, code blocks)
- [x] Package size: 59.2 kB packed / 299 kB unpacked / 90 files — reasonable
- [x] No sensitive files in package — verified no .env, .vscode, project docs, source .ts files
- [x] `LICENSE.md` included in package

---

## Phase 17: Integration Testing

### 17.1 Basic Workflow Testing
- [ ] Test: Create notebook → Create document → Add blocks → Read back content
- [ ] Test: Search for content → Get document → Export as markdown
- [ ] Test: Tag blocks → Search by tag → List all tags
- [ ] Test: Upload asset → Reference in document → Download asset
- [ ] Test: List notebooks → List documents → Get document tree
- [ ] Test: Bulk block operations → Verify results

### 17.2 AI Agent Workflow Testing
- [ ] Test: AI agent creates a new document with content
- [ ] Test: AI agent searches for information and returns results
- [ ] Test: AI agent updates existing content
- [ ] Test: AI agent organizes content with tags
- [ ] Test: Multi-step agent workflow (search → read → summarize → create new doc)

### 17.3 Trigger Testing
- [ ] Test: Trigger fires when document is created
- [ ] Test: Trigger fires when document is modified
- [ ] Test: Trigger fires when document is deleted
- [ ] Test: Filter correctly limits triggers to specific notebooks/documents
- [ ] Test: Trigger reconnects after SiYuan restart

### 17.4 Error Scenario Testing
- [ ] Test: All operations with SiYuan offline
- [ ] Test: Operations with expired/invalid token
- [ ] Test: Operations with non-existent resource IDs
- [ ] Test: Large data handling (big documents, many blocks)
- [ ] Test: Concurrent operations

### 17.5 Edge Cases
- [ ] Test: Unicode content in documents and blocks
- [ ] Test: Special characters in notebook/document names
- [ ] Test: Empty content handling
- [ ] Test: Very long content strings
- [ ] Test: Deeply nested block hierarchies
- [ ] Test: Documents with many child blocks (pagination behavior)

---

## Phase 18: Publishing

### 18.1 npm Publishing
- [ ] Create npm account (if not already)
- [ ] Login to npm via CLI
- [ ] Verify package name `n8n-nodes-siyuan` is available or owned
- [ ] Run final build and verification
- [ ] Publish to npm: `npm publish`
- [ ] Verify package appears on npmjs.com
- [ ] Verify package installs correctly via n8n community nodes UI

### 18.2 GitHub Release
- [ ] Tag release as `v2.0.0` in git
- [ ] Create GitHub release with changelog
- [ ] Attach any relevant assets to release

### 18.3 Community Submission
- [ ] Submit to n8n community nodes directory (if applicable)
- [ ] Consider setting up GitHub Actions for future automated publishing (required by May 2026)

---

## Summary

| Phase | Description | Estimated Items |
|-------|-------------|----------------|
| 1 | Cleanup & Setup | 17 |
| 2 | Architecture Restructure | 21 |
| 3 | Credential Overhaul | 8 |
| 4 | Notebook Operations | 20 |
| 5 | Document Operations | 18 |
| 6 | Block Operations | 27 |
| 7 | Attribute Operations | 7 |
| 8 | Tag Operations | 19 |
| 9 | Search & Query | 16 |
| 10 | Assets & Files | 19 |
| 11 | System & Utilities | 10 |
| 12 | AI Tool Nodes | 22 |
| 13 | Trigger Node | 21 |
| 14 | Error Handling | 16 |
| 15 | Documentation | 20 |
| 16 | Build & Packaging | 13 |
| 17 | Integration Testing | 22 |
| 18 | Publishing | 8 |
| **Total** | | **~304 items** |
