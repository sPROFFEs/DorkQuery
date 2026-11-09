// js/blockManager.js - Advanced Workspace & Palette Management

import { qs, createElement } from './domUtils.js';
import { parseDorkQuery, serializeBlocksToQuery } from './dorkParser.js';
import { showToast } from './toast.js';

export const OPERATOR_PALETTE_CATEGORIES = [
    {
        name: 'Core Operators',
        icon: '📌',
        blocks: [
            { id: 'site', type: 'site', operator: 'site:', placeholder: 'example.com', description: 'Restrict search to a specific website or domain.', suggestions: ['github.com', 'pastebin.com', 's3.amazonaws.com', '*.gov', '*.edu'] },
            { id: 'inurl', type: 'inurl', operator: 'inurl:', placeholder: 'admin', description: 'Search for terms contained within the URL path.', suggestions: ['admin', 'login', 'wp-content', 'api/v1', 'backup', 'config'] },
            { id: 'intitle', type: 'intitle', operator: 'intitle:', placeholder: 'index of /', description: 'Search for terms in the webpage HTML title tag.', suggestions: ['"index of /"', '"admin login"', '"dashboard"', '"phpinfo()"', '"webcam"'] },
            { id: 'intext', type: 'intext', operator: 'intext:', placeholder: 'password', description: 'Search for terms inside the visible page body text.', suggestions: ['"root password"', '"api_key"', '"confidential"', '"BEGIN PRIVATE KEY"'] },
            { id: 'filetype', type: 'filetype', operator: 'filetype:', placeholder: 'pdf', description: 'Filter by specific file extension (pdf, env, sql, etc).', suggestions: ['env', 'sql', 'pdf', 'log', 'bak', 'yml', 'json', 'xml'] },
            { id: 'ext', type: 'ext', operator: 'ext:', placeholder: 'sql', description: 'Synonym for filetype (find specific file extensions).', suggestions: ['sql', 'conf', 'ini', 'key', 'pem', 'db', 'sqlite'] }
        ]
    },
    {
        name: 'Advanced & Strict',
        icon: '⚡',
        blocks: [
            { id: 'allinurl', type: 'allinurl', operator: 'allinurl:', placeholder: 'admin login', description: 'Requires ALL specified words to appear in the URL.', suggestions: ['admin login', 'wp-content plugins', 'api tokens'] },
            { id: 'allintitle', type: 'allintitle', operator: 'allintitle:', placeholder: 'index of database', description: 'Requires ALL specified words to appear in the title.', suggestions: ['index of backup', 'login dashboard', 'camera live view'] },
            { id: 'allintext', type: 'allintext', operator: 'allintext:', placeholder: 'secret token password', description: 'Requires ALL words to appear in the body text.', suggestions: ['username password email', 'database connection string'] },
            { id: 'related', type: 'related', operator: 'related:', placeholder: 'example.com', description: 'Discover websites similar or related to the specified domain.', suggestions: ['target.com'] },
            { id: 'cache', type: 'cache', operator: 'cache:', placeholder: 'example.com', description: 'View Google\'s most recent cached snapshot of a URL.', suggestions: ['target.com/page'] }
        ]
    },
    {
        name: 'Logic & Modifiers',
        icon: '🧩',
        blocks: [
            { id: 'exact', type: 'exact', operator: '\"\"', placeholder: 'exact phrase', description: 'Exact phrase match. Surrounds words in double quotes.', suggestions: ['"internal only"', '"strictly private"', '"unauthorized access"'] },
            { id: 'negate', type: 'negate', operator: '-', placeholder: 'exclude-term', description: 'Negation: exclude results containing this term or operator.', suggestions: ['-site:github.com', '-inurl:test', '-wordpress'] },
            { id: 'or_logic', type: 'logic', operator: 'OR', placeholder: '', description: 'Logical OR: match either this term or the next term.', isAtomic: true },
            { id: 'wildcard', type: 'wildcard', operator: '*', placeholder: '', description: 'Wildcard: matches any word or phrase.', isAtomic: true },
            { id: 'group', type: 'group', operator: '()', placeholder: 'term1 OR term2', description: 'Grouping: group sub-expressions with parentheses.', suggestions: ['inurl:admin OR inurl:login', 'filetype:sql OR filetype:env'] },
            { id: 'after', type: 'after', operator: 'after:', placeholder: '2024-01-01', description: 'Show results published or indexed after YYYY-MM-DD.', suggestions: ['2024-01-01', '2025-01-01', '2026-01-01'] },
            { id: 'before', type: 'before', operator: 'before:', placeholder: '2025-01-01', description: 'Show results published or indexed before YYYY-MM-DD.', suggestions: ['2024-12-31', '2025-12-31'] }
        ]
    }
];

