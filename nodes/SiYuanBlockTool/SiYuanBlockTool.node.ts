import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { SiYuanClient } from '../../lib/SiYuanClient';

export class SiYuanBlockTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiYuan Block Tool',
		name: 'siYuanBlockTool',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:siyuan.svg',
		group: ['productivity'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Use this tool to create, read, update, move, and delete content blocks within SiYuan documents. Use "append" to add content to a document, "getContentMd" to read a block, or "update" to modify existing content.',
		defaults: {
			name: 'SiYuan Block Tool',
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
						name: 'Append',
						value: 'append',
						description: 'Add a Markdown block to the end of a parent block or document',
						action: 'Append a block',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Permanently remove a block by its ID',
						action: 'Delete a block',
					},
					{
						name: 'Get Child Blocks',
						value: 'getChildren',
						description: 'List direct child blocks under a parent block',
						action: 'Get child blocks',
					},
					{
						name: 'Get Content (Markdown)',
						value: 'getContentMd',
						description: 'Read the Markdown content of a specific block',
						action: 'Get block content',
					},
					{
						name: 'Move',
						value: 'move',
						description: 'Move a block to a new position within a document',
						action: 'Move a block',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Replace the content of an existing block with new Markdown',
						action: 'Update a block',
					},
				],
				default: 'append',
			},
			{
				displayName: 'Block ID',
				name: 'blockId',
				type: 'string',
				required: true,
				default: '',
				description: 'The unique ID of the block',
				displayOptions: {
					show: { operation: ['update', 'delete', 'getContentMd', 'getChildren', 'move'] },
				},
			},
			{
				displayName: 'Parent Block ID',
				name: 'parentBlockId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the parent block (document or container) to add content into',
				displayOptions: { show: { operation: ['append'] } },
			},
			{
				displayName: 'Content (Markdown)',
				name: 'blockData',
				type: 'string',
				typeOptions: { rows: 6 },
				required: true,
				default: '',
				description: 'The Markdown content for the block',
				displayOptions: { show: { operation: ['append', 'update'] } },
			},
			{
				displayName: 'Move After Block ID',
				name: 'movePreviousId',
				type: 'string',
				default: '',
				description: 'Place the block after this sibling block',
				displayOptions: { show: { operation: ['move'] } },
			},
			{
				displayName: 'Move Under Parent ID',
				name: 'moveParentId',
				type: 'string',
				default: '',
				description: 'Place the block as a child of this parent',
				displayOptions: { show: { operation: ['move'] } },
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
					case 'append': {
						const parentId = this.getNodeParameter('parentBlockId', i) as string;
						const data = this.getNodeParameter('blockData', i) as string;
						result = await client.appendBlock(parentId, data);
						break;
					}
					case 'update': {
						const blockId = this.getNodeParameter('blockId', i) as string;
						const data = this.getNodeParameter('blockData', i) as string;
						result = await client.updateBlock(blockId, data);
						break;
					}
					case 'delete': {
						const blockId = this.getNodeParameter('blockId', i) as string;
						result = await client.deleteBlock(blockId);
						break;
					}
					case 'getContentMd': {
						const blockId = this.getNodeParameter('blockId', i) as string;
						result = await client.getBlockContentMd(blockId);
						break;
					}
					case 'getChildren': {
						const blockId = this.getNodeParameter('blockId', i) as string;
						result = await client.getChildBlocks(blockId);
						break;
					}
					case 'move': {
						const blockId = this.getNodeParameter('blockId', i) as string;
						const prevId = this.getNodeParameter('movePreviousId', i, '') as string;
						const parentId = this.getNodeParameter('moveParentId', i, '') as string;
						result = await client.moveBlock(blockId, prevId || undefined, parentId || undefined);
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
