// js/dorkParser.js - Smart Dork Query Parser and Serializer

const KNOWN_OPERATORS = [
    'site', 'filetype', 'ext', 'inurl', 'intitle', 'intext',
    'allinurl', 'allintitle', 'allintext', 'related', 'cache',
    'link', 'info', 'define', 'before', 'after', 'daterange', 'location'
];

/**
 * Normalizes an operator value and detects known types
 */
function resolveOperatorType(rawOp) {
    const isNegated = rawOp.startsWith('-');
    const baseOp = (isNegated ? rawOp.substring(1) : rawOp).toLowerCase().replace(':', '');
    if (KNOWN_OPERATORS.includes(baseOp)) {
        return {
            type: baseOp,
            operator: isNegated ? `-${baseOp}:` : `${baseOp}:`,
            isNegated
        };
    }
    return {
        type: 'custom',
        operator: rawOp.endsWith(':') ? rawOp : `${rawOp}:`,
        isNegated
    };
}

/**
 * Parse any raw search dork string into an array of block descriptors
 * @param {string} query
 * @returns {Array<{type: string, operator: string, value: string, placeholder?: string, description?: string}>}
 */
export function parseDorkQuery(query) {
    if (!query || typeof query !== 'string') return [];

    const trimmed = query.trim();
    if (!trimmed) return [];

    const blocks = [];

    // Token regex:
    // 1. -?operator:"value" or -?operator:value
    // 2. -"quoted string" or "quoted string"
    // 3. (group expression)
    // 4. Boolean operators: OR, AND, |
    // 5. Standalone words / negated words
    const tokenRegex = /(-?[a-zA-Z0-9_]+):(?:"([^"]*)"|([^\s\)]+))|(-?"[^"]*")|(\([^)]+\))|(\b(?:OR|AND)\b|\|)|([^\s]+)/g;

    let match;
    while ((match = tokenRegex.exec(trimmed)) !== null) {
        const [
            fullMatch,
            opName,
            opQuotedVal,
            opUnquotedVal,
            quotedString,
            groupString,
            booleanOp,
            plainWord
        ] = match;

        if (opName) {
            const val = opQuotedVal !== undefined ? opQuotedVal : opUnquotedVal;
            const opInfo = resolveOperatorType(opName);
            blocks.push({
                type: opInfo.type,
                operator: opInfo.operator,
                value: val || '',
                placeholder: `e.g. ${val || 'value'}`,
                description: `${opInfo.operator} search block`
            });
        } else if (quotedString) {
            const isNegated = quotedString.startsWith('-');
            const innerText = isNegated
                ? quotedString.slice(2, -1)
                : quotedString.slice(1, -1);
            blocks.push({
                type: isNegated ? 'negate-exact' : 'exact',
                operator: isNegated ? '-\"\"' : '\"\"',
                value: innerText,
                placeholder: 'Exact phrase...',
                description: isNegated ? 'Exclude exact phrase' : 'Exact phrase match'
            });
        } else if (groupString) {
            const innerGroup = groupString.slice(1, -1).trim();
            blocks.push({
                type: 'group',
                operator: '()',
                value: innerGroup,
                placeholder: 'e.g. inurl:admin OR inurl:login',
                description: 'Group sub-expression'
            });
        } else if (booleanOp) {
            blocks.push({
                type: 'logic',
                operator: booleanOp.toUpperCase(),
                value: '',
                placeholder: '',
                description: `Logical ${booleanOp.toUpperCase()}`
            });
        } else if (plainWord) {
            if (plainWord.startsWith('-') && plainWord.length > 1) {
                blocks.push({
                    type: 'negate',
                    operator: '-',
                    value: plainWord.substring(1),
                    placeholder: 'excluded term',
                    description: 'Exclude term'
                });
            } else {
                blocks.push({
                    type: 'custom',
                    operator: '',
                    value: plainWord,
                    placeholder: 'Keyword / term',
                    description: 'Plain keyword'
                });
            }
        }
    }

    return blocks;
}

/**
 * Serialize an array of block descriptors into a clean, normalized search dork string
 * @param {Array<{operator: string, value: string}>} blocks
 * @returns {string}
 */
export function serializeBlocksToQuery(blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) return '';

    const parts = [];

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const rawOp = (block.operator || '').trim();
        const rawVal = (block.value || '').trim();

        // Skip blocks with empty value (unless it is a standalone boolean operator)
        if (!rawVal && rawOp !== 'OR' && rawOp !== 'AND' && rawOp !== '|') {
            continue;
        }

        // Logic operator
        if (rawOp === 'OR' || rawOp === 'AND' || rawOp === '|') {
            parts.push(rawOp);
            continue;
        }

        // Exact phrase `""`
        if (rawOp === '""' || rawOp === '""') {
            const cleanVal = rawVal.replace(/^"+|"+$/g, '');
            parts.push(`"${cleanVal}"`);
            continue;
        }

        // Negated exact phrase `-\"\"`
        if (rawOp === '-\"\"' || rawOp === '-\"\"') {
            const cleanVal = rawVal.replace(/^"+|"+$/g, '');
            parts.push(`-"${cleanVal}"`);
            continue;
        }

        // Group `()`
        if (rawOp === '()') {
            const cleanVal = rawVal.replace(/^\(+|\)+$/g, '');
            parts.push(`(${cleanVal})`);
            continue;
        }

        // Negate `-`
        if (rawOp === '-') {
            // Avoid double dashes
            const cleanVal = rawVal.startsWith('-') ? rawVal.substring(1) : rawVal;
            parts.push(`-${cleanVal}`);
            continue;
        }

        // Operator with colon: e.g. `site:`
        if (rawOp.endsWith(':')) {
            // If user typed the operator inside value (e.g. site:example.com), clean it
            const prefixRegex = new RegExp(`^${rawOp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}`, 'i');
            let sanitizedVal = rawVal.replace(prefixRegex, '').trim();

            // Check if value contains spaces and is not quoted
            if (sanitizedVal.includes(' ') && !sanitizedVal.startsWith('"') && !sanitizedVal.startsWith('(')) {
                sanitizedVal = `"${sanitizedVal}"`;
            }

            parts.push(`${rawOp}${sanitizedVal}`);
            continue;
        }

        // Empty operator: plain keyword
        if (!rawOp) {
            parts.push(rawVal);
            continue;
        }

        // Other custom operator
        parts.push(`${rawOp}${rawVal}`);
    }

    return parts.join(' ').trim();
}
