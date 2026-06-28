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
			name: 'Create Record',
			value: 'createRecord',
			description: 'Create or update a record document (key-value) under a table directory',
			action: 'Create a record',
		},
		{
			name: 'Create Table',
			value: 'createTable',
			description: 'Create a table directory to group records (key-value pattern)',
			action: 'Create a table',
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
			description: 'Get the tree of child documents (sub-documents) nested under a document',
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
			name: 'List in Table',
			value: 'listInTable',
			description: 'List all records (sub-documents) inside a table directory',
			action: 'List records in a table',
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
	// Notebook Name — create, createTable, createRecord, getIdByPath, listInNotebook, getHPathByPath
	{
		displayName: 'Notebook Name',
		name: 'notebookName',
		type: 'string',
		required: true,
		default: '',
		description:
			'The name of the notebook (case-sensitive). Automatically resolved to its internal ID.',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: [
					'create',
					'createTable',
					'createRecord',
					'getIdByPath',
					'listInNotebook',
					'listInTable',
					'getHPathByPath',
				],
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
		default: '',
		description: 'The Markdown content for the new document. Leave empty to create an empty document.',
		displayOptions: { show: { resource: ['document'], operation: ['create'] } },
	},
	// Table Name — createTable, createRecord
	{
		displayName: 'Table Name',
		name: 'tableName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my_table',
		description: 'The table (directory) name. Creates /&lt;TableName&gt; or /&lt;TableName&gt;/&lt;RecordKey&gt;.',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createTable', 'createRecord', 'listInTable'],
			},
		},
	},
	// Record Key — createRecord
	{
		displayName: 'Record Key',
		name: 'recordKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'key1',
		description: 'The record key (filename). The full path will be /&lt;TableName&gt;/&lt;RecordKey&gt;.',
		displayOptions: { show: { resource: ['document'], operation: ['createRecord'] } },
	},
	// Value — createRecord
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		typeOptions: { rows: 5 },
		default: '',
		description: 'The value (content) for the record. Leave empty for a blank record.',
		displayOptions: { show: { resource: ['document'], operation: ['createRecord'] } },
	},
	// Allow Update — create, createTable, createRecord
	{
		displayName: 'Allow Update',
		name: 'allowUpdate',
		type: 'boolean',
		default: false,
		description:
			'Whether to remove and replace an existing document at the same path. When off, duplicate paths cause an error.',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['create', 'createTable', 'createRecord'],
			},
		},
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
