import type { INodeProperties } from 'n8n-workflow';

export const attributeOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['attribute'] } },
	options: [
		{
			name: 'Get',
			value: 'get',
			description: 'Retrieve all attributes (custom and built-in) for a block',
			action: 'Get block attributes',
		},
		{
			name: 'Set',
			value: 'set',
			description:
				'Add or update custom or built-in attributes on a block. Custom names must start with `custom-`.',
			action: 'Set block attributes',
		},
	],
	default: 'get',
};

export const attributeFields: INodeProperties[] = [
	// Block ID — get, set
	{
		displayName: 'Block ID',
		name: 'blockId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique ID of the block',
		displayOptions: {
			show: { resource: ['attribute'], operation: ['get', 'set'] },
		},
	},
	// Set — attributes collection
	{
		displayName: 'Attributes',
		name: 'attributes',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		required: true,
		default: {},
		description:
			'Name/value pairs to set on the block. Custom names must start with `custom-`. Built-in: title, name, alias, memo, bookmark, icon.',
		displayOptions: { show: { resource: ['attribute'], operation: ['set'] } },
		options: [
			{
				name: 'attributeValues',
				displayName: 'Attribute',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Attribute name (e.g., `title`, `alias`, `custom-status`)',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The value for this attribute',
					},
				],
			},
		],
	},
];
