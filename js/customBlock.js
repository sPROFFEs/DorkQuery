// js/customBlock.js - Custom Search Block Creator
import { qs } from './domUtils.js';
import { addCustomBlockTemplate } from './blockManager.js';
import { showToast } from './toast.js';

export function initCustomBlockEditor() {
    const form = qs('#custom-block-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const operatorInput = qs('#custom-op');
        const placeholderInput = qs('#custom-val-placeholder');
        const descriptionInput = qs('#custom-desc');

        if (!operatorInput || !descriptionInput) return;

        let operator = operatorInput.value.trim();
        const placeholder = placeholderInput ? placeholderInput.value.trim() : '';
        const description = descriptionInput.value.trim();

        if (!operator || !description) {
            showToast('Operator and Description are required', 'warning');
            return;
        }

        // Auto-append colon if standard operator naming
        if (!operator.includes(':') && !operator.startsWith('"') && !operator.startsWith('(')) {
            operator = `${operator}:`;
        }

        addCustomBlockTemplate({ operator, placeholder, description });

        form.reset();
        operatorInput.focus();
    });
}
