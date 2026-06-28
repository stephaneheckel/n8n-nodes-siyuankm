import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { SiYuanClient } from '../../lib/SiYuanClient';

export class SiYuanSearchTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiYuan Search Tool',
		name: 'siYuanSearchTool',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:siyuan.svg',
		group: ['productivity' as any],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Use this tool to search and query the SiYuan knowledge base. Use "fullText" to find content by keywords, "sqlQuery" for advanced database queries, "searchByTag" to find tagged blocks, or "searchByAttribute" to find blocks by attribute values.',
		defaults: {
			name: 'SiYuan Search Tool',
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
						name: 'Full-Text Search',
						value: 'fullText',
						description:
							'Search across all blocks using keywords. Returns matching blocks with content.',
						action: 'Full text search',
					},
					{
						name: 'Search by Attribute',
						value: 'searchByAttribute',
						description: 'Find blocks that have a specific attribute name and value',
						action: 'Search by attribute',
					},
					{
						name: 'Search by Tag',
						value: 'searchByTag',
						description: 'Find all blocks that have a specific tag',
						action: 'Search by tag',
					},
					{
						name: 'SQL Query',
						value: 'sqlQuery',
						description: 'Execute a custom SQL query against the SiYuan database',
						action: 'Execute a SQL query',
					},
				],
				default: 'fullText',
			},
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Enter search terms',
				description: 'The text to search for across all blocks',
				displayOptions: { show: { operation: ['fullText'] } },
			},
			{
				displayName: 'SQL Statement',
				name: 'sqlStatement',
				type: 'string',
				typeOptions: { rows: 4 },
				required: true,
				default: 'SELECT * FROM blocks LIMIT 10',
				description: 'A SQL query to run on the SiYuan database',
				displayOptions: { show: { operation: ['sqlQuery'] } },
			},
			{
				displayName: 'Tag',
				name: 'tag',
				type: 'string',
				required: true,
				default: '',
				description: 'The tag name to search for (without the # symbol)',
				displayOptions: { show: { operation: ['searchByTag'] } },
			},
			{
				displayName: 'Attribute Name',
				name: 'attributeName',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'custom-status',
				description: 'The name of the attribute to search for',
				displayOptions: { show: { operation: ['searchByAttribute'] } },
			},
			{
				displayName: 'Attribute Value',
				name: 'attributeValue',
				type: 'string',
				required: true,
				default: '',
				description: 'The attribute value to match (partial matches supported)',
				displayOptions: { show: { operation: ['searchByAttribute'] } },
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
					case 'fullText': {
						const query = this.getNodeParameter('searchQuery', i) as string;
						result = await client.fullTextSearch(query);
						break;
					}
					case 'sqlQuery': {
						const stmt = this.getNodeParameter('sqlStatement', i) as string;
						result = await client.sqlQuery(stmt);
						break;
					}
					case 'searchByTag': {
						const tag = this.getNodeParameter('tag', i) as string;
						result = await client.findBlocksByTag(tag);
						break;
					}
					case 'searchByAttribute': {
						const name = this.getNodeParameter('attributeName', i) as string;
						const value = this.getNodeParameter('attributeValue', i) as string;
						result = await client.searchByAttribute(name, value);
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
