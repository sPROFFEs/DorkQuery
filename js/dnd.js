// js/dnd.js
import { qs } from './domUtils.js';
// getPredefinedBlockById and getCustomBlockTemplateById will be imported from blockManager.js
// addBlockToWorkspace will also be imported from blockManager.js
// For now, to avoid circular dependency issues if blockManager also imports from dnd (though not planned for this step),
// we'll assume these functions are available or will be passed/handled appropriately.
// A better approach might be for blockManager to expose an API that dnd.js calls.
// For this step, we'll write the dnd logic and then adjust blockManager.js to provide these.

// Temporary stubs until blockManager is updated and functions are imported
// This is just to make the structure of dnd.js clear.
// In the actual application, these would be direct imports.
let _blockManagerModule = null;

export function _setBlockManagerModule(blockManager) {
    console.log('[dnd.js] _setBlockManagerModule called with:', blockManager);
    _blockManagerModule = blockManager;
}


export function initDragAndDrop() {
    const paletteContainer = qs('#palette-blocks');
    const workspaceContainer = qs('#workspace-blocks');

    if (!paletteContainer || !workspaceContainer) {
        console.error('Palette or Workspace container not found for DnD setup!');
        return;
    }

    if (typeof Sortable === 'undefined') {
        console.error('SortableJS is not loaded. Make sure it is included in your HTML.');
        return;
    }

    // Initialize SortableJS for the Palette
    new Sortable(paletteContainer, {
        group: {
            name: 'dorkblocks',
            pull: 'clone', // Clone items when dragging from palette
            put: false    // Don't allow items to be dropped into the palette
        },
        sort: false, // Disable sorting within the palette itself
        animation: 150,
        ghostClass: 'dork-block-ghost', // Class for the drop placeholder
        chosenClass: 'dork-block-chosen', // Class for the chosen item
        dragClass: 'dork-block-drag', // Class for the dragging item
        // onStart: () => { console.log('Palette drag start'); }, // For debugging
    });

    // Initialize SortableJS for the Workspace
    new Sortable(workspaceContainer, {
        group: 'dorkblocks', // Same group name to allow receiving items
        animation: 150,
        ghostClass: 'dork-block-ghost',
        chosenClass: 'dork-block-chosen',
        dragClass: 'dork-block-drag',
        onAdd: function (evt) {
            console.log('[dnd.js onAdd] _blockManagerModule is:', _blockManagerModule);
            const itemEl = evt.item; // The dragged DOM element (clone from palette)
            const blockId = itemEl.dataset.blockId;
            const blockType = itemEl.dataset.blockType; // 'predefined' or 'custom'
            const originalIndex = evt.oldDraggableIndex; // Index from the source (palette)
            console.log('[dnd.js onAdd] Event:', evt);
            console.log('[dnd.js onAdd] itemEl:', itemEl, 'blockId:', blockId, 'blockType:', blockType);
            console.log('[dnd.js onAdd] Attempting to get originalBlockData...');

            let originalBlockData = null;
            if (_blockManagerModule) { // Check if module is set
                if (blockType === 'custom') { // Custom blocks have 'custom' as their blockType
                    console.log('[dnd.js onAdd] Calling getCustomBlockTemplateById with:', blockId);
                    originalBlockData = _blockManagerModule.getCustomBlockTemplateById(blockId);
                } else { // Predefined blocks have their specific type (e.g., 'site', 'filetype') as blockType
                    console.log('[dnd.js onAdd] Calling getPredefinedBlockById with ID (expecting specific type like \'site\'):', blockId);
                    originalBlockData = _blockManagerModule.getPredefinedBlockById(blockId);
                }
            }
            console.log('[dnd.js onAdd] originalBlockData:', originalBlockData);


            if (originalBlockData) {
                console.log('[dnd.js onAdd] Calling addBlockToWorkspace with:', originalBlockData, evt.newDraggableIndex);
                // Add to our data model at the correct index
                // evt.newDraggableIndex refers to the index in the workspaceContainer
                _blockManagerModule.addBlockToWorkspace(originalBlockData, evt.newDraggableIndex); 
                
                // SortableJS has already placed a clone (itemEl) in the workspace DOM.
                // Our addBlockToWorkspace calls renderWorkspace, which rebuilds all blocks in the workspace
                // from the activeWorkspaceBlocks array. This means the clone added by SortableJS
                // will be removed by renderWorkspace's initial clear, and then the "real" block
                // (with a new unique workspace ID, input field, remove button etc.) will be rendered.
                // So, we don't strictly need to itemEl.remove() here if renderWorkspace clears fully.
                // However, if itemEl had specific event listeners from palette or was deeply nested,
                // explicitly removing it might be cleaner to avoid potential ghost listeners or DOM confusion.
                // For now, let renderWorkspace handle the DOM based on the data model.
                // If issues arise, itemEl.remove() can be reconsidered.
            } else {
                console.error('[dnd.js onAdd] originalBlockData is null. Block not added to workspace data.');
                console.error('Could not find original block data for:', blockId, 'Type:', blockType);
                itemEl.remove(); 
            }
        },
        onUpdate: function (evt) {
            // console.log('Item reordered in workspace:', evt.oldDraggableIndex, 'to', evt.newDraggableIndex);
            if (typeof _blockManagerModule.reorderWorkspaceBlock === 'function') {
                _blockManagerModule.reorderWorkspaceBlock(evt.oldDraggableIndex, evt.newDraggableIndex);
            } else {
                console.error('reorderWorkspaceBlock function not found in blockManager module via dnd helper.');
            }
            // SortableJS has already updated the DOM visually.
            // reorderWorkspaceBlock will update the data array and then call renderWorkspace()
            // to re-render from the data, ensuring consistency.
        },
    });

    const trashAreaContainer = qs('#trash-area');
    if (trashAreaContainer) {
        new Sortable(trashAreaContainer, {
            group: 'dorkblocks', // Must be in the same group to receive items from workspace
            animation: 150,
            ghostClass: 'dork-block-ghost-trash', // Use the specific ghost class for trash
            onAdd: function (evt) {
                const itemEl = evt.item; // The DOM element dragged from workspace
                const workspaceBlockId = itemEl.dataset.workspaceId; // Get ID from data attribute

                // console.log('Item dropped in trash:', workspaceBlockId);

                if (workspaceBlockId && _blockManagerModule && typeof _blockManagerModule.removeBlockFromWorkspace === 'function') {
                    _blockManagerModule.removeBlockFromWorkspace(workspaceBlockId);
                } else {
                    console.error('Could not remove block: workspaceId missing or removeBlockFromWorkspace not found.');
                }
                // Always remove the item from the trash DOM element itself, 
                // as it's just a drop target and shouldn't retain elements.
                itemEl.remove(); 
            }
        });
    } else {
        console.warn('Trash area container #trash-area not found for DnD setup.');
    }
}
