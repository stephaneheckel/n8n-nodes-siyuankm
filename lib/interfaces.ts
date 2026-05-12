/** Standard SiYuan API response wrapper. */
export interface SiYuanResponse<T = unknown> {
	code: number;
	msg: string;
	data: T;
}

/** Notebook metadata returned by list/create operations. */
export interface SiYuanNotebookInfo {
	id: string;
	name: string;
	icon: string;
	sort: number;
	closed: boolean;
}

/** Notebook configuration from /api/notebook/getNotebookConf. */
export interface SiYuanNotebookConf {
	name: string;
	closed: boolean;
	refCreateSavePath: string;
	createDocNameTemplate: string;
	dailyNoteSavePath: string;
	dailyNoteTemplatePath: string;
	sortMode: number;
	icon: string;
	[key: string]: unknown;
}

/** Directory entry from /api/file/readDir. */
export interface SiYuanDirEntry {
	isDir: boolean;
	isSymlink: boolean;
	name: string;
	updated: number;
}

/** Document listing enriched with title from block attributes. */
export interface ListedDocument {
	id: string;
	name: string;
	title: string;
	updated: number;
	isDir: boolean;
	isSymlink: boolean;
}

/** Child block info from /api/block/getChildBlocks. */
export interface SiYuanChildBlockInfo {
	id: string;
	type: string;
	subType?: string;
}

/** Exported document markdown from /api/export/exportMdContent. */
export interface ExportedDocMd {
	hPath: string;
	content: string;
}

/** Block operation result (append/prepend/insert/update). */
export interface BlockOperationResult {
	doOperations: Array<{
		action: string;
		id: string;
		parentID: string;
		data: string;
		[key: string]: unknown;
	}>;
	undoOperations: Array<{
		action: string;
		id: string;
		[key: string]: unknown;
	}> | null;
}

/** A node in a document's block tree (returned by getDocumentTree). */
export interface DocumentTreeNode {
	id: string;
	type: string;
	subType?: string;
	kramdown: string;
	children: DocumentTreeNode[];
}

/** A node in a document's sub-document tree (returned by getDocumentTree). */
export interface SubDocumentNode {
	id: string;
	title: string;
	hPath: string;
	updated: number;
	children: SubDocumentNode[];
}

/** Full-text search result from /api/search/fullTextSearchBlock. */
export interface FullTextSearchResult {
	blocks: Array<{
		box: string;
		path: string;
		hPath: string;
		id: string;
		rootID: string;
		parentID: string;
		content: string;
		[key: string]: unknown;
	}>;
	matchedBlockCount: number;
	matchedRootCount: number;
	pageCount: number;
}

/** Structured error info for both humans and AI agents. */
export interface SiYuanErrorInfo {
	errorCode: number | string;
	message: string;
	operation: string;
	endpoint: string;
	suggestion: string;
}
