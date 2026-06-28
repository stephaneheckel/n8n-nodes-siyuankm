import { type IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

export async function handleTableOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'list': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			return client.listDocsInNotebook(notebookId);
		}
		default:
			throw new Error(`Unsupported table operation: ${operation}`);
	}
}
