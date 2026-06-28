import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { SiYuanClient } from '../../lib/SiYuanClient';

export class SiYuanNotebookTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiYuan Notebook Tool',
		name: 'siYuanNotebookTool',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:siyuan.svg',
		group: ['productivity' as any],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Use this tool to manage SiYuan notebooks. Use "list" to see all notebooks and their IDs, "create" to make a new notebook, or "getConf" to read notebook settings.',
		defaults: {
			name: 'SiYuan Notebook Tool',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: ['main'],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: ['main'],
		usableAsTool: true,
		credentials: [{ name: 'siYuanApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new empty notebook',
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
						description: 'List all notebooks with their names and IDs',
						action: 'List all notebooks',
					},
					{
						name: 'Remove',
						value: 'remove',
						description: 'Permanently delete a notebook and all its contents (irreversible)',
						action: 'Remove a notebook',
					},
					{
						name: 'Rename',
						value: 'rename',
						description: 'Change the name of an existing notebook',
						action: 'Rename a notebook',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Notebook Name',
				name: 'notebookName',
				type: 'string',
				required: true,
				default: '',
				description:
					'The name of the notebook (case-sensitive). Automatically resolved to its internal ID.',
				displayOptions: { show: { operation: ['rename', 'remove', 'getConf'] } },
			},
			{
				displayName: 'Notebook Name',
				name: 'notebookName',
				type: 'string',
				required: true,
				default: '',
				description: 'The name for the new notebook',
				displayOptions: { show: { operation: ['create'] } },
			},
			{
				displayName: 'New Name',
				name: 'newName',
				type: 'string',
				required: true,
				default: '',
				description: 'The new name to assign to the notebook',
				displayOptions: { show: { operation: ['rename'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('siYuanApi');
		const client = new SiYuanClient(credentials.apiUrl as string, credentials.apiToken as string);

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let result: unknown;

				switch (operation) {
					case 'create': {
						const name = this.getNodeParameter('notebookName', i) as string;
						result = await client.createNotebook(name);
						break;
					}
					case 'list': {
						result = await client.listNotebooks();
						break;
					}
					case 'rename': {
						const name = this.getNodeParameter('notebookName', i) as string;
						const { id } = await client.notebookByName(name);
						const newName = this.getNodeParameter('newName', i) as string;
						result = await client.renameNotebook(id, newName);
						break;
					}
					case 'remove': {
						const name = this.getNodeParameter('notebookName', i) as string;
						const { id } = await client.notebookByName(name);
						result = await client.removeNotebook(id);
						break;
					}
					case 'getConf': {
						const name = this.getNodeParameter('notebookName', i) as string;
						const { id } = await client.notebookByName(name);
						result = await client.getNotebookConf(id);
						break;
					}
				}

				const jsonResult = (result == null ? { success: true } : result) as
					IDataObject | IDataObject[];
				const execData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(jsonResult),
					{ itemData: { item: i } },
				);
				returnData.push(...execData);
			} catch (error) {
				if (this.continueOnFail()) {
					const errData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...errData);
					continue;
				}
				throw error;
			}
		}
		return this.prepareOutputData(returnData);
	}
}
