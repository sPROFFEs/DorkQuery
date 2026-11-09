// js/main.js - Application Bootstrap & Orchestration

import * as blockManager from './blockManager.js';
import { initCustomBlockEditor } from './customBlock.js';
import { initGhdbExplorer } from './ghdbExplorerUI.js';
import { initDragAndDrop, _setBlockManagerModule } from './dnd.js';
import { PRESETS_DATA, PRESET_CATEGORIES, formatPresetQuery } from './presets.js';
import { showToast } from './toast.js';
import { qs, qsa } from './domUtils.js';

/**
 * Build the search URL for a given engine and query
 */
function buildSearchUrl(engine, query) {
    const encoded = encodeURIComponent(query.trim());
    switch (engine) {
        case 'duckduckgo':
            return `https://duckduckgo.com/?q=${encoded}`;
        case 'bing':
            return `https://www.bing.com/search?q=${encoded}`;
        case 'yahoo':
            return `https://search.yahoo.com/search?p=${encoded}`;
        case 'yandex':
            return `https://yandex.com/search/?text=${encoded}`;
        case 'github':
            return `https://github.com/search?type=code&q=${encoded}`;
        case 'shodan':
            return `https://www.shodan.io/search?query=${encoded}`;
        case 'urlscan':
            return `https://urlscan.io/search/#${encoded}`;
        case 'google':
        default:
            return `https://www.google.com/search?q=${encoded}`;
    }
}

/**
 * Execute search in specified engine
 */
function executeSearch(engine) {
    const query = blockManager.generateQueryString();
    if (!query) {
        showToast('Query is empty! Add blocks or select a preset first.', 'warning');
        return;
    }

    const url = buildSearchUrl(engine, query);
    window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Setup Theme Toggle (Dark / Light / Hacker)
 */
function initThemeToggle() {
    const themeSelect = qs('#theme-toggle-select');
    const savedTheme = localStorage.getItem('dorkquery_theme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeSelect) {
        themeSelect.value = savedTheme;
        themeSelect.addEventListener('change', (e) => {
            const chosen = e.target.value;
            document.documentElement.setAttribute('data-theme', chosen);
            localStorage.setItem('dorkquery_theme', chosen);
            showToast(`Theme changed to ${chosen.toUpperCase()}`, 'info', 1500);
        });
    }
}

/**
 * Initialize Presets Modal
 */
function initPresetsModal() {
    const modal = qs('#presets-modal');
    const openBtn = qs('#btn-open-presets');
    const closeBtn = qs('#close-presets-modal');
    const targetInput = qs('#preset-target-input');
    const categoryTabsContainer = qs('#preset-category-tabs');
    const presetsListContainer = qs('#presets-cards-list');

    if (!modal) return;

    let currentCategory = 'all';

    function renderPresetCards() {
        if (!presetsListContainer) return;
        presetsListContainer.innerHTML = '';

        const target = targetInput ? targetInput.value.trim() : '';

        const filtered = currentCategory === 'all'
            ? PRESETS_DATA
            : PRESETS_DATA.filter(p => p.category === currentCategory);

        filtered.forEach(preset => {
            const formattedQuery = formatPresetQuery(preset.query, target);
            const card = document.createElement('div');
            card.className = 'preset-card';

            const severityClass = `sev-${(preset.severity || 'medium').toLowerCase()}`;

            card.innerHTML = `
                <div class="preset-card-header">
                    <h4>${preset.title}</h4>
                    <span class="preset-severity ${severityClass}">${preset.severity}</span>
                </div>
                <p class="preset-desc">${preset.description}</p>
                <div class="preset-code-wrapper">
                    <code>${formattedQuery}</code>
                </div>
                <div class="preset-actions">
                    <button class="btn-preset-load" title="Load into workspace builder">➕ Load to Workspace</button>
                    <button class="btn-preset-search" title="Run search immediately">🚀 Search</button>
                </div>
            `;

            card.querySelector('.btn-preset-load').addEventListener('click', () => {
                blockManager.loadQueryIntoWorkspace(formattedQuery, true);
                modal.classList.add('hidden');
                showToast(`Loaded "${preset.title}" into workspace!`, 'success');
            });

            card.querySelector('.btn-preset-search').addEventListener('click', () => {
                const engine = qs('#search-engine-select')?.value || 'google';
                const url = buildSearchUrl(engine, formattedQuery);
                window.open(url, '_blank', 'noopener,noreferrer');
            });

            presetsListContainer.appendChild(card);
        });
    }

    // Render category tabs
    if (categoryTabsContainer) {
        categoryTabsContainer.innerHTML = '';
        PRESET_CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `preset-tab-btn ${cat.id === 'all' ? 'active' : ''}`;
            btn.innerHTML = `${cat.icon} ${cat.label}`;
            btn.addEventListener('click', () => {
                currentCategory = cat.id;
                categoryTabsContainer.querySelectorAll('.preset-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderPresetCards();
            });
            categoryTabsContainer.appendChild(btn);
        });
    }

    if (targetInput) {
        targetInput.addEventListener('input', () => {
            renderPresetCards();
        });
    }

    const openModal = () => {
        modal.classList.remove('hidden');
        renderPresetCards();
        if (targetInput) targetInput.focus();
    };

    const closeModal = () => modal.classList.add('hidden');

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    return { openModal, closeModal };
}

/**
 * Initialize Import Query Modal
 */
