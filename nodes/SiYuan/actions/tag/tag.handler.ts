import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

export async function handleTagOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'add': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			const tag = ctx.getNodeParameter('tag', itemIndex) as string;
			const tags = await client.addTag(blockId, tag);
			return { blockId, tags };
		}
		case 'remove': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			const tag = ctx.getNodeParameter('tag', itemIndex) as string;
			const tags = await client.removeTag(blockId, tag);
			return { blockId, tags };
		}
		case 'get': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			const tags = await client.getTagsForBlock(blockId);
			return { blockId, tags };
		}
		case 'listAll': {
			return client.listAllTags();
		}
		case 'rename': {
			const oldTag = ctx.getNodeParameter('oldTag', itemIndex) as string;
			const newTag = ctx.getNodeParameter('newTag', itemIndex) as string;
			const updatedCount = await client.renameTag(oldTag, newTag);
			return { oldTag, newTag, blocksUpdated: updatedCount };
		}
		case 'findBlocks': {
			const tag = ctx.getNodeParameter('tag', itemIndex) as string;
			return client.findBlocksByTag(tag);
		}
		default:
			throw new Error(`Unsupported tag operation: ${operation}`);
	}
}
