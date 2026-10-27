const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '../..');
const spec = yaml.load(fs.readFileSync(path.join(root, 'openapi.yaml'), 'utf8'));

test('OpenAPI declares the actual API-key header and global security', () => {
  expect(spec.components.securitySchemes.apiKeyAuth).toMatchObject({ type: 'apiKey', in: 'header', name: 'X-API-Key' });
  expect(spec.security).toEqual([{ apiKeyAuth: [] }]);
});
test('every documented operation declares 401 and 429 responses', () => {
  for (const item of Object.values(spec.paths)) {
    for (const [method, operation] of Object.entries(item)) {
      if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) continue;
      expect(operation.responses['401']).toEqual({ $ref: '#/components/responses/Unauthorized' });
      expect(operation.responses['429']).toEqual({ $ref: '#/components/responses/TooManyRequests' });
    }
  }
  expect(spec.components.responses.Unauthorized.content['application/json'].examples.missingOrInvalidApiKey.value)
    .toEqual({ message: 'Missing or invalid API key' });
  expect(spec.components.responses.TooManyRequests.headers['Retry-After'].schema.type).toBe('integer');
  expect(spec.components.responses.TooManyRequests.content['application/json'].example)
    .toEqual({ message: 'Too many requests, please try again later.' });
});
test('rendered documentation embeds the current contract exactly', () => {
  const html = fs.readFileSync(path.join(root, 'docs/index.html'), 'utf8');
  const match = /<script id="openapi-spec" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
  expect(match).not.toBeNull();
  expect(JSON.parse(match[1])).toEqual(spec);
  expect(html).toContain('Redoc.init(');
});
