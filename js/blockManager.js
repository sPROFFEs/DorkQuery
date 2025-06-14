import { qs, createElement } from './domUtils.js';

const predefinedBlocksData = [
    { id: 'site', type: 'site', operator: 'site:', placeholder: 'example.com', description: 'Search within a specific website.' },
    { id: 'filetype', type: 'filetype', operator: 'filetype:', placeholder: 'pdf', description: 'Search for specific file types.' },
    { id: 'inurl', type: 'inurl', operator: 'inurl:', placeholder: 'admin', description: 'Search for terms in the URL.' },
    { id: 'intitle', type: 'intitle', operator: 'intitle:', placeholder: 'login page', description: 'Search for terms in the page title.' },
    { id: 'intext', type: 'intext', operator: 'intext:', placeholder: 'username', description: 'Search for terms in the page content.' },
    { id: 'related', type: 'related', operator: 'related:', placeholder: 'example.com', description: 'Find sites related to a domain.' },
    { id: 'cache', type: 'cache', operator: 'cache:', placeholder: 'example.com', description: 'Show Google\'s cached version of a page.' }
];

const CUSTOM_BLOCKS_STORAGE_KEY = 'staticDorkBuilder_customBlocks';
const NEXT_CUSTOM_ID_STORAGE_KEY = 'staticDorkBuilder_nextCustomId';

let activeWorkspaceBlocks = [];
let customBlockTemplates = []; 
let nextWorkspaceId = 1;
let nextCustomTemplateId = 1; 

// Exported getter functions
export function getPredefinedBlockById(id) {
    return predefinedBlocksData.find(b => b.id === id);
}
export function getCustomBlockTemplateById(id) {
    return customBlockTemplates.find(b => b.id === id);
}

function saveCustomBlockTemplatesToLocalStorage() {
    try {
        localStorage.setItem(CUSTOM_BLOCKS_STORAGE_KEY, JSON.stringify(customBlockTemplates));
        localStorage.setItem(NEXT_CUSTOM_ID_STORAGE_KEY, nextCustomTemplateId.toString());
    } catch (e) {
        console.error("Error saving custom blocks to LocalStorage:", e);
    }
}

function loadCustomBlockTemplatesFromLocalStorage() {
    try {
        const storedBlocks = localStorage.getItem(CUSTOM_BLOCKS_STORAGE_KEY);
        if (storedBlocks) {
            const parsedBlocks = JSON.parse(storedBlocks);
            if (Array.isArray(parsedBlocks)) {
                // TODO: Add more robust validation for each block's structure
                customBlockTemplates = parsedBlocks;
            } else {
                console.warn("Invalid custom blocks data found in LocalStorage, expected an array.");
                customBlockTemplates = [];
            }
        }

        const storedNextId = localStorage.getItem(NEXT_CUSTOM_ID_STORAGE_KEY);
        if (storedNextId) {
            const parsedId = parseInt(storedNextId, 10);
            if (!isNaN(parsedId) && parsedId > 0) {
                nextCustomTemplateId = parsedId;
            } else {
                 console.warn("Invalid nextCustomTemplateId found in LocalStorage.");
                 // Recalculate if needed, or default.
                 recalculateNextCustomIdIfNeeded();
            }
        } else if (customBlockTemplates.length > 0) { 
             recalculateNextCustomIdIfNeeded();
        }

    } catch (e) {
        console.error("Error loading custom blocks from LocalStorage:", e);
        customBlockTemplates = []; 
        nextCustomTemplateId = 1; 
    }
}

