import type { INodeProperties } from 'n8n-workflow';

export const recordOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['record'] } },
	options: [
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
		displayOptions: { show: { resource: ['record'], operation: ['list'] } },
	},
	{
		displayName: 'Table Name',
		name: 'tableName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my_table',
		description: 'The table (directory) name whose records to list',
		displayOptions: { show: { resource: ['record'], operation: ['list'] } },
	},
];
