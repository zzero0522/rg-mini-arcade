// 主題管理
(function() {
    const THEME_KEY = 'rg-arcade-theme';
    const themeToggle = document.getElementById('theme-toggle');

    // 載入儲存的主題
    function loadTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'ide') {
            document.body.classList.add('ide-mode');
        }
    }

    // 切換主題
    function toggleTheme() {
        document.body.classList.toggle('ide-mode');
        const isIDE = document.body.classList.contains('ide-mode');
        localStorage.setItem(THEME_KEY, isIDE ? 'ide' : 'normal');
    }

    // 初始化
    loadTheme();

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
})();
