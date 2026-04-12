import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import { SiYuanClient } from '../../lib/SiYuanClient';
import { formatErrorForAgent } from '../../lib/errors';

// Resource descriptions
import { assetOperations, assetFields } from './actions/asset/asset.description';
import { attributeOperations, attributeFields } from './actions/attribute/attribute.description';
import { blockOperations, blockFields } from './actions/block/block.description';
import { documentOperations, documentFields } from './actions/document/document.description';
import { notebookOperations, notebookFields } from './actions/notebook/notebook.description';
import { searchOperations, searchFields } from './actions/search/search.description';
import { systemOperations, systemFields } from './actions/system/system.description';
import { tagOperations, tagFields } from './actions/tag/tag.description';

// Operation handlers
import { handleAssetOperation } from './actions/asset/asset.handler';
import { handleAttributeOperation } from './actions/attribute/attribute.handler';
import { handleBlockOperation } from './actions/block/block.handler';
import { handleDocumentOperation } from './actions/document/document.handler';
import { handleNotebookOperation } from './actions/notebook/notebook.handler';
import { handleSearchOperation } from './actions/search/search.handler';
import { handleSystemOperation } from './actions/system/system.handler';
import { handleTagOperation } from './actions/tag/tag.handler';

const RESOURCE_HANDLERS: Record<
	string,
	(client: SiYuanClient, op: string, ctx: IExecuteFunctions, idx: number) => Promise<unknown>
> = {
	asset: handleAssetOperation,
	attribute: handleAttributeOperation,
	block: handleBlockOperation,
	document: handleDocumentOperation,
	notebook: handleNotebookOperation,
	search: handleSearchOperation,
	system: handleSystemOperation,
	tag: handleTagOperation,
};

export class SiYuan implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiYuan',
		name: 'siYuan',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:siyuan.svg',
		group: ['productivity'],
		version: 2,
		subtitle:
			'={{$parameter["resource"].charAt(0).toUpperCase() + $parameter["resource"].slice(1) + ": " + $parameter["operation"]}}',
		description:
			'Manage SiYuan notebooks, documents, blocks, attributes, and more. Designed for AI agent workflows.',
		defaults: {
			name: 'SiYuan',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'siYuanApi',
				required: true,
			},
		],
		properties: [
			// Resource selector (first dropdown)
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Asset',
						value: 'asset',
						description: 'Upload, download, list, rename, and delete files in the SiYuan workspace',
					},
					{
						name: 'Attribute',
						value: 'attribute',
						description: 'Get or set custom and built-in attributes on blocks',
					},
					{
						name: 'Block',
						value: 'block',
						description: 'Create, read, update, and delete content blocks within documents',
					},
					{
						name: 'Document',
						value: 'document',
						description: 'Create, rename, move, remove, and export documents',
					},
					{
						name: 'Notebook',
						value: 'notebook',
						description: 'Create, list, rename, and remove notebooks',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Query the SiYuan database using SQL',
					},
					{
						name: 'System',
						value: 'system',
						description: 'System utilities: version, notifications, Sprig templates, file listing',
					},
					{
						name: 'Tag',
						value: 'tag',
						description: 'Add, remove, list, rename, and search tags on blocks',
					},
				],
				default: 'document',
			},

			// Per-resource operation dropdowns
			assetOperations,
			attributeOperations,
			blockOperations,
			documentOperations,
			notebookOperations,
			searchOperations,
			systemOperations,
			tagOperations,

			// Per-resource parameter fields
			...assetFields,
			...attributeFields,
			...blockFields,
			...documentFields,
			...notebookFields,
			...searchFields,
			...systemFields,
			...tagFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('siYuanApi');
		const apiUrl = credentials.apiUrl as string;
		const apiToken = credentials.apiToken as string;

		if (!apiUrl || !apiToken) {
			throw new NodeOperationError(this.getNode(), 'SiYuan API URL and Token are required.', {
				itemIndex: 0,
			});
		}

		const client = new SiYuanClient(apiUrl, apiToken);

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				const handler = RESOURCE_HANDLERS[resource];
				if (!handler) {
					throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
						itemIndex,
					});
				}

				const result = await handler(client, operation, this, itemIndex);

				const jsonResult = (result == null ? { success: true } : result) as
					| IDataObject
					| IDataObject[];
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(jsonResult),
					{ itemData: { item: itemIndex } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const resource = this.getNodeParameter('resource', itemIndex, '') as string;
					const operation = this.getNodeParameter('operation', itemIndex, '') as string;
					const errorInfo = formatErrorForAgent(
						error as Error,
						`${resource}.${operation}`,
						`/api/${resource}/*`,
					);
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(errorInfo),
						{ itemData: { item: itemIndex } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return this.prepareOutputData(returnData);
	}
}
