import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

export async function handleSystemOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'getVersion': {
			const version = await client.getVersion();
			return { version };
		}
		case 'getCurrentTime': {
			const servertime = await client.getCurrentTime();
			return { servertime };
		}
		case 'pushMsg': {
			const message = ctx.getNodeParameter('message', itemIndex) as string;
			const timeout = ctx.getNodeParameter('timeout', itemIndex) as number;
			return client.pushMsg(message, timeout);
		}
		case 'pushErrMsg': {
			const message = ctx.getNodeParameter('message', itemIndex) as string;
			const timeout = ctx.getNodeParameter('timeout', itemIndex) as number;
			return client.pushErrMsg(message, timeout);
		}
		case 'renderSprig': {
			const template = ctx.getNodeParameter('sprigTemplate', itemIndex) as string;
			return client.renderSprig(template);
		}
		case 'exportResources': {
			const pathsStr = ctx.getNodeParameter('exportPaths', itemIndex) as string;
			const paths = pathsStr
				.split(',')
				.map((p) => p.trim())
				.filter(Boolean);
			const options = ctx.getNodeParameter('exportOptions', itemIndex, {}) as {
				exportName?: string;
			};
			return client.exportResources(paths, options.exportName || undefined);
		}
		default:
			throw new Error(`Unsupported system operation: ${operation}`);
	}
}
