import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { SiYuanClient } from '../../lib/SiYuanClient';

export class SiYuanDocumentTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiYuan Document Tool',
		name: 'siYuanDocumentTool',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:siyuan.svg',
		group: ['productivity'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Use this tool to create, read, list, and manage documents in the SiYuan knowledge base. Use "getContent" to read a document, "create" to write a new one, "listInNotebook" to browse, or "exportMd" for full markdown export.',
		defaults: {
			name: 'SiYuan Document Tool',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
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
						description: 'Create a new document with Markdown content in a notebook',
						action: 'Create a document',
					},
					{
						name: 'Export Markdown',
						value: 'exportMd',
						description: 'Export a document as Markdown with its human-readable path',
						action: 'Export document as markdown',
					},
					{
						name: 'Get Content',
						value: 'getContent',
						description: 'Read the full Markdown content of a document by its ID',
						action: 'Get document content',
					},
					{
						name: 'Get Document Tree',
						value: 'getTree',
						description: 'Get the hierarchical block structure of a document',
						action: 'Get document tree',
					},
					{
						name: 'List in Notebook',
						value: 'listInNotebook',
						description: 'List all documents with titles and IDs inside a notebook',
						action: 'List documents in notebook',
					},
					{
						name: 'Remove',
						value: 'remove',
						description: 'Permanently delete a document by its ID',
						action: 'Remove a document',
					},
				],
				default: 'getContent',
			},
			{
				displayName: 'Notebook ID',
				name: 'notebookId',
				type: 'string',
				required: true,
				default: '',
				description: 'The unique ID of the notebook',
				displayOptions: { show: { operation: ['create', 'listInNotebook'] } },
			},
			{
				displayName: 'Document Path',
				name: 'docPath',
				type: 'string',
				required: true,
				default: '/',
				description:
					'The path for the new document (e.g., `/My Notes/Topic`). Must start with `/`.',
				displayOptions: { show: { operation: ['create'] } },
			},
			{
				displayName: 'Markdown Content',
				name: 'markdownContent',
				type: 'string',
				typeOptions: { rows: 10 },
				required: true,
				default: '',
				description: 'The Markdown content for the new document',
				displayOptions: { show: { operation: ['create'] } },
			},
			{
				displayName: 'Document ID',
				name: 'docId',
				type: 'string',
				required: true,
				default: '',
				description: 'The unique ID of the document',
				displayOptions: { show: { operation: ['getContent', 'exportMd', 'getTree', 'remove'] } },
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
						const notebookId = this.getNodeParameter('notebookId', i) as string;
						const docPath = this.getNodeParameter('docPath', i) as string;
						const markdown = this.getNodeParameter('markdownContent', i) as string;
						result = await client.createDocWithMd(notebookId, docPath, markdown);
						break;
					}
					case 'getContent': {
						const docId = this.getNodeParameter('docId', i) as string;
						result = await client.getDocContent(docId);
						break;
					}
					case 'exportMd': {
						const docId = this.getNodeParameter('docId', i) as string;
						result = await client.exportDocMd(docId);
						break;
					}
					case 'getTree': {
						const docId = this.getNodeParameter('docId', i) as string;
						result = await client.getDocumentTree(docId);
						break;
					}
					case 'listInNotebook': {
						const notebookId = this.getNodeParameter('notebookId', i) as string;
						result = await client.listDocsInNotebook(notebookId);
						break;
					}
					case 'remove': {
						const docId = this.getNodeParameter('docId', i) as string;
						result = await client.removeDocByID(docId);
						break;
					}
				}

				const jsonResult = (result == null ? { success: true } : result) as
					| IDataObject
					| IDataObject[];
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
