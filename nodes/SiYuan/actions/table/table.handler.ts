import { NodeOperationError, type IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

export async function handleTableOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'create': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			const tableName = ctx.getNodeParameter('tableName', itemIndex) as string;
			const docPath = `/${tableName.replace(/^\/+|\/+$/g, '')}`;
			const allowUpdate = ctx.getNodeParameter('allowUpdate', itemIndex, false) as boolean;

			const existingIds = (await client.getIDsByHPath(docPath, notebookId)) || [];
			if (existingIds.length > 0) {
				if (!allowUpdate) {
					throw new NodeOperationError(
						ctx.getNode(),
						`Table "${tableName}" already exists in notebook "${name}". Enable "Allow Update" to replace it.`,
						{ itemIndex },
					);
				}
				await client.removeDocByID(existingIds[0]);
			}

			const id = await client.createDocWithMd(notebookId, docPath, '');
			return { id, notebookId, notebookName: name, tableName, path: docPath, created: Boolean(id), found: existingIds.length > 0 };
		}
		case 'list': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			const docs = await client.listDocsInNotebook(notebookId);
			return docs.map(({ id, name: docName, title, updated, isDir, isSymlink }) => ({
				id,
				table: title || docName.replace(/\.sy$/, ''),
				updated,
			}));
		}
		default:
			throw new Error(`Unsupported table operation: ${operation}`);
	}
}
