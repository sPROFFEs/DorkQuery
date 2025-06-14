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

let activeWorkspaceBlocks = [];
let customBlockTemplates = []; // Initialize customBlockTemplates array
let nextWorkspaceId = 1;
let nextCustomTemplateId = 1; // For custom block template IDs

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

function addBlockToWorkspace(originalBlockData) {
    const newBlock = {
        ...originalBlockData,
        id: generateUniqueId(),
        value: ''
    };
    activeWorkspaceBlocks.push(newBlock);
    renderWorkspace();
    updateQueryOutput(); // Update query output after adding a block
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
        blockElement.setAttribute('role', 'button');
        blockElement.setAttribute('aria-label', `Add ${blockData.operator} block: ${blockData.description}`);

        const handlePaletteBlockActivation = () => {
            // addBlockToWorkspace expects the full block data structure to copy from.
            // blockData already holds this (either from predefinedBlocksData or customBlockTemplates)
            addBlockToWorkspace(blockData);
        };

        blockElement.addEventListener('click', handlePaletteBlockActivation);
        blockElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handlePaletteBlockActivation();
            }
        });
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
    renderPalette();
    renderWorkspace();
    updateQueryOutput();
}

export function addCustomBlockTemplate(blockDetails) {
    const newCustomBlock = {
        id: generateUniqueCustomId(),
        type: 'custom', // Specific type for custom blocks
        operator: blockDetails.operator,
        placeholder: blockDetails.placeholder || 'Enter value...', // Default placeholder
        description: blockDetails.description,
        // icon: 'edit-3' // Default icon for custom type, handled by styling/rendering if needed
    };
    customBlockTemplates.push(newCustomBlock);
    renderPalette(); // Re-render palette to include the new custom block
    // TODO: In a later step, save customBlockTemplates to LocalStorage
    // console.log('Custom block templates:', customBlockTemplates); // For debugging
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
