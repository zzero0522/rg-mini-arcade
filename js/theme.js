// 主題管理
(function () {
    const THEME_KEY = 'rg-arcade-theme';
    const COLOR_KEY = 'rg-arcade-color';
    const DARK_MODE_KEY = 'rg-arcade-dark-mode';

    const themeToggle = document.getElementById('theme-toggle');
    const darkModeToggle = document.getElementById('dark-mode-toggle'); // 之前漏掉了這個

    const colorThemes = [
        { id: 'dusty-blue', name: '霧霾藍', class: 'theme-dusty-blue' },
        { id: 'dusty-rose', name: '乾燥玫瑰', class: 'theme-dusty-rose' },
        { id: 'sage-green', name: '鼠尾草綠', class: 'theme-sage-green' },
        { id: 'lavender', name: '薰衣草紫', class: 'theme-lavender' },
        { id: 'warm-taupe', name: '暖灰褐', class: 'theme-warm-taupe' }
    ];

    // 創建主題選擇器
    function createThemePicker() {
        const headerControls = document.querySelector('.header-controls');
        const pickerBtn = document.getElementById('theme-picker-btn');

        const picker = document.createElement('div');
        picker.className = 'theme-picker';
        picker.innerHTML = `
            <div class="theme-options">
                ${colorThemes.map(theme => `
                    <button class="theme-option" data-theme="${theme.id}">
                        <span class="color-dot ${theme.id}"></span>
                        <span>${theme.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // 將 picker 放入 header-controls (而不是 body)
        if (headerControls) {
            headerControls.appendChild(picker);
        }

        // 切換面板 (綁定到現有的按鈕)
        if (pickerBtn) {
            pickerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                picker.classList.toggle('open');
            });
        }

        // 選擇主題色
        const options = picker.querySelectorAll('.theme-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const themeId = option.dataset.theme;
                setColorTheme(themeId);
                updateActiveOption(themeId);
                picker.classList.remove('open');
            });
        });

        // 點擊外部關閉
        document.addEventListener('click', (e) => {
            if (!picker.contains(e.target) && e.target !== pickerBtn) {
                picker.classList.remove('open');
            }
        });

        return picker;
    }

    // 設定主題色
    function setColorTheme(themeId) {
        // 移除所有主題色
        colorThemes.forEach(t => {
            document.documentElement.classList.remove(t.class);
        });

        // 加入新主題色
        const theme = colorThemes.find(t => t.id === themeId);
        if (theme) {
            document.documentElement.classList.add(theme.class);
            localStorage.setItem(COLOR_KEY, themeId);
        }
    }

    // 更新選中狀態
    function updateActiveOption(themeId) {
        const options = document.querySelectorAll('.theme-option');
        options.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === themeId);
        });
    }

    // 更新深色模式按鈕圖示
    function updateDarkModeIcon(isDark) {
        if (!darkModeToggle) return;
        const lightIcon = darkModeToggle.querySelector('.light-icon');
        const darkIcon = darkModeToggle.querySelector('.dark-icon');
        if (lightIcon && darkIcon) {
            lightIcon.style.display = isDark ? 'none' : 'inline';
            darkIcon.style.display = isDark ? 'inline' : 'none';
        }
    }

    // 載入儲存的主題
    function loadTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'ide') {
            document.documentElement.classList.add('ide-mode');
        }

        // 載入深色模式
        const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);
        if (savedDarkMode === 'true') {
            document.documentElement.classList.add('dark-mode');
            updateDarkModeIcon(true);
        } else {
            updateDarkModeIcon(false);
        }

        // 載入主題色
        const savedColor = localStorage.getItem(COLOR_KEY) || 'dusty-blue';
        setColorTheme(savedColor);
    }

    // 切換主題 (IDE/Normal)
    function toggleTheme() {
        document.documentElement.classList.toggle('ide-mode');
        const isIDE = document.documentElement.classList.contains('ide-mode');
        localStorage.setItem(THEME_KEY, isIDE ? 'ide' : 'normal');
    }

    // 切換深色模式
    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark-mode');
        const isDark = document.documentElement.classList.contains('dark-mode');
        localStorage.setItem(DARK_MODE_KEY, isDark);
        updateDarkModeIcon(isDark);
    }

    // 初始化
    loadTheme();
    createThemePicker();

    // 更新選中狀態
    const savedColor = localStorage.getItem(COLOR_KEY) || 'dusty-blue';
    setTimeout(() => updateActiveOption(savedColor), 0);

    // 綁定事件監聽器
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
})();