function recalculateNextCustomIdIfNeeded() {
    if (customBlockTemplates.length > 0) {
        const maxId = customBlockTemplates.reduce((max, block) => {
            // Extracts number from "custom_tpl_NUMBER"
            const idNum = parseInt((block.id || "").split('_').pop() || "0", 10); 
            return idNum > max ? idNum : max;
        }, 0);
        nextCustomTemplateId = maxId + 1;
    } else {
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
    const blockIndex = activeWorkspaceBlocks.findIndex(b => b.id === workspaceBlockId);
    if (blockIndex !== -1) {
        activeWorkspaceBlocks[blockIndex].value = newValue;
        updateQueryOutput(); // Update query output whenever a block's value changes
    }
}

function removeBlockFromWorkspace(workspaceBlockId) {
    activeWorkspaceBlocks = activeWorkspaceBlocks.filter(b => b.id !== workspaceBlockId);
    renderWorkspace(); 
    updateQueryOutput(); // Update query output after removing a block
}

// Modified to accept an optional index for inserting the block
export function addBlockToWorkspace(originalBlockData, index = -1) { 
    const newBlock = {
        id: generateUniqueId(), // This is the unique ID for the workspace instance
        type: originalBlockData.type, // Keep the original type for styling etc.
        operator: originalBlockData.operator,
        placeholder: originalBlockData.placeholder,
        description: originalBlockData.description,
        value: originalBlockData.value || '' // Preserve incoming value (e.g., from GHDB) or default to empty
    };

    if (index !== -1 && index >= 0 && index <= activeWorkspaceBlocks.length) { // Ensure index is valid
        activeWorkspaceBlocks.splice(index, 0, newBlock);
    } else {
        activeWorkspaceBlocks.push(newBlock);
    }
    renderWorkspace();
    updateQueryOutput();
}

function renderWorkspace() {
    const workspaceContainer = qs('#workspace-blocks');
    const emptyMessage = qs('.empty-workspace-message'); // Assumes this element exists outside the container if innerHTML is cleared
    
    if (!workspaceContainer) { // emptyMessage can be null if not found, handle that
        console.error('Workspace container #workspace-blocks not found!');
        return;
    }

    // Clear only block elements, keep the empty message if it's a child
    // Or, ensure emptyMessage is outside workspaceContainer if workspaceContainer.innerHTML is used.
    // For this implementation, let's assume emptyMessage is a direct child and we manage its display.
    
    // Remove all children except the empty message
    while (workspaceContainer.firstChild && workspaceContainer.firstChild !== emptyMessage) {
        workspaceContainer.removeChild(workspaceContainer.firstChild);
    }
    // If emptyMessage was removed, re-append it (or ensure it's always there and toggle display)
    if (emptyMessage && !workspaceContainer.contains(emptyMessage)) {
        // This logic is a bit complex; simpler to have emptyMessage outside or handle clearing carefully.
        // For now, let's just clear all and re-add empty message if needed.
    }
    workspaceContainer.innerHTML = ''; // Simplest: clear all first

    if (activeWorkspaceBlocks.length === 0) {
        if (emptyMessage) {
            emptyMessage.style.display = 'block'; // Show message
            workspaceContainer.appendChild(emptyMessage); // Re-add if cleared by innerHTML
        } else {
             // If empty message element itself is gone, create it (less ideal)
            const newEmptyMessage = createElement('p', 'empty-workspace-message', 'Workspace is empty. Add blocks from the palette.');
            workspaceContainer.appendChild(newEmptyMessage);
        }
    } else {
        if (emptyMessage) {
            emptyMessage.style.display = 'none'; // Hide message
        }
        activeWorkspaceBlocks.forEach(block => {
            const blockElement = createElement('div', ['dork-block', `dork-block-${block.type}`]);
            blockElement.dataset.workspaceId = block.id;

            const operatorSpan = createElement('span', 'block-operator', block.operator);
            blockElement.appendChild(operatorSpan);

            const inputElement = createElement('input');
            inputElement.type = 'text';
            inputElement.placeholder = block.placeholder;
            inputElement.value = block.value; // Reflects current value from the model
            inputElement.setAttribute('aria-label', `Value for ${block.operator}`);
            inputElement.addEventListener('input', (event) => {
                updateBlockValue(block.id, event.target.value);
            });
            blockElement.appendChild(inputElement);

            const removeButton = createElement('button', 'remove-block-btn', 'X');
            removeButton.title = `Remove ${block.operator} block`;
            removeButton.dataset.id = block.id; 
            removeButton.addEventListener('click', () => {
                removeBlockFromWorkspace(block.id);
            });
            blockElement.appendChild(removeButton);
            
            workspaceContainer.appendChild(blockElement);
        });
    }
}


/**
 * Renders the predefined and custom dork blocks into the palette.
 */
function renderPalette() {
    const paletteContainer = qs('#palette-blocks');
    if (!paletteContainer) {
        console.error('Palette container #palette-blocks not found!');
        return;
    }

    // Helper function to create a palette block element
    function createPaletteBlockElement(blockData, isCustom = false) {
        // For custom blocks, type is 'custom'. For predefined, it's blockData.type.
        const displayType = isCustom ? 'custom' : blockData.type;
        // Ensure custom blocks get the .dork-block-custom style correctly
        const typeClass = `dork-block-${displayType}`; 
        const blockElement = createElement('div', ['dork-block', typeClass]);
        
        const operatorText = createElement('span', 'block-operator', blockData.operator);
        blockElement.appendChild(operatorText);
        
        // Hidden description span
        // const descriptionSpan = createElement('span', 'block-description', blockData.description);
        // descriptionSpan.style.display = 'none';
        // blockElement.appendChild(descriptionSpan);

        blockElement.dataset.blockId = blockData.id; // This ID is template ID (predefined or custom_tpl_X)
        blockElement.dataset.blockType = displayType; 
        blockElement.dataset.operator = blockData.operator;
        blockElement.dataset.placeholder = blockData.placeholder;
        blockElement.dataset.description = blockData.description;
        
        blockElement.title = blockData.description; 

        blockElement.tabIndex = 0; 
        blockElement.setAttribute('role', 'button'); // Still useful for accessibility if one wants to tab to it
        blockElement.setAttribute('aria-label', `Draggable block: ${blockData.operator} - ${blockData.description}`);

        // Event listeners for click/keydown to add to workspace are REMOVED.
        // Drag and drop will be the primary interaction, handled by SortableJS.
        
        return blockElement;
    }

    paletteContainer.innerHTML = ''; // Clear existing blocks

    // Render predefined blocks
    predefinedBlocksData.forEach(blockData => {
        const blockElement = createPaletteBlockElement(blockData, false);
        paletteContainer.appendChild(blockElement);
    });

    // Render custom blocks
    customBlockTemplates.forEach(blockData => {
        const blockElement = createPaletteBlockElement(blockData, true);
        paletteContainer.appendChild(blockElement);
    });
}

/**
 * Initializes the block manager (e.g., loads predefined blocks).
 */
export function initBlockManager() {
    console.log("Block Manager Initialized");
    loadCustomBlockTemplatesFromLocalStorage(); // Load first
    renderPalette(); // Then render palette (which now includes custom blocks)
    renderWorkspace();
    updateQueryOutput();
}

export function addCustomBlockTemplate(blockDetails) {
    const newCustomBlock = {
        id: generateUniqueCustomId(),
        type: 'custom', 
        operator: blockDetails.operator,
        placeholder: blockDetails.placeholder || 'Enter value...', 
        description: blockDetails.description,
        // icon: 'edit-3' // Default icon for custom type, can be set here or handled by rendering logic
    };
    customBlockTemplates.push(newCustomBlock);
    saveCustomBlockTemplatesToLocalStorage(); // Save after adding
    renderPalette(); 
    // console.log('Custom block templates:', customBlockTemplates); // For debugging
}

export function reorderWorkspaceBlock(oldIndex, newIndex) {
    if (oldIndex === newIndex || 
        oldIndex < 0 || oldIndex >= activeWorkspaceBlocks.length ||
        newIndex < 0 || newIndex >= activeWorkspaceBlocks.length) {
        // console.warn('Attempted to reorder with invalid indices or no actual move.');
        if (oldIndex === newIndex && oldIndex >= 0 && oldIndex < activeWorkspaceBlocks.length) {
             // This can happen if item is dragged but dropped in same spot.
             // No data change needed, but SortableJS might have altered DOM.
             // Re-render to ensure our data model is source of truth.
             // However, if no actual DOM change occurred, this is redundant.
             // For now, let's assume SortableJS handles DOM correctly if index is same.
             return; 
        }
        if(oldIndex !== newIndex) { // Log if indices are different but still problematic
             console.error('Invalid indices for reorder:', oldIndex, newIndex, 'Current length:', activeWorkspaceBlocks.length);
        }
        return; // Return if truly invalid or no-op for data
    }

    const itemToMove = activeWorkspaceBlocks.splice(oldIndex, 1)[0];
    if (itemToMove) {
        activeWorkspaceBlocks.splice(newIndex, 0, itemToMove);
        renderWorkspace(); // Re-render from the updated data model for consistency
        updateQueryOutput(); // Query order will change
    } else {
        console.error('Failed to reorder: item not found at oldIndex', oldIndex);
        // Re-render to try and fix any visual inconsistencies if SortableJS moved something
        // but our data model couldn't find the item.
        renderWorkspace(); 
    }
}

export function generateQueryString() {
    return activeWorkspaceBlocks
        .filter(block => block.value && block.value.trim() !== '') // Only include blocks with a value
        .map(block => {
            // If block.operator is empty (e.g. for a raw custom string from GHDB), just use the value
            return block.operator ? `${block.operator}${block.value.trim()}` : block.value.trim();
        })
        .join(' ');
}

export function updateQueryOutput() {
    const queryOutputTextarea = qs('#query-output');
    if (queryOutputTextarea) {
        queryOutputTextarea.value = generateQueryString();
    }
}

// Export activeWorkspaceBlocks is not chosen for encapsulation.
// Getter function is also not strictly necessary if updateQueryOutput is the main interface for this.
