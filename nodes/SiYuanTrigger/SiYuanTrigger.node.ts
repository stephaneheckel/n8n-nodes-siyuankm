import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';

import { SiYuanClient } from '../../lib/SiYuanClient';

interface BlockRow {
	id: string;
	root_id: string;
	parent_id: string;
	type: string;
	content: string;
	updated: string;
	[key: string]: unknown;
}

export class SiYuanTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiYuan Trigger',
		name: 'siYuanTrigger',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:siyuan.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers a workflow when documents or blocks are created or modified in SiYuan',
		defaults: {
			name: 'SiYuan Trigger',
		},
		polling: true,
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: ['main'],
		credentials: [{ name: 'siYuanApi', required: true }],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Document Changed',
						value: 'documentChanged',
						description: 'Triggers when any document is created or modified',
					},
					{
						name: 'Block Changed',
						value: 'blockChanged',
						description: 'Triggers when any block is created or modified',
					},
				],
				default: 'documentChanged',
			},
			{
				displayName: 'Notebook ID',
				name: 'notebookFilter',
				type: 'string',
				default: '',
				description:
					'Only trigger for changes in this notebook. Must be a notebook ID (use Notebook → List to find it). Leave empty to trigger for all notebooks. Document IDs and block IDs will not work here.',
			},
			{
				displayName: 'Max Results Per Poll',
				name: 'maxResults',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return per poll',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const credentials = await this.getCredentials('siYuanApi');
		const client = new SiYuanClient(credentials.apiUrl as string, credentials.apiToken as string);

		const event = this.getNodeParameter('event') as string;
		const notebookFilter = this.getNodeParameter('notebookFilter', '') as string;
		const maxResults = this.getNodeParameter('maxResults') as number;

		const staticData = this.getWorkflowStaticData('node');
		let lastTimestamp = (staticData.lastTimestamp as string) || '';

		// On first poll, get the current latest timestamp as baseline
		// This prevents returning all existing content as "new" changes
		if (!lastTimestamp) {
			try {
				const baseline = (await client.sqlQuery(
					'SELECT updated FROM blocks ORDER BY updated DESC LIMIT 1',
				)) as Array<{ updated: string }>;
				if (baseline.length > 0) {
					staticData.lastTimestamp = baseline[0].updated;
				}
			} catch {
				// If query fails, just return null and try again next poll
			}
			return null;
		}

		// Build query for changes since last poll
		const typeFilter = event === 'documentChanged' ? "type = 'd'" : "type != 'd'";
		const escapedTs = lastTimestamp.replace(/'/g, "''");
		let notebookClause = '';
		if (notebookFilter) {
			const escapedNb = notebookFilter.replace(/'/g, "''");
			notebookClause = ` AND box = '${escapedNb}'`;
		}

		const stmt =
			`SELECT * FROM blocks WHERE ${typeFilter} AND updated > '${escapedTs}'${notebookClause}` +
			` ORDER BY updated DESC LIMIT ${maxResults}`;

		let rows: BlockRow[];
		try {
			rows = (await client.sqlQuery(stmt)) as BlockRow[];
		} catch {
			return null;
		}

		if (!rows || rows.length === 0) {
			return null;
		}

		// Update timestamp to the newest result
		const newestTimestamp = rows[0].updated;
		if (newestTimestamp && newestTimestamp > lastTimestamp) {
			staticData.lastTimestamp = newestTimestamp;
		}

		const returnData: INodeExecutionData[] = rows.map((row) => ({
			json: row as unknown as IDataObject,
		}));

		return [returnData];
	}
}