const CUSTOM_BLOCKS_STORAGE_KEY = 'staticDorkBuilder_customBlocks';
const NEXT_CUSTOM_ID_STORAGE_KEY = 'staticDorkBuilder_nextCustomId';

let activeWorkspaceBlocks = [];
let customBlockTemplates = [];
let nextWorkspaceId = 1;
let nextCustomTemplateId = 1;

// History for Undo / Redo
let historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 20;

function pushHistory() {
    // Cut any redo states
    if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
    }
    historyStack.push(JSON.stringify(activeWorkspaceBlocks));
    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
    }
    historyIndex = historyStack.length - 1;
}

export function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        activeWorkspaceBlocks = JSON.parse(historyStack[historyIndex]);
        renderWorkspace();
        updateQueryOutput();
        showToast('Undo performed', 'info', 1800);
    }
}

export function redo() {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        activeWorkspaceBlocks = JSON.parse(historyStack[historyIndex]);
        renderWorkspace();
        updateQueryOutput();
        showToast('Redo performed', 'info', 1800);
    }
}

// Flat lookup for all predefined blocks
export function getPredefinedBlockById(id) {
    for (const cat of OPERATOR_PALETTE_CATEGORIES) {
        const found = cat.blocks.find(b => b.id === id);
        if (found) return found;
    }
    return null;
}

export function getCustomBlockTemplateById(id) {
    return customBlockTemplates.find(b => b.id === id);
}

function saveCustomBlockTemplatesToLocalStorage() {
    try {
        localStorage.setItem(CUSTOM_BLOCKS_STORAGE_KEY, JSON.stringify(customBlockTemplates));
        localStorage.setItem(NEXT_CUSTOM_ID_STORAGE_KEY, nextCustomTemplateId.toString());
    } catch (e) {
        console.error('Error saving custom blocks to LocalStorage:', e);
    }
}

function loadCustomBlockTemplatesFromLocalStorage() {
    try {
        const storedBlocks = localStorage.getItem(CUSTOM_BLOCKS_STORAGE_KEY);
        if (storedBlocks) {
            const parsedBlocks = JSON.parse(storedBlocks);
            if (Array.isArray(parsedBlocks)) {
                customBlockTemplates = parsedBlocks;
            }
        }

        const storedNextId = localStorage.getItem(NEXT_CUSTOM_ID_STORAGE_KEY);
        if (storedNextId) {
            const parsedId = parseInt(storedNextId, 10);
            if (!isNaN(parsedId) && parsedId > 0) {
                nextCustomTemplateId = parsedId;
            }
        }
    } catch (e) {
        console.error('Error loading custom blocks:', e);
        customBlockTemplates = [];
        nextCustomTemplateId = 1;
    }
}

function generateUniqueCustomId() {
    return `custom_tpl_${nextCustomTemplateId++}`;
}

function generateUniqueId() {
    return `ws_block_${nextWorkspaceId++}`;
}

function updateBlockValue(workspaceBlockId, newValue) {
    const block = activeWorkspaceBlocks.find(b => b.id === workspaceBlockId);
    if (block) {
        block.value = newValue;
        updateQueryOutput();
    }
}

export function removeBlockFromWorkspace(workspaceBlockId) {
    activeWorkspaceBlocks = activeWorkspaceBlocks.filter(b => b.id !== workspaceBlockId);
    pushHistory();
    renderWorkspace();
    updateQueryOutput();
}

export function duplicateWorkspaceBlock(workspaceBlockId) {
    const index = activeWorkspaceBlocks.findIndex(b => b.id === workspaceBlockId);
    if (index !== -1) {
        const original = activeWorkspaceBlocks[index];
        const clone = {
            ...original,
            id: generateUniqueId()
        };
        activeWorkspaceBlocks.splice(index + 1, 0, clone);
        pushHistory();
        renderWorkspace();
        updateQueryOutput();
        showToast(`Duplicated ${original.operator || 'block'}`, 'info', 1800);
    }
}

export function moveWorkspaceBlock(workspaceBlockId, direction) {
    const index = activeWorkspaceBlocks.findIndex(b => b.id === workspaceBlockId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activeWorkspaceBlocks.length) return;

    const item = activeWorkspaceBlocks.splice(index, 1)[0];
    activeWorkspaceBlocks.splice(newIndex, 0, item);
    pushHistory();
    renderWorkspace();
    updateQueryOutput();
}

