import type { INodeProperties } from 'n8n-workflow';

export const tagOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['tag'] } },
	options: [
		{
			name: 'Add',
			value: 'add',
			description: 'Add a tag to a block. If the tag already exists on the block this is a no-op.',
			action: 'Add a tag to a block',
		},
		{
			name: 'Find Blocks by Tag',
			value: 'findBlocks',
			description: 'Find all blocks in the workspace that have a specific tag',
			action: 'Find blocks by tag',
		},
		{
			name: 'Get Tags for Block',
			value: 'get',
			description: 'Retrieve the list of tags on a specific block',
			action: 'Get tags for a block',
		},
		{
			name: 'List All',
			value: 'listAll',
			description: 'List all unique tags across the workspace with the number of blocks using each',
			action: 'List all tags',
		},
		{
			name: 'Remove',
			value: 'remove',
			description: 'Remove a specific tag from a block without affecting other tags',
			action: 'Remove a tag from a block',
		},
		{
			name: 'Rename',
			value: 'rename',
			description: 'Rename a tag across all blocks in the workspace',
			action: 'Rename a tag',
		},
	],
	default: 'get',
};

export const tagFields: INodeProperties[] = [
	// Block ID — add, remove, get
	{
		displayName: 'Block ID',
		name: 'blockId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique ID of the block',
		displayOptions: {
			show: { resource: ['tag'], operation: ['add', 'remove', 'get'] },
		},
	},
	// Tag name — add, remove, findBlocks
	{
		displayName: 'Tag',
		name: 'tag',
		type: 'string',
		required: true,
		default: '',
		description: 'The tag name (without the # symbol)',
		displayOptions: {
			show: { resource: ['tag'], operation: ['add', 'remove', 'findBlocks'] },
		},
	},
	// Rename — old tag
	{
		displayName: 'Current Tag Name',
		name: 'oldTag',
		type: 'string',
		required: true,
		default: '',
		description: 'The current name of the tag to rename',
		displayOptions: { show: { resource: ['tag'], operation: ['rename'] } },
	},
	// Rename — new tag
	{
		displayName: 'New Tag Name',
		name: 'newTag',
		type: 'string',
		required: true,
		default: '',
		description: 'The new name for the tag',
		displayOptions: { show: { resource: ['tag'], operation: ['rename'] } },
	},
];