function initImportQueryModal() {
    const modal = qs('#import-modal');
    const openBtn = qs('#btn-open-import');
    const closeBtn = qs('#close-import-modal');
    const textarea = qs('#import-query-textarea');
    const submitBtn = qs('#btn-submit-import');

    if (!modal) return;

    const openModal = () => {
        modal.classList.remove('hidden');
        if (textarea) {
            textarea.value = '';
            textarea.focus();
        }
    };

    const closeModal = () => modal.classList.add('hidden');

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (submitBtn && textarea) {
        submitBtn.addEventListener('click', () => {
            const raw = textarea.value.trim();
            if (!raw) {
                showToast('Please paste a search dork string', 'warning');
                return;
            }
            blockManager.loadQueryIntoWorkspace(raw, true);
            closeModal();
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

/**
 * Initialize Help / Cheat Sheet Modal
 */
function initHelpModal() {
    const modal = qs('#help-modal');
    const openBtn = qs('#help-button');
    const closeBtn = qs('#close-help-modal');

    if (!modal) return;

    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => modal.classList.add('hidden');

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

/**
 * Initialize Keyboard Shortcuts
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + Enter: Execute Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const engine = qs('#search-engine-select')?.value || 'google';
            executeSearch(engine);
            return;
        }

        // Ctrl + K: Focus explorer search
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            const searchInput = qs('#ghdb-search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
            return;
        }

        // Ctrl + Shift + C: Copy query
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            const query = blockManager.generateQueryString();
            if (query) {
                navigator.clipboard.writeText(query);
                showToast('Query copied to clipboard!', 'success');
            }
            return;
        }

        // Esc: Close any open modal
        if (e.key === 'Escape') {
            qsa('.overlay-modal').forEach(m => m.classList.add('hidden'));
        }
    });
}

/**
 * Check URL Hash on load for shared queries
 */
function checkUrlHashForQuery() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#q=')) {
        try {
            const raw = decodeURIComponent(hash.substring(3));
            if (raw) {
                blockManager.loadQueryIntoWorkspace(raw, true);
                showToast('Loaded shared query from URL!', 'success', 4000);
            }
        } catch (e) {
            console.warn('Failed to parse URL query hash:', e);
        }
    }
}

/**
 * Main application bootstrap
 */
async function main() {
    console.log('⚡ DorkQuery Modernizing and Initializing...');

    // 1. Initialize Theme
    initThemeToggle();

    // 2. Resolve circular dependency pattern for DnD
    _setBlockManagerModule(blockManager);

    // 3. Initialize workspace and block palette immediately (0ms blocking time!)
    blockManager.initBlockManager();
    initCustomBlockEditor();
    initDragAndDrop();

    // 4. Hook Explorer import callback to decompose dork into workspace blocks
    const handleImportDork = (entry) => {
        const query = entry.query || entry.dork || '';
        blockManager.loadQueryIntoWorkspace(query, false);
    };

    // 5. Initialize Explorer asynchronously
    initGhdbExplorer(handleImportDork);

    // 6. Setup Query Controls & Search Engines
    const searchEngineSelect = qs('#search-engine-select');
    const executeSearchButton = qs('#execute-search-button');
    const copyQueryBtn = qs('#btn-copy-query');
    const clearWorkspaceBtn = qs('#btn-clear-workspace');
    const shareQueryBtn = qs('#btn-share-query');
    const exportSelect = qs('#export-query-select');
    const undoBtn = qs('#btn-undo-workspace');
    const redoBtn = qs('#btn-redo-workspace');

    if (executeSearchButton) {
        executeSearchButton.addEventListener('click', () => {
            const engine = searchEngineSelect ? searchEngineSelect.value : 'google';
            executeSearch(engine);
        });
    }

    // Quick search engine pills
    qsa('.engine-quick-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const engine = pill.dataset.engine;
            if (engine) {
                if (searchEngineSelect) searchEngineSelect.value = engine;
                executeSearch(engine);
            }
        });
    });

    // Copy Query button
    if (copyQueryBtn) {
        copyQueryBtn.addEventListener('click', async () => {
            const query = blockManager.generateQueryString();
            if (!query) {
                showToast('Query is empty, add blocks first!', 'warning');
                return;
            }
            try {
                await navigator.clipboard.writeText(query);
                copyQueryBtn.innerHTML = `
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Copied!</span>
                `;
                copyQueryBtn.classList.add('copied');
                showToast('Query copied to clipboard!', 'success', 2000);
                setTimeout(() => {
                    copyQueryBtn.innerHTML = `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>Copy Query</span>
                    `;
                    copyQueryBtn.classList.remove('copied');
                }, 2200);
            } catch (err) {
                showToast('Failed to copy to clipboard', 'error');
            }
        });
    }

    // Clear Workspace button
    if (clearWorkspaceBtn) {
        clearWorkspaceBtn.addEventListener('click', () => {
            blockManager.clearWorkspace(true);
        });
    }

    // Share Query button
    if (shareQueryBtn) {
        shareQueryBtn.addEventListener('click', async () => {
            const shareUrl = blockManager.getShareableUrl();
            try {
                await navigator.clipboard.writeText(shareUrl);
                window.location.hash = `#q=${encodeURIComponent(blockManager.generateQueryString())}`;
                showToast('Shareable link copied to clipboard!', 'success', 3000);
            } catch (e) {
                showToast('Could not copy link', 'error');
            }
        });
    }

    // Export query
    if (exportSelect) {
        exportSelect.addEventListener('change', (e) => {
            const format = e.target.value;
            if (format) {
                blockManager.exportQuery(format);
                exportSelect.value = '';
            }
        });
    }

    // Undo / Redo
    if (undoBtn) undoBtn.addEventListener('click', () => blockManager.undo());
    if (redoBtn) redoBtn.addEventListener('click', () => blockManager.redo());

    // 7. Modals
    initPresetsModal();
    initImportQueryModal();
    initHelpModal();
    initKeyboardShortcuts();

    // 8. Check URL hash
    checkUrlHashForQuery();
}

document.addEventListener('DOMContentLoaded', main);
