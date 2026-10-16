const fs = require('fs');
const [jsonFile, htmlFile] = process.argv.slice(2);
if (!jsonFile || !htmlFile) {
  console.error('Usage: node update-html.cjs dialogue-data.json dialogue-journey.html');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
if (data.version !== 1 || !Array.isArray(data.towns) || !Array.isArray(data.stages)) {
  throw new Error('Expected version 1 dialogue content. Use browser import to validate the full schema first.');
}
const html = fs.readFileSync(htmlFile, 'utf8');
const start = html.indexOf('const ORIGINAL=');
const end = html.indexOf(';\nlet data=ORIGINAL;', start);
if (start < 0 || end < 0) throw new Error('Cannot find the embedded data boundaries.');
const updated = html.slice(0, start) + 'const ORIGINAL=' + JSON.stringify(data).replace(/</g, '\\u003c') + html.slice(end);
fs.writeFileSync(htmlFile, updated, 'utf8');
console.log('Updated embedded dialogue content.');
