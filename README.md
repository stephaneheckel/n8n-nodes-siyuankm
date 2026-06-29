# n8n-nodes-siyuan (experimental)

> ⚠️ **Fork — under active development.** This is a fork of the excellent
> [PsycoStea/SiYuan-n8n-nodes](https://github.com/PsycoStea/SiYuan-n8n-nodes).
> Many resources and the original architecture are inherited from that project.
> All credit for the foundation goes to the original authors and contributors.
>
> **Goal:** turn SiYuan into a **key-value store** accessible from n8n workflows —
> notebooks as databases, top-level documents as tables, sub-documents as records.

---

## Use case: key-value store on top of SiYuan

SiYuan stores documents in a tree. This node maps that tree to key-value semantics:

| SiYuan concept | Node resource | Meaning |
|---------------|---------------|---------|
| Notebook | `Notebook` | Database |
| Top-level document | `Table` | Table / collection |
| Sub-document | `Record` | Key → value pair |

### Quick example

```
Notebook → Create       name: "my-db"
Table → Create          notebook: "my-db", table: "users"
Record → Create         table: "users", key: "alice", value: "alice@example.com"
Record → Read           table: "users", key: "alice"  →  "alice@example.com"
Record → List           table: "users", filter: "*"   →  all records
```

`Record/Create` includes an **Allow Update** toggle for upsert semantics
and an optional **Tags** field (comma-separated, stored as SiYuan block attributes).

### Intended use

This key-value layer is designed for **non-human interfaces** — CLIs, agents
(such as [Hermes Agent](https://hermes-agent.nousresearch.com/)), and
automated workflows that produce documentation, activity logs, or structured
reports. Tables and records can be created, updated, and queried
programmatically without ever opening the SiYuan UI.

**Do not use this as a general-purpose key-value system.**
SiYuan is a knowledge base — the key-value mapping is a convenience layer
on top of its document tree, not a replacement for Redis, SQLite, or a dedicated KV store.
Performance, concurrency, and consistency guarantees are those of the underlying
SiYuan kernel.

This experimental node is also a personal exploration of SiYuan's internals —
understanding how documents, blocks, attributes, and the file tree work under the hood.

---

### New in this fork (`Table` and `Record`)

| Resource | Operations | Description |
|----------|-----------|-------------|
| **Table** | Create, List | Top-level documents in a notebook. `List` returns `{id, table, updated}`. |
| **Record** | Create, List, Read | Sub-documents inside a table. `Read` returns `{id, record, content, found}`. `List` supports an optional **Key Filter** (glob: `*` and `?`). `Create` includes **Allow Update** and **Tags**. |

### Inherited from the original project

| Resource | Operations | Description |
|----------|-----------|-------------|
| Notebook | Create, List, Rename, Remove, Open, Close, Get/Set Config | Notebooks are resolved by **name** (not ID). Duplicate names are prevented at creation time. |
| Document | Create, Export, Get Content, Get Tree, ID/Path resolution, Remove, Rename | Full markdown documents. `Create` supports **Allow Update** for overwrites. |
| Tag | Add, Remove, Find by Tag, List All, Rename | Cross-table tag search on block attributes. |
| Database, Search, Asset, System | (unchanged) | From the original node. |
| SiYuan Trigger | Polling | Starts workflows on document/block changes. |

### Removed from this fork

`Attribute`, `Block`, `Markdown Table` resources and the dedicated AI Tool nodes
(`SiYuan Document Tool`, `SiYuan Search Tool`, `SiYuan Block Tool`,
`SiYuan Notebook Tool`) were removed to keep the node focused on key-value semantics.

---

## `Record` content: what you write vs what you get back

`Record/Create` stores values through SiYuan's `createDocWithMd` API.
SiYuan automatically wraps every document with YAML frontmatter and a markdown heading:

```
---
title: <recordKey>
date: 2026-06-29...
---

# <recordKey>

<your value>
```

`Record/Read` strips the frontmatter and the auto-generated heading,
returning your original value **as-is** for most content.

### Exact round-trip

✅ Plain text, markdown, `# headings`, emojis, URLs — all round-trip exactly.

### Known limitations

| Write | Read | Reason |
|-------|------|--------|
| `"  hello  "` | `"hello\n"` | SiYuan's `exportDocMd` normalizes trailing whitespace |
| `"---\nkey: val\n---\nhello"` | `"hello"` | Looks like YAML frontmatter — gets stripped |

If exact byte-for-byte fidelity is critical, consider storing content
through the Asset API instead (not currently exposed as a key-value operation).

---

## Name-based resolution

Notebooks and tables are resolved by **name** instead of ID.
The node calls `listNotebooks()` internally and matches by exact name (case-sensitive).
Duplicate names are rejected at creation time.

---

## Credits

This node is a fork of [PsycoStea/SiYuan-n8n-nodes](https://github.com/PsycoStea/SiYuan-n8n-nodes),
originally authored by **Michael Bates** ([PsycoStea](https://github.com/PsycoStea))
with co-authorship from **Claude** (Anthropic AI).
The original project is MIT-licensed and available on npm as `n8n-nodes-siyuan`.

Fork maintained by [stephaneheckel](https://github.com/stephaneheckel).

---

## Install

```bash
cd C:\Users\<user>\n8n-nodes-siyuankm
npm run dev
```

n8n starts at `http://localhost:5678` with the node loaded from the local build.

---

## License

MIT — same as the original project.
