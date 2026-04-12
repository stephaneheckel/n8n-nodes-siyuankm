import { NodeOperationError, type INode } from 'n8n-workflow';

/**
 * Maps common SiYuan API error patterns to human-readable suggestions.
 * Used by both the client error handler and input validation.
 */
const ERROR_SUGGESTIONS: Record<string, string> = {
	// Authentication
	'Auth failed': 'Check that your API token is correct in the SiYuan credential settings.',
	// Not found
	'block not found': 'Verify the block ID exists. Use Search → SQL Query to find valid block IDs.',
	'notebook not found':
		'Verify the notebook ID exists. Use Notebook → List to see all available notebooks.',
	// File errors
	'file not found': 'Check the file path is correct and starts with /.',
	// SQL
	SQL: 'Check your SQL syntax. SiYuan uses SQLite. Common tables: blocks, attributes.',
};

/**
 * Finds a suggestion for a given error message by matching known patterns.
 */
export function getSuggestionForError(errorMessage: string): string {
	for (const [pattern, suggestion] of Object.entries(ERROR_SUGGESTIONS)) {
		if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
			return suggestion;
		}
	}
	return 'Check the operation parameters and ensure SiYuan is running.';
}

/**
 * Formats an error for AI agent consumption with structured fields.
 */
export function formatErrorForAgent(
	error: Error,
	operation: string,
	endpoint: string,
): Record<string, string> {
	const message = error.message || 'Unknown error';
	return {
		error: message,
		operation,
		endpoint,
		suggestion: getSuggestionForError(message),
	};
}

/**
 * Validates that a required string parameter is non-empty.
 * Throws a NodeOperationError with a helpful message if validation fails.
 */
export function validateRequiredString(
	node: INode,
	value: string,
	paramName: string,
	itemIndex: number,
): void {
	if (!value || value.trim() === '') {
		throw new NodeOperationError(
			node,
			`The parameter "${paramName}" is required and cannot be empty.`,
			{ itemIndex },
		);
	}
}

/**
 * Validates that a string looks like a SiYuan ID (basic format check).
 * SiYuan IDs are typically 22 characters like "20210808180117-6v0mkxr".
 */
export function validateSiYuanId(
	node: INode,
	value: string,
	paramName: string,
	itemIndex: number,
): void {
	if (!value || value.trim() === '') {
		throw new NodeOperationError(
			node,
			`The parameter "${paramName}" is required. Provide a valid SiYuan ID (e.g., "20210808180117-6v0mkxr").`,
			{ itemIndex },
		);
	}
}

/**
 * Validates that a path starts with /.
 */
export function validatePath(
	node: INode,
	value: string,
	paramName: string,
	itemIndex: number,
): void {
	if (!value || !value.startsWith('/')) {
		throw new NodeOperationError(
			node,
			`The parameter "${paramName}" must be a path starting with "/" (e.g., "/My Notes/Topic").`,
			{ itemIndex },
		);
	}
}
