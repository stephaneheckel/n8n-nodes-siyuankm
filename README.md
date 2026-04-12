# n8n-nodes-siyuan

[![NPM Version](https://img.shields.io/npm/v/n8n-nodes-siyuan.svg?style=flat-square)](https://www.npmjs.com/package/n8n-nodes-siyuan)
[![NPM Downloads](https://img.shields.io/npm/dt/n8n-nodes-siyuan.svg?style=flat-square)](https://www.npmjs.com/package/n8n-nodes-siyuan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/PsycoStea/SiYuan-n8n-nodes.svg?style=flat-square)](https://github.com/PsycoStea/SiYuan-n8n-nodes/issues)

![Node example image](siyuan-image.png)

An [n8n](https://n8n.io/) community node package for [SiYuan](https://b3log.org/siyuan/), the privacy-first personal knowledge base. Manage notebooks, documents, blocks, tags, assets, and more — all from your n8n workflows.

**Designed for AI agent workflows.** Includes dedicated AI Tool nodes that n8n AI agents can call directly, plus a polling Trigger node for reactive workflows.

---

**Navigation**
* [Installation](#installation)
* [Nodes](#nodes)
* [Credentials](#credentials)
* [Operations Reference](#operations-reference)
* [AI Agent Usage](#ai-agent-usage)
* [Trigger Node](#trigger-node)
* [Example Workflows](#example-workflows)
* [Compatibility](#compatibility)
* [Troubleshooting](#troubleshooting)
* [Resources](#resources)
* [Version History](#version-history)
* [Contributing](#contributing)

---

## Installation

1. Go to **Settings > Community Nodes** in your n8n instance.
2. Select **Install**.
3. Enter `n8n-nodes-siyuan` in the search box.
4. Click the **Install** button.

Alternatively, follow the generic [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

> **Note for AI Tool usage:** You may need to set the environment variable `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` on your n8n instance to use the AI Tool nodes with n8n's AI Agent.

## Nodes

This package provides **7 nodes**:

| Node | Type | Purpose |
|------|------|---------|
| **SiYuan** | Action | Full-featured node with all 56 operations across 8 resources |
| **SiYuan Document Tool** | AI Tool | Focused document operations for AI agents |
| **SiYuan Block Tool** | AI Tool | Focused block operations for AI agents |
| **SiYuan Search Tool** | AI Tool | Focused search/query operations for AI agents |
| **SiYuan Notebook Tool** | AI Tool | Focused notebook operations for AI agents |
| **SiYuan Trigger** | Trigger | Polls for document/block changes to start workflows |

## Credentials

To connect to your SiYuan instance:

1. **In SiYuan:** Go to **Settings > About > API Token**. Copy the token.
2. **In n8n:** Go to **Credentials > Add credential > SiYuan API**.
3. Enter your **API URL** (default: `http://127.0.0.1:6806`).
4. Paste your **API Token**.
5. Click **Test** to verify the connection, then **Save**.

All nodes in this package share the same credential.

## Operations Reference

### Notebook (8 operations)

| Operation | Description |
|-----------|-------------|
| Create | Create a new empty notebook |
| List | List all notebooks with IDs and names |
| Rename | Change a notebook's name |
| Remove | Permanently delete a notebook (irreversible) |
| Open | Open a closed notebook |
| Close | Close an open notebook |
| Get Configuration | Retrieve notebook settings |
| Set Configuration | Update notebook settings |

### Document (12 operations)

| Operation | Description |
|-----------|-------------|
| Create | Create a document with Markdown content |
| Rename | Change a document's title |
| Remove | Permanently delete a document |
| Move | Move a document to another notebook or parent |
| Get ID by Path | Find document ID from human-readable path |
| Get Path by ID | Get human-readable path from document ID |
| Get Storage Path by ID | Get internal storage path |
| Get Readable Path from Storage Path | Convert storage path to readable path |
| List in Notebook | List all documents in a notebook |
| Export Markdown | Export document as Markdown with path |
| Get Content | Get full Markdown content (ideal for AI agents) |
| Get Document Tree | Get hierarchical block structure |

### Block (12 operations)

| Operation | Description |
|-----------|-------------|
| Append | Add content to end of a block |
| Prepend | Add content to beginning of a block |
| Insert | Insert content before/after a block |
| Update | Replace block content |
| Delete | Remove a block |
| Move | Move a block to a new position |
| Fold | Collapse a block |
| Unfold | Expand a block |
| Get Kramdown | Get raw Kramdown source |
| Get Content (Markdown) | Get clean Markdown content |
| Get Child Blocks | List direct children |
| Transfer References | Transfer references between blocks |

### Attribute (2 operations)

| Operation | Description |
|-----------|-------------|
| Get | Retrieve all attributes for a block |
| Set | Set custom (`custom-*`) or built-in attributes |

### Tag (6 operations)

| Operation | Description |
|-----------|-------------|
| Add | Add a tag to a block |
| Remove | Remove a tag from a block |
| Get Tags for Block | List all tags on a block |
| List All | List all unique tags with counts |
| Rename | Rename a tag across all blocks |
| Find Blocks by Tag | Find all blocks with a specific tag |

### Search (4 operations)

| Operation | Description |
|-----------|-------------|
| Full-Text Search | Search all blocks by keywords |
| SQL Query | Run custom SQL against the SiYuan database |
| Search by Attribute | Find blocks by attribute name/value |
| Get Recent Changes | List recently modified documents |

### Asset (6 operations)

| Operation | Description |
|-----------|-------------|
| Upload Asset | Upload a file (image, PDF, etc.) to SiYuan |
| Get File | Retrieve file content |
| Put File | Create or overwrite a file |
| Remove File | Delete a file |
| Rename File | Rename/move a file |
| List Files in Directory | List files in a workspace directory |

### System (6 operations)

| Operation | Description |
|-----------|-------------|
| Get Version | Get SiYuan version |
| Get Current Time | Get server time in milliseconds |
| Push Message | Show a notification in SiYuan |
| Push Error Message | Show an error notification |
| Render Sprig Template | Process a Sprig template string |
| Export Resources | Export files/folders as a zip |

## AI Agent Usage

This package includes 4 AI Tool nodes designed for use with n8n's AI Agent node:

1. **SiYuan Document Tool** — Create, read, list, and manage documents
2. **SiYuan Block Tool** — Create, read, update, move, and delete blocks
3. **SiYuan Search Tool** — Full-text search, SQL queries, tag search, attribute search
4. **SiYuan Notebook Tool** — Create, list, rename, and delete notebooks

### Setup

1. Add an **AI Agent** node to your workflow.
2. Connect one or more **SiYuan Tool** nodes to the agent's "tools" input.
3. Configure each tool node with your SiYuan credentials.
4. The agent will automatically choose which tool to call based on the user's request.

### How Agents Use These Tools

The AI Tool nodes have descriptions optimized for agent comprehension. For example:

- When an agent needs to **store information**, it will use the Document Tool's "create" operation.
- When an agent needs to **find information**, it will use the Search Tool's "fullText" operation.
- When an agent needs to **update content**, it will use the Block Tool's "update" operation.

The main SiYuan node also has `usableAsTool: true`, making all 56 operations available to agents as a single comprehensive tool.

## Trigger Node

The **SiYuan Trigger** node starts workflows when content changes in SiYuan.

### Configuration

| Parameter | Description |
|-----------|-------------|
| Event | "Document Changed" or "Block Changed" |
| Notebook ID | (Optional) Only trigger for a specific notebook |
| Max Results Per Poll | Maximum items per poll (default: 50) |

The trigger uses n8n's native polling mechanism. Set the polling interval in your workflow settings.

### Output

Each trigger event outputs the full block/document data including:
- `id` — The block or document ID
- `root_id` — The parent document ID
- `type` — Block type (`d` for document, `p` for paragraph, etc.)
- `content` — The text content
- `updated` — Timestamp of the change
- `box` — The notebook ID

## Example Workflows

### AI Agent Knowledge Base

```
Webhook/Chat → AI Agent → SiYuan Search Tool (find info)
                       → SiYuan Document Tool (create/update docs)
                       → SiYuan Block Tool (add/modify content)
```

### Automated Note Creation

```
Webhook (external data) → Transform → SiYuan (create document)
                                    → SiYuan (add tags)
```

### Content Sync

```
SiYuan Trigger (doc changed) → SiYuan (export markdown) → HTTP Request (sync to external)
```

### AI Content Organization

```
Schedule → SiYuan (list docs) → AI Agent (analyze & categorize)
                               → SiYuan (add tags)
                               → SiYuan (move docs)
```

## Compatibility

- **Minimum n8n version:** v1.22.0+
- **Node.js:** v18.10+
- **SiYuan:** Developed against the [SiYuan API](https://github.com/siyuan-note/siyuan/blob/master/API.md). Compatible with recent SiYuan versions.

## Troubleshooting

### Connection Issues

| Problem | Solution |
|---------|----------|
| "Cannot connect to SiYuan" | Ensure SiYuan is running and the API URL is correct |
| "Authentication failed" | Check your API token in Settings > About > API Token |
| "Request timed out" | Verify the API URL and that SiYuan is accessible from your n8n instance |

### Common Errors

| Error | Solution |
|-------|----------|
| "Block not found" | Verify the block ID exists using Search > SQL Query |
| "Notebook not found" | Use Notebook > List to find valid notebook IDs |
| Invalid path errors | Ensure paths start with `/` (e.g., `/My Notes/Topic`) |

### AI Tool Nodes Not Appearing

If the AI Tool nodes don't appear in the agent's tool selection, set the environment variable:
```
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [SiYuan API Documentation](https://github.com/siyuan-note/siyuan/blob/master/API.md)
- [SiYuan User Guide](https://b3log.org/siyuan/en/guide)
- [Project Repository](https://github.com/PsycoStea/SiYuan-n8n-nodes)
- [Report Issues](https://github.com/PsycoStea/SiYuan-n8n-nodes/issues)

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for the full version history.

## Contributing

Contributions, issues, and feature requests are welcome! Please check the [issues page](https://github.com/PsycoStea/SiYuan-n8n-nodes/issues).

---

[![Star History Chart](https://api.star-history.com/svg?repos=PsycoStea/SiYuan-n8n-nodes&type=Timeline)](https://www.star-history.com/#PsycoStea/SiYuan-n8n-nodes&Timeline)
