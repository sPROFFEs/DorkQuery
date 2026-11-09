// js/dnd.js - Robust Drag & Drop with SortableJS
import { qs, qsa } from './domUtils.js';

let _blockManagerModule = null;

export function _setBlockManagerModule(blockManager) {
    _blockManagerModule = blockManager;
}

function getSortableClass() {
    if (typeof window !== 'undefined' && window.Sortable) return window.Sortable;
    if (typeof Sortable !== 'undefined') return Sortable;
    if (typeof globalThis !== 'undefined' && globalThis.Sortable) return globalThis.Sortable;
    return null;
}

export function initDragAndDrop() {
    const workspaceContainer = qs('#workspace-blocks');

    if (!workspaceContainer) {
        console.warn('Workspace container not found for DnD setup');
        return;
    }

    const SortableClass = getSortableClass();
    if (!SortableClass) {
        console.warn('SortableJS library not yet loaded, retrying in 300ms...');
        setTimeout(initDragAndDrop, 300);
        return;
    }

    // 1. Initialize SortableJS on all palette grids
    const paletteGrids = qsa('.palette-blocks-grid');
    paletteGrids.forEach(grid => {
        new SortableClass(grid, {
            group: {
                name: 'dorkblocks',
                pull: 'clone',
                put: false
            },
            sort: false,
            animation: 180,
            ghostClass: 'dork-block-ghost',
            chosenClass: 'dork-block-chosen',
            dragClass: 'dork-block-drag'
        });
    });

    // 2. Initialize SortableJS for the Workspace
    new SortableClass(workspaceContainer, {
        group: 'dorkblocks',
        animation: 180,
        handle: '.drag-handle', // Only drag handle initiates reordering
        ghostClass: 'dork-block-ghost',
        chosenClass: 'dork-block-chosen',
        dragClass: 'dork-block-drag',
        onAdd: function (evt) {
            const itemEl = evt.item;
            const blockId = itemEl.dataset.blockId;
            const blockType = itemEl.dataset.blockType;

            let originalBlockData = null;
            if (_blockManagerModule) {
                if (blockType === 'custom') {
                    originalBlockData = _blockManagerModule.getCustomBlockTemplateById(blockId);
                } else {
                    originalBlockData = _blockManagerModule.getPredefinedBlockById(blockId);
                }
            }

            if (originalBlockData) {
                _blockManagerModule.addBlockToWorkspace(originalBlockData, evt.newDraggableIndex);
            }
            itemEl.remove();
        },
        onUpdate: function (evt) {
            if (_blockManagerModule && typeof _blockManagerModule.reorderWorkspaceBlock === 'function') {
                _blockManagerModule.reorderWorkspaceBlock(evt.oldDraggableIndex, evt.newDraggableIndex);
            }
        }
    });

    // 3. Initialize Trash drop target
    const trashAreaContainer = qs('#trash-area');
    if (trashAreaContainer) {
        new SortableClass(trashAreaContainer, {
            group: 'dorkblocks',
            animation: 150,
            ghostClass: 'dork-block-ghost-trash',
            onAdd: function (evt) {
                const itemEl = evt.item;
                const workspaceBlockId = itemEl.dataset.workspaceId;

                if (workspaceBlockId && _blockManagerModule && typeof _blockManagerModule.removeBlockFromWorkspace === 'function') {
                    _blockManagerModule.removeBlockFromWorkspace(workspaceBlockId);
                }
                itemEl.remove();
            }
        });
    }
}
