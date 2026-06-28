import type { INodeProperties } from 'n8n-workflow';

export const notebookOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['notebook'] } },
	options: [
		{
			name: 'Close',
			value: 'close',
			description: 'Close an open notebook, hiding its contents from view',
			action: 'Close a notebook',
		},
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new, empty notebook in SiYuan',
			action: 'Create a notebook',
		},
		{
			name: 'Get Configuration',
			value: 'getConf',
			description: 'Retrieve the configuration settings for a notebook',
			action: 'Get notebook configuration',
		},
		{
			name: 'List',
			value: 'list',
			description: 'Retrieve a list of all notebooks with their names and IDs',
			action: 'List all notebooks',
		},
		{
			name: 'Open',
			value: 'open',
			description: 'Open a closed notebook so its contents become accessible',
			action: 'Open a notebook',
		},
		{
			name: 'Remove',
			value: 'remove',
			description:
				'Permanently delete an entire notebook and all its contents. This is irreversible.',
			action: 'Remove a notebook',
		},
		{
			name: 'Rename',
			value: 'rename',
			description: 'Change the name of an existing notebook',
			action: 'Rename a notebook',
		},
		{
			name: 'Set Configuration',
			value: 'setConf',
			description: 'Update configuration settings for a notebook',
			action: 'Set notebook configuration',
		},
	],
	default: 'list',
};

export const notebookFields: INodeProperties[] = [
	// Notebook Name — used by rename, remove, open, close, getConf, setConf
	{
		displayName: 'Notebook Name',
		name: 'notebookName',
		type: 'string',
		required: true,
		default: '',
		description:
			'The name of the notebook (case-sensitive). Automatically resolved to its internal ID.',
		displayOptions: {
			show: {
				resource: ['notebook'],
				operation: ['rename', 'remove', 'open', 'close', 'getConf', 'setConf'],
			},
		},
	},
	// Create — name
	{
		displayName: 'Notebook Name',
		name: 'notebookName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name for the new notebook',
		displayOptions: { show: { resource: ['notebook'], operation: ['create'] } },
	},
	// Rename — new name
	{
		displayName: 'New Name',
		name: 'newName',
		type: 'string',
		required: true,
		default: '',
		description: 'The new name to assign to the notebook',
		displayOptions: { show: { resource: ['notebook'], operation: ['rename'] } },
	},
	// Set Configuration — conf JSON
	{
		displayName: 'Configuration (JSON)',
		name: 'notebookConf',
		type: 'json',
		required: true,
		default: '{}',
		description:
			'A JSON object with the configuration fields to update. Supported fields: name, closed, refCreateSavePath, createDocNameTemplate, dailyNoteSavePath, dailyNoteTemplatePath, sortMode, icon.',
		displayOptions: { show: { resource: ['notebook'], operation: ['setConf'] } },
	},
];
