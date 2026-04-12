import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

export async function handleDocumentOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'create': {
			const notebookId = ctx.getNodeParameter('notebookId', itemIndex) as string;
			const docPath = ctx.getNodeParameter('docPath', itemIndex) as string;
			const markdown = ctx.getNodeParameter('markdownContent', itemIndex) as string;
			return client.createDocWithMd(notebookId, docPath, markdown);
		}
		case 'rename': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			const newTitle = ctx.getNodeParameter('newTitle', itemIndex) as string;
			return client.renameDocByID(docId, newTitle);
		}
		case 'remove': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			return client.removeDocByID(docId);
		}
		case 'move': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			const targetParentId = ctx.getNodeParameter('targetParentId', itemIndex) as string;
			return client.moveDocsByID([docId], targetParentId);
		}
		case 'getIdByPath': {
			const notebookId = ctx.getNodeParameter('notebookId', itemIndex) as string;
			const docPath = ctx.getNodeParameter('docPath', itemIndex) as string;
			return client.getIDsByHPath(docPath, notebookId);
		}
		case 'getPathById': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			return client.getHPathByID(docId);
		}
		case 'listInNotebook': {
			const notebookId = ctx.getNodeParameter('notebookId', itemIndex) as string;
			return client.listDocsInNotebook(notebookId);
		}
		case 'exportMd': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			return client.exportDocMd(docId);
		}
		case 'getStoragePath': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			return client.getPathByID(docId);
		}
		case 'getHPathByPath': {
			const notebookId = ctx.getNodeParameter('notebookId', itemIndex) as string;
			const storagePath = ctx.getNodeParameter('storagePath', itemIndex) as string;
			return client.getHPathByPath(notebookId, storagePath);
		}
		case 'getContent': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			return client.getDocContent(docId);
		}
		case 'getTree': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			const options = ctx.getNodeParameter('additionalOptions', itemIndex, {}) as {
				maxDepth?: number;
			};
			return client.getDocumentTree(docId, options.maxDepth || 10);
		}
		default:
			throw new Error(`Unsupported document operation: ${operation}`);
	}
}
