import type { INodeProperties } from 'n8n-workflow';

export const documentOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['document'] } },
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new document with Markdown content inside a notebook',
			action: 'Create a document',
		},
		{
			name: 'Export Markdown',
			value: 'exportMd',
			description: "Export a document's full Markdown content along with its human-readable path",
			action: 'Export document as markdown',
		},
		{
			name: 'Get Content',
			value: 'getContent',
			description:
				'Retrieve the full Markdown content of a document. Ideal for AI agent consumption.',
			action: 'Get document content',
		},
		{
			name: 'Get Document Tree',
			value: 'getTree',
			description:
				'Get the tree of child documents (sub-documents) nested under a document',
			action: 'Get document tree',
		},
		{
			name: 'Get ID by Path',
			value: 'getIdByPath',
			description:
				'Find the document ID by its human-readable path (e.g., /My Notes/Meeting Summary)',
			action: 'Get document ID by path',
		},
		{
			name: 'Get Path by ID',
			value: 'getPathById',
			description: 'Get the human-readable path of a document from its ID',
			action: 'Get document path by ID',
		},
		{
			name: 'Get Readable Path From Storage Path',
			value: 'getHPathByPath',
			description: 'Convert an internal storage path to a human-readable path within a notebook',
			action: 'Get readable path from storage path',
		},
		{
			name: 'Get Storage Path by ID',
			value: 'getStoragePath',
			description: 'Get the internal storage path for a document (e.g., /data/notebookId/docId.sy)',
			action: 'Get storage path by ID',
		},
		{
			name: 'List in Notebook',
			value: 'listInNotebook',
			description: 'List all documents (with titles and IDs) inside a specific notebook',
			action: 'List documents in a notebook',
		},
		{
			name: 'Move',
			value: 'move',
			description: 'Move a document to a different notebook or under another document',
			action: 'Move a document',
		},
		{
			name: 'Remove',
			value: 'remove',
			description: 'Permanently delete a document by its ID',
			action: 'Remove a document',
		},
		{
			name: 'Rename',
			value: 'rename',
			description: 'Change the title of an existing document',
			action: 'Rename a document',
		},
	],
	default: 'create',
};

export const documentFields: INodeProperties[] = [
	// Notebook ID — create, getIdByPath, listInNotebook, getHPathByPath
	{
		displayName: 'Notebook ID',
		name: 'notebookId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique ID of the notebook',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['create', 'getIdByPath', 'listInNotebook', 'getHPathByPath'],
			},
		},
	},
	// Document path — create, getIdByPath
	{
		displayName: 'Document Path',
		name: 'docPath',
		type: 'string',
		required: true,
		default: '/',
		description:
			'The folder-like path for the document (e.g., `/My Project/Meeting Notes`). Must start with `/`.',
		displayOptions: {
			show: { resource: ['document'], operation: ['create', 'getIdByPath'] },
		},
	},
	// Markdown content — create
	{
		displayName: 'Markdown Content',
		name: 'markdownContent',
		type: 'string',
		typeOptions: { rows: 10 },
		required: true,
		default: '',
		description: 'The Markdown content for the new document',
		displayOptions: { show: { resource: ['document'], operation: ['create'] } },
	},
	// Document ID — rename, remove, move, getPathById, exportMd, getContent, getTree, getStoragePath
	{
		displayName: 'Document ID',
		name: 'docId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique ID of the document',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: [
					'rename',
					'remove',
					'move',
					'getPathById',
					'exportMd',
					'getContent',
					'getTree',
					'getStoragePath',
				],
			},
		},
	},
	// Rename — new title
	{
		displayName: 'New Title',
		name: 'newTitle',
		type: 'string',
		required: true,
		default: '',
		description: 'The new title for the document',
		displayOptions: { show: { resource: ['document'], operation: ['rename'] } },
	},
	// Move — target parent ID
	{
		displayName: 'Target Parent ID',
		name: 'targetParentId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the destination notebook or parent document to move into',
		displayOptions: { show: { resource: ['document'], operation: ['move'] } },
	},
	// getHPathByPath — storage path
	{
		displayName: 'Storage Path',
		name: 'storagePath',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/20210808180117-6v0mkxr.sy',
		description: 'The internal storage path to convert (e.g., `/20210808180117-6v0mkxr.sy`)',
		displayOptions: {
			show: { resource: ['document'], operation: ['getHPathByPath'] },
		},
	},
	// getTree — depth limit
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: { resource: ['document'], operation: ['getTree'] },
		},
		options: [
			{
				displayName: 'Max Depth',
				name: 'maxDepth',
				type: 'number',
				default: 5,
				description: 'Maximum depth of the sub-document tree to retrieve',
			},
		],
	},
];
