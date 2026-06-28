import type { INodeProperties } from 'n8n-workflow';

export const markdownTableOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['markdownTable'] } },
	options: [
		{
			name: 'Add Row',
			value: 'addRow',
			description: 'Append a new row to an existing Markdown table block',
			action: 'Add a row to a markdown table',
		},
		{
			name: 'Create',
			value: 'create',
			description: 'Append a new empty Markdown table to a parent block',
			action: 'Create a markdown table',
		},
		{
			name: 'Delete Row',
			value: 'deleteRow',
			description: 'Remove a row from a Markdown table by its 0-based row index (excluding header)',
			action: 'Delete a row from a markdown table',
		},
		{
			name: 'Get',
			value: 'get',
			description: 'Parse and return the structure and data of a Markdown table block',
			action: 'Get a markdown table',
		},
		{
			name: 'Update Row',
			value: 'updateRow',
			description: 'Update a row in a Markdown table by its 0-based row index (excluding header)',
			action: 'Update a row in a markdown table',
		},
	],
	default: 'get',
};

export const markdownTableFields: INodeProperties[] = [
	{
		displayName: 'Parent Block ID',
		name: 'parentBlockId',
		type: 'string',
		required: true,
		default: '',
		description:
			'The ID of the block (typically a document) where the new Markdown table will be appended',
		displayOptions: { show: { resource: ['markdownTable'], operation: ['create'] } },
	},
	{
		displayName: 'Columns',
		name: 'columns',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		required: true,
		default: {},
		description: 'Column definitions for the new Markdown table',
		displayOptions: { show: { resource: ['markdownTable'], operation: ['create'] } },
		options: [
			{
				name: 'columnValues',
				displayName: 'Column',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'The header text for the column',
					},
				],
			},
		],
	},
	{
		displayName: 'Table Block ID',
		name: 'tableBlockId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the Markdown table block to operate on',
		displayOptions: {
			show: { resource: ['markdownTable'], operation: ['get', 'addRow', 'updateRow', 'deleteRow'] },
		},
	},
	{
		displayName: 'Row Data',
		name: 'rowData',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		required: true,
		default: {},
		description: 'The cell values for the row, keyed by column name',
		displayOptions: { show: { resource: ['markdownTable'], operation: ['addRow', 'updateRow'] } },
		options: [
			{
				name: 'cells',
				displayName: 'Cell',
				values: [
					{
						displayName: 'Column Name',
						name: 'columnName',
						type: 'string',
						default: '',
						description: 'The name of the column this value belongs to',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The cell value',
					},
				],
			},
		],
	},
	{
		displayName: 'Row Index',
		name: 'rowIndex',
		type: 'number',
		required: true,
		default: 0,
		description: 'Zero-based row index, excluding the header row',
		displayOptions: {
			show: { resource: ['markdownTable'], operation: ['updateRow', 'deleteRow'] },
		},
	},
];
