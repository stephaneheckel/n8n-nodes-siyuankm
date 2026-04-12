import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

export async function handleSearchOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'sqlQuery': {
			const stmt = ctx.getNodeParameter('sqlStatement', itemIndex) as string;
			return client.sqlQuery(stmt);
		}
		case 'fullText': {
			const query = ctx.getNodeParameter('searchQuery', itemIndex) as string;
			return client.fullTextSearch(query);
		}
		case 'searchByAttribute': {
			const name = ctx.getNodeParameter('attributeName', itemIndex) as string;
			const value = ctx.getNodeParameter('attributeValue', itemIndex) as string;
			return client.searchByAttribute(name, value);
		}
		case 'recentChanges': {
			const limit = ctx.getNodeParameter('limit', itemIndex) as number;
			const options = ctx.getNodeParameter('recentOptions', itemIndex, {}) as {
				since?: string;
			};
			return client.getRecentChanges(limit, options.since || undefined);
		}
		default:
			throw new Error(`Unsupported search operation: ${operation}`);
	}
}
