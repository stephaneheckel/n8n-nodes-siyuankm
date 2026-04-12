import type { INodeProperties } from 'n8n-workflow';

export const systemOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['system'] } },
	options: [
		{
			name: 'Export Resources',
			value: 'exportResources',
			description: 'Export files and folders from the workspace as a zip package',
			action: 'Export resources',
		},
		{
			name: 'Get Current Time',
			value: 'getCurrentTime',
			description: 'Get the current server time in milliseconds',
			action: 'Get current time',
		},
		{
			name: 'Get Version',
			value: 'getVersion',
			description: 'Get the current SiYuan application version',
			action: 'Get the si yuan version',
		},
		{
			name: 'Push Error Message',
			value: 'pushErrMsg',
			description: 'Show an error notification toast in the SiYuan UI',
			action: 'Push an error message',
		},
		{
			name: 'Push Message',
			value: 'pushMsg',
			description: 'Show an informational notification toast in the SiYuan UI',
			action: 'Push a message',
		},
		{
			name: 'Render Sprig Template',
			value: 'renderSprig',
			description: "Process a template string using SiYuan's built-in Sprig functions",
			action: 'Render a sprig template',
		},
	],
	default: 'getVersion',
};

export const systemFields: INodeProperties[] = [
	// Push message / push error — message text
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		default: '',
		description: 'The text to display in the notification',
		displayOptions: {
			show: { resource: ['system'], operation: ['pushMsg', 'pushErrMsg'] },
		},
	},
	// Push message / push error — timeout
	{
		displayName: 'Timeout (Ms)',
		name: 'timeout',
		type: 'number',
		default: 7000,
		description: 'How long the notification stays visible, in milliseconds',
		displayOptions: {
			show: { resource: ['system'], operation: ['pushMsg', 'pushErrMsg'] },
		},
	},
	// Sprig template
	{
		displayName: 'Sprig Template',
		name: 'sprigTemplate',
		type: 'string',
		required: true,
		default: '{{now | date "2006-01-02"}}',
		description: 'A Sprig template string to render (e.g., `{{now | date "2006-01-02"}}`)',
		displayOptions: { show: { resource: ['system'], operation: ['renderSprig'] } },
	},
	// Export resources — paths
	{
		displayName: 'Paths',
		name: 'exportPaths',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/data/notebookId/docId.sy',
		description: 'Comma-separated list of file or folder paths to export',
		displayOptions: { show: { resource: ['system'], operation: ['exportResources'] } },
	},
	// Export resources — optional name
	{
		displayName: 'Additional Options',
		name: 'exportOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['system'], operation: ['exportResources'] } },
		options: [
			{
				displayName: 'Export Name',
				name: 'exportName',
				type: 'string',
				default: '',
				description: 'A custom name for the exported zip package',
			},
		],
	},
];