export function clearWorkspace(confirmFirst = true) {
    if (activeWorkspaceBlocks.length === 0) return;

    if (confirmFirst && !confirm('Are you sure you want to clear all blocks from the workspace?')) {
        return;
    }

    activeWorkspaceBlocks = [];
    pushHistory();
    renderWorkspace();
    updateQueryOutput();
    showToast('Workspace cleared', 'info', 2000);
}

export function addBlockToWorkspace(originalBlockData, index = -1) {
    const newBlock = {
        id: generateUniqueId(),
        type: originalBlockData.type || 'custom',
        operator: originalBlockData.operator || '',
        placeholder: originalBlockData.placeholder || 'Enter value...',
        description: originalBlockData.description || '',
        value: originalBlockData.value || '',
        suggestions: originalBlockData.suggestions || []
    };

    if (index !== -1 && index >= 0 && index <= activeWorkspaceBlocks.length) {
        activeWorkspaceBlocks.splice(index, 0, newBlock);
    } else {
        activeWorkspaceBlocks.push(newBlock);
    }

    pushHistory();
    renderWorkspace();
    updateQueryOutput();
}

/**
 * Replace entire workspace with parsed query blocks
 */
export function loadQueryIntoWorkspace(rawQuery, replace = true) {
    const parsedBlocks = parseDorkQuery(rawQuery);
    if (parsedBlocks.length === 0) {
        showToast('No valid blocks could be parsed from query.', 'warning');
        return;
    }

    if (replace) {
        activeWorkspaceBlocks = [];
    }

    parsedBlocks.forEach(b => {
        const predefined = getPredefinedBlockById(b.type);
        activeWorkspaceBlocks.push({
            id: generateUniqueId(),
            type: b.type,
            operator: b.operator,
            placeholder: b.placeholder || (predefined ? predefined.placeholder : 'Value...'),
            description: b.description || (predefined ? predefined.description : ''),
            value: b.value,
            suggestions: predefined ? predefined.suggestions || [] : []
        });
    });

    pushHistory();
    renderWorkspace();
    updateQueryOutput();
    showToast(`Loaded ${parsedBlocks.length} block${parsedBlocks.length > 1 ? 's' : ''} into workspace`, 'success');
}

/**
 * Render the interactive workspace
 */
export function renderWorkspace() {
    const workspaceContainer = qs('#workspace-blocks');
    if (!workspaceContainer) return;

    workspaceContainer.innerHTML = '';

    if (activeWorkspaceBlocks.length === 0) {
        const emptyState = createElement('div', 'empty-workspace-state');
        emptyState.innerHTML = `
            <div class="empty-icon">🧩</div>
            <p class="empty-title">Your workspace is empty</p>
            <p class="empty-sub">Click any operator on the palette to add it, drag and drop, or choose a <strong>Security Preset</strong> above.</p>
        `;
        workspaceContainer.appendChild(emptyState);
        return;
    }

    activeWorkspaceBlocks.forEach((block, index) => {
        const blockEl = createElement('div', ['dork-block', `dork-block-${block.type}`]);
        blockEl.dataset.workspaceId = block.id;

        // Drag handle
        const dragHandle = createElement('div', 'drag-handle', '⠿');
        dragHandle.title = 'Drag to reorder';
        blockEl.appendChild(dragHandle);

        // Operator Badge
        const operatorSpan = createElement('span', 'block-operator', block.operator || 'term:');
        operatorSpan.title = block.description || block.operator;
        blockEl.appendChild(operatorSpan);

        // Input or atomic label
        if (block.operator === 'OR' || block.operator === '*' || block.operator === 'AND') {
            const atomicLabel = createElement('span', 'atomic-block-badge', block.operator);
            blockEl.appendChild(atomicLabel);
        } else {
            const inputContainer = createElement('div', 'block-input-wrapper');
            const inputEl = createElement('input', 'block-value-input');
            inputEl.type = 'text';
            inputEl.placeholder = block.placeholder || 'Enter value...';
            inputEl.value = block.value || '';
            inputEl.setAttribute('aria-label', `Value for ${block.operator}`);

            inputEl.addEventListener('input', (e) => {
                updateBlockValue(block.id, e.target.value);
            });

            inputContainer.appendChild(inputEl);

            // Suggestions dropdown / chips if provided
            if (Array.isArray(block.suggestions) && block.suggestions.length > 0) {
                const chipsContainer = createElement('div', 'suggestion-chips');
                block.suggestions.slice(0, 4).forEach(sug => {
                    const chip = createElement('button', 'suggestion-chip', sug);
                    chip.type = 'button';
                    chip.title = `Use ${sug}`;
                    chip.addEventListener('click', (e) => {
                        e.preventDefault();
                        inputEl.value = sug;
                        updateBlockValue(block.id, sug);
                    });
                    chipsContainer.appendChild(chip);
                });
                inputContainer.appendChild(chipsContainer);
            }

            blockEl.appendChild(inputContainer);
        }

        // Actions toolbar
        const toolbar = createElement('div', 'block-actions-toolbar');

        // Move Up
        if (index > 0) {
            const upBtn = createElement('button', 'block-action-btn', '↑');
            upBtn.title = 'Move up';
            upBtn.addEventListener('click', () => moveWorkspaceBlock(block.id, 'up'));
            toolbar.appendChild(upBtn);
        }

        // Move Down
        if (index < activeWorkspaceBlocks.length - 1) {
            const downBtn = createElement('button', 'block-action-btn', '↓');
            downBtn.title = 'Move down';
            downBtn.addEventListener('click', () => moveWorkspaceBlock(block.id, 'down'));
            toolbar.appendChild(downBtn);
        }

        // Duplicate
        const dupBtn = createElement('button', 'block-action-btn', '⎘');
        dupBtn.title = 'Duplicate block';
        dupBtn.addEventListener('click', () => duplicateWorkspaceBlock(block.id));
        toolbar.appendChild(dupBtn);

        // Remove
        const removeBtn = createElement('button', ['block-action-btn', 'btn-remove'], '✕');
        removeBtn.title = 'Remove block';
        removeBtn.addEventListener('click', () => removeBlockFromWorkspace(block.id));
        toolbar.appendChild(removeBtn);

        blockEl.appendChild(toolbar);
        workspaceContainer.appendChild(blockEl);
    });
}

