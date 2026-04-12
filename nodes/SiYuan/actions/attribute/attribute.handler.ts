import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

export async function handleAttributeOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'get': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			return client.getBlockAttrs(blockId);
		}
		case 'set': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			const raw = ctx.getNodeParameter('attributes', itemIndex) as {
				attributeValues: Array<{ name: string; value: string }>;
			};
			const attrs: Record<string, string> = {};
			if (raw.attributeValues) {
				for (const pair of raw.attributeValues) {
					if (pair.name) {
						attrs[pair.name] = pair.value;
					}
				}
			}
			return client.setBlockAttrs(blockId, attrs);
		}
		default:
			throw new Error(`Unsupported attribute operation: ${operation}`);
	}
}
