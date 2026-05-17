import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';
import {
	buildMarkdownTable,
	parseMarkdownTable,
	insertRowIntoMarkdownTable,
	updateRowInMarkdownTable,
	deleteRowFromMarkdownTable,
	MarkdownTableColumn,
} from '../../../../lib/markdownTable';

interface ColumnInput {
	columnValues?: Array<{ name: string }>;
}

interface RowInput {
	cells?: Array<{ columnName: string; value: string }>;
}

function rowInputToObject(input: RowInput): Record<string, string> {
	const out: Record<string, string> = {};
	for (const cell of input.cells || []) {
		if (cell.columnName) out[cell.columnName] = cell.value ?? '';
	}
	return out;
}

export async function handleMarkdownTableOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'create': {
			const parentBlockId = ctx.getNodeParameter('parentBlockId', itemIndex) as string;
			const columnsRaw = ctx.getNodeParameter('columns', itemIndex) as ColumnInput;
			const columns: MarkdownTableColumn[] = (columnsRaw.columnValues || [])
				.filter((c) => c.name)
				.map((c) => ({ name: c.name }));

			const markdown = buildMarkdownTable(columns);
			const result = await client.appendBlock(parentBlockId, markdown, 'markdown');

			const newBlockId = result?.[0]?.doOperations?.[0]?.id ?? null;
			return {
				parentBlockId,
				tableBlockId: newBlockId,
				columns,
				appendResult: result,
			};
		}

		case 'get': {
			const tableBlockId = ctx.getNodeParameter('tableBlockId', itemIndex) as string;
			const { kramdown } = await client.getBlockKramdown(tableBlockId);
			return parseMarkdownTable(tableBlockId, kramdown);
		}

		case 'addRow': {
			const tableBlockId = ctx.getNodeParameter('tableBlockId', itemIndex) as string;
			const rowDataRaw = ctx.getNodeParameter('rowData', itemIndex) as RowInput;
			const rowData = rowInputToObject(rowDataRaw);

			const { kramdown } = await client.getBlockKramdown(tableBlockId);
			const updatedSource = insertRowIntoMarkdownTable(kramdown, rowData);
			await client.updateBlock(tableBlockId, updatedSource, 'markdown');

			const info = parseMarkdownTable(tableBlockId, updatedSource);
			return {
				tableBlockId,
				rowIndex: info.rows.length - 1,
				rowData,
				rowCount: info.rows.length,
			};
		}

		case 'updateRow': {
			const tableBlockId = ctx.getNodeParameter('tableBlockId', itemIndex) as string;
			const rowIndex = ctx.getNodeParameter('rowIndex', itemIndex) as number;
			const rowDataRaw = ctx.getNodeParameter('rowData', itemIndex) as RowInput;
			const rowData = rowInputToObject(rowDataRaw);

			const { kramdown } = await client.getBlockKramdown(tableBlockId);
			const updatedSource = updateRowInMarkdownTable(kramdown, rowIndex, rowData);
			await client.updateBlock(tableBlockId, updatedSource, 'markdown');

			return {
				tableBlockId,
				rowIndex,
				rowData,
			};
		}

		case 'deleteRow': {
			const tableBlockId = ctx.getNodeParameter('tableBlockId', itemIndex) as string;
			const rowIndex = ctx.getNodeParameter('rowIndex', itemIndex) as number;

			const { kramdown } = await client.getBlockKramdown(tableBlockId);
			const updatedSource = deleteRowFromMarkdownTable(kramdown, rowIndex);
			await client.updateBlock(tableBlockId, updatedSource, 'markdown');

			const info = parseMarkdownTable(tableBlockId, updatedSource);
			return {
				tableBlockId,
				deletedRowIndex: rowIndex,
				rowCount: info.rows.length,
			};
		}

		default:
			throw new Error(`Unsupported markdownTable operation: ${operation}`);
	}
}
