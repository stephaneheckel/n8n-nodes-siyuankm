import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

function getDataType(ctx: IExecuteFunctions, itemIndex: number): 'markdown' | 'dom' {
	const options = ctx.getNodeParameter('additionalOptions', itemIndex, {}) as {
		dataType?: 'markdown' | 'dom';
	};
	return options.dataType || 'markdown';
}

export async function handleBlockOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'append': {
			const parentId = ctx.getNodeParameter('parentBlockId', itemIndex) as string;
			const data = ctx.getNodeParameter('blockData', itemIndex) as string;
			return client.appendBlock(parentId, data, getDataType(ctx, itemIndex));
		}
		case 'prepend': {
			const parentId = ctx.getNodeParameter('parentBlockId', itemIndex) as string;
			const data = ctx.getNodeParameter('blockData', itemIndex) as string;
			return client.prependBlock(parentId, data, getDataType(ctx, itemIndex));
		}
		case 'insert': {
			const parentId = ctx.getNodeParameter('parentBlockId', itemIndex) as string;
			const data = ctx.getNodeParameter('blockData', itemIndex) as string;
			const previousId = ctx.getNodeParameter('previousBlockId', itemIndex, '') as string;
			const nextId = ctx.getNodeParameter('nextBlockId', itemIndex, '') as string;
			return client.insertBlock(
				data,
				getDataType(ctx, itemIndex),
				previousId || undefined,
				nextId || undefined,
				parentId,
			);
		}
		case 'update': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			const data = ctx.getNodeParameter('blockData', itemIndex) as string;
			return client.updateBlock(blockId, data, getDataType(ctx, itemIndex));
		}
		case 'delete': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			return client.deleteBlock(blockId);
		}
		case 'getKramdown': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			return client.getBlockKramdown(blockId);
		}
		case 'getChildren': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			return client.getChildBlocks(blockId);
		}
		case 'move': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			const previousId = ctx.getNodeParameter('movePreviousId', itemIndex, '') as string;
			const parentId = ctx.getNodeParameter('moveParentId', itemIndex, '') as string;
			return client.moveBlock(blockId, previousId || undefined, parentId || undefined);
		}
		case 'fold': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			return client.foldBlock(blockId);
		}
		case 'unfold': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			return client.unfoldBlock(blockId);
		}
		case 'transferRef': {
			const fromId = ctx.getNodeParameter('transferFromId', itemIndex) as string;
			const toId = ctx.getNodeParameter('transferToId', itemIndex) as string;
			const options = ctx.getNodeParameter('transferOptions', itemIndex, {}) as {
				refIDs?: string;
			};
			const refIDs = options.refIDs
				? options.refIDs
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined;
			return client.transferBlockRef(fromId, toId, refIDs);
		}
		case 'getContentMd': {
			const blockId = ctx.getNodeParameter('blockId', itemIndex) as string;
			return client.getBlockContentMd(blockId);
		}
		default:
			throw new Error(`Unsupported block operation: ${operation}`);
	}
}
