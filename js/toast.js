// js/toast.js - Modern, non-intrusive toast notification system

let toastContainer = null;

function ensureToastContainer() {
    if (!toastContainer || !document.body.contains(toastContainer)) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {'info'|'success'|'warning'|'error'} type - Notification type
 * @param {number} duration - Auto-dismiss duration in ms (0 for persistent)
 */
export function showToast(message, type = 'info', duration = 3200) {
    const container = ensureToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const iconEl = document.createElement('span');
    iconEl.className = 'toast-icon';
    iconEl.textContent = icons[type] || 'ℹ';

    const textEl = document.createElement('span');
    textEl.className = 'toast-text';
    textEl.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close-btn';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';

    toast.appendChild(iconEl);
    toast.appendChild(textEl);
    toast.appendChild(closeBtn);

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.classList.add('toast-dismissing');
        toast.addEventListener('animationend', () => {
            toast.remove();
        }, { once: true });
        // Fallback remove
        setTimeout(() => toast.remove(), 400);
    };

    closeBtn.addEventListener('click', dismiss);

    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(dismiss, duration);
    }

    return { dismiss };
}
