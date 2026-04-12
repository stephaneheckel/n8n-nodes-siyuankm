import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class SiYuanApi implements ICredentialType {
	name = 'siYuanApi';
	displayName = 'SiYuan API';
	documentationUrl = 'https://github.com/siyuan-note/siyuan/blob/master/API.md';

	properties: INodeProperties[] = [
		{
			displayName: 'SiYuan API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'http://127.0.0.1:6806',
			placeholder: 'http://127.0.0.1:6806',
			description:
				'The base URL of your SiYuan kernel API. Default is http://127.0.0.1:6806 for a local instance.',
			required: true,
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Enter your SiYuan API token',
			description: 'Your SiYuan API token. Find it in SiYuan under Settings → About → API Token.',
			required: true,
		},
	];

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: '={{$credentials.apiUrl.replace(/\\/+$/, "")}}/api/notebook/lsNotebooks',
			headers: {
				'Content-Type': 'application/json',
				Authorization: '=Token {{$credentials.apiToken}}',
			},
			body: '{}',
		},
	};
}
