(function () {
    const THEME_KEY = 'rg-arcade-theme';
    const DARK_MODE_KEY = 'rg-arcade-dark-mode';
    const COLOR_KEY = 'rg-arcade-color';

    const savedTheme = localStorage.getItem(THEME_KEY);
    const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);
    const savedColor = localStorage.getItem(COLOR_KEY) || 'dusty-blue';

    if (savedTheme === 'ide') {
        document.documentElement.classList.add('ide-mode');
    }

    if (savedDarkMode === 'true') {
        document.documentElement.classList.add('dark-mode');
    }

    if (savedColor) {
        document.documentElement.classList.add('theme-' + savedColor);
    }
})();
