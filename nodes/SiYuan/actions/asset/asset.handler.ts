import type { IExecuteFunctions } from 'n8n-workflow';
import type { SiYuanClient } from '../../../../lib/SiYuanClient';

export async function handleAssetOperation(
	client: SiYuanClient,
	operation: string,
	ctx: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	switch (operation) {
		case 'listFiles': {
			const path = ctx.getNodeParameter('directoryPath', itemIndex) as string;
			return client.listFilesInDirectory(path);
		}
		case 'getFile': {
			const path = ctx.getNodeParameter('filePath', itemIndex) as string;
			return client.getFile(path);
		}
		case 'putFile': {
			const path = ctx.getNodeParameter('filePath', itemIndex) as string;
			const content = ctx.getNodeParameter('fileContent', itemIndex) as string;
			const options = ctx.getNodeParameter('putFileOptions', itemIndex, {}) as {
				isDir?: boolean;
			};
			return client.putFile(path, content, options.isDir || false);
		}
		case 'removeFile': {
			const path = ctx.getNodeParameter('filePath', itemIndex) as string;
			return client.removeFile(path);
		}
		case 'renameFile': {
			const currentPath = ctx.getNodeParameter('currentPath', itemIndex) as string;
			const newPath = ctx.getNodeParameter('newPath', itemIndex) as string;
			return client.renameFile(currentPath, newPath);
		}
		case 'upload': {
			const assetsDirPath = ctx.getNodeParameter('assetsDirPath', itemIndex) as string;
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', itemIndex) as string;
			const binaryData = ctx.helpers.assertBinaryData(itemIndex, binaryPropertyName);
			const buffer = await ctx.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
			const fileName = binaryData.fileName || 'upload';
			return client.uploadAsset(assetsDirPath, buffer, fileName);
		}
		default:
			throw new Error(`Unsupported asset operation: ${operation}`);
	}
}
