/**
 * Alias for document.querySelector.
 * @param {string} selector - CSS selector.
 * @returns {Element|null}
 */
export function qs(selector) {
    return document.querySelector(selector);
}

/**
 * Alias for document.querySelectorAll.
 * @param {string} selector - CSS selector.
 * @returns {NodeListOf<Element>}
 */
export function qsa(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Creates an element with a given tag, class name, and text content.
 * @param {string} tagName - The HTML tag name.
 * @param {string|string[]} [className] - Optional class name or array of class names.
 * @param {string} [textContent] - Optional text content.
 * @returns {HTMLElement}
 */
export function createElement(tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (className) {
        if (Array.isArray(className)) {
            element.classList.add(...className);
        } else {
            element.classList.add(className);
        }
    }
    if (textContent) {
        element.textContent = textContent;
    }
    return element;
}
