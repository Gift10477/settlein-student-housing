const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '../..');
const spec = yaml.load(fs.readFileSync(path.join(root, 'openapi.yaml'), 'utf8'));
const json = JSON.stringify(spec, null, 2).replace(/</g, '\\u003c');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SettleIn Student Accommodation API</title>
  <style>body { margin: 0; padding: 0; }</style>
</head>
<body>
  <noscript>Enable JavaScript to view the API reference. The source contract is openapi.yaml.</noscript>
  <div id="redoc"><p>Loading API reference. Internet access is needed for the Redoc renderer.</p></div>
  <script id="openapi-spec" type="application/json">${json}</script>
  <script src="https://cdn.redocly.com/redoc/v2.5.4/bundles/redoc.standalone.js" integrity="sha384-w447zOpYfw/1Tv/5AK9NfHTlQIqE3RVR6KY62jCyy9zNDgO64cMwGGP1Fj0zJVf5" crossorigin="anonymous"></script>
  <script>
    Redoc.init(JSON.parse(document.getElementById('openapi-spec').textContent), {}, document.getElementById('redoc'));
  </script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'docs/index.html'), html);
console.log('Built docs/index.html from openapi.yaml');
