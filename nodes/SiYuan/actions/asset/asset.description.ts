import type { INodeProperties } from 'n8n-workflow';

export const assetOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['asset'] } },
	options: [
		{
			name: 'Get File',
			value: 'getFile',
			description: 'Retrieve the content of a file from the SiYuan workspace',
			action: 'Get a file',
		},
		{
			name: 'List Files in Directory',
			value: 'listFiles',
			description: 'List files and folders in a workspace directory (e.g., /data/, /assets/)',
			action: 'List files in a directory',
		},
		{
			name: 'Put File',
			value: 'putFile',
			description: 'Create or overwrite a file in the SiYuan workspace',
			action: 'Put a file',
		},
		{
			name: 'Remove File',
			value: 'removeFile',
			description: 'Delete a file or directory from the SiYuan workspace',
			action: 'Remove a file',
		},
		{
			name: 'Rename File',
			value: 'renameFile',
			description: 'Rename or move a file within the SiYuan workspace',
			action: 'Rename a file',
		},
		{
			name: 'Upload Asset',
			value: 'upload',
			description: 'Upload an asset file (image, PDF, etc.) to the SiYuan assets directory',
			action: 'Upload an asset',
		},
	],
	default: 'listFiles',
};

export const assetFields: INodeProperties[] = [
	// File path — getFile, removeFile, putFile
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/data/assets/image.png',
		description: 'The path of the file within the SiYuan workspace',
		displayOptions: {
			show: { resource: ['asset'], operation: ['getFile', 'removeFile', 'putFile'] },
		},
	},
	// Directory path — listFiles
	{
		displayName: 'Directory Path',
		name: 'directoryPath',
		type: 'string',
		required: true,
		default: '/data/',
		description:
			'The directory path under the SiYuan workspace (e.g., `/data/`, `/assets/`). Must start with `/`.',
		displayOptions: {
			show: { resource: ['asset'], operation: ['listFiles'] },
		},
	},
	// Rename — old path
	{
		displayName: 'Current Path',
		name: 'currentPath',
		type: 'string',
		required: true,
		default: '',
		description: 'The current path of the file to rename',
		displayOptions: { show: { resource: ['asset'], operation: ['renameFile'] } },
	},
	// Rename — new path
	{
		displayName: 'New Path',
		name: 'newPath',
		type: 'string',
		required: true,
		default: '',
		description: 'The new path for the file',
		displayOptions: { show: { resource: ['asset'], operation: ['renameFile'] } },
	},
	// Put file — content
	{
		displayName: 'File Content',
		name: 'fileContent',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		description: 'The content to write to the file',
		displayOptions: { show: { resource: ['asset'], operation: ['putFile'] } },
	},
	// Put file — is directory (optional)
	{
		displayName: 'Additional Options',
		name: 'putFileOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['asset'], operation: ['putFile'] } },
		options: [
			{
				displayName: 'Is Directory',
				name: 'isDir',
				type: 'boolean',
				default: false,
				description: 'Whether to create a directory instead of a file',
			},
		],
	},
	// Upload — assets dir path
	{
		displayName: 'Assets Directory Path',
		name: 'assetsDirPath',
		type: 'string',
		required: true,
		default: '/assets/',
		description: 'The directory in SiYuan where the asset will be stored (e.g., `/assets/`)',
		displayOptions: { show: { resource: ['asset'], operation: ['upload'] } },
	},
	// Upload — binary property name
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'The name of the binary property containing the file to upload',
		displayOptions: { show: { resource: ['asset'], operation: ['upload'] } },
	},
];
