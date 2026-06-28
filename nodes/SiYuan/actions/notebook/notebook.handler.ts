import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';
import type { SiYuanNotebookConf } from '../../../../lib/interfaces';

export async function handleNotebookOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'create': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			// Check for duplicate before creating
			const existing = await client.listNotebooks();
			if (existing.some((n) => n.name === name)) {
				throw new Error(
					`A notebook named "${name}" already exists. Choose a different name or rename the existing one.`,
				);
			}
			return client.createNotebook(name);
		}
		case 'list': {
			return client.listNotebooks();
		}
		case 'rename': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const newName = ctx.getNodeParameter('newName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			return client.renameNotebook(notebookId, newName);
		}
		case 'remove': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			return client.removeNotebook(notebookId);
		}
		case 'open': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			return client.openNotebook(notebookId);
		}
		case 'close': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			return client.closeNotebook(notebookId);
		}
		case 'getConf': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			return client.getNotebookConf(notebookId);
		}
		case 'setConf': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			const confInput = ctx.getNodeParameter('notebookConf', itemIndex);
			// Parse JSON string if needed (n8n json type may return string or object)
			const confChanges: Partial<SiYuanNotebookConf> =
				typeof confInput === 'string' ? JSON.parse(confInput) : confInput;
			// Get current config first, merge changes, send back the full object
			const current = await client.getNotebookConf(notebookId);
			const mergedConf = { ...current.conf, ...confChanges };
			return client.setNotebookConf(notebookId, mergedConf);
		}
		default:
			throw new Error(`Unsupported notebook operation: ${operation}`);
	}
}
