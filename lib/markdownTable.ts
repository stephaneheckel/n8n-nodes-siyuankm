export interface MarkdownTableColumn {
	name: string;
}

export interface MarkdownTableInfo {
	id: string;
	columns: MarkdownTableColumn[];
	rows: Record<string, string>[];
}

/** Escape a cell value so it can be safely embedded in a pipe-delimited Markdown row. */
function escapeCell(value: unknown): string {
	if (value === null || value === undefined) return '';
	return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/** Serialise a single row given an ordered list of column names and a row data object. */
function rowToMarkdown(columnNames: string[], rowData: Record<string, unknown>): string {
	const cells = columnNames.map((name) => escapeCell(rowData[name]));
	return '| ' + cells.join(' | ') + ' |';
}

/** Build a fresh Markdown table from a list of column names. */
export function buildMarkdownTable(columns: MarkdownTableColumn[]): string {
	if (columns.length === 0) {
		throw new Error('A Markdown table must have at least one column.');
	}
	const names = columns.map((c) => escapeCell(c.name));
	const header = '| ' + names.join(' | ') + ' |';
	const separator = '| ' + names.map(() => '---').join(' | ') + ' |';
	return header + '\n' + separator;
}

/** Parse Kramdown table source into structured columns and rows. */
export function parseMarkdownTable(id: string, kramdown: string): MarkdownTableInfo {
	const lines = kramdown
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l.startsWith('|'));

	if (lines.length < 2) {
		throw new Error('Invalid table: expected at least a header row and a separator row.');
	}

	const splitRow = (line: string): string[] =>
		line
			.replace(/^\|/, '')
			.replace(/\|$/, '')
			.split(/(?<!\\)\|/)
			.map((cell) => cell.replace(/\\\|/g, '|').trim());

	const columnNames = splitRow(lines[0]);
	const columns: MarkdownTableColumn[] = columnNames.map((name) => ({ name }));

	const rows: Record<string, string>[] = [];
	for (let i = 2; i < lines.length; i++) {
		const cells = splitRow(lines[i]);
		const row: Record<string, string> = {};
		columnNames.forEach((col, idx) => {
			row[col] = cells[idx] ?? '';
		});
		rows.push(row);
	}

	return { id, columns, rows };
}

/** Insert a row into a kramdown table source string at the given 0-based row index (excluding header). */
export function insertRowIntoMarkdownTable(
	kramdown: string,
	rowData: Record<string, unknown>,
	rowIndex?: number,
): string {
	const info = parseMarkdownTable('', kramdown);
	const columnNames = info.columns.map((c) => c.name);
	const newRow = rowToMarkdown(columnNames, rowData);

	const lines = kramdown.split('\n');
	const tableLineIndices: number[] = [];
	lines.forEach((line, idx) => {
		if (line.trim().startsWith('|')) tableLineIndices.push(idx);
	});

	if (tableLineIndices.length < 2) {
		throw new Error('Invalid table format.');
	}

	if (rowIndex === undefined || rowIndex < 0 || rowIndex > info.rows.length) {
		const insertAfter = tableLineIndices[tableLineIndices.length - 1];
		lines.splice(insertAfter + 1, 0, newRow);
	} else {
		const insertAt = tableLineIndices[1 + rowIndex] ?? tableLineIndices[tableLineIndices.length - 1] + 1;
		lines.splice(insertAt + 1, 0, newRow);
	}

	return lines.join('\n');
}

/** Replace a row in a kramdown table source string by 0-based row index (excluding header). */
export function updateRowInMarkdownTable(
	kramdown: string,
	rowIndex: number,
	rowData: Record<string, unknown>,
): string {
	const info = parseMarkdownTable('', kramdown);
	const columnNames = info.columns.map((c) => c.name);

	if (rowIndex < 0 || rowIndex >= info.rows.length) {
		throw new Error(`Row index ${rowIndex} is out of bounds (table has ${info.rows.length} row(s)).`);
	}

	const merged: Record<string, unknown> = { ...info.rows[rowIndex], ...rowData };
	const newRow = rowToMarkdown(columnNames, merged);

	const lines = kramdown.split('\n');
	const tableLineIndices: number[] = [];
	lines.forEach((line, idx) => {
		if (line.trim().startsWith('|')) tableLineIndices.push(idx);
	});

	const target = tableLineIndices[2 + rowIndex];
	if (target === undefined) {
		throw new Error(`Row index ${rowIndex} could not be located in the source.`);
	}
	lines[target] = newRow;
	return lines.join('\n');
}

/** Remove a row from a kramdown table source string by 0-based row index (excluding header). */
export function deleteRowFromMarkdownTable(kramdown: string, rowIndex: number): string {
	const info = parseMarkdownTable('', kramdown);

	if (rowIndex < 0 || rowIndex >= info.rows.length) {
		throw new Error(`Row index ${rowIndex} is out of bounds (table has ${info.rows.length} row(s)).`);
	}

	const lines = kramdown.split('\n');
	const tableLineIndices: number[] = [];
	lines.forEach((line, idx) => {
		if (line.trim().startsWith('|')) tableLineIndices.push(idx);
	});

	const target = tableLineIndices[2 + rowIndex];
	if (target === undefined) {
		throw new Error(`Row index ${rowIndex} could not be located in the source.`);
	}
	lines.splice(target, 1);
	return lines.join('\n');
}
