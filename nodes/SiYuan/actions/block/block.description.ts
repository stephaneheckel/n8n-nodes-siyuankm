import type { INodeProperties } from 'n8n-workflow';

export const blockOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['block'] } },
	options: [
		{
			name: 'Append',
			value: 'append',
			description: 'Add a block to the end of a parent block',
			action: 'Append a block',
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Permanently remove a block by its ID',
			action: 'Delete a block',
		},
		{
			name: 'Fold',
			value: 'fold',
			description: 'Collapse a foldable block to hide its children',
			action: 'Fold a block',
		},
		{
			name: 'Get Child Blocks',
			value: 'getChildren',
			description: 'Retrieve the list of direct child blocks under a parent block',
			action: 'Get child blocks',
		},
		{
			name: 'Get Content (Markdown)',
			value: 'getContentMd',
			description:
				'Get the Markdown content of a block as a plain string. Ideal for AI agent consumption.',
			action: 'Get block content as markdown',
		},
		{
			name: 'Get Kramdown',
			value: 'getKramdown',
			description: 'Get the raw Kramdown (Markdown) source of a block',
			action: 'Get block kramdown',
		},
		{
			name: 'Insert',
			value: 'insert',
			description:
				'Insert a block before or after an existing block, or as a child of a parent block',
			action: 'Insert a block',
		},
		{
			name: 'Move',
			value: 'move',
			description: 'Move a block to a new position within a document',
			action: 'Move a block',
		},
		{
			name: 'Prepend',
			value: 'prepend',
			description: 'Add a block to the beginning of a parent block',
			action: 'Prepend a block',
		},
		{
			name: 'Transfer References',
			value: 'transferRef',
			description: 'Transfer block references from one block to another',
			action: 'Transfer block references',
		},
		{
			name: 'Unfold',
			value: 'unfold',
			description: 'Expand a folded block to reveal its children',
			action: 'Unfold a block',
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Replace the content of an existing block',
			action: 'Update a block',
		},
	],
	default: 'append',
};

export const blockFields: INodeProperties[] = [
	// Block ID — update, delete, getKramdown, getChildren, fold, unfold, move, getContentMd
	{
		displayName: 'Block ID',
		name: 'blockId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique ID of the block',
		displayOptions: {
			show: {
				resource: ['block'],
				operation: [
					'update',
					'delete',
					'getKramdown',
					'getChildren',
					'fold',
					'unfold',
					'move',
					'getContentMd',
				],
			},
		},
	},
	// Parent Block ID — append, prepend, insert
	{
		displayName: 'Parent Block ID',
		name: 'parentBlockId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the parent block (document or container block) to add content into',
		displayOptions: {
			show: { resource: ['block'], operation: ['append', 'prepend', 'insert'] },
		},
	},
	// Content — append, prepend, insert, update
	{
		displayName: 'Content (Markdown)',
		name: 'blockData',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		description: 'The Markdown content for the block',
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['append', 'prepend', 'insert', 'update'],
			},
		},
	},
	// Insert — previous block ID (optional)
	{
		displayName: 'Previous Block ID',
		name: 'previousBlockId',
		type: 'string',
		default: '',
		description: 'Insert the new block after this block. Leave empty to use Next Block ID instead.',
		displayOptions: { show: { resource: ['block'], operation: ['insert'] } },
	},
	// Insert — next block ID (optional)
	{
		displayName: 'Next Block ID',
		name: 'nextBlockId',
		type: 'string',
		default: '',
		description: 'Insert the new block before this block. Used when Previous Block ID is empty.',
		displayOptions: { show: { resource: ['block'], operation: ['insert'] } },
	},
	// Move — target previous block ID (optional)
	{
		displayName: 'Move After Block ID',
		name: 'movePreviousId',
		type: 'string',
		default: '',
		description:
			'Place the block after this sibling block. Leave empty to use Move Under Parent ID instead.',
		displayOptions: { show: { resource: ['block'], operation: ['move'] } },
	},
	// Move — target parent block ID (optional)
	{
		displayName: 'Move Under Parent ID',
		name: 'moveParentId',
		type: 'string',
		default: '',
		description:
			'Place the block as a child of this parent. Used when Move After Block ID is empty.',
		displayOptions: { show: { resource: ['block'], operation: ['move'] } },
	},
	// Transfer References — from ID
	{
		displayName: 'From Block ID',
		name: 'transferFromId',
		type: 'string',
		required: true,
		default: '',
		description: 'The block whose references should be transferred away',
		displayOptions: {
			show: { resource: ['block'], operation: ['transferRef'] },
		},
	},
	// Transfer References — to ID
	{
		displayName: 'To Block ID',
		name: 'transferToId',
		type: 'string',
		required: true,
		default: '',
		description: 'The block that should receive the references',
		displayOptions: {
			show: { resource: ['block'], operation: ['transferRef'] },
		},
	},
	// Transfer References — optional ref IDs
	{
		displayName: 'Additional Options',
		name: 'transferOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: { resource: ['block'], operation: ['transferRef'] },
		},
		options: [
			{
				displayName: 'Reference IDs',
				name: 'refIDs',
				type: 'string',
				default: '',
				description:
					'Comma-separated list of specific reference block IDs to transfer. Leave empty to transfer all.',
			},
		],
	},
	// Advanced: Data type — append, prepend, insert, update
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['append', 'prepend', 'insert', 'update'],
			},
		},
		options: [
			{
				displayName: 'Data Type',
				name: 'dataType',
				type: 'options',
				options: [
					{ name: 'Markdown', value: 'markdown' },
					{ name: 'DOM (HTML)', value: 'dom' },
				],
				default: 'markdown',
				description: 'The format of the content. Defaults to Markdown.',
			},
		],
	},
];
