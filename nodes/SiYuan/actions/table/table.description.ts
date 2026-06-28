import type { INodeProperties } from 'n8n-workflow';

export const tableOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['table'] } },
	options: [
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
		displayOptions: { show: { resource: ['table'], operation: ['list'] } },
	},
];
