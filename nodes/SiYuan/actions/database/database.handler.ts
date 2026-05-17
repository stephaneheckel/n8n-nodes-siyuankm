import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';
import type { AttributeViewKeyType } from '../../../../lib/interfaces';

export async function handleDatabaseOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'list': {
			const databases = await client.listDatabaseBlocks();
			return { databases, count: databases.length };
		}

		case 'create': {
			const parentBlockId = ctx.getNodeParameter('parentBlockId', itemIndex) as string;
			return client.createDatabaseBlock(parentBlockId);
		}

		case 'get': {
			const avId = ctx.getNodeParameter('avId', itemIndex) as string;
			return client.renderDatabase(avId);
		}

		case 'getSchema': {
			const avId = ctx.getNodeParameter('avId', itemIndex) as string;
			const view = await client.renderDatabase(avId);
			return {
				id: view.id,
				name: view.name,
				viewID: view.viewID,
				viewType: view.viewType,
				columns: view.columns,
			};
		}

		case 'addRow': {
			const avId = ctx.getNodeParameter('avId', itemIndex) as string;
			const databaseBlockId = ctx.getNodeParameter('databaseBlockId', itemIndex) as string;
			const primaryContent = ctx.getNodeParameter('primaryKeyContent', itemIndex, '') as string;
			const { rowID } = await client.addDatabaseRow(avId, databaseBlockId, primaryContent);
			return { avID: avId, rowID, primaryKeyContent: primaryContent };
		}

		case 'removeRow': {
			const avId = ctx.getNodeParameter('avId', itemIndex) as string;
			const rowId = ctx.getNodeParameter('rowId', itemIndex) as string;
			await client.removeDatabaseRows(avId, [rowId]);
			return { avID: avId, removedRowID: rowId };
		}

		case 'addColumn': {
			const avId = ctx.getNodeParameter('avId', itemIndex) as string;
			const columnName = ctx.getNodeParameter('columnName', itemIndex) as string;
			const columnType = ctx.getNodeParameter('columnType', itemIndex) as AttributeViewKeyType;
			const previousKeyId = ctx.getNodeParameter('previousKeyId', itemIndex, '') as string;
			const { keyID } = await client.addDatabaseColumn(avId, columnName, columnType, previousKeyId);
			return { avID: avId, keyID, name: columnName, type: columnType };
		}

		case 'removeColumn': {
			const avId = ctx.getNodeParameter('avId', itemIndex) as string;
			const keyId = ctx.getNodeParameter('keyId', itemIndex) as string;
			await client.removeDatabaseColumn(avId, keyId);
			return { avID: avId, removedKeyID: keyId };
		}

		case 'setCell': {
			const avId = ctx.getNodeParameter('avId', itemIndex) as string;
			const rowId = ctx.getNodeParameter('rowId', itemIndex) as string;
			const keyId = ctx.getNodeParameter('keyId', itemIndex) as string;
			const cellValue = ctx.getNodeParameter('cellValue', itemIndex, '') as string;
			const result = await client.setDatabaseCell(avId, rowId, keyId, cellValue);
			return { avID: avId, rowID: rowId, keyID: keyId, result };
		}

		default:
			throw new Error(`Unsupported database operation: ${operation}`);
	}
}
