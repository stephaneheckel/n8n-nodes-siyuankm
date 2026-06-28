import type { INodeProperties } from 'n8n-workflow';

export const tableOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['table'] } },
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new table (top-level document) in a notebook',
			action: 'Create a table',
		},
		{
			name: 'List',
			value: 'list',
			description: 'List all tables (top-level documents) inside a notebook',
			action: 'List tables in a notebook',
		},
	],
	default: 'list',
};

export const tableFields: INodeProperties[] = [
	{
		displayName: 'Notebook Name',
		name: 'notebookName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the notebook (case-sensitive). Automatically resolved to its internal ID.',
		displayOptions: { show: { resource: ['table'], operation: ['create', 'list'] } },
	},
	{
		displayName: 'Table Name',
		name: 'tableName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my_table',
		description: 'The table name. Creates /&lt;TableName&gt; as a top-level document.',
		displayOptions: { show: { resource: ['table'], operation: ['create'] } },
	},
	{
		displayName: 'Allow Update',
		name: 'allowUpdate',
		type: 'boolean',
		default: false,
		description: 'Whether to remove and replace an existing table at the same path. When off, duplicate names cause an error.',
		displayOptions: { show: { resource: ['table'], operation: ['create'] } },
	},
];
