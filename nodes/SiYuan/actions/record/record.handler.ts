import { NodeOperationError, type IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

function globToRegex(pattern: string): RegExp {
	const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
	const regexStr = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
	return new RegExp(`^${regexStr}$`);
}

export async function handleRecordOperation(
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
			const recordKey = ctx.getNodeParameter('recordKey', itemIndex) as string;
			const value = ctx.getNodeParameter('value', itemIndex, '') as string;
			const docPath = `/${tableName.replace(/^\/+|\/+$/g, '')}/${recordKey.replace(/^\/+|\/+$/g, '')}`;
			const allowUpdate = ctx.getNodeParameter('allowUpdate', itemIndex, false) as boolean;

			const existingIds = (await client.getIDsByHPath(docPath, notebookId)) || [];
			if (existingIds.length > 0) {
				if (!allowUpdate) {
					throw new NodeOperationError(
						ctx.getNode(),
						`Record "${recordKey}" already exists in table "${tableName}". Enable "Allow Update" to overwrite it.`,
						{ itemIndex },
					);
				}
				await client.removeDocByID(existingIds[0]);
			}

			const id = await client.createDocWithMd(notebookId, docPath, value);
			return { id, notebookId, notebookName: name, tableName, recordKey, path: docPath, created: Boolean(id), found: existingIds.length > 0 };
		}
		case 'list': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			const tableName = ctx.getNodeParameter('tableName', itemIndex) as string;
			const keyFilter = ctx.getNodeParameter('keyFilter', itemIndex, '') as string;

			const docs = await client.listDocsInTable(notebookId, tableName);
			const keyRegex = keyFilter ? globToRegex(keyFilter) : null;

			return docs
				.filter((d) => (keyRegex ? keyRegex.test(d.title) : true))
				.map(({ id, title, updated }) => ({
					id,
					record: title,
					updated,
				}));
		}
		case 'read': {
			const name = ctx.getNodeParameter('notebookName', itemIndex) as string;
			const { id: notebookId } = await client.notebookByName(name);
			const tableName = ctx.getNodeParameter('tableName', itemIndex) as string;
			const recordKey = ctx.getNodeParameter('recordKey', itemIndex) as string;
			const docPath = `/${tableName.replace(/^\/+|\/+$/g, '')}/${recordKey.replace(/^\/+|\/+$/g, '')}`;

			const ids = (await client.getIDsByHPath(docPath, notebookId)) || [];
			if (ids.length === 0) {
				return { record: recordKey, content: '', found: false };
			}

			const raw = await client.getDocContent(ids[0]);
			// Strip SiYuan's YAML frontmatter and auto-generated heading
			const content = (raw ?? '')
				.replace(/^---[\s\S]*?---\n*/m, '') // remove frontmatter
				.replace(/^# .*\n*/m, '')             // remove first heading
				.trim();
			return { id: ids[0], record: recordKey, content, found: true };
		}
		default:
			throw new Error(`Unsupported record operation: ${operation}`);
	}
}
