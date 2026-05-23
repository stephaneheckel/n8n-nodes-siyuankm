/* eslint-disable no-console */
/**
 * Integration test for the v2.1.2 fixes (issue #10 resurfaced on Document → Create
 * in v2.1.1; same primitive-return pattern as #4, #6, #9). Five operations still
 * passed raw strings through `returnJsonArray()`, causing n8n's Table view to split
 * each character into its own column.
 *
 * Confirms every handler now returns a named object (not a primitive):
 *   - document.create        → { id, notebookId, path, found }
 *   - document.exportMd      → { id, content }
 *   - block.getContentMd     → { id, content }
 *   - system.renderSprig     → { template, result }
 *   - asset.getFile          → { path, content }
 *
 * Usage:
 *   SIYUAN_URL=http://10.0.0.101:6806 SIYUAN_TOKEN=... pnpm tsx tests/integration/primitive-returns.test.ts
 */
import { SiYuanClient } from '../../lib/SiYuanClient';
import { handleDocumentOperation } from '../../nodes/SiYuan/actions/document/document.handler';
import { handleBlockOperation } from '../../nodes/SiYuan/actions/block/block.handler';
import { handleSystemOperation } from '../../nodes/SiYuan/actions/system/system.handler';
import { handleAssetOperation } from '../../nodes/SiYuan/actions/asset/asset.handler';

const url = process.env.SIYUAN_URL;
const token = process.env.SIYUAN_TOKEN;
if (!url || !token) {
	console.error('Set SIYUAN_URL and SIYUAN_TOKEN env vars.');
	process.exit(2);
}

const client = new SiYuanClient(url, token);

let failures = 0;
function ok(label: string) {
	console.log(`  ✓ ${label}`);
}
function fail(label: string, detail: unknown) {
	failures += 1;
	console.log(`  ✗ ${label}`);
	console.log(`     ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
}
function assert(cond: unknown, label: string, detail?: unknown) {
	if (cond) ok(label);
	else fail(label, detail);
}

function isPlainObject(v: unknown): boolean {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function makeCtx(params: Record<string, unknown>): any {
	return {
		getNodeParameter(name: string, _i: number, fallback?: unknown): unknown {
			if (name in params) return params[name];
			return fallback;
		},
		helpers: {
			// asset.uploadFile path isn't exercised here; getFile only.
		},
	};
}

async function main() {
	const notebookName = `n8n-prim-${Date.now()}`;
	console.log(`\n→ creating throwaway notebook "${notebookName}"`);
	const notebook = await client.createNotebook(notebookName);
	const notebookId = notebook.id;

	try {
		// -------------------------------------------------------------------
		// document.create — the operation in Stéphane's v2.1.1 screenshot
		// -------------------------------------------------------------------
		console.log('\n→ document.create returns named object, not raw doc ID');
		const create = (await handleDocumentOperation(
			client,
			'create',
			makeCtx({
				notebookId,
				docPath: '/prim-test',
				markdownContent: '# Primitive returns test\n\nBody.',
			}) as any,
			0,
		)) as Record<string, unknown>;
		assert(isPlainObject(create), 'returns a plain object', create);
		assert(typeof create.id === 'string' && (create.id as string).length > 0, 'id populated', create);
		assert(create.notebookId === notebookId, 'notebookId echoed', create);
		assert(create.path === '/prim-test', 'path echoed', create);
		assert(create.found === true, 'found=true', create);
		const docId = create.id as string;

		// -------------------------------------------------------------------
		// document.exportMd
		// -------------------------------------------------------------------
		console.log('\n→ document.exportMd returns { id, content }');
		const exp = (await handleDocumentOperation(
			client,
			'exportMd',
			makeCtx({ docId }) as any,
			0,
		)) as Record<string, unknown>;
		assert(isPlainObject(exp), 'returns a plain object', exp);
		assert(exp.id === docId, 'id echoed', exp);
		assert(typeof exp.content === 'string', 'content is a string', exp);
		assert((exp.content as string).includes('Primitive returns test'), 'content contains the body', exp);

		// -------------------------------------------------------------------
		// block.getContentMd — append a block first, then read it back
		// -------------------------------------------------------------------
		console.log('\n→ block.getContentMd returns { id, content }');
		const appended = await client.appendBlock(docId, '## Section\n\npara content', 'markdown');
		const newBlockId = appended?.[0]?.doOperations?.[0]?.id;
		assert(typeof newBlockId === 'string', 'appendBlock returned a new block id', appended);
		if (typeof newBlockId === 'string') {
			const blockContent = (await handleBlockOperation(
				client,
				'getContentMd',
				makeCtx({ blockId: newBlockId }) as any,
				0,
			)) as Record<string, unknown>;
			assert(isPlainObject(blockContent), 'returns a plain object', blockContent);
			assert(blockContent.id === newBlockId, 'id echoed', blockContent);
			assert(typeof blockContent.content === 'string', 'content is a string', blockContent);
		}

		// -------------------------------------------------------------------
		// system.renderSprig
		// -------------------------------------------------------------------
		console.log('\n→ system.renderSprig returns { template, result }');
		const sprig = (await handleSystemOperation(
			client,
			'renderSprig',
			makeCtx({ sprigTemplate: '{{ "hello" | upper }}' }) as any,
			0,
		)) as Record<string, unknown>;
		assert(isPlainObject(sprig), 'returns a plain object', sprig);
		assert(sprig.template === '{{ "hello" | upper }}', 'template echoed', sprig);
		assert(typeof sprig.result === 'string', 'result is a string', sprig);
		assert(sprig.result === 'HELLO', 'sprig rendered uppercase', sprig);

		// -------------------------------------------------------------------
		// asset.getFile — write a tiny file via putFile then read via getFile
		// -------------------------------------------------------------------
		console.log('\n→ asset.getFile returns { path, content }');
		const assetPath = `data/${notebookId}/n8n-prim.txt`;
		await client.putFile(assetPath, 'just-some-bytes', false);
		const got = (await handleAssetOperation(
			client,
			'getFile',
			makeCtx({ filePath: assetPath }) as any,
			0,
		)) as Record<string, unknown>;
		assert(isPlainObject(got), 'returns a plain object', got);
		assert(got.path === assetPath, 'path echoed', got);
		assert(typeof got.content === 'string', 'content is a string', got);
		assert((got.content as string).includes('just-some-bytes'), 'content roundtrip', got);
	} finally {
		console.log(`\n→ cleanup: removing notebook ${notebookId}`);
		try {
			await client.removeNotebook(notebookId);
			console.log('  cleanup ok');
		} catch (e) {
			console.log(`  cleanup failed: ${(e as Error).message}`);
		}
	}

	console.log(`\n${failures === 0 ? '✅ ALL CHECKS PASSED' : `❌ ${failures} CHECK(S) FAILED`}`);
	process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
	console.error('Unexpected error:', e);
	process.exit(1);
});
