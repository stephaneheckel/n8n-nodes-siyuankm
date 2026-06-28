import { type IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

export async function handleRecordOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'list': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			const tableName = ctx.getNodeParameter('tableName', itemIndex) as string;
			return client.listDocsInTable(notebookId, tableName);
		}
		default:
			throw new Error(`Unsupported record operation: ${operation}`);
	}
}
