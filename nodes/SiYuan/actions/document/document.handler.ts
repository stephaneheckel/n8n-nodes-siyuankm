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
			const id = await client.createDocWithMd(notebookId, docPath, markdown);
			return { id, notebookId, path: docPath, found: Boolean(id) };
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
			const ids = (await client.getIDsByHPath(docPath, notebookId)) || [];
			return {
				notebookId,
				path: docPath,
				ids,
				count: ids.length,
				found: ids.length > 0,
				id: ids[0] ?? null,
			};
		}
		case 'getPathById': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			let path: string | null = null;
			try {
				const result = await client.getHPathByID(docId);
				path = result && result.length > 0 ? result : null;
			} catch {
				path = null;
			}
			return {
				id: docId,
				path,
				found: path !== null,
			};
		}
		case 'listInNotebook': {
			const notebookId = ctx.getNodeParameter('notebookId', itemIndex) as string;
			return client.listDocsInNotebook(notebookId);
		}
		case 'exportMd': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			const exported = await client.exportDocMd(docId);
			return {
				id: docId,
				content: exported?.content ?? '',
				hPath: exported?.hPath ?? '',
			};
		}
		case 'getStoragePath': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			let notebook: string | null = null;
			let storagePath: string | null = null;
			try {
				const result = await client.getPathByID(docId);
				if (result && result.path) {
					notebook = result.notebook;
					storagePath = result.path;
				}
			} catch {
				/* leave both null */
			}
			return {
				id: docId,
				notebook,
				storagePath,
				found: storagePath !== null,
			};
		}
		case 'getHPathByPath': {
			const notebookId = ctx.getNodeParameter('notebookId', itemIndex) as string;
			const storagePath = ctx.getNodeParameter('storagePath', itemIndex) as string;
			let path: string | null = null;
			try {
				const result = await client.getHPathByPath(notebookId, storagePath);
				path = result && result.length > 0 ? result : null;
			} catch {
				path = null;
			}
			return {
				notebookId,
				storagePath,
				path,
				found: path !== null,
			};
		}
		case 'getContent': {
			const docId = ctx.getNodeParameter('docId', itemIndex) as string;
			const content = await client.getDocContent(docId);
			return { id: docId, content: content ?? '' };
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
