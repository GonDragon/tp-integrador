document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');

    if (themeToggle) {
        const syncTheme = () => {
            const currentTheme = themeToggle.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-bs-theme', currentTheme);
        };
        syncTheme();
        themeToggle.addEventListener('change', syncTheme);
    }
});