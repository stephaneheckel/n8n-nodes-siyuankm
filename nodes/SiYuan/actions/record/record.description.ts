import type { INodeProperties } from 'n8n-workflow';

export const recordOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['record'] } },
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create or update a record (sub-document) inside a table',
			action: 'Create a record',
		},
		{
			name: 'List',
			value: 'list',
			description: 'List all records (sub-documents) inside a table',
			action: 'List records in a table',
		},
	],
	default: 'list',
};

export const recordFields: INodeProperties[] = [
	{
		displayName: 'Notebook Name',
		name: 'notebookName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the notebook (case-sensitive). Automatically resolved to its internal ID.',
		displayOptions: { show: { resource: ['record'], operation: ['create', 'list'] } },
	},
	{
		displayName: 'Table Name',
		name: 'tableName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my_table',
		description: 'The table (directory) name. Creates /&lt;TableName&gt;/&lt;RecordKey&gt;.',
		displayOptions: { show: { resource: ['record'], operation: ['create', 'list'] } },
	},
	{
		displayName: 'Record Key',
		name: 'recordKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'key1',
		description: 'The record key (filename). The full path will be /&lt;TableName&gt;/&lt;RecordKey&gt;.',
		displayOptions: { show: { resource: ['record'], operation: ['create'] } },
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		typeOptions: { rows: 5 },
		default: '',
		description: 'The value (content) for the record. Leave empty for a blank record.',
		displayOptions: { show: { resource: ['record'], operation: ['create'] } },
	},
	{
		displayName: 'Allow Update',
		name: 'allowUpdate',
		type: 'boolean',
		default: false,
		description: 'Whether to remove and replace an existing record at the same path. When off, duplicate keys cause an error.',
		displayOptions: { show: { resource: ['record'], operation: ['create'] } },
	},
];
