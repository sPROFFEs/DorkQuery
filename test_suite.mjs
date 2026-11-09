// test_suite.mjs - Unit tests for parser and presets
import { parseDorkQuery, serializeBlocksToQuery } from './js/dorkParser.js';
import { PRESETS_DATA, formatPresetQuery } from './js/presets.js';
import fs from 'fs';

console.log('--- Testing dorkParser ---');
const testQ = 'site:example.com inurl:admin filetype:php "internal password" -negated (ext:sql OR ext:bak)';
const parsed = parseDorkQuery(testQ);
console.log('Input:', testQ);
console.log('Parsed count:', parsed.length);
console.log('Parsed details:', parsed.map(p => `${p.operator}${p.value}`));

const serialized = serializeBlocksToQuery(parsed);
console.log('Serialized:', serialized);

if (parsed.length >= 6) {
    console.log('✓ dorkParser tests PASSED');
} else {
    console.error('✗ dorkParser failed');
    process.exit(1);
}

console.log('\n--- Testing presets ---');
console.log('Presets total:', PRESETS_DATA.length);
const sample = PRESETS_DATA[0];
const withTarget = formatPresetQuery(sample.query, 'acme.org');
const withoutTarget = formatPresetQuery(sample.query, '');
console.log('Sample with target:', withTarget);
console.log('Sample without target:', withoutTarget);

if (withTarget.includes('site:acme.org') && !withoutTarget.includes('{target}')) {
    console.log('✓ Presets formatting PASSED');
} else {
    console.error('✗ Presets formatting failed');
    process.exit(1);
}

console.log('\n--- Checking ghdb_clean.json ---');
const ghdbRaw = fs.readFileSync('data/ghdb_clean.json', 'utf8');
const ghdb = JSON.parse(ghdbRaw);
console.log('GHDB total entries:', ghdb.entries.length);
if (ghdb.entries.length === 7944) {
    console.log('✓ GHDB dataset verification PASSED');
} else {
    console.error('✗ GHDB dataset count mismatch');
    process.exit(1);
}

console.log('\n🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY!');
