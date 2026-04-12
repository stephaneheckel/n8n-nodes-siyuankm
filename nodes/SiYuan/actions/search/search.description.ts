import type { INodeProperties } from 'n8n-workflow';

export const searchOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['search'] } },
	options: [
		{
			name: 'Full-Text Search',
			value: 'fullText',
			description:
				'Search across all blocks using a text query. Returns matching blocks with content context.',
			action: 'Full text search',
		},
		{
			name: 'Get Recent Changes',
			value: 'recentChanges',
			description: 'Retrieve recently modified documents, ordered by most recent first',
			action: 'Get recent changes',
		},
		{
			name: 'Search by Attribute',
			value: 'searchByAttribute',
			description: 'Find blocks that have a specific attribute name and value',
			action: 'Search by attribute',
		},
		{
			name: 'SQL Query',
			value: 'sqlQuery',
			description: 'Execute a custom SQL query against the SiYuan database for advanced filtering',
			action: 'Execute a SQL query',
		},
	],
	default: 'fullText',
};

export const searchFields: INodeProperties[] = [
	// Full-text search — query
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Enter search terms',
		description: 'The text to search for across all blocks in the workspace',
		displayOptions: { show: { resource: ['search'], operation: ['fullText'] } },
	},
	// SQL Query — statement
	{
		displayName: 'SQL Statement',
		name: 'sqlStatement',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: 'SELECT * FROM blocks LIMIT 10',
		description:
			"A SQL query to run on the SiYuan database (e.g., `SELECT * FROM blocks WHERE content LIKE '%keyword%'`)",
		displayOptions: { show: { resource: ['search'], operation: ['sqlQuery'] } },
	},
	// Search by attribute — name
	{
		displayName: 'Attribute Name',
		name: 'attributeName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'custom-status',
		description: 'The name of the attribute to search for (e.g., `custom-status`, `memo`, `alias`)',
		displayOptions: { show: { resource: ['search'], operation: ['searchByAttribute'] } },
	},
	// Search by attribute — value
	{
		displayName: 'Attribute Value',
		name: 'attributeValue',
		type: 'string',
		required: true,
		default: '',
		description: 'The attribute value to match (partial matches supported)',
		displayOptions: { show: { resource: ['search'], operation: ['searchByAttribute'] } },
	},
	// Recent changes — limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['search'], operation: ['recentChanges'] } },
	},
	// Recent changes — since (optional)
	{
		displayName: 'Additional Options',
		name: 'recentOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['search'], operation: ['recentChanges'] } },
		options: [
			{
				displayName: 'Since',
				name: 'since',
				type: 'string',
				default: '',
				placeholder: '20240101120000',
				description: 'Only return documents modified after this timestamp (format: YYYYMMDDHHmmss)',
			},
		],
	},
];