/**
 * Render the palette blocks organized by categories
 */
export function renderPalette() {
    const paletteContainer = qs('#palette-blocks');
    if (!paletteContainer) return;

    paletteContainer.innerHTML = '';

    OPERATOR_PALETTE_CATEGORIES.forEach(cat => {
        const catSection = createElement('div', 'palette-category');

        const catTitle = createElement('div', 'palette-category-title');
        catTitle.innerHTML = `<span class="cat-icon">${cat.icon}</span> <span>${cat.name}</span>`;
        catSection.appendChild(catTitle);

        const blocksGrid = createElement('div', 'palette-blocks-grid');

        cat.blocks.forEach(blockData => {
            const blockEl = createPaletteBlockElement(blockData, false);
            blocksGrid.appendChild(blockEl);
        });

        catSection.appendChild(blocksGrid);
        paletteContainer.appendChild(catSection);
    });

    // Custom Blocks Section
    const customSection = createElement('div', 'palette-category');
    const customHeader = createElement('div', 'palette-category-title');
    customHeader.innerHTML = `
        <span class="cat-icon">🛠️</span>
        <span>Custom Blocks</span>
        <span class="custom-count-badge">${customBlockTemplates.length}</span>
    `;
    customSection.appendChild(customHeader);

    const customGrid = createElement('div', 'palette-blocks-grid');
    if (customBlockTemplates.length === 0) {
        const emptyCustom = createElement('p', 'custom-empty-hint', 'No custom blocks yet. Create one below.');
        customGrid.appendChild(emptyCustom);
    } else {
        customBlockTemplates.forEach(tpl => {
            const blockEl = createPaletteBlockElement(tpl, true);
            customGrid.appendChild(blockEl);
        });
    }

    customSection.appendChild(customGrid);
    paletteContainer.appendChild(customSection);
}

function createPaletteBlockElement(blockData, isCustom = false) {
    const displayType = isCustom ? 'custom' : (blockData.type || 'custom');
    const blockEl = createElement('div', ['palette-block-item', `dork-block-${displayType}`]);

    blockEl.dataset.blockId = blockData.id;
    blockEl.dataset.blockType = displayType;
    blockEl.dataset.operator = blockData.operator;
    blockEl.dataset.placeholder = blockData.placeholder || '';
    blockEl.dataset.description = blockData.description || '';

    // Header with operator badge and add button
    const opBadge = createElement('span', 'palette-op-badge', blockData.operator || 'term:');
    blockEl.appendChild(opBadge);

    if (blockData.description) {
        const descEl = createElement('span', 'palette-op-desc', blockData.description);
        blockEl.appendChild(descEl);
    }

    // Add button (+)
    const addBtn = createElement('button', 'palette-quick-add-btn', '+');
    addBtn.type = 'button';
    addBtn.title = `Add ${blockData.operator} to workspace`;
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addBlockToWorkspace(blockData);
        showToast(`Added ${blockData.operator} to workspace`, 'info', 1400);
    });
    blockEl.appendChild(addBtn);

    // If custom block, provide delete button
    if (isCustom) {
        const deleteBtn = createElement('button', 'palette-custom-delete-btn', '🗑');
        deleteBtn.type = 'button';
        deleteBtn.title = 'Delete custom block';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCustomBlockTemplate(blockData.id);
        });
        blockEl.appendChild(deleteBtn);
    }

    // Click whole item to add
    blockEl.addEventListener('click', () => {
        addBlockToWorkspace(blockData);
        showToast(`Added ${blockData.operator} to workspace`, 'info', 1400);
    });

    return blockEl;
}

