// 找不同顏色遊戲
(function () {
    const HIGH_SCORE_KEY_ZEN = 'rg-color-diff-highscore-zen';
    const HIGH_SCORE_KEY_TIMED = 'rg-color-diff-highscore-timed';

    // 遊戲模式
    const MODES = {
        ZEN: 'zen',         // 禪模式：計時往上，無限制
        TIMED: 'timed'      // 限時模式：60秒倒數
    };

    // 遊戲狀態
    let currentMode = null;
    let level = 1;
    let score = 0;
    let highScore = 0;
    let timeElapsed = 0;      // 禪模式用
    let timeLeft = 60;        // 限時模式用
    let timer = null;
    let isPlaying = false;

    // DOM 元素
    const gameBoard = document.getElementById('game-board');
    const levelDisplay = document.getElementById('level');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const timerDisplay = document.getElementById('timer');
    const timerLabel = document.getElementById('timer-label');
    const timerLabelIDE = document.getElementById('timer-label-ide');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const zenModeBtn = document.getElementById('zen-mode-btn');
    const timedModeBtn = document.getElementById('timed-mode-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const finalLevel = document.getElementById('final-level');
    const finalLevelIDE = document.getElementById('final-level-ide');
    const finalScore = document.getElementById('final-score');
    const finalScoreIDE = document.getElementById('final-score-ide');

    // 計算格子數量（根據關卡）
    function getGridSize() {
        if (level <= 5) return 2;      // 2x2 = 4格
        if (level <= 10) return 3;     // 3x3 = 9格
        if (level <= 20) return 4;     // 4x4 = 16格
        if (level <= 35) return 5;     // 5x5 = 25格
        return 6;                       // 6x6 = 36格
    }

    // 計算顏色差異（根據關卡，越高越難）
    function getColorDifference() {
        // 從 50 開始，每關減少一點，最低到 5
        return Math.max(5, 50 - level * 2);
    }

    // 生成隨機顏色
    function generateRandomColor() {
        const r = Math.floor(Math.random() * 200) + 30;
        const g = Math.floor(Math.random() * 200) + 30;
        const b = Math.floor(Math.random() * 200) + 30;
        return { r, g, b };
    }

    // 生成不同的顏色
    function generateDifferentColor(baseColor, diff) {
        // 隨機選擇變化方向
        const direction = Math.random() > 0.5 ? 1 : -1;
        return {
            r: Math.min(255, Math.max(0, baseColor.r + diff * direction)),
            g: Math.min(255, Math.max(0, baseColor.g + diff * direction)),
            b: Math.min(255, Math.max(0, baseColor.b + diff * direction))
        };
    }

    // 顏色轉 CSS
    function colorToCSS(color) {
        return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
    }

    // 生成遊戲板
    function generateBoard() {
        const gridSize = getGridSize();
        const totalBlocks = gridSize * gridSize;
        const diffIndex = Math.floor(Math.random() * totalBlocks);
        const baseColor = generateRandomColor();
        const diffColor = generateDifferentColor(baseColor, getColorDifference());

        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        for (let i = 0; i < totalBlocks; i++) {
            const block = document.createElement('div');
            block.className = 'color-block';

            if (i === diffIndex) {
                block.style.backgroundColor = colorToCSS(diffColor);
                block.dataset.correct = 'true';
            } else {
                block.style.backgroundColor = colorToCSS(baseColor);
            }

            block.addEventListener('click', handleBlockClick);
            gameBoard.appendChild(block);
        }
    }

    // 處理點擊
    function handleBlockClick(e) {
        if (!isPlaying) return;

        const block = e.target;

        if (block.dataset.correct === 'true') {
            // 答對了
            block.classList.add('correct');
            score += level * 10;
            level++;

            updateDisplay();
            setTimeout(() => {
                generateBoard();
            }, 200);
        } else {
            // 答錯了
            block.classList.add('wrong');

            if (currentMode === MODES.ZEN) {
                // 禪模式：答錯結束遊戲
                setTimeout(() => {
                    endGame();
                }, 300);
            } else {
                // 限時模式：扣 3 秒
                timeLeft = Math.max(0, timeLeft - 3);
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    endGame();
                }
            }
        }
    }

    // 更新顯示
    function updateDisplay() {
        levelDisplay.textContent = level;
        scoreDisplay.textContent = score;
    }

    // 更新計時器顯示
    function updateTimerDisplay() {
        if (currentMode === MODES.ZEN) {
            timerDisplay.textContent = formatTime(timeElapsed);
        } else {
            timerDisplay.textContent = timeLeft;
        }
    }

    // 格式化時間 (秒 -> mm:ss)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // 開始計時器
    function startTimer() {
        if (currentMode === MODES.ZEN) {
            // 禪模式：計時往上
            timer = setInterval(() => {
                timeElapsed++;
                updateTimerDisplay();
            }, 1000);
        } else {
            // 限時模式：倒數
            timer = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();

                if (timeLeft <= 0) {
                    endGame();
                }
            }, 1000);
        }
    }

    // 載入最高分
    function loadHighScore() {
        const key = currentMode === MODES.ZEN ? HIGH_SCORE_KEY_ZEN : HIGH_SCORE_KEY_TIMED;
        highScore = parseInt(localStorage.getItem(key)) || 0;
        highScoreDisplay.textContent = highScore;
    }

    // 儲存最高分
    function saveHighScore() {
        const key = currentMode === MODES.ZEN ? HIGH_SCORE_KEY_ZEN : HIGH_SCORE_KEY_TIMED;
        localStorage.setItem(key, highScore);
    }

    // 開始遊戲
    function startGame(mode) {
        currentMode = mode;
        level = 1;
        score = 0;
        timeElapsed = 0;
        timeLeft = 60;
        isPlaying = true;

        // 更新計時器標籤
        if (currentMode === MODES.ZEN) {
            timerLabel.textContent = '遊戲時間';
            timerLabelIDE.textContent = 'elapsed:';
        } else {
            timerLabel.textContent = '剩餘時間';
            timerLabelIDE.textContent = 'remaining:';
        }

        loadHighScore();
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        updateDisplay();
        updateTimerDisplay();
        generateBoard();
        startTimer();
    }

    // 結束遊戲
    function endGame() {
        isPlaying = false;
        clearInterval(timer);

        // 更新最高分（以分數為準）
        if (score > highScore) {
            highScore = score;
            saveHighScore();
            highScoreDisplay.textContent = highScore;
        }

        finalLevel.textContent = level;
        finalLevelIDE.textContent = level;
        finalScore.textContent = score;
        finalScoreIDE.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    // 返回模式選擇
    function backToMenu() {
        isPlaying = false;
        clearInterval(timer);
        gameOverScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    // 事件監聽
    zenModeBtn.addEventListener('click', () => startGame(MODES.ZEN));
    timedModeBtn.addEventListener('click', () => startGame(MODES.TIMED));
    restartBtn.addEventListener('click', () => startGame(currentMode));
    backToMenuBtn.addEventListener('click', backToMenu);
})();
