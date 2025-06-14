// js/customBlock.js
import { qs } from './domUtils.js';
import { addCustomBlockTemplate } from './blockManager.js';

export function initCustomBlockEditor() {
    const form = qs('#custom-block-form');
    if (!form) {
        console.error('Custom block form #custom-block-form not found!');
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const operatorInput = qs('#custom-op');
        const placeholderInput = qs('#custom-val-placeholder');
        const descriptionInput = qs('#custom-desc');

        // Check if inputs are found (robustness)
        if (!operatorInput || !placeholderInput || !descriptionInput) {
            console.error('One or more custom block form input fields not found!');
            alert('Error in custom block form setup. Please check console.');
            return;
        }

        const operator = operatorInput.value.trim();
        const placeholder = placeholderInput.value.trim(); // Placeholder is optional for the block logic, but form might require it
        const description = descriptionInput.value.trim();

        if (!operator || !description) {
            alert('Operator and Description are required for custom blocks.');
            return;
        }

        // Basic validation for operator format (optional, but good)
        if (!operator.includes(':')) {
            // Consider if this should be a warning or prevent submission
            // For now, a simple alert. Could be enhanced with non-modal feedback.
            const confirmNoColon = confirm('Operator does not include a colon (e.g., "myop:"). This is a common convention. Proceed anyway?');
            if (!confirmNoColon) {
                operatorInput.focus();
                return;
            }
        }

        addCustomBlockTemplate({ operator, placeholder, description });

        form.reset(); // Clear the form fields
        operatorInput.focus(); // Focus on the first field for easier multiple additions

        // Optionally, add a success message/toast here
        // console.log('Custom block template added:', { operator, placeholder, description });
    });
}