export function addCustomBlockTemplate(details) {
    const newCustom = {
        id: generateUniqueCustomId(),
        type: 'custom',
        operator: details.operator.endsWith(':') ? details.operator : `${details.operator}:`,
        placeholder: details.placeholder || 'Enter value...',
        description: details.description || 'Custom search block'
    };
    customBlockTemplates.push(newCustom);
    saveCustomBlockTemplatesToLocalStorage();
    renderPalette();
    showToast(`Saved custom block: ${newCustom.operator}`, 'success');
}

export function deleteCustomBlockTemplate(templateId) {
    customBlockTemplates = customBlockTemplates.filter(t => t.id !== templateId);
    saveCustomBlockTemplatesToLocalStorage();
    renderPalette();
    showToast('Custom block deleted', 'info');
}

export function generateQueryString() {
    return serializeBlocksToQuery(activeWorkspaceBlocks);
}

export function updateQueryOutput() {
    const queryOutputTextarea = qs('#query-output');
    const wordCountBadge = qs('#query-word-count');
    const charCountBadge = qs('#query-char-count');

    const query = generateQueryString();

    if (queryOutputTextarea) {
        queryOutputTextarea.value = query;
    }

    if (query) {
        const words = query.trim().split(/\s+/).length;
        const chars = query.length;

        if (wordCountBadge) {
            wordCountBadge.textContent = `${words} words`;
            if (words > 32) {
                wordCountBadge.classList.add('badge-warning');
                wordCountBadge.title = 'Google typically limits queries to 32 words!';
            } else {
                wordCountBadge.classList.remove('badge-warning');
                wordCountBadge.title = '';
            }
        }

        if (charCountBadge) {
            charCountBadge.textContent = `${chars} chars`;
        }
    } else {
        if (wordCountBadge) wordCountBadge.textContent = '0 words';
        if (charCountBadge) charCountBadge.textContent = '0 chars';
    }
}

export function reorderWorkspaceBlock(oldIndex, newIndex) {
    if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0 || oldIndex >= activeWorkspaceBlocks.length || newIndex >= activeWorkspaceBlocks.length) {
        return;
    }
    const moved = activeWorkspaceBlocks.splice(oldIndex, 1)[0];
    if (moved) {
        activeWorkspaceBlocks.splice(newIndex, 0, moved);
        pushHistory();
        renderWorkspace();
        updateQueryOutput();
    }
}

export function getShareableUrl() {
    const query = generateQueryString();
    if (!query) return window.location.href.split('#')[0];

    const encoded = encodeURIComponent(query);
    return `${window.location.origin}${window.location.pathname}#q=${encoded}`;
}

export function exportQuery(format = 'txt') {
    const query = generateQueryString();
    if (!query) {
        showToast('Query is empty, nothing to export!', 'warning');
        return;
    }

    let content = '';
    let mimeType = 'text/plain';
    let filename = `dorkquery_${Date.now()}`;

    if (format === 'markdown') {
        mimeType = 'text/markdown';
        filename += '.md';
        content = `# DorkQuery Export\n\n**Generated Date:** ${new Date().toLocaleString()}\n\n## Search Dork Query\n\n\`\`\`\n${query}\n\`\`\`\n\n## Blocks Breakdown\n\n| Operator | Value |\n| :--- | :--- |\n`;
        activeWorkspaceBlocks.forEach(b => {
            content += `| \`${b.operator || 'term'}\` | \`${b.value || '(empty)'}\` |\n`;
        });
    } else if (format === 'json') {
        mimeType = 'application/json';
        filename += '.json';
        content = JSON.stringify({
            query,
            createdAt: new Date().toISOString(),
            blocks: activeWorkspaceBlocks
        }, null, 2);
    } else {
        filename += '.txt';
        content = query;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported query as ${format.toUpperCase()}`, 'success');
}

export function initBlockManager() {
    loadCustomBlockTemplatesFromLocalStorage();
    renderPalette();
    renderWorkspace();
    updateQueryOutput();
    pushHistory();
}
